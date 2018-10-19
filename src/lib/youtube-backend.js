'use strict'

const fs = require('fs')
const path = require('path')
const { dialog, ipcMain } = require('electron')
const youtubeDL = require('youtube-dl')
const ffmpeg = require('ffmpeg-static')
const sanitize = require('sanitize-filename')
const downloadsDir = require('./downloads-dir')

const ffmpegPath = ffmpeg.path.replace('app.asar', 'app.asar.unpacked')

const formats = [
  {
    name: `Audio`,
    extensions: ['aac', 'flac', 'mp3', 'm4a', 'opus', 'vorbis', 'wav'],
    getArgs: extension => [
      '--extract-audio',
      `--audio-format=${extension}`,
      `--ffmpeg-location=${ffmpegPath}`,
      '--embed-thumbnail'
    ]
  },
  {
    name: `Video`,
    extensions: ['mp4', 'flv', 'ogg', 'webm', 'mkv', 'avi'],
    getArgs: extension => [
      `--recode-video=${extension}`,
      `--ffmpeg-location=${ffmpegPath}`
    ]
  }
]

const filters = formats.map(format => ({
  name: format.name,
  extensions: format.extensions
}))

const message = `You may download as an audio file or video file.
Supported formats/extensions:

${formats
    .map(format => `- ${format.name}: ${format.extensions.join(', ')}`)
    .join('\n')}`

const formatsByExtension = formats.reduce((map, format) => {
  return format.extensions.reduce((innerMap, extension) => {
    innerMap[extension] = {
      ...format,
      args: format.getArgs(extension)
    }
    return innerMap
  }, map)
}, {})

function initYouTubeBackend (window) {
  ipcMain.on('download', (event, options) => {
    event.sender.send('download::verifying')
    youtubeDL.getInfo(options.url, (err, info) => {
      if (err) return event.sender.send('download::verifying::error', err)
      event.sender.send('download::verifying::success')

      event.sender.send('download::destination')
      const dialogOptions = {
        title: 'Where to save',
        defaultPath: path.join(downloadsDir, `${sanitize(info.title)}.m4a`),
        filters,
        message
      }
      dialog.showSaveDialog(window, dialogOptions, filepath => {
        if (!filepath) {
          return event.sender.send('download::destination::cancelled')
        }
        const extension = path.extname(filepath).replace(/^\./, '')
        const format = formatsByExtension[extension]
        if (!format) {
          return event.sender.send(
            'download::destination::failure',
            new Error('Unsupported download format')
          )
        }
        event.sender.send('download::destination::success', filepath)

        event.sender.send('download::stream')
        const video = youtubeDL(options.url, format.args)
        let downloaded = 0
        let total
        video.on('info', info => {
          total = info.size
        })
        video.on('data', chunk => {
          downloaded += chunk.length
          event.sender.send('download::stream::progress', {
            progress: downloaded,
            total
          })
        })
        video.pipe(fs.createWriteStream(filepath))
        video.on('end', () => {
          event.sender.send('download::stream::success')
        })
        video.on('error', err => {
          event.sender.send('download::stream::error', err)
        })
      })
    })
  })
}

module.exports = initYouTubeBackend

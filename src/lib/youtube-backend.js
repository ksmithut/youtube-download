'use strict'

const path = require('path')
const { promisify } = require('util')
const { ipcMain } = require('electron')
const youtubeDL = require('youtube-dl')
const ffmpeg = require('ffmpeg-static')
const ffprobe = require('ffprobe-static')
const sanitize = require('sanitize-filename')
const downloadsDir = require('./downloads-dir')
const { formatsByExtension } = require('./formats')

const youtube = {
  getInfo: promisify(youtubeDL.getInfo.bind(youtubeDL)),
  exec: promisify(youtubeDL.exec.bind(youtubeDL))
}

const ffmpegPath = ffmpeg.path.replace('app.asar', 'app.asar.unpacked')
const ffprobePath = ffprobe.path.replace('app.asar', 'app.asar.unpacked')

// TODO python is a dependency, need to include it into the package somehow
const BINARY_PATHS = [ffmpegPath, ffprobePath].map(path.dirname).concat(process.env.PATH).join(':')

function initYouTubeBackend(window) {
  ipcMain.on('download', (event, options) => {
    event.sender.send('download::verifying')
    youtube.getInfo(options.url)
      .then(info => {
        const outputBase = path.join(downloadsDir, sanitize(info.title))
        const outputTemplate = `${outputBase}.%(ext)s`
        const format = formatsByExtension[options.format]
        if (!format) throw new Error('Unsupported file format')
        const args = format.args.concat([`--output=${outputTemplate}`, '--no-progress', '--no-continue', '--restrict-filenames'])
        event.sender.send('download::downloading')
        return youtube.exec(options.url, args, { env: { PATH: BINARY_PATHS } })
      })
      .then((stdout) => {
        event.sender.send('download::success')
      })
      .catch(err => {
        event.sender.send('download::error', err)
      })
  })
}

module.exports = initYouTubeBackend

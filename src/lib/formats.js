'use strict'

exports.formats = [
  {
    name: 'Audio',
    extensions: ['aac', 'flac', 'mp3', 'm4a', 'opus', 'vorbis', 'wav'],
    getArgs: extension => ['--extract-audio', `--audio-format=${extension}`]
  },
  {
    name: 'Video',
    extensions: ['mp4', 'flv', 'ogg', 'webm', 'mkv', 'avi'],
    getArgs: extension => [`--recode-video=${extension}`]
  }
]

exports.formatsByExtension = exports.formats.reduce((map, format) => {
  return format.extensions.reduce((innerMap, extension) => {
    innerMap[extension] = {
      ...format,
      args: format.getArgs(extension)
    }
    return innerMap
  }, map)
}, {})

'use strict'

const os = require('os')
const { execSync } = require('child_process')
const { statSync } = require('fs')

function darwin () {
  return `${process.env.HOME}/Downloads`
}

function windows () {
  return `${process.env.USERPROFILE}/Downloads`
}

function unix () {
  try {
    const dir = execSync('xdg-user-dir DOWNLOAD', { stdio: [0, 3, 3] })
    if (dir) return dir
  } catch (_) {}

  try {
    const homeDownloads = `${process.env.HOME}/Downloads`
    const stat = statSync(homeDownloads)
    if (stat) return homeDownloads
  } catch (_) {}

  return '/tmp/'
}

const osMapping = {
  darwin: darwin,
  freebsd: unix,
  linux: unix,
  sunos: unix,
  win32: windows
}

const osPlatform = os.platform()

module.exports = osMapping[osPlatform]()

'use strict'

// eslint-disable-next-line
window.eval = global.eval = () => {
  throw new Error(`Sorry, this app does not support window.eval().`)
}

const { ipcRenderer } = require('electron')
const { formats } = require('./lib/formats')

// Get the option groups setup for the extension selector
const formatGroups = formats.map(format => {
  const group = document.createElement('optgroup')
  group.label = format.name
  const options = format.extensions.map(extension => {
    const option = document.createElement('option')
    option.value = extension
    option.innerText = `.${extension}`
    return option
  })
  group.append(...options)
  return group
})

const downloadForm = document.getElementById('download-form')
const inputURL = document.getElementById('url-input')
const downloadFormat = document.getElementById('download-format')
const overlay = document.getElementById('message-overlay')
const overlayMessage = document.getElementById('overlay-message')

downloadFormat.append(...formatGroups)

Object.assign(inputURL, {
  onfocus() {
    this.select()
  }
})

Object.assign(downloadForm, {
  onsubmit(event) {
    event.preventDefault()
    ipcRenderer.send('download', {
      url: inputURL.value,
      format: downloadFormat.value
    })
  }
})

const originalOverlayClassName = overlay.className
function showOverlay(message, type = 'info') {
  overlay.style.opacity = 1
  overlay.style.pointerEvents = 'initial'
  overlay.className = [originalOverlayClassName, type].join(' ')
  overlayMessage.style.opacity = 1
  overlayMessage.innerText = message
}

function hideOverlay() {
  overlay.style.opacity = 0
  overlay.style.pointerEvents = 'none'
  overlay.className = originalOverlayClassName
  overlayMessage.style.opacity = 0
  overlayMessage.innterText = ''
}

let downloadingInterval

ipcRenderer
  .on('download::verifying', event => {
    showOverlay('Verifying YouTube URL...')
  })
  .on('download::downloading', event => {
    showOverlay('Downloading...')
    let count = 0
    downloadingInterval = setInterval(() => {
      count++
      const dots = '.'.repeat((count % 10) + 1)
      showOverlay(`Downloading\n${dots}\n(Videos may take a few minutes longer)`)
    }, 300)
  })
  .on('download::success', event => {
    showOverlay('Finished downloading!\n\nFile should be in your Downloads folder', 'success')
    clearInterval(downloadingInterval)
    setTimeout(() => {
      hideOverlay()
    }, 2000)
  })
  .on('download::error', (event, error) => {
    console.log({ error })
    showOverlay('Error downloading file', 'error')
    clearInterval(downloadingInterval)
    setTimeout(() => {
      hideOverlay()
    }, 2000)
  })

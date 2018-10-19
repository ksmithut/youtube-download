'use strict'

const { ipcRenderer } = require('electron')

// eslint-disable-next-line
window.eval = global.eval = () => {
  throw new Error(`Sorry, this app does not support window.eval().`)
}

const downloadForm = document.getElementById('download-form')
const inputURL = document.getElementById('url-input')
const overlay = document.getElementById('message-overlay')
const overlayMessage = document.getElementById('overlay-message')
const progress = document.getElementById('progress')

Object.assign(inputURL, {
  type: 'url',
  required: true,
  oninvalid () {
    this.setCustomValidity('Please enter a YouTube URL')
  }
})

Object.assign(downloadForm, {
  onsubmit (event) {
    event.preventDefault()
    ipcRenderer.send('download', {
      url: inputURL.value
    })
  }
})

const originalOverlayClassName = overlay.className
function showOverlay (message, type = 'info') {
  overlay.style.opacity = 1
  overlay.style.pointerEvents = 'initial'
  overlay.className = [originalOverlayClassName, type].join(' ')
  overlayMessage.style.opacity = 1
  overlayMessage.innerText = message
}

function hideOverlay () {
  overlay.style.opacity = 0
  overlay.style.pointerEvents = 'none'
  overlay.className = originalOverlayClassName
  overlayMessage.style.opacity = 0
  overlayMessage.innterText = ''
}

function startProgress () {
  progress.style.opacity = 1
  progress.style.width = '0px'
  progress.innerHTML = `&nbsp;&nbsp;0%`
}

function setProgress (soFar, total) {
  const ratio = (soFar / total) * 100
  progress.style.width = `${ratio}%`
  progress.innerHTML = `&nbsp;&nbsp;${ratio.toFixed(0)}%`
}

function stopProgress () {
  progress.style.opacity = 0
  progress.style.width = '0px'
  progress.innerText = ''
}

ipcRenderer
  .on('download::verifying', event => {
    showOverlay('Verifying YouTube URL...')
  })
  .on('download::verifying::error', (event, error) => {
    console.log({ error })
    showOverlay('Error verifying YouTube URL', 'error')
    setTimeout(() => {
      hideOverlay()
    }, 1000)
  })
  .on('download::verifying::success', event => {
    // console.log('download::verifying::success')
  })
  .on('download::destination', event => {
    showOverlay('Waiting on user input...')
  })
  .on('download::destination::cancelled', event => {
    hideOverlay()
  })
  .on('download::destination::failure', (event, error) => {
    console.log({ error })
    showOverlay('Error choosing file', 'error')
    setTimeout(() => {
      hideOverlay()
    }, 1000)
  })
  .on('download::destination::success', (event, filepath) => {
    // console.log('download::destination::success')
  })
  .on('download::stream', event => {
    showOverlay('Downloading...')
    startProgress()
  })
  .on('download::stream::progress', (event, { progress, total }) => {
    setProgress(progress, total)
  })
  .on('download::stream::success', event => {
    showOverlay('Finished downloading!', 'success')
    inputURL.value = ''
    setTimeout(() => {
      hideOverlay()
      stopProgress()
    }, 1000)
  })
  .on('download::stream::error', (event, error) => {
    console.log({ error })
    showOverlay('Error downloading file', 'error')
    stopProgress()
    setTimeout(() => {
      hideOverlay()
    }, 1000)
  })

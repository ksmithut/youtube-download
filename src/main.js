'use strict'

const path = require('path')
const { app, BrowserWindow, Menu } = require('electron')
const initYouTubeBackend = require('./lib/youtube-backend')

const INDEX_HTML_PATH = path.join(__dirname, 'index.html')

function createMenuTemplate(mainWindow) {
  return [
    {
      label: 'YouTube Download',
      submenu: [
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click() {
            app.quit()
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' }
      ]
    }
  ]
}

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    minWidth: 700,
    width: 900,

    minHeight: 200,
    height: 400,

    titleBarStyle: 'hiddenInset',
    fullscreenable: false,
    maximizable: false,
    movable: true
  })
  mainWindow.loadFile(INDEX_HTML_PATH)
  // mainWindow.webContents.openDevTools({ mode: 'detach' })
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  Menu.setApplicationMenu(
    Menu.buildFromTemplate(createMenuTemplate(mainWindow))
  )

  initYouTubeBackend(mainWindow)
}

app.on('ready', createWindow)
app.on('window-all-closed', () => app.quit())
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    event.preventDefault()
  })
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault()
  })
})

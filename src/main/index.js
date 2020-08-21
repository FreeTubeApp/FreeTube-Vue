import { app, BrowserWindow, Menu } from 'electron'
import { productName } from '../../package.json'

require('electron-context-menu')({
  showSearchWithGoogle: false,
  showSaveImageAs: true,
  showCopyImageAddress: true,
  prepend: (params, browserWindow) => []
})

// set app name
app.setName(productName)

// disable electron warning
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

// const gotTheLock = app.requestSingleInstanceLock()
const path = require('path')
const isDev = process.env.NODE_ENV === 'development'
const isDebug = process.argv.includes('--debug')
let mainWindow

// CORS somehow gets re-enabled in Electron v9.0.4
// This line disables it.
// This line can possible be removed if the issue is fixed upstream
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors')

// TODO: Uncomment if needed
// only allow single instance of application
// if (!isDev) {
//   if (gotTheLock) {
//     app.on('second-instance', () => {
//       // Someone tried to run a second instance, we should focus our window.
//       if (mainWindow && mainWindow.isMinimized()) {
//         mainWindow.restore()
//       }
//       mainWindow.focus()
//     })
//   } else {
//     app.quit()
//     process.exit(0)
//   }
// } else {
//   require('electron-debug')({
//     showDevTools: !(process.env.RENDERER_REMOTE_DEBUGGING === 'true')
//   })
// }

async function installDevTools () {
  try {
    /* eslint-disable */
    require('devtron').install()
    require('vue-devtools').install()
    /* eslint-enable */
  } catch (err) {
    console.log(err)
  }
}

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    backgroundColor: '#fff',
    width: 960,
    height: 540,
    icon: isDev ?
      path.join(__dirname, '../../_icons/iconColor.png') : 
      `${__dirname}/_icons/iconColor.png`,
    autoHideMenuBar: true,
    // useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: false,
      webSecurity: false,
      backgroundThrottling: false
    },
    show: false
  })

  // eslint-disable-next-line
  setMenu()

  // load root file/url
  if (isDev) {
    mainWindow.loadURL('http://localhost:9080')
  } else {
    mainWindow.loadFile(`${__dirname}/index.html`)

    global.__static = path
      .join(__dirname, '/static')
      .replace(/\\/g, '\\\\')
  }

  // Show when loaded
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  mainWindow.on('closed', () => {
    console.log('closed')
  })
}

app.on('ready', () => {
  createWindow()

  if (isDev) {
    installDevTools()
  }

  if (isDebug) {
    mainWindow.webContents.openDevTools()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }

  mainWindow.webContents.session.clearCache()
  mainWindow.webContents.session.clearStorageData({
    storages: [
      'appcache',
      'cookies',
      'filesystem',
      'indexdb',
      'shadercache',
      'websql',
      'serviceworkers',
      'cachestorage'
    ]
  })
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

/* eslint-disable-next-line */
const sendMenuEvent = async data => {
  mainWindow.webContents.send('change-view', data)
}

const template = [{
  label: 'File',
  submenu: [
    {
      role: 'quit'
    }
  ]
},
{
  label: 'Edit',
  submenu: [{
    role: 'cut'
  },
  {
    role: 'copy',
    accelerator: 'CmdOrCtrl+C',
    selector: 'copy:'
  },
  {
    role: 'paste',
    accelerator: 'CmdOrCtrl+V',
    selector: 'paste:'
  },
  {
    role: 'pasteandmatchstyle'
  },
  {
    role: 'delete'
  },
  {
    role: 'selectall'
  }
  ]
},
{
  label: 'View',
  submenu: [{
    role: 'reload'
  },
  {
    role: 'forcereload',
    accelerator: 'CmdOrCtrl+Shift+R'
  },
  {
    role: 'toggledevtools'
  },
  {
    type: 'separator'
  },
  {
    role: 'resetzoom'
  },
  {
    role: 'zoomin'
  },
  {
    role: 'zoomout'
  },
  {
    type: 'separator'
  },
  {
    role: 'togglefullscreen'
  }
  ]
},
{
  role: 'window',
  submenu: [{
    role: 'minimize'
  },
  {
    role: 'close'
  }
  ]
}
]

function setMenu () {
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    })

    template.push({
      role: 'window'
    })

    template.push({
      role: 'help'
    })

    template.push({ role: 'services' })
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

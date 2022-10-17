import { app, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
const events = require('events')
const os = require('os')

const winConfig = {
  show: false,
  frame: false,
  resizable: true,
  focusable: true,
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false
  }
}

class Home extends events {
  constructor (confInfo) {
    super()
    // 传进来的配置参数
    this.confInfo = confInfo
    this.conf = Object.assign({}, winConfig, confInfo)
    this.windowInstance = new BrowserWindow(this.conf)
    // 判断是否打开的是dev环境
    if (process.env.WEBPACK_DEV_SERVER_URL) {
      // this.windowInstance.webContents.openDevTools();
      this.windowInstance.loadURL(
        `${process.env.WEBPACK_DEV_SERVER_URL}/#/home`
      )
    } else {
      createProtocol('app')
      // this.windowInstance.loadURL('app://./index.html/#/home')
      this.windowInstance.loadURL(`file://${__dirname}/index.html/#/home`)
    }

    this.init()
  }

  init () {
    this.windowInstance.once('ready-to-show', () => {
      this.windowInstance.show()
    })

    this.windowInstance.on('show', () => {
      this.emit('show')
    })

    this.listenIpc()
  }

  listenIpc () {
    const { width, height } = this.confInfo
    ipcMain.on('move-home', (event, pos) => {
      if (os.platform() !== 'darwin') {
        this.windowInstance && this.windowInstance.setBounds({ width, height })
      }
      this.windowInstance && this.windowInstance.setPosition(pos.baseX, pos.baseY)
    })

    // 关闭主窗口
    ipcMain.on('homeWin:close', () => {
      app.quit()
      // this.windowInstance.close()
    })
    // 最大化
    ipcMain.on('homeWin:maximize', () => {
      this.windowInstance.maximize()
    })
    // 最大化恢复
    // 需要判断是windows还是macos
    ipcMain.on('homeWin:restore', () => {
      // this.windowInstance.restore();
      this.windowInstance.unmaximize()
    })
    // 最小化
    ipcMain.on('homeWin:minimize', () => {
      this.windowInstance.minimize()
    })
  }

  getWebcontents () {
    return this.windowInstance.webContents
  }
}

export default Home

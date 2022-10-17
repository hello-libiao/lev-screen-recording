import { BrowserWindow, ipcMain, screen } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
const events = require('events')
const os = require('os')

const winConfig = {
  focusable: false,
  resizable: false,
  frame: false,
  transparent: true,
  alwaysOnTop: true,
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false
  }
}

class Suspend extends events {
  constructor (confInfo) {
    super()
    // 传进来的配置参数
    this.confInfo = confInfo
    this.conf = Object.assign({}, winConfig, confInfo)
    this.windowInstance = new BrowserWindow(this.conf)
    // 判断是否打开的是dev环境
    console.log(process.env.WEBPACK_DEV_SERVER_URL)
    if (process.env.WEBPACK_DEV_SERVER_URL) {
    //   this.windowInstance.webContents.openDevTools()
      this.windowInstance.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}/#/suspend`)
    } else {
      createProtocol('app')
      this.windowInstance.loadURL('app://./index.html/#/suspend')
    }
    const workArea = screen.getPrimaryDisplay().workArea
    this.windowInstance.setPosition(workArea.width - 265, workArea.height - 265)
    this.windowInstance.setSkipTaskbar(true)

    this.suspnedIpc()
  }

  suspnedIpc () {
    ipcMain.on('move-suspend', (event, pos) => {
      if (os.platform() !== 'darwin') {
        this.windowInstance && this.windowInstance.setBounds({ width: 80, height: 80 })
      }
      this.windowInstance && this.windowInstance.setPosition(pos.baseX, pos.baseY)
    })
  }

  getWebcontents () {
    return this.windowInstance.webContents
  }
}

export default Suspend

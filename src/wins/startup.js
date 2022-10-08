import { BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
const events = require('events')

// 定义创建窗口的配置参数
const winConfig = {
  show: false,
  frame: false,
  focusable: true,
  resizable: false,
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false
  }
}

class StartUp extends events {
  constructor (confInfo) {
    super()
    // 传进来的配置参数
    this.confInfo = confInfo
    this.conf = Object.assign({}, winConfig, confInfo)
    this.windowInstance = new BrowserWindow(this.conf)
    // 判断是否打开的是dev环境
    console.log(process.env.WEBPACK_DEV_SERVER_URL)
    if (process.env.WEBPACK_DEV_SERVER_URL) {
      this.windowInstance.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}/#/startupPage`)
    } else {
      createProtocol('app')
      this.windowInstance.loadURL('app://./index.html/#/startupPage')
    }
    this.init()
  }

  // 监听加载完成
  init () {
    this.windowInstance.once('ready-to-show', () => {
      this.windowInstance.show()
    })

    this.windowInstance.on('show', () => {
      this.emit('show')
    })
  }

  // 关闭
  close () {
    if (this.windowInstance && this.windowInstance.isVisible) {
      this.windowInstance.close()
      this.windowInstance = null
    }
  }
}

export default StartUp

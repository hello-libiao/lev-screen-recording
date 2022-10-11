'use strict'
import { app, ipcMain, screen, desktopCapturer, shell } from 'electron'
import StartUp from './wins/startup'
import Home from './wins/home'
import {
  BASE_WIN_WIDTH,
  BASE_WIN_HEIGHT,
  DESIGEN_STARTUP_WIDTH,
  DESIGEN_STARTUP_HEIGHT,
  DESIGEN_HOME_WIDTH,
  DESIGEN_HOME_HEIGHT,
  VIDEO_PATH
} from './utils/constant'
import { httpServer } from './utils/serve'
const path = require('path')
const os = require('os')
// 判断是否为macos环境，修改存储路径
const VIDEO_MACORWIN_PATH = os.platform() === 'darwin' ? os.homedir() + '/Documents/lev' : VIDEO_PATH

const getSize = () => {
  // scaleFactor 缩放系数
  const { size, scaleFactor } = screen.getPrimaryDisplay()
  return {
    width: size.width * scaleFactor,
    height: size.height * scaleFactor
  }
}

app.on('ready', async () => {
  const rect = screen.getPrimaryDisplay().bounds
  // 启动页宽高
  const startupW = (rect.width / BASE_WIN_WIDTH) * DESIGEN_STARTUP_WIDTH
  const startupH = (rect.height / BASE_WIN_HEIGHT) * DESIGEN_STARTUP_HEIGHT
  // 主页面宽高
  // const homeW = (rect.width / BASE_WIN_WIDTH) * DESIGEN_HOME_WIDTH
  const homeH = (rect.height / BASE_WIN_HEIGHT) * DESIGEN_HOME_HEIGHT
  const startupPage = new StartUp({
    width: 300,
    height: 200
  })
  startupPage.on('show', () => {
    console.log('启动页启动了')
    httpServer()
    setTimeout(() => {
      const home = new Home({
        width: 1200,
        height: homeH
      })
      home.on('show', () => {
        startupPage.close()
      })
    }, 3000)
  })
})

ipcMain.on('directory-open', (event, data) => {
  const file = path.join(VIDEO_MACORWIN_PATH, data)
  shell.showItemInFolder(file)
})

// 监听渲染进程事件
ipcMain.on('recive-desktop', async (event) => {
  const sizeInfo = getSize()
  const source = await desktopCapturer.getSources({
    types: ['window', 'screen'],
    thumbnailSize: sizeInfo // 屏幕系数的宽高
  })
  // 响应给渲染进程
  event.reply('relay-source', source[0])
})

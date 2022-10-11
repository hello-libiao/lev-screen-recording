import { VIDEO_PATH } from './constant'
const path = require('path')
const http = require('http')
const url = require('url')
const fs = require('fs')
const os = require('os')
// 判断是否为macos环境，修改存储路径
const VIDEO_MACORWIN_PATH = os.platform() === 'darwin' ? os.homedir() + '/Documents/lev' : VIDEO_PATH

// 启动本地服务
export const httpServer = () => {
  const server = http.createServer((req, res) => {
    const pathName = req.url
    const realPath = path.join(VIDEO_MACORWIN_PATH, pathName)
    fs.readFile(realPath, (err, data) => {
      if (err) {
        res.writeHead(404, {
          'Content-Tyoe': 'text/plain;charset=utf-8'
        })
        res.write('404')
        res.end()
      } else {
        res.writeHead(200, {
          'Content-Tyoe': Buffer.byteLength(data)
        })
        res.write(data)
        res.end('ok')
      }
    })
    // res.end(pathName)
  })
  // 监听端口
  server.listen(8080, () => {
    console.log('服务启动了')
  })
}

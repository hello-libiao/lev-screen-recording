import { VIDEO_PATH } from './constant'
const path = window.require('path')
const fs = window.require('fs')
const os = window.require('os')
// 判断是否为macos环境，修改存储路径
const VIDEO_MACORWIN_PATH = os.platform() === 'darwin' ? os.homedir() + '/Documents/lev' : VIDEO_PATH

// 判断有没有该文件夹，没有则创建
const mkdirDirectory = (pathUrl) => {
  console.log(pathUrl)
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(pathUrl)) {
      // 没有则创建文件夹
      const res = fs.mkdirSync(pathUrl, { recursive: true })
      if (res) {
        resolve(true)
      }
    } else {
      resolve(true)
    }
  })
}

// 保存文件
export const saveVideo = (blob) => {
  return new Promise((resolve, reject) => {
    const times = new Date().getTime()
    // 判断有没有文件夹
    mkdirDirectory(VIDEO_MACORWIN_PATH).then(() => {
      console.log('创建了')
      // 拼接文件名
      const videoPath = path.join(VIDEO_MACORWIN_PATH, `${times}.mp4`)
      // 暂存系统中的文件
      const reader = new FileReader()
      reader.readAsArrayBuffer(blob)
      // 监听文件
      reader.onload = () => {
        const buffer = Buffer.from(reader.result)
        // 写入文件
        fs.writeFile(videoPath, buffer, {}, (err, res) => {
          if (err) return err
        })
      }

      reader.onerror = (err) => {
        reject(err)
      }
      // 监听文件完成
      reader.onloadend = () => {
        resolve()
      }
    })
  })
}

// 获取文件下文件，返回数组
export const directoryFiles = () => {
  if (!fs.existsSync(VIDEO_MACORWIN_PATH)) return []
  const filenames = fs.readdirSync(VIDEO_MACORWIN_PATH)
  const files = filenames.filter((item) => {
    const filepath = path.join(VIDEO_MACORWIN_PATH, item)
    return fs.statSync(filepath).isFile()
  })
  const obj = {}
  // 将数组转化为数组对象
  for (const key in files) {
    obj[key] = files[key]
  }
  const newObj = Object.keys(obj).map((val) => ({
    fileName: obj[val]
  }))
  return newObj
}

<template>
    <Layer>
      <div class="home-content">
          <div class="container">
            <div class="screen-record">
              <div class="record-operate">
                <div class="button" @click="sourceStart">
                  <p class="start">{{isRecord ? '结束' : '录屏'}}</p>
                </div>
                <div class="time-box">
                  <p class="time">{{transTime(timestamp)}}</p>
                </div>
              </div>
              <div class="list-box">
                <div class="video-list">
                  <NDataTable
                    :columns="columns"
                    :data="files"
                    :pagination="pagination"
                    :bordered="false"
                    :max-height="250">
                  <template #empty>
                      <NIcon size="18" style="margin-right:8px">
                        <FolderRegular />
                      </NIcon>
                      <p>暂无数据</p>
                  </template>
                  </NDataTable>
                  <!-- <div class="video-item" v-for="item in files" :key="item">
                    <p class="item-opt name">{{item}}</p>
                    <NButton @click="handlePlay(item)">播放</NButton>
                    <p class="item-opt play" @click="openDir(item)">打开文件目录</p>
                  </div> -->
                </div>
              </div>
            </div>
            <div class="screen-preview">
              <div class="img">
                <img :src="previewImg" v-if="videoUrl === ''">
                <video :src="`http://localhost:8080/${videoUrl}`" controls v-else></video>
              </div>
            </div>
          </div>
      </div>
    </Layer>
</template>
<script setup>
import { ref, h } from 'vue'
import { saveVideo, directoryFiles, timeFormat } from '../utils/helper'
import Layer from '../components/Layer.vue'
import { NButton, NDataTable, NIcon } from 'naive-ui'
import { FolderRegular } from '@vicons/fa'
const { ipcRenderer } = window.require('electron')

// 发送给主进程事件，再定义响应事件
const getSource = () => {
  return new Promise(resolve => {
    ipcRenderer.send('recive-desktop')

    ipcRenderer.on('relay-source', (event, data) => {
      resolve(data)
    })
  })
}
const previewImg = ref('') // 初始屏幕截图
// 获取捕获的屏幕
const getPreview = async () => {
  // relay-source响应获得数据
  const source = await getSource()
  // console.log(source.thumbnail.toDataURL())
  previewImg.value = source.thumbnail.toDataURL()
}
getPreview()

const timer = ref(null)
const timestamp = ref(0)
const countDown = () => {
  timestamp.value++
  timer.value = setTimeout(() => {
    countDown()
  }, 1000)
}

const transTime = (time) => {
  return timeFormat(time)
}

const recorder = ref(null)
const isRecord = ref(false)
const files = ref([])
// 初始化返回文件夹下文件类型文件数组
files.value = directoryFiles()
const recordStart = (stream) => {
  countDown()
  isRecord.value = true
  let blobSlice = []
  // 赋值并指定类型 mdn查看方法详情
  recorder.value = new MediaRecorder(stream, {
    mimeType: 'video/webm'
  })
  // 是否有流
  if (recorder.value) {
    // 开始录制 mdn查看方法详情
    recorder.value.start(1000)
    recorder.value.ondataavailable = (event) => {
      blobSlice.push(event.data)
    }
    // 监听停止录制
    recorder.value.onstop = async () => {
      // 录制按钮状态修改
      isRecord.value = false
      // 录制的流结构给blob并指定类型
      const blob = new Blob([...blobSlice], {
        type: 'video/webm'
      })
      // 调用自定义保存函数
      saveVideo(blob).then(() => {
        alert('保存成功')
        // 返回文件夹下文件类型文件数组
        files.value = directoryFiles()
        blobSlice = []
      })
    }
    // 监听错误
    recorder.value.onerror = (err) => {
      console.log(err)
    }
  }
}
// 获取流
const sourceStart = async () => {
  // 判断是否录制，如果录制中调用停止
  if (!isRecord.value) {
    ipcRenderer.send('startRecord')
    return
  }
  ipcRenderer.send('stopRecord')
}

ipcRenderer.on('record-stop', () => {
  timer.value && clearTimeout(timer.value)
  timestamp.value = 0
  recorder.value && recorder.value.stop()
})

ipcRenderer.on('record-start', async () => {
  const source = await getSource()
  // 获取流
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: source.id,
        minWidth: 1920,
        maxWidth: 1920,
        minHeight: 1080,
        maxHeight: 1080
      }
    }
  })
  const audio = await getDisplayMediaSource()
  if (audio) {
    // 追加音频流
    stream.addTrack(audio.getAudioTracks()[0])
    recordStart(stream)
  } else {
    recordStart(stream)
  }
})

// 获取麦克风音频或者系统音频方法
const getDisplayMediaSource = async () => {
  let audioStream = null
  // 选择录音条件，分为系统和麦克风
  let constraints = null
  const configVoiceType = 'microphone'
  // 同事捕获系统和麦克风音频
  if (configVoiceType === 'microphone') {
    constraints = { audio: true, video: false }
  }
  // 只捕获系统音频
  if (configVoiceType === 'system') {
    constraints = {
      audio: {
        mandatory: { chromeMediaSource: 'desktop' }
      },
      video: {
        mandatory: { chromeMediaSource: 'desktop' }
      }
    }
  }
  await navigator.mediaDevices.getUserMedia(constraints)
    .then(function (audio) {
      // 使用这个stream
      audioStream = audio
    })
    .catch(function (err) {
      // 处理error
      console.log('获取麦克风失败：' + err)
      audioStream = null
    })
  return audioStream
}

const pagination = false
const columns = [
  {
    title: '文件名',
    key: 'fileName',
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '操作',
    key: 'actions',
    render (row) {
      return [
        h(
          NButton,
          {
            size: 'small',
            style: {
              marginRight: '15px'
            },
            onClick: () => handlePlay(row)
          },
          { default: () => '播放' }
        ),
        h(
          NButton,
          {
            size: 'small',
            onClick: () => openDir(row)
          },
          { default: () => '打开文件目录' }
        )
      ]
    }
  }
]
// 播放
const videoUrl = ref('')
const handlePlay = (item) => {
  videoUrl.value = item.fileName
}
// 打开文件目录
const openDir = (item) => {
  ipcRenderer.send('directory-open', item.fileName)
}
</script>
<style lang="less" scoped>
.home-content{
  width:100%;
  height:100%;
  padding:0 20px;
  .container{
    height:100%;
    display:flex;
    border-radius:4px;

  }
  .screen-record{
    flex:1;
    height:100%;
    position:relative;
    .record-operate{
      padding:35px 20px;
      .button{
        width:100px;
        height:100px;
        margin:0 auto;
        border-radius:50%;
        overflow:hidden;
        position:relative;
        display:flex;
        justify-content:center;
        align-items:center;
        background:#f50101;
        cursor:pointer;
        .start{
          user-select:none;
          font-size:20px;
          color:#fff;
        }
        &:hover{
          background:#ff5858;
        }
      }
      .time-box{
        display:flex;
        align-items:center;
        justify-content:center;
        margin-top:20px;
        .time{
          font-size:22px;
          font-weight:bold;
          color:#e34646;
        }
      }
    }
    .list-box{
      position:absolute;
      width:100%;
      top:218px;
      bottom:0;
      .video-list{
        width:100%;
        height:100%;
        // border:1px solid @color-border;
        // border-radius:4px;
        // padding:0 20px;
        overflow-y:auto;
        .video-item{
          display:flex;
          padding:0 20px;
          height:50px;
          align-items:center;
          border-bottom:1px solid #1d1d1d;
          .item-opt{
            flex:1;
            text-align:center;
            &.play{
              cursor:pointer;
            }
          }
        }
      }
    }
  }
  .screen-preview{
    margin-left:12px;
    width:60%;
    height:100%;
    // background:#ccc;
    border-left: 1px solid #ccc;
    padding-left: 5px;
    .img{
      width:100%;
      height:100%;
      display:flex;
      justify-content:center;
      align-items:center;
      video{
        width:100%;
      }
    }
    img{
      display:block;
      width:100%;
    }
  }
}
</style>

<template>
    <div class="suspend-page" v-mouse-drag="handleDrag">
      <div class="ball" ref="ballRef">{{transTime(timestamp)}}</div>
    </div>
  </template>
<script setup>
import { ref } from 'vue'
import { timeFormat } from '../utils/helper'
const { ipcRenderer } = window.require('electron')

const timer = ref(null)
const timestamp = ref(0)
const isRecord = ref(false)

const countDown = () => {
  timestamp.value++
  timer.value = setTimeout(() => {
    countDown()
  }, 1000)
}

const startCount = () => {
  if (!isRecord.value) {
    isRecord.value = true
    countDown()
  }
}

ipcRenderer.on('record-start', () => {
  startCount()
})

ipcRenderer.on('record-stop', () => {
  timer.value && clearTimeout(timer.value)
  timestamp.value = 0
  isRecord.value = false
})

const transTime = (time) => {
  return timeFormat(time)
}

const handleDrag = (pos) => {
  ipcRenderer.send('move-suspend', {
    baseX: pos.x,
    baseY: pos.y
  })
}

</script>
  <style lang="less" scoped>
  html,body{
    border-radius:50%;
    overflow:hidden;
    background:transparent !important;
  }
  .suspend-page{
    user-select: none;
    position: relative;
    height: 100%;
    width: 100%;
    padding:3px;
    .ball{
      width:100%;
      height:100%;
      border-radius:50%;
      cursor:pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      background:#5bc6ef;
      box-shadow: 0 0 2px 2px #fcfeff;
      color:#fff;
    }
  }
  </style>

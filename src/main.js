import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Directive from '@/directives'
import '@/assets/styles/reset.css'
import '@/assets/styles/comm.less'

createApp(App).use(Directive).use(router).mount('#app')

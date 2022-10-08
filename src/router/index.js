import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/startupPage',
    name: 'StartupPage',
    component: () => import('@/pages/startup-page.vue')
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/pages/home.vue')
  },
  {
    path: '/suspend',
    name: 'Suspend',
    component: () => import('@/pages/suspend.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router

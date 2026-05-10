import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/ims' },
    {
      path: '/ims',
      name: 'ims',
      component: () => import('@/modules/ims/views/ImsListView.vue'),
    },
    {
      path: '/ams',
      name: 'ams',
      component: () => import('@/modules/ams/views/AmsListView.vue'),
    },
  ],
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import Leaderboard from '../views/Leaderboard.vue'
import AboutView from '../views/AboutView.vue'
import HomeView from '@/views/HomeView.vue'
import AuthFormView from '@/views/AuthFormView.vue'

const routes = [
  {
    path: '/',
    component: () => import('@/layout/Layout.vue'),
    children: [
      {
        path: '/',
        name: 'home',
        component: HomeView,
      },
      {
        path: '/signup',
        name: 'signup',
        component: AuthFormView,
      },
      {
        path: '/login',
        name: 'login',
        component: AuthFormView,
      },
      {
        path: '/leaderboard',
        name: 'leaderboard',
        component: Leaderboard,
      },
      {
        path: '/about',
        name: 'about',
        component: AboutView,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router

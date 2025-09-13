import { createRouter, createWebHistory } from 'vue-router'
import Leaderboard from '../views/Leaderboard.vue'
import AboutView from '../views/AboutView.vue'
import HomeView from '@/views/HomeView.vue'
import AuthFormView from '@/views/AuthFormView.vue'
import { useUserStore } from '../store/useUserStore'

export const ROUTES = {
  HOME: '/',
  REGISTER: '/signup',
  LOGIN: '/login',
  ANSWERS: '/signup/registeration-answers',
  LEADERBOARD: '/leaderboard',
}

const routes = [
  {
    path: '/',
    component: () => import('@/layout/Layout.vue'),
    children: [
      {
        path: ROUTES.HOME,
        name: 'home',
        component: HomeView,
      },
      {
        path: ROUTES.REGISTER,
        name: 'signup',
        component: AuthFormView,
      },
      {
        path: ROUTES.LOGIN,
        name: 'login',
        component: AuthFormView,
      },
      {
        path: ROUTES.LEADERBOARD,
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

router.beforeEach((to, from, next) => {
  const { token, IsFirstTime } = useUserStore()

  if (!IsFirstTime) {
    if (to.path !== ROUTES.HOME) {
      return next(ROUTES.HOME)
    }
    return next()
  }

  if (IsFirstTime && !token) {
    if (![ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.HOME].includes(to.path)) {
      return next(ROUTES.LOGIN)
    }
    return next()
  }

  if (IsFirstTime && token) {
    if (to.path !== ROUTES.LEADERBOARD) {
      return next(ROUTES.LEADERBOARD)
    }
    return next()
  }

  next()
})

export default router

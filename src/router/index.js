import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../store/useUserStore'
import Leaderboard from '@/views/Leaderboard.vue'
import HomeView from '@/views/HomeView.vue'
import AuthFormView from '@/views/AuthFormView.vue'
import AuthAnswer from '@/views/AuthAnswer.vue'
import Door from '@/views/Door.vue'
import FindWord from '@/views/FindWord.vue'

export const ROUTES = {
  HOME: '/',
  REGISTER: '/signup',
  LOGIN: '/login',
  ANSWERS: '/signup/registeration-answers',
  LEADERBOARD: '/leaderboard',
  DOOR: '/play/door',
  FIND_WORD: '/play/find-the-hidden-word',
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
        path: ROUTES.ANSWERS,
        name: 'answers',
        component: AuthAnswer,
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
        path: ROUTES.DOOR,
        name: 'door',
        component: Door,
      },
      {
        path: ROUTES.FIND_WORD,
        name: 'findWord',
        component: FindWord,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const { token, IsFirstTime, pageName } = useUserStore()

  if (!IsFirstTime) {
    if (to.path !== ROUTES.HOME) {
      return next(ROUTES.HOME)
    }
    return next()
  }

  if (IsFirstTime && !token) {
    if (![ROUTES.LOGIN, ROUTES.REGISTER].includes(to.path)) {
      return next(ROUTES.LOGIN)
    }
    return next()
  }

  if (IsFirstTime && token) {
    const redirectPath = pageName === 'register' ? ROUTES.ANSWERS : ROUTES.LEADERBOARD

    const allowedRoutes = [redirectPath, ROUTES.DOOR, ROUTES.FIND_WORD]

    if (!allowedRoutes.includes(to.path)) {
      return next(redirectPath)
    }
    return next()
  }

  next()
})

export default router

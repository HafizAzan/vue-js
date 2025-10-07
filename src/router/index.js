import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../store/useUserStore'
import Leaderboard from '@/views/Leaderboard.vue'
import HomeView from '@/views/HomeView.vue'
import AuthFormView from '@/views/AuthFormView.vue'
import AuthAnswer from '@/views/AuthAnswer.vue'
import Door from '@/views/Door.vue'
import FindWord from '@/views/FindWord.vue'
import AdminDashboard from '@/views/AdminViews/AdminDashboard.vue'
import SingleUser from '@/views/AdminViews/SingleUser.vue'
import AdminProfile from '@/views/AdminViews/AdminProfile.vue'
import AdminAddQuestion from '@/views/AdminViews/AdminAddQuestion.vue'
import AdminJumbleWord from '@/views/AdminViews/AdminJumbleWord.vue'
import AdminBackgroundImages from '@/views/AdminViews/AdminBackgroundImages.vue'
import AdminUploadTextAndAudio from '@/views/AdminViews/AdminUploadTextAndAudio.vue'

export const ROUTES = {
  HOME: '/',
  REGISTER: '/signup',
  LOGIN: '/login',
  ANSWERS: '/signup/registeration-answers',
  LEADERBOARD: '/leaderboard',
  DOOR: '/play/door',
  FIND_WORD: '/play/find-the-hidden-word',
  USER_LIST: '/admin/user-list',
  SINGLE_USER: '/admin/user-detail/:userId/:username',
  ADMIN_PROFILE: '/admin/account',
  ADMIN_ADD_QUESTION: '/admin/add-question',
  ADMIN_ADD_JUMBLE_WORD: '/admin/add-jumble-words',
  ADMIN_ADD_BACKGROUND_IMG: '/admin/add-background-images',
  ADMIN_ADD_MODAL_AND_AUDIO: '/admin/upload-modal-text-with-upload-audio',
}

const routes = [
  {
    path: ROUTES.HOME,
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
        meta: { requiresAuth: false, roles: ['user'] },
      },
      {
        path: ROUTES.DOOR,
        name: 'door',
        component: Door,
        meta: { requiresAuth: false, roles: ['user'] },
      },
      {
        path: ROUTES.FIND_WORD,
        name: 'findWord',
        component: FindWord,
        meta: { requiresAuth: false, roles: ['user'] },
      },
      {
        path: ROUTES.USER_LIST,
        name: 'userList',
        component: AdminDashboard,
        meta: { requiresAuth: true, roles: ['admin'] },
      },
      {
        path: ROUTES.SINGLE_USER,
        name: 'singleUser',
        component: SingleUser,
        meta: { requiresAuth: true, roles: ['admin'] },
      },
      {
        path: ROUTES.ADMIN_PROFILE,
        name: 'adminProfile',
        component: AdminProfile,
        meta: { requiresAuth: true, roles: ['admin'] },
      },
      {
        path: ROUTES.ADMIN_ADD_QUESTION,
        name: 'adminAddQuestion',
        component: AdminAddQuestion,
        meta: { requiresAuth: true, roles: ['admin'] },
      },
      {
        path: ROUTES.ADMIN_ADD_JUMBLE_WORD,
        name: 'adminAddJumbleWord',
        component: AdminJumbleWord,
        meta: { requiresAuth: true, roles: ['admin'] },
      },
      {
        path: ROUTES.ADMIN_ADD_BACKGROUND_IMG,
        name: 'adminAddBgImg',
        component: AdminBackgroundImages,
        meta: { requiresAuth: true, roles: ['admin'] },
      },
      {
        path: ROUTES.ADMIN_ADD_MODAL_AND_AUDIO,
        name: 'adminUploadTextAndAudio',
        component: AdminUploadTextAndAudio,
        meta: { requiresAuth: true, roles: ['admin'] },
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

  const isLoggedIn = !!token
  const userRole = token?.loginAs || null
  const allowedRoles = to.meta?.roles || []

  if (allowedRoles.length && userRole && !allowedRoles.includes(userRole)) {
    const redirectPath = userRole === 'admin' ? ROUTES.USER_LIST : ROUTES.LEADERBOARD
    if (to.path !== redirectPath) {
      return next(redirectPath)
    } else {
      return next(false)
    }
  }

  if (!IsFirstTime) {
    if (to.path !== ROUTES.HOME) {
      return next(ROUTES.HOME)
    }
    return next()
  }

  if (IsFirstTime && !isLoggedIn) {
    if (![ROUTES.LOGIN, ROUTES.REGISTER].includes(to.path)) {
      return next(ROUTES.LOGIN)
    }
    return next()
  }

  if (IsFirstTime && isLoggedIn) {
    if (userRole === 'admin') {
      const allowedRoutes = [
        'singleUser',
        'userList',
        'adminProfile',
        'adminAddQuestion',
        'adminAddJumbleWord',
        'adminAddBgImg',
        'adminUploadTextAndAudio',
      ]
      if (!allowedRoutes.includes(to.name)) {
        return next(ROUTES.USER_LIST)
      }
    } else {
      const redirectPath = pageName === 'register' ? ROUTES.ANSWERS : ROUTES.LEADERBOARD
      const allowedRoutes = [redirectPath, ROUTES.DOOR, ROUTES.FIND_WORD]
      if (!allowedRoutes.includes(to.path)) {
        return next(redirectPath)
      }
    }
  }

  next()
})

export default router

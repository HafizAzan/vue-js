import { defineStore } from 'pinia'
import { useUserStore } from './useUserStore'

export const usePlayStore = defineStore('play', {
  state: () => ({
    level: null,
    currentTimeMap: {},
    currentSessionTime: {},
  }),

  actions: {
    setLevel(level) {
      this.level = level
    },

    setTime(value) {
      const userStore = useUserStore()
      const userId = userStore.token?._id
      if (!userId) return
      this.currentTimeMap = { ...this.currentTimeMap, [userId]: value }
    },

    getTimeForUser() {
      const userStore = useUserStore()
      const userId = userStore.token?._id
      if (!userId) return null
      return this.currentTimeMap[userId] ?? null
    },

    clearTimeForUser() {
      const userStore = useUserStore()
      const userId = userStore.token?._id
      if (!userId) return
      const newMap = { ...this.currentTimeMap }
      delete newMap[userId]
      this.currentTimeMap = newMap
    },

    // session time saved
    setSessionTime(value) {
      const userStore = useUserStore()
      const userId = userStore.token?._id
      if (!userId) return
      this.currentSessionTime = { ...this.currentSessionTime, [userId]: value }
    },

    getSessionTimeForUser() {
      const userStore = useUserStore()
      const userId = userStore.token?._id
      if (!userId) return null
      return this.currentSessionTime[userId] ?? null
    },

    clearSessionTimeForUser() {
      const userStore = useUserStore()
      const userId = userStore.token?._id
      if (!userId) return
      const newMap = { ...this.currentSessionTime }
      delete newMap[userId]
      this.currentSessionTime = newMap
    },
  },

  persist: true,
})

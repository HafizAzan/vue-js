import { defineStore } from 'pinia'
import { useUserStore } from './useUserStore'

export const usePlayStore = defineStore('play', {
  state: () => ({
    playCard: {},
    currentTimeMap: {},
    currentSessionTime: {},
    selectedOpt: null,
  }),

  actions: {
    setSelectedOpt(value) {
      console.log(value, 'value')
      this.selectedOpt = value
    },

    getUserKey(level = null, session = null) {
      const userStore = useUserStore()
      const userId = userStore.token?._id
      if (!userId) return null
      level = level ?? 1
      session = session ?? 1
      return `${userId}__level-${level}__session-${session}`
    },

    getPlayData(level = null, session = null) {
      const key = this.getUserKey(level, session)
      if (!key) return null
      return this.playCard[key] ?? { level: level ?? 1, session: session ?? 1, playedSession: 0 }
    },

    getLevel(level = null, session = null) {
      return this.getPlayData(level, session)?.level ?? 1
    },

    getSession(level = null, session = null) {
      return this.getPlayData(level, session)?.session ?? 1
    },

    getPlayedSession(level = null, session = null) {
      return this.getPlayData(level, session)?.playedSession ?? 0
    },

    incrementLevel(level = null, session = null) {
      const key = this.getUserKey(level, session)
      if (!key) return

      if (!this.playCard[key]) {
        this.playCard[key] = { level: 1, session: 1, playedSession: 0 }
      }

      this.playCard[key] = {
        ...this.playCard[key],
        level: (this.playCard[key].level ?? 1) + 1,
      }
    },

    incrementSession(level = null, session = null) {
      const key = this.getUserKey(level, session)
      if (!key) return

      if (!this.playCard[key]) {
        this.playCard[key] = { level: 1, session: 1, playedSession: 0 }
      }

      this.playCard[key] = {
        ...this.playCard[key],
        session: (this.playCard[key].session ?? 1) + 1,
      }
    },

    incrementPlayedSession(level = null, session = null) {
      const key = this.getUserKey(level, session)
      if (!key) return

      if (!this.playCard[key]) {
        this.playCard[key] = { level: 1, session: 1, playedSession: 0 }
      }

      this.playCard[key] = {
        ...this.playCard[key],
        playedSession: (this.playCard[key].playedSession ?? 0) + 1,
      }
    },

    setTime(value, level = null, session = null) {
      const key = this.getUserKey(level, session)
      if (!key) return
      this.currentTimeMap = { ...this.currentTimeMap, [key]: value }
    },

    getTimeForUser(level = null, session = null) {
      const key = this.getUserKey(level, session)
      if (!key) return null
      return this.currentTimeMap[key] ?? null
    },

    clearTimeForUser(level = null, session = null) {
      const key = this.getUserKey(level, session)
      if (!key) return
      const newMap = { ...this.currentTimeMap }
      delete newMap[key]
      this.currentTimeMap = newMap
    },

    setSessionTime(value, level = null, session = null) {
      const key = this.getUserKey(level, session)
      if (!key) return
      this.currentSessionTime = { ...this.currentSessionTime, [key]: value }
    },

    getSessionTimeForUser(level = null, session = null) {
      const key = this.getUserKey(level, session)
      if (!key) return null
      return this.currentSessionTime[key] ?? null
    },

    clearSessionTimeForUser(level = null, session = null) {
      const key = this.getUserKey(level, session)
      if (!key) return null
      const newMap = { ...this.currentSessionTime }
      delete newMap[key]
      this.currentSessionTime = newMap
    },
  },

  persist: true,
})

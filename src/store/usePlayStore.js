import { defineStore } from 'pinia'
import { useUserStore } from './useUserStore'

export const usePlayStore = defineStore('play', {
  state: () => ({
    data: {},
  }),

  actions: {
    buildKey(prefix, includeLevelSession = false) {
      const userStore = useUserStore()
      const userId = userStore.token?._id
      if (!userId) return null

      if (includeLevelSession) {
        return `${prefix}__${userId}__level-${this.getLevel()}_session-${this.getSession()}`
      }

      return `${prefix}__${userId}`
    },

    setSection(value) {
      const key = this.buildKey(`section`)
      if (!key) return null
      this.data[key] = value
    },

    getSection() {
      const key = this.buildKey(`section`)
      if (!key) return null
      return this.data[key] ?? null
    },

    clearSection() {
      const key = this.buildKey(`section`)
      if (!key) return null
      delete this.data[key]
    },

    setLastModal(value) {
      const key = this.buildKey('LastModal', true)
      if (!key) return null
      this.data[key] = value
    },

    getLastModal() {
      const key = this.buildKey('LastModal', true)
      if (!key) return false
      return this.data[key] ?? false
    },

    clearLastModal() {
      const key = this.buildKey('LastModal', true)
      if (!key) return false
      delete this.data[key]
    },

    setSessionModal(value) {
      const key = this.buildKey('sessionModal', true)
      if (!key) return null
      this.data[key] = value
    },

    getSessionModal() {
      const key = this.buildKey('sessionModal', true)
      if (!key) return false
      return this.data[key] ?? false
    },

    clearSessionModal() {
      const key = this.buildKey('sessionModal', true)
      if (!key) return false
      delete this.data[key]
    },

    setCompleteTime(value) {
      const key = this.buildKey(`completeTime_level-${this.getLevel()}`)
      if (!key) return null
      this.data[key] = value
    },

    getCompleteTime() {
      const key = this.buildKey(`completeTime_level-${this.getLevel()}`)
      if (!key) return 0
      return this.data[key] ?? 0
    },

    clearCompleteTime() {
      const key = this.buildKey(`completeTime_level-${this.getLevel()}`)
      if (!key) return null
      delete this.data[key]
    },

    // ========================
    // 📌 LEVEL
    // ========================

    setLevel(value) {
      const key = this.buildKey(`level`)
      if (!key) return null
      this.data[key] = value
    },

    getLevel() {
      const key = this.buildKey(`level`)
      if (!key) return 1
      return this.data[key] ?? 1
    },

    incrementLevel() {
      this.setLevel(this.getLevel() + 1)
    },

    // ========================
    // 📌 SESSION
    // ========================
    setSession(value) {
      const key = this.buildKey(`session_level-${this.getLevel()}`)
      if (!key) return null
      this.data[key] = value
    },

    getSession() {
      const key = this.buildKey(`session_level-${this.getLevel()}`)
      if (!key) return 1
      return this.data[key] ?? 1
    },

    incrementSession() {
      this.setSession(this.getSession() + 1)
      this.clearSelectedOpt()
      this.clearSessionTime()
    },

    // ========================
    // 📌 PLAYED SESSION
    // ========================
    setPlayedSession(value) {
      const key = this.buildKey(`playedSession_level-${this.getLevel()}`)
      if (!key) return null
      this.data[key] = value
    },

    getPlayedSession() {
      const key = this.buildKey(`playedSession_level-${this.getLevel()}`)
      if (!key) return 0
      return this.data[key] ?? 0
    },

    incrementPlayedSession() {
      this.setPlayedSession(this.getPlayedSession() + 1)
    },

    // ========================
    // 📌 SELECTED OPTION
    // ========================
    setSelectedOpt(value) {
      const key = this.buildKey(`selectedOpt_level-${this.getLevel()}`)
      if (!key) return null
      this.data[key] = value
    },

    getSelectedOpt() {
      const key = this.buildKey(`selectedOpt_level-${this.getLevel()}`)
      if (!key) return null
      return this.data[key] ?? null
    },

    clearSelectedOpt() {
      const key = this.buildKey(`selectedOpt_level-${this.getLevel()}`)
      if (!key) return null
      delete this.data[key]
    },

    // ========================
    // 📌 SESSION TIME
    // ========================
    setSessionTime(value) {
      const key = this.buildKey(`sessionTime_level-${this.getLevel()}`)
      if (!key) return null
      this.data[key] = value
    },

    getSessionTime() {
      const key = this.buildKey(`sessionTime_level-${this.getLevel()}`)
      if (!key) return null
      return this.data[key] ?? null
    },

    clearSessionTime() {
      const key = this.buildKey(`sessionTime_level-${this.getLevel()}`)
      if (!key) return null
      delete this.data[key]
    },

    // ========================
    // 📌 CURRENT TIME
    // ========================
    setCurrentTime(value) {
      const key = this.buildKey(`currentTime_level-${this.getLevel()}`)
      if (!key) return null
      this.data[key] = value
    },

    getCurrentTime() {
      const key = this.buildKey(`currentTime_level-${this.getLevel()}`)
      if (!key) return null
      return this.data[key] ?? null
    },

    clearCurrentTime() {
      const key = this.buildKey(`currentTime_level-${this.getLevel()}`)
      if (!key) return null
      delete this.data[key]
    },

    // ========================
    // 📌 RESET
    // ========================
    resetAll() {
      const userStore = useUserStore()
      const userId = userStore.token?._id
      if (!userId) return

      Object.keys(this.data).forEach((k) => {
        if (k.includes(`__${userId}`)) {
          delete this.data[k]
        }
      })
    },
  },

  persist: true,
})

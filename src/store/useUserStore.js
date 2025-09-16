import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    IsFirstTime: false,
    token: null,
    pageName: '',
    level: null,
  }),

  actions: {
    setIsFirstTime(value) {
      this.IsFirstTime = value
    },

    setPageName(value) {
      this.pageName = value
    },

    setToken(value) {
      this.token = value
    },

    resetToken() {
      this.token = null
    },

    setLevel(level) {
      this.level = level
    },
  },

  persist: true,
})

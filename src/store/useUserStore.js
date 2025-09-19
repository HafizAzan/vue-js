import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    IsFirstTime: false,
    token: null,
    pageName: '',
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
  },

  persist: true,
})

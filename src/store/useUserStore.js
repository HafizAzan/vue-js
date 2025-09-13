import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    IsFirstTime: false,
    token: null,
  }),

  actions: {
    setIsFirstTime(value) {
      this.IsFirstTime = value
    },

    setToken(value) {
      this.token = value
    },
  },

  persist: true,
})

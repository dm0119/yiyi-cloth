import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    token: null,
    isLoggedIn: false
  }),
  
  getters: {
    getUserInfo: (state) => state.userInfo,
    getToken: (state) => state.token,
    getIsLoggedIn: (state) => state.isLoggedIn
  },
  
  actions: {
    setUserInfo(userInfo) {
      this.userInfo = userInfo
    },
    setToken(token) {
      this.token = token
      localStorage.setItem('user_token', token)
    },
    setIsLoggedIn(isLoggedIn) {
      this.isLoggedIn = isLoggedIn
    },
    login(userInfo, token) {
      this.setUserInfo(userInfo)
      this.setToken(token)
      this.setIsLoggedIn(true)
    },
    logout() {
      this.userInfo = null
      this.token = null
      this.isLoggedIn = false
      // 清除所有相关的localStorage数据
      localStorage.removeItem('user_token')
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_permissions')
      localStorage.removeItem('admin_user')
    }
  }
})

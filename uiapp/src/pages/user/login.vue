<template>
  <view class="container">
    <view class="login-form">
      <view class="logo">
      </view>
      <text class="title">依依大码服装</text>
      <text class="subtitle">欢迎登录</text>
      
      <van-form @submit="onSubmit">
        <van-field
          v-model="username"
          name="username"
          placeholder="请输入用户名"
          :rules="[{ required: true, message: '用户名不能为空' }]"
          left-icon="user-o"
          clearable
        />
        <van-field
          v-model="password"
          type="password"
          name="password"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '密码不能为空' }]"
          left-icon="locked-o"
          clearable
          :password-visible="showPassword"
          @click-icon="togglePasswordVisibility"
        />
        
        <view class="form-actions">
          <text class="forgot-password" @click="goToForgotPassword">忘记密码？</text>
        </view>
        
        <van-button
          type="primary"
          native-type="submit"
          block
          :loading="loading"
          class="login-button"
        >
          登录
        </van-button>
      </van-form>
      
      <view class="register-section">
        <text>还没有账号？</text>
        <text class="register-link" @click="goToRegister">立即注册</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { userApi } from '@/services/api.js'

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}

function checkLoginStatus() {
  const user = uni.getStorageSync('userInfo')
  const loggedIn = uni.getStorageSync('isLoggedIn')
  return loggedIn && user
}

async function onSubmit(values) {
  loading.value = true
  try {
    const res = await userApi.login({
      username: values.username,
      password: values.password
    })
    
    if (res.success) {
      uni.setStorageSync('user_token', res.data.token)
      uni.setStorageSync('userInfo', res.data.user)
      uni.setStorageSync('userId', res.data.user.id)
      uni.setStorageSync('isLoggedIn', true)
      
      uni.showToast({
        title: '登录成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index'
        })
      }, 1500)
    } else {
      uni.showToast({
        title: res.message || '登录失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('登录失败:', error)
    uni.showToast({
      title: '登录失败，请检查网络或账号密码',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

function goToRegister() {
  uni.navigateTo({
    url: '/pages/user/register'
  })
}

function goToForgotPassword() {
  uni.navigateTo({
    url: '/pages/user/forgot-password-step1'
  })
}
</script>

<style scoped>
  :root {
    --primary-color: #ff6b6b;
    --primary-hover: #ee5a5a;
    --secondary-color: #4ecdc4;
    --success-color: #52c41a;
    --warning-color: #faad14;
    --error-color: #ff4d4f;
    --text-primary: #333333;
    --text-secondary: #666666;
    --text-muted: #999999;
    --bg-color: #f8f9fa;
    --bg-white: #ffffff;
    --border-color: #e8e8e8;
    --card-radius: 12px;
    --button-radius: 8px;
    --font-size-xs: 22rpx;
    --font-size-sm: 24rpx;
    --font-size-md: 28rpx;
    --font-size-lg: 32rpx;
    --font-size-xl: 36rpx;
    --font-size-xxl: 40rpx;
    --spacing-xs: 10rpx;
    --spacing-sm: 16rpx;
    --spacing-md: 24rpx;
    --spacing-lg: 32rpx;
    --spacing-xl: 48rpx;
    --shadow-sm: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
    --shadow-md: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
    --transition-fast: 0.2s ease;
  }
  
  page {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: var(--font-size-md);
    color: var(--text-primary);
    background: linear-gradient(to bottom, #ffb6c1 0%, #fffaf0 100%);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  .container {
    min-height: 100vh;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-md);
  }

.login-form {
  width: 100%;
  max-width: 400px;
  background: transparent;
  border-radius: var(--card-radius);
  padding: var(--spacing-xl);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.logo {
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-md);
}

.title {
  display: block;
  text-align: center;
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.subtitle {
  display: block;
  text-align: center;
  font-size: var(--font-size-md);
  color: var(--text-muted);
  margin-bottom: var(--spacing-xl);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--spacing-lg);
}

.forgot-password {
  font-size: var(--font-size-sm);
  color: var(--primary-color);
}

.login-button {
  margin-bottom: var(--spacing-lg);
}

.register-section {
  text-align: center;
  font-size: var(--font-size-md);
  color: var(--text-muted);
}

.register-link {
  color: var(--primary-color);
  margin-left: var(--spacing-xs);
}

.login-form .van-cell {
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.login-form .van-field__body {
  background: transparent;
}

.login-form .van-field__control {
  background: transparent;
  color: var(--text-primary);
}
</style>

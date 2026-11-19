<template>
  <div class="login-page">
    <!-- 顶部导航 -->
    <div class="nav-header">
      <span class="back-btn" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <span class="nav-title">用户登录</span>
      <span class="nav-right"></span>
    </div>

    <!-- 登录表单 -->
    <div class="login-form">
      <!-- Logo区域 -->
      <div class="logo-area">
        <div class="logo-icon">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <circle cx="30" cy="30" r="30" fill="#1989fa"/>
            <path d="M30 15C21.716 15 15 21.716 15 30C15 38.284 21.716 45 30 45C38.284 45 45 38.284 45 30C45 21.716 38.284 15 30 15ZM30 18C36.627 18 42 23.373 42 30C42 36.627 36.627 42 30 42C23.373 42 18 36.627 18 30C18 23.373 23.373 18 30 18Z" fill="#fff"/>
            <path d="M30 22C25.582 22 22 25.582 22 30C22 34.418 25.582 38 30 38C34.418 38 38 34.418 38 30C38 25.582 34.418 22 30 22Z" fill="#fff"/>
          </svg>
        </div>
        <div class="logo-text">依依大码服装</div>
      </div>

      <!-- 用户名 -->
      <div class="form-item">
        <div class="form-label">用户名</div>
        <div class="form-input">
          <input 
            v-model="formData.username" 
            type="text" 
            placeholder="请输入用户名"
            maxlength="20"
          />
        </div>
      </div>

      <!-- 密码 -->
      <div class="form-item">
        <div class="form-label">密码</div>
        <div class="form-input">
          <input 
            v-model="formData.password" 
            :type="showPassword ? 'text' : 'password'" 
            placeholder="请输入密码"
            maxlength="20"
          />
          <span class="toggle-btn" @click="showPassword = !showPassword">
            {{ showPassword ? '隐藏' : '显示' }}
          </span>
        </div>
      </div>

      <!-- 登录按钮 -->
      <div class="form-button">
        <van-button 
          type="primary" 
          block 
          :loading="loading"
          @click="handleLogin"
        >
          登录
        </van-button>
      </div>

      <!-- 注册链接 -->
      <div class="register-link">
        还没有账号？<span @click="goToRegister">立即注册</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { request } from '@/utils/api'

const router = useRouter()

// 表单数据
const formData = reactive({
  username: '',
  password: ''
})

const showPassword = ref(false)
const loading = ref(false)

// 返回
const goBack = () => {
  router.back()
}

// 跳转注册
const goToRegister = () => {
  router.push('/mobile/register')
}

// 登录
const handleLogin = async () => {
  if (!formData.username) {
    showToast({ message: '请输入用户名', position: 'bottom' })
    return
  }
  
  if (!formData.password) {
    showToast({ message: '请输入密码', position: 'bottom' })
    return
  }
  
  loading.value = true
  
  try {
    const response = await request('/mobile/users/login', {
      method: 'POST',
      data: {
        username: formData.username,
        password: formData.password
      }
    })
    
    if (response.success) {
      // 保存token和用户信息
      localStorage.setItem('mobile_token', response.data.token)
      localStorage.setItem('mobile_user', JSON.stringify(response.data.user))
      
      showToast({ message: '登录成功', position: 'bottom' })
      
      // 跳转到首页或其他页面
      router.replace('/mobile')
    } else {
      showToast({ message: response.message || '登录失败', position: 'bottom' })
    }
  } catch (error) {
    console.error('登录失败:', error)
    showToast({ message: '网络错误，请稍后重试', position: 'bottom' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #1989fa 0%, #f5f5f5 40%);
}

.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 44px;
  padding: 0 16px;
  background: transparent;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn,
.nav-right {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #fff;
}

.login-form {
  padding: 40px 20px 20px;
}

.logo-area {
  text-align: center;
  margin-bottom: 40px;
}

.logo-icon {
  margin-bottom: 12px;
}

.logo-text {
  font-size: 22px;
  font-weight: 600;
  color: #fff;
}

.form-item {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.form-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.form-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-input input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  color: #333;
  background: transparent;
}

.form-input input::placeholder {
  color: #c0c0c0;
}

.toggle-btn {
  color: #1989fa;
  font-size: 14px;
  padding: 4px 8px;
}

.form-button {
  margin-top: 24px;
}

.register-link {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: #fff;
}

.register-link span {
  color: #fff;
  font-weight: 600;
  margin-left: 4px;
}
</style>

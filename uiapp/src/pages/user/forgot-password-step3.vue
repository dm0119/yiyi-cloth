<template>
  <view class="container">
    <view class="forgot-form">
      <view class="logo">
      </view>
      <text class="title">依依大码服装</text>
      <text class="subtitle">忘记密码</text>
      <text class="step-info">Step 3/3</text>
      
      <van-form @submit="onSubmit">
        <van-field
          v-model="newPassword"
          type="password"
          name="newPassword"
          placeholder="请输入新密码（6-16位）"
          :rules="[
            { required: true, message: '新密码不能为空' },
            { min: 6, max: 16, message: '密码长度为6-16位' },
            { validator: validatePassword, message: '密码只能包含字母和数字' }
          ]"
          left-icon="locked-o"
          clearable
          :password-visible="showPassword"
          @click-icon="togglePasswordVisibility"
        />
        <van-field
          v-model="confirmPassword"
          type="password"
          name="confirmPassword"
          placeholder="请确认新密码"
          :rules="[
            { required: true, message: '请确认新密码' },
            { validator: validateConfirmPassword, message: '两次输入的密码不一致' }
          ]"
          left-icon="locked-o"
          clearable
          :password-visible="showPassword"
          @click-icon="togglePasswordVisibility"
        />
        
        <view class="form-actions">
          <text class="back-link" @click="goBack">上一步</text>
        </view>
        
        <van-button
          type="primary"
          native-type="submit"
          block
          :loading="loading"
          class="reset-button"
        >
          重置密码
        </van-button>
      </van-form>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { userApi } from '@/services/api.js'

const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const userId = ref('')
const username = ref('')
const loading = ref(false)

// 获取路由参数
onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options
  userId.value = options.userId || ''
  username.value = decodeURIComponent(options.username || '')
})

// 验证密码格式
function validatePassword(val) {
  return /^[a-zA-Z0-9]{6,16}$/.test(val)
}

// 验证两次密码是否一致
function validateConfirmPassword(val) {
  return val === newPassword.value
}

// 切换密码可见性
function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}

async function onSubmit(values) {
  loading.value = true
  
  try {
    const res = await userApi.resetPassword(userId.value, {
      newPassword: values.newPassword
    })
    
    if (res.success) {
      uni.showToast({
        title: '密码已重置，请使用新密码登录',
        icon: 'success',
        duration: 2000
      })
      
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/user/login'
        })
      }, 2000)
    } else {
      uni.showToast({
        title: res.message || '密码重置失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.showToast({
      title: '密码重置失败，请检查网络',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

function goBack() {
  uni.navigateBack({
    delta: 1
  })
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
}

.forgot-form {
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
  margin-bottom: var(--spacing-xs);
}

.step-info {
  display: block;
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--primary-color);
  margin-bottom: var(--spacing-xl);
}

.form-actions {
  display: flex;
  justify-content: flex-start;
  margin-bottom: var(--spacing-lg);
}

.back-link {
  font-size: var(--font-size-sm);
  color: var(--primary-color);
}

.reset-button {
  margin-bottom: var(--spacing-lg);
}

/* 自定义表单字段样式 */
.forgot-form .van-cell {
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.forgot-form .van-field__body {
  background: transparent;
}

.forgot-form .van-field__control {
  background: transparent;
  color: var(--text-primary);
}
</style>
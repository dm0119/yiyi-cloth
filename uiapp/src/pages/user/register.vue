<template>
  <view class="container">
    <view class="register-form">
      <view class="logo">
        <van-icon name="shop-o" size="100" color="#ff6b6b" />
      </view>
      <text class="title">依依大码服装</text>
      <text class="subtitle">用户注册</text>
      
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
          placeholder="请输入密码（至少6位）"
          :rules="[{ required: true, message: '密码不能为空' }, { min: 6, message: '密码至少6位' }]"
          left-icon="locked-o"
          clearable
          :password-visible="showPassword"
          @click-icon="togglePasswordVisibility"
        />
        <van-field
          v-model="confirmPassword"
          type="password"
          name="confirmPassword"
          placeholder="请确认密码"
          :rules="[
            { required: true, message: '请确认密码' },
            { validator: validateConfirmPassword, message: '两次密码输入不一致' }
          ]"
          left-icon="locked-o"
          clearable
          :password-visible="showPassword"
          @click-icon="togglePasswordVisibility"
        />
        <van-field
          v-model="phone"
          name="phone"
          placeholder="请输入手机号"
          :rules="[
            { required: true, message: '手机号不能为空' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
          ]"
          left-icon="phone-o"
          clearable
        />
        <van-field
          v-model="name"
          name="name"
          placeholder="请输入真实姓名"
          :rules="[{ required: true, message: '请输入真实姓名' }]"
          left-icon="contact-o"
          clearable
        />
        <van-field
          v-model="payPassword"
          type="number"
          name="payPassword"
          placeholder="请输入支付密码（6 位数字）"
          maxlength="6"
          :rules="[
            { required: true, message: '支付密码不能为空' },
            { pattern: /^\d{6}$/, message: '支付密码必须为 6 位数字' }
          ]"
          left-icon="password-o"
          clearable
        />
        <van-field
          v-model="confirmPayPassword"
          type="number"
          name="confirmPayPassword"
          placeholder="请确认支付密码"
          maxlength="6"
          :rules="[
            { required: true, message: '请确认支付密码' },
            { validator: validatePayPassword, message: '两次输入的支付密码不一致' }
          ]"
          left-icon="password-o"
          clearable
        />
        
        <van-button
          type="primary"
          native-type="submit"
          block
          :loading="loading"
          class="register-button"
        >
          注册
        </van-button>
      </van-form>
      
      <view class="login-section">
        <text>已有账号？</text>
        <text class="login-link" @click="goToLogin">立即登录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { userApi } from '@/services/api.js'

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const phone = ref('')
const name = ref('')
const payPassword = ref('')
const confirmPayPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}

function validateConfirmPassword(val) {
  return val === password.value
}

function validatePayPassword(val) {
  return val === payPassword.value
}

// 格式化身份证号显示（加密掩码）
function formatIdCard(value) {
  if (!value) return value
  if (value.length > 6) {
    const last4 = value.slice(-4)
    return value.slice(0, 6) + '********' + last4
  }
  return value
}

async function onSubmit(values) {
  loading.value = true
  try {
    const res = await userApi.register({
      username: values.username,
      password: values.password,
      phone: values.phone,
      name: values.name,
      pay_password: values.payPassword
    })
    
    if (res.success) {
      // 保存用户信息和 token 到本地存储
      if (res.data && res.data.user) {
        uni.setStorageSync('user_token', res.data.token)
        uni.setStorageSync('userToken', res.data.token)
        uni.setStorageSync('userInfo', res.data.user)
        uni.setStorageSync('userId', res.data.user.id)
        uni.setStorageSync('isLoggedIn', true)
        // 保存注册时填写的真实姓名，用于实名认证时校验
        uni.setStorageSync('registeredName', values.name)
      }
      
      uni.showToast({
        title: '注册成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        // 注册成功后引导用户进行实名认证
        uni.showModal({
          title: '实名认证提示',
          content: '为了保障您的购物权益，请先完成实名认证。您可以在"我的"页面中找到实名认证入口。',
          confirmText: '立即认证',
          cancelText: '稍后',
          success: (res) => {
            if (res.confirm) {
              // 跳转到实名认证页面
              uni.navigateTo({
                url: '/pages/user/real-name'
              })
            } else {
              // 返回上一页
              uni.navigateBack({
                delta: 1
              })
            }
          }
        })
      }, 1500)
    } else {
      uni.showToast({
        title: res.message || '注册失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('注册失败:', error)
    uni.showToast({
      title: '注册失败，请检查网络或输入信息',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

function goToLogin() {
  uni.navigateBack({
    delta: 1
  })
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: var(--bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
}

.register-form {
  width: 100%;
  max-width: 400px;
  background: var(--bg-white);
  border-radius: var(--card-radius);
  padding: var(--spacing-xl);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
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

.register-button {
  margin-bottom: var(--spacing-lg);
}

.login-section {
  text-align: center;
  font-size: var(--font-size-md);
  color: var(--text-muted);
}

.login-link {
  color: var(--primary-color);
  margin-left: var(--spacing-xs);
}
</style>
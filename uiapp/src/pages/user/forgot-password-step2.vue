<template>
  <view class="container">
    <view class="forgot-form">
      <view class="logo">
      </view>
      <text class="title">依依大码服装</text>
      <text class="subtitle">忘记密码</text>
      <text class="step-info">Step 2/3</text>
      
      <van-form @submit="onSubmit">
        <van-field
          v-model="name"
          name="name"
          placeholder="请输入您的真实姓名"
          :rules="[{ required: true, message: '姓名不能为空' }]"
          left-icon="contact-o"
          clearable
        />
        
        <view class="form-actions">
          <text class="back-link" @click="goBack">上一步</text>
        </view>
        
        <van-button
          type="primary"
          native-type="submit"
          block
          :loading="loading"
          class="next-button"
        >
          下一步
        </van-button>
      </van-form>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { userApi } from '@/services/api.js'

const name = ref('')
const username = ref('')
const loading = ref(false)

// 获取路由参数
onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options
  username.value = decodeURIComponent(options.username || '')
})

async function onSubmit(values) {
  loading.value = true
  
  const res = await userApi.verifyUserInfo({
    username: username.value,
    name: values.name
  })
  
  console.log('验证API响应:', res)
  
  if (res.success) {
    uni.showToast({
      title: '验证成功',
      icon: 'success'
    })
    
    setTimeout(() => {
      uni.navigateTo({
        url: `/pages/user/forgot-password-step3?userId=${res.data.userId}&username=${encodeURIComponent(username.value)}`
      })
    }, 1500)
  } else {
    uni.showToast({
      title: res.message || '验证失败',
      icon: 'none'
    })
  }
  
  loading.value = false
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

.next-button {
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
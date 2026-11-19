<template>
  <view class="container">
    <view class="forgot-form">
      <view class="logo">
      </view>
      <text class="title">依依大码服装</text>
      <text class="subtitle">忘记密码</text>
      <text class="step-info">Step 1/3</text>
      
      <van-form @submit="onSubmit">
        <van-field
          v-model="username"
          name="username"
          placeholder="请输入用户名"
          :rules="[{ required: true, message: '用户名不能为空' }]"
          left-icon="user-o"
          clearable
        />
        
        <view class="form-actions">
          <text class="back-link" @click="goBack">返回登录</text>
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
import { ref } from 'vue'

const username = ref('')
const loading = ref(false)

function onSubmit(values) {
  loading.value = true
  
  // 模拟验证，实际会在下一步验证
  setTimeout(() => {
    loading.value = false
    uni.navigateTo({
      url: `/pages/user/forgot-password-step2?username=${encodeURIComponent(username.value)}`
    })
  }, 500)
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
<template>
  <div class="register-page">
    <!-- 顶部导航 -->
    <div class="nav-header">
      <span class="back-btn" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <span class="nav-title">用户注册</span>
      <span class="nav-right"></span>
    </div>

    <!-- 注册表单 -->
    <div class="register-form">
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

      <!-- 登录密码 -->
      <div class="form-item">
        <div class="form-label">登录密码</div>
        <div class="form-input">
          <input 
            v-model="formData.password" 
            :type="showPassword ? 'text' : 'password'" 
            placeholder="请设置登录密码（6-20位）"
            maxlength="20"
          />
          <span class="toggle-btn" @click="showPassword = !showPassword">
            {{ showPassword ? '隐藏' : '显示' }}
          </span>
        </div>
      </div>

      <!-- 手机号 -->
      <div class="form-item">
        <div class="form-label">手机号</div>
        <div class="form-input">
          <input 
            v-model="formData.phone" 
            type="tel" 
            placeholder="请输入手机号"
            maxlength="11"
          />
        </div>
      </div>

      <!-- 姓名 -->
      <div class="form-item">
        <div class="form-label">姓名</div>
        <div class="form-input">
          <input 
            v-model="formData.name" 
            type="text" 
            placeholder="请输入真实姓名"
            maxlength="20"
          />
        </div>
      </div>

      <!-- 邮箱 -->
      <div class="form-item">
        <div class="form-label">邮箱</div>
        <div class="form-input">
          <input 
            v-model="formData.email" 
            type="email" 
            placeholder="选填"
            maxlength="50"
          />
        </div>
      </div>

      <!-- 支付密码 -->
      <div class="form-item pay-password-section">
        <div class="form-label">
          支付密码
          <span class="label-tip">（选填，用于支付验证）</span>
        </div>
        <div class="form-input pay-password-input" @click="openPayPasswordModal('set')">
          <input 
            v-model="payPasswordDisplay" 
            type="text" 
            placeholder="设置6位数字支付密码"
            readonly
            disable
          />
          <span class="arrow">›</span>
        </div>
      </div>

      <!-- 支付密码设置提示 -->
      <div class="pay-password-tip" v-if="!formData.pay_password">
        <van-icon name="info-o" />
        <span>不设置支付密码将无法使用支付功能</span>
      </div>
      <div class="pay-password-tip success" v-else>
        <van-icon name="success" />
        <span>支付密码已设置</span>
      </div>

      <!-- 注册按钮 -->
      <div class="form-button">
        <van-button 
          type="primary" 
          block 
          :loading="loading"
          @click="handleRegister"
        >
          注册
        </van-button>
      </div>

      <!-- 已有账号 -->
      <div class="login-link">
        已有账号？<span @click="goToLogin">立即登录</span>
      </div>
    </div>

    <!-- 支付密码设置弹窗 -->
    <PayPassword
      ref="payPasswordRef"
      :visible="payPasswordVisible"
      :title="payPasswordTitle"
      :tip="payPasswordTip"
      @close="closePayPasswordModal"
      @confirm="handlePayPasswordConfirm"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import PayPassword from '@/mobile/components/PayPassword.vue'

const router = useRouter()

// 表单数据
const formData = reactive({
  username: '',
  password: '',
  phone: '',
  name: '',
  email: '',
  pay_password: '' // 支付密码
})

// 支付密码相关
const payPasswordRef = ref(null)
const payPasswordVisible = ref(false)
const payPasswordMode = ref('set') // 'set' | 'confirm'
const payPasswordTitle = ref('设置支付密码')
const payPasswordTip = ref('请设置6位数字支付密码')

// 支付密码显示
const payPasswordDisplay = computed(() => {
  if (formData.pay_password) {
    return '******'
  }
  return ''
})

const showPassword = ref(false)
const loading = ref(false)

// 返回
const goBack = () => {
  router.back()
}

// 跳转登录
const goToLogin = () => {
  router.push('/mobile/login')
}

// 打开支付密码设置弹窗
const openPayPasswordModal = (mode) => {
  payPasswordMode.value = mode
  if (mode === 'set') {
    payPasswordTitle.value = '设置支付密码'
    payPasswordTip.value = '请设置6位数字支付密码'
  }
  payPasswordVisible.value = true
}

// 关闭支付密码弹窗
const closePayPasswordModal = () => {
  payPasswordVisible.value = false
  payPasswordRef.value?.clearPassword()
}

// 支付密码确认
const handlePayPasswordConfirm = (password) => {
  if (payPasswordMode.value === 'set') {
    // 首次设置，需要确认
    payPasswordTitle.value = '确认支付密码'
    payPasswordTip.value = '请再次输入支付密码'
    payPasswordMode.value = 'confirm'
    payPasswordRef.value.clearPassword()
    
    // 保存第一次输入
    payPasswordRef.value.tempPassword = password
  } else if (payPasswordMode.value === 'confirm') {
    // 确认密码
    const firstPassword = payPasswordRef.value?.tempPassword || ''
    
    if (password === firstPassword) {
      formData.pay_password = password
      closePayPasswordModal()
      showToast({ message: '支付密码设置成功', position: 'bottom' })
    } else {
      payPasswordRef.value.setError('两次密码不一致，请重新输入')
      payPasswordMode.value = 'set'
      payPasswordTitle.value = '设置支付密码'
      payPasswordTip.value = '请设置6位数字支付密码'
    }
  }
}

// 验证表单
const validateForm = () => {
  if (!formData.username || formData.username.length < 3) {
    showToast({ message: '用户名至少3个字符', position: 'bottom' })
    return false
  }
  
  if (!formData.password || formData.password.length < 6) {
    showToast({ message: '登录密码至少6位', position: 'bottom' })
    return false
  }
  
  if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
    showToast({ message: '请输入正确的手机号', position: 'bottom' })
    return false
  }
  
  if (!formData.name) {
    showToast({ message: '请输入真实姓名', position: 'bottom' })
    return false
  }
  
  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    showToast({ message: '请输入正确的邮箱', position: 'bottom' })
    return false
  }
  
  return true
}

// 注册
const handleRegister = async () => {
  if (!validateForm()) return
  
  loading.value = true
  
  try {
    const response = await fetch('/api/mobile/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: formData.username,
        password: formData.password,
        phone: formData.phone,
        name: formData.name,
        email: formData.email,
        pay_password: formData.pay_password
      })
    })
    
    const result = await response.json()
    
    if (result.success) {
      showDialog({
        title: '注册成功',
        message: formData.pay_password ? '恭喜您注册成功，支付密码已设置！' : '恭喜您注册成功！',
        confirmButtonText: '立即登录',
        showCancelButton: true,
        cancelButtonText: '返回'
      }).then(() => {
        router.push('/mobile/login')
      }).catch(() => {
        router.back()
      })
    } else {
      showToast({ message: result.message || '注册失败', position: 'bottom' })
    }
  } catch (error) {
    console.error('注册失败:', error)
    showToast({ message: '网络错误，请稍后重试', position: 'bottom' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 44px;
  padding: 0 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
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
  color: #333;
}

.register-form {
  padding: 16px;
}

.form-item {
  background: #fff;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 12px;
}

.form-label {
  font-size: 15px;
  color: #333;
  margin-bottom: 10px;
  font-weight: 500;
}

.label-tip {
  font-size: 12px;
  color: #999;
  font-weight: normal;
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
  font-size: 15px;
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

.pay-password-input {
  background: #f8f8f8;
  border-radius: 6px;
  padding: 10px 12px;
}

.pay-password-input input {
  background: transparent;
  color: #333;
}

.pay-password-input input::placeholder {
  color: #999;
}

.arrow {
  color: #999;
  font-size: 18px;
}

.pay-password-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #fff7e6;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #fa8c16;
}

.pay-password-tip.success {
  background: #f6ffed;
  color: #52c41a;
}

.form-button {
  margin-top: 24px;
}

.login-link {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: #666;
}

.login-link span {
  color: #1989fa;
  margin-left: 4px;
}
</style>

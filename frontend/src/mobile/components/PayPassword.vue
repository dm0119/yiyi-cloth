<template>
  <div class="pay-password-modal" v-if="visible" @click.self="handleClose">
    <div class="pay-password-container">
      <!-- 标题区域 -->
      <div class="password-header">
        <span class="title">{{ title }}</span>
        <span class="close-btn" @click="handleClose">×</span>
      </div>
      
      <!-- 金额显示 -->
      <div class="amount-display" v-if="amount">
        <span class="currency">¥</span>
        <span class="amount">{{ amount }}</span>
      </div>
      
      <!-- 密码提示 -->
      <div class="password-tip">
        {{ tip }}
      </div>
      
      <!-- 密码输入指示器 -->
      <div class="password-dots">
        <div 
          v-for="i in 6" 
          :key="i" 
          class="password-dot"
          :class="{ active: password.length >= i }"
        >
          <span class="dot-inner" v-if="password.length >= i"></span>
        </div>
      </div>
      
      <!-- 错误提示 -->
      <div class="error-message" v-if="errorMsg">
        {{ errorMsg }}
      </div>
      
      <!-- 九宫格键盘 -->
      <div class="keyboard">
        <div class="keyboard-row">
          <div class="keyboard-key" @click="inputPassword('1')">1</div>
          <div class="keyboard-key" @click="inputPassword('2')">2</div>
          <div class="keyboard-key" @click="inputPassword('3')">3</div>
        </div>
        <div class="keyboard-row">
          <div class="keyboard-key" @click="inputPassword('4')">4</div>
          <div class="keyboard-key" @click="inputPassword('5')">5</div>
          <div class="keyboard-key" @click="inputPassword('6')">6</div>
        </div>
        <div class="keyboard-row">
          <div class="keyboard-key" @click="inputPassword('7')">7</div>
          <div class="keyboard-key" @click="inputPassword('8')">8</div>
          <div class="keyboard-key" @click="inputPassword('9')">9</div>
        </div>
        <div class="keyboard-row">
          <div class="keyboard-key key-empty"></div>
          <div class="keyboard-key" @click="inputPassword('0')">0</div>
          <div class="keyboard-key key-delete" @click="deletePassword">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 12H8M8 12L12 16M8 12L12 8M14 4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20H14M18 8L22 12M22 8L18 12" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '请输入支付密码'
  },
  tip: {
    type: String,
    default: ''
  },
  amount: {
    type: [String, Number],
    default: ''
  }
})

const emit = defineEmits(['close', 'confirm', 'input'])

const password = ref('')
const errorMsg = ref('')

// 监听visible变化，重置密码
watch(() => props.visible, (newVal) => {
  if (newVal) {
    password.value = ''
    errorMsg.value = ''
  }
})

// 输入密码
const inputPassword = (num) => {
  if (password.value.length < 6) {
    password.value += num
    errorMsg.value = ''
    
    // 触发输入事件
    emit('input', password.value)
    
    // 如果输入了6位，自动确认
    if (password.value.length === 6) {
      setTimeout(() => {
        emit('confirm', password.value)
      }, 100)
    }
  }
}

// 删除密码
const deletePassword = () => {
  if (password.value.length > 0) {
    password.value = password.value.slice(0, -1)
    errorMsg.value = ''
    emit('input', password.value)
  }
}

// 设置错误信息
const setError = (msg) => {
  errorMsg.value = msg
  password.value = ''
}

// 清空密码
const clearPassword = () => {
  password.value = ''
  errorMsg.value = ''
}

// 关闭弹窗
const handleClose = () => {
  password.value = ''
  errorMsg.value = ''
  emit('close')
}

// 暴露方法给父组件
defineExpose({
  setError,
  clearPassword,
  password
})
</script>

<style scoped>
.pay-password-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.pay-password-container {
  width: 100%;
  background: #fff;
  border-radius: 16px 16px 0 0;
  padding: 20px;
  padding-bottom: env(safe-area-inset-bottom, 20px);
}

.password-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #999;
}

.amount-display {
  text-align: center;
  margin-bottom: 16px;
}

.currency {
  font-size: 20px;
  color: #333;
}

.amount {
  font-size: 32px;
  font-weight: bold;
  color: #333;
}

.password-tip {
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-bottom: 16px;
}

.password-dots {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.password-dot {
  width: 44px;
  height: 44px;
  border: 1px solid #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  transition: all 0.2s;
}

.password-dot.active {
  border-color: #1989fa;
  background: #f0f7ff;
}

.dot-inner {
  width: 12px;
  height: 12px;
  background: #333;
  border-radius: 50%;
}

.error-message {
  text-align: center;
  color: #ee0a24;
  font-size: 14px;
  margin-bottom: 12px;
}

.keyboard {
  width: 100%;
}

.keyboard-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.keyboard-key {
  flex: 1;
  height: 50px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 500;
  color: #333;
  margin: 0 6px;
  cursor: pointer;
  transition: all 0.1s;
  -webkit-tap-highlight-color: transparent;
}

.keyboard-key:active {
  background: #e6e6e6;
}

.key-empty {
  background: transparent;
  border: none;
}

.key-delete {
  background: #f5f5f5;
}

.key-delete:active {
  background: #e0e0e0;
}
</style>

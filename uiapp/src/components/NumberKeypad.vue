<template>
  <view class="number-keypad" v-if="visible">
    <!-- 遮罩层 -->
    <view class="keypad-mask" @click="handleClose"></view>
    
    <!-- 键盘 -->
    <view class="keypad-content">
      <!-- 标题栏 -->
      <view class="keypad-header">
        <text class="keypad-title">{{ title }}</text>
        <view class="keypad-close" @click="handleClose">
          <text class="close-icon">✕</text>
        </view>
      </view>
      
      <!-- 密码显示区 -->
      <view class="password-display">
        <view 
          v-for="i in 6" 
          :key="i" 
          class="password-dot"
          :class="{ active: i <= password.length }"
        >
          <text v-if="i <= password.length && showPassword">
            {{ password[i - 1] }}
          </text>
        </view>
      </view>
      
      <!-- 数字键盘 -->
      <view class="keypad-grid">
        <view 
          v-for="key in keys" 
          :key="key.value"
          class="keypad-key"
          :class="{ 'empty': key.type === 'empty', 'delete': key.type === 'delete' }"
          @click="handleKeyPress(key)"
        >
          <text v-if="key.type === 'number'">{{ key.value }}</text>
          <text v-else-if="key.type === 'delete'" class="delete-icon">⌫</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '请输入支付密码'
  },
  showPassword: {
    type: Boolean,
    default: false // 是否显示明文密码
  }
})

const emit = defineEmits(['close', 'submit', 'update:password'])

const password = ref('')

// 生成键盘布局（1-9 数字 + 0 + 删除键）
const keys = computed(() => {
  const result = []
  // 1-9 数字
  for (let i = 1; i <= 9; i++) {
    result.push({ value: String(i), type: 'number' })
  }
  // 第 10 个位置为空
  result.push({ value: '', type: 'empty' })
  // 0 数字
  result.push({ value: '0', type: 'number' })
  // 删除键
  result.push({ value: 'delete', type: 'delete' })
  return result
})

// 处理按键点击
const handleKeyPress = (key) => {
  if (key.type === 'delete') {
    // 删除最后一位
    if (password.value.length > 0) {
      password.value = password.value.slice(0, -1)
      emit('update:password', password.value)
    }
  } else if (key.type === 'number') {
    // 添加数字（最多 6 位）
    if (password.value.length < 6) {
      password.value += key.value
      emit('update:password', password.value)
      
      // 如果已经输入 6 位，触发表单提交
      if (password.value.length === 6) {
        setTimeout(() => {
          emit('submit', password.value)
        }, 300)
      }
    }
  }
}

// 关闭键盘
const handleClose = () => {
  emit('close')
}

// 重置密码
const resetPassword = () => {
  password.value = ''
  emit('update:password', '')
}

// 暴露方法给父组件
defineExpose({
  resetPassword,
  getPassword: () => password.value
})
</script>

<style scoped>
.number-keypad {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.keypad-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.keypad-content {
  position: relative;
  background: #f6f6f6;
  border-radius: 16px 16px 0 0;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.keypad-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #ffffff;
  border-bottom: 1px solid #e5e5e5;
}

.keypad-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.keypad-close {
  padding: 4px 8px;
  cursor: pointer;
}

.close-icon {
  font-size: 20px;
  color: #999;
}

.password-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px 20px;
  background: #ffffff;
  margin-bottom: 1px;
}

.password-dot {
  width: 40px;
  height: 40px;
  border: 2px solid #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  transition: all 0.2s;
}

.password-dot.active {
  border-color: #07c160;
  background: #07c160;
}

.password-dot text {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
}

.keypad-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: #e5e5e5;
}

.keypad-key {
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  font-size: 22px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: background 0.2s;
}

.keypad-key:active {
  background: #f0f0f0;
}

.keypad-key.empty {
  background: #f6f6f6;
  cursor: default;
}

.keypad-key.delete {
  font-size: 24px;
  color: #333;
}

.delete-icon {
  font-weight: 400;
}
</style>

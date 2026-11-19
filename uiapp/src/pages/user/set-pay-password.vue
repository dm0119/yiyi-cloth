<template>
  <view class="container">
    <van-form @submit="onSubmit" ref="formRef">
      <view class="form-section">
        <view class="section-title">设置支付密码</view>
        <view class="section-desc">支付密码用于支付时验证身份，请设置 6 位数字密码</view>
        
        <van-cell-group inset>
          <van-field
            v-model="payPassword"
            type="number"
            name="payPassword"
            placeholder="请输入 6 位数字支付密码"
            maxlength="6"
            :rules="[
              { required: true, message: '支付密码不能为空' },
              { pattern: /^\d{6}$/, message: '支付密码必须为 6 位数字' }
            ]"
            left-icon="password-o"
            clearable
          />
          <van-field
            v-model="confirmPassword"
            type="number"
            name="confirmPassword"
            placeholder="请再次输入支付密码"
            maxlength="6"
            :rules="[
              { required: true, message: '请确认支付密码' },
              { validator: validatePassword, message: '两次输入的密码不一致' }
            ]"
            left-icon="password-o"
            clearable
          />
        </van-cell-group>
      </view>
      
      <view class="form-section">
        <view class="section-title">修改支付密码</view>
        <view class="section-desc">如果已设置过支付密码，需要验证旧密码</view>
        
        <van-cell-group inset>
          <van-field
            v-model="oldPassword"
            type="number"
            name="oldPassword"
            placeholder="请输入旧支付密码（如修改密码）"
            maxlength="6"
            left-icon="lock-o"
            clearable
          />
        </van-cell-group>
      </view>
      
      <view class="button-section">
        <van-button
          type="primary"
          native-type="submit"
          block
          round
          :loading="loading"
          class="submit-button"
        >
          {{ isSetting ? '设置支付密码' : '修改支付密码' }}
        </van-button>
      </view>
    </van-form>
    
    <!-- 密码键盘 -->
    <NumberKeypad
      v-model:password="currentInputPassword"
      :visible="showKeypad"
      :title="keypadTitle"
      @submit="onKeypadSubmit"
      @close="handleCloseKeypad"
    />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { payPasswordApi } from '@/services/api'
import NumberKeypad from '@/components/NumberKeypad.vue'

const formRef = ref(null)
const payPassword = ref('')
const confirmPassword = ref('')
const oldPassword = ref('')
const loading = ref(false)
const isSetting = ref(true) // true-设置密码，false-修改密码

// 密码键盘相关
const showKeypad = ref(false)
const currentInputPassword = ref('')
const keypadTarget = ref('') // 当前正在输入的字段：'payPassword' | 'confirmPassword' | 'oldPassword'
const keypadTitle = computed(() => {
  if (keypadTarget.value === 'payPassword') return '请输入支付密码'
  if (keypadTarget.value === 'confirmPassword') return '请确认支付密码'
  if (keypadTarget.value === 'oldPassword') return '请输入旧支付密码'
  return '请输入支付密码'
})

// 验证两次密码是否一致
function validatePassword(val) {
  return val === payPassword.value
}

// 检查支付密码状态
onLoad(async () => {
  try {
    const res = await payPasswordApi.getStatus()
    if (res.data?.is_set) {
      isSetting.value = false
    }
  } catch (error) {
    console.error('获取支付密码状态失败:', error)
  }
})

// 打开密码键盘
function openKeypad(target) {
  keypadTarget.value = target
  currentInputPassword.value = ''
  showKeypad.value = true
}

// 处理密码输入完成
function onKeypadSubmit(password) {
  if (keypadTarget.value === 'payPassword') {
    payPassword.value = password
  } else if (keypadTarget.value === 'confirmPassword') {
    confirmPassword.value = password
  } else if (keypadTarget.value === 'oldPassword') {
    oldPassword.value = password
  }
  showKeypad.value = false
}

// 关闭密码键盘
function handleCloseKeypad() {
  showKeypad.value = false
  currentInputPassword.value = ''
}

// 表单提交
async function onSubmit(values) {
  loading.value = true
  
  try {
    // 验证两次密码是否一致
    if (values.payPassword !== values.confirmPassword) {
      throw new Error('两次输入的密码不一致')
    }
    
    // 如果是修改密码，需要验证旧密码
    const oldPasswordValue = isSetting.value ? null : values.oldPassword
    if (!isSetting.value && !oldPasswordValue) {
      throw new Error('修改密码需要输入旧密码')
    }
    
    // 调用 API 设置/修改密码
    const res = await payPasswordApi.set(values.payPassword, oldPasswordValue)
    
    if (res.success) {
      uni.showToast({
        title: isSetting.value ? '支付密码设置成功' : '支付密码修改成功',
        icon: 'success'
      })
      
      // 延迟返回
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      throw new Error(res.message || '操作失败')
    }
  } catch (error) {
    console.error('设置支付密码失败:', error)
    uni.showToast({
      title: error.message || '操作失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px 16px;
}

.form-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  padding-left: 4px;
}

.section-desc {
  font-size: 13px;
  color: #999;
  margin-bottom: 16px;
  padding-left: 4px;
  line-height: 1.5;
}

.button-section {
  margin-top: 32px;
  padding: 0 16px;
}

.submit-button {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}
</style>

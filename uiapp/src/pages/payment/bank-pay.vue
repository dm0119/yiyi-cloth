<template>
  <view class="page-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="nav-back" @click="goBack">
        <text class="nav-back-icon">‹</text>
      </view>
      <text class="nav-title">银行卡支付</text>
      <view class="nav-placeholder"></view>
    </view>

    <view class="payment-content">
      <!-- 订单信息 -->
      <view class="order-info-card">
        <view class="info-row">
          <text class="label">订单金额</text>
          <text class="value">¥{{ amount }}</text>
        </view>
        <view class="info-row">
          <text class="label">订单编号</text>
          <text class="value">{{ orderId }}</text>
        </view>
        <view class="info-row">
          <text class="label">商品信息</text>
          <text class="value">{{ productInfo }}</text>
        </view>
        <view class="info-row">
          <text class="label">支付方式</text>
          <text class="value">银行卡支付</text>
        </view>
      </view>

      <!-- 银行卡选择 -->
      <view class="bank-section">
        <view class="section-header">
          <text class="section-title">选择支付银行卡</text>
          <text class="add-btn" @click="showAddBank = true">+ 管理银行卡</text>
        </view>

        <view class="bank-list">
          <view
            class="bank-item"
            v-for="(bank, index) in bankList"
            :key="index"
            :class="{ selected: selectedBankIndex === index, default: bank.is_default }"
            @click="selectBank(index)"
          >
            <view class="bank-logo" :style="{ background: bank.color }">
              <text class="bank-icon">{{ getBankIcon(bank.name) }}</text>
            </view>
            <view class="bank-info">
              <text class="bank-name">{{ bank.name }}</text>
              <text class="bank-cardNo">{{ formatCardNumber(bank.cardNo) }}</text>
              <text class="bank-holder" v-if="bank.holderName">持卡人：{{ bank.holderName }}</text>
              <text v-if="bank.is_default" class="default-badge">默认</text>
            </view>
            <view class="check-icon" v-if="selectedBankIndex === index">✓</view>
          </view>
        </view>
      </view>

      <!-- 支付密码 -->
      <view class="password-section">
        <view class="section-header">
          <text class="section-title">支付密码</text>
          <text class="forgot-password" @click="showForgotPassword">忘记密码？</text>
        </view>
        
        <view class="password-input-area">
          <!-- 密码显示区 -->
          <view class="password-display">
            <view 
              v-for="i in 6" 
              :key="i"
              class="password-dot"
              :class="{ filled: i <= paymentPassword.length }"
            ></view>
          </view>
          
          <!-- 3x3网格键盘 -->
          <view class="grid-keyboard">
            <view class="keyboard-row" v-for="(row, rowIndex) in keyboardLayout" :key="rowIndex">
              <view 
                v-for="key in row" 
                :key="key"
                class="key-item"
                :class="{ empty: key === '' }"
                @click="handleKeyPress(key)"
              >
                <text>{{ key }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 安全提示 -->
      <view class="security-tip">
        <text class="security-icon">🔒</text>
        <text class="security-text">银行级别安全加密，请放心使用</text>
      </view>
    </view>

    <!-- 底部确认按钮 -->
    <view class="bottom-bar">
      <button 
        class="confirm-btn" 
        :class="{ disabled: !canPay }" 
        @click="handlePayment"
      >
        确认支付 ¥{{ amount }}
      </button>
    </view>

    <!-- 添加银行卡弹窗 -->
    <view class="modal-mask" v-if="showAddBank" @touchmove.stop.prevent="return"></view>
    <view class="modal-container" v-if="showAddBank">
      <view class="modal-header">
        <text class="modal-title">添加银行卡</text>
        <text class="modal-close" @click="showAddBank = false">✕</text>
      </view>
      <view class="modal-content">
        <view class="input-group">
          <text class="input-label">银行卡号</text>
          <input v-model="newBankCardNo" type="number" placeholder="请输入银行卡号" class="input-field" />
        </view>
        <view class="input-group">
          <text class="input-label">银行名称</text>
          <input v-model="newBankName" placeholder="请输入银行名称" class="input-field" />
        </view>
        <view class="input-group">
          <text class="input-label">持卡人姓名</text>
          <input v-model="newBankHolder" placeholder="请输入持卡人姓名" class="input-field" />
        </view>
      </view>
      <view class="modal-footer">
        <button class="modal-btn cancel" @click="showAddBank = false">取消</button>
        <button class="modal-btn confirm" @click="addBankCard">确认添加</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const orderId = ref('')
const amount = ref('0')
const productInfo = ref('')
const selectedBankIndex = ref(-1)
const paymentPassword = ref('')
const showAddBank = ref(false)
const newBankCardNo = ref('')
const newBankName = ref('')
const newBankHolder = ref('')

// 3x3网格键盘布局
const keyboardLayout = ref([
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', '⌫']
])

// 模拟银行卡数据
const bankList = ref([
  { 
    name: '工商银行', 
    cardNo: '6222123412341234', 
    holderName: '张三', 
    color: '#ff6b6b', 
    is_default: true 
  },
  { 
    name: '建设银行', 
    cardNo: '6227567856785678', 
    holderName: '张三', 
    color: '#4ecdc4', 
    is_default: false 
  },
  { 
    name: '招商银行', 
    cardNo: '6225901290129012', 
    holderName: '张三', 
    color: '#45b7d1', 
    is_default: false 
  }
])

const canPay = computed(() => {
  return selectedBankIndex.value !== -1 && paymentPassword.value.length === 6
})

onLoad((options) => {
  orderId.value = options.orderId || ''
  amount.value = options.amount || '0'
  
  // 默认选择第一张银行卡
  if (bankList.value.length > 0) {
    selectedBankIndex.value = 0
  }
})

function selectBank(index) {
  selectedBankIndex.value = index
}

function addBankCard() {
  // 验证银行卡信息
  const validation = validateBankCard(newBankCardNo.value, newBankName.value, newBankHolder.value)
  if (!validation.valid) {
    uni.showToast({ title: validation.message, icon: 'none' })
    return
  }
  
  // 生成随机颜色
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd']
  const randomColor = colors[Math.floor(Math.random() * colors.length)]
  
  const newBank = {
    name: newBankName.value,
    cardNo: newBankCardNo.value,
    holderName: newBankHolder.value,
    color: randomColor,
    is_default: bankList.value.length === 0 // 如果是第一张卡，设为默认
  }
  
  bankList.value.push(newBank)
  selectedBankIndex.value = bankList.value.length - 1
  
  // 清空表单
  newBankCardNo.value = ''
  newBankName.value = ''
  newBankHolder.value = ''
  showAddBank.value = false
  
  uni.showToast({ title: '添加成功', icon: 'success' })
}

async function handlePayment() {
  if (!canPay.value) {
    uni.showToast({ title: '请选择银行卡并输入支付密码', icon: 'none' })
    return
  }
  
  uni.showLoading({
    title: '支付处理中...'
  })
  
  try {
    // 模拟支付处理
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 调用后端支付API
    const userInfo = uni.getStorageSync('userInfo')
    const userId = userInfo?.id
    
    if (!userId) {
      throw new Error('用户未登录')
    }
    
    const selectedBank = bankList.value[selectedBankIndex.value]
    
    // 这里应该调用实际的银行卡支付API
    const response = await uni.request({
      url: 'http://localhost:3000/api/payments/bank-pay',
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        user_id: userId,
        order_id: orderId.value,
        amount: parseFloat(amount.value),
        bank_info: selectedBank,
        payment_password: paymentPassword.value
      }
    })
    
    if (response.data.success) {
      uni.hideLoading()
      uni.showToast({
        title: '支付成功',
        icon: 'success'
      })
      
      // 跳转到支付成功页面
      setTimeout(() => {
        uni.redirectTo({
          url: `/pages/payment/success?orderId=${orderId.value}&amount=${amount.value}`
        })
      }, 1500)
    } else {
      throw new Error(response.data.message || '支付失败')
    }
    
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: error.message || '支付失败',
      icon: 'error'
    })
    console.error('支付失败:', error)
  }
}

// 获取银行图标
function getBankIcon(bankName) {
  const iconMap = {
    '工商银行': '🏦',
    '建设银行': '🏢',
    '招商银行': '💳',
    '农业银行': '🌾',
    '中国银行': '🇨🇳',
    '交通银行': '🚗',
    '邮政储蓄': '📮',
    '中信银行': '🏛️',
    '光大银行': '💡',
    '民生银行': '👥',
    '浦发银行': '🏙️',
    '华夏银行': '🌏'
  }
  return iconMap[bankName] || '🏦'
}

// 格式化银行卡号显示
function formatCardNumber(cardNo) {
  if (!cardNo) return ''
  // 如果是已经脱敏的卡号，直接返回
  if (cardNo.includes('*')) return cardNo
  // 格式化显示：6222 **** **** 1234
  return cardNo.replace(/^(\d{4})\d*(\d{4})$/, '$1 **** **** $2')
}

// 处理键盘按键
function handleKeyPress(key) {
  if (key === '⌫') {
    // 删除最后一位
    if (paymentPassword.value.length > 0) {
      paymentPassword.value = paymentPassword.value.slice(0, -1)
    }
  } else if (key !== '' && paymentPassword.value.length < 6) {
    // 输入数字
    paymentPassword.value += key
    
    // 如果输入满6位，自动验证
    if (paymentPassword.value.length === 6) {
      validatePassword()
    }
  }
}

// 验证密码格式
function validatePassword() {
  if (paymentPassword.value.length !== 6) {
    return false
  }
  
  // 检查是否纯数字
  if (!/^\d+$/.test(paymentPassword.value)) {
    uni.showToast({ title: '密码只能包含数字', icon: 'none' })
    return false
  }
  
  // 检查是否连续数字（简单安全验证）
  const sequences = ['012345', '123456', '234567', '345678', '456789', '567890']
  if (sequences.includes(paymentPassword.value) || 
      sequences.includes(paymentPassword.value.split('').reverse().join(''))) {
    uni.showToast({ title: '密码过于简单，请勿使用连续数字', icon: 'none' })
    return false
  }
  
  // 检查是否重复数字
  if (/^(\d)\1+$/.test(paymentPassword.value)) {
    uni.showToast({ title: '密码过于简单，请勿使用重复数字', icon: 'none' })
    return false
  }
  
  return true
}

// 忘记密码处理
function showForgotPassword() {
  uni.showModal({
    title: '忘记支付密码',
    content: '请联系客服重置支付密码：400-123-4567',
    showCancel: false,
    confirmText: '知道了'
  })
}

// 添加银行卡时的验证
function validateBankCard(cardNo, bankName, holderName) {
  if (!cardNo || !bankName || !holderName) {
    return { valid: false, message: '请填写完整信息' }
  }
  
  // 验证银行卡号格式
  if (!/^\d{16,19}$/.test(cardNo.replace(/\s/g, ''))) {
    return { valid: false, message: '请输入正确的银行卡号' }
  }
  
  // 验证持卡人姓名
  if (!/^[\u4e00-\u9fa5a-zA-Z\s]{2,50}$/.test(holderName)) {
    return { valid: false, message: '请输入正确的持卡人姓名' }
  }
  
  return { valid: true }
}

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-top: 88rpx;
  padding-bottom: 120rpx;
}

.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
  z-index: 1000;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.nav-back {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-back-icon {
  font-size: 40rpx;
  color: #333;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.nav-placeholder {
  width: 60rpx;
  height: 60rpx;
}

.payment-content {
  padding: 20rpx;
}

.order-info-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row .label {
  font-size: 28rpx;
  color: #666;
}

.info-row .value {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.bank-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.add-btn {
  font-size: 28rpx;
  color: #1989fa;
}

.bank-list {
  space-y: 20rpx;
}

.bank-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  transition: all 0.3s;
}

.bank-item.selected {
  border-color: #1989fa;
  background: #f0f8ff;
}

.bank-logo {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.bank-icon {
  font-size: 40rpx;
}

.bank-info {
  flex: 1;
}

.bank-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.bank-cardNo {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 4rpx;
}

.bank-holder {
  font-size: 22rpx;
  color: #999;
  display: block;
}

.default-badge {
  display: inline-block;
  background: #ff6b6b;
  color: #fff;
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 4rpx;
  margin-top: 4rpx;
}

.bank-item.default {
  border-left: 6rpx solid #ff6b6b;
}

.check-icon {
  color: #1989fa;
  font-size: 32rpx;
  font-weight: bold;
}

.password-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.password-input-area {
  margin-top: 20rpx;
}

.password-display {
  display: flex;
  justify-content: center;
  margin-bottom: 40rpx;
}

.password-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background: #e0e0e0;
  margin: 0 10rpx;
  transition: all 0.3s;
}

.password-dot.filled {
  background: #1989fa;
}

.grid-keyboard {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.keyboard-row {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.key-item {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 8rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  transition: all 0.3s;
}

.key-item:active {
  background: #e9ecef;
  transform: scale(0.95);
}

.key-item.empty {
  background: transparent;
}

.forgot-password {
  font-size: 24rpx;
  color: #1989fa;
}

.security-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  background: #fff;
  border-radius: 16rpx;
}

.security-icon {
  margin-right: 10rpx;
  font-size: 24rpx;
}

.security-text {
  font-size: 24rpx;
  color: #666;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.confirm-btn {
  width: 100%;
  height: 80rpx;
  background: #1989fa;
  color: #fff;
  border: none;
  border-radius: 40rpx;
  font-size: 32rpx;
  font-weight: 600;
}

.confirm-btn.disabled {
  background: #ccc;
  color: #999;
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
}

.modal-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600rpx;
  background: #fff;
  border-radius: 16rpx;
  z-index: 2001;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 2rpx solid #eee;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.modal-close {
  font-size: 32rpx;
  color: #999;
}

.modal-content {
  padding: 30rpx;
}

.input-group {
  margin-bottom: 30rpx;
}

.input-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
}

.input-field {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #eee;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.modal-footer {
  display: flex;
  padding: 20rpx 30rpx;
  border-top: 2rpx solid #eee;
}

.modal-btn {
  flex: 1;
  height: 80rpx;
  border: none;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.modal-btn.cancel {
  background: #f5f5f5;
  color: #666;
  margin-right: 20rpx;
}

.modal-btn.confirm {
  background: #1989fa;
  color: #fff;
}
</style>
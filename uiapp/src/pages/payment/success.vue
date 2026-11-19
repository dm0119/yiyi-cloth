<template>
  <view class="page-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="nav-back" @click="goBack">
        <text class="nav-back-icon">‹</text>
      </view>
      <text class="nav-title">支付成功</text>
      <view class="nav-placeholder"></view>
    </view>

    <view class="success-content">
      <!-- 成功图标 -->
      <view class="success-icon">
        <text class="icon">✅</text>
      </view>
      
      <!-- 成功标题 -->
      <text class="success-title">支付成功</text>
      <text class="success-subtitle">感谢您的购买</text>
      
      <!-- 支付详情 -->
      <view class="payment-details">
        <view class="detail-item">
          <text class="label">订单金额</text>
          <text class="value">¥{{ amount }}</text>
        </view>
        <view class="detail-item">
          <text class="label">支付方式</text>
          <text class="value">{{ paymentMethodText }}</text>
        </view>
        <view class="detail-item">
          <text class="label">支付时间</text>
          <text class="value">{{ paymentInfo.payment_time }}</text>
        </view>
        <view class="detail-item">
          <text class="label">订单编号</text>
          <text class="value">{{ orderNo }}</text>
        </view>
      </view>
      
      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="primary-btn" @click="goToOrderDetail">
          查看订单详情
        </button>
        <button class="secondary-btn" @click="continueShopping">
          继续购物
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { orderApi, walletApi } from '@/services/api.js'

const orderId = ref('')
const amount = ref('0')
const orderNo = ref('')
const paymentMethod = ref('')
const paymentMethodText = ref('')
const paymentInfo = ref({
  payment_time: ''
})

onLoad(async (options) => {
  orderId.value = options.orderId || ''
  amount.value = options.amount || '0'
  paymentMethod.value = options.paymentMethod || ''
  
  // 设置支付方式文本
  if (paymentMethod.value === 'alipay') {
    paymentMethodText.value = '支付宝支付'
  } else if (paymentMethod.value === 'wechat') {
    paymentMethodText.value = '微信支付'
  } else {
    paymentMethodText.value = '钱包余额支付'
  }
  
  // 获取订单详情和支付信息
  await loadPaymentDetails()
})

// 加载支付详情
async function loadPaymentDetails() {
  try {
    // 获取订单详情
    const orderResponse = await orderApi.getById(orderId.value)
    if (orderResponse.success && orderResponse.data) {
      const orderData = orderResponse.data
      orderNo.value = orderData.order_no || ''
      
      // 从订单详情中获取支付方式
      if (orderData.payment_method) {
        paymentMethod.value = orderData.payment_method
        if (orderData.payment_method === 'alipay') {
          paymentMethodText.value = '支付宝支付'
        } else if (orderData.payment_method === 'wechat') {
          paymentMethodText.value = '微信支付'
        }
      }
      
      // 获取该订单的交易记录
      const transactionResponse = await orderApi.getTransactions(1, 10)
      if (transactionResponse.success && transactionResponse.data?.list) {
        // 找到对应订单的交易记录
        const transaction = transactionResponse.data.list.find(
          t => t.order_id == orderId.value && t.type === 'payment'
        )
        
        if (transaction) {
          paymentInfo.value.payment_time = formatDate(transaction.transaction_time)
        } else {
          // 如果没有找到交易记录，使用当前时间
          const now = new Date()
          paymentInfo.value.payment_time = formatDateTime(now)
        }
      }
    }
  } catch (error) {
    console.error('加载支付详情失败:', error)
    // 使用默认值
    const now = new Date()
    paymentInfo.value.payment_time = formatDateTime(now)
  }
}

// 格式化日期时间
function formatDateTime(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 格式化数据库时间
function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return formatDateTime(date)
}

// 查看订单详情
function goToOrderDetail() {
  uni.redirectTo({
    url: `/pages/order/detail?id=${orderId.value}`
  })
}

// 继续购物
function continueShopping() {
  uni.switchTab({
    url: '/pages/index/index'
  })
}

// 返回
function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-top: 88rpx;
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
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-back-icon {
  font-size: 40rpx;
  color: #333;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.nav-placeholder {
  width: 40rpx;
}

.success-content {
  padding: 40rpx;
  text-align: center;
}

.success-icon {
  margin: 40rpx 0;
}

.success-icon .icon {
  font-size: 120rpx;
}

.success-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #52c41a;
  margin-bottom: 16rpx;
}

.success-subtitle {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 60rpx;
}

.payment-details {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item .label {
  font-size: 28rpx;
  color: #666;
}

.detail-item .value {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.primary-btn {
  background: #1989fa;
  color: #fff;
  border: none;
  border-radius: 40rpx;
  height: 80rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.secondary-btn {
  background: #fff;
  color: #1989fa;
  border: 2rpx solid #1989fa;
  border-radius: 40rpx;
  height: 80rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.primary-btn:active {
  background: #1578d9;
}

.secondary-btn:active {
  background: #f0f8ff;
}
</style>
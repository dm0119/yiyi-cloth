<template>
  <view class="page-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="nav-back" @click="goBack">
        <text class="nav-back-icon">‹</text>
      </view>
      <text class="nav-title">充值处理中</text>
      <view class="nav-placeholder"></view>
    </view>

    <view class="processing-content">
      <!-- 加载动画 -->
      <view class="loading-animation">
        <view class="spinner"></view>
        <view class="loading-icon">💳</view>
      </view>

      <!-- 状态文字 -->
      <view class="status-text">
        <text class="main-text">充值处理中</text>
        <text class="sub-text">正在与银行通信，请稍候...</text>
      </view>

      <!-- 充值信息 -->
      <view class="recharge-info">
        <view class="info-row">
          <text class="label">充值金额</text>
          <text class="value">¥{{ amount }}</text>
        </view>
        <view class="info-row">
          <text class="label">收款银行</text>
          <text class="value">{{ bankName }}</text>
        </view>
        <view class="info-row">
          <text class="label">订单编号</text>
          <text class="value">{{ orderNo }}</text>
        </view>
      </view>

      <!-- 进度提示 -->
      <view class="progress-tips">
        <view class="progress-step" :class="{ active: step >= 1 }">
          <view class="step-icon">✓</view>
          <text class="step-text">提交订单</text>
        </view>
        <view class="progress-line" :class="{ active: step >= 2 }"></view>
        <view class="progress-step" :class="{ active: step >= 2 }">
          <view class="step-icon">✓</view>
          <text class="step-text">银行处理</text>
        </view>
        <view class="progress-line" :class="{ active: step >= 3 }"></view>
        <view class="progress-step" :class="{ active: step >= 3 }">
          <view class="step-icon">✓</view>
          <text class="step-text">充值完成</text>
        </view>
      </view>

      <!-- 安全提示 -->
      <view class="security-tip">
        <text class="security-icon">🔒</text>
        <text class="security-text">银行级别安全加密，请放心使用</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      amount: '',
      bankIndex: 0,
      bankName: '',
      orderNo: '',
      step: 1,
      processingTime: 0
    }
  },
  onLoad(options) {
    this.amount = options.amount || '0'
    this.bankIndex = parseInt(options.bankIndex) || 0
    this.orderNo = this.generateOrderNo()
    this.getBankName()
    this.startProcessing()
  },
  methods: {
    goBack() {
      try {
        const pages = getCurrentPages()
        if (pages.length > 1) {
          uni.navigateBack()
        } else {
          uni.switchTab({
            url: '/pages/user/index'
          })
        }
      } catch (e) {
        uni.switchTab({
          url: '/pages/user/index'
        })
      }
    },
    generateOrderNo() {
      const now = new Date()
      const timestamp = now.getTime().toString()
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
      return `CZ${timestamp.substring(8)}${random}`
    },
    getBankName() {
      const banks = ['工商银行', '建设银行', '招商银行', '农业银行', '中国银行', '交通银行']
      this.bankName = banks[this.bankIndex] || '工商银行'
    },
    startProcessing() {
      const processingDuration = 3000 + Math.random() * 2000

      setTimeout(() => {
        this.step = 2
      }, 1000)

      setTimeout(() => {
        this.step = 3
      }, 2000)

      setTimeout(() => {
        this.handleResult()
      }, processingDuration)
    },
    handleResult() {
      // 根据银行卡余额判断是否成功（实际应该由后端验证）
      // 这里模拟后端验证逻辑
      const isSuccess = true

      // 记录充值历史
      if (isSuccess) {
        const history = uni.getStorageSync('rechargeHistory') || []
        history.unshift({
          method: this.bankName,
          amount: this.amount,
          time: new Date().toLocaleString('zh-CN'),
          status: 'success',
          orderNo: this.orderNo
        })
        uni.setStorageSync('rechargeHistory', history)
      }

      uni.redirectTo({
        url: `/pages/user/wallet/recharge-result?success=${isSuccess}&amount=${this.amount}&orderNo=${this.orderNo}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #fff;
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

.nav-placeholder {
  width: 60rpx;
  height: 60rpx;
}

.processing-container {
  min-height: 100vh;
  background: #fff;
  padding-top: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.processing-content {
  width: 100%;
  text-align: center;
}

.loading-animation {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  margin: 0 auto 60rpx;
}

.spinner {
  width: 200rpx;
  height: 200rpx;
  border: 6rpx solid #f0f0f0;
  border-top-color: #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 80rpx;
}

.status-text {
  margin-bottom: 60rpx;
}

.main-text {
  display: block;
  font-size: 40rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 16rpx;
}

.sub-text {
  display: block;
  font-size: 28rpx;
  color: #999;
}

.recharge-info {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 40rpx;
  margin-bottom: 60rpx;
  text-align: left;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #e0e0e0;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-size: 28rpx;
  color: #666;
}

.value {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.progress-tips {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 60rpx;
  padding: 0 40rpx;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-icon {
  width: 48rpx;
  height: 48rpx;
  background: #e0e0e0;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  margin-bottom: 12rpx;
}

.progress-step.active .step-icon {
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
}

.step-text {
  font-size: 24rpx;
  color: #999;
}

.progress-step.active .step-text {
  color: #333;
}

.progress-line {
  width: 100rpx;
  height: 4rpx;
  background: #e0e0e0;
  margin-top: 24rpx;
}

.progress-line.active {
  background: #4a90e2;
}

.security-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8f5e9;
  padding: 20rpx 30rpx;
  border-radius: 8rpx;
}

.security-icon {
  margin-right: 12rpx;
  font-size: 32rpx;
}

.security-text {
  font-size: 24rpx;
  color: #2e7d32;
}
</style>

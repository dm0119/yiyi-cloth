<template>
  <view class="page-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="nav-back" @click="goBack">
        <text class="nav-back-icon">‹</text>
      </view>
      <text class="nav-title">提现处理中</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 处理中状态 -->
    <view class="processing-section">
      <view class="loading-animation">
        <view class="spinner"></view>
      </view>
      <text class="processing-title">提现处理中</text>
      <text class="processing-desc">正在与银行通信，请稍候...</text>
    </view>

    <!-- 提现信息 -->
    <view class="info-section">
      <view class="info-item">
        <text class="info-label">提现金额</text>
        <text class="info-value">¥{{ amount }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">收款银行</text>
        <text class="info-value">{{ bankName }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">预计到账时间</text>
        <text class="info-value">2 小时内</text>
      </view>
      <view class="info-item">
        <text class="info-label">交易流水号</text>
        <text class="info-value">{{ transactionId }}</text>
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
      transactionId: '',
      processing: true
    }
  },
  onLoad(options) {
    this.amount = options.amount || '0'
    this.bankIndex = parseInt(options.bankIndex) || 0
    this.transactionId = 'WD' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase()
    
    // 获取银行名称
    const banks = ['工商银行', '建设银行', '招商银行', '农业银行', '中国银行', '交通银行']
    this.bankName = banks[this.bankIndex] || '未知银行'
    
    // 模拟处理过程
    this.processWithdraw()
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
    processWithdraw() {
      // 模拟 3-5 秒处理时间
      const processingTime = Math.random() * 2000 + 3000
      
      setTimeout(() => {
        this.processing = false
        
        // 更新余额
        const currentBalance = parseFloat(uni.getStorageSync('walletBalance') || '0')
        const withdrawAmount = parseFloat(this.amount)
        const newBalance = currentBalance - withdrawAmount
        
        if (newBalance >= 0) {
          uni.setStorageSync('walletBalance', newBalance.toString())
          
          // 保存提现记录
          this.saveWithdrawRecord()
          
          // 跳转到成功页面
          uni.navigateTo({
            url: `/pages/user/wallet/withdraw-result?amount=${this.amount}&bankName=${this.bankName}&transactionId=${this.transactionId}`
          })
        } else {
          uni.showToast({
            title: '余额不足',
            icon: 'none'
          })
        }
      }, processingTime)
    },
    saveWithdrawRecord() {
      const records = uni.getStorageSync('withdrawHistory') || []
      const now = new Date()
      const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      
      records.unshift({
        amount: parseFloat(this.amount),
        bankName: this.bankName,
        time: timeStr,
        transactionId: this.transactionId,
        status: 'success'
      })
      
      uni.setStorageSync('withdrawHistory', records)
    }
  }
}
</script>

<style lang="scss" scoped>
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

.nav-placeholder {
  width: 60rpx;
  height: 60rpx;
}

.processing-section {
  background: #fff;
  padding: 120rpx 40rpx;
  text-align: center;
}

.loading-animation {
  margin-bottom: 60rpx;
}

.spinner {
  width: 120rpx;
  height: 120rpx;
  border: 8rpx solid #f3f3f3;
  border-top: 8rpx solid #ff6b6b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.processing-title {
  display: block;
  font-size: 40rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.processing-desc {
  display: block;
  font-size: 28rpx;
  color: #999;
}

.info-section {
  background: #fff;
  margin-top: 30rpx;
  padding: 40rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 28rpx;
  color: #666;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
}
</style>

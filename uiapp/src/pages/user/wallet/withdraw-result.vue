<template>
  <view class="page-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="nav-back" @click="goBack">
        <text class="nav-back-icon">‹</text>
      </view>
      <text class="nav-title">提现结果</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 成功状态 -->
    <view class="result-section">
      <view class="success-icon">✓</view>
      <text class="result-title">提现申请成功</text>
      <text class="result-desc">预计 2 小时内到账，请耐心等待</text>
    </view>

    <!-- 提现详情 -->
    <view class="detail-section">
      <view class="detail-title">提现详情</view>
      <view class="detail-list">
        <view class="detail-item">
          <text class="detail-label">提现金额</text>
          <text class="detail-amount">-¥{{ amount }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">收款银行</text>
          <text class="detail-value">{{ bankName }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">交易流水号</text>
          <text class="detail-value">{{ transactionId }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">申请时间</text>
          <text class="detail-value">{{ currentTime }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">预计到账时间</text>
          <text class="detail-value">2 小时内</text>
        </view>
      </view>
    </view>

    <!-- 温馨提示 -->
    <view class="tips-section">
      <view class="tips-title">温馨提示</view>
      <view class="tips-list">
        <view class="tip-item">
          <text class="tip-icon">ℹ</text>
          <text>如遇节假日，到账时间可能顺延</text>
        </view>
        <view class="tip-item">
          <text class="tip-icon">ℹ</text>
          <text>请确保银行卡信息填写正确</text>
        </view>
        <view class="tip-item">
          <text class="tip-icon">ℹ</text>
          <text>如有疑问，请联系客服</text>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <button class="back-btn" @click="goToWallet">返回钱包</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      amount: '',
      bankName: '',
      transactionId: '',
      currentTime: ''
    }
  },
  onLoad(options) {
    this.amount = options.amount || '0'
    this.bankName = options.bankName || ''
    this.transactionId = options.transactionId || ''
    
    const now = new Date()
    this.currentTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
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
    goToWallet() {
      uni.navigateBack({
        delta: 3
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 160rpx;
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

.result-section {
  background: #fff;
  padding: 120rpx 40rpx 80rpx;
  text-align: center;
}

.success-icon {
  width: 160rpx;
  height: 160rpx;
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80rpx;
  margin: 0 auto 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(74, 144, 226, 0.3);
}

.result-title {
  display: block;
  font-size: 40rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.result-desc {
  display: block;
  font-size: 28rpx;
  color: #999;
}

.detail-section {
  background: #fff;
  margin-top: 30rpx;
  padding: 40rpx;
}

.detail-title {
  font-size: 30rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 30rpx;
}

.detail-list {
  display: flex;
  flex-direction: column;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 28rpx;
  color: #666;
}

.detail-amount {
  font-size: 36rpx;
  color: #ff6b6b;
  font-weight: bold;
}

.detail-value {
  font-size: 28rpx;
  color: #333;
}

.tips-section {
  background: #fff;
  margin-top: 30rpx;
  padding: 40rpx;
}

.tips-title {
  font-size: 30rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 30rpx;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.tip-item {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #666;
}

.tip-icon {
  color: #4a90e2;
  margin-right: 12rpx;
  font-size: 28rpx;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 30rpx 40rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.back-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(74, 144, 226, 0.3);
}
</style>

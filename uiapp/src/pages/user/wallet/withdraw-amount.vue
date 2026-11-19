<template>
  <view class="page-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="nav-back" @click="goBack">
        <text class="nav-back-icon">‹</text>
      </view>
      <text class="nav-title">输入提现金额</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 金额输入区 -->
    <view class="amount-section">
      <view class="amount-label">提现金额</view>
      <view class="amount-input-wrapper">
        <text class="currency-symbol">¥</text>
        <input
          class="amount-input"
          v-model="amount"
          placeholder="请输入金额"
          :maxlength="10"
          type="digit"
        />
      </view>
      <view class="amount-range">
        <text>单笔最低 10 元，最高 5000 元</text>
      </view>
      <view class="balance-tip">
        <text>当前余额：¥{{ currentBalance.toFixed(2) }}</text>
      </view>
    </view>

    <!-- 常用金额快捷选择 -->
    <view class="quick-amounts">
      <view class="section-title">常用金额</view>
      <view class="amount-grid">
        <view
          class="amount-item"
          v-for="item in quickAmounts"
          :key="item"
          :class="{ active: amount === item.toString() }"
          @click="selectAmount(item)"
        >
          <text>¥{{ item }}</text>
        </view>
      </view>
    </view>

    

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <view class="current-amount">
        <text class="label">提现金额：</text>
        <text class="value">¥{{ amount || '0.00' }}</text>
      </view>
      <button class="confirm-btn" :class="{ disabled: !isValidAmount }" @click="handleConfirm">
        下一步
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      amount: '',
      quickAmounts: [50, 100, 200, 500, 1000, 2000],
      minAmount: 10,
      maxAmount: 5000,
      currentBalance: 0
    }
  },
  onLoad() {
    this.loadBalance()
  },
  computed: {
    isValidAmount() {
      const num = parseFloat(this.amount)
      return !isNaN(num) && 
             num >= this.minAmount && 
             num <= this.maxAmount &&
             num <= this.currentBalance
    }
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
    loadBalance() {
      const balance = uni.getStorageSync('walletBalance')
      if (balance) {
        this.currentBalance = parseFloat(balance)
      }
    },
    selectAmount(value) {
      this.amount = value.toString()
    },
    handleConfirm() {
      if (!this.isValidAmount) {
        const num = parseFloat(this.amount)
        if (isNaN(num) || num < this.minAmount) {
          uni.showToast({
            title: `最低提现${this.minAmount}元`,
            icon: 'none'
          })
        } else if (num > this.currentBalance) {
          uni.showToast({
            title: '余额不足',
            icon: 'none'
          })
        } else {
          uni.showToast({
            title: `最高提现${this.maxAmount}元`,
            icon: 'none'
          })
        }
        return
      }

      uni.navigateTo({
        url: `/pages/user/wallet/withdraw-bank?amount=${this.amount}`
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

.amount-section {
  background: #fff;
  padding: 60rpx 40rpx;
  text-align: center;
}

.amount-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 40rpx;
}

.amount-input-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.currency-symbol {
  font-size: 48rpx;
  color: #ff6b6b;
  font-weight: bold;
  margin-right: 10rpx;
}

.amount-input {
  font-size: 80rpx;
  font-weight: bold;
  color: #333;
  width: 500rpx;
  text-align: left;
}

.amount-range {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.balance-tip {
  font-size: 26rpx;
  color: #4a90e2;
  font-weight: 600;
}

.quick-amounts {
  background: #fff;
  margin-top: 30rpx;
  padding: 40rpx;
}

.section-title {
  font-size: 30rpx;
  color: #333;
  margin-bottom: 30rpx;
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.amount-item {
  padding: 30rpx 0;
  background: #f8f9fa;
  border-radius: 12rpx;
  text-align: center;
  font-size: 30rpx;
  color: #333;
}

.amount-item.active {
  background: white;
  color: #000000;
  box-shadow: 0 4rpx 12rpx rgba(74, 144, 226, 0.3);
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 40rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.current-amount {
  display: flex;
  align-items: center;
}

.label {
  font-size: 26rpx;
  color: #666;
  margin-right: 10rpx;
}

.value {
  font-size: 36rpx;
  color: #333;
  font-weight: bold;
}

.confirm-btn {
  width: 240rpx;
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

.confirm-btn.disabled {
  background: #ccc;
  opacity: 0.6;
}
</style>

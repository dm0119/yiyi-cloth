<template>
  <view class="page-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="nav-back" @click="goBack">
        <text class="nav-back-icon">‹</text>
      </view>
      <text class="nav-title">输入充值金额</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 金额输入区 -->
    <view class="amount-section">
      <view class="amount-label">充值金额</view>
      <view class="amount-input-wrapper">
        <text class="currency-symbol">¥</text>
        <input
          class="amount-input"
          type="digit"
          v-model="amount"
          placeholder="请输入金额"
          :maxlength="10"
        />
      </view>
      <view class="amount-range">
        <text>单笔最低 10 元，最高 5000 元</text>
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
        <text class="label">充值金额：</text>
        <text class="value">¥{{ amount || '0.00' }}</text>
      </view>
      <button class="confirm-btn" :class="{ disabled: !isValidAmount }" @click="handleConfirm">
        下一步
      </button>
    </view>
  </view>
</template>

<script>
import { walletApi } from '@/services/api.js'

export default {
  data() {
    return {
      amount: '',
      quickAmounts: [50, 100, 200, 500, 1000, 2000],
      minAmount: 10,
      maxAmount: 5000
    }
  },
  computed: {
    isValidAmount() {
      const num = parseFloat(this.amount)
      return !isNaN(num) && num >= this.minAmount && num <= this.maxAmount
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
            url: '/pages/index/index'
          })
        }
      } catch (e) {
        uni.switchTab({
          url: '/pages/index/index'
        })
      }
    },
    selectAmount(value) {
      this.amount = value.toString()
    },
    handleConfirm() {
      if (!this.isValidAmount) {
        uni.showToast({
          title: `请输入${this.minAmount}-${this.maxAmount}元的金额`,
          icon: 'none'
        })
        return
      }

      // 跳转到银行卡选择页面
      uni.navigateTo({
        url: `/pages/user/wallet/recharge-bank?amount=${this.amount}`
      })
    },
    
    async handleRecharge() {
      try {
        const userInfo = uni.getStorageSync('userInfo')
        const userId = userInfo?.id
        
        if (!userId) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          })
          return
        }
        
        // 显示加载中
        uni.showLoading({
          title: '充值中...'
        })
        
        const amount = parseFloat(this.amount).toFixed(2)
        const response = await walletApi.recharge(userId, amount, '余额充值')
        
        uni.hideLoading()
        
        if (response.success) {
          // 充值成功
          uni.showToast({
            title: '充值成功',
            icon: 'success'
          })
          
          // 记录充值历史
          this.recordRechargeHistory(amount)
          
          // 延迟返回钱包页面
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({
            title: response.message || '充值失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        console.error('充值异常:', error)
        uni.showToast({
          title: '充值异常，请重试',
          icon: 'none'
        })
      }
    },
    
    recordRechargeHistory(amount) {
      const history = uni.getStorageSync('rechargeHistory') || []
      const newRecord = {
        method: '余额充值',
        amount: amount,
        time: new Date().toLocaleString('zh-CN'),
        status: 'success'
      }
      
      history.unshift(newRecord)
      uni.setStorageSync('rechargeHistory', history)
    }
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 160rpx;
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

.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 160rpx;
  padding-top: 88rpx;
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

.tips-section {
  background: #fff;
  margin-top: 30rpx;
  padding: 40rpx;
}

.tips-title {
  font-size: 30rpx;
  color: #333;
  margin-bottom: 20rpx;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.tip-item {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #666;
}

.tip-icon {
  color: #4caf50;
  margin-right: 12rpx;
  font-weight: bold;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 30rpx 40rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.current-amount {
  display: flex;
  flex-direction: column;
}

.current-amount .label {
  font-size: 24rpx;
  color: #999;
}

.current-amount .value {
  font-size: 36rpx;
  font-weight: bold;
  color: #ff6b6b;
}

.confirm-btn {
  width: 300rpx;
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

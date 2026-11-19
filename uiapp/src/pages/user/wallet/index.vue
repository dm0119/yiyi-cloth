<template>
  <view class="page-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="nav-back" @click="goBack">
        <text class="nav-back-icon">‹</text>
      </view>
      <text class="nav-title">我的钱包</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 钱包余额卡片 -->
    <view class="balance-card">
      <view class="balance-label">钱包余额</view>
      <view class="balance-amount">¥{{ (balance || 0).toFixed(2) }}</view>
      
      <!-- 操作按钮组 -->
      <view class="action-buttons">
        <button class="action-btn recharge-btn" @click="goToRecharge">
          <text>充值</text>
        </button>
        <button class="action-btn withdraw-btn" @click="goToWithdraw">
          <text>提现</text>
        </button>
      </view>
    </view>

    <!-- 充值历史 -->
    <view class="history-section">
      <view class="section-title">充值记录</view>
      <view class="history-list" v-if="historyList.length > 0">
        <view class="history-item" v-for="(item, index) in historyList" :key="index">
          <view class="history-info">
            <text class="history-method">{{ item.method }}</text>
            <text class="history-time">{{ item.time }}</text>
          </view>
          <view class="history-amount" :class="item.status">
            <text>+¥{{ Number(item.amount).toFixed(2) }}</text>
          </view>
        </view>
      </view>
      <view class="empty-history" v-else>
        <text>暂无充值记录</text>
      </view>
    </view>
  </view>
</template>

<script>
import { walletApi } from '@/services/api.js'

export default {
  data() {
    return {
      balance: 0,
      historyList: []
    }
  },
  onLoad() {
    this.loadHistory()
    this.loadBalance()
  },
  onShow() {
    // 强制刷新数据，确保显示最新的余额和充值记录
    this.loadHistory()
    this.loadBalance()
  },
  methods: {
    async loadBalance() {
      try {
        const userInfo = uni.getStorageSync('userInfo')
        const userId = userInfo?.id
        
        if (!userId) {
          console.log('用户未登录，无法获取钱包余额')
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          })
          return
        }
        
        const response = await walletApi.getWallet(userId)
        
        if (response.success) {
          this.balance = Number(response.data.balance)
          // 更新本地存储
          uni.setStorageSync('walletBalance', this.balance)
        } else {
          console.warn('获取钱包余额失败:', response.message)
          uni.showToast({
            title: response.message || '获取余额失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('获取钱包余额异常:', error)
        uni.showToast({
          title: '网络异常，请重试',
          icon: 'none'
        })
      }
    },
    loadHistory() {
      const history = uni.getStorageSync('rechargeHistory') || []
      this.historyList = history
    },
    goBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
      } else {
        // 如果是第一页，返回到个人中心
        uni.switchTab({
          url: '/pages/user/index'
        })
      }
    },
    goToRecharge() {
      uni.navigateTo({
        url: '/pages/user/wallet/recharge-amount'
      })
    },
    goToWithdraw() {
      uni.navigateTo({
        url: '/pages/user/wallet/withdraw-amount'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
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

.wallet-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
  padding-top: 88rpx;
}

.balance-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 60rpx 40rpx;
  color: #333;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.balance-label {
  font-size: 28rpx;
  opacity: 0.9;
}

.balance-amount {
  font-size: 72rpx;
  font-weight: bold;
  margin: 20rpx 0 60rpx;
}

.action-buttons {
  display: flex;
  gap: 30rpx;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 0;
  border-radius: 12rpx;
  font-size: 30rpx;
  border: none;
}

.recharge-btn {
  background: white;
  color: #000000;
  box-shadow: 0 4rpx 12rpx rgba(74, 144, 226, 0.3);
}

.withdraw-btn {
  background: #fff;
  color: #000000;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.btn-icon {
  margin-right: 10rpx;
  font-size: 32rpx;
}

.history-section {
  background: #fff;
  margin-top: 30rpx;
  padding: 40rpx;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.history-info {
  display: flex;
  flex-direction: column;
}

.history-method {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.history-time {
  font-size: 24rpx;
  color: #999;
}

.history-amount {
  font-size: 28rpx;
  font-weight: bold;
  color: #4caf50;
}

.empty-history {
  text-align: center;
  padding: 60rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style>

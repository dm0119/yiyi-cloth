<template>
  <view class="container">
    <view class="transactions-list" v-if="transactions.length > 0">
      <view 
        class="transaction-item" 
        v-for="item in transactions" 
        :key="item.id"
        @click="goToOrderDetail(item.order_id)"
      >
        <view class="transaction-info">
          <view class="transaction-type">
            <van-tag :type="item.type === 'payment' ? 'success' : 'warning'">
              {{ item.type === 'payment' ? '支出' : '退款' }}
            </van-tag>
            <text class="transaction-desc">{{ item.description }}</text>
          </view>
          <view class="transaction-meta">
            <text class="transaction-time">{{ formatTime(item.transaction_time) }}</text>
            <text class="transaction-method" v-if="item.payment_method">
              {{ getPaymentMethodName(item.payment_method) }}
            </text>
          </view>
        </view>
        <view class="transaction-amount" :class="item.type === 'payment' ? 'negative' : 'positive'">
          {{ item.type === 'payment' ? '-' : '+' }}¥{{ parseFloat(item.amount).toFixed(2) }}
        </view>
      </view>
    </view>

    <van-empty 
      v-else 
      description="暂无交易记录" 
      :image-size="160"
    />

    <view class="loading-status" v-if="loading">
      <van-loading size="24px">加载中...</van-loading>
    </view>

    <view class="no-more" v-if="noMore">
      <van-divider>没有更多了</van-divider>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { orderApi } from '@/services/api'

const transactions = ref([])
const loading = ref(false)
const noMore = ref(false)
const page = ref(1)
const limit = 20

onMounted(() => {
  loadTransactions()
})

async function loadTransactions() {
  if (loading.value || noMore.value) return
  
  loading.value = true
  try {
    console.log('加载交易记录，page:', page.value)
    const res = await orderApi.getTransactions(page.value, limit)
    console.log('交易记录响应:', res)
    if (res.success) {
      const newList = res.data?.list || []
      console.log('新交易记录数量:', newList.length)
      if (newList.length < limit) {
        noMore.value = true
      }
      transactions.value = [...transactions.value, ...newList]
      page.value++
    } else {
      console.error('交易记录 API 返回失败:', res)
      uni.showToast({
        title: res.message || '加载失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('加载交易记录异常:', error)
    uni.showToast({
      title: error.message || '加载失败',
      icon: 'none',
      duration: 2000
    })
  } finally {
    loading.value = false
  }
}

function formatTime(time) {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) { // 1 分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1 小时内
    return Math.floor(diff / 60000) + '分钟前'
  } else if (diff < 86400000) { // 24 小时内
    return Math.floor(diff / 3600000) + '小时前'
  } else if (diff < 604800000) { // 7 天内
    return Math.floor(diff / 86400000) + '天前'
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
}

function getPaymentMethodName(method) {
  const names = {
    'alipay': '支付宝',
    'wechat': '微信支付',
    'original': '原路退回'
  }
  return names[method] || method
}

function goToOrderDetail(orderId) {
  if (orderId) {
    uni.navigateTo({
      url: `/pages/order/detail?id=${orderId}`
    })
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.transactions-list {
  margin-bottom: 20rpx;
}

.transaction-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.transaction-info {
  flex: 1;
}

.transaction-type {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.transaction-desc {
  font-size: 28rpx;
  color: #333;
  margin-left: 16rpx;
  flex: 1;
}

.transaction-meta {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #999;
}

.transaction-method {
  margin-left: 20rpx;
  padding-left: 20rpx;
  border-left: 1rpx solid #e5e5e5;
}

.transaction-amount {
  font-size: 32rpx;
  font-weight: 600;
  flex-shrink: 0;
}

.transaction-amount.negative {
  color: #ff6b6b;
}

.transaction-amount.positive {
  color: #52c41a;
}

.loading-status,
.no-more {
  text-align: center;
  padding: 30rpx 0;
}
</style>

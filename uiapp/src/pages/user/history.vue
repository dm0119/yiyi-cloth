<template>
  <view class="container">
    <view class="header">
      <text class="header-title">浏览记录</text>
      <text class="clear-btn" v-if="historyList.length > 0" @click="showClearConfirm">清空</text>
    </view>

    <view v-if="loading" class="loading-state">
      <van-loading type="spinner" vertical>加载中...</van-loading>
    </view>

    <van-empty v-else-if="historyList.length === 0" description="暂无浏览记录" />

    <view v-else class="history-list">
      <view v-for="item in historyList" :key="item.id" class="history-item" @click="goToProductDetail(item.product_id)">
        <image :src="item.image" mode="aspectFill" class="product-image" />
        <view class="product-info">
          <text class="product-name">{{ item.product_name }}</text>
          <view class="product-meta">
            <text class="product-price">¥{{ item.price.toFixed(2) }}</text>
            <text class="viewed-time">{{ formatTime(item.viewed_at) }}</text>
          </view>
        </view>
        <van-icon name="arrow" class="arrow-icon" />
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { historyApi } from '@/services/api.js'
import { clearBrowseHistory, getBrowseHistory } from '@/utils/historyUtil.js'

const loading = ref(false)
const historyList = ref([])

onMounted(() => {
  loadHistory()
})

onShow(() => {
  loadHistory()
})

async function loadHistory() {
  loading.value = true
  try {
    // 先加载本地浏览记录
    const localHistory = getBrowseHistory()
    historyList.value = localHistory
    
    // 如果用户已登录，从服务器同步浏览记录
    const userInfo = uni.getStorageSync('userInfo')
    if (userInfo && userInfo.id) {
      await syncHistoryFromServer(userInfo.id)
    }
  } catch (error) {
    console.error('加载浏览记录失败:', error)
  } finally {
    loading.value = false
  }
}

async function syncHistoryFromServer(userId) {
  try {
    const res = await historyApi.getByUser(userId)
    if (res.success && res.data) {
      // 将服务器的浏览记录合并到本地
      const serverHistory = res.data.map(item => ({
        id: item.id.toString(),
        product_id: item.product_id,
        product_name: item.product_name,
        price: item.price,
        image: item.image,
        viewed_at: item.viewed_at
      }))
      
      // 合并本地和服务器的浏览记录，去重并按时间排序
      const allHistory = [...historyList.value, ...serverHistory]
      const uniqueHistory = deduplicateHistory(allHistory)
      historyList.value = uniqueHistory.sort((a, b) => new Date(b.viewed_at) - new Date(a.viewed_at))
      
      // 保存合并后的记录到本地
      uni.setStorageSync('browseHistory', historyList.value)
    }
  } catch (error) {
    console.error('从服务器同步浏览记录失败:', error)
  }
}

function deduplicateHistory(history) {
  const seen = new Set()
  return history.filter(item => {
    const key = item.product_id
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function showClearConfirm() {
  uni.showModal({
    title: '确认清空',
    content: '确定要清空所有浏览记录吗？',
    success: (res) => {
      if (res.confirm) {
        clearHistory()
      }
    }
  })
}

async function clearHistory() {
  try {
    // 清空本地浏览记录
    clearBrowseHistory()
    historyList.value = []
    
    // 如果用户已登录，同步清空服务器的浏览记录
    const userInfo = uni.getStorageSync('userInfo')
    if (userInfo && userInfo.id) {
      await historyApi.clear(userInfo.id)
    }
    
    uni.showToast({
      title: '清空成功',
      icon: 'success'
    })
  } catch (error) {
    console.error('清空浏览记录失败:', error)
    uni.showToast({
      title: '清空失败',
      icon: 'none'
    })
  }
}

function goToProductDetail(productId) {
  uni.navigateTo({
    url: `/pages/product/detail?id=${productId}`
  })
}

function formatTime(timeStr) {
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) {
    return '刚刚'
  } else if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.clear-btn {
  font-size: 28rpx;
  color: #999;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  background-color: #f0f0f0;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
}

.history-list {
  padding: 16rpx;
}

.history-item {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 12rpx;
  padding: 16rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.product-image {
  width: 140rpx;
  height: 140rpx;
  border-radius: 8rpx;
  margin-right: 16rpx;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 32rpx;
  font-weight: 600;
  color: #ff4d4f;
}

.viewed-time {
  font-size: 24rpx;
  color: #999;
}

.arrow-icon {
  font-size: 32rpx;
  color: #999;
  margin-left: 12rpx;
}
</style>
<template>
  <view class="container">
    <view class="header">
      <text class="title">社区</text>
      <view class="right">
        <van-button type="primary" size="small" @click="goToCreate">发布</van-button>
      </view>
    </view>
    
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <view 
        v-for="discussion in discussions" 
        :key="discussion.id"
        class="discussion-item"
        @click="goToDetail(discussion.id)"
      >
        <view class="discussion-header">
          <text class="user-name">{{ discussion.user_name }}</text>
          <text class="create-time">{{ formatTime(discussion.created_at) }}</text>
        </view>
        <view class="discussion-content">
          <text class="title">{{ discussion.title }}</text>
          <text class="content">{{ discussion.content }}</text>
          <view v-if="discussion.images && discussion.images.length > 0" class="image-list">
            <image 
              v-for="(image, index) in discussion.images.slice(0, 3)" 
              :key="index"
              :src="getImageUrl(image)"
              class="image-item"
              mode="aspectFill"
            />
          </view>
          <view v-if="discussion.products && discussion.products.length > 0" class="product-list">
            <view 
              v-for="product in discussion.products.slice(0, 3)" 
              :key="product.id"
              class="product-item"
            >
              <image :src="getImageUrl(product.image)" class="product-image" mode="aspectFill" />
              <text class="product-name">{{ product.name }}</text>
              <text class="product-price">¥{{ (parseFloat(product.price) || 0).toFixed(2) }}</text>
            </view>
          </view>
        </view>
        <view class="discussion-footer">
          <view class="stat">
            <van-icon name="eye-o" size="16" />
            <text>{{ discussion.view_count || 0 }}</text>
          </view>
          <view class="stat">
            <van-icon name="chat-o" size="16" />
            <text>{{ discussion.comment_count || 0 }}</text>
          </view>
        </view>
      </view>
    </van-list>
    
    <van-loading v-if="loading && discussions.length === 0" type="spinner" vertical>加载中...</van-loading>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { discussionApi } from '@/services/api.js'

const API_BASE = 'http://localhost:3000'

function getImageUrl(url) {
  if (!url) return 'https://via.placeholder.com/100x100'
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  if (url.startsWith('/uploads/')) {
    return `${API_BASE}${url}`
  }
  return url
}

const discussions = ref([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)

function formatTime(time) {
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function loadDiscussions() {
  try {
    const res = await discussionApi.getDiscussions()
    if (res.success && res.data) {
      discussions.value = res.data
    }
  } catch (error) {
    console.error('加载讨论列表失败:', error)
  }
}

async function onLoad() {
  // 模拟加载更多
  setTimeout(() => {
    loading.value = false
    finished.value = true
  }, 1000)
}

function goToDetail(id) {
  uni.navigateTo({
    url: `/pages/discussion/detail?id=${id}`
  })
}

function goToCreate() {
  uni.navigateTo({
    url: '/pages/discussion/create'
  })
}

onMounted(() => {
  loadDiscussions()
})
</script>

<style scoped>
  /* CSS变量定义 */
  :root {
    --primary-color: #ff6b6b;
    --primary-hover: #ee5a5a;
    --secondary-color: #4ecdc4;
    --success-color: #52c41a;
    --warning-color: #faad14;
    --error-color: #ff4d4f;
    --text-primary: #333333;
    --text-secondary: #666666;
    --text-muted: #999999;
    --bg-color: #f8f9fa;
    --bg-white: #ffffff;
    --border-color: #e8e8e8;
    --card-radius: 12px;
    --button-radius: 8px;
    --font-size-xs: 22rpx;
    --font-size-sm: 24rpx;
    --font-size-md: 28rpx;
    --font-size-lg: 32rpx;
    --font-size-xl: 36rpx;
    --font-size-xxl: 40rpx;
    --spacing-xs: 10rpx;
    --spacing-sm: 16rpx;
    --spacing-md: 24rpx;
    --spacing-lg: 32rpx;
    --spacing-xl: 48rpx;
    --shadow-sm: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
    --shadow-md: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
    --transition-fast: 0.2s ease;
  }
  
  /* 页面基础样式 */
  page {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: var(--font-size-md);
    color: var(--text-primary);
    background: linear-gradient(to bottom, #ffb6c1 0%, #fffaf0 100%);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  .container {
    min-height: 100vh;
    background: var(--bg-color);
  }

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--bg-white);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 10;
}

.title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
}

.right {
  display: flex;
  align-items: center;
}

.discussion-item {
  background: var(--bg-white);
  margin: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--card-radius);
  box-shadow: var(--shadow-sm);
}

.discussion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.user-name {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--text-primary);
}

.create-time {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.discussion-content {
  margin-bottom: var(--spacing-sm);
}

.title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.content {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: var(--spacing-sm);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.image-list {
  display: flex;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
}

.image-item {
  width: 100rpx;
  height: 100rpx;
  border-radius: var(--card-radius);
}

.product-list {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  flex-wrap: wrap;
}

.product-item {
  width: 120rpx;
  background: var(--bg-color);
  border-radius: var(--card-radius);
  padding: var(--spacing-xs);
}

.product-image {
  width: 100%;
  height: 100rpx;
  border-radius: var(--card-radius);
  margin-bottom: var(--spacing-xs);
}

.product-name {
  font-size: var(--font-size-xs);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  font-size: var(--font-size-xs);
  color: var(--primary-color);
  font-weight: 500;
}

.discussion-footer {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.stat {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}
</style>
<template>
  <view class="zones-container">
    <view 
      v-for="zone in zones" 
      :key="zone.id"
      class="section"
    >
      <view class="section-header">
        <text class="section-title">{{ zone.name }}</text>
      </view>
      <view 
        class="zone-item"
        @click="goToZoneDetail(zone.id)"
      >
        <image 
          :src="getImageUrl(zone.cover_image)"
          class="zone-image"
          mode="aspectFill"
        />
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { zoneApi } from '@/services/api.js'

const API_BASE = 'http://localhost:3000'

const zones = ref([])

function getImageUrl(url) {
  if (!url) return 'https://via.placeholder.com/300x200'
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `${API_BASE}${url}`
}

async function loadZones() {
  try {
    const res = await zoneApi.getList()
    if (res.success && res.data) {
      zones.value = res.data
    }
  } catch (error) {
    console.error('加载专区失败:', error)
  }
}

function goToZoneDetail(zoneId) {
  uni.navigateTo({
    url: `/pages/zones/detail?id=${zoneId}`
  })
}

onMounted(() => {
  loadZones()
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
  
  .zones-container {
    background: #f5f5f5;
    min-height: 100vh;
    padding-bottom: var(--spacing-xl);
  }

.section {
  background: var(--bg-white);
  padding: var(--spacing-md);
  border-radius: var(--card-radius);
  margin: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.section-header {
  margin-bottom: var(--spacing-md);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.zone-item {
  border-radius: var(--card-radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  background: var(--bg-white);
}

.zone-image {
  width: 100%;
  height: 400rpx;
  object-fit: cover;
}
</style>
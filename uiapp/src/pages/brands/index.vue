<template>
  <view class="container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <input 
        v-model="keyword"
        class="search-input" 
        placeholder="搜索品牌"
        @confirm="handleSearch"
      />
    </view>

    <!-- 品牌列表 -->
    <view v-if="brands.length > 0" class="brand-list">
      <view 
        v-for="brand in brands" 
        :key="brand.shop_id"
        class="brand-item"
        @click="goToShopDetail(brand.shop_id)"
      >
        <view class="brand-logo">
          <image 
            v-if="brand.logo_url" 
            :src="getImageUrl(brand.logo_url)" 
            class="logo-img"
            mode="aspectFill"
          />
          <text v-else class="logo-placeholder">{{ getFirstChar(brand.brand_name) }}</text>
        </view>
        <view class="brand-info">
          <text class="brand-name">{{ brand.brand_name }}</text>
          <text class="brand-desc">{{ brand.description || '暂无描述' }}</text>
          <view class="brand-badge">
            <text class="brand-icon">⭐</text>
            <text class="brand-text">品牌认证</text>
          </view>
        </view>
        <view class="brand-arrow">
          <text class="arrow-icon">></text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else-if="!loading" class="empty-state">
      <text class="empty-text">暂无品牌</text>
    </view>

    <!-- 加载状态 -->
    <van-loading v-if="loading" type="spinner" class="loading">加载中...</van-loading>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import config from '@/config.js'

const keyword = ref('')
const loading = ref(false)
const brands = ref([])

function getImageUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/uploads/')) return `${config.IMAGE_BASE_URL}${url}`
  return url
}

function getFirstChar(name) {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

async function loadBrands() {
  try {
    loading.value = true
    const url = `${config.BASE_URL}/api/merchants/brands${keyword.value ? '?keyword=' + encodeURIComponent(keyword.value) : ''}`
    
    const res = await uni.request({
      url: url,
      method: 'GET'
    })
    
    if (res.data && res.data.success) {
      brands.value = res.data.data || []
    }
  } catch (error) {
    console.error('加载品牌列表失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  loadBrands()
}

// 点击品牌直接进入店铺详情
function goToShopDetail(shopId) {
  uni.navigateTo({
    url: `/pages/shop/detail?id=${shopId}`
  })
}

onMounted(() => {
  loadBrands()
})
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 32rpx;
}

.search-bar {
  background: white;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.search-input {
  background: #f5f5f5;
  border-radius: 32rpx;
  padding: 20rpx 32rpx;
  font-size: 28rpx;
  height: 80rpx;
  line-height: 80rpx;
}

.brand-list {
  background: white;
  margin: 0 24rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.brand-item {
  display: flex;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.brand-item:last-child {
  border-bottom: none;
}

.brand-logo {
  width: 100rpx;
  height: 100rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.logo-img {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
}

.logo-placeholder {
  font-size: 40rpx;
  font-weight: bold;
  color: white;
}

.brand-info {
  flex: 1;
  overflow: hidden;
}

.brand-name {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, #ffd700, #ffb347);
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  gap: 4rpx;
}

.brand-icon {
  font-size: 20rpx;
}

.brand-text {
  font-size: 20rpx;
  color: #333;
  font-weight: 500;
}

.brand-desc {
  display: block;
  font-size: 24rpx;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 8rpx;
}

.brand-arrow {
  margin-left: 16rpx;
}

.arrow-icon {
  font-size: 28rpx;
  color: #ccc;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 200rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 100rpx 0;
}
</style>

<template>
  <view class="container">
    <!-- 品牌头部 -->
    <view class="brand-header">
      <view class="brand-logo">
        <image 
          v-if="brandInfo.logo_url" 
          :src="getImageUrl(brandInfo.logo_url)" 
          class="logo-img"
          mode="aspectFill"
        />
        <text v-else class="logo-placeholder">{{ getFirstChar(brandInfo.brand_name) }}</text>
      </view>
      <view class="brand-title">
        <text class="brand-name">{{ brandInfo.brand_name }}</text>
        <text class="brand-desc">{{ brandInfo.description || '暂无描述' }}</text>
      </view>
    </view>

    <!-- 店铺列表 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">品牌店铺</text>
        <text class="shop-count">{{ shops.length }} 家</text>
      </view>

      <view v-if="shops.length > 0" class="shop-list">
        <view 
          v-for="shop in shops" 
          :key="shop.id"
          class="shop-item"
          @click="goToShopDetail(shop.id)"
        >
          <image 
            v-if="shop.logo_url" 
            :src="getImageUrl(shop.logo_url)" 
            class="shop-logo"
            mode="aspectFill"
          />
          <view v-else class="shop-logo shop-logo-placeholder">
            <text class="logo-text">{{ getFirstChar(shop.name) }}</text>
          </view>
          
          <view class="shop-info">
            <view class="shop-name-row">
              <text class="shop-name">{{ shop.name }}</text>
              <view v-if="shop.is_brand" class="brand-badge">
                <text class="brand-icon">⭐</text>
                <text class="brand-text">品牌</text>
              </view>
            </view>
            <text class="shop-desc">{{ shop.description || '暂无描述' }}</text>
            <view class="shop-meta">
              <text class="shop-status" :class="shop.status">{{ shop.status === 'active' ? '营业中' : '休息中' }}</text>
            </view>
          </view>
          
          <view class="shop-arrow">
            <text class="arrow-icon">></text>
          </view>
        </view>
      </view>

      <view v-else-if="!loading" class="empty-state">
        <text class="empty-text">暂无店铺</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <van-loading v-if="loading" type="spinner" class="loading">加载中...</van-loading>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import config from '@/config.js'

const loading = ref(false)
const brandInfo = ref({ brand_name: '', logo_url: '', description: '' })
const shops = ref([])

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

async function loadBrandShops() {
  try {
    loading.value = true
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const options = currentPage.options || {}
    const brandName = decodeURIComponent(options.brand || '')
    
    uni.setNavigationBarTitle({ title: brandName || '品牌店铺' })
    brandInfo.value.brand_name = brandName
    
    const res = await uni.request({
      url: `${config.BASE_URL}/api/merchants/brand-shops?brand=${encodeURIComponent(brandName)}`,
      method: 'GET'
    })
    
    if (res.data && res.data.success) {
      shops.value = res.data.data || []
      if (shops.value.length > 0 && !brandInfo.value.logo_url) {
        brandInfo.value = {
          brand_name: brandName,
          logo_url: shops.value[0].logo_url,
          description: shops.value[0].description
        }
      }
    }
  } catch (error) {
    console.error('加载品牌店铺失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function goToShopDetail(shopId) {
  uni.navigateTo({
    url: `/pages/shop/detail?id=${shopId}`
  })
}

onMounted(() => {
  loadBrandShops()
})
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f8f9fa;
}

.brand-header {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  padding: 48rpx 32rpx;
  display: flex;
  align-items: center;
}

.brand-logo {
  width: 120rpx;
  height: 120rpx;
  border-radius: 24rpx;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 32rpx;
  flex-shrink: 0;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.logo-img {
  width: 100%;
  height: 100%;
  border-radius: 24rpx;
}

.logo-placeholder {
  font-size: 48rpx;
  font-weight: bold;
  color: #ff6b6b;
}

.brand-title {
  flex: 1;
}

.brand-name {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 12rpx;
}

.brand-desc {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.section {
  background: white;
  margin: 24rpx;
  border-radius: 16rpx;
  padding: 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.shop-count {
  font-size: 26rpx;
  color: #ff6b6b;
}

.shop-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.shop-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.shop-item:last-child {
  border-bottom: none;
}

.shop-logo {
  width: 100rpx;
  height: 100rpx;
  border-radius: 16rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.shop-logo-placeholder {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: 36rpx;
  font-weight: bold;
  color: white;
}

.shop-info {
  flex: 1;
  overflow: hidden;
}

.shop-name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.shop-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
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

.shop-desc {
  display: block;
  font-size: 24rpx;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 8rpx;
}

.shop-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.shop-status {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.shop-status.active {
  background: #e6f7e6;
  color: #52c41a;
}

.shop-status.inactive {
  background: #f5f5f5;
  color: #999;
}

.shop-arrow {
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
  padding: 100rpx 0;
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

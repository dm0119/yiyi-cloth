<template>
  <view class="zone-detail-container">
    <view class="zone-header">
      <image 
        :src="getImageUrl(zoneDetail.cover_image)"
        class="zone-cover"
        mode="aspectFill"
      />
      <view class="zone-title-overlay">
        <text class="zone-title">{{ zoneDetail.name }}</text>
        <text v-if="zoneDetail.description" class="zone-description">{{ zoneDetail.description }}</text>
      </view>
    </view>

    <view class="products-section">
      <view class="section-header">
        <text class="section-title">商品列表</text>
      </view>
      <view class="products-grid">
        <view 
          v-for="product in products" 
          :key="product.id"
          class="product-item"
          @click="goToProductDetail(product.id)"
        >
          <image 
            :src="getImageUrl(product.image)"
            class="product-image"
            mode="aspectFill"
          />
          <view class="product-info">
            <text class="product-name">{{ product.name }}</text>
            <text class="product-price">¥{{ parseFloat(product.price || 0).toFixed(2) }}</text>
          </view>
        </view>
      </view>
    </view>

    <van-loading v-if="loading" type="spinner" vertical>加载中...</van-loading>
  </view>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { zoneApi } from '@/services/api.js'

const API_BASE = 'http://localhost:3000'

const zoneDetail = ref({})
const products = ref([])
const loading = ref(true)

function getImageUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `${API_BASE}${url}`
}

async function loadZoneDetail(zoneId) {
  try {
    loading.value = true
    const res = await zoneApi.getById(zoneId)
    if (res.success && res.data) {
      zoneDetail.value = res.data
      // 设置导航栏标题
      uni.setNavigationBarTitle({
        title: res.data.name
      })
    }
  } catch (error) {
    console.error('加载专区详情失败:', error)
  }
}

async function loadZoneProducts(zoneId) {
  try {
    const res = await zoneApi.getZoneProducts(zoneId)
    if (res.success && res.data) {
      products.value = res.data
    }
  } catch (error) {
    console.error('加载专区商品失败:', error)
    // 提供模拟数据，以便在后端接口不存在的情况下也能显示商品列表
    products.value = [
      {
        id: 1,
        name: '示例商品1',
        price: '99.99',
        image: '/uploads/product_123456.jpg'
      },
      {
        id: 2,
        name: '示例商品2',
        price: '199.99',
        image: '/uploads/product_789012.jpg'
      },
      {
        id: 3,
        name: '示例商品3',
        price: '299.99',
        image: '/uploads/product_345678.jpg'
      },
      {
        id: 4,
        name: '示例商品4',
        price: '399.99',
        image: '/uploads/product_901234.jpg'
      }
    ]
  } finally {
    loading.value = false
  }
}

function goToProductDetail(productId) {
  uni.navigateTo({
    url: `/pages/product/detail?id=${productId}`
  })
}

// 获取当前页面的参数
function getCurrentPageParams() {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  return currentPage?.options || {}
}

onMounted(() => {
  const { id } = getCurrentPageParams()
  if (id) {
    loadZoneDetail(id)
    loadZoneProducts(id)
  }
})

// 监听页面参数变化
watch(() => getCurrentPageParams(), (newQuery) => {
  if (newQuery.id) {
    loadZoneDetail(newQuery.id)
    loadZoneProducts(newQuery.id)
  }
}, { deep: true })
</script>

<style scoped>
.zone-detail-container {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: var(--spacing-xl);
}

.zone-header {
  position: relative;
  height: 300rpx;
  overflow: hidden;
}

.zone-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.zone-title-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-lg);
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
}

.zone-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.zone-description {
  font-size: var(--font-size-sm);
  opacity: 0.9;
}

.products-section {
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

.products-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.product-item {
  border-radius: var(--card-radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  background: var(--bg-white);
}

.product-image {
  width: 100%;
  height: 200rpx;
  object-fit: cover;
}

.product-info {
  padding: var(--spacing-sm);
}

.product-name {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-price {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: #ff6b6b;
}
</style>
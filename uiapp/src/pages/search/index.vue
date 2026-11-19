<template>
  <view class="container">
    <view class="search-header">
      <view class="search-bar-wrapper">
        <!-- 搜索类型切换器 -->
        <view class="search-type-selector">
          <view 
            class="type-option" 
            :class="{ active: searchType === 'product' }"
            @click="searchType = 'product'"
          >
            <text class="option-text">商品</text>
          </view>
          <view 
            class="type-option" 
            :class="{ active: searchType === 'shop' }"
            @click="searchType = 'shop'"
          >
            <text class="option-text">店铺</text>
          </view>
        </view>

        <view class="search-bar">
          <input 
            v-model="keyword" 
            class="search-input" 
            :placeholder="searchType === 'product' ? '搜索商品' : '搜索店铺'"
            @confirm="handleSearch"
          />
          <text class="clear-btn" @click="clearSearch">清空</text>
        </view>
      </view>
    </view>

    <view v-if="!hasSearched && searchHistory.length > 0" class="history-section">
      <view class="section-title">搜索历史</view>
      <view class="history-tags">
        <view 
          v-for="(item, index) in searchHistory" 
          :key="index"
          class="history-tag"
          @click="searchByHistory(item)"
        >
          <text class="tag-text">{{ item }}</text>
          <text class="tag-delete" @click.stop="deleteHistory(index)">×</text>
        </view>
      </view>
      <text class="clear-history" @click="clearHistory">清空历史</text>
    </view>

    <!-- 商品搜索结果 -->
    <view v-if="searchType === 'product'">
      <view v-if="hasSearched && filteredProducts.length > 0" class="sort-nav">
        <view 
          v-for="sort in sortOptions" 
          :key="sort.value"
          class="sort-item"
          :class="{ active: currentSort === sort.value }"
          @click="currentSort = sort.value"
        >
          {{ sort.label }}
        </view>
      </view>

      <view class="product-grid">
        <view 
          v-for="product in filteredProducts" 
          :key="product.id"
          class="product-card"
          @click="goToDetail(product.id)"
        >
          <image 
            :src="product.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+无图片</text></svg>'" 
            class="product-image" 
            mode="aspectFill"
          />
          <view class="product-info">
            <text class="product-name">{{ product.name }}</text>
            <view class="product-meta">
              <text class="product-price">¥{{ product.price.toFixed(2) }}</text>
              <text class="product-stock">库存：{{ product.stock }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="!loading && hasSearched && filteredProducts.length === 0" class="empty-state">
        <text>暂无相关商品</text>
      </view>
    </view>

    <!-- 店铺搜索结果 -->
    <view v-else>
      <view class="shop-list">
        <view 
          v-for="shop in filteredShops" 
          :key="shop.id"
          class="shop-card"
          @click="goToShop(shop.id)"
        >
          <view class="shop-header">
            <image 
              v-if="shop.logo"
              :src="shop.logo" 
              class="shop-logo" 
              mode="aspectFill"
            />
            <view class="shop-info">
              <view class="shop-name-wrapper">
                <text class="shop-name">{{ shop.name }}</text>
                <view v-if="shop.is_brand" class="brand-badge">
                  <text class="brand-icon">⭐</text>
                  <text class="brand-text">品牌</text>
                </view>
              </view>
              <text class="shop-desc">{{ shop.description || '暂无描述' }}</text>
            </view>
          </view>
          <view class="shop-meta">
            <text class="shop-status" :class="{ online: shop.status === 'active' }">
              {{ shop.status === 'active' ? '营业中' : '休息中' }}
            </text>
          </view>
        </view>
      </view>

      <view v-if="!loading && hasSearched && filteredShops.length === 0" class="empty-state">
        <text>暂无相关店铺</text>
      </view>
    </view>

    <view v-if="loading" class="loading-state">
      <text>搜索中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { productApi, shopApi } from '@/services/api.js'

const keyword = ref('')
const searchType = ref('product') // 'product' 或 'shop'
const loading = ref(false)
const products = ref([])
const shops = ref([])
const searchHistory = ref([])
const currentSort = ref('default')
const hasSearched = ref(false)

const sortOptions = [
  { label: '默认排序', value: 'default' },
  { label: '价格从低到高', value: 'price_asc' },
  { label: '价格从高到低', value: 'price_desc' },
  { label: '销量优先', value: 'sales' },
  { label: '好评优先', value: 'rating' }
]

const filteredProducts = computed(() => {
  let result = [...products.value]
  
  if (currentSort.value === 'price_asc') {
    result.sort((a, b) => a.price - b.price)
  } else if (currentSort.value === 'price_desc') {
    result.sort((a, b) => b.price - a.price)
  } else if (currentSort.value === 'sales') {
    result.sort((a, b) => b.stock - a.stock)
  } else if (currentSort.value === 'rating') {
    result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  }
  
  return result
})

const filteredShops = computed(() => {
  return [...shops.value]
})

async function handleSearch() {
  if (!keyword.value.trim()) {
    return
  }
  
  addToHistory(keyword.value)
  hasSearched.value = true
  
  loading.value = true
  try {
    if (searchType.value === 'product') {
      // 搜索商品
      const res = await productApi.search(keyword.value)
      products.value = res.data || []
      shops.value = []
    } else {
      // 搜索店铺
      const res = await shopApi.search(keyword.value)
      shops.value = res.data || []
      products.value = []
    }
  } catch (error) {
    console.error('搜索失败:', error)
    products.value = []
    shops.value = []
  } finally {
    loading.value = false
  }
}

function searchByHistory(item) {
  keyword.value = item
  handleSearch()
}

function addToHistory(item) {
  const index = searchHistory.value.indexOf(item)
  if (index === -1) {
    searchHistory.value.unshift(item)
    if (searchHistory.value.length > 10) {
      searchHistory.value = searchHistory.value.slice(0, 10)
    }
    saveHistory()
  }
}

function deleteHistory(index) {
  searchHistory.value.splice(index, 1)
  saveHistory()
}

function clearHistory() {
  searchHistory.value = []
  saveHistory()
}

function saveHistory() {
  uni.setStorageSync('searchHistory', searchHistory.value)
}

function clearSearch() {
  keyword.value = ''
}

function goToDetail(id) {
  uni.navigateTo({
    url: `/pages/product/detail?id=${id}`
  })
}

function goToShop(id) {
  uni.navigateTo({
    url: `/pages/shop/detail?id=${id}`
  })
}



onLoad((options) => {
  if (options.keyword) {
    keyword.value = options.keyword
    handleSearch()
  }
})

onMounted(() => {
  const savedHistory = uni.getStorageSync('searchHistory') || []
  searchHistory.value = savedHistory
})

watch(currentSort, () => {
  console.log('排序方式改变:', currentSort.value)
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
    background: transparent;
    min-height: 100vh;
    padding-bottom: 120rpx;
  }

.search-header {
  background: white;
  padding: var(--spacing-md);
  border-radius: var(--card-radius);
  box-shadow: var(--shadow-sm);
  margin: 0 var(--spacing-md) var(--spacing-md) var(--spacing-md);
}

.search-bar-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

/* 搜索类型切换器 */
.search-type-selector {
  display: flex;
  background: var(--bg-color);
  border-radius: var(--button-radius);
  padding: 6rpx;
  width: 100%;
}

.type-option {
  flex: 1;
  text-align: center;
  padding: var(--spacing-sm) 0;
  border-radius: var(--button-radius);
  transition: all 0.3s ease;
}

.type-option.active {
  background: white;
  box-shadow: var(--shadow-sm);
}

.option-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

.type-option.active .option-text {
  color: var(--primary-color);
  font-weight: 600;
}



.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  background: var(--bg-color);
  border-radius: var(--card-radius);
  padding: var(--spacing-xs) var(--spacing-md);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: var(--font-size-base);
  line-height: 1.5;
}

.clear-btn {
  font-size: var(--font-size-sm);
  color: var(--primary-color);
  margin-left: var(--spacing-md);
}

.history-section {
  background: transparent;
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.section-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.history-tags {
  display: flex;
  gap: var(--spacing-sm);
  overflow-x: auto;
  padding-bottom: var(--spacing-sm);
  white-space: nowrap;
}

.history-tag {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-color);
  border-radius: 50rpx;
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

.tag-text {
  flex: 1;
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

.tag-delete {
  font-size: var(--font-size-lg);
  color: var(--text-muted);
  padding: var(--spacing-xs);
}

.clear-history {
  font-size: var(--font-size-sm);
  color: var(--primary-color);
  text-align: center;
  margin-top: var(--spacing-md);
}

.sort-nav {
  display: flex;
  background: var(--bg-white);
  padding: var(--spacing-sm);
  gap: var(--spacing-sm);
  overflow-x: auto;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 10;
}

.sort-item {
  padding: var(--spacing-md) var(--spacing-sm);
  background: var(--bg-color);
  border-radius: var(--card-radius);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  white-space: nowrap;
}

.sort-item.active {
  background: var(--primary-color);
  color: var(--bg-white);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340rpx, 1fr));
  gap: var(--spacing-md);
  padding: var(--spacing-md);
}

.product-card {
  background: var(--bg-white);
  border-radius: var(--card-radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.product-card:active {
  transform: scale(0.98);
  box-shadow: var(--shadow-md);
}

.product-image {
  width: 100%;
  height: 300rpx;
  object-fit: cover;
}

.product-info {
  padding: var(--spacing-md);
}

.product-name {
  display: block;
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-xs);
}

.product-price {
  font-size: var(--font-size-lg);
  font-weight: bold;
  color: var(--primary-color);
}

.product-stock {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.empty-state, .loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80rpx 0;
  color: var(--text-muted);
}

/* 店铺列表样式 */
.shop-list {
  padding: var(--spacing-md);
}

.shop-card {
  background: var(--bg-white);
  border-radius: var(--card-radius);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease;
}

.shop-card:active {
  transform: scale(0.98);
  box-shadow: var(--shadow-md);
}

.shop-header {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.shop-logo {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.shop-info {
  flex: 1;
  min-width: 0;
}

.shop-name {
  display: block;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shop-name-wrapper {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: var(--spacing-xs);
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 4rpx;
  background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%);
  color: #f4c542;
  padding: 4rpx 10rpx;
  border-radius: 6rpx;
  font-size: 20rpx;
  font-weight: bold;
  letter-spacing: 1px;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2), 0 0 0 1rpx rgba(244, 197, 66, 0.1);
  border: 1rpx solid rgba(244, 197, 66, 0.2);
  white-space: nowrap;
}

.brand-icon {
  font-size: 22rpx;
  filter: drop-shadow(0 1rpx 2rpx rgba(0, 0, 0, 0.3));
}

.brand-text {
  background: linear-gradient(135deg, #f4c542 0%, #ffd700 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.3);
}

.shop-desc {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shop-meta {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: var(--spacing-sm);
}

.shop-status {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  padding: 4rpx var(--spacing-sm);
  background: var(--bg-color);
  border-radius: 4rpx;
}

.shop-status.online {
  color: var(--success-color);
  background: rgba(82, 196, 26, 0.1);
}

/* 底部返回按钮已移除，使用顶部返回按钮 */
</style>

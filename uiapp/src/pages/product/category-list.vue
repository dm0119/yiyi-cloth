<template>
  <view class="container">
    <!-- 二级分类横向导航栏 -->
    <scroll-view v-if="secondaryCategories.length > 0" scroll-x class="secondary-nav" scroll-with-animation>
      <view class="secondary-list">
        <view
          v-for="category in secondaryCategories"
          :key="category.id"
          class="secondary-item"
          :class="{ active: selectedSecondaryCategory === category.id }"
          @click="selectSecondaryCategory(category.id)"
        >
          <text class="item-text">{{ category.name }}</text>
          <view v-if="selectedSecondaryCategory === category.id" class="active-line"></view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 三级分类横向导航栏 -->
    <scroll-view v-if="tertiaryCategories.length > 0" scroll-x class="tertiary-nav" scroll-with-animation>
      <view class="tertiary-list">
        <!-- 全部选项 -->
        <view
          class="tertiary-item"
          :class="{ active: selectedTertiaryCategory === 0 }"
          @click="selectTertiaryCategory(0)"
        >
          <text class="item-text">全部</text>
          <view v-if="selectedTertiaryCategory === 0" class="active-line"></view>
        </view>
        <!-- 三级分类选项 -->
        <view
          v-for="category in tertiaryCategories"
          :key="category.id"
          class="tertiary-item"
          :class="{ active: selectedTertiaryCategory === category.id }"
          @click="selectTertiaryCategory(category.id)"
        >
          <text class="item-text">{{ category.name }}</text>
          <view v-if="selectedTertiaryCategory === category.id" class="active-line"></view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 标签筛选栏 -->
    <scroll-view scroll-x class="tag-filter" scroll-with-animation>
      <view class="tag-list">
        <view
          class="tag-item"
          :class="{ active: selectedTag === '' }"
          @click="selectTag('')"
        >
          <text class="tag-text">全部</text>
        </view>
        <view
          v-for="tag in popularTags"
          :key="tag.tag"
          class="tag-item"
          :class="{ active: selectedTag === tag.tag }"
          @click="selectTag(tag.tag)"
        >
          <text class="tag-text">{{ tag.tag }}</text>
          <text class="tag-count">{{ tag.count }}</text>
        </view>
      </view>
    </scroll-view>
    
    <!-- 排序栏 -->
    <view class="sort-bar">
      <view class="sort-item" @click="toggleSort('default')">
        <text :class="{ active: currentSortType === 'default' }">综合</text>
      </view>
      <view class="sort-item" @click="changeSort('sales')">
        <text :class="{ active: currentSortType === 'sales' }">销量</text>
      </view>
      <view class="sort-item" @click="togglePriceSort">
        <text :class="{ active: currentSortType === 'price' }">价格</text>
        <view class="price-arrows">
          <text class="arrow" :class="{ active: currentSortType === 'price' && currentSort === 'price_asc' }">▲</text>
          <text class="arrow" :class="{ active: currentSortType === 'price' && currentSort === 'price_desc' }">▼</text>
        </view>
      </view>
    </view>
    
    <!-- 商品列表 -->
    <scroll-view scroll-y class="product-scroll" @scrolltolower="loadMore">
      <view class="product-grid">
        <view 
          v-for="product in products" 
          :key="product.product_id || product.id"
          class="product-card"
          @click="goToDetail(product.product_id || product.id)"
        >
          <view class="product-image-container">
            <image 
              :src="getImageUrl(product.image)" 
              class="product-image" 
              mode="aspectFill"
            />
          </view>
          <view class="product-info">
            <text class="product-title">{{ product.name }}</text>
            <view class="product-meta">
              <text class="product-price">¥{{ (Number(product.price) || 0).toFixed(2) }}</text>
              <text class="product-sales">{{ product.sales_count || 0 }}人付款</text>
            </view>
            <!-- 标签展示 -->
            <view class="product-tags" v-if="product.tags && product.tags.length > 0">
              <text 
                v-for="(tag, index) in product.tags.slice(0, 3)" 
                :key="index"
                class="product-tag"
              >
                {{ tag }}
              </text>
            </view>
            <!-- 尺码推荐说明 -->
            <text class="size-tip" v-if="product.size_recommendations">
              💡 {{ product.size_recommendations }}
            </text>
          </view>
        </view>
      </view>

      <view v-if="!loading && products.length === 0" class="empty-state">
        <text>暂无商品</text>
      </view>
      <view v-if="loading" class="loading-state">
        <text>加载中...</text>
      </view>
      <view v-if="!loading && products.length > 0 && !hasMore" class="no-more">
        <text>没有更多了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { productApi, categoryApi, hotProductApi, newProductApi } from '@/services/api.js'

const API_BASE = 'http://localhost:3000'

function getImageUrl(url) {
  if (!url) return 'https://via.placeholder.com/300x300'
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  if (url.startsWith('/uploads/')) {
    return `${API_BASE}${url}`
  }
  return url
}

const products = ref([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = ref(10)
const categoryName = ref('商品列表')
const primaryCategoryId = ref(0)
const secondaryCategories = ref([])
const selectedSecondaryCategory = ref(0)
const tertiaryCategories = ref([])
const selectedTertiaryCategory = ref(0)
const currentSort = ref('newest')
const currentSortType = ref('default')
const isHotProducts = ref(false)
const isNewProducts = ref(false)

// 标签相关
const popularTags = ref([])
const selectedTag = ref('')

// 解析商品标签（tags可能是JSON字符串或数组）
function parseProductTags(product) {
  if (!product) return product
  if (product.tags) {
    if (typeof product.tags === 'string') {
      try {
        product.tags = JSON.parse(product.tags)
      } catch (e) {
        product.tags = []
      }
    }
  } else {
    product.tags = []
  }
  // 确保价格是数字
  product.price = Number(product.price) || 0
  return product
}

// 处理商品列表的标签解析
function processProducts(products) {
  return (products || []).map(p => parseProductTags(p))
}

async function loadPopularTags() {
  try {
    const res = await productApi.getPopularTags()
    if (res.success && res.data) {
      popularTags.value = res.data
    }
  } catch (error) {
    console.error('加载热门标签失败:', error)
  }
}

function selectTag(tag) {
  selectedTag.value = tag
  page.value = 1
  products.value = []
  hasMore.value = true
  
  // 根据标签加载商品
  if (tag) {
    loadProductsByTag(tag)
  } else {
    // 加载当前分类的商品
    const categoryId = selectedTertiaryCategory.value || selectedSecondaryCategory.value
    if (categoryId && categoryId !== 0) {
      loadProducts(categoryId)
    }
  }
}

async function loadProductsByTag(tag) {
  if (loading.value) return
  loading.value = true
  
  try {
    const res = await productApi.getByTag(tag)
    const newProducts = res.data || []
    products.value = processProducts(newProducts)
  } catch (error) {
    console.error('按标签加载商品失败:', error)
  } finally {
    loading.value = false
  }
}

async function loadProducts(categoryId, isLoadMore = false) {
  if (loading.value) return
  loading.value = true
  
  if (!isLoadMore) {
    page.value = 1
    products.value = []
  }
  
  try {
    const res = await productApi.getByCategory(categoryId, currentSort.value, true)
    const newProducts = res.data || []
    
    if (isLoadMore) {
      products.value = [...products.value, ...processProducts(newProducts)]
    } else {
      products.value = processProducts(newProducts)
    }
    
    hasMore.value = newProducts.length === pageSize.value
  } catch (error) {
    console.error('加载商品失败:', error)
  } finally {
    loading.value = false
  }
}

function loadMore() {
  if (!hasMore.value || loading.value) return
  page.value++
  loadProducts(selectedSecondaryCategory.value, true)
}

async function loadCategoryName(categoryId) {
  try {
    const res = await categoryApi.getById(categoryId)
    if (res.success && res.data) {
      categoryName.value = res.data.name
      // 设置导航栏标题
      uni.setNavigationBarTitle({
        title: res.data.name
      })
    }
  } catch (error) {
    console.error('加载分类名称失败:', error)
  }
}

async function loadSecondaryCategories(primaryId) {
  try {
    const res = await categoryApi.getChildren(primaryId)
    if (res.success && res.data) {
      secondaryCategories.value = res.data
      if (res.data.length > 0 && !selectedSecondaryCategory.value) {
        selectedSecondaryCategory.value = res.data[0].id
        loadTertiaryCategories(res.data[0].id)
        loadProducts(res.data[0].id)
      }
    }
  } catch (error) {
    console.error('加载二级分类失败:', error)
  }
}

async function loadTertiaryCategories(secondaryId) {
  try {
    const res = await categoryApi.getChildren(secondaryId)
    if (res.success && res.data) {
      tertiaryCategories.value = res.data
      selectedTertiaryCategory.value = 0 // 重置为全部
    } else {
      tertiaryCategories.value = []
    }
  } catch (error) {
    console.error('加载三级分类失败:', error)
    tertiaryCategories.value = []
  }
}

function selectSecondaryCategory(categoryId) {
  selectedSecondaryCategory.value = categoryId
  selectedTertiaryCategory.value = 0 // 重置三级分类选择
  loadTertiaryCategories(categoryId)
  loadProducts(categoryId)
}

function selectTertiaryCategory(categoryId) {
  selectedTertiaryCategory.value = categoryId
  // 如果选择了具体的三级分类，使用三级分类ID加载商品
  // 如果选择了"全部"，使用当前二级分类ID加载商品
  const targetCategoryId = categoryId === 0 ? selectedSecondaryCategory.value : categoryId
  loadProducts(targetCategoryId)
}

async function loadHotProducts(isLoadMore = false) {
  if (loading.value) return
  loading.value = true

  if (!isLoadMore) {
    page.value = 1
    products.value = []
  }

  try {
    const res = await hotProductApi.getHotProducts(currentSort.value)
    const newProducts = res.data || []

    if (isLoadMore) {
      products.value = [...products.value, ...processProducts(newProducts)]
    } else {
      products.value = processProducts(newProducts)
    }

    hasMore.value = false
  } catch (error) {
    console.error('加载热门推荐失败:', error)
  } finally {
    loading.value = false
  }
}

async function loadNewProducts(isLoadMore = false) {
  if (loading.value) return
  loading.value = true

  if (!isLoadMore) {
    page.value = 1
    products.value = []
  }

  try {
    const res = await newProductApi.getNewProducts(currentSort.value)
    const newProducts = res.data || []

    if (isLoadMore) {
      products.value = [...products.value, ...processProducts(newProducts)]
    } else {
      products.value = processProducts(newProducts)
    }
    
    hasMore.value = false
  } catch (error) {
    console.error('加载新品推荐失败:', error)
  } finally {
    loading.value = false
  }
}

function toggleSort(type) {
  currentSortType.value = type
  if (type === 'default') {
    currentSort.value = 'newest'
    if (isHotProducts.value) {
      loadHotProducts()
    } else if (isNewProducts.value) {
      loadNewProducts()
    } else {
      loadProducts(selectedSecondaryCategory.value)
    }
  }
}

function changeSort(sortType) {
  currentSortType.value = sortType
  currentSort.value = sortType
  if (isHotProducts.value) {
    loadHotProducts()
  } else if (isNewProducts.value) {
    loadNewProducts()
  } else {
    loadProducts(selectedSecondaryCategory.value)
  }
}

function togglePriceSort() {
  if (currentSortType.value === 'price') {
    currentSort.value = currentSort.value === 'price_asc' ? 'price_desc' : 'price_asc'
  } else {
    currentSortType.value = 'price'
    currentSort.value = 'price_asc'
  }
  if (isHotProducts.value) {
    loadHotProducts()
  } else if (isNewProducts.value) {
    loadNewProducts()
  } else {
    loadProducts(selectedSecondaryCategory.value)
  }
}

function goToDetail(id) {
  uni.navigateTo({
    url: `/pages/product/detail?id=${id}`
  })
}

function goBack() {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    // 如果是从首页的热门推荐或新品推荐进入的，返回首页
    if (isHotProducts.value || isNewProducts.value) {
      uni.switchTab({
        url: '/pages/index/index'
      })
    } else {
      // 如果是从分类页面进入的，返回分类页面
      uni.switchTab({
        url: '/pages/product/list'
      })
    }
  }
}

onLoad(async (options) => {
  // 加载热门标签
  await loadPopularTags()
  
  if (options.hot === 'true') {
    isHotProducts.value = true
    categoryName.value = '热门推荐'
    uni.setNavigationBarTitle({ title: '热门推荐' })
    await loadHotProducts()
  } else if (options.new === 'true') {
    isNewProducts.value = true
    categoryName.value = '新品推荐'
    uni.setNavigationBarTitle({ title: '新品推荐' })
    await loadNewProducts()
  } else if (options.category) {
    const categoryId = parseInt(options.category)
    
    if (options.level === '1') {
      primaryCategoryId.value = categoryId
      await loadCategoryName(categoryId)
      await loadSecondaryCategories(categoryId)
    } else {
      selectedSecondaryCategory.value = categoryId
      await loadCategoryName(categoryId)
      await loadTertiaryCategories(categoryId) // 加载三级分类
      await loadProducts(categoryId)
    }
  }
})
</script>

<style scoped>
.container {
  background: #f5f5f5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 二级分类横向导航栏 */
.secondary-nav {
  background: #fff;
  white-space: nowrap;
  border-bottom: 1rpx solid #eee;
}

.secondary-list {
  display: flex;
  flex-direction: row;
  padding: 0 20rpx;
}

.secondary-item {
  position: relative;
  padding: 24rpx 30rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-shrink: 0;
}

.secondary-item .item-text {
  font-size: 28rpx;
  color: #666;
  transition: all 0.3s;
}

.secondary-item.active .item-text {
  color: #ff4d4f;
  font-weight: 500;
}

.active-line {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 4rpx;
  background: #ff4d4f;
  border-radius: 2rpx;
}

/* 三级分类横向导航栏 */
.tertiary-nav {
  background: #fff;
  white-space: nowrap;
  border-bottom: 1rpx solid #eee;
}

.tertiary-list {
  display: flex;
  flex-direction: row;
  padding: 0 20rpx;
}

.tertiary-item {
  position: relative;
  padding: 20rpx 24rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-shrink: 0;
}

.tertiary-item .item-text {
  font-size: 26rpx;
  color: #666;
  transition: all 0.3s;
}

.tertiary-item.active .item-text {
  color: #ff4d4f;
  font-weight: 500;
}

/* 标签筛选栏 */
.tag-filter {
  background: #fff;
  white-space: nowrap;
  border-bottom: 1rpx solid #eee;
  padding: 16rpx 0;
}

.tag-list {
  display: flex;
  flex-direction: row;
  padding: 0 20rpx;
  gap: 16rpx;
}

.tag-item {
  position: relative;
  padding: 12rpx 24rpx;
  background: #f5f5f5;
  border-radius: 24rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8rpx;
  flex-shrink: 0;
  transition: all 0.3s;
}

.tag-item.active {
  background: #ff4d4f;
}

.tag-item.active .tag-text {
  color: #fff;
  font-weight: 500;
}

.tag-item.active .tag-count {
  color: rgba(255, 255, 255, 0.9);
}

.tag-text {
  font-size: 26rpx;
  color: #666;
}

.tag-count {
  font-size: 20rpx;
  color: #999;
  background: rgba(0, 0, 0, 0.05);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

/* 排序栏 */
.sort-bar {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #eee;
}

.sort-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #666;
}

.sort-item text {
  transition: all 0.3s;
}

.sort-item text.active {
  color: #ff4d4f;
  font-weight: 500;
}

.sort-item .arrow {
  font-size: 20rpx;
  margin-left: 6rpx;
  color: #999;
}

.sort-item .arrow.active {
  color: #ff4d4f;
}

.price-arrows {
  display: flex;
  flex-direction: column;
  margin-left: 6rpx;
  line-height: 1;
}

.price-arrows .arrow {
  font-size: 16rpx;
  margin: 0;
}



/* 商品列表 */
.product-scroll {
  flex: 1;
  height: 0;
}

.product-grid {
  padding: 20rpx;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.product-card {
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.product-image-container {
  width: 100%;
  height: 340rpx;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
}

.product-info {
  padding: 16rpx;
}

.product-title {
  font-size: 26rpx;
  color: #333;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 12rpx;
}

.product-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-price {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff4d4f;
}

.product-sales {
  font-size: 22rpx;
  color: #999;
}

/* 商品标签 */
.product-tags {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 12rpx;
}

.product-tag {
  display: inline-block;
  padding: 4rpx 12rpx;
  background: linear-gradient(135deg, #fff0f3 0%, #ffe6eb 100%);
  color: #ff6b81;
  font-size: 20rpx;
  border-radius: 8rpx;
  font-weight: 500;
}

/* 尺码推荐说明 */
.size-tip {
  display: block;
  margin-top: 12rpx;
  font-size: 22rpx;
  color: #ff6b81;
  line-height: 1.4;
  background: linear-gradient(135deg, #fff0f3 0%, #ffe6eb 100%);
  padding: 8rpx 12rpx;
  border-radius: 8rpx;
}

.empty-state, .loading-state, .no-more {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60rpx 0;
  color: #999;
  font-size: 26rpx;
}
</style>

<template>
  <view class="container">
    <view class="search-section">
      <view class="search-bar" @click="goToSearchPage">
        <input 
          v-model="keyword"
          class="search-input" 
          placeholder="搜索"
          @confirm="handleSearch"
        />
        <text v-if="keyword" class="clear-btn" @click.stop="clearKeyword">×</text>
      </view>
    </view>

    <!-- 快捷导航区 -->
    <view class="quick-nav">
      <view class="nav-item" @click="goToZones">
        <view class="nav-icon">
          <text class="nav-icon-text">专</text>
        </view>
        <text class="nav-text">专区</text>
      </view>
      <view class="nav-item" @click="goToDiscussions">
        <view class="nav-icon">
          <text class="nav-icon-text">社</text>
        </view>
        <text class="nav-text">社区</text>
      </view>
      <view class="nav-item" @click="goToBrands">
        <view class="nav-icon">
          <text class="nav-icon-text">品</text>
        </view>
        <text class="nav-text">品牌</text>
      </view>
      <view class="nav-item" @click="goToCoupons">
        <view class="nav-icon">
          <text class="nav-icon-text">券</text>
        </view>
        <text class="nav-text">优惠券</text>
      </view>
      <view class="nav-item" @click="goToFavorites">
        <view class="nav-icon">
          <text class="nav-icon-text">藏</text>
        </view>
        <text class="nav-text">收藏</text>
      </view>
    </view>



    <view class="section">
      <view class="section-header">
        <text class="section-title">热门推荐</text>
        <text class="section-more" @click="goToHotList">更多 ></text>
      </view>
      <van-swipe
        class="hot-swipe"
        :autoplay="3000"
        indicator-color="#fff"
        indicator-active-color="#ff6b6b"
      >
        <van-swipe-item
          v-for="product in hotProducts.slice(0, 5)"
          :key="getProductId(product)"
          class="hot-swipe-item"
          @click="goToDetail(getProductId(product))"
        >
          <view class="swipe-content">
            <image
              :src="getImageUrl(getProductImage(product))"
              class="swipe-image"
              mode="aspectFill"
              @error="handleImageError"
              @load="handleImageLoad"
            />
            <view class="swipe-info">
              <view class="product-name">{{ product.name }}</view>
              <view class="product-meta">
                <view class="product-price">¥{{ product.price.toFixed(2) }}</view>
                <view class="product-stats">
                  <text>销量: {{ product.sales_count || 0 }}</text>
                  <text class="rating-text">评分: {{ (product.avg_rating || 0).toFixed(1) }}</text>
                </view>
              </view>
            </view>
          </view>
        </van-swipe-item>
      </van-swipe>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">新品推荐</text>
        <text class="section-more" @click="goToNewList">更多 ></text>
      </view>
      <van-swipe
        class="new-swipe"
        :autoplay="3000"
        indicator-color="#fff"
        indicator-active-color="#ff6b6b"
      >
        <van-swipe-item
          v-for="product in newProducts.slice(0, 5)"
          :key="getProductId(product)"
          class="new-swipe-item"
          @click="goToDetail(getProductId(product))"
        >
          <view class="swipe-content">
            <image
              :src="getImageUrl(getProductImage(product))"
              class="swipe-image"
              mode="aspectFill"
              @error="handleImageError"
              @load="handleImageLoad"
            />
            <view class="swipe-info">
              <view class="product-name">{{ product.name }}</view>
              <view class="product-meta">
                <view class="product-price">¥{{ product.price.toFixed(2) }}</view>
                <view class="product-stats">
                  <text>销量: {{ product.sales_count || 0 }}</text>
                  <text class="rating-text">评分: {{ (product.avg_rating || 0).toFixed(1) }}</text>
                </view>
              </view>
            </view>
          </view>
        </van-swipe-item>
      </van-swipe>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">所有商品</text>
      </view>
      <view class="all-grid">
        <view
          v-for="product in allProducts"
          :key="getProductId(product)"
          class="all-item"
          @click="goToDetail(getProductId(product))"
        >
          <image
            :src="getImageUrl(getProductImage(product))"
            class="all-image"
            mode="aspectFill"
            @error="handleImageError"
            @load="handleImageLoad"
          />
          <view class="all-info">
            <text class="all-name">{{ product.name }}</text>
            <text class="all-price">¥{{ product.price.toFixed(2) }}</text>
            <view class="all-meta">
              <text class="all-sales">销量: {{ product.sales_count || 0 }}</text>
              <text class="all-rating">评分: {{ (product.avg_rating || 0).toFixed(1) }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <van-loading v-if="loading" type="spinner" vertical>加载中...</van-loading>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { productApi, hotProductApi, newProductApi } from '@/services/api.js'
import config from '@/config.js'

function getImageUrl(url) {
  console.log('getImageUrl输入:', url)
  if (!url) {
    console.log('图片URL为空，使用占位图')
    return 'https://via.placeholder.com/300x300?text=No+Image'
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    console.log('图片URL已经是完整路径:', url)
    return url
  }
  if (url.startsWith('/uploads/')) {
    const fullUrl = `${config.IMAGE_BASE_URL}${url}`
    console.log('图片URL拼接结果:', fullUrl)
    return fullUrl
  }
  console.log('图片URL直接返回:', url)
  return url
}

// 获取商品ID，兼容不同的字段名
function getProductId(product) {
  return product.product_id || product.id
}

// 获取商品主图
function getProductImage(product) {
  console.log('getProductImage 调用，商品数据:', product)
  // 优先处理：image 字段（单数，后端返回的主图）
  if (product.image) {
    console.log('使用 image 字段:', product.image)
    return product.image
  }
  // 如果 images 是数组，取第一个
  if (Array.isArray(product.images) && product.images.length > 0) {
    console.log('使用 images 数组第一个:', product.images[0])
    return product.images[0]
  }
  // 如果 images 是字符串，尝试解析
  if (typeof product.images === 'string') {
    try {
      const parsed = JSON.parse(product.images)
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log('解析 images 字符串成功:', parsed[0])
        return parsed[0]
      }
    } catch (e) {
      console.error('解析 images 失败:', e)
    }
  }
  // 降级处理：image_url 字段
  if (product.image_url) {
    console.log('使用 image_url 字段:', product.image_url)
    return product.image_url
  }
  console.log('未找到图片 URL，返回 null')
  return null
}

// 图片加载成功
function handleImageLoad(e) {
  console.log('图片加载成功:', e)
}

// 图片加载失败
function handleImageError(e) {
  console.error('图片加载失败:', e)
}

const keyword = ref('')
const loading = ref(false)
const products = ref([])

const hotProducts = ref([])
const newProducts = ref([])
const allProducts = ref([])

async function loadHotProducts() {
  try {
    const res = await hotProductApi.getHotProducts()
    if (res.success && res.data) {
      hotProducts.value = res.data
    }
  } catch (error) {
    console.error('加载热门商品失败:', error)
  }
}

async function loadNewProducts() {
  try {
    const res = await newProductApi.getNewProducts()
    if (res.success && res.data) {
      // 随机打乱新品列表顺序
      newProducts.value = shuffleArray([...res.data])
    }
  } catch (error) {
    console.error('加载新品商品失败:', error)
  }
}

async function loadAllProducts() {
  try {
    const res = await productApi.getList()
    console.log('所有商品API响应:', res)
    if (res.success && res.data) {
      // 查看第一个商品的完整结构
      if (res.data.length > 0) {
        console.log('第一个商品数据结构:', res.data[0])
      }
      // 随机打乱所有商品顺序
      allProducts.value = shuffleArray([...res.data])
      console.log('所有商品加载成功,数量:', allProducts.value.length)
    } else {
      console.error('加载所有商品失败,响应格式错误:', res)
    }
  } catch (error) {
    console.error('加载所有商品异常:', error)
  }
}

// Fisher-Yates 洗牌算法 - 实现随机排序
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}



function goToDetail(id) {
  uni.navigateTo({
    url: `/pages/product/detail?id=${id}`
  })
}

function goToList() {
  uni.switchTab({
    url: '/pages/product/list'
  })
}

function goToHotList() {
  uni.navigateTo({
    url: '/pages/product/category-list?hot=true'
  })
}

function goToNewList() {
  uni.navigateTo({
    url: '/pages/product/category-list?new=true'
  })
}

function goToZones() {
  uni.navigateTo({
    url: '/pages/zones/index'
  })
}

function goToBrands() {
  uni.navigateTo({
    url: '/pages/brands/index'
  })
}

function goToDiscussions() {
  uni.navigateTo({
    url: '/pages/discussion/list'
  })
}

function goToCoupons() {
  uni.navigateTo({
    url: '/pages/user/coupons'
  })
}

function goToFavorites() {
  uni.navigateTo({
    url: '/pages/user/favorites/index'
  })
}

function handleSearch() {
  uni.navigateTo({
    url: `/pages/search/index?keyword=${keyword.value}`
  })
}

function goToSearchPage() {
  uni.navigateTo({
    url: `/pages/search/index?keyword=${keyword.value}`
  })
}

function clearKeyword() {
  keyword.value = ''
}

function onCancel() {
  keyword.value = ''
}



onMounted(() => {
  loadHotProducts()
  loadNewProducts()
  loadAllProducts()
})
</script>

<style scoped>
/* CSS变量定义 */
:root {
  --primary-color: #ff6b6b; /* 主题色：粉红色 */
  --primary-hover: #ee5a5a; /* 主题色悬停：深粉红色 */
  --secondary-color: #4ecdc4; /* 次要色：青色 */
  --success-color: #52c41a; /* 成功色：绿色 */
  --warning-color: #faad14; /* 警告色：橙色 */
  --error-color: #ff4d4f; /* 错误色：红色 */
  --text-primary: #333333; /* 主要文字颜色：深灰色 */
  --text-secondary: #666666; /* 次要文字颜色：中灰色 */
  --text-muted: #999999; /* 弱化文字颜色：浅灰色 */
  --bg-color: #f8f9fa; /* 背景色：浅灰白色 */
  --bg-white: #ffffff; /* 白色背景：纯白色 */
  --border-color: #e8e8e8; /* 边框颜色：浅灰色 */
  --card-radius: 12px; /* 卡片圆角：12像素 */
  --button-radius: 8px; /* 按钮圆角：8像素 */
  --font-size-xs: 22rpx; /* 超小字体：22rpx */
  --font-size-sm: 24rpx; /* 小字体：24rpx */
  --font-size-md: 28rpx; /* 中等字体：28rpx */
  --font-size-lg: 32rpx; /* 大字体：32rpx */
  --font-size-xl: 36rpx; /* 超大字体：36rpx */
  --font-size-xxl: 40rpx; /* 特大字体：40rpx */
  --spacing-xs: 10rpx; /* 超小间距：10rpx */
  --spacing-sm: 16rpx; /* 小间距：16rpx */
  --spacing-md: 24rpx; /* 中等间距：24rpx */
  --spacing-lg: 32rpx; /* 大间距：32rpx */
  --spacing-xl: 48rpx; /* 超大间距：48rpx */
  --shadow-sm: 0 4rpx 16rpx rgba(0, 0, 0, 0.05); /* 小阴影：轻微的投影效果 */
  --shadow-md: 0 8rpx 24rpx rgba(0, 0, 0, 0.1); /* 中等阴影：明显的投影效果 */
  --transition-fast: 0.2s ease; /* 快速过渡动画：0.2秒缓动 */
}

/* 页面基础样式 */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; /* 字体：系统默认字体栈 */
  font-size: var(--font-size-md); /* 基础字体大小：中等字体 */
  color: var(--text-primary); /* 文字颜色：主要文字颜色 */
  background: linear-gradient(to bottom, #ffb6c1 0%, #fffaf0 100%); /* 背景：粉色到米色的渐变 */
  line-height: 1.5; /* 行高：1.5倍字体大小 */
  -webkit-font-smoothing: antialiased; /* 字体平滑：抗锯齿效果 */
}

* {
  margin: 0; /* 外边距：0 */
  padding: 0; /* 内边距：0 */
  box-sizing: border-box; /* 盒模型：包含边框和内边距 */
}

.container {
  background: transparent; /* 背景：透明 */
  min-height: 100vh; /* 最小高度：100%视口高度 */
  padding-bottom: var(--spacing-xl); /* 底部内边距：超大间距 */
}

/* 搜索区域样式 */
.search-section {
  background: white; /* 背景：白色 */
  padding: var(--spacing-md); /* 内边距：中等间距 */
  border-radius: var(--card-radius); /* 圆角：卡片圆角 */
  margin: 0 var(--spacing-md) var(--spacing-md) var(--spacing-md); /* 外边距：左右中等，上下中等 */
  box-shadow: var(--shadow-sm); /* 阴影：小阴影 */
}

/* 搜索栏样式 */
.search-bar {
  display: flex; /* 布局：弹性布局 */
  align-items: center; /* 垂直对齐：居中 */
  background: var(--bg-color); /* 背景：背景色 */
  border-radius: var(--card-radius); /* 圆角：卡片圆角 */
  padding: var(--spacing-xs) var(--spacing-md); /* 内边距：上下超小，左右中等 */
}

/* 搜索输入框样式 */
/* 组件内容：搜索商品 */
.search-input {
  flex: 1; /* 弹性：占据剩余空间 */
  border: none; /* 边框：无 */
  outline: none; /* 轮廓：无 */
  font-size: var(--font-size-md); /* 字体大小：中等字体 */
  line-height: 1.5; /* 行高：1.5倍字体大小 */
}

/* 清除按钮样式 */
/* 组件内容：× */
.clear-btn {
  font-size: var(--font-size-lg); /* 字体大小：大字体 */
  color: var(--text-muted); /* 颜色：弱化文字颜色 */
  margin-left: var(--spacing-md); /* 左边距：中等间距 */
  padding: var(--spacing-xs); /* 内边距：超小间距 */
}

/* 通用区域样式 */
.section {
  background: var(--bg-white); /* 背景：白色 */
  padding: var(--spacing-md); /* 内边距：中等间距 */
  border-radius: var(--card-radius); /* 圆角：卡片圆角 */
  margin: 0 var(--spacing-md) var(--spacing-md) var(--spacing-md); /* 外边距：左右中等，上下中等 */
  box-shadow: var(--shadow-sm); /* 阴影：小阴影 */
}

/* 区域标题样式 */
.section-header {
  display: flex; /* 布局：弹性布局 */
  justify-content: space-between; /* 水平对齐：两端对齐 */
  align-items: center; /* 垂直对齐：居中 */
  margin-bottom: var(--spacing-md); /* 下边距：中等间距 */
}

/* 区域标题文字样式 */
/* 组件内容：热门推荐、新品推荐 */
.section-title {
  font-size: var(--font-size-lg); /* 字体大小：大字体 */
  font-weight: 600; /* 字体粗细：600 */
  color: var(--text-primary); /* 颜色：主要文字颜色 */
}

/* 查看更多样式 */
/* 组件内容：更多 > */
.section-more {
  font-size: var(--font-size-sm); /* 字体大小：小字体 */
  color: var(--text-muted); /* 颜色：弱化文字颜色 */
}

/* 快捷导航区样式 */
/* 适用组件：专区、社区、品牌、优惠券、收藏 */
.quick-nav {
  background: var(--bg-white); /* 背景：白色 */
  padding: var(--spacing-md); /* 内边距：中等间距 */
  border-radius: var(--card-radius); /* 圆角：卡片圆角 */
  margin: 0 var(--spacing-md) var(--spacing-md) var(--spacing-md); /* 外边距 */
  box-shadow: var(--shadow-sm); /* 阴影：小阴影 */
  display: grid; /* 布局：网格布局 */
  grid-template-columns: repeat(5, 1fr); /* 列数：5列 */
  gap: var(--spacing-sm); /* 间距：小间距 */
}

/* 导航项样式 */
.nav-item {
  display: flex; /* 布局：弹性布局 */
  flex-direction: column; /* 方向：垂直排列 */
  align-items: center; /* 垂直对齐：居中 */
  justify-content: center; /* 水平对齐：居中 */
  gap: 6rpx; /* 间距 */
}

/* 导航图标样式 */
.nav-icon {
  width: 40px; /* 宽度：40px */
  height: 40px; /* 高度：40px */
  border-radius: 50%; /* 圆角：50%圆形 */
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e); /* 背景：粉色渐变 */
  display: flex; /* 布局：弹性布局 */
  align-items: center; /* 垂直对齐：居中 */
  justify-content: center; /* 水平对齐：居中 */
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3); /* 阴影：粉色投影 */
}

/* 导航图标文字样式 */
/* 组件内容：专、社、品、券、藏 */
.nav-icon-text {
  font-size: 16px; /* 字体大小：16px */
  font-weight: 600; /* 字体粗细：600 */
  color: white; /* 颜色：白色 */
}

/* 导航文字样式 */
/* 组件内容：专区、社区、品牌、优惠券、收藏 */
.nav-text {
  font-size: 11px; /* 字体大小：11px */
  color: var(--text-primary); /* 颜色：主要文字颜色 */
  text-align: center; /* 文字对齐：居中 */
}



/* 热门推荐轮播图样式 */
.hot-swipe {
  width: 100%; /* 宽度：100% */
  height: 400rpx; /* 高度：400rpx */
  border-radius: var(--card-radius); /* 圆角：卡片圆角 */
  overflow: hidden; /* 溢出：隐藏超出部分 */
}

/* 轮播图项样式 */
.hot-swipe-item {
  height: 100%; /* 高度：100% */
}



/* 轮播图内容样式 */
.swipe-content {
  position: relative; /* 定位：相对定位 */
  width: 100%; /* 宽度：100% */
  height: 100%; /* 高度：100% */
  overflow: hidden; /* 溢出：隐藏超出部分 */
}

/* 轮播图图片样式 */
.swipe-image {
  width: 100%; /* 宽度：100% */
  height: 100%; /* 高度：100% */
  object-fit: cover; /* 图片适配：覆盖 */
}

/* 轮播图信息样式 */
.swipe-info {
  position: absolute; /* 定位：绝对定位 */
  bottom: 0; /* 底部：0 */
  left: 0; /* 左侧：0 */
  right: 0; /* 右侧：0 */
  padding: var(--spacing-lg); /* 内边距：大间距 */
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent); /* 背景：黑色渐变 */
  color: var(--bg-white); /* 颜色：白色 */
}

/* 商品名称样式 */
/* 组件内容：商品名称 */
.product-name {
  font-size: var(--font-size-lg); /* 字体大小：大字体 */
  font-weight: 600; /* 字体粗细：600 */
  margin-bottom: var(--spacing-xs); /* 下边距：超小间距 */
  line-height: 1.3; /* 行高：1.3倍字体大小 */
  overflow: hidden; /* 溢出：隐藏超出部分 */
  text-overflow: ellipsis; /* 文本溢出：省略号 */
  display: -webkit-box; /* 显示：Webkit弹性盒子 */
  -webkit-line-clamp: 2; /* Webkit：最多显示2行 */
  line-clamp: 2; /* 标准：最多显示2行 */
  -webkit-box-orient: vertical; /* Webkit：垂直方向 */
  box-orient: vertical; /* 标准：垂直方向 */
}

/* 商品元信息样式 */
.product-meta {
  display: flex; /* 布局：弹性布局 */
  flex-direction: column; /* 方向：垂直排列 */
  gap: var(--spacing-xs); /* 间距：超小间距 */
}

/* 商品价格样式 */
/* 组件内容：¥价格 */
.product-price {
  font-size: var(--font-size-xl); /* 字体大小：超大字体 */
  font-weight: bold; /* 字体粗细：粗体 */
  color: var(--bg-white); /* 颜色：白色 */
}

/* 商品统计信息样式 */
/* 组件内容：销量、评分 */
.product-stats {
  display: flex; /* 布局：弹性布局 */
  gap: var(--spacing-md); /* 间距：中等间距 */
  font-size: var(--font-size-sm); /* 字体大小：小字体 */
  color: rgba(255, 255, 255, 0.9); /* 颜色：半透明白色 */
}

/* 评分文字样式 */
/* 组件内容：评分 */
.rating-text {
  color: #ffd700; /* 颜色：金色 */
}

/* 新品轮播图样式 */
.new-swipe {
  width: 100%; /* 宽度：100% */
  height: 400rpx; /* 高度：400rpx */
  border-radius: var(--card-radius); /* 圆角：卡片圆角 */
  overflow: hidden; /* 溢出：隐藏超出部分 */
}

/* 新品轮播图项样式 */
.new-swipe-item {
  height: 100%; /* 高度：100% */
}

/* 加载状态样式 */
/* 组件内容：加载中 */
.loading-state {
  display: flex; /* 布局：弹性布局 */
  justify-content: center; /* 水平对齐：居中 */
  align-items: center; /* 垂直对齐：居中 */
  padding: 80rpx 0; /* 内边距：上下80rpx */
  color: var(--text-muted); /* 颜色：弱化文字颜色 */
}

/* 所有商品网格样式 */
.all-grid {
  display: grid; /* 布局：网格布局 */
  grid-template-columns: repeat(2, 1fr); /* 列数：2列 */
  gap: var(--spacing-md); /* 间距：中等间距 */
}

/* 所有商品项样式 */
.all-item {
  background: var(--bg-color); /* 背景：背景色 */
  border-radius: var(--card-radius); /* 圆角：卡片圆角 */
  overflow: hidden; /* 溢出：隐藏超出部分 */
}

/* 所有商品图片样式 */
.all-image {
  width: 100%; /* 宽度：100% */
  height: 300rpx; /* 高度：300rpx（固定高度） */
  object-fit: cover; /* 图片适配：覆盖 */
  display: block; /* 显示：块级元素 */
}

/* 所有商品信息样式 */
.all-info {
  padding: var(--spacing-sm); /* 内边距：小间距 */
}

/* 所有商品名称样式 */
/* 组件内容：商品名称 */
.all-name {
  display: block; /* 显示：块级元素 */
  font-size: var(--font-size-md); /* 字体大小：中等字体 */
  color: var(--text-primary); /* 颜色：主要文字颜色 */
  margin-bottom: var(--spacing-xs); /* 下边距：超小间距 */
  overflow: hidden; /* 溢出：隐藏超出部分 */
  text-overflow: ellipsis; /* 文本溢出：省略号 */
  white-space: nowrap; /* 空白：不换行 */
}

/* 所有商品价格样式 */
/* 组件内容：¥价格 */
.all-price {
  display: block; /* 显示：块级元素 */
  font-size: var(--font-size-lg); /* 字体大小：大字体 */
  color: var(--primary-color); /* 颜色：主题色 */
  font-weight: 600; /* 字体粗细：600 */
}

/* 所有商品元信息样式 */
.all-meta {
  display: flex; /* 布局：弹性布局 */
  justify-content: space-between; /* 水平对齐：两端对齐 */
  align-items: center; /* 垂直对齐：居中 */
  gap: var(--spacing-xs); /* 间距：超小间距 */
  font-size: var(--font-size-xs); /* 字体大小：超小字体 */
  color: var(--text-muted); /* 颜色：弱化文字颜色 */
}
</style>

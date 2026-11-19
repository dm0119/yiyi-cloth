<template>
  <view class="container">
    <view v-if="loading" class="loading-state">
      <van-loading type="spinner" vertical>加载中...</van-loading>
    </view>

    <van-empty v-else-if="!product" description="商品不存在" />

    <view v-else>
      <!-- 商品图片轮播 -->
      <view class="swiper-container">
        <swiper 
          class="product-swiper" 
          :indicator-dots="true" 
          :autoplay="true" 
          :interval="3000" 
          :duration="500"
          :circular="true"
          indicator-color="rgba(255, 255, 255, 0.5)"
          indicator-active-color="#fff"
          @change="onSwiperChange"
        >
          <swiper-item v-for="(img, index) in getSwiperImages()" :key="index">
            <image 
              :src="getImageUrl(img)" 
              mode="widthFix"
              class="detail-image"
              @click="previewImage(getImageUrl(img), getSwiperImages().map(i => getImageUrl(i)))"
            />
          </swiper-item>
        </swiper>
        <view class="swiper-index">
          {{ currentImageIndex + 1 }} / {{ getSwiperImages().length }}
        </view>
      </view>

      <view class="detail-content">
        <view class="price-section">
          <view class="price-info">
            <text class="price-symbol">¥</text>
            <text class="price-value">{{ product.price.toFixed(2) }}</text>
          </view>
          <van-tag type="primary">库存：{{ product.stock }}</van-tag>
        </view>

        <text class="product-name">{{ product.name }}</text>

        <!-- 所属店铺 -->
        <view v-if="product.shop_name" class="shop-info" @click="goToShop">
          <text class="shop-label">店铺：</text>
          <view class="shop-name-wrapper">
            <text class="shop-name">{{ product.shop_name }}</text>
            <view v-if="product.shop_is_brand" class="brand-badge">
              <text class="brand-icon">⭐</text>
              <text class="brand-text">品牌</text>
            </view>
          </view>
          <text class="shop-arrow">></text>
        </view>

        <van-divider />

        <!-- SKU 选择 -->
        <view v-if="skus && skus.length > 0" class="sku-section" @click="showSkuPicker = true">
          <view class="sku-selector">
            <text class="selector-label">选择</text>
            <view class="selector-value">
              <text class="selected-text">{{ selectedSkuText }}</text>
              <text class="selector-arrow">›</text>
            </view>
          </view>
        </view>

        <!-- SKU 选择器弹窗 -->
        <van-popup v-model:show="showSkuPicker" position="bottom" round>
          <view class="sku-picker-container">
            <view class="sku-picker-header">
              <text class="sku-picker-title">选择规格</text>
              <text class="sku-picker-close" @click="showSkuPicker = false">✕</text>
            </view>
            <view v-if="showStockAlert" class="stock-alert">
              <text class="alert-icon">⚠️</text>
              <text class="alert-text">库存不足，无法购买，等待商家补货中</text>
            </view>
            <view class="sku-picker-list">
              <view 
                v-for="sku in skus" 
                :key="sku.id"
                class="sku-picker-item"
                :class="{ active: selectedSkuId === sku.id, 'out-of-stock': sku.stock <= 0 }"
                @click="handleSkuClick(sku)"
              >
                <view class="sku-item-info">
                  <text class="sku-item-text">{{ sku.color }} / {{ sku.size }}{{ product.fit_type ? ' / ' + getFitTypeText(product.fit_type) : '' }}</text>
                  <text class="sku-item-stock">库存：{{ sku.stock }}</text>
                </view>
                <text v-if="selectedSkuId === sku.id" class="sku-item-check">✓</text>
              </view>
            </view>
          </view>
        </van-popup>

        <view class="quantity-section">
          <text class="option-label">数量</text>
          <van-stepper v-model="quantity" :max="currentSkuStock || 99" />
        </view>

        <van-divider />

        <!-- 商品详情 -->
        <view class="description-section">
          <text class="section-title">商品详情</text>
          <text class="description">{{ product.description || '暂无描述' }}</text>
        </view>

        <!-- 尺码参考 -->
        <view v-if="product.size_recommendations" class="size-chart-section">
          <view class="size-chart-header" @click="showSizeChart = !showSizeChart">
            <text class="section-title">📏 尺码参考</text>
            <text class="size-chart-arrow" :class="{ expanded: showSizeChart }">›</text>
          </view>
          
          <view v-if="showSizeChart" class="size-chart-content">
            <text class="size-text">{{ product.size_recommendations }}</text>
          </view>
        </view>

        <!-- 商品评价区域 -->
        <view class="reviews-section">
          <view class="reviews-header" @click="showReviews = !showReviews">
            <text class="section-title">商品评价</text>
            <text class="reviews-arrow" :class="{ expanded: showReviews }">›</text>
          </view>
          
          <view v-if="showReviews" class="reviews-content">
            <view class="reviews-stats">
              <view class="avg-rating">
                <text class="rating-value">{{ avgRating }}</text>
                <text class="rating-text">分</text>
              </view>
              <text class="total-reviews">共 {{ totalReviews }} 条评价</text>
            </view>

            <view class="reviews-list">
              <view 
                v-for="review in reviews" 
                :key="review.id"
                class="review-item"
              >
                <view class="review-header">
                  <text class="user-name">{{ review.user_name || '匿名用户' }}</text>
                  <view class="review-rating-stars">
                    <text 
                      v-for="n in 5" 
                      :key="n"
                      :class="n <= review.rating ? 'star full-star' : 'star void-star'"
                    >
                      {{ n <= review.rating ? '★' : '☆' }}
                    </text>
                  </view>
                </view>
                <view class="review-content">
                  <text class="review-text">{{ review.content || '此用户未填写评价内容' }}</text>
                </view>
                <view v-if="review.images && review.images.length > 0" class="review-images">
                  <image
                    v-for="(image, index) in review.images"
                    :key="index"
                    :src="image"
                    class="review-image"
                    @click="previewImage(image, review.images)"
                  />
                </view>
                <view class="review-meta">
                  <text class="review-time">{{ formatDate(review.created_at) }}</text>
                </view>
              </view>
            </view>

            <view v-if="reviews.length === 0" class="no-reviews">
              <text>暂无评价</text>
            </view>
          </view>
        </view>
      </view>

      <view class="bottom-bar safe-area-bottom">
        <view class="bar-item favorite-btn" @click="toggleFavorite">
          <text class="bar-icon">{{ isFavorited ? '❤️' : '🤍' }}</text>
          <text class="bar-text">{{ isFavorited ? '已收藏' : '收藏' }}</text>
        </view>
        <view class="bar-item service-btn" @click="contactService">
          <text class="bar-icon">💬</text>
          <text class="bar-text">咨询商品</text>
        </view>
        <view class="bar-item add-btn" @click="addToCart">
          <text>加入购物车</text>
        </view>
        <view class="bar-item buy-btn" @click="buyNow">
          <text>立即购买</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { productApi, reviewApi, favoritesApi, merchantApi } from '@/services/api.js'
import { saveBrowseHistory } from '@/utils/historyUtil.js'

const product = ref(null)
const loading = ref(true)
const quantity = ref(1)
const API_BASE = 'http://localhost:3000'
const currentImageIndex = ref(0)
const skus = ref([])
const selectedSkuId = ref(null)
const showSkuPicker = ref(false)
const showStockAlert = ref(false)
const showReviews = ref(false)
const showSizeChart = ref(true)

// 评价相关数据
const reviews = ref([])
const avgRating = ref(0)
const totalReviews = ref(0)
const isFavorited = ref(false)

// 版型转换：英文 -> 中文
function getFitTypeText(fitType) {
  const fitTypeMap = {
    'loose': '宽松版型',
    'regular': '标准版型',
    'slim': '修身版型'
  }
  return fitTypeMap[fitType] || fitType
}

// 计算选中的 SKU 文本
const selectedSkuText = computed(() => {
  const sku = currentSku.value
  if (!sku) return '请选择规格'
  const fitType = product.value?.fit_type ? ` / ${getFitTypeText(product.value.fit_type)}` : ''
  return `${sku.color} / ${sku.size}${fitType}`
})

function confirmSku(sku) {
  selectedSkuId.value = sku.id
  showSkuPicker.value = false
}

function handleSkuClick(sku) {
  if (sku.stock <= 0) {
    showStockAlert.value = true
    setTimeout(() => {
      showStockAlert.value = false
    }, 2000)
    return
  }
  confirmSku(sku)
}

function getImageUrl(url) {
  if (!url) return 'https://via.placeholder.com/750x750'
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  if (url.startsWith('/uploads/')) {
    return `${API_BASE}${url}`
  }
  return url
}

function getSwiperImages() {
  if (!product.value) return []
  const images = []
  if (product.value.image) {
    images.push(product.value.image)
  }
  if (product.value.images && Array.isArray(product.value.images)) {
    images.push(...product.value.images)
  }
  if (images.length === 0) {
    images.push('https://via.placeholder.com/750x750')
  }
  return images
}

function onSwiperChange(e) {
  currentImageIndex.value = e.detail.current
}

function previewImage(current, urls) {
  uni.previewImage({
    current,
    urls
  })
}

function selectSku(sku) {
  selectedSkuId.value = sku.id
}

// 计算当前选中的 SKU
const currentSku = computed(() => {
  if (!skus.value || skus.value.length === 0) return null
  return skus.value.find(sku => sku.id === selectedSkuId.value)
})

// 计算当前 SKU 的库存
const currentSkuStock = computed(() => {
  const sku = currentSku.value
  if (!sku) return product.value?.stock || 0
  return sku.stock
})

async function loadProduct(id) {
  loading.value = true
  try {
    const res = await productApi.getById(id)
    console.log('商品详情 API 响应:', res)
    product.value = res.data
    console.log('商品数据:', product.value)
    console.log('店铺名称:', product.value?.shop_name)
    
    if (res.data?.skus && res.data.skus.length > 0) {
      skus.value = res.data.skus
    }
    
    if (res.data) {
      saveBrowseHistory({
        id: res.data.id,
        name: res.data.name,
        price: res.data.price,
        image: res.data.image
      })
    }
    
    await loadReviews(id)
    await checkFavorite(id)
  } catch (error) {
    console.error('加载商品失败:', error)
  } finally {
    loading.value = false
  }
}

function addToCart() {
  const isLoggedIn = uni.getStorageSync('isLoggedIn')
  if (!isLoggedIn) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/user/login'
      })
    }, 1500)
    return
  }

  const sku = currentSku.value
  const cart = uni.getStorageSync('cart') || []
  
  const cartItem = {
    id: Date.now(),
    productId: product.value.id,
    name: product.value.name,
    price: product.value.price,
    image: product.value.image,
    stock: sku ? sku.stock : product.value.stock,
    quantity: quantity.value,
    size: sku?.size || '',
    color: sku?.color || '',
    skuId: sku ? sku.id : null,
    shop_id: product.value.shop_id // 添加店铺 ID，用于优惠券隔离
  }
  
  cart.push(cartItem)
  uni.setStorageSync('cart', cart)
  
  // 尝试同步到服务器
  if (isLoggedIn) {
    try {
      // 这里可以调用API同步购物车数据到服务器
      // await cartApi.addToCart(cartItem)
    } catch (error) {
      console.error('同步购物车到服务器失败:', error)
      // 同步失败不影响本地操作
    }
  }
  
  uni.showToast({
    title: '已加入购物车',
    icon: 'success'
  })
}

async function toggleFavorite() {
  const isLoggedIn = uni.getStorageSync('isLoggedIn')
  if (!isLoggedIn) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/user/login'
      })
    }, 1500)
    return
  }

  try {
    if (isFavorited.value) {
      const res = await favoritesApi.remove(product.value.id)
      if (res.success) {
        isFavorited.value = false
        uni.showToast({
          title: '取消收藏成功',
          icon: 'success'
        })
      }
    } else {
      const res = await favoritesApi.add(product.value.id)
      if (res.success) {
        isFavorited.value = true
        uni.showToast({
          title: '收藏成功',
          icon: 'success'
        })
      }
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
  }
}

async function checkFavorite(productId) {
  try {
    const userInfo = uni.getStorageSync('userInfo')
    if (!userInfo) {
      isFavorited.value = false
      return
    }

    const res = await favoritesApi.check(productId)
    if (res.success) {
      isFavorited.value = res.data.is_favorited
    } else {
      isFavorited.value = false
    }
  } catch (error) {
    console.error('检查收藏状态失败:', error)
    isFavorited.value = false
  }
}

function buyNow() {
  const isLoggedIn = uni.getStorageSync('isLoggedIn')
  if (!isLoggedIn) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/user/login'
      })
    }, 1500)
    return
  }

  const sku = currentSku.value
  const item = {
    id: Date.now(),
    product_id: product.value.id,
    name: product.value.name,
    price: product.value.price,
    quantity: quantity.value,
    size: sku?.size || '',
    color: sku?.color || '',
    image: product.value.image,
    stock: sku ? sku.stock : product.value.stock,
    shop_id: product.value.shop_id // 添加店铺 ID，用于优惠券隔离
  }

  uni.navigateTo({
    url: `/pages/order/checkout?items=${encodeURIComponent(JSON.stringify([item]))}`
  })
}

function contactService() {
  // 检查登录状态（兼容移动端和管理端登录）
  let user = uni.getStorageSync('userInfo')
  let loggedIn = uni.getStorageSync('isLoggedIn')

  if (!loggedIn || !user) {
    const adminUser = uni.getStorageSync('admin_user')
    const adminToken = uni.getStorageSync('admin_token')

    if (adminToken && adminUser) {
      user = {
        id: adminUser.id,
        username: adminUser.username,
        phone: adminUser.phone,
        name: adminUser.name,
        role: adminUser.role
      }
      loggedIn = true

      // 保存为移动端的登录信息格式
      uni.setStorageSync('userInfo', user)
      uni.setStorageSync('isLoggedIn', true)
    }
  }

  if (!loggedIn || !user) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/user/login'
      })
    }, 1500)
    return
  }

  const relatedItem = {
    id: product.value.id,
    type: 'product',
    name: product.value.name,
    price: product.value.price,
    image: product.value.image
  }

  uni.navigateTo({
    url: `/pages/user/service?relatedItems=${encodeURIComponent(JSON.stringify([relatedItem]))}`
  })
}

async function loadReviews(productId) {
  try {
    const reviewsRes = await reviewApi.getByProduct(productId)
    if (reviewsRes.success) {
      reviews.value = reviewsRes.data.reviews || []
      totalReviews.value = reviewsRes.data.pagination?.total || 0
    }
    
    const statsRes = await reviewApi.getStatsByProduct(productId)
    if (statsRes.success) {
      const stats = statsRes.data
      avgRating.value = stats.avg_rating || 0
      totalReviews.value = stats.total_reviews || 0
    }
  } catch (error) {
    console.error('加载评价数据失败:', error)
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前'
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前'
  } else if (diff < 7 * day) {
    return Math.floor(diff / day) + '天前'
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

function goToShop() {
  if (product.value && product.value.shop_id) {
    uni.navigateTo({
      url: `/pages/shop/detail?id=${product.value.shop_id}`
    })
  }
}

onLoad((options) => {
  if (options.id) {
    loadProduct(parseInt(options.id))
  }
})
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.swiper-container {
  position: relative;
  width: 100%;
  height: 750rpx;
  background: #fff;
  
  .product-swiper {
    width: 100%;
    height: 100%;
  }
  
  .detail-image {
    width: 100%;
    height: 100%;
  }
  
  .swiper-index {
    position: absolute;
    bottom: 20rpx;
    right: 20rpx;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
  }
}

.detail-content {
  background: #fff;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.price-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
  
  .price-info {
    display: flex;
    align-items: baseline;
    
    .price-symbol {
      font-size: 28rpx;
      color: #ff4400;
      margin-right: 4rpx;
    }
    
    .price-value {
      font-size: 48rpx;
      color: #ff4400;
      font-weight: bold;
    }
  }
}

.product-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.shop-info {
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
  background: linear-gradient(135deg, #fff3f3 0%, #fff9f9 100%);
  border-radius: 12rpx;
  margin: 16rpx 0;
  border: 1px solid #ffe0e0;
  
  .shop-label {
    font-size: 28rpx;
    color: #ff6b6b;
    font-weight: 500;
  }
  
  .shop-name-wrapper {
    display: flex;
    align-items: center;
    gap: 12rpx;
    flex: 1;
    margin: 0 12rpx;
  }
  
  .shop-name {
    font-size: 30rpx;
    color: #333;
    flex: 1;
    font-weight: 600;
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
  
  .shop-arrow {
    font-size: 28rpx;
    color: #ff6b6b;
  }
}

.option-label {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.sku-section {
  margin-bottom: 20rpx;
  
  .sku-selector {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 24rpx;
    background: #f5f5f5;
    border-radius: 8rpx;
    
    .selector-label {
      font-size: 28rpx;
      color: #666;
    }
    
    .selector-value {
      display: flex;
      align-items: center;
      gap: 8rpx;
      
      .selected-text {
        font-size: 28rpx;
        color: #333;
      }
      
      .selector-arrow {
        font-size: 32rpx;
        color: #999;
      }
    }
  }
}

.sku-picker-container {
  padding: 30rpx;
  max-height: 60vh;
  
  .sku-picker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30rpx;
    
    .sku-picker-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .sku-picker-close {
      font-size: 40rpx;
      color: #999;
      padding: 10rpx;
    }
  }
  
  .stock-alert {
    display: flex;
    align-items: center;
    gap: 12rpx;
    padding: 20rpx 24rpx;
    margin-bottom: 20rpx;
    background: #fff3cd;
    border: 1rpx solid #ffc107;
    border-radius: 8rpx;
    
    .alert-icon {
      font-size: 32rpx;
    }
    
    .alert-text {
      font-size: 26rpx;
      color: #856404;
      flex: 1;
    }
  }
  
  .sku-picker-list {
    max-height: 50vh;
    overflow-y: auto;
    
    .sku-picker-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24rpx;
      margin-bottom: 16rpx;
      background: #f5f5f5;
      border-radius: 8rpx;
      border: 2rpx solid transparent;
      
      &.active {
        border-color: #007aff;
        background: #e6f2ff;
        
        .sku-item-text {
          color: #007aff;
        }
      }
      
      &.out-of-stock {
        opacity: 0.5;
        background: #f0f0f0;
        cursor: not-allowed;
        
        .sku-item-text {
          color: #999;
        }
        
        .sku-item-stock {
          color: #ff4444;
        }
      }
      
      .sku-item-info {
        display: flex;
        flex-direction: column;
        gap: 8rpx;
        
        .sku-item-text {
          font-size: 28rpx;
          color: #333;
        }
        
        .sku-item-stock {
          font-size: 24rpx;
          color: #999;
        }
      }
      
      .sku-item-check {
        font-size: 36rpx;
        color: #007aff;
      }
    }
  }
}

.quantity-section {
  margin-bottom: 20rpx;
}

.description-section {
  margin-bottom: 20rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 16rpx;
  }
  
  .description {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
    display: block;
  }
}

.size-chart-section {
  background: #fff;
  padding: 24rpx;
  margin-bottom: 20rpx;
  border-radius: 12rpx;
  
  .size-chart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8rpx 0;
    
    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      display: block;
      margin-bottom: 0;
    }
    
    .size-chart-arrow {
      font-size: 40rpx;
      color: #999;
      transition: transform 0.3s ease;
      
      &.expanded {
        transform: rotate(90deg);
      }
    }
  }
  
  .size-chart-content {
    background: linear-gradient(135deg, #fff9f0 0%, #fff5e6 100%);
    padding: 24rpx;
    border-radius: 12rpx;
    border-left: 6rpx solid #ff9800;
    box-shadow: 0 2rpx 8rpx rgba(255, 152, 0, 0.1);
    margin-top: 16rpx;
    
    .size-text {
      font-size: 28rpx;
      color: #666;
      line-height: 1.8;
      white-space: pre-wrap;
      word-break: break-word;
    }
  }
}

.reviews-section {
  .reviews-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 0;
    
    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .reviews-arrow {
      font-size: 36rpx;
      color: #999;
      transition: transform 0.3s;
      
      &.expanded {
        transform: rotate(90deg);
      }
    }
  }
  
  .reviews-content {
    padding-top: 10rpx;
  }
  
  .reviews-stats {
    display: flex;
    align-items: center;
    gap: 20rpx;
    margin-bottom: 20rpx;
    
    .avg-rating {
      display: flex;
      align-items: baseline;
      
      .rating-value {
        font-size: 48rpx;
        font-weight: bold;
        color: #ff9900;
      }
      
      .rating-text {
        font-size: 24rpx;
        color: #999;
        margin-left: 8rpx;
      }
    }
    
    .total-reviews {
      font-size: 26rpx;
      color: #999;
    }
  }
  
  .reviews-list {
    .review-item {
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f0f0f0;
      
      .review-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12rpx;
        
        .user-name {
          font-size: 28rpx;
          color: #666;
        }
        
        .review-rating-stars {
          display: flex;
          gap: 4rpx;
          
          .star {
            font-size: 24rpx;
            
            &.full-star {
              color: #ffd21e;
            }
            
            &.void-star {
              color: #ddd;
            }
          }
        }
      }
      
      .review-content {
        margin-bottom: 12rpx;
        
        .review-text {
          font-size: 28rpx;
          color: #333;
          line-height: 1.5;
          display: block;
        }
      }
      
      .review-images {
        display: flex;
        gap: 12rpx;
        margin-bottom: 12rpx;
        flex-wrap: wrap;
        
        .review-image {
          width: 150rpx;
          height: 150rpx;
          border-radius: 8rpx;
          object-fit: cover;
        }
      }
      
      .review-meta {
        .review-time {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
  }
  
  .no-reviews {
    text-align: center;
    padding: 40rpx;
    color: #999;
    font-size: 28rpx;
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 100;
  
  .bar-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 20rpx;
    font-size: 22rpx;
    color: #666;
    
    &.favorite-btn,
    &.service-btn {
      .bar-icon {
        font-size: 36rpx;
        margin-bottom: 4rpx;
      }
    }
    
    &.add-btn {
      flex: 1;
      background: linear-gradient(135deg, #ffb347, #ffcc33);
      color: #fff;
      height: 72rpx;
      border-radius: 36rpx;
      font-size: 26rpx;
      font-weight: bold;
      margin: 0 16rpx;
      justify-content: center;
    }
    
    &.buy-btn {
      flex: 1;
      background: linear-gradient(135deg, #ff6b6b, #ff4757);
      color: #fff;
      height: 72rpx;
      border-radius: 36rpx;
      font-size: 26rpx;
      font-weight: bold;
      justify-content: center;
    }
  }
}
</style>

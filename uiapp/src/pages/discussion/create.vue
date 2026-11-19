<template>
  <view class="container">
    <view class="header">
      <van-icon name="arrow-left" size="24" @click="goBack" />
      <text class="title">发布讨论</text>
      <van-button type="primary" size="small" @click="submitDiscussion">发布</van-button>
    </view>
    
    <view class="form">
      <input 
        v-model="title" 
        class="title-input" 
        placeholder="请输入标题"
      />
      <textarea 
        v-model="content" 
        class="content-input" 
        placeholder="请输入内容"
        rows="6"
      />
      
      <view class="section">
        <text class="section-title">图片</text>
        <view class="image-upload">
          <view v-for="(image, index) in images" :key="index" class="image-item">
            <image :src="image" class="image" mode="aspectFill" />
            <van-icon name="cross" size="20" class="delete-icon" @click="deleteImage(index)" />
          </view>
          <view v-if="images.length < 9" class="upload-btn" @click="chooseImage">
            <van-icon name="camera-o" size="40" />
            <text>添加图片</text>
          </view>
        </view>
      </view>
      
      <view class="section">
        <text class="section-title">关联商品</text>
        <view class="product-choose">
          <view v-for="product in selectedProducts" :key="product.id" class="product-item">
            <image :src="getImageUrl(product.image)" class="product-image" mode="aspectFill" />
            <text class="product-name">{{ product.name }}</text>
            <text class="product-price">¥{{ product.price.toFixed(2) }}</text>
            <van-icon name="cross" size="20" class="delete-icon" @click="removeProduct(product.id)" />
          </view>
          <view v-if="selectedProducts.length < 5" class="choose-btn" @click="showProductSelector">
            <van-icon name="plus" size="24" />
            <text>选择商品</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 商品选择弹窗 -->
    <van-popup v-model:show="showProductPopup" position="bottom" :style="{ height: '80%' }">
      <view class="popup-header">
        <text class="popup-title">选择商品</text>
        <van-icon name="cross" size="24" @click="showProductPopup = false" />
      </view>
      <view class="search-bar">
        <input 
          v-model="searchKeyword" 
          class="search-input" 
          placeholder="搜索商品"
          @confirm="searchProducts"
        />
        <van-icon name="search" size="20" />
      </view>
      <van-list
        v-model:loading="productLoading"
        :finished="productFinished"
        finished-text="没有更多了"
        @load="loadProducts"
      >
        <view 
          v-for="product in products" 
          :key="product.id"
          class="product-select-item"
          @click="selectProduct(product)"
        >
          <image :src="getImageUrl(product.image)" class="product-select-image" mode="aspectFill" />
          <view class="product-select-info">
            <text class="product-select-name">{{ product.name }}</text>
            <text class="product-select-price">¥{{ product.price.toFixed(2) }}</text>
          </view>
          <van-icon 
            :name="isSelected(product.id) ? 'success' : 'circle'" 
            size="24" 
            :color="isSelected(product.id) ? '#1989fa' : '#999'"
          />
        </view>
      </van-list>
    </van-popup>
    
    <van-loading v-if="submitting" type="spinner" vertical>发布中...</van-loading>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { discussionApi, productApi } from '@/services/api.js'

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

const title = ref('')
const content = ref('')
const images = ref([])
const selectedProducts = ref([])
const submitting = ref(false)

// 商品选择相关
const showProductPopup = ref(false)
const products = ref([])
const productLoading = ref(false)
const productFinished = ref(false)
const searchKeyword = ref('')
const page = ref(1)

async function chooseImage() {
  uni.chooseImage({
    count: 9 - images.value.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      try {
        uni.showLoading({ title: '上传中...' })
        const uploadedImages = []
        for (const filePath of res.tempFilePaths) {
          const imageUrl = await discussionApi.uploadCommentImage(filePath)
          uploadedImages.push(imageUrl)
        }
        images.value = [...images.value, ...uploadedImages]
        uni.hideLoading()
        uni.showToast({ title: '图片上传成功', icon: 'success' })
      } catch (error) {
        uni.hideLoading()
        uni.showToast({ title: '图片上传失败', icon: 'none' })
        console.error('上传图片失败:', error)
      }
    }
  })
}

function deleteImage(index) {
  images.value.splice(index, 1)
}

function showProductSelector() {
  loadProducts()
  showProductPopup.value = true
}

async function loadProducts() {
  try {
    const res = await productApi.getList()
    if (res.success && res.data) {
      products.value = res.data
      productFinished.value = true
    }
  } catch (error) {
    console.error('加载商品失败:', error)
  } finally {
    productLoading.value = false
  }
}

async function searchProducts() {
  try {
    const res = await productApi.search(searchKeyword.value)
    if (res.success && res.data) {
      products.value = res.data
      productFinished.value = true
    }
  } catch (error) {
    console.error('搜索商品失败:', error)
  }
}

function isSelected(productId) {
  return selectedProducts.value.some(p => p.id === productId)
}

function selectProduct(product) {
  if (isSelected(product.id)) {
    removeProduct(product.id)
  } else if (selectedProducts.value.length < 5) {
    selectedProducts.value.push(product)
  } else {
    uni.showToast({ title: '最多选择5个商品', icon: 'none' })
  }
}

function removeProduct(productId) {
  selectedProducts.value = selectedProducts.value.filter(p => p.id !== productId)
}

async function submitDiscussion() {
  if (!title.value.trim()) {
    uni.showToast({ title: '请输入标题', icon: 'none' })
    return
  }
  if (!content.value.trim()) {
    uni.showToast({ title: '请输入内容', icon: 'none' })
    return
  }
  
  submitting.value = true
  try {
    const res = await discussionApi.createDiscussion({
      title: title.value,
      content: content.value,
      product_ids: selectedProducts.value.map(p => p.id),
      images: images.value
    })
    if (res.success) {
      uni.showToast({ title: '发布成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1000)
    }
  } catch (error) {
    console.error('发布讨论失败:', error)
    uni.showToast({ title: '发布失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

function goBack() {
  uni.navigateBack()
}

onMounted(() => {
  // 初始化
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
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.form {
  background: var(--bg-white);
  margin: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--card-radius);
  box-shadow: var(--shadow-sm);
}

.title-input {
  width: 100%;
  font-size: var(--font-size-lg);
  font-weight: 600;
  padding: var(--spacing-md) 0;
  border: none;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--spacing-md);
  min-height: 80rpx;
}

.content-input {
  width: 100%;
  font-size: var(--font-size-base);
  line-height: 1.5;
  padding: var(--spacing-sm) 0;
  border: none;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--spacing-md);
  resize: none;
}

.section {
  margin-bottom: var(--spacing-md);
}

.section-title {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.image-upload {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.image-item {
  position: relative;
  width: 120rpx;
  height: 120rpx;
}

.image {
  width: 100%;
  height: 100%;
  border-radius: var(--card-radius);
}

.delete-icon {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 50%;
  padding: 4rpx;
}

.upload-btn {
  width: 120rpx;
  height: 120rpx;
  border: 1px dashed var(--border-color);
  border-radius: var(--card-radius);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.product-choose {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.product-item {
  position: relative;
  width: 150rpx;
  background: var(--bg-color);
  border-radius: var(--card-radius);
  padding: var(--spacing-xs);
}

.product-image {
  width: 100%;
  height: 120rpx;
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

.choose-btn {
  width: 150rpx;
  height: 150rpx;
  border: 1px dashed var(--border-color);
  border-radius: var(--card-radius);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

/* 商品选择弹窗样式 */
.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.popup-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.search-bar {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--bg-color);
  margin: var(--spacing-md);
  border-radius: var(--card-radius);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: var(--font-size-base);
}

.product-select-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.product-select-image {
  width: 100rpx;
  height: 100rpx;
  border-radius: var(--card-radius);
  margin-right: var(--spacing-md);
}

.product-select-info {
  flex: 1;
}

.product-select-name {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-select-price {
  font-size: var(--font-size-base);
  color: var(--primary-color);
  font-weight: 500;
}
</style>
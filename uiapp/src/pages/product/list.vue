<template>
  <view class="container">
    <view class="category-layout">
      <!-- 左侧一级分类竖列 -->
      <view class="primary-category">
        <view
          v-for="category in primaryCategories"
          :key="category.id"
          class="primary-item"
          :class="{ active: selectedPrimaryCategory === category.id }"
          @click="selectPrimaryCategory(category.id)"
        >
          {{ category.name }}
        </view>
      </view>
      
      <!-- 右侧二级分类方格 -->
      <view class="secondary-category">
        <view class="secondary-grid">
          <view
            v-for="category in secondaryCategories"
            :key="category.id"
            class="secondary-item"
            :class="{ active: selectedSecondaryCategory === category.id }"
            @click="selectSecondaryCategory(category.id)"
          >
            <image 
              :src="getCategoryIcon(category.id)" 
              class="category-icon" 
              mode="aspectFill"
            />
            <text class="category-name">{{ category.name }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { productApi, categoryApi, hotProductApi } from '@/services/api.js'

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

// 根据分类ID获取图标
function getCategoryIcon(categoryId) {
  const iconMap = {
    // 大码女装 (62)
    67: '/static/category-icons/dress.png',
    69: '/static/category-icons/tops.png',
    70: '/static/category-icons/pants.png',
    71: '/static/category-icons/skirts.png',
    72: '/static/category-icons/coats.png',
    73: '/static/category-icons/suits.png',
    75: '/static/category-icons/shirts.png',
    // 大码男装 (63)
    76: '/static/category-icons/tshirts.png',
    77: '/static/category-icons/mens-shirts.png',
    79: '/static/category-icons/mens-pants.png',
    80: '/static/category-icons/mens-coats.png',
    81: '/static/category-icons/jackets.png',
    82: '/static/category-icons/sportswear.png',
    83: '/static/category-icons/casual.png',
    84: '/static/category-icons/formal.png',
    // 内衣家居 (64)
    85: '/static/category-icons/bras.png',
    86: '/static/category-icons/underwear.png',
    78: '/static/category-icons/loungewear-pants.png',
    87: '/static/category-icons/pajamas.png',
    88: '/static/category-icons/loungewear.png',
    89: '/static/category-icons/thermal.png',
    90: '/static/category-icons/socks.png',
    91: '/static/category-icons/swimwear.png',
    // 运动户外 (65)
    92: '/static/category-icons/sports-tshirts.png',
    93: '/static/category-icons/sports-pants.png',
    94: '/static/category-icons/sports-coats.png',
    95: '/static/category-icons/sports-shoes.png'
  }
  return iconMap[categoryId] || '/static/category-icons/default.png'
}

// 分类相关变量
const allCategories = ref([])
const primaryCategories = ref([])  // 一级分类
const secondaryCategories = ref([])  // 二级分类

// 选中状态
const selectedPrimaryCategory = ref(0)
const selectedSecondaryCategory = ref(0)

async function loadCategories() {
  try {
    const res = await categoryApi.getTree()
    if (res.success && res.data) {
      allCategories.value = res.data
      // 提取一级分类
      primaryCategories.value = res.data.map(cat => ({
        id: cat.id,
        name: cat.name
      }))
      
      // 默认选中第一个一级分类
      if (primaryCategories.value.length > 0) {
        selectPrimaryCategory(primaryCategories.value[0].id)
      }
    }
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 选择一级分类
function selectPrimaryCategory(id) {
  selectedPrimaryCategory.value = id
  selectedSecondaryCategory.value = 0
  
  // 找到对应的一级分类，提取其二级分类
  const primary = allCategories.value.find(cat => cat.id === id)
  if (primary && primary.children) {
    secondaryCategories.value = primary.children.map(cat => ({
      id: cat.id,
      name: cat.name
    }))
  } else {
    secondaryCategories.value = []
  }
  
  // 不再自动跳转到商品列表，让用户在分类页面选择二级分类
}

// 选择二级分类
function selectSecondaryCategory(id) {
  selectedSecondaryCategory.value = id
  
  // 跳转到商品列表页面，传递二级分类ID
  uni.navigateTo({
    url: `/pages/product/category-list?category=${id}&level=2`
  })
}

// 处理页面传入的参数
onLoad(async (options) => {
  // 首先加载分类列表
  await loadCategories()
})

// 初始加载
onMounted(async () => {
  if (primaryCategories.value.length === 0) {
    await loadCategories()
  }
})
</script>

<style scoped>
.container {
  background: transparent;
  min-height: 100vh;
  padding: 0;
  margin: 0;
}

/* 分类布局 */
.category-layout {
  display: flex;
  height: 100vh;
  background: var(--bg-white);
  overflow: hidden;
}

/* 左侧一级分类竖列 */
.primary-category {
  width: 160rpx;
  background: var(--bg-color);
  border-right: 1rpx solid var(--border-color);
}

.primary-item {
  padding: var(--spacing-xl) var(--spacing-md);
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  text-align: center;
  border-bottom: 1rpx solid var(--border-color);
  transition: all var(--transition-fast);
}

.primary-item.active {
  background: var(--bg-white);
  color: var(--primary-color);
  font-weight: 600;
  border-left: 4rpx solid var(--primary-color);
}

/* 右侧二级分类方格 */
.secondary-category {
  flex: 1;
  padding: var(--spacing-lg);
  height: 100%;
  overflow-y: auto;
}

.secondary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
}

/* 滚动条样式 */
.secondary-category::-webkit-scrollbar {
  width: 4rpx;
}

.secondary-category::-webkit-scrollbar-track {
  background: transparent;
}

.secondary-category::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 2rpx;
}

.secondary-item {
  padding: var(--spacing-lg);
  background: var(--bg-color);
  border-radius: var(--card-radius);
  font-size: var(--font-size-base);
  color: var(--text-primary);
  text-align: center;
  transition: all var(--transition-fast);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.category-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  object-fit: cover;
}

.category-name {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  text-align: center;
  line-height: 1.3;
  font-weight: 500;
}

.secondary-item:active {
  transform: scale(0.95);
}

.secondary-item.active {
  background: #ffc0cb; /* 水蜜桃粉 */
}

.secondary-item.active .category-name {
  color: var(--bg-white);
}


</style>

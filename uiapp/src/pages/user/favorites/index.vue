<template>
  <view class="container">
    <view class="header">
      <text class="title">我的收藏</text>
    </view>

    <!-- Tab 切换 -->
    <view class="tab-bar">
      <view
        class="tab-item"
        :class="{ active: activeTab === 'product' }"
        @click="switchTab('product')"
      >
        <text>商品</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: activeTab === 'shop' }"
        @click="switchTab('shop')"
      >
        <text>店铺</text>
      </view>
    </view>

    <!-- 商品收藏 -->
    <template v-if="activeTab === 'product'">
      <view class="sort-bar">
        <view
          v-for="option in sortOptions"
          :key="option.value"
          class="sort-option"
          :class="{ active: currentSort === option.value }"
          @click="changeSort(option.value)"
        >
          <text>{{ option.label }}</text>
        </view>
      </view>

      <view class="product-grid" v-if="!loading && favorites.length > 0">
        <view
          v-for="item in favorites"
          :key="item.id"
          class="product-card"
        >
          <view class="product-image-container" @click="goToDetail(item.id)">
            <image
              :src="item.image || 'https://via.placeholder.com/300x300'"
              class="product-image"
              mode="aspectFill"
            />
          </view>
          <view class="product-info">
            <text class="product-title" @click="goToDetail(item.id)">{{ item.name }}</text>
            <view class="product-meta">
              <text class="product-price">¥{{ item.price.toFixed(2) }}</text>
              <text class="product-stock">库存: {{ item.stock }}</text>
            </view>
            <view class="product-actions">
              <view class="action-btn cart-btn" @click="addToCart(item)">
                <van-icon name="cart-o" size="20" />
                <text>加入购物车</text>
              </view>
              <view class="action-btn remove-btn" @click="removeFavorite(item.id)">
                <van-icon name="star" size="20" />
                <text>取消收藏</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-if="!loading && favorites.length === 0" class="empty-state">
        <van-icon name="star-o" size="80" color="#ccc" />
        <text class="empty-text">暂无收藏商品</text>
        <view class="empty-btn" @click="goToHome">去逛逛</view>
      </view>
    </template>

    <!-- 店铺收藏 -->
    <template v-if="activeTab === 'shop'">
      <view class="shop-list" v-if="!shopLoading && shopFollows.length > 0">
        <view
          v-for="shop in shopFollows"
          :key="shop.id"
          class="shop-card"
          @click="goToShop(shop.id)"
        >
          <view class="shop-card-header">
            <view class="shop-avatar-wrapper">
              <image
                v-if="shop.logo_url"
                :src="shop.logo_url"
                class="shop-avatar-img"
                mode="aspectFill"
              />
              <view v-else class="shop-avatar-default">
                <text>{{ shop.name ? shop.name.charAt(0) : '店' }}</text>
              </view>
            </view>
            <view class="shop-info">
              <text class="shop-name">{{ shop.name }}</text>
              <text class="shop-desc">{{ shop.description || '暂无描述' }}</text>
              <text class="shop-meta">商品 {{ shop.product_count }} 件</text>
            </view>
            <view class="unfollow-btn" @click.stop="unfollowShop(shop.id)">
              <van-icon name="star" size="18" />
            </view>
          </view>
        </view>
      </view>

      <view v-if="!shopLoading && shopFollows.length === 0" class="empty-state">
        <van-icon name="shop-o" size="80" color="#ccc" />
        <text class="empty-text">暂无收藏店铺</text>
        <view class="empty-btn" @click="goToHome">去逛逛</view>
      </view>
    </template>

    <view v-if="(activeTab === 'product' && loading) || (activeTab === 'shop' && shopLoading)" class="loading-state">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { favoritesApi, shopFollowApi } from '@/services/api.js'

const activeTab = ref('product')

// 商品收藏相关
const favorites = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const currentSort = ref('created_at_desc')
const hasMore = ref(true)

const sortOptions = [
  { label: '按收藏时间', value: 'created_at_desc' },
  { label: '价格从低到高', value: 'price_asc' },
  { label: '价格从高到低', value: 'price_desc' }
]

// 店铺关注相关
const shopFollows = ref([])
const shopLoading = ref(false)

function switchTab(tab) {
  activeTab.value = tab
  if (tab === 'shop' && shopFollows.value.length === 0) {
    loadShopFollows()
  }
}

// ===== 商品收藏 =====

async function loadFavorites(isRefresh = false) {
  if (loading.value) return

  if (isRefresh) {
    page.value = 1
    hasMore.value = true
  }

  if (!hasMore.value) return

  loading.value = true
  try {
    const res = await favoritesApi.getList({
      page: page.value,
      limit: limit.value,
      sort: currentSort.value
    })

    if (res.success && res.data) {
      if (isRefresh) {
        favorites.value = res.data.list || []
      } else {
        favorites.value = [...favorites.value, ...(res.data.list || [])]
      }
      total.value = res.data.total || 0
      hasMore.value = favorites.value.length < total.value
    }
  } catch (error) {
    console.error('加载收藏列表失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
    if (isRefresh) {
      uni.stopPullDownRefresh()
    }
  }
}

function changeSort(sortValue) {
  currentSort.value = sortValue
  loadFavorites(true)
}

function goToDetail(productId) {
  uni.navigateTo({
    url: `/pages/product/detail?id=${productId}`
  })
}

function addToCart(product) {
  uni.showToast({
    title: '已加入购物车',
    icon: 'success'
  })
}

function removeFavorite(productId) {
  uni.showModal({
    title: '确认取消',
    content: '确定要取消收藏该商品吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const res = await favoritesApi.remove(productId)
          if (res.success) {
            uni.showToast({
              title: '取消收藏成功',
              icon: 'success'
            })
            loadFavorites(true)
          } else {
            uni.showToast({
              title: res.message || '取消收藏失败',
              icon: 'none'
            })
          }
        } catch (error) {
          console.error('取消收藏失败:', error)
          uni.showToast({
            title: '取消收藏失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

// ===== 店铺关注 =====

async function loadShopFollows(isRefresh = false) {
  if (shopLoading.value) return
  shopLoading.value = true
  try {
    const res = await shopFollowApi.getList({ page: 1, limit: 50 })
    if (res.success && res.data) {
      shopFollows.value = res.data.list || []
    }
  } catch (error) {
    console.error('加载收藏店铺失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    shopLoading.value = false
  }
}

function goToShop(shopId) {
  uni.navigateTo({
    url: `/pages/shop/detail?id=${shopId}`
  })
}

function unfollowShop(shopId) {
  uni.showModal({
    title: '确认取消',
    content: '确定要取消收藏该店铺吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await shopFollowApi.remove(shopId)
          if (result.success) {
            uni.showToast({ title: '取消收藏成功', icon: 'success' })
            loadShopFollows()
          } else {
            uni.showToast({ title: result.message || '操作失败', icon: 'none' })
          }
        } catch (error) {
          console.error('取消收藏店铺失败:', error)
          uni.showToast({ title: '操作失败', icon: 'none' })
        }
      }
    }
  })
}

function goToHome() {
  uni.switchTab({
    url: '/pages/index/index'
  })
}

onMounted(() => {
  loadFavorites()
})

onShow(() => {
  if (activeTab.value === 'product') {
    loadFavorites(true)
  } else {
    loadShopFollows()
  }
})

onPullDownRefresh(() => {
  if (activeTab.value === 'product') {
    loadFavorites(true)
  } else {
    loadShopFollows()
  }
})

onReachBottom(() => {
  if (activeTab.value === 'product' && hasMore.value && !loading.value) {
    page.value++
    loadFavorites(false)
  }
})
</script>

<style scoped>
.container {
  background: transparent;
  min-height: 100vh;
  padding-bottom: var(--spacing-xl);
}

.header {
  background: var(--bg-white);
  padding: var(--spacing-lg) var(--spacing-md);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: var(--spacing-md);
  border-radius: var(--card-radius);
  box-shadow: var(--shadow-sm);
}

.title {
  font-size: var(--font-size-xl);
  font-weight: bold;
  color: var(--text-primary);
  text-align: center;
}

/* Tab 切换 */
.tab-bar {
  display: flex;
  background: var(--bg-white);
  margin: 0 var(--spacing-md) var(--spacing-md);
  border-radius: var(--card-radius);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.tab-item {
  flex: 1;
  padding: 24rpx 0;
  text-align: center;
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  position: relative;
  transition: all 0.3s ease;
}

.tab-item.active {
  color: #ff6034;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 6rpx;
  background: #ff6034;
  border-radius: 3rpx;
}

/* 排序栏 */
.sort-bar {
  background: var(--bg-white);
  padding: var(--spacing-md);
  margin: 0 var(--spacing-md) var(--spacing-md);
  display: flex;
  gap: var(--spacing-md);
  border-radius: var(--card-radius);
  box-shadow: var(--shadow-sm);
}

.sort-option {
  flex: 1;
  padding: var(--spacing-sm);
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  border-radius: var(--card-radius);
  transition: all var(--transition-fast);
}

.sort-option.active {
  background: #ffc0cb;
  color: var(--bg-white);
}

/* 商品网格 */
.product-grid {
  padding: var(--spacing-md);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340rpx, 1fr));
  gap: var(--spacing-md);
}

.product-card {
  background: var(--bg-white);
  border-radius: var(--card-radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.product-image-container {
  width: 100%;
  height: 300rpx;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
}

.product-info {
  padding: var(--spacing-md);
}

.product-title {
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
  margin-bottom: var(--spacing-md);
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

.product-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.action-btn {
  flex: 1;
  padding: var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  border-radius: var(--card-radius);
  font-size: var(--font-size-xs);
}

.cart-btn {
  background: var(--primary-color);
  color: var(--bg-white);
}

.remove-btn {
  background: var(--bg-color);
  color: var(--text-secondary);
}

/* 店铺列表 */
.shop-list {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.shop-card {
  background: var(--bg-white);
  border-radius: var(--card-radius);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.shop-card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.shop-avatar-wrapper {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.shop-avatar-img {
  width: 100%;
  height: 100%;
}

.shop-avatar-default {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 36rpx;
  font-weight: bold;
}

.shop-info {
  flex: 1;
  overflow: hidden;
}

.shop-name {
  display: block;
  font-size: var(--font-size-md);
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 4rpx;
}

.shop-desc {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  margin-bottom: 4rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shop-meta {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.unfollow-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff6034;
  flex-shrink: 0;
}

/* 空状态和加载 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx var(--spacing-md);
}

.empty-text {
  margin: var(--spacing-md) 0;
  font-size: var(--font-size-base);
  color: var(--text-muted);
}

.empty-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--primary-color);
  color: var(--bg-white);
  border-radius: var(--card-radius);
  font-size: var(--font-size-base);
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80rpx 0;
  color: var(--text-muted);
}
</style>

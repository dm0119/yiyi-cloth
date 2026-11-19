<template>
  <view class="shop-page">
    <!-- 加载中 -->
    <view v-if="loading" class="loading">
      <van-loading size="24px">加载中...</van-loading>
    </view>

    <!-- 店铺已关闭 -->
    <view v-else-if="shop.is_closed" class="closed-tip">
      <van-empty :description="shop.closed_reason">
        <van-button type="primary" @click="goBack">返回首页</van-button>
      </van-empty>
    </view>

    <!-- 正常店铺页面 -->
    <template v-else>
      <!-- 店铺头部 -->
      <view class="shop-header">
        <!-- 店铺信息卡片 -->
        <view class="shop-info-card">
            <shop-avatar :shop="shop" size="large" />

            <view class="shop-details">
              <view class="shop-name-wrapper">
                <view class="shop-name">{{ shop.name }}</view>
                <view v-if="shop.is_brand" class="brand-badge">
                  <text class="brand-icon">⭐</text>
                  <text class="brand-text">品牌</text>
                </view>
              </view>
              <view class="shop-desc">{{ shop.description || '暂无描述' }}</view>
              <view class="shop-stats">
                <text>商品 {{ shop.stats?.productCount || 0 }}</text>
                <text>销量 {{ shop.stats?.salesCount || 0 }}</text>
              </view>
            </view>

            <van-button
              :type="isFollowed ? 'default' : 'primary'"
              size="small"
              round
              @click="toggleFollow"
            >
              {{ isFollowed ? '已收藏' : '收藏店铺' }}
            </van-button>
          </view>
      </view>

      <!-- 商品排序工具栏 -->
      <view class="sort-toolbar">
        <view 
          class="sort-item" 
          :class="{ active: sortBy === 'default' }"
          @click="changeSort('default')"
        >
          默认
          <text v-if="sortBy === 'default'" class="active-icon">✓</text>
        </view>
        <view 
          class="sort-item" 
          :class="{ active: sortBy === 'price_asc' }"
          @click="changeSort('price_asc')"
        >
          价格 ↑
          <text v-if="sortBy === 'price_asc'" class="active-icon">✓</text>
        </view>
        <view 
          class="sort-item" 
          :class="{ active: sortBy === 'price_desc' }"
          @click="changeSort('price_desc')"
        >
          价格 ↓
          <text v-if="sortBy === 'price_desc'" class="active-icon">✓</text>
        </view>
        <view 
          class="sort-item" 
          :class="{ active: sortBy === 'time' }"
          @click="changeSort('time')"
        >
          时间
          <text v-if="sortBy === 'time'" class="active-icon">✓</text>
        </view>
      </view>

      <!-- 商品列表 -->
      <product-list :products="products" />
    </template>
  </view>
</template>

<script>
import ShopAvatar from '@/components/ShopAvatar.vue'
import ProductList from '@/components/ProductList.vue'
import { request, merchantApi, shopFollowApi } from '@/services/api'

export default {
  name: 'ShopDetail',
  components: {
    ShopAvatar,
    ProductList
  },
  data() {
    return {
      loading: true,
      shopId: '',
      shop: {},
      products: [],
      sortBy: 'default',
      page: 1,
      pageSize: 20,
      isFollowed: false
    }
  },
  computed: {
    // 从路由参数或页面选项获取店铺ID
    currentShopId() {
      return this.shopId || this.$route?.query?.id || this.$scope?.options?.id || ''
    }
  },
  onLoad(options) {
    // uni-app 使用 onLoad 获取页面参数
    if (options.id) {
      this.shopId = options.id
    } else if (options.shopId) {
      this.shopId = options.shopId
    }
  },
  mounted() {
    this.loadShopInfo()
    this.loadShopProducts()
    this.checkFollowStatus()
  },
  methods: {
    async loadShopInfo() {
      try {
        const res = await merchantApi.getShopInfo(this.shopId)
        if (res.success) {
          this.shop = res.data
          console.log('🔵 店铺详情数据:', res.data)
          console.log('🔵 is_brand:', res.data.is_brand)
        }
      } catch (error) {
        console.error('加载店铺信息失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      }
    },

    async loadShopProducts() {
      try {
        let sortParam = 'default'
        if (this.sortBy === 'price_asc') {
          sortParam = 'price_asc'
        } else if (this.sortBy === 'price_desc') {
          sortParam = 'price_desc'
        } else if (this.sortBy === 'time') {
          sortParam = 'time'
        }

        const res = await merchantApi.getShopProducts(this.shopId, { 
          sort: sortParam, 
          page: this.page, 
          pageSize: this.pageSize 
        })

        if (res.success) {
          this.products = res.data.products
        }
      } catch (error) {
        console.error('加载商品失败:', error)
        uni.showToast({
          title: '加载商品失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    changeSort(sortType) {
      this.sortBy = sortType
      this.page = 1
      this.loadShopProducts()
    },

    async checkFollowStatus() {
      const userInfo = uni.getStorageSync('userInfo')
      if (!userInfo) {
        this.isFollowed = false
        return
      }
      try {
        const res = await shopFollowApi.check(this.shopId)
        if (res.success) {
          this.isFollowed = res.data.is_followed
        }
      } catch (error) {
        console.error('检查关注状态失败:', error)
      }
    },

    async toggleFollow() {
      const userInfo = uni.getStorageSync('userInfo')
      if (!userInfo) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        setTimeout(() => {
          uni.navigateTo({ url: '/pages/user/login' })
        }, 1500)
        return
      }
      try {
        if (this.isFollowed) {
          const res = await shopFollowApi.remove(this.shopId)
          if (res.success) {
            this.isFollowed = false
            uni.showToast({ title: '取消收藏成功', icon: 'success' })
          }
        } else {
          const res = await shopFollowApi.add(this.shopId)
          if (res.success) {
            this.isFollowed = true
            uni.showToast({ title: '收藏成功', icon: 'success' })
          }
        }
      } catch (error) {
        console.error('收藏操作失败:', error)
        uni.showToast({ title: '操作失败', icon: 'none' })
      }
    },

    goBack() {
      uni.switchTab({
        url: '/pages/index/index'
      })
    }
  }
}
</script>

<style scoped>
.shop-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.loading {
  padding: 100px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.closed-tip {
  padding: 100px 0;
}

.shop-header {
  position: relative;
}

.shop-banner {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.shop-banner image {
  width: 100%;
  height: 100%;
}

.shop-info-card {
  position: relative;
  margin: 16px;
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.shop-details {
  flex: 1;
}

.shop-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
}

.shop-name-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%);
  color: #f4c542;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 1px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(244, 197, 66, 0.1);
  border: 1px solid rgba(244, 197, 66, 0.2);
  white-space: nowrap;
}

.brand-icon {
  font-size: 14px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.brand-text {
  background: linear-gradient(135deg, #f4c542 0%, #ffd700 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.shop-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.shop-stats {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #999;
}

.sort-toolbar {
  display: flex;
  background: white;
  border-bottom: 1px solid #eee;
  padding: 0;
}

.sort-item {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.sort-item:active {
  background: #f5f5f5;
}

.sort-item.active {
  color: #667eea;
  font-weight: bold;
}

.sort-item .active-icon {
  margin-left: 4px;
  color: #667eea;
}
</style>

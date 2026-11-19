<template>
  <div class="shop-page">
    <!-- 加载中 -->
    <van-loading v-if="loading" size="24px" class="loading">加载中...</van-loading>
    
    <!-- 店铺已关闭 -->
    <van-empty v-else-if="shop.is_closed" :description="shop.closed_reason" class="closed-tip">
      <van-button type="primary" @click="goBack">返回首页</van-button>
    </van-empty>
    
    <!-- 正常店铺页面 -->
    <template v-else>
      <!-- 店铺头部 -->
      <div class="shop-header">
        <!-- Banner -->
        <div v-if="shop.banner_url" class="shop-banner">
          <img :src="shop.banner_url" />
        </div>
        <div v-else class="shop-banner default">
          <div class="banner-text">{{ shop.name }}</div>
        </div>
        
        <!-- 店铺信息卡片 -->
        <div class="shop-info-card">
          <shop-avatar :shop="shop" size="large" />
          
          <div class="shop-details">
            <div class="shop-name">{{ shop.name }}</div>
            <div class="shop-desc">{{ shop.description || '暂无描述' }}</div>
            <div class="shop-stats">
              <span>商品 {{ shop.stats?.productCount || 0 }}</span>
              <span>销量 {{ shop.stats?.salesCount || 0 }}</span>
            </div>
          </div>
          
          <van-button type="primary" size="small" round>
            关注
          </van-button>
        </div>
      </div>
      
      <!-- 商品分类 Tab -->
      <van-tabs v-model:active="activeTab" sticky>
        <van-tab title="全部">
          <product-list :products="products" />
        </van-tab>
        <van-tab title="热销">
          <product-list :products="hotProducts" />
        </van-tab>
        <van-tab title="新品">
          <product-list :products="newProducts" />
        </van-tab>
      </van-tabs>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ShopAvatar from '@/mobile/components/ShopAvatar.vue'
import ProductList from '@/mobile/components/ProductList.vue'
import { request } from '@/utils/api'

const route = useRoute()
const router = useRouter()
const shopId = route.params.shopId

const loading = ref(true)
const shop = ref({})
const products = ref([])
const hotProducts = ref([])
const newProducts = ref([])
const activeTab = ref(0)

const loadShopInfo = async () => {
  try {
    const res = await request(`/mobile/merchants/${shopId}`)
    if (res.success) {
      shop.value = res.data
    }
  } catch (error) {
    console.error('加载店铺信息失败:', error)
    showToast('加载失败')
  }
}

const loadShopProducts = async () => {
  try {
    const [allRes, hotRes, newRes] = await Promise.all([
      request(`/mobile/merchants/${shopId}/products?sort=new&pageSize=20`),
      request(`/mobile/merchants/${shopId}/products?sort=sales&pageSize=10`),
      request(`/mobile/merchants/${shopId}/products?sort=new&pageSize=10`)
    ])
    
    if (allRes.success) products.value = allRes.data.products
    if (hotRes.success) hotProducts.value = hotRes.data.products
    if (newRes.success) newProducts.value = newRes.data.products
  } catch (error) {
    console.error('加载商品失败:', error)
    showToast('加载商品失败')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/')
}

onMounted(() => {
  loadShopInfo()
  loadShopProducts()
})
</script>

<style scoped>
.shop-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.loading {
  padding: 100px 0;
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

.shop-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.shop-banner.default {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-text {
  color: white;
  font-size: 32px;
  font-weight: bold;
}

.shop-info-card {
  position: relative;
  margin: -60px 16px 16px;
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
</style>

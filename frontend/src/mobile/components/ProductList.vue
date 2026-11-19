<template>
  <div class="product-list">
    <div v-if="products && products.length > 0" class="products">
      <div v-for="product in products" :key="product.id" class="product-card" @click="goToDetail(product.id)">
        <div class="product-image">
          <img :src="product.images && product.images.length > 0 ? product.images[0] : '/placeholder.png'" />
        </div>
        
        <div class="product-info">
          <div class="product-name">{{ product.name }}</div>
          <div class="product-price">
            <span class="price">¥{{ product.price }}</span>
            <span class="sales">已售 {{ product.sales_count }}</span>
          </div>
          <div class="product-rating" v-if="product.avg_rating > 0">
            <van-icon name="star" />
            <span>{{ product.avg_rating.toFixed(1) }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <van-empty v-else description="暂无商品" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps({
  products: {
    type: Array,
    default: () => []
  }
})

const goToDetail = (productId) => {
  router.push(`/mobile/product/${productId}`)
}
</script>

<style scoped>
.product-list {
  padding: 16px;
}

.products {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.product-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.product-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 12px;
}

.product-name {
  font-size: 14px;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  height: 40px;
}

.product-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.price {
  color: #ff6b6b;
  font-size: 18px;
  font-weight: bold;
}

.sales {
  color: #999;
  font-size: 12px;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #ff9800;
  font-size: 12px;
}
</style>

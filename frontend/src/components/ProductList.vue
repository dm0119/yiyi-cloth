<template>
  <div class="product-list">
    <table class="table">
      <thead>
        <tr>
          <th>图片</th>
          <th>商品名称</th>
          <th>价格</th>
          <th>库存</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="products.length === 0">
          <td colspan="6" class="empty-state">
            <div class="empty-state-icon">📦</div>
            <p>暂无商品</p>
          </td>
        </tr>
        <tr v-for="product in products" :key="product.id">
          <td>
            <img 
              :src="product.image || 'https://via.placeholder.com/60'" 
              :alt="product.name"
              class="product-image"
            />
          </td>
          <td>
            <span class="product-name">{{ product.name }}</span>
          </td>
          <td>
            <span class="product-price">¥{{ formatPrice(product.price) }}</span>
          </td>
          <td>
            <span class="product-stock">{{ product.stock }}</span>
          </td>
          <td>
            <span 
              class="status-badge"
              :class="product.status === 1 ? 'status-on' : 'status-off'"
            >
              {{ product.status === 1 ? '上架中' : '已下架' }}
            </span>
          </td>
          <td>
            <div class="action-buttons">
              <button 
                class="btn action-btn edit-btn"
                @click="$emit('edit', product)"
              >
                编辑
              </button>
              <button 
                class="btn action-btn delete-btn"
                @click="handleDelete(product.id)"
              >
                删除
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import './ProductList.css'

defineProps({
  products: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['edit', 'delete'])

function formatPrice(price) {
  const num = parseFloat(price) || 0
  return num.toFixed(2)
}

function handleDelete(id) {
  if (confirm('确定要删除此商品吗？')) {
    emit('delete', id)
  }
}
</script>

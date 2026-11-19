<template>
  <view class="container">
    <van-empty
      v-if="!loading && cartItems.length === 0"
      description="购物车空空如也"
      image="/static/kong-car.png"
      class="custom-empty"
    >
      <van-button round type="danger" class="bottom-button" @click="goToHome">
        去逛逛
      </van-button>
    </van-empty>

    <view v-else class="cart-content">
      <van-checkbox-group v-model="checkedItems" @change="handleCheckChange">
        <view
          v-for="item in cartItems"
          :key="item.id"
          class="cart-item"
          @click="goToProductDetail(item.productId)"
        >
          <van-checkbox :name="item.id" class="cart-checkbox" @click.stop />
          <van-card
            :num="item.quantity"
            :price="item.price.toFixed(2)"
            :title="item.name"
            :thumb="item.image || 'https://via.placeholder.com/300x300'"
            thumb-mode="aspectFill"
            @click.stop="goToProductDetail(item.productId)"
          >
            <template #desc>
              <view class="product-desc">
                <text>{{ item.size || '默认尺码' }}</text>
                <text>{{ item.color || '默认颜色' }}</text>
              </view>
            </template>
            <template #footer>
              <van-stepper v-model="item.quantity" :min="1" :max="item.stock || 99" @change="handleQuantityChange(item)" @click.stop />
            </template>
          </van-card>
          <van-button
            icon="delete-o"
            type="danger"
            size="small"
            class="delete-btn"
            @click.stop="deleteItem(item.id)"
          />
        </view>
      </van-checkbox-group>

      <view class="cart-actions">
        <van-checkbox v-model="selectAll" @click="handleSelectAll">全选</van-checkbox>
        <van-button
          v-if="cartItems.length > 0"
          icon="delete-o"
          type="danger"
          size="small"
          plain
          @click="clearCart"
        >
          清空购物车
        </van-button>
      </view>

      <view class="checkout-bar" v-if="checkedItems.length > 0">
        <view class="checkout-left">
          <text class="total-label">合计：</text>
          <text class="total-price">¥{{ totalPrice.toFixed(2) }}</text>
        </view>
        <van-button type="danger" round @click="handleCheckout">结算({{ checkedItems.length }})</van-button>
      </view>
    </view>

    <van-loading v-if="loading" type="spinner" vertical>加载中...</van-loading>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { productApi } from '@/services/api.js'

const loading = ref(false)
const cartItems = ref([])
const checkedItems = ref([])
const selectAll = ref(false)
const isLoggedIn = ref(false)

// 检查用户登录状态
function checkLogin() {
  let user = uni.getStorageSync('userInfo')
  let loggedIn = uni.getStorageSync('isLoggedIn')

  // 如果没有移动端登录信息，检查管理端的登录信息
  if (!loggedIn || !user) {
    const adminUser = uni.getStorageSync('admin_user')
    const adminToken = uni.getStorageSync('admin_token')

    if (adminToken && adminUser) {
      // 转换管理端用户信息为移动端需要的格式
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

  if (loggedIn && user) {
    isLoggedIn.value = true
    return true
  } else {
    isLoggedIn.value = false
    return false
  }
}

// 引导用户登录
function goToLogin() {
  uni.showToast({
    title: '请先登录',
    icon: 'none'
  })
  setTimeout(() => {
    uni.navigateTo({
      url: '/pages/user/login'
    })
  }, 1500)
}

const totalPrice = computed(() => {
  return cartItems.value
    .filter(item => checkedItems.value.includes(item.id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
})

async function loadCart() {
  loading.value = true
  try {
    // 先从本地存储获取购物车数据
    const localCartData = uni.getStorageSync('cart') || []
    
    // 尝试从服务器获取最新购物车数据
    try {
      if (isLoggedIn.value) {
        // 这里可以调用API获取服务器端购物车数据
        // const response = await cartApi.getCart()
        // if (response.success) {
        //   // 合并本地和服务器数据
        //   const serverCartData = response.data
        //   // 实现数据合并逻辑
        // }
      }
    } catch (apiError) {
      console.error('获取服务器购物车数据失败:', apiError)
      // 网络错误时使用本地数据
    }
    
    // 使用本地存储的购物车数据
    cartItems.value = localCartData.map(cartItem => ({
      id: cartItem.id,
      productId: cartItem.productId,
      name: cartItem.name || '商品已下架',
      price: cartItem.price || 0,
      image: cartItem.image || '',
      stock: cartItem.stock || 99,
      quantity: cartItem.quantity,
      size: cartItem.size,
      color: cartItem.color,
      shop_id: cartItem.shop_id // 添加店铺 ID，用于优惠券隔离
    }))
    
    checkedItems.value = cartItems.value.map(item => item.id)
  } catch (error) {
    console.error('加载购物车失败:', error)
    cartItems.value = []
    checkedItems.value = []
  } finally {
    loading.value = false
  }
}

function handleCheckChange() {
  selectAll.value = checkedItems.value.length === cartItems.value.length && cartItems.value.length > 0
}

function handleSelectAll() {
  if (selectAll.value) {
    checkedItems.value = cartItems.value.map(item => item.id)
  } else {
    checkedItems.value = []
  }
}

function handleQuantityChange(item) {
  saveCart()
}

function clearCart() {
  uni.showModal({
    title: '提示',
    content: '确定要清空购物车吗？',
    confirmText: '确定',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        cartItems.value = []
        checkedItems.value = []
        selectAll.value = false
        saveCart()
        uni.showToast({
          title: '已清空购物车',
          icon: 'success'
        })
      }
    }
  })
}

function deleteItem(id) {
  uni.showModal({
    title: '提示',
    content: '确定要删除这个商品吗？',
    success: (res) => {
      if (res.confirm) {
        const index = cartItems.value.findIndex(item => item.id === id)
        if (index > -1) {
          cartItems.value.splice(index, 1)
          checkedItems.value = checkedItems.value.filter(itemId => itemId !== id)
          saveCart()
        }
      }
    }
  })
}

function saveCart() {
  const cartData = cartItems.value.map(item => ({
    id: item.id,
    productId: item.productId,
    name: item.name,
    price: item.price,
    image: item.image,
    quantity: item.quantity,
    size: item.size,
    color: item.color,
    stock: item.stock,
    shop_id: item.shop_id // 添加店铺 ID，用于优惠券隔离
  }))
  
  // 保存到本地存储
  uni.setStorageSync('cart', cartData)
  
  // 尝试同步到服务器
  if (isLoggedIn.value) {
    try {
      // 这里可以调用API同步购物车数据到服务器
      // await cartApi.syncCart(cartData)
    } catch (error) {
      console.error('同步购物车到服务器失败:', error)
      // 同步失败不影响本地操作
    }
  }
}

function handleCheckout() {
  if (checkedItems.value.length === 0) {
    uni.showToast({
      title: '请选择商品',
      icon: 'none'
    })
    return
  }
  
  const selectedItems = cartItems.value.filter(item => checkedItems.value.includes(item.id))
  
  // 传递fromCart参数和商品信息
  uni.navigateTo({
    url: `/pages/order/checkout?items=${encodeURIComponent(JSON.stringify(selectedItems))}&fromCart=true`
  })
}

function goToHome() {
  uni.switchTab({
    url: '/pages/index/index'
  })
}

function goToProductDetail(productId) {
  uni.navigateTo({
    url: `/pages/product/detail?id=${productId}`
  })
}

onMounted(() => {
  if (checkLogin()) {
    loadCart()
  } else {
    goToLogin()
  }
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
    background: transparent;
    min-height: 100vh;
  }

.cart-content {
  padding: var(--spacing-md);
  padding-bottom: 140rpx;
}

.cart-item {
  display: flex;
  align-items: center;
  background: var(--bg-white);
  border-radius: var(--card-radius);
  padding: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  position: relative;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.cart-item:active {
  transform: scale(0.98);
  box-shadow: var(--shadow-md);
}

.cart-checkbox {
  margin-right: var(--spacing-sm);
  flex-shrink: 0;
  z-index: 10;
}

/* 覆盖 van-card 默认样式 */
.cart-item >>> .van-card {
  flex: 1;
  padding: 0;
  margin: 0;
  background: transparent;
  border: none;
  box-shadow: none;
}

.cart-item >>> .van-card__header {
  display: flex;
  align-items: center;
  margin-bottom: 0;
}

.cart-item >>> .van-card__thumb {
  width: 180rpx;
  height: 180rpx;
  border-radius: var(--spacing-sm);
  overflow: hidden;
  flex-shrink: 0;
  margin-right: var(--spacing-sm);
}

.cart-item >>> .van-card__content {
  flex: 1;
  min-width: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 180rpx;
}

.cart-item >>> .van-card__title {
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.4;
  margin-bottom: var(--spacing-xs);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cart-item >>> .van-card__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  margin: 0;
}

.cart-item >>> .van-card__price {
  color: var(--primary-color);
  font-weight: 600;
}

.cart-item >>> .van-card__price-currency {
  font-size: var(--font-size-sm);
}

.cart-item >>> .van-card__price-integer {
  font-size: var(--font-size-lg);
}

.cart-item >>> .van-card__price-decimal {
  font-size: var(--font-size-sm);
}

.cart-item >>> .van-card__num {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  margin: 0;
}

.cart-item >>> .van-card__footer {
  padding: 0;
  margin-top: var(--spacing-xs);
  display: flex;
  justify-content: flex-end;
}

.cart-item >>> .van-stepper {
  transform: scale(0.9);
  transform-origin: right center;
}

.cart-item >>> .van-stepper__input {
  width: 60rpx;
  height: 48rpx;
  font-size: var(--font-size-sm);
}

.cart-item >>> .van-stepper__minus,
.cart-item >>> .van-stepper__plus {
  width: 48rpx;
  height: 48rpx;
}

.product-desc {
  display: flex;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  margin-top: var(--spacing-xs);
  flex-wrap: wrap;
}

.product-desc text {
  background: var(--bg-color);
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.delete-btn {
  margin-left: var(--spacing-sm);
  flex-shrink: 0;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 77, 79, 0.1);
  border: none;
  padding: 0;
}

.delete-btn >>> .van-button__content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn >>> .van-icon {
    font-size: 32rpx;
    margin: 0;
  }
  
  /* 购物车操作栏样式 */
  .cart-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-sm) 0;
    margin-bottom: var(--spacing-sm);
  }
  
  .cart-actions >>> .van-checkbox {
    margin: 0;
  }
  
  .cart-actions >>> .van-button--small {
    height: 56rpx;
    padding: 0 var(--spacing-sm);
    font-size: var(--font-size-xs);
  }
  
  .cart-actions >>> .van-button--plain {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background: rgba(255, 107, 107, 0.05);
  }
  
  .cart-actions >>> .van-button--plain:active {
    background: rgba(255, 107, 107, 0.15);
  }
  
  /* 结算栏样式 */
  .checkout-bar {
    position: fixed;
    bottom: 100rpx;
    left: var(--spacing-md);
    right: var(--spacing-md);
    height: 100rpx;
    background: var(--bg-white);
    border-radius: var(--card-radius);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--spacing-md);
    box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
    z-index: 100;
  }
  
  .checkout-bar >>> .van-button--round {
    border-radius: var(--button-radius);
  }
  
  .checkout-bar >>> .van-button--danger {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
    border: none;
    font-weight: 600;
    font-size: var(--font-size-md);
    padding: 0 var(--spacing-lg);
    height: 72rpx;
    min-width: 200rpx;
  }
  
  .checkout-left {
    display: flex;
    align-items: baseline;
  }
  
  .total-label {
    font-size: var(--font-size-md);
    color: var(--text-muted);
  }
  
  .total-price {
    font-size: var(--font-size-xl);
    font-weight: bold;
    color: var(--primary-color);
  }
  
  /* 空状态样式 */
  .custom-empty >>> .van-empty__image {
    width: 400rpx;
    height: 400rpx;
    max-width: 400rpx;
    max-height: 400rpx;
  }
  </style>

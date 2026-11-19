<template>
  <view class="container">
    <van-empty v-if="!items || items.length === 0" description="商品不存在" />

    <view v-else>
      <view class="product-list">
        <view 
          v-for="item in items" 
          :key="item.id"
          class="product-card"
        >
          <image 
            :src="item.image || 'https://via.placeholder.com/200x200'" 
            mode="aspectFill"
            class="product-image"
          />
          <view class="product-info">
            <text class="product-name">{{ item.name }}</text>
            <view class="product-meta">
              <van-tag v-if="item.size" size="small" type="primary">尺码: {{ item.size }}</van-tag>
              <van-tag v-if="item.color" size="small" type="primary">颜色: {{ item.color }}</van-tag>
            </view>
            <view class="price-row">
              <view class="price-info">
                <text class="price-symbol">¥</text>
                <text class="price-value">{{ Number(item.price).toFixed(2) }}</text>
              </view>
              <text class="quantity">x{{ item.quantity }}</text>
            </view>
            <!-- 显示优惠后金额（参考美团展示方式） -->
            <view v-if="selectedCoupon && getItemDiscount(item) > 0" class="discount-row">
              <text class="discount-label">优惠后</text>
              <text class="discount-price">¥{{ getFinalPrice(item).toFixed(2) }}</text>
              <text class="discount-amount-tag">省{{ getItemDiscount(item).toFixed(2) }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-title">收货信息</view>
        <view class="address-section">
          <view 
            class="address-selector"
            @click="selectAddress"
          >
            <text class="address-label">选择地址</text>
            <view class="address-info">
              <text v-if="selectedAddress" class="address-text selected">
                {{ selectedAddress.name }} {{ selectedAddress.phone }}
              </text>
              <text v-else class="address-text">请选择收货地址</text>
              <van-icon name="arrow" />
            </view>
          </view>
          <view v-if="selectedAddress" class="address-detail">
            {{ selectedAddress.address }}
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-title">优惠券</view>
        <view class="coupon-section">
          <view 
            class="coupon-selector"
            @click="selectCoupon"
          >
            <text class="coupon-label">选择优惠券</text>
            <view class="coupon-info">
              <text class="coupon-text">{{ selectedCoupon ? selectedCoupon.name : '暂无优惠券' }}</text>
              <van-icon name="arrow" />
            </view>
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-title">订单信息</view>
        <view class="order-summary">
          <view class="summary-row">
            <text>商品金额</text>
            <text>¥{{ totalPrice.toFixed(2) }}</text>
          </view>
          <view class="summary-row">
            <text>运费</text>
            <text class="free-shipping">免运费</text>
          </view>
          <view v-if="selectedCoupon" class="summary-row discount">
            <text>优惠券折扣</text>
            <text class="discount-amount">-¥{{ discountAmount.toFixed(2) }}</text>
          </view>
          <van-divider />
          <view class="summary-row total">
            <text>实付金额</text>
            <text class="total-price">¥{{ finalPrice.toFixed(2) }}</text>
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-title">支付方式</view>
        <van-field
          v-model="paymentMethodText"
          is-link
          readonly
          label="支付方式"
          placeholder="请选择支付方式"
          @click="showPaymentPicker = true"
        />
      </view>

      <van-popup v-model:show="showPaymentPicker" position="bottom">
        <van-picker
          :columns="paymentColumns"
          @confirm="onPaymentConfirm"
          @cancel="showPaymentPicker = false"
        />
      </van-popup>

      <van-submit-bar
        :price="finalPrice * 100"
        button-text="提交订单"
        @submit="handleSubmit"
      >
        <template #tip>
          <text class="submit-tip">请仔细确认订单信息</text>
        </template>
      </van-submit-bar>
    </view>
    
    <!-- 支付密码键盘 -->
    <NumberKeypad
      v-model:password="paymentPassword"
      :visible="showKeypad"
      title="请输入支付密码"
      @submit="onPasswordSubmit"
      @close="handleCloseKeypad"
    />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { orderApi, getAddresses, walletApi, payPasswordApi, realNameApi } from '@/services/api.js'
import NumberKeypad from '@/components/NumberKeypad.vue'

const items = ref([])
const form = ref({
  customer_name: '',
  phone: '',
  address: ''
})
const addresses = ref([])
const selectedAddress = ref(null)
const fromCart = ref(false)
const selectedCoupon = ref(null)
const paymentMethod = ref('alipay')
const showPaymentPicker = ref(false)
const paymentColumns = [
  { text: '支付宝', value: 'alipay' },
  { text: '微信支付', value: 'wechat' }
]

const paymentMethodText = computed(() => {
  return paymentMethod.value === 'alipay' ? '支付宝' : '微信支付'
})

function onPaymentConfirm({ selectedOptions }) {
  paymentMethod.value = selectedOptions[0].value
  showPaymentPicker.value = false
}

// 支付密码相关
const showKeypad = ref(false)
const paymentPassword = ref('')
const currentPayOrderId = ref(null)

const totalPrice = computed(() => {
  if (!items.value || items.value.length === 0) return 0
  return items.value.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
})

/**
 * 计算优惠券折扣金额
 * 只对符合条件的商品应用折扣
 * @returns {number} 折扣金额
 */
const discountAmount = computed(() => {
  if (!selectedCoupon.value) {
    console.log('未选择优惠券')
    return 0
  }
  
  // 根据优惠券类型计算折扣金额
  const coupon = selectedCoupon.value
  
  console.log('优惠券数据:', coupon)
  console.log('优惠券字段:', {
    name: coupon.name,
    type: coupon.type,
    value: coupon.value,
    scope: coupon.scope,
    shop_id: coupon.shop_id
  })
  
  // 计算符合条件的商品总金额
  let applicableAmount = 0
  if (coupon.scope === 'all' || coupon.scope === 'shop_all') {
    // 全场通用/店内全场，所有商品都适用
    applicableAmount = totalPrice.value
    console.log('优惠券适用范围:', coupon.scope, '适用金额:', applicableAmount)
  } else if (coupon.scope === 'specific_product') {
    // 特定商品，只对指定商品适用
    // 如果 productIds 为空数组或不存在，说明没有指定商品，不适用任何商品
    if (!coupon.productIds || coupon.productIds.length === 0) {
      console.warn('指定商品优惠券但没有指定商品')
      return 0
    }
    for (const item of items.value) {
      const productId = item.productId || item.product_id || item.id
      if (coupon.productIds.includes(productId)) {
        applicableAmount += Number(item.price) * item.quantity
      }
    }
  } else if (coupon.scope === 'specific_category') {
    // 特定分类，由于前端没有商品分类信息，暂时按不支持处理
    // TODO: 后端提供商品分类 API 后完善此逻辑
    if (!coupon.categoryIds || coupon.categoryIds.length === 0) {
      console.warn('分类优惠券需要后端计算，前端暂不支持')
      return 0
    }
    console.warn('分类优惠券需要后端计算，前端暂不支持')
    return 0
  } else {
    // 优惠券 scope 未知，不应用折扣
    console.warn('优惠券使用范围未知，无法计算折扣', coupon.scope)
    return 0
  }
  
  // 支持多种优惠券类型
  if (coupon.type === 'fixed' || coupon.type === 'fixed_amount' || coupon.type === 'threshold') {
    // 固定金额折扣或满减
    const discount = Math.min(coupon.value, applicableAmount)
    console.log('优惠券类型：固定金额，折扣金额:', discount)
    return discount
  } else if (coupon.type === 'percentage') {
    // 百分比折扣
    const discount = applicableAmount * (coupon.value / 100)
    console.log('优惠券类型：百分比，折扣金额:', discount)
    return discount
  } else if (coupon.type === 'free_shipping') {
    // 免运费优惠券，这里简单实现为固定金额折扣
    console.log('优惠券类型：免运费，折扣金额:10')
    return 10 // 假设运费为 10 元
  } else {
    // 优惠券类型未知，不应用折扣
    console.warn('优惠券类型未知，无法计算折扣', coupon.type)
    return 0
  }
})

/**
 * 计算单个商品的优惠金额（按价格比例分摊）
 * @param {Object} item - 商品项
 * @returns {number} 优惠金额
 */
const getItemDiscount = (item) => {
  if (!selectedCoupon.value || discountAmount.value <= 0) return 0
  
  const coupon = selectedCoupon.value
  const productId = item.productId || item.product_id || item.id
  const itemShopId = item.shop_id // 商品的店铺 ID
  const itemTotal = Number(item.price) * item.quantity
  
  // 调试信息
  console.log('计算商品优惠:', {
    productName: item.name,
    productId,
    itemShopId,
    itemTotal,
    couponScope: coupon.scope,
    couponShopId: coupon.shop_id
  })
  
  // 检查该商品是否适用优惠券
  let isApplicable = false
  if (coupon.scope === 'all') {
    // 全场通用券，所有商品都适用
    isApplicable = true
  } else if (coupon.scope === 'shop_all') {
    // 店铺券，只有所属店铺的商品才适用
    if (coupon.shop_id && itemShopId && coupon.shop_id === itemShopId) {
      isApplicable = true
      console.log(`✓ 商品 ${item.name} 适用店铺券`)
    } else {
      console.log(`✗ 商品 ${item.name} 不适用店铺券`, { 
        has_coupon_shop_id: !!coupon.shop_id, 
        has_item_shop_id: !!itemShopId, 
        shop_id_match: coupon.shop_id === itemShopId 
      })
    }
  } else if (coupon.scope === 'specific_product') {
    // 指定商品券，只有指定商品才适用
    if (coupon.productIds && coupon.productIds.includes(productId)) {
      isApplicable = true
    }
  }
  
  if (!isApplicable) {
    console.log(`商品 ${item.name} 不适用优惠券，返回 0`)
    return 0
  }
  
  // 计算适用商品的总金额
  let applicableAmount = 0
  for (const i of items.value) {
    const pid = i.productId || i.product_id || i.id
    const iShopId = i.shop_id
    let itemIsApplicable = false
    
    if (coupon.scope === 'all') {
      // 全场通用券
      itemIsApplicable = true
    } else if (coupon.scope === 'shop_all') {
      // 店铺券，只有所属店铺的商品才适用
      if (coupon.shop_id && iShopId && coupon.shop_id === iShopId) {
        itemIsApplicable = true
      }
    } else if (coupon.scope === 'specific_product') {
      // 指定商品券
      if (coupon.productIds && coupon.productIds.includes(pid)) {
        itemIsApplicable = true
      }
    }
    
    if (itemIsApplicable) {
      applicableAmount += Number(i.price) * i.quantity
    }
  }
  
  console.log('适用商品总金额:', applicableAmount)
  
  if (applicableAmount <= 0) return 0
  
  // 按价格比例分摊优惠
  const ratio = itemTotal / applicableAmount
  const itemDiscount = Math.round(discountAmount.value * ratio * 100) / 100
  
  console.log('商品优惠金额:', {
    productName: item.name,
    ratio,
    itemDiscount
  })
  
  return Math.min(itemDiscount, itemTotal)
}

/**
 * 计算单个商品的最终价格（原价 - 优惠）
 * @param {Object} item - 商品项
 * @returns {number} 最终价格
 */
const getFinalPrice = (item) => {
  const originalPrice = Number(item.price) * item.quantity
  const discount = getItemDiscount(item)
  return Math.max(0, originalPrice - discount)
}

const finalPrice = computed(() => {
  return Math.max(0, totalPrice.value - discountAmount.value)
})

function parseItems(query) {
  try {
    if (!query) return []
    const parsed = JSON.parse(decodeURIComponent(query))
    return Array.isArray(parsed) ? parsed : [parsed]
  } catch (error) {
    console.error('解析商品数据失败:', error)
    return []
  }
}

// 选择优惠券
function selectCoupon() {
  // 这里可以跳转到优惠券选择页面
  uni.navigateTo({
    url: '/pages/user/coupons?selectMode=true'
  })
}

// 处理从优惠券页面返回的数据
onLoad((options) => {
  if (options.items) {
    items.value = parseItems(options.items)
  }
  // 检查是否来自购物车页面
  if (options.fromCart) {
    fromCart.value = true
  }
  
  // 检查是否有选中的优惠券
  if (options.selectedCoupon) {
    try {
      selectedCoupon.value = JSON.parse(decodeURIComponent(options.selectedCoupon))
    } catch (error) {
      console.error('解析优惠券数据失败:', error)
    }
  }
})

// 加载地址列表
async function loadAddresses(skipAutoSelect = false) {
  try {
    const response = await getAddresses()
    if (response.success) {
      addresses.value = response.data
      // 只有在没有选中地址且存在默认地址时，才自动选择默认地址
      if (!skipAutoSelect && !selectedAddress.value) {
        const defaultAddress = addresses.value.find(addr => addr.is_default)
        if (defaultAddress) {
          selectedAddress.value = defaultAddress
          // 同步到 form 数据
          form.value.customer_name = defaultAddress.name
          form.value.phone = defaultAddress.phone
          form.value.address = defaultAddress.address
        }
      }
    }
  } catch (error) {
    console.error('加载地址失败:', error)
  }
}

// 选择地址
function selectAddress() {
  // 跳转到地址选择页面
  const selectedAddressId = selectedAddress.value ? selectedAddress.value.id : null
  uni.navigateTo({
    url: `/pages/user/address/index?selectMode=true${selectedAddressId ? `&selectedAddressId=${selectedAddressId}` : ''}`
  })
}

// 处理地址选择回调
function onAddressSelected(address) {
  selectedAddress.value = address
  form.value.customer_name = address.name
  form.value.phone = address.phone
  form.value.address = address.address
}

onShow(() => {
  // 检查全局数据中是否有选中的地址（从地址选择页面返回）
  const globalData = getApp().globalData
  let hasSelectedAddress = false
  
  if (globalData && globalData.selectedAddress) {
    const address = globalData.selectedAddress
    selectedAddress.value = address
    form.value.customer_name = address.name
    form.value.phone = address.phone
    form.value.address = address.address
    hasSelectedAddress = true
    // 清除全局数据，避免重复使用
    globalData.selectedAddress = null
  }
  
  // 检查全局数据中是否有选中的优惠券
        if (globalData && globalData.selectedCoupon) {
          selectedCoupon.value = globalData.selectedCoupon
          // 清除全局数据
          globalData.selectedCoupon = null
        }
        
        // 加载地址列表（如果有选中的地址，就不自动选择默认地址）
        loadAddresses(hasSelectedAddress)
})

async function handleSubmit() {
  // 验证是否选择了收货地址
  if (!selectedAddress.value) {
    uni.showToast({ title: '请选择地址', icon: 'none' })
    return
  }

  // 从服务器获取最新的实名认证状态
  try {
    uni.showLoading({ title: '验证中...' })
    const res = await realNameApi.getStatus()
    uni.hideLoading()
    
    if (res.success && res.data.status !== 'approved') {
      uni.showModal({
        title: '实名认证提示',
        content: '您需要先完成实名认证才能下单购买商品，是否前往认证？',
        confirmText: '去认证',
        cancelText: '取消',
        success: (modalRes) => {
          if (modalRes.confirm) {
            uni.navigateTo({
              url: '/pages/user/real-name'
            })
          }
        }
      })
      return
    }
  } catch (error) {
    uni.hideLoading()
    console.error('获取实名认证状态失败:', error)
    uni.showToast({ title: '验证失败，请重试', icon: 'none' })
    return
  }
  
  // 验证收货人姓名
  if (!form.value.customer_name || form.value.customer_name.trim() === '') {
    uni.showToast({ title: '请输入收货人姓名', icon: 'none' })
    return
  }
  
  // 验证联系电话
  if (!form.value.phone || form.value.phone.trim() === '') {
    uni.showToast({ title: '请输入联系电话', icon: 'none' })
    return
  }
  
  // 简单的电话格式验证
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(form.value.phone)) {
    uni.showToast({ title: '请输入正确的联系电话', icon: 'none' })
    return
  }
  
  // 验证收货地址
  if (!form.value.address || form.value.address.trim() === '') {
    uni.showToast({ title: '请输入收货地址', icon: 'none' })
    return
  }
  
  // 验证商品信息
  if (!items.value || items.value.length === 0) {
    uni.showToast({ title: '请选择商品', icon: 'none' })
    return
  }
  
  // 直接创建订单并支付
  createOrder()
}

async function createOrder() {
  try {
    const orderItems = items.value.map(item => ({
      product_id: item.productId || item.product_id || item.id,
      product_name: item.name,
      price: Number(item.price),
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      shop_id: item.shop_id // 添加店铺 ID，用于优惠券隔离
    }))

    // 构建订单数据
    const orderData = {
      customer_name: form.value.customer_name,
      phone: form.value.phone,
      address: form.value.address,
      status: 1, // 先创建待支付订单
      items: orderItems,
      total_amount: finalPrice.value
    }
    
    // 如果选择了优惠券，添加到订单数据中
    if (selectedCoupon.value) {
      orderData.coupon_id = selectedCoupon.value.coupon_id
      orderData.coupon_name = selectedCoupon.value.name
      orderData.coupon_discount = discountAmount.value
      orderData.original_amount = totalPrice.value
    }

    // 1. 创建待支付订单（status: 1）
    const res = await orderApi.create(orderData)
    
    // 保存用户地址信息到本地存储，以便下次使用
    uni.setStorageSync('recentAddress', {
      customer_name: form.value.customer_name,
      phone: form.value.phone,
      address: form.value.address
    })
    
    // 2. 直接调用支付（后端返回 data.orders 数组，取第一个订单的 id）
    const orderId = res.data?.orders?.[0]?.order_id
    if (!orderId) {
      throw new Error('创建订单后未获取到订单ID')
    }
    await processPayment(orderId)
  } catch (error) {
    uni.showToast({ title: error.message || '下单失败', icon: 'none' })
  }
}

// 处理支付流程
async function processPayment(orderId) {
  try {
    // 1. 检查是否设置了支付密码
    const passwordStatus = await payPasswordApi.getStatus()
    
    if (!passwordStatus.data?.is_set) {
      // 未设置支付密码，引导用户设置
      uni.showModal({
        title: '提示',
        content: '您还未设置支付密码，请先设置支付密码后再进行支付',
        confirmText: '去设置',
        success: (res) => {
          if (res.confirm) {
            uni.navigateTo({
              url: '/pages/user/set-pay-password'
            })
          }
        }
      })
      return
    }
    
    // 2. 显示密码输入键盘
    currentPayOrderId.value = orderId
    paymentPassword.value = ''
    showKeypad.value = true
  } catch (error) {
    console.error('检查支付密码状态失败:', error)
    uni.showToast({
      title: error.message || '支付准备失败',
      icon: 'none'
    })
  }
}

// 处理密码输入完成
async function onPasswordSubmit(password) {
  try {
    uni.showLoading({
      title: '正在支付...'
    })
    
    // 3. 验证支付密码
    const verifyResult = await payPasswordApi.verify(password)
    
    if (!verifyResult.success) {
      uni.hideLoading()
      showKeypad.value = false
      
      // 显示错误信息，包括剩余尝试次数
      const errorMsg = verifyResult.data?.error_count >= 5 
        ? '密码已锁定，请稍后再试' 
        : verifyResult.message || '密码错误'
      
      uni.showToast({
        title: errorMsg,
        icon: 'none',
        duration: 2000
      })
      return
    }
    
    // 4. 密码验证通过，继续支付
    const userInfo = uni.getStorageSync('userInfo')
    const userId = userInfo?.id
    
    if (!userId) {
      throw new Error('用户未登录')
    }
    
    let response
    
    // 根据支付方式调用不同的 API
    if (paymentMethod.value === 'alipay' || paymentMethod.value === 'wechat') {
      // 模拟支付宝/微信支付
      response = await walletApi.simulatePay(userId, currentPayOrderId.value, finalPrice.value, paymentMethod.value)
    } else {
      // 钱包余额支付
      response = await walletApi.pay(userId, currentPayOrderId.value, finalPrice.value)
    }
    
    uni.hideLoading()
    showKeypad.value = false
    
    if (response.success) {
      uni.showToast({
        title: '支付成功',
        icon: 'success'
      })
      
      // 跳转到支付成功页面
      setTimeout(() => {
        uni.redirectTo({
          url: `/pages/payment/success?orderId=${currentPayOrderId.value}&amount=${finalPrice.value}&paymentMethod=${paymentMethod.value}`
        })
      }, 1500)
    } else {
      throw new Error(response.message || '支付失败')
    }
    
  } catch (error) {
    uni.hideLoading()
    showKeypad.value = false
    
    uni.showToast({
      title: error.message || '支付失败',
      icon: 'error'
    })
    console.error('支付失败:', error)
    
    setTimeout(() => {
      uni.redirectTo({
        url: `/pages/order/detail?id=${currentPayOrderId.value}`
      })
    }, 1500)
  }
}

// 关闭密码键盘
function handleCloseKeypad() {
  showKeypad.value = false
  paymentPassword.value = ''
}

// 更新订单状态
async function updateOrderStatus(orderId, status) {
  try {
    const response = await uni.request({
      url: `http://localhost:3000/api/orders/${orderId}/status`,
      method: 'PUT',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        status: status
      }
    })
    
    if (!response.data.success) {
      throw new Error(response.data.message || '更新订单状态失败')
    }
  } catch (error) {
    console.error('更新订单状态失败:', error)
    throw error
  }
}
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
    background: var(--bg-color);
    min-height: 100vh;
    padding-bottom: 120rpx;
  }

.product-list {
  padding: var(--spacing-sm);
}

.product-card {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--bg-white);
  margin-bottom: var(--spacing-sm);
  border-radius: var(--card-radius);
}

.product-image {
  width: 140rpx;
  height: 140rpx;
  border-radius: var(--button-radius);
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
}

.product-meta {
  display: flex;
  gap: var(--spacing-sm);
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-info {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  color: var(--primary-color);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.price-value {
  color: var(--primary-color);
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.quantity {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

/* 优惠展示行样式（参考美团） */
.discount-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: linear-gradient(to right, #fff5f5, #fff);
  border-radius: 4rpx;
  font-size: var(--font-size-xs);
}

.discount-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.discount-price {
  color: #ff6b00;
  font-size: var(--font-size-md);
  font-weight: 600;
}

.discount-amount-tag {
  color: #fff;
  background: linear-gradient(90deg, #ff9000, #ff6b00);
  padding: 2rpx 8rpx;
  border-radius: 4rpx;
  font-weight: 500;
}

.section-card {
  background: var(--bg-white);
  margin: 0;
  padding-bottom: var(--spacing-sm);
}

.section-card + .section-card {
  border-top: 1rpx solid var(--border-color);
}

.section-card :deep(.van-cell__label) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.section-card :deep(.van-cell) {
  padding-left: var(--spacing-md);
  padding-right: var(--spacing-md);
}

.section-card :deep(.van-field) {
  padding-left: var(--spacing-md);
  padding-right: var(--spacing-md);
}

.section-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  padding: var(--spacing-sm);
  padding-bottom: var(--spacing-xs);
}

.order-summary {
  padding: 0 var(--spacing-md);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.free-shipping {
  color: var(--success-color);
}

.summary-row.total {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
}

.total-price {
  color: var(--primary-color);
  font-size: var(--font-size-lg);
}

.submit-tip {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  margin-left: var(--spacing-md);
}

/* 地址选择器样式 */
.address-section {
  padding: 0 var(--spacing-md);
}

.address-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border: 2rpx solid var(--border-color);
  border-radius: var(--button-radius);
  background: var(--bg-white);
  cursor: pointer;
}

.address-selector:active {
  background: var(--bg-color);
}

.address-label {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  margin-right: var(--spacing-md);
}

.address-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
  justify-content: flex-end;
}

.address-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  text-align: right;
}

.address-text.selected {
  color: var(--text-primary);
}

.address-detail {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  background: var(--bg-white);
  border-left: 2rpx solid var(--border-color);
  border-right: 2rpx solid var(--border-color);
  border-bottom: 2rpx solid var(--border-color);
  border-radius: 0 0 var(--button-radius) var(--button-radius);
}

.address-placeholder {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  background: var(--bg-white);
  border-left: 2rpx solid var(--border-color);
  border-right: 2rpx solid var(--border-color);
  border-bottom: 2rpx solid var(--border-color);
  border-radius: 0 0 var(--button-radius) var(--button-radius);
}

/* 优惠券选择器样式 */
.coupon-section {
  padding: 0 var(--spacing-md);
}

.coupon-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border: 2rpx solid var(--border-color);
  border-radius: var(--button-radius);
  margin-bottom: var(--spacing-sm);
  background: var(--bg-white);
  cursor: pointer;
}

.coupon-selector:active {
  background: var(--bg-color);
}

.coupon-label {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  margin-right: var(--spacing-md);
}

.coupon-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
  justify-content: flex-end;
}

.coupon-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  text-align: right;
}

.coupon-info i {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}
</style>

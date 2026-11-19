<template>
  <view class="container">
    <view class="coupon-tabs">
      <view
        v-for="tab in tabs"
        :key="tab.name"
        class="tab-item"
        :class="{ active: currentTab === tab.name }"
        @click="onTabChange(tab.name)"
      >
        {{ tab.label }}
      </view>
    </view>

    <view v-if="loading" class="loading-state">
      <van-loading type="spinner" vertical>加载中...</van-loading>
    </view>

    <van-empty v-else-if="currentTab === 'available' && availableCoupons.length === 0" description="暂无可领取优惠券" />
    <van-empty v-else-if="currentTab === 'my' && myCoupons.length === 0" :description="selectMode ? '没有可用优惠券' : '暂无优惠券'" />

    <view v-else class="coupon-list">
      <view 
        v-for="coupon in currentTab === 'available' ? availableCoupons : myCoupons" 
        :key="coupon.id"
        class="coupon-card"
        :class="{ 
          selected: selectMode && currentTab === 'my' && selectedCoupon && selectedCoupon.id === coupon.id,
          disabled: selectMode && currentTab === 'my' && coupon.status !== 'unused'
        }"
        @click="selectMode && currentTab === 'my' ? handleSelectCoupon(coupon) : null"
      >
        <view class="coupon-left">
          <view class="coupon-value">
            <text class="value-text">{{ formatCouponValue(coupon) }}</text>
          </view>
          <view class="coupon-condition">
            <text v-if="coupon.min_amount">满{{ coupon.min_amount }}元可用</text>
            <text v-else>无门槛</text>
          </view>
        </view>

        <view class="coupon-right">
          <view class="coupon-name">{{ coupon.name }}</view>
          <view class="coupon-desc">{{ coupon.description }}</view>
          <view class="coupon-scope">
            <van-tag size="small" type="primary">{{ formatScopeDetail(coupon) }}</van-tag>
            <!-- 指定商品优惠券：显示展开按钮 -->
            <van-tag
              v-if="coupon.scope === 'specific_product' && coupon.productIds && coupon.productIds.length > 0"
              size="small"
              :type="expandedCouponId === coupon.id ? 'success' : 'warning'"
              @click="toggleProductList(coupon, $event)"
            >
              {{ expandedCouponId === coupon.id ? '收起' : '查看商品' }}
              <van-icon :name="expandedCouponId === coupon.id ? 'arrow-up' : 'arrow-down'" size="12px" style="margin-left: 2px;" />
            </van-tag>
          </view>
          <view class="coupon-date">
            <text>{{ formatDate(coupon.valid_from) }} - {{ formatDate(coupon.valid_to) }}</text>
          </view>
          <view v-if="currentTab === 'my'" class="coupon-status">
            <van-tag :type="getStatusType(coupon.status)">{{ getStatusText(coupon.status) }}</van-tag>
          </view>

          <!-- 指定商品下拉列表 -->
          <view v-if="expandedCouponId === coupon.id" class="product-dropdown">
            <view class="dropdown-title">适用商品</view>
            <view v-if="couponProductsMap[coupon.id] && couponProductsMap[coupon.id].length > 0" class="product-list">
              <view
                v-for="product in couponProductsMap[coupon.id]"
                :key="product.id"
                class="product-item"
                @click="goToProduct(product.id)"
              >
                <image class="product-image" :src="product.image" mode="aspectFill" />
                <view class="product-info">
                  <view class="product-name">{{ product.name }}</view>
                  <view class="product-price">¥{{ product.price }}</view>
                </view>
                <van-icon name="arrow" size="16px" color="#999" />
              </view>
            </view>
            <view v-else class="product-empty">
              <text>暂无商品信息</text>
            </view>
          </view>
        </view>

        <view v-if="currentTab === 'available'" class="coupon-action">
          <van-button 
            type="danger" 
            size="small" 
            round
            :disabled="coupon.total_quantity <= coupon.used_quantity"
            @click="receiveCoupon(coupon)"
          >
            {{ coupon.total_quantity <= coupon.used_quantity ? '已领完' : '立即领取' }}
          </van-button>
        </view>
        
        <!-- 调试信息 - 已移除 -->
        
        <view v-if="selectMode && selectedCoupon && selectedCoupon.id === coupon.id" class="coupon-selected">
          <van-icon name="success" color="#07c160" size="40rpx" />
        </view>

        <!-- 已使用标识 -->
        <view v-if="currentTab === 'my' && coupon.status === 'used'" class="coupon-used-overlay">
          <view class="used-badge">已使用</view>
        </view>

        <!-- 已过期标识 -->
        <view v-if="currentTab === 'my' && coupon.status === 'expired'" class="coupon-expired-overlay">
          <view class="expired-badge">已过期</view>
        </view>
      </view>
    </view>
    
    <view v-if="selectMode" class="select-footer">
      <!-- 不使用优惠券选项 -->
      <view 
        class="no-coupon-option"
        :class="{ active: !selectedCoupon }"
        @click="handleNoCoupon"
      >
        <van-icon v-if="!selectedCoupon" name="checked" color="#07c160" size="20px" />
        <view v-else class="no-coupon-circle"></view>
        <text class="no-coupon-text">不使用优惠券</text>
      </view>
      
      <van-button 
        type="primary" 
        block
        style="margin-top: 16rpx;"
        @click="confirmSelect"
      >
        {{ selectedCoupon ? `使用优惠券（${formatCouponValue(selectedCoupon)}）` : '确认，不使用优惠券' }}
      </van-button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { onShow, onLoad } from '@dcloudio/uni-app'
import { couponApi } from '@/services/api.js'

const tabs = [
  { name: 'available', label: '可领取' },
  { name: 'my', label: '我的优惠券' }
]

const currentTab = ref('available')
const loading = ref(true)
const availableCoupons = ref([])
const myCoupons = ref([])
const userInfo = ref(null)
const selectMode = ref(false)
const selectedCoupon = ref(null)

// 展开的优惠券商品列表
const expandedCouponId = ref(null)
const couponProductsMap = ref({})

onLoad((options) => {
  // 检查是否处于选择模式
  if (options.selectMode === 'true') {
    selectMode.value = true
    currentTab.value = 'my' // 在选择模式下默认显示我的优惠券
    console.log('进入优惠券选择模式，只显示已领取的优惠券')
  } else {
    console.log('进入优惠券管理页面，可以领取和使用优惠券')
  }
})

onMounted(() => {
  loadUserInfo()
})

onShow(() => {
  loadUserInfo()
})

function loadUserInfo() {
  const user = uni.getStorageSync('userInfo')
  if (user) {
    userInfo.value = user
    loadCoupons()
  } else {
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
}

async function loadCoupons() {
  if (!userInfo.value) return

  loading.value = true
  try {
    if (currentTab.value === 'available') {
      await loadAvailableCoupons()
    } else {
      await loadMyCoupons()
    }
  } catch (error) {
    console.error('加载优惠券失败:', error)
    const errorMessage = error.message || '加载优惠券失败，请稍后重试'
    uni.showToast({
      title: errorMessage,
      icon: 'none',
      duration: 2000
    })
  } finally {
    loading.value = false
  }
}

async function loadAvailableCoupons() {
  const { success, data } = await couponApi.getAvailable(userInfo.value.id)
  if (success) {
    availableCoupons.value = data || []
  }
}

async function loadMyCoupons() {
  const { success, data } = await couponApi.getUserCoupons(userInfo.value.id)
  if (success) {
    myCoupons.value = data || []
  }
}

function onTabChange(name) {
  currentTab.value = name
  loadCoupons()
}

async function receiveCoupon(coupon) {
  if (!userInfo.value) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
      duration: 2000
    })
    return
  }

  try {
    uni.showLoading({ title: '领取中...' })
    // 传递 coupon_id 而不是 couponId，与后端保持一致
    const { success, message } = await couponApi.receive({
      userId: userInfo.value.id,
      coupon_id: coupon.id
    })
    
    uni.hideLoading()
    
    if (success) {
      uni.showToast({
        title: message || '领取成功',
        icon: 'success',
        duration: 2000
      })
      // 刷新可领取列表
      loadAvailableCoupons()
      // 选择模式下：同时刷新我的优惠券并切换过去
      if (selectMode.value) {
        loadMyCoupons()
        setTimeout(() => {
          currentTab.value = 'my'
        }, 800)
      }
    } else {
      const errorMessage = message || '领取失败，请稍后重试'
      uni.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 2000
      })
    }
  } catch (error) {
    uni.hideLoading()
    console.error('领取优惠券失败:', error)
    const errorMessage = error.message || '网络错误，请稍后重试'
    uni.showToast({
      title: errorMessage,
      icon: 'none',
      duration: 2000
    })
  }
}

function formatCouponValue(coupon) {
  if (coupon.type === 'percentage') {
    return `${coupon.value}%`
  } else if (coupon.type === 'fixed_amount' || coupon.type === 'threshold') {
    return `¥${coupon.value}`
  } else if (coupon.type === 'free_shipping') {
    return '免运费'
  }
  return coupon.value
}

function formatScope(scope) {
  const scopeMap = {
    all: '全场通用',
    specific_product: '指定商品',
    specific_category: '指定分类'
  }
  return scopeMap[scope] || scope
}

function formatScopeDetail(coupon) {
  // 判断是平台券还是店铺券
  const isPlatformCoupon = !coupon.shop_id
  
  if (coupon.scope === 'all') {
    return '平台全场通用'
  } else if (coupon.scope === 'shop_all') {
    // 店铺券，显示店铺名称
    if (coupon.shop_name) {
      return `${coupon.shop_name}·本店通用`
    } else {
      return '本店全场通用'
    }
  } else if (coupon.scope === 'specific_product' && coupon.productIds && coupon.productIds.length > 0) {
    const prefix = isPlatformCoupon ? '平台·' : ''
    return `${prefix}指定商品 (${coupon.productIds.length}个)`
  } else if (coupon.scope === 'specific_category' && coupon.categoryIds && coupon.categoryIds.length > 0) {
    const prefix = isPlatformCoupon ? '平台·' : ''
    return `${prefix}指定分类 (${coupon.categoryIds.length}个)`
  }
  return formatScope(coupon.scope)
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

function getStatusType(status) {
  const typeMap = {
    unused: 'success',
    used: 'info',
    expired: 'default'
  }
  return typeMap[status] || 'default'
}

function getStatusText(status) {
  const textMap = {
    unused: '未使用',
    used: '已使用',
    expired: '已过期'
  }
  return textMap[status] || status
}

// 选择优惠券
function handleSelectCoupon(coupon) {
  // 只允许从"我的优惠券"标签页选择优惠券
  if (currentTab.value !== 'my') {
    uni.showToast({
      title: '请先领取优惠券',
      icon: 'none'
    })
    return
  }

  // 在"我的优惠券"标签页中，只能选择未使用的优惠券
  if (coupon.status !== 'unused') {
    uni.showToast({
      title: '只能选择未使用的优惠券',
      icon: 'none'
    })
    return
  }

  // 检查指定商品优惠券是否有关联商品
  if (coupon.scope === 'specific_product' && (!coupon.productIds || coupon.productIds.length === 0)) {
    uni.showToast({
      title: '该优惠券暂无可用商品',
      icon: 'none'
    })
    return
  }

  selectedCoupon.value = coupon
}

// 选择不使用优惠券
function handleNoCoupon() {
  selectedCoupon.value = null
}

// 展开/收起指定商品列表
async function toggleProductList(coupon, event) {
  event.stopPropagation()

  // 如果正在展开的不是当前优惠券，则展开当前
  if (expandedCouponId.value !== coupon.id) {
    expandedCouponId.value = coupon.id

    // 如果还没有加载过商品详情，则加载
    if (!couponProductsMap.value[coupon.id]) {
      try {
        const { success, data } = await couponApi.getCouponProducts(coupon.id)
        if (success) {
          couponProductsMap.value[coupon.id] = data || []
        }
      } catch (error) {
        console.error('获取优惠券商品失败:', error)
        couponProductsMap.value[coupon.id] = []
      }
    }
  } else {
    // 收起
    expandedCouponId.value = null
  }
}

// 跳转到商品详情
function goToProduct(productId) {
  uni.navigateTo({
    url: `/pages/product/detail?id=${productId}`
  })
}

// 确认选择优惠券
function confirmSelect() {
  if (!selectedCoupon.value) {
    uni.showToast({
      title: '请先选择优惠券',
      icon: 'none'
    })
    return
  }
  
  // 将选中的优惠券保存到全局数据
  const globalData = getApp().globalData
  globalData.selectedCoupon = selectedCoupon.value
  
  // 返回上一页
  uni.navigateBack()
}

// 取消选择
function cancelSelect() {
  uni.navigateBack()
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: transparent;
  padding-bottom: 100rpx;
}

.coupon-tabs {
  background: var(--bg-white);
  padding: var(--spacing-md);
  margin: 0 var(--spacing-md) var(--spacing-md) var(--spacing-md);
  display: flex;
  gap: var(--spacing-md);
  border-radius: var(--card-radius);
  box-shadow: var(--shadow-sm);
}

/* 选择模式标题栏 */
.coupon-select-header {
  background: linear-gradient(135deg, #ffc0cb 0%, #ffb6c1 100%);
  padding: 28rpx 32rpx;
  margin: 0 var(--spacing-md) var(--spacing-md) var(--spacing-md);
  border-radius: var(--card-radius);
}

.select-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  display: block;
  margin-bottom: 8rpx;
}

.select-subtitle {
  font-size: 24rpx;
  color: rgba(255,255,255,0.85);
}

.tab-item {
  flex: 1;
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--bg-color);
  border-radius: 20rpx;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  text-align: center;
  transition: all var(--transition-fast);
}

.tab-item.active {
  background: #ffc0cb; /* 水蜜桃粉 */
  color: var(--bg-white);
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 200rpx 0;
}

.coupon-list {
  padding: 20rpx;
}

.coupon-card {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  display: flex;
  overflow: hidden;
  position: relative;
}

.coupon-left {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  color: #fff;
  padding: 30rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 180rpx;
  position: relative;
}

.coupon-left::after {
  content: '';
  position: absolute;
  right: -10rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 20rpx;
  height: 20rpx;
  background: #f5f5f5;
  border-radius: 50%;
}

.coupon-value {
  font-size: 48rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.value-text {
  font-size: 48rpx;
}

.coupon-condition {
  font-size: 20rpx;
  opacity: 0.9;
}

.coupon-right {
  flex: 1;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.coupon-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.coupon-desc {
  font-size: 24rpx;
  color: #999;
}

.coupon-scope {
  margin: 4rpx 0;
}

.coupon-date {
  font-size: 22rpx;
  color: #999;
}

.coupon-status {
  margin-top: 4rpx;
}

/* 已使用/已过期遮罩样式 */
.coupon-used-overlay,
.coupon-expired-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.coupon-used-overlay {
  background: rgba(255, 255, 255, 0.7);
}

.coupon-expired-overlay {
  background: rgba(245, 245, 245, 0.7);
}

.used-badge,
.expired-badge {
  padding: 12rpx 32rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  font-weight: bold;
  transform: rotate(-15deg);
}

.used-badge {
  background: linear-gradient(135deg, #07c160 0%, #04b566 100%);
  color: #fff;
  box-shadow: 0 4rpx 12rpx rgba(7, 193, 96, 0.3);
}

.expired-badge {
  background: linear-gradient(135deg, #969799 0%, #727275 100%);
  color: #fff;
  box-shadow: 0 4rpx 12rpx rgba(150, 151, 153, 0.3);
}

/* 指定商品下拉列表 */
.product-dropdown {
  margin-top: 16rpx;
  padding: 16rpx;
  background: #f8f8f8;
  border-radius: 8rpx;
}

.dropdown-title {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 12rpx;
  padding-bottom: 8rpx;
  border-bottom: 1rpx solid #eee;
}

.product-list {
  max-height: 400rpx;
  overflow-y: auto;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.product-item:last-child {
  border-bottom: none;
}

.product-image {
  width: 80rpx;
  height: 80rpx;
  border-radius: 8rpx;
  background: #f5f5f5;
}

.product-info {
  flex: 1;
  margin-left: 16rpx;
}

.product-name {
  font-size: 26rpx;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 320rpx;
}

.product-price {
  font-size: 24rpx;
  color: #ff6b6b;
  margin-top: 4rpx;
}

.product-empty {
  text-align: center;
  color: #999;
  font-size: 24rpx;
  padding: 20rpx 0;
}

.coupon-action {
  position: absolute;
  right: 24rpx;
  bottom: 24rpx;
}

/* 禁用状态（可领取标签页中的优惠券在选择模式下） */
.coupon-card.disabled {
  opacity: 0.5;
  background: #f5f5f5;
}

.coupon-card.disabled .coupon-left {
  background: #ccc;
}

.coupon-card.selected {
  border: 4rpx solid #07c160;
}

/* 选择模式底部 */
.select-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.no-coupon-option {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: var(--card-radius);
  gap: 16rpx;
  transition: all 0.2s ease;
}

.no-coupon-option.active {
  background: linear-gradient(135deg, #f6ffed, #eaffea);
  border: 2rpx solid #b7eb8f;
}

.no-coupon-circle {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 3rpx solid #d9d9d9;
  flex-shrink: 0;
}

.no-coupon-text {
  font-size: 28rpx;
  color: var(--text-primary);
}
</style>

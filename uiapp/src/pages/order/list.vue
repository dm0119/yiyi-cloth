<template>
  <view class="container">
    <!-- 订单状态分类筛选 -->
    <view class="order-tabs">
      <van-tabs :active="currentTab" @change="onTabChange" sticky>
        <van-tab title="全部" name="all" />
        <van-tab title="待支付" name="1" />
        <van-tab title="待发货" name="2" />
        <van-tab title="已发货" name="3" />
        <van-tab title="待收货" name="4" />
        <van-tab title="已完成" name="5" />
        <van-tab title="已取消" name="6" />
        <van-tab title="售后中" name="7" />
        <van-tab title="退货中" name="8" />
        <van-tab title="待退款" name="9" />
        <van-tab title="已退款" name="10" />
        <van-tab title="已拒绝" name="11" />
      </van-tabs>
    </view>

    <view v-if="loading" class="loading-state">
      <van-loading type="spinner" vertical>加载中...</van-loading>
    </view>

    <van-empty v-else-if="orders.length === 0" description="暂无订单" />

    <view v-else class="order-list">
      <view 
        v-for="order in orders" 
        :key="order.id"
        class="order-card"
        @click="goToDetail(order.id)"
      >
        <view class="order-header">
          <text class="order-no">订单号: {{ order.order_no }}</text>
          <van-tag :type="getStatusType(order.status)">
            {{ getStatusText(order.status) }}
          </van-tag>
        </view>

        <view class="order-body">
          <view class="customer-row">
            <van-icon name="user-o" />
            <text class="customer-name">{{ order.customer_name }}</text>
            <text class="customer-phone">{{ order.phone }}</text>
          </view>
          <view class="address-row">
            <van-icon name="location-o" />
            <text class="address">{{ order.address }}</text>
          </view>
        </view>

        <view class="order-footer">
          <view class="order-amount">
            <text>订单金额：</text>
            <text class="amount-value">¥{{ Number(order.total_amount).toFixed(2) }}</text>
            <!-- 倒计时显示 -->
            <text v-if="order.status === 1 && order.expires_at" class="countdown-text">
              剩余：{{ countdowns[order.id] || '15:00' }}
            </text>
          </view>
          <view class="order-discount" v-if="order.coupon_info && order.coupon_info.status === 'used'">
            <text class="discount-label">优惠信息：</text>
            <text class="discount-value">{{ order.coupon_info.name }}</text>
          </view>
          <view class="order-discount" v-if="order.coupon_info && order.coupon_info.status === 'used'">
            <text class="discount-label">优惠金额：</text>
            <text class="discount-amount">-¥{{ Number(order.coupon_info.discount_amount).toFixed(2) }}</text>
          </view>
          <text class="order-date">{{ formatDate(order.created_at) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive, computed } from 'vue'
import { onShow, onLoad } from '@dcloudio/uni-app'
import { orderApi } from '@/services/api.js'

// 防抖定时器
let reloadTimer = null
let showReloadTimer = null

const orders = ref([])
const loading = ref(true)
const currentTab = ref('all')
let hasCheckedGlobalData = false; // Flag to prevent re-checking global data on every onShow
const isLoggedIn = ref(false)

// 倒计时相关
const countdowns = reactive({})
let timer = null

// 格式化倒计时
function formatCountdown(seconds) {
  if (seconds <= 0) return '已过期'
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}分${secs}秒`
}

// 计算订单剩余时间
function calculateRemainingTime(expiresAt) {
  if (!expiresAt) return 0
  const now = new Date()
  const end = new Date(expiresAt)
  const diff = Math.floor((end - now) / 1000)
  return Math.max(0, diff)
}

// 标记是否正在处理过期订单，避免无限循环
let isProcessingExpiredOrders = false
// 记录上次检查过期订单的时间
let lastExpiredCheckTime = 0

// 更新所有订单的倒计时
function updateAllCountdowns() {
  let hasExpiredOrders = false
  
  orders.value.forEach(order => {
    if (order.status === 1 && order.expires_at) {
      const remainingSeconds = calculateRemainingTime(order.expires_at)
      countdowns[order.id] = formatCountdown(remainingSeconds)
      
      // 标记是否有过期订单
      if (remainingSeconds <= 0) {
        hasExpiredOrders = true
      }
    }
  })
  
  // 只有当有过期订单时，才重新加载，并且使用防抖
  // 限制检查频率，每30秒最多检查一次
  const now = Date.now()
  if (hasExpiredOrders && !reloadTimer && !isProcessingExpiredOrders && (now - lastExpiredCheckTime > 30000)) {
    lastExpiredCheckTime = now
    isProcessingExpiredOrders = true
    reloadTimer = setTimeout(() => {
      loadOrders(currentTab.value === 'all' ? null : parseInt(currentTab.value))
      reloadTimer = null
      // 重置标记
      setTimeout(() => {
        isProcessingExpiredOrders = false
      }, 5000) // 5秒后允许再次处理，避免频繁刷新
    }, 1000) // 1秒防抖
  }
}

// 启动倒计时定时器
function startCountdownTimer() {
  // 清除之前的定时器
  if (timer) {
    clearInterval(timer)
  }
  
  // 每秒更新一次倒计时
  timer = setInterval(() => {
    updateAllCountdowns()
  }, 1000)
}

// 停止倒计时定时器
function stopCountdownTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

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

// Handle page load with potential status parameter
onLoad((options) => {
  if (checkLogin()) {
    // Check for status in URL params (for non-tabbar navigation)
    if (options.status) {
      currentTab.value = options.status
      loadOrders(parseInt(options.status))
    } else {
      loadOrders()
    }
  } else {
    goToLogin()
  }
})

// Check for global data when page is mounted (for tabbar navigation)
onMounted(() => {
  // 避免重复调用，只在onLoad没有执行时才执行
  if (checkLogin() && orders.value.length === 0) {
    // Check if there's a status filter set in global data
    const globalData = getApp().globalData;
    if (globalData && globalData.orderStatusFilter) {
      currentTab.value = globalData.orderStatusFilter.toString();
      loadOrders(globalData.orderStatusFilter);
      // Reset the global filter after using it
      globalData.orderStatusFilter = null;
      hasCheckedGlobalData = true;
    }
  }
})

// 标记是否正在加载订单，避免重复加载
let isLoadingOrders = false

async function loadOrders(status = null) {
  // 避免重复加载
  if (isLoadingOrders) {
    return
  }
  
  isLoadingOrders = true
  loading.value = true
  try {
    const res = await orderApi.getList(status)
    orders.value = res.data || []
    
    // 初始化倒计时
    updateAllCountdowns()
    
    // 启动倒计时定时器
    startCountdownTimer()
  } catch (error) {
    console.error('加载订单失败:', error)
  } finally {
    loading.value = false
    isLoadingOrders = false
  }
}

function onTabChange(event) {
  // 修复事件对象结构问题
  let tabName
  if (event && event.detail && event.detail.name !== undefined) {
    tabName = event.detail.name
  } else if (typeof event === 'string') {
    tabName = event
  } else {
    console.error('Unexpected event object:', event)
    return
  }
  
  currentTab.value = tabName
  // Reset the flag when user manually switches tabs, allowing future global data checks
  hasCheckedGlobalData = false;
  
  if (tabName === 'all') {
    loadOrders(null)
  } else {
    loadOrders(parseInt(tabName))
  }
}

function getStatusType(status) {
  const types = {
    1: 'warning',   // 待支付
    2: 'success',   // 待发货
    3: 'primary',   // 已发货
    4: 'success',   // 待收货
    5: 'danger',    // 已完成
    6: 'default',   // 已取消
    7: 'warning',   // 售后申请中
    8: 'primary',   // 退货中
    9: 'warning',   // 待退款
    10: 'success',  // 已退款
    11: 'danger'    // 已拒绝
  }
  return types[status] || 'default'
}

function getStatusText(status) {
  const texts = {
    1: '待支付',
    2: '待发货',
    3: '已发货',
    4: '待收货',
    5: '已完成',
    6: '已取消',
    7: '售后中',
    8: '退货中',
    9: '待退款',
    10: '已退款',
    11: '已拒绝'
  }
  return texts[status] || '未知'
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

onShow(() => {
  if (checkLogin()) {
    // 清除之前的定时器
    if (showReloadTimer) {
      clearTimeout(showReloadTimer)
    }
    
    // 添加防抖，避免频繁加载
    showReloadTimer = setTimeout(() => {
      // Check if there's a status filter set in global data (when switching from other tab)
      // Only check if we haven't checked it before to prevent overriding user tab switches
      const globalData = getApp().globalData;
      if (!hasCheckedGlobalData && globalData && globalData.orderStatusFilter) {
        currentTab.value = globalData.orderStatusFilter.toString();
        loadOrders(globalData.orderStatusFilter);
        // Reset the global filter after using it
        globalData.orderStatusFilter = null;
        hasCheckedGlobalData = true;
      }
      // 移除自动加载逻辑，避免页面切换时频繁刷新
    }, 500) // 500ms防抖
  } else {
    orders.value = []
    goToLogin()
  }
})

function goToDetail(orderId) {
  console.log('跳转到订单详情，订单ID:', orderId)
  if (!orderId) {
    uni.showToast({
      title: '订单ID无效',
      icon: 'none'
    })
    return
  }
  
  uni.navigateTo({
    url: `/pages/order/detail?id=${orderId}`
  })
}

// 组件卸载时清除定时器
onUnmounted(() => {
  stopCountdownTimer()
  if (showReloadTimer) {
    clearTimeout(showReloadTimer)
  }
})
</script>

<style scoped>
.container {
  background: transparent;
  min-height: 100vh;
}

.order-tabs {
  background: var(--bg-white);
  padding: var(--spacing-sm) 0;
  border-radius: var(--card-radius);
  margin: 0 var(--spacing-md) var(--spacing-md) var(--spacing-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

/* 订单标签样式修改 */
:deep(.van-tabs__nav--line) {
  border-bottom: none;
  border-radius: var(--card-radius);
  overflow: hidden;
}

:deep(.van-tabs__line) {
  display: none;
}

:deep(.van-tab) {
  transition: all var(--transition-fast);
  border-radius: var(--card-radius);
}

:deep(.van-tab--active) {
  background-color: #ffc0cb; /* 水蜜桃粉 */
  color: white !important;
}

:deep(.van-tab:active) {
  background-color: rgba(255, 192, 203, 0.5); /* 水蜜桃粉浅色 */
}

.order-list {
  padding: var(--spacing-md);
}

.order-card {
  background: var(--bg-white);
  border-radius: var(--card-radius);
  margin-bottom: var(--spacing-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 2rpx solid var(--border-color);
}

.order-no {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.order-body {
  padding: var(--spacing-md);
}

.customer-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.customer-name {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
}

.customer-phone {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.address-row {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
}

.address {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--bg-color);
}

.order-amount {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.amount-value {
  color: var(--primary-color);
  font-size: var(--font-size-lg);
  font-weight: 600;
}

/* 优惠信息样式 */
.order-discount {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.discount-label {
  margin-right: var(--spacing-xs);
}

.discount-value {
  color: var(--text-primary);
}

.discount-amount {
  color: var(--success-color);
  font-weight: 500;
}

.countdown-text {
  display: block;
  margin-top: 8rpx;
  color: var(--warning-color);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.order-date {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  min-height: 50vh;
}
</style>

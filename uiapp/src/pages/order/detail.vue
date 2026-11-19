<template>
  <view class="container">
    <view v-if="loading" class="loading-state">
      <Loading type="spinner" vertical>加载中...</Loading>
    </view>

    <view v-else-if="order" class="order-detail">
      <view v-if="orderError" class="error-message">
        <text class="error-text">{{ orderError }}</text>
      </view>
      <!-- 订单头部信息 -->
      <view class="order-header">
        <view class="order-no">订单号: {{ order.order_no }}</view>
        <Tag :type="getStatusType(order.status)" size="large">
          {{ getStatusText(order.status) }}
        </Tag>
      </view>

      <!-- 订单基本信息 -->
      <view class="section">
        <view class="section-title">订单信息</view>
        <view class="info-item">
          <text class="label">下单时间:</text>
          <text class="value">{{ formatDate(order.created_at) }}</text>
        </view>
        <view class="info-item">
          <text class="label">客户姓名:</text>
          <text class="value">{{ order.customer_name }}</text>
        </view>
        <view class="info-item">
          <text class="label">联系电话:</text>
          <text class="value">{{ order.phone }}</text>
        </view>
        <view class="info-item address-item">
          <text class="label">收货地址:</text>
          <text class="value">{{ order.address }}</text>
        </view>
      </view>

      <!-- 换货信息 -->
      <view class="section" v-if="isExchangeOrder()">
        <view class="section-title" style="color: #ff6b6b;">换货信息（新规格）</view>
        <view class="exchange-info">
          <view class="info-item">
            <text class="label">新颜色:</text>
            <text class="value" style="color: #ff6b6b; font-weight: bold;">{{ order.after_sale_info?.new_color || '未更改' }}</text>
          </view>
          <view class="info-item">
            <text class="label">新尺码:</text>
            <text class="value" style="color: #ff6b6b; font-weight: bold;">{{ order.after_sale_info?.new_size || '未更改' }}</text>
          </view>
        </view>
      </view>

      <!-- 订单商品列表 -->
      <view class="section">
        <view class="section-title">商品清单</view>
        <view v-if="order.items && order.items.length > 0" class="items-list">
          <view 
            v-for="(item, index) in order.items" 
            :key="index"
            class="item-card"
          >
            <view class="item-info">
              <text class="item-name">{{ item.product_name }}</text>
              <text class="item-spec" v-if="!isExchangeOrder()">
                规格: {{ item.size || '无' }} {{ item.color || '无' }}
              </text>
              <text class="item-spec" v-else>
                <text style="text-decoration: line-through; color: #999;">原规格: {{ item.size || '无' }} {{ item.color || '无' }}</text>
              </text>
            </view>
            <view class="item-price">
              <text class="price">¥{{ Number(item.price).toFixed(2) }}</text>
              <text class="quantity">×{{ item.quantity }}</text>
              <text class="subtotal">¥{{ (item.price * item.quantity).toFixed(2) }}</text>
            </view>
          </view>
        </view>
        <view v-else class="empty-items">
          <Empty description="暂无商品信息" />
        </view>
      </view>

      <!-- 物流信息 -->
      <view class="section" v-if="order.logistics_company">
        <view class="section-title">物流信息</view>
        <view class="logistics-info">
          <view class="logistics-item">
            <text class="label">物流公司:</text>
            <text class="value">{{ order.logistics_company }}</text>
          </view>
          <view class="logistics-item">
            <text class="label">物流单号:</text>
            <text class="value tracking-number">{{ order.tracking_number }}</text>
          </view>
          <view class="logistics-item" v-if="order.shipped_at">
            <text class="label">发货时间:</text>
            <text class="value">{{ formatDate(order.shipped_at) }}</text>
          </view>
        </view>
      </view>

      <!-- 订单金额汇总 -->
      <view class="section">
        <view class="el-card is-never-shadow order-amount">
          <div class="el-card__header">
            <div class="card-header">
              <span>金额汇总</span>
            </div>
          </div>
          <div class="el-card__body">
            <div class="amount-summary">
              <div class="amount-item">
                <span class="label">商品总额:</span>
                <span class="value">¥{{ Number(order.original_amount || order.total_amount).toFixed(2) }}</span>
              </div>
              <div class="amount-item">
                <span class="label">优惠信息:</span>
                <span class="value coupon-info">{{ order.coupon_info?.name || '未使用优惠券' }}</span>
                <span v-if="!order.coupon_info && orderError" class="error-text">（优惠信息异常）</span>
              </div>
              <div class="amount-item" v-if="order.coupon_info && Number(order.coupon_info.discount_amount) > 0">
              <div v-if="orderError" class="amount-item error-message">
                <span class="label">异常提示:</span>
                <span class="value error-text">{{ orderError }}</span>
              </div>
                <span class="label">优惠金额:</span>
                <span class="value discount-amount">-¥{{ Number(order.coupon_info.discount_amount).toFixed(2) }}</span>
              </div>
              <div class="amount-item total">
                <span class="label">订单总计:</span>
                <span class="value total-amount">¥{{ Number(order.total_amount).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <!-- 倒计时显示 -->
        <view v-if="order.status === 1" class="countdown-container">
          <text class="countdown-text" :class="{ expired: countdown <= 0 }">
            {{ countdownText }}
          </text>
        </view>
        
        <Button 
          v-if="order.status === 1" 
          type="primary" 
          block 
          @click="handlePay"
          :disabled="countdown <= 0"
        >
          立即支付 ¥{{ Number(order.total_amount).toFixed(2) }}
        </Button>
        <template v-else-if="order.status === 2">
          <Button
            type="default"
            block
            @click="goToAfterSale"
          >
            申请退款
          </Button>
          <Button 
            type="default" 
            block 
            style="margin-top: 10px" 
            @click="goToOrderList"
          >
            返回订单列表
          </Button>
        </template>
        <template v-else-if="order.status === 3">
          <Button
            type="primary"
            block
            @click="confirmReceipt"
          >
            确认收货
          </Button>
          <Button
            type="default"
            block
            style="margin-top: 10px"
            @click="goToAfterSale"
          >
            申请售后
          </Button>
        </template>
        <template v-else-if="order.status === 4">
          <Button
            type="primary"
            block
            @click="confirmReceipt"
          >
            确认收货
          </Button>
          <Button
            type="default"
            block
            style="margin-top: 10px"
            @click="goToAfterSale"
          >
            申请售后
          </Button>
        </template>
        <template v-else-if="order.status === 5">
          <Button
            type="primary"
            block
            @click="goToReview"
          >
            评价商品
          </Button>
          <Button
            type="default"
            block
            style="margin-top: 10px"
            @click="goToAfterSale"
          >
            申请售后
          </Button>
        </template>
        <template v-else-if="order.status === 6">
          <Button
            type="default"
            block
            @click="goBack"
          >
            订单已超时，请重新下单
          </Button>
        </template>
        <!-- 售后申请中(7) -->
        <template v-else-if="order.status === 7">
          <Button
            type="default"
            block
            @click="goToAfterSaleDetail"
          >
            查看售后详情
          </Button>
        </template>
        <!-- 退货中(8) -->
        <template v-else-if="order.status === 8">
          <Button
            type="default"
            block
            @click="goToAfterSaleDetail"
          >
            查看售后详情
          </Button>
        </template>
        <!-- 待退款(9) -->
        <template v-else-if="order.status === 9">
          <Button
            type="default"
            block
            @click="goToAfterSaleDetail"
          >
            查看售后详情
          </Button>
        </template>
        <!-- 已退款(10) -->
        <template v-else-if="order.status === 10">
          <Button
            type="default"
            block
            @click="goBack"
          >
            已退款
          </Button>
        </template>
        <!-- 售后被拒(11) -->
        <template v-else-if="order.status === 11">
          <Button
            type="default"
            block
            @click="goBack"
          >
            售后已拒绝
          </Button>
        </template>
        <Button 
          v-else 
          type="default" 
          block 
          @click="goBack"
        >
          返回订单列表
        </Button>
      </view>
    </view>

    <Empty v-else description="订单不存在" />

    <!-- 支付密码键盘 -->
    <NumberKeypad
      v-model:password="payPassword"
      :visible="showPayKeypad"
      title="请输入支付密码"
      @submit="onPasswordSubmit"
      @close="handleClosePayKeypad"
    />
  </view>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
const orderError = ref('')
import { onLoad, onShow, onUnload } from '@dcloudio/uni-app'
import { Icon, Button, Tag, Empty, Loading } from 'vant'
import { orderApi, walletApi, payPasswordApi } from '@/services/api.js'
import NumberKeypad from '@/components/NumberKeypad.vue'

const order = ref(null)
const loading = ref(true)
const orderId = ref(null)
// 订单是否还有可评价的商品
const hasReviewableItems = ref(false)
// 倒计时相关
const countdown = ref(0)
const countdownText = ref('')
const timer = ref(null)

// 检查登录状态
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
    return true
  } else {
    return false
  }
}

// 跳转到登录页面
function goToLogin() {
  uni.navigateTo({ url: '/pages/user/login' })
}

// 获取页面参数
onLoad((options) => {
  console.log('订单详情页面参数:', options)
  orderId.value = options.id
  
  if (!checkLogin()) {
    goToLogin()
    return
  }
  
  if (orderId.value) {
    loadOrderDetail()
  } else {
    uni.showToast({
      title: '订单ID无效',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
  
  // 监听导航栏返回按钮点击事件（仅在App环境中可用）
  let navigationBarButtonTapListener = null;
  if (uni.onNavigationBarButtonTap) {
    navigationBarButtonTapListener = uni.onNavigationBarButtonTap((res) => {
      if (res.index === 0) { // 第一个按钮（返回按钮）
        uni.navigateBack({
          delta: 1
        });
      }
    });
  }
  
  // 页面卸载时清理事件监听器
  onUnload(() => {
    if (navigationBarButtonTapListener) {
      uni.offNavigationBarButtonTap(navigationBarButtonTapListener);
    }
  });
})

onMounted(() => {
  if (!checkLogin()) {
    goToLogin()
    return
  }
  
  // 页面显示时的逻辑
  if (orderId.value && !order.value) {
    loadOrderDetail()
  }
})

async function loadOrderDetail() {
  loading.value = true
  try {
    if (!orderId.value) {
      orderError.value = '订单ID为空';
      throw new Error('订单ID为空')
    }
    const res = await orderApi.getById(orderId.value)
    console.log('订单详情API响应:', res)
    if (res.success && res.data) {
      order.value = res.data
      // 字段兜底校验
      if (!order.value.items || !Array.isArray(order.value.items)) {
        orderError.value = '订单商品信息异常';
      }
      // 如果订单是待支付状态，初始化倒计时
      if (order.value.status === 1 && order.value.expires_at) {
        initCountdown(order.value.expires_at)
      }
    } else {
      orderError.value = res.message || '订单不存在';
      console.error('订单不存在或API返回失败:', res)
      uni.showToast({
        title: res.message || '订单不存在',
        icon: 'none'
      })
    }
    // 检查订单中是否有可评价的商品
    await checkReviewableItems(orderId.value)
      // 打印订单商品数据结构
      console.log('订单商品数据:', res.data.items)
      console.log('优惠券信息:', res.data.coupon_info)
  } catch (error) {
    orderError.value = error.message || '加载订单失败';
    console.error('加载订单详情失败:', error)
    uni.showToast({
      title: error.message || '加载订单失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 添加一个watch来监听订单数据的变化，帮助调试优惠信息的问题
watch(
  () => order.value,
  (newOrder) => {
    console.log('订单数据更新:', newOrder)
    if (newOrder) {
      console.log('优惠信息:', newOrder.coupon_info)
    }
  },
  { deep: true }
)

function getStatusType(status) {
  const types = {
    1: 'warning',
    2: 'success',
    3: 'primary',
    4: 'success',
    5: 'danger',
    6: 'warning',
    7: 'warning',
    8: 'primary',
    9: 'warning',
    10: 'success',
    11: 'danger'
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
    7: '售后申请中',
    8: '退货中',
    9: '待退款',
    10: '已退款',
    11: '售后被拒'
  }
  return texts[status] || '未知'
}

// 判断是否为换货订单
function isExchangeOrder() {
  return order.value?.after_sale_type === 'exchange' || order.value?.after_sale_info?.type === 'exchange'
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// ========== 支付相关方法 ==========

// 支付密码相关状态
const showPayKeypad = ref(false)
const payPassword = ref('')
const currentPayMethod = ref('')

// 支付按钮处理函数
async function handlePay() {
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

    // 2. 显示支付方式选择
    uni.showModal({
      title: '选择支付方式',
      content: '请选择支付方式',
      editable: false,
      confirmText: '支付宝',
      cancelText: '微信支付',
      success: async (modalRes) => {
        if (modalRes.confirm) {
          currentPayMethod.value = 'alipay'
        } else {
          currentPayMethod.value = 'wechat'
        }
        // 3. 显示密码输入键盘
        payPassword.value = ''
        showPayKeypad.value = true
      }
    })
  } catch (error) {
    console.error('支付准备失败:', error)
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
      title: '正在验证...'
    })

    // 验证支付密码
    const verifyResult = await payPasswordApi.verify(password)

    if (!verifyResult.success) {
      uni.hideLoading()
      showPayKeypad.value = false

      // 显示错误信息
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

    // 密码验证通过，继续支付
    await doPay()
  } catch (error) {
    uni.hideLoading()
    showPayKeypad.value = false
    uni.showToast({
      title: error.message || '支付失败',
      icon: 'error'
    })
    console.error('支付失败:', error)
  }
}

// 执行支付
async function doPay() {
  try {
    uni.showLoading({
      title: '正在支付...'
    })

    // 调用模拟支付API
    const userInfo = uni.getStorageSync('userInfo')
    const userId = userInfo?.id
    if (!userId) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    const response = await walletApi.simulatePay(userId, orderId.value, Number(order.value.total_amount), currentPayMethod.value)

    if (!response.success) {
      throw new Error(response.message || '支付失败')
    }

    uni.hideLoading()
    showPayKeypad.value = false
    uni.showToast({
      title: '支付成功',
      icon: 'success'
    })

    setTimeout(() => {
      loadOrderDetail()
    }, 1500)
  } catch (error) {
    uni.hideLoading()
    showPayKeypad.value = false
    uni.showToast({
      title: error.message || '支付失败',
      icon: 'error'
    })
    console.error('支付失败:', error)
  }
}

// 关闭密码键盘
function handleClosePayKeypad() {
  showPayKeypad.value = false
  payPassword.value = ''
}





// 更新订单状态
async function updateOrderStatus(status) {
  try {
    // 调用后端API更新订单状态
    const response = await uni.request({
      url: `http://localhost:3000/api/orders/${orderId.value}/status`,
      method: 'PUT',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        status: status
      }
    });
    
    if (response.data.success) {
      console.log(`订单状态已更新为: ${status}`);
      
      // 如果订单状态不再是待支付状态，清除计时器
      if (status !== 1 && timer.value) {
        clearInterval(timer.value)
        timer.value = null
        countdownText.value = ''
        countdown.value = 0
      }
    } else {
      throw new Error(response.data.message || '更新订单状态失败');
    }
  } catch (error) {
    console.error('更新订单状态失败:', error);
    throw error;
  }
}

function copyTrackingNumber() {
  if (order.value && order.value.tracking_number) {
    uni.setClipboardData({
      data: order.value.tracking_number,
      success: () => {
        uni.showToast({
          title: '已复制物流单号',
          icon: 'success'
        })
      },
      fail: () => {
        uni.showToast({
          title: '复制失败',
          icon: 'none'
        })
      }
    })
  }
}



// 检查订单中是否有可评价的商品
async function checkReviewableItems(id) {
  try {
    const res = await orderApi.getReviewable(id)
    if (res.success) {
      // 后端返回 can_review 字段表示是否可以评价
      hasReviewableItems.value = res.data.can_review === true
      console.log('可评价状态:', hasReviewableItems.value, '原因:', res.data.reason)
    } else {
      // 如果获取失败，默认认为有可评价商品
      hasReviewableItems.value = true
    }
  } catch (error) {
    console.error('检查可评价商品失败:', error)
    // 发生错误时，默认认为有可评价商品
    hasReviewableItems.value = true
  }
}

// 初始化倒计时
function initCountdown(expiresAt) {
  // 清除之前的计时器
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
  
  // 如果订单已经不是待支付状态，不显示倒计时
  if (order.value.status !== 1) {
    countdownText.value = ''
    return
  }
  
  const endTime = new Date(expiresAt)
  const now = new Date()
  
  // 如果订单已过期，不显示倒计时
  if (now >= endTime) {
    countdownText.value = '订单已过期'
    return
  }
  
  // 计算剩余时间（毫秒）
  countdown.value = endTime.getTime() - now.getTime()
  
  // 更新倒计时显示
  updateCountdownText()
  
  // 每秒更新一次倒计时
  timer.value = setInterval(() => {
    countdown.value -= 1000
    
    if (countdown.value <= 0) {
      // 倒计时结束
      clearInterval(timer.value)
      timer.value = null
      countdownText.value = '订单已过期'
      // 刷新订单状态
      loadOrderDetail()
    } else {
      updateCountdownText()
    }
  }, 1000)
}

// 更新倒计时文本
function updateCountdownText() {
  const minutes = Math.floor(countdown.value / (1000 * 60))
  const seconds = Math.floor((countdown.value % (1000 * 60)) / 1000)
  countdownText.value = `剩余支付时间: ${minutes}分${seconds}秒`
}

// 在组件卸载时清除计时器
onMounted(() => {
  return () => {
    if (timer.value) {
      clearInterval(timer.value)
      timer.value = null
    }
  }
})

// 页面显示时检查登录状态
onShow(() => {
  if (!checkLogin()) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    setTimeout(() => {
      goToLogin()
    }, 1500)
  }
})

// 前往评价页面
function goToReview() {
  // 直接跳转到评价商品页面，让用户评价
  uni.navigateTo({
    url: `/pages/order/review?orderId=${orderId.value}`
  })
}

// 确认收货
async function confirmReceipt() {
  try {
    uni.showModal({
      title: '确认收货',
      content: '您确定要确认收货吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: async (modalRes) => {
        if (modalRes.confirm) {
          uni.showLoading({
            title: '处理中...'
          })
          
          // 调用 API 更新订单状态为已完成（状态 5）
          const response = await orderApi.updateStatus(orderId.value, 5)
          
          uni.hideLoading()
          
          if (response.success) {
            uni.showToast({
              title: '确认收货成功',
              icon: 'success'
            })
            
            // 确认收货成功后，直接跳转到评价商品页面
            setTimeout(() => {
              uni.navigateTo({
                url: `/pages/order/review?orderId=${orderId.value}`
              })
            }, 1500)
          } else {
            uni.showToast({
              title: response.message || '确认收货失败',
              icon: 'none'
            })
          }
        }
      }
    })
  } catch (error) {
    uni.hideLoading()
    console.error('确认收货失败:', error)
    uni.showToast({
      title: '确认收货失败',
      icon: 'none'
    })
  }
}

// 返回上一页
function goBack() {
  uni.navigateBack({
    delta: 1
  });
}

// 返回订单列表
function goToOrderList() {
  uni.switchTab({
    url: '/pages/order/list'
  });
}

// 申请售后
function goToAfterSale() {
  uni.navigateTo({
    url: `/pages/order/after-sale-apply?id=${orderId.value}`
  });
}

// 查看售后详情
function goToAfterSaleDetail() {
  if (order.value && order.value.after_sale_id) {
    uni.navigateTo({
      url: `/pages/order/after-sale-detail?id=${order.value.after_sale_id}`
    });
  }
}
</script>

<style scoped>
/* 订单异常兜底样式 */
.error-message {
  color: #f56c6c;
  background: #fff7f7;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 10px;
  font-size: 14px;
}
.error-text {
  color: #f56c6c;
  font-weight: bold;
}
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
    padding: var(--spacing-sm);
  }
  
  .order-detail {
    width: 100%;
  }
  
  .order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--bg-white);
  margin-bottom: var(--spacing-xs);
  border-radius: var(--card-radius);
}

.order-no {
  font-size: var(--font-size-md);
  color: var(--text-primary);
}

.section {
  background: var(--bg-white);
  margin-bottom: var(--spacing-xs);
  border-radius: var(--card-radius);
  overflow: hidden;
}

.section-title {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2rpx solid var(--border-color);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 2rpx solid var(--border-color);
}

.info-item:last-child {
  border-bottom: none;
}

.address-item {
  align-items: flex-start;
}

.label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-right: var(--spacing-md);
}

.value {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  flex: 1;
  text-align: right;
}

.items-list {
  padding: var(--spacing-sm) var(--spacing-md);
}

.item-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--spacing-sm) 0;
  border-bottom: 2rpx solid var(--border-color);
}

.item-card:last-child {
  border-bottom: none;
}

.item-info {
  flex: 1;
}

.item-name {
  display: block;
  font-size: var(--font-size-md);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.item-spec {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.item-price {
  text-align: right;
  min-width: 120rpx;
}

.price {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.quantity {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  margin-bottom: var(--spacing-xs);
}

.subtotal {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--primary-color);
  font-weight: 600;
}

.amount-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 2rpx solid var(--border-color);
}

.amount-item:last-child {
  border-bottom: none;
}

.total {
  background: var(--bg-color);
  font-weight: 600;
}

.total-amount {
  font-size: var(--font-size-lg);
  color: var(--primary-color);
}

.action-buttons {
  padding: var(--spacing-md);
  margin-top: var(--spacing-xs);
}

.countdown-container {
  margin-bottom: var(--spacing-md);
  text-align: center;
}

.countdown-text {
  color: var(--warning-color);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.countdown-text.expired {
  color: var(--danger-color);
}

.empty-items {
  padding: var(--spacing-xl) 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  min-height: 50vh;
}

.logistics-info {
  padding: var(--spacing-md) var(--spacing-lg);
}

.logistics-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) 0;
  border-bottom: 2rpx solid var(--border-color);
}

.logistics-item:last-child {
  border-bottom: none;
}

.logistics-refresh {
  display: flex;
  justify-content: flex-end;
}

.tracking-number {
  color: var(--primary-color);
}

.logistics-trace {
  padding: var(--spacing-md) var(--spacing-lg);
  position: relative;
}

.trace-item {
  display: flex;
  padding: var(--spacing-md) 0;
  position: relative;
}

.trace-item::before {
  content: '';
  position: absolute;
  left: 20rpx;
  top: 0;
  bottom: 0;
  width: 2rpx;
  background: var(--border-color);
  z-index: 1;
}

.trace-item-first::before {
  top: 50%;
  height: 50%;
}

.trace-item-last::before {
  height: 50%;
  bottom: 50%;
}

.trace-item-last {
  padding-bottom: var(--spacing-md);
}

.trace-dot {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: var(--border-color);
  position: relative;
  z-index: 2;
  margin-right: var(--spacing-md);
  flex-shrink: 0;
}

.trace-dot-first {
  background: var(--primary-color);
  border: 4rpx solid var(--primary-color);
  width: 36rpx;
  height: 36rpx;
}

.trace-dot-last {
  background: var(--success-color);
  border: 4rpx solid var(--success-color);
  width: 36rpx;
  height: 36rpx;
}

.trace-content {
  flex: 1;
}

.trace-status {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.trace-location {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.trace-desc {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin-bottom: var(--spacing-xs);
}

.trace-time {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

/* 金额汇总卡片样式 */
.el-card {
  width: 100%;
}

.order-amount {
  background: var(--bg-white);
  border-radius: var(--card-radius);
  overflow: hidden;
}

.el-card__header {
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--bg-white);
  border-bottom: 2rpx solid var(--border-color);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-card__body {
  padding: var(--spacing-md);
  background: var(--bg-white);
}

.amount-summary {
  display: flex;
  flex-direction: column;
}

/* 确保优惠信息样式正确 */
.coupon-info {
  color: var(--text-primary);
}

.discount-amount {
  color: var(--success-color);
}

/* ========== 物流编辑器样式 ========== */
.logistics-editor,
.logistics-node-form {
  padding: var(--spacing-md) var(--spacing-lg);
}

.editor-item {
  display: flex;
  flex-direction: column;
  margin-bottom: var(--spacing-md);
}

.editor-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.editor-input {
  width: 100%;
  padding: var(--spacing-sm);
  border: 2rpx solid var(--border-color);
  border-radius: var(--button-radius);
  font-size: var(--font-size-md);
  background: var(--bg-white);
}

.picker-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.editor-textarea {
  width: 100%;
  padding: var(--spacing-sm);
  border: 2rpx solid var(--border-color);
  border-radius: var(--button-radius);
  font-size: var(--font-size-md);
  background: var(--bg-white);
  min-height: 120rpx;
}

.editor-actions,
.form-actions {
  margin-top: var(--spacing-lg);
}

/* 物流操作区域 */
.logistics-actions {
  padding: var(--spacing-md) var(--spacing-lg);
}

.tip-text {
  margin-top: var(--spacing-md);
  text-align: center;
  color: var(--success-color);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-icon {
  font-size: var(--font-size-lg);
  margin-right: var(--spacing-xs);
  font-weight: bold;
}

/* 物流轨迹详情样式 */
.trace-detail {
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  display: flex;
  align-items: flex-start;
}

.detail-label {
  font-weight: 600;
  margin-right: var(--spacing-xs);
  white-space: nowrap;
  flex-shrink: 0;
}

.detail-value {
  color: var(--text-primary);
  flex: 1;
  word-break: break-all;
}

.trace-desc {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin-bottom: var(--spacing-xs);
}
</style>
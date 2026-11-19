<template>
  <div class="order-detail-page">
    <!-- 订单头部 -->
    <div class="order-header">
      <div class="order-status">
        <van-tag :type="getStatusType(order.status)" size="large">
          {{ getStatusText(order.status) }}
        </van-tag>
      </div>
      
      <!-- 如果是合并支付单，显示提示信息 -->
      <div v-if="order.is_merge_payment" class="merge-tip">
        <van-icon name="info-o" />
        <span>这是合并支付单，包含多个店铺的商品</span>
      </div>
    </div>
    
    <!-- 子订单列表（如果是合并支付） -->
    <div v-if="order.sub_orders" class="sub-orders">
      <div v-for="subOrder in order.sub_orders" :key="subOrder.id" class="sub-order-card">
        <!-- 店铺信息 -->
        <div class="shop-info" @click="goToShop(subOrder.shop_id)">
          <shop-avatar :shop="subOrder.shop" size="small" />
          <div class="shop-name">{{ subOrder.shop_name }}</div>
          <van-icon name="arrow" />
        </div>
        
        <!-- 商品列表 -->
        <div class="order-items">
          <div v-for="item in subOrder.items" :key="item.id" class="order-item">
            <img :src="item.image || '/placeholder.png'" />
            <div class="item-info">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-spec">
                {{ item.color || '' }} {{ item.size || '' }}
              </div>
              <div class="item-price">
                ¥{{ item.price }} x {{ item.quantity }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- 子订单金额 -->
        <div class="sub-order-total">
          小计：¥{{ subOrder.total_amount }}
        </div>
        
        <!-- 子订单操作按钮 -->
        <div class="sub-order-actions">
          <van-button v-if="subOrder.status === 1" size="small" type="primary" @click="handlePay(subOrder)">
            去支付
          </van-button>
          <van-button v-if="subOrder.status === 2" size="small" plain>
            查看物流
          </van-button>
          <van-button v-if="subOrder.status === 3" size="small" type="primary" @click="handleConfirmReceipt(subOrder)">
            确认收货
          </van-button>
        </div>
      </div>
    </div>
    
    <!-- 普通订单（非合并支付） -->
    <div v-else>
      <!-- 店铺信息 -->
      <div class="shop-info" v-if="order.shop" @click="goToShop(order.shop.id)">
        <shop-avatar :shop="order.shop" size="small" />
        <div class="shop-name">{{ order.shop.name }}</div>
        <van-icon name="arrow" />
      </div>
      
      <!-- 商品列表 -->
      <div class="order-items">
        <div v-for="item in order.items" :key="item.id" class="order-item">
          <img :src="item.image || '/placeholder.png'" />
          <div class="item-info">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-spec">
              {{ item.color || '' }} {{ item.size || '' }}
            </div>
            <div class="item-price">
              ¥{{ item.price }} x {{ item.quantity }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 订单操作 -->
      <div class="order-actions">
        <van-button v-if="order.status === 1" block type="primary" @click="handlePay(order)">
          立即支付
        </van-button>
        <van-button v-if="order.status === 3" block type="primary" @click="handleConfirmReceipt(order)">
          确认收货
        </van-button>
        <van-button v-if="[3, 4, 5].includes(order.status) && !order.after_sale_id" block plain @click="goToAfterSale(order)">
          申请售后
        </van-button>
        <van-button v-if="order.after_sale_id" block plain @click="viewAfterSale(order)">
          查看售后
        </van-button>
      </div>
    </div>
    
    <!-- 总金额 -->
    <div class="order-total-bar">
      <span>合计：</span>
      <span class="total-amount">¥{{ order.total_amount }}</span>
    </div>
    
    <!-- 订单信息 -->
    <div class="order-info-section">
      <van-cell-group inset>
        <van-cell title="订单号" :value="order.order_no" />
        <van-cell title="下单时间" :value="formatDate(order.created_at)" />
        <van-cell title="收货地址" :value="order.address" />
        <van-cell title="联系电话" :value="order.phone" />
        <van-cell title="客户姓名" :value="order.customer_name" />
        <!-- 物流信息：已发货状态显示 -->
    <van-cell 
      v-if="[3, 4, 5].includes(order.status) && order.logistics_company" 
      title="物流公司"
      :value="order.logistics_company"
    />
    <van-cell 
      v-if="[3, 4, 5].includes(order.status) && order.tracking_number" 
      title="物流单号"
      :value="order.tracking_number"
      value-class="tracking-number-text"
    />
  </van-cell-group>
    </div>

    <!-- 支付密码弹窗 -->
    <PayPassword
      ref="payPasswordRef"
      :visible="payPasswordVisible"
      :title="'请输入支付密码'"
      :amount="currentPayAmount"
      @close="closePayPassword"
      @confirm="confirmPayPassword"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import ShopAvatar from '@/mobile/components/ShopAvatar.vue'
import PayPassword from '@/mobile/components/PayPassword.vue'
import { request } from '@/utils/api'

const route = useRoute()
const router = useRouter()
const order = ref({})
const loading = ref(true)

// 支付密码相关
const payPasswordRef = ref(null)
const payPasswordVisible = ref(false)
const currentPayOrder = ref(null)
const currentPayAmount = ref('')

// 加载订单详情
const loadOrderDetail = async () => {
  try {
    // 添加时间戳参数避免缓存
    const timestamp = new Date().getTime()
    const res = await request(`/mobile/orders/${route.params.id}?t=${timestamp}`)
    if (res.success) {
      order.value = res.data
    }
  } catch (error) {
    console.error('加载订单详情失败:', error)
    showToast({ message: '加载失败', position: 'bottom' })
  } finally {
    loading.value = false
  }
}

// 跳转店铺
const goToShop = (shopId) => {
  if (shopId) {
    router.push(`/mobile/shop/${shopId}`)
  }
}

// 申请售后
const goToAfterSale = (order) => {
  // 获取第一个商品项
  const item = order.items?.[0] || order.sub_orders?.[0]?.items?.[0]
  if (item) {
    router.push({
      path: '/mobile/after-sale/apply',
      query: { orderId: order.id, itemId: item.id }
    })
  }
}

// 查看售后
const viewAfterSale = (order) => {
  router.push('/mobile/after-sales')
}

// 点击支付按钮
const handlePay = (orderItem) => {
  currentPayOrder.value = orderItem
  currentPayAmount.value = orderItem.total_amount
  payPasswordVisible.value = true
}

// 关闭支付密码弹窗
const closePayPassword = () => {
  payPasswordVisible.value = false
  payPasswordRef.value?.clearPassword()
}

// 确认收货
const handleConfirmReceipt = async (orderItem) => {
  try {
    await showDialog({
      title: '确认收货',
      message: '确认收到商品后，订单将标记为已完成。请确保商品完好无损。',
      confirmButtonText: '确认收货',
      cancelButtonText: '取消'
    })

    // 调用确认收货API
    const res = await request(`/mobile/orders/${orderItem.id}/confirm-receipt`, {
      method: 'POST'
    })

    if (res.success) {
      showToast({ message: '确认收货成功', position: 'bottom' })
      // 刷新订单详情
      loadOrderDetail()
    } else {
      showToast({ message: res.message || '确认收货失败', position: 'bottom' })
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认收货失败:', error)
      showToast({ message: '确认收货失败，请稍后重试', position: 'bottom' })
    }
  }
}

// 确认支付密码并完成支付
const confirmPayPassword = async (password) => {
  if (!currentPayOrder.value) {
    showToast({ message: '订单信息错误', position: 'bottom' })
    return
  }

  try {
    // 1. 先验证支付密码
    const verifyRes = await request('/mobile/pay-password/verify-password', {
      method: 'POST',
      data: {
        pay_password: password
      }
    })

    if (!verifyRes.success) {
      // 密码验证失败
      payPasswordRef.value?.setError(verifyRes.message)
      
      if (verifyRes.locked) {
        showToast({ message: verifyRes.message, position: 'bottom' })
      }
      return
    }

    // 2. 密码验证通过，执行支付
    const payRes = await request('/payments/simulate-pay', {
      method: 'POST',
      data: {
        order_id: currentPayOrder.value.id,
        amount: currentPayOrder.value.total_amount,
        payment_method: 'alipay'
      }
    })

    if (payRes.success) {
      // 支付成功
      closePayPassword()
      showDialog({
        title: '支付成功',
        message: `订单金额 ¥${currentPayOrder.value.total_amount} 已支付成功！`,
        confirmButtonText: '查看订单',
        showCancelButton: true,
        cancelButtonText: '返回'
      }).then(() => {
        // 刷新订单状态
        loadOrderDetail()
      }).catch(() => {
        router.back()
      })
    } else {
      payPasswordRef.value?.setError(payRes.message || '支付失败')
    }
  } catch (error) {
    console.error('支付失败:', error)
    showToast({ message: '支付失败，请稍后重试', position: 'bottom' })
  }
}

// 获取订单状态类型
const getStatusType = (status) => {
  const types = {
    1: 'warning',    // pending
    2: 'primary',    // paid
    3: 'success',    // shipped
    4: 'success',    // delivered
    5: 'success',    // completed
    6: 'danger',     // cancelled
    7: 'danger',     // refunded
    8: 'danger'      // closed
  }
  return types[status] || 'default'
}

// 获取订单状态文本
const getStatusText = (status) => {
  const texts = {
    1: '待支付',
    2: '已支付',
    3: '已发货',
    4: '待收货',
    5: '已完成',
    6: '已取消',
    7: '退款中',
    8: '退货中',
    9: '待退款',
    10: '已退款',
    11: '售后被拒'
  }
  return texts[status] || status
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

onMounted(() => {
  loadOrderDetail()
})
</script>

<style scoped>
.order-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}

.order-header {
  background: white;
  padding: 16px;
  margin-bottom: 12px;
}

.order-status {
  text-align: center;
  margin-bottom: 12px;
}

.merge-tip {
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 4px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #faad14;
  font-size: 13px;
}

.sub-orders {
  margin-bottom: 12px;
}

.sub-order-card {
  background: white;
  margin-bottom: 12px;
  padding: 16px;
}

.shop-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 12px;
  cursor: pointer;
}

.shop-name {
  flex: 1;
  font-size: 15px;
  font-weight: bold;
}

.order-items {
  margin-bottom: 12px;
}

.order-item {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.order-item img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-name {
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-spec {
  font-size: 12px;
  color: #999;
}

.item-price {
  color: #ff6b6b;
  font-size: 14px;
}

.sub-order-total {
  text-align: right;
  padding: 8px 0;
  border-top: 1px solid #f0f0f0;
  color: #ff6b6b;
  font-size: 15px;
  font-weight: bold;
}

.sub-order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
}

.order-actions {
  padding: 16px;
  background: white;
  margin-bottom: 12px;
}

.order-total-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 12px 16px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
}

.total-amount {
  color: #ff6b6b;
  font-size: 20px;
  font-weight: bold;
}

.order-info-section {
  margin-top: 12px;
}

.tracking-number-text {
  color: #1989fa;
}
</style>

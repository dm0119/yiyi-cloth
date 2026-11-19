<template>
  <view class="order-detail-page">
    <!-- 订单头部 -->
    <view class="order-header">
      <view class="order-status">
        <van-tag :type="getStatusType(order.status)" size="large">
          {{ getStatusText(order.status) }}
        </van-tag>
      </view>

      <!-- 如果是合并支付单，显示提示信息 -->
      <view v-if="order.is_merge_payment" class="merge-tip">
        <van-icon name="info-o" />
        <text>这是合并支付单，包含多个店铺的商品</text>
      </view>
    </view>

    <!-- 子订单列表（如果是合并支付） -->
    <view v-if="order.sub_orders" class="sub-orders">
      <view v-for="subOrder in order.sub_orders" :key="subOrder.id" class="sub-order-card">
        <!-- 店铺信息 -->
        <view class="shop-info" @click="goToShop(subOrder.shop_id)">
          <shop-avatar :shop="subOrder.shop" size="small" />
          <view class="shop-name">{{ subOrder.shop_name }}</view>
          <van-icon name="arrow" />
        </view>

        <!-- 商品列表 -->
        <view class="order-items">
          <view v-for="item in subOrder.items" :key="item.id" class="order-item">
            <image :src="item.image || '/static/placeholder.png'" mode="aspectFill" />
            <view class="item-info">
              <view class="item-name">{{ item.name }}</view>
              <view class="item-spec">
                {{ item.color || '' }} {{ item.size || '' }}
              </view>
              <view class="item-price">
                ¥{{ item.price }} x {{ item.quantity }}
              </view>
            </view>
          </view>
        </view>

        <!-- 子订单金额 -->
        <view class="sub-order-total">
          小计：¥{{ subOrder.total_amount }}
        </view>

        <!-- 子订单操作按钮 -->
        <view class="sub-order-actions">
          <van-button v-if="subOrder.status === 1" size="small" type="primary">
            去支付
          </van-button>
          <van-button v-if="subOrder.status === 2 || subOrder.status === 3" size="small" plain>
            查看物流
          </van-button>
          <van-button v-if="subOrder.status === 3" size="small" type="primary">
            确认收货
          </van-button>
        </view>
      </view>
    </view>

    <!-- 普通订单（非合并支付） -->
    <view v-else>
      <!-- 店铺信息 -->
      <view class="shop-info" v-if="order.shop" @click="goToShop(order.shop.id)">
        <shop-avatar :shop="order.shop" size="small" />
        <view class="shop-name">{{ order.shop.name }}</view>
        <van-icon name="arrow" />
      </view>

      <!-- 商品列表 -->
      <view class="order-items">
        <view v-for="item in order.items" :key="item.id" class="order-item">
          <image :src="item.image || '/static/placeholder.png'" mode="aspectFill" />
          <view class="item-info">
            <view class="item-name">{{ item.name }}</view>
            <view class="item-spec">
              {{ item.color || '' }} {{ item.size || '' }}
            </view>
            <view class="item-price">
              ¥{{ item.price }} x {{ item.quantity }}
            </view>
          </view>
        </view>
      </view>

      <!-- 订单操作 -->
      <view class="order-actions">
        <van-button v-if="order.status === 1" block type="primary">
          立即支付
        </van-button>
        <van-button v-if="order.status === 3" block type="primary">
          确认收货
        </van-button>
      </view>
    </view>

    <!-- 总金额 -->
    <view class="order-total-bar">
      <text>合计：</text>
      <text class="total-amount">¥{{ order.total_amount }}</text>
    </view>

    <!-- 订单信息 -->
    <view class="order-info-section">
      <van-cell-group inset>
        <van-cell title="订单号" :value="order.order_no" />
        <van-cell title="下单时间" :value="formatDate(order.created_at)" />
        <van-cell title="收货地址" :value="order.address" />
        <van-cell title="联系电话" :value="order.phone" />
        <van-cell title="客户姓名" :value="order.customer_name" />
      </van-cell-group>
    </view>
  </view>
</template>

<script>
import ShopAvatar from '@/components/ShopAvatar.vue'
import { request, orderApi } from '@/services/api'

export default {
  name: 'OrderDetailMerge',
  components: {
    ShopAvatar
  },
  data() {
    return {
      order: {},
      loading: true
    }
  },
  computed: {
    orderId() {
      return this.$route?.params?.id || this.$scope?.options?.id
    }
  },
  onLoad(options) {
    if (options.id) {
      this.orderId = options.id
    }
  },
  mounted() {
    this.loadOrderDetail()
  },
  methods: {
    async loadOrderDetail() {
      try {
        const res = await orderApi.getById(this.orderId)
        if (res.success) {
          this.order = res.data
        }
      } catch (error) {
        console.error('加载订单详情失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    goToShop(shopId) {
      if (shopId) {
        uni.navigateTo({
          url: `/pages/shop/detail?shopId=${shopId}`
        })
      }
    },

    getStatusType(status) {
      const types = {
        1: 'warning',
        2: 'primary',
        3: 'success',
        4: 'success',
        5: 'danger',
        6: 'warning',
        7: 'warning',
        8: 'success'
      }
      return types[status] || 'default'
    },

    getStatusText(status) {
      const texts = {
        1: '待支付',
        2: '待发货',
        3: '已发货',
        4: '待收货',
        5: '已完成',
        6: '已取消',
        7: '退款中',
        8: '已退款'
      }
      return texts[status] || '未知'
    },

    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleString('zh-CN')
    }
  }
}
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

.order-item image {
  width: 80px;
  height: 80px;
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
</style>

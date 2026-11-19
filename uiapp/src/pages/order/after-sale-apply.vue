<template>
  <view class="container">
    <!-- 订单信息概览 -->
    <view class="order-summary" v-if="orderInfo">
      <view class="order-no">订单号: {{ orderInfo.order_no }}</view>
      <view class="order-amount">¥{{ Number(orderInfo.total_amount).toFixed(2) }}</view>
    </view>

    <!-- 售后类型选择 -->
    <view class="section">
      <view class="section-title">售后类型</view>
      <view class="type-list">
        <view
          v-for="item in availableTypes"
          :key="item.value"
          class="type-item"
          :class="{ active: form.type === item.value }"
          @click="selectType(item.value)"
        >
          <view class="type-name">{{ item.label }}</view>
          <view class="type-desc">{{ item.desc }}</view>
          <view v-if="form.type === item.value" class="type-check">&#10003;</view>
        </view>
      </view>
    </view>

    <!-- 换货规格选择 -->
    <view class="section" v-if="form.type === 'exchange'">
      <view class="section-title">换货规格</view>
      
      <!-- 加载中提示 -->
      <view v-if="loadingSkus" class="loading-wrapper">
        <text class="loading-text">加载规格中...</text>
      </view>
      
      <!-- SKU选择列表 -->
      <view v-else-if="availableSkus.length > 0" class="sku-list">
        <view class="sku-tip">请选择要更换的规格（库存充足的选项）</view>
        <view
          v-for="sku in availableSkus"
          :key="sku.id"
          class="sku-item"
          :class="{ active: selectedSkuId === sku.id, disabled: sku.stock <= 0 }"
          @click="selectSku(sku)"
        >
          <view class="sku-info">
            <text class="sku-color">{{ sku.color }}</text>
            <text class="sku-divider">/</text>
            <text class="sku-size">{{ sku.size }}</text>
          </view>
          <view class="sku-stock">
            <text :class="{ 'low-stock': sku.stock <= 10 && sku.stock > 0, 'no-stock': sku.stock <= 0 }">
              库存: {{ sku.stock }}
            </text>
          </view>
          <view v-if="selectedSkuId === sku.id" class="sku-check">&#10003;</view>
        </view>
      </view>
      
      <!-- 无可用规格提示 -->
      <view v-else class="no-sku-tip">
        <text>该商品暂无可选规格</text>
      </view>
    </view>

    <!-- 售后原因 -->
    <view class="section" v-if="form.type !== 'exchange'">
      <view class="section-title">售后原因</view>
      <view class="reason-list">
        <view
          v-for="reason in reasonList"
          :key="reason"
          class="reason-item"
          :class="{ active: form.reason === reason }"
          @click="form.reason = reason"
        >
          <text>{{ reason }}</text>
          <view v-if="form.reason === reason" class="reason-check">&#10003;</view>
        </view>
      </view>
    </view>

    <!-- 补充说明和凭证图片（可折叠） -->
    <view class="section">
      <view class="section-title collapsible" @click="showOptional = !showOptional">
        <text>补充说明和凭证图片（选填）</text>
        <text class="arrow" :class="{ open: showOptional }">▼</text>
      </view>
      <view v-show="showOptional" class="optional-content">
        <textarea
          class="desc-textarea"
          v-model="form.description"
          placeholder="请描述具体问题..."
          maxlength="500"
        />
        <view class="image-list">
          <view v-for="(img, index) in form.images" :key="index" class="image-item">
            <image :src="img" mode="aspectFill" class="preview-img" @click="previewImage(index)" />
            <view class="image-delete" @click="removeImage(index)">×</view>
          </view>
          <view v-if="form.images.length < 3" class="image-add" @click="chooseImage">
            <text class="add-icon">+</text>
            <text class="add-text">添加图片</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-area">
      <Button type="primary" block :loading="submitting" @click="handleSubmit">
        提交申请
      </Button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { Button } from 'vant'
import { afterSaleApi, orderApi, productApi } from '@/services/api.js'

const orderId = ref(null)
const orderInfo = ref(null)
const submitting = ref(false)
const loadingSkus = ref(false)
const availableSkus = ref([])
const selectedSkuId = ref(null)
const form = ref({
  type: '',
  reason: '',
  description: '',
  images: [],
  new_color: '',
  new_size: ''
})
const showOptional = ref(false)

const reasonList = [
  '不想要了',
  '商品与描述不符',
  '质量问题',
  '收到商品损坏',
  '发错货/漏发',
  '其他原因'
]

// 根据订单状态判断可用的售后类型
const availableTypes = computed(() => {
  if (!orderInfo.value) return []
  const status = orderInfo.value.status

  const types = []
  // 待发货(2)可以急速退款
  if (status === 2) {
    types.push({ value: 'refund', label: '急速退款', desc: '订单未发货，可立即退款' })
  }
  // 已发货(3)/待收货(4)/已完成(5)可以退货退款和换货
  if ([3, 4, 5].includes(status)) {
    types.push({ value: 'return_refund', label: '退货退款', desc: '退回商品并退款' })
    types.push({ value: 'exchange', label: '换货', desc: '更换商品规格' })
  }
  return types
})

onLoad((options) => {
  orderId.value = options.id
  if (orderId.value) {
    loadOrderInfo()
  }
})

async function loadOrderInfo() {
  try {
    const res = await orderApi.getById(orderId.value)
    if (res.success && res.data) {
      orderInfo.value = res.data
      // 自动选择第一个可用类型
      if (availableTypes.value.length > 0 && !form.value.type) {
        form.value.type = availableTypes.value[0].value
      }
    }
  } catch (error) {
    console.error('加载订单信息失败:', error)
  }
}

// 加载商品SKU列表
async function loadProductSkus() {
  if (!orderInfo.value || !orderInfo.value.items || orderInfo.value.items.length === 0) {
    return
  }
  
  loadingSkus.value = true
  try {
    // 获取第一个商品的product_id
    const productId = orderInfo.value.items[0].product_id
    if (!productId) {
      console.warn('订单商品没有product_id')
      loadingSkus.value = false
      return
    }
    
    const res = await productApi.getSkus(productId)
    if (res.success && res.data) {
      // 过滤掉当前订单已购买的规格，并只显示有库存的
      const currentItem = orderInfo.value.items[0]
      availableSkus.value = res.data.filter(sku => {
        // 排除当前规格
        if (sku.color === currentItem.color && sku.size === currentItem.size) {
          return false
        }
        // 只显示启用的SKU
        return sku.status === 1
      })
    }
  } catch (error) {
    console.error('加载商品SKU失败:', error)
    uni.showToast({ title: '加载规格失败', icon: 'none' })
  } finally {
    loadingSkus.value = false
  }
}

// 选择SKU
function selectSku(sku) {
  if (sku.stock <= 0) {
    uni.showToast({ title: '该规格库存不足', icon: 'none' })
    return
  }
  
  selectedSkuId.value = sku.id
  form.value.new_color = sku.color
  form.value.new_size = sku.size
}

function selectType(type) {
  form.value.type = type
  if (type !== 'exchange') {
    form.value.new_color = ''
    form.value.new_size = ''
    selectedSkuId.value = null
  } else {
    // 切换到换货时，加载商品SKU
    if (orderInfo.value) {
      loadProductSkus()
    }
  }
}

function chooseImage() {
  uni.chooseImage({
    count: 3 - form.value.images.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      form.value.images = [...form.value.images, ...res.tempFilePaths]
    }
  })
}

function removeImage(index) {
  form.value.images.splice(index, 1)
}

function previewImage(index) {
  uni.previewImage({
    urls: form.value.images,
    current: index
  })
}

async function handleSubmit() {
  if (!form.value.type) {
    uni.showToast({ title: '请选择售后类型', icon: 'none' })
    return
  }
  if (form.value.type !== 'exchange' && !form.value.reason) {
    uni.showToast({ title: '请选择售后原因', icon: 'none' })
    return
  }
  if (form.value.type === 'exchange') {
    if (!selectedSkuId.value) {
      uni.showToast({ title: '请选择要更换的规格', icon: 'none' })
      return
    }
    if (!form.value.new_color && !form.value.new_size) {
      uni.showToast({ title: '换货请选择新的颜色或尺码', icon: 'none' })
      return
    }
  }

  submitting.value = true
  try {
    const res = await afterSaleApi.apply(orderId.value, {
      type: form.value.type,
      reason: form.value.reason,
      description: form.value.description,
      images: form.value.images,
      new_color: form.value.new_color,
      new_size: form.value.new_size
    })

    if (res.success) {
      uni.showToast({ title: res.message || '申请成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({ title: res.message || '申请失败', icon: 'none' })
    }
  } catch (error) {
    console.error('提交售后申请失败:', error)
    uni.showToast({ title: error.message || '提交失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.container {
  padding: 16rpx;
  background: #f8f9fa;
  min-height: 100vh;
}

.order-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 24rpx;
  background: #fff;
  border-radius: 8rpx;
  margin-bottom: 12rpx;
}

.order-no {
  font-size: 26rpx;
  color: #333;
}

.order-amount {
  font-size: 32rpx;
  color: #ff6b6b;
  font-weight: 600;
}

.section {
  background: #fff;
  border-radius: 8rpx;
  margin-bottom: 12rpx;
  overflow: hidden;
}

.section-title {
  padding: 16rpx 24rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  border-bottom: 2rpx solid #f0f0f0;
}

.section-title.collapsible {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.section-title .arrow {
  font-size: 20rpx;
  color: #999;
  transition: transform 0.3s ease;
}

.section-title .arrow.open {
  transform: rotate(180deg);
}

.optional-content {
  padding: 16rpx 24rpx;
}

.type-list {
  padding: 12rpx 24rpx;
}

.type-item {
  display: flex;
  align-items: center;
  padding: 16rpx 16rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 8rpx;
  margin-bottom: 10rpx;
  position: relative;
}

.type-item.active {
  border-color: #ff6b6b;
  background: #fff5f5;
}

.type-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-right: 12rpx;
}

.type-desc {
  font-size: 22rpx;
  color: #999;
}

.type-check {
  position: absolute;
  right: 16rpx;
  color: #ff6b6b;
  font-size: 28rpx;
  font-weight: bold;
}

.spec-row {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.spec-label {
  font-size: 26rpx;
  color: #666;
  width: 140rpx;
}

.spec-input {
  flex: 1;
  font-size: 26rpx;
  padding: 10rpx 12rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 8rpx;
}

.loading-wrapper {
  padding: 24rpx 24rpx;
  text-align: center;
}

.loading-text {
  font-size: 26rpx;
  color: #999;
}

.sku-list {
  padding: 12rpx 24rpx;
}

.sku-tip {
  font-size: 22rpx;
  color: #999;
  margin-bottom: 10rpx;
  padding: 0 0 8rpx 0;
}

.sku-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 16rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 8rpx;
  margin-bottom: 10rpx;
  position: relative;
  transition: all 0.3s ease;
}

.sku-item.active {
  border-color: #ff6b6b;
  background: #fff5f5;
}

.sku-item.disabled {
  opacity: 0.5;
  background: #f5f5f5;
}

.sku-info {
  flex: 1;
  display: flex;
  align-items: center;
}

.sku-color {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-right: 8rpx;
}

.sku-divider {
  font-size: 28rpx;
  color: #999;
  margin: 0 8rpx;
}

.sku-size {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.sku-stock {
  margin-right: 32rpx;
}

.sku-stock text {
  font-size: 22rpx;
  color: #52c41a;
}

.sku-stock .low-stock {
  color: #faad14;
}

.sku-stock .no-stock {
  color: #ff4d4f;
}

.sku-check {
  position: absolute;
  right: 16rpx;
  color: #ff6b6b;
  font-size: 28rpx;
  font-weight: bold;
}

.no-sku-tip {
  padding: 24rpx 24rpx;
  text-align: center;
  color: #999;
  font-size: 26rpx;
}

.reason-list {
  padding: 12rpx 24rpx;
}

.reason-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 2rpx solid #f0f0f0;
}

.reason-item:last-child {
  border-bottom: none;
}

.reason-item.active {
  color: #ff6b6b;
}

.reason-check {
  color: #ff6b6b;
  font-size: 28rpx;
  font-weight: bold;
}

.desc-textarea {
  width: 100%;
  padding: 0;
  font-size: 26rpx;
  min-height: 120rpx;
  box-sizing: border-box;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  padding-top: 16rpx;
  gap: 12rpx;
}

.image-item {
  width: 160rpx;
  height: 160rpx;
  position: relative;
}

.preview-img {
  width: 100%;
  height: 100%;
  border-radius: 8rpx;
}

.image-delete {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 36rpx;
  height: 36rpx;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
}

.image-add {
  width: 160rpx;
  height: 160rpx;
  border: 2rpx dashed #ccc;
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.add-icon {
  font-size: 50rpx;
  color: #ccc;
}

.add-text {
  font-size: 20rpx;
  color: #999;
  margin-top: 6rpx;
}

.submit-area {
  padding: 24rpx 0;
}
</style>

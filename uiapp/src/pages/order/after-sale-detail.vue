<template>
  <view class="container">
    <view v-if="loading" class="loading-state">
      <text>加载中...</text>
    </view>

    <view v-else-if="afterSale" class="after-sale-detail">
      <!-- 状态卡片 -->
      <view class="status-card" :class="'status-' + afterSale.status">
        <view class="status-text">{{ getStatusText(afterSale.status) }}</view>
        <view class="status-desc">{{ getStatusDesc(afterSale) }}</view>
      </view>

      <!-- 售后信息 -->
      <view class="section">
        <view class="section-title">售后信息</view>
        <view class="info-item">
          <text class="label">售后类型</text>
          <text class="value">{{ getTypeText(afterSale.type) }}</text>
        </view>
        <view class="info-item">
          <text class="label">退款金额</text>
          <text class="value price" v-if="afterSale.type === 'exchange'">¥{{ calculateRefundAmount() }}</text>
          <text class="value price" v-else-if="afterSale.refund_amount > 0">¥{{ Number(afterSale.refund_amount).toFixed(2) }}</text>
          <text class="value price" v-else>¥{{ calculateRefundAmount() }}</text>
        </view>
        <view class="info-item">
          <text class="label">申请原因</text>
          <text class="value">{{ afterSale.reason }}</text>
        </view>
        <view class="info-item" v-if="afterSale.description">
          <text class="label">补充说明</text>
          <text class="value">{{ afterSale.description }}</text>
        </view>
        <view class="info-item" v-if="afterSale.reject_reason">
          <text class="label">拒绝原因</text>
          <text class="value reject">{{ afterSale.reject_reason }}</text>
        </view>
        <view class="info-item">
          <text class="label">申请时间</text>
          <text class="value">{{ afterSale.created_at }}</text>
        </view>
      </view>

      <!-- 换货规格 -->
      <view class="section" v-if="afterSale.type === 'exchange' && (afterSale.new_color || afterSale.new_size)">
        <view class="section-title">换货规格</view>
        <view class="info-item" v-if="afterSale.new_color">
          <text class="label">新颜色</text>
          <text class="value">{{ afterSale.new_color }}</text>
        </view>
        <view class="info-item" v-if="afterSale.new_size">
          <text class="label">新尺码</text>
          <text class="value">{{ afterSale.new_size }}</text>
        </view>
      </view>

      <!-- 凭证图片 -->
      <view class="section" v-if="afterSale.images && afterSale.images.length > 0">
        <view class="section-title">凭证图片</view>
        <view class="image-list">
          <image
            v-for="(img, index) in afterSale.images"
            :key="index"
            :src="img"
            mode="aspectFill"
            class="evidence-img"
            @click="previewImage(index)"
          />
        </view>
      </view>

      <!-- 退货物流 -->
      <view class="section" v-if="afterSale.return_logistics_company">
        <view class="section-title">退货物流</view>
        <view class="info-item">
          <text class="label">物流公司</text>
          <text class="value">{{ afterSale.return_logistics_company }}</text>
        </view>
        <view class="info-item">
          <text class="label">快递单号</text>
          <text class="value">{{ afterSale.return_tracking_number }}</text>
        </view>
      </view>

      <!-- 填写退货物流表单 -->
      <view class="section logistics-form-section" v-if="afterSale.status === 2">
        <view class="section-title">填写退货物流</view>
        <view class="form-body">
          <view class="form-item-inline">
            <text class="form-label-inline">物流公司</text>
            <picker mode="selector" :range="logisticsCompanies" range-key="name" @change="onLogisticsChange">
              <view class="form-picker" :class="{ 'placeholder': !logisticsForm.logistics_company }">
                {{ logisticsForm.logistics_company || '请选择物流公司' }}
              </view>
            </picker>
          </view>
          <view class="form-item-inline">
            <text class="form-label-inline">快递单号</text>
            <view class="tracking-container">
              <view class="tracking-box">
                <text class="tracking-text">{{ trackingNumber || '点击下方按钮生成' }}</text>
              </view>
              <view class="tracking-actions">
                <view class="action-btn gen" @click="generateTrackingNumber">随机生成</view>
              </view>
            </view>
          </view>
          <view class="submit-row">
            <Button type="primary" size="small" :loading="submitting" @click="submitLogistics">提交物流信息</Button>
          </view>
        </view>
      </view>

      <!-- 商家退货地址 -->
      <view class="section" v-if="afterSale.return_address && (afterSale.status === 2 || afterSale.status === 3)">
        <view class="section-title">退货地址</view>
        <view class="address-info">
          <text class="address-text">{{ afterSale.return_address }}</text>
        </view>
      </view>

      <!-- 订单商品 -->
      <view class="section" v-if="afterSale.items && afterSale.items.length > 0">
        <view class="section-title">商品信息</view>
        <view v-for="(item, index) in afterSale.items" :key="index" class="item-card">
          <view class="item-info">
            <text class="item-name">{{ item.product_name }}</text>
            <text class="item-spec">{{ item.color || '' }} {{ item.size || '' }}</text>
          </view>
          <view class="item-price">
            <text>¥{{ Number(item.price).toFixed(2) }} × {{ item.quantity }}</text>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-area">
        <!-- 售后申请中，可以取消 -->
        <template v-if="afterSale.status === 1">
          <Button type="default" block @click="handleCancel">
            取消申请
          </Button>
        </template>
      </view>
    </view>

    <view v-else class="empty-state">
      <text>售后记录不存在</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { Button } from 'vant'
import { afterSaleApi } from '@/services/api.js'

const afterSaleId = ref(null)
const afterSale = ref(null)
const loading = ref(true)
const submitting = ref(false)
const trackingNumber = ref('')
const logisticsForm = ref({
  logistics_company: '',
  logistics_code: '',
  tracking_number: ''
})

// 物流公司列表
const logisticsCompanies = ref([
  { name: '顺丰速运', code: 'SF' },
  { name: '中通快递', code: 'ZTO' },
  { name: '圆通速递', code: 'YTO' },
  { name: '申通快递', code: 'STO' },
  { name: '韵达速递', code: 'YD' },
  { name: 'EMS', code: 'EMS' },
  { name: '京东物流', code: 'JD' },
  { name: '德邦快递', code: 'DB' },
  { name: '极兔速递', code: 'JT' },
  { name: '邮政快递', code: 'YZ' }
])

onLoad((options) => {
  afterSaleId.value = options.id
  if (afterSaleId.value) {
    loadDetail()
  }
})

async function loadDetail() {
  loading.value = true
  try {
    const res = await afterSaleApi.getById(afterSaleId.value)
    if (res.success && res.data) {
      afterSale.value = res.data
    }
  } catch (error) {
    console.error('加载售后详情失败:', error)
  } finally {
    loading.value = false
  }
}

function getStatusText(status) {
  const map = {
    1: '待处理',
    2: '已同意-待填写退货物流',
    3: '退货中',
    4: '待退款',
    5: '已完成',
    6: '已拒绝'
  }
  return map[status] || '未知'
}

function getStatusDesc(record) {
  if (record.status === 1) return '商家正在审核您的申请，请耐心等待'
  if (record.status === 2) return '商家已同意，请尽快填写退货物流信息'
  if (record.status === 3) return '商家正在等待收到退货商品'
  if (record.status === 4) return '商家已确认收到退货，等待退款'
  if (record.status === 5) {
    if (record.type === 'exchange') return '换货已完成'
    return '退款已完成'
  }
  if (record.status === 6) return record.reject_reason || '商家已拒绝您的申请'
  return ''
}

function getTypeText(type) {
  const map = {
    refund: '急速退款',
    return_refund: '退货退款',
    exchange: '换货'
  }
  return map[type] || '未知'
}

function previewImage(index) {
  uni.previewImage({
    urls: afterSale.value.images,
    current: index
  })
}

async function handleCancel() {
  uni.showModal({
    title: '确认取消',
    content: '确定要取消售后申请吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await afterSaleApi.cancel(afterSale.value.order_id)
          if (result.success) {
            uni.showToast({ title: '已取消', icon: 'success' })
            setTimeout(() => loadDetail(), 1500)
          } else {
            uni.showToast({ title: result.message || '取消失败', icon: 'none' })
          }
        } catch (error) {
          uni.showToast({ title: '取消失败', icon: 'none' })
        }
      }
    }
  })
}

// 计算退款金额
function calculateRefundAmount() {
  if (!afterSale.value) return '0.00'
  // 如果是换货，显示商品总金额
  if (afterSale.value.type === 'exchange') {
    let total = 0
    if (afterSale.value.items && afterSale.value.items.length > 0) {
      total = afterSale.value.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)
    }
    return total.toFixed(2)
  }
  // 退货退款使用记录的退款金额
  return Number(afterSale.value.refund_amount || 0).toFixed(2)
}

// 选择物流公司
function onLogisticsChange(e) {
  const index = e.detail.value
  logisticsForm.value.logistics_company = logisticsCompanies.value[index].name
  logisticsForm.value.logistics_code = logisticsCompanies.value[index].code
}

// 随机生成快递单号
function generateTrackingNumber() {
  // 根据已选物流公司获取前缀
  const selectedCompany = logisticsCompanies.value.find(c => c.name === logisticsForm.value.logistics_company)
  const prefix = selectedCompany ? selectedCompany.code : 'SF'
  const timestamp = Date.now().toString().slice(-10)
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  const trackingNo = prefix + timestamp + random
  
  trackingNumber.value = trackingNo
  logisticsForm.value.tracking_number = trackingNo
}

async function submitLogistics() {
  if (!logisticsForm.value.logistics_company) {
    uni.showToast({ title: '请选择物流公司', icon: 'none' })
    return
  }
  if (!logisticsForm.value.tracking_number) {
    uni.showToast({ title: '请输入快递单号', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    const res = await afterSaleApi.fillReturnLogistics(afterSale.value.order_id, logisticsForm.value)
    if (res.success) {
      uni.showToast({ title: '提交成功', icon: 'success' })
      // 清空表单
      logisticsForm.value.logistics_company = ''
      logisticsForm.value.tracking_number = ''
      logisticsForm.value.logistics_code = ''
      trackingNumber.value = ''
      setTimeout(() => loadDetail(), 1500)
    } else {
      uni.showToast({ title: res.message || '提交失败', icon: 'none' })
    }
  } catch (error) {
    uni.showToast({ title: '提交失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.container {
  padding: 24rpx;
  background: #f8f9fa;
  min-height: 100vh;
}

.loading-state, .empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  color: #999;
  font-size: 28rpx;
}

.status-card {
  padding: 40rpx 32rpx;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  color: #fff;
}

.status-card.status-1 { background: linear-gradient(135deg, #faad14, #f5a623); }
.status-card.status-2 { background: linear-gradient(135deg, #f5f5f5, #e8e8e8); color: #333; }
.status-card.status-3 { background: linear-gradient(135deg, #f5f5f5, #e8e8e8); color: #333; }
.status-card.status-4 { background: linear-gradient(135deg, #722ed1, #531dab); }
.status-card.status-5 { background: linear-gradient(135deg, #52c41a, #389e0d); }
.status-card.status-6 { background: linear-gradient(135deg, #ff4d4f, #cf1322); }

.status-text {
  font-size: 36rpx;
  font-weight: 600;
  margin-bottom: 12rpx;
}

.status-desc {
  font-size: 26rpx;
  opacity: 0.9;
}

.section {
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.section-title {
  padding: 24rpx 32rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  border-bottom: 2rpx solid #f0f0f0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20rpx 32rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-size: 28rpx;
  color: #999;
  flex-shrink: 0;
}

.value {
  font-size: 28rpx;
  color: #333;
  text-align: right;
  flex: 1;
  margin-left: 24rpx;
}

.value.price {
  color: #ff6b6b;
  font-weight: 600;
}

.value.reject {
  color: #ff4d4f;
}

.address-info {
  padding: 24rpx 32rpx;
}

.address-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  word-break: break-all;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  padding: 24rpx 32rpx;
  gap: 16rpx;
}

.evidence-img {
  width: 180rpx;
  height: 180rpx;
  border-radius: 8rpx;
}

.item-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 32rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.item-card:last-child {
  border-bottom: none;
}

.item-name {
  font-size: 28rpx;
  color: #333;
}

.item-spec {
  font-size: 24rpx;
  color: #999;
}

.item-price {
  font-size: 26rpx;
  color: #666;
}

.action-area {
  padding: 40rpx 0;
}

/* 物流表单样式 */
.logistics-form-section .form-body {
  padding: 24rpx 32rpx;
}

.form-item-inline {
  margin-bottom: 20rpx;
}

.form-label-inline {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

.form-picker {
  width: 100%;
  padding: 18rpx 20rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333;
  background: #fafafa;
  box-sizing: border-box;
}

.form-picker.placeholder {
  color: #999;
}

/* 快递单号容器 */
.tracking-container {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.tracking-box {
  width: 100%;
  min-height: 120rpx;
  padding: 32rpx 36rpx;
  border: 3rpx solid #e8e8e8;
  border-radius: 16rpx;
  background: #fff;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tracking-text {
  font-size: 36rpx;
  font-weight: 700;
  color: #333;
  letter-spacing: 3rpx;
  word-break: break-all;
  text-align: center;
}

.tracking-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  flex: 1;
  padding: 20rpx 0;
  border-radius: 8rpx;
  font-size: 26rpx;
  text-align: center;
}

.action-btn.gen {
  border: 2rpx solid #e8e8e8;
  color: #666;
  background: #fff;
}

.submit-row {
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 2rpx solid #f0f0f0;
}

.submit-row .van-button {
  width: 100%;
  background: #fff !important;
  border: 2rpx solid #e8e8e8 !important;
  color: #666 !important;
}
</style>

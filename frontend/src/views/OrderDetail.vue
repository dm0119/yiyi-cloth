<template>
  <div class="order-detail-view">
    <div class="header">
      <el-page-header :content="'订单详情'" @back="goBack" />
    </div>

    <div v-if="loading" class="loading">
      <el-skeleton :rows="6" animated />
    </div>

    <div v-else-if="order" class="order-detail-content">
      <div v-if="orderError" class="order-error-message">
        <el-alert :title="orderError" type="error" show-icon />
      </div>
      <!-- 订单基本信息、商品清单和金额汇总 -->
      <el-card class="order-main-info" shadow="never">
        <!-- 订单信息 -->
        <div class="order-section">
          <h3 class="section-title">订单信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="订单号">
              {{ order.order_no }}
            </el-descriptions-item>
            <el-descriptions-item label="订单状态">
              <el-tag :type="getStatusTagType(order.status)">
                {{ getStatusText(order.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="下单时间">
              {{ formatDate(order.created_at) }}
            </el-descriptions-item>
            <el-descriptions-item label="更新时间">
              {{ formatDate(order.updated_at) }}
            </el-descriptions-item>
            <el-descriptions-item label="客户姓名">
              {{ order.customer_name }}
            </el-descriptions-item>
            <el-descriptions-item label="联系电话">
              {{ order.phone }}
            </el-descriptions-item>
            <el-descriptions-item label="收货地址" :span="2">
              {{ order.address }}
            </el-descriptions-item>
            <el-descriptions-item label="物流公司" v-if="order.logistics_company">
              {{ order.logistics_company }}
            </el-descriptions-item>
            <el-descriptions-item label="物流单号" v-if="order.tracking_number">
              {{ order.tracking_number }}
            </el-descriptions-item>
          </el-descriptions>
          

        </div>

        <!-- 商品清单 -->
        <div class="order-section">
          <h3 class="section-title">商品清单</h3>
          <el-table :data="order.items" style="width: 100%" border>
            <el-table-column label="商品图片" min-width="100" align="center">
              <template #default="{ row }">
                <el-image
                  :src="getProductImage(row)"
                  fit="cover"
                  style="width: 80px; height: 80px;"
                />
              </template>
            </el-table-column>
            <el-table-column prop="product_name" label="商品名称" min-width="200" />
            <el-table-column label="规格" min-width="120">
              <template #default="{ row }">
                <span v-if="row.size || row.color">
                  {{ row.size ? `尺寸:${row.size}` : '' }} {{ row.color ? `颜色:${row.color}` : '' }}
                </span>
                <span v-else>无规格</span>
              </template>
            </el-table-column>
            <el-table-column prop="price" label="单价" min-width="100" align="center">
              <template #default="{ row }">
                ¥{{ Number(row.price).toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" min-width="80" align="center" />
            <el-table-column label="小计" min-width="100" align="center">
              <template #default="{ row }">
                ¥{{ (row.price * row.quantity).toFixed(2) }}
              </template>
            </el-table-column>
          </el-table>
          <!-- 金额汇总 -->
          <div class="amount-summary-table" style="margin-top: 20px;">
            <el-descriptions :column="2" border v-if="order.coupon_info && Number(order.coupon_info.discount_amount) > 0">
              <el-descriptions-item label="商品总额">
                ¥{{ Number(order.original_amount || order.total_amount).toFixed(2) }}
              </el-descriptions-item>
              <el-descriptions-item label="优惠券名称">
                {{ order.coupon_info.name }}
              </el-descriptions-item>
              <el-descriptions-item label="优惠券类型">
                {{ order.coupon_info.type === 'fixed' ? '固定金额' : '百分比' }}
              </el-descriptions-item>
              <el-descriptions-item label="优惠金额">
                -¥{{ Number(order.coupon_info.discount_amount).toFixed(2) }}
              </el-descriptions-item>
              <el-descriptions-item label="使用范围">
                {{ order.coupon_info.min_amount ? `满${order.coupon_info.min_amount}元可用` : '无门槛' }}
              </el-descriptions-item>
              <el-descriptions-item label="订单总计">
                <span style="color: #f56c6c; font-weight: bold;">¥{{ Number(order.total_amount).toFixed(2) }}</span>
              </el-descriptions-item>
            </el-descriptions>
            <el-descriptions :column="4" border v-else>
              <el-descriptions-item label="商品总额">
                ¥{{ Number(order.original_amount || order.total_amount).toFixed(2) }}
              </el-descriptions-item>
                <el-descriptions-item label="优惠信息">
                  未使用优惠券
                  <span v-if="!order.coupon_info && orderError" style="color:#f56c6c;font-weight:bold;">（优惠信息异常）</span>
                </el-descriptions-item>
              <el-descriptions-item label="订单总计" :span="2">
                <span style="color: #f56c6c; font-weight: bold;">¥{{ Number(order.total_amount).toFixed(2) }}</span>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </el-card>

      <!-- 订单状态操作 -->
      <el-card class="order-status" shadow="never">
        <template #header>
          <div class="card-header">
            <span>订单状态管理</span>
          </div>
        </template>
        
        <!-- 买家端：显示操作选择器 -->
        <div class="order-actions" v-if="isBuyer">
          <el-select
            v-model="selectedAction"
            @change="handleBuyerAction"
            placeholder="请选择操作"
            style="width: 200px;"
          >
            <!-- 待收货状态 -->
            <el-option 
              v-if="order.status === 4" 
              label="确认收货" 
              value="confirm_receipt" 
            />
            <!-- 已发货状态 -->
            <el-option 
              v-if="order.status === 3" 
              label="确认收货" 
              value="confirm_receipt" 
            />
          </el-select>
        </div>
        
        <!-- 管理端：显示操作按钮 -->
        <div class="order-actions" v-else>
          <!-- 待支付状态 -->
          <template v-if="order.status === 1">
            <el-button type="danger" @click="handleCancel" v-if="canManageOrder">取消订单</el-button>
          </template>
          
          <!-- 待发货状态 -->
          <template v-if="order.status === 2">
            <el-button type="primary" @click="handleShip" v-if="canManageOrder">发货</el-button>
            <el-button type="danger" @click="handleCancel" v-if="canManageOrder">取消订单</el-button>
          </template>
          
          <!-- 已发货状态 -->
          <template v-if="order.status === 3">
            <el-button type="primary" @click="handleSetAwaitingReceipt" v-if="canManageOrder">设为待收货</el-button>
          </template>
          
          <!-- 待收货状态 -->
          <template v-if="order.status === 4">
            <!-- 买家已显示选择器，管理端不显示确认收货 -->
          </template>
          
          <!-- 已完成状态 -->
          <template v-if="order.status === 5">
            <el-tag type="success">订单已完成</el-tag>
          </template>
          
          <!-- 已取消状态 -->
          <template v-if="order.status === 6">
            <el-tag type="info">订单已取消</el-tag>
            <div v-if="order.cancel_reason" class="cancel-reason">
              取消原因：{{ order.cancel_reason }}
            </div>
          </template>
        </div>
      </el-card>

      <!-- 物流信息填写对话框 -->
      <el-dialog
        v-model="logisticsDialogVisible"
        title="填写物流信息"
        width="500px"
        :close-on-click-modal="false"
      >
        <el-form :model="logisticsForm" label-width="100px">
          <el-form-item label="物流公司" required>
            <el-select 
              v-model="logisticsForm.company" 
              placeholder="请选择物流公司"
              style="width: 100%;"
              @change="generateTrackingNumber"
            >
              <el-option 
                v-for="company in logisticsCompanies" 
                :key="company" 
                :label="company" 
                :value="company" 
              />
            </el-select>
          </el-form-item>
          <el-form-item label="物流单号" required>
            <el-input 
              v-model="logisticsForm.trackingNumber" 
              placeholder="请输入物流单号"
              style="width: 100%;"
            >
              <template #append>
                <el-button @click="generateTrackingNumber">随机生成</el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="logisticsDialogVisible = false">取消</el-button>
            <el-button 
              type="primary" 
              @click="submitLogisticsAndUpdateStatus"
              :disabled="!logisticsForm.company || !logisticsForm.trackingNumber"
            >
              确认发货
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>

    <el-empty v-else description="订单不存在" />
  </div>
</template>

<style scoped>
.order-main-info {
  margin-bottom: 20px;
}

.order-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.order-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.section-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
}

.refund-button-section {
  margin-top: 15px;
}

.amount-summary {
  margin-top: 10px;
}

.amount-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.amount-item.total {
  font-weight: 600;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.amount-item .total-amount {
  color: #f56c6c;
  font-size: 22px;
}

.logistics-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

@media (max-width: 768px) {
  .logistics-container {
    grid-template-columns: 1fr;
  }
}

.form-help {
  font-size: 18px;
  color: #999;
  margin-top: 5px;
}

.logistics-complete-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.logistics-complete-content {
  display: flex;
  justify-content: center;
}

.order-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.order-actions .el-button {
  margin-right: 10px;
  margin-bottom: 10px;
}

/* 买家端选择器样式 */
.order-actions .el-select {
  max-width: 200px;
}

.cancel-reason {
  margin-top: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  color: #909399;
  font-size: 18px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .order-actions .el-select {
    width: 100%;
    max-width: none;
  }
}
</style>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { orderApi } from '../services/api.js'
import { ElMessage, ElMessageBox } from 'element-plus'

const orderError = ref('')

const route = useRoute()
const router = useRouter()
const order = ref(null)
const loading = ref(true)
const currentStatus = ref(1)

// 根据存储的 token 判断用户角色
const getUserRole = () => {
  if (localStorage.getItem('user_token')) {
    return 'buyer'
  } else if (localStorage.getItem('merchant_token')) {
    return 'merchant'
  } else if (localStorage.getItem('admin_token')) {
    return 'admin'
  }
  return 'unknown'
}

const userRole = ref(getUserRole())
const isBuyer = computed(() => userRole.value === 'buyer')
const isMerchant = computed(() => userRole.value === 'merchant')
const isAdmin = computed(() => userRole.value === 'admin')

// 判断是否可以操作订单（管理员/商家可以操作）
const canManageOrder = computed(() => isAdmin.value || isMerchant.value)

// 买家端选择的操作
const selectedAction = ref('')

// 物流信息对话框
const logisticsDialogVisible = ref(false)
const logisticsForm = ref({
  company: '',
  trackingNumber: ''
})
const pendingStatus = ref(null)

// 物流公司选项
const logisticsCompanies = [
  '顺丰速运',
  '圆通速递',
  '中通快递',
  '申通快递',
  '韵达速递',
  'EMS',
  '京东物流',
  '德邦快递',
  '极兔速递',
  '邮政快递'
]

// 获取路由参数
const orderId = route.params.id

async function loadOrderDetail() {
  loading.value = true
  try {
    // 获取订单基本信息
    const res = await orderApi.getDetail(orderId)
    if (res.success && res.data) {
      order.value = res.data
      currentStatus.value = res.data.status
      // 字段兜底校验
      if (!order.value.items || !Array.isArray(order.value.items)) {
        orderError.value = '订单商品信息异常';
        // 确保 items 是数组，避免 ElTable 报错
        order.value.items = []
      }
      // 打印订单商品数据结构
      console.log('订单商品数据:', res.data.items)
      console.log('优惠券信息:', res.data.coupon_info)
    } else {
      orderError.value = '订单不存在或已被删除';
      ElMessage.error('订单不存在或已被删除')
      router.push('/admin/orders')
    }
  } catch (error) {
    orderError.value = error.message || '加载订单失败';
    console.error('加载订单详情失败:', error)
    ElMessage.error(`加载订单详情失败: ${error.message || '网络错误'}`)
    router.push('/admin/orders')
  } finally {
    loading.value = false
  }
}

function getStatusTagType(status) {
  const types = {
    1: 'warning',
    2: 'success',
    3: 'primary',
    4: 'info',
    5: 'info',
    6: 'warning',
    7: 'success',
    8: 'danger'
  }
  return types[status] || 'info'
}

function getStatusText(status) {
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
  return texts[status] || '未知'
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 处理订单状态变更（保留兼容性，但不再使用）
async function handleStatusChange(status) {
  ElMessage.warning('请使用操作按钮进行订单管理')
}

// 买家端操作处理
async function handleBuyerAction(action) {
  if (action === 'confirm_receipt') {
    await handleConfirmReceipt()
  }
  // 清空选择
  selectedAction.value = ''
}

// 生成随机快递单号
function generateTrackingNumber() {
  if (!logisticsForm.value.company) return
  
  const prefixes = {
    '顺丰速运': 'SF',
    '圆通速递': 'YT',
    '中通快递': 'ZT',
    '申通快递': 'ST',
    '韵达速递': 'YD',
    'EMS': 'EMS',
    '京东物流': 'JD',
    '德邦快递': 'DP',
    '极兔速递': 'JT',
    '邮政快递': 'YZ'
  }
  const prefix = prefixes[logisticsForm.value.company] || 'KD'
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  logisticsForm.value.trackingNumber = `${prefix}${timestamp}${random}`
}

// 发货操作
async function handleShip() {
  if (!order.value?.logistics_company && !order.value?.tracking_number) {
    logisticsDialogVisible.value = true
    return
  }
  
  try {
    await orderApi.ship(orderId, {
      logistics_company: order.value.logistics_company,
      tracking_number: order.value.tracking_number
    })
    await loadOrderDetail()
    ElMessage.success('发货成功')
  } catch (error) {
    console.error('发货失败:', error)
    ElMessage.error(`发货失败：${error.message || '网络错误'}`)
  }
}

// 设为待收货操作
async function handleSetAwaitingReceipt() {
  try {
    await orderApi.setAwaitingReceipt(orderId)
    await loadOrderDetail()
    ElMessage.success('已设为待收货')
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error(`操作失败：${error.message || '网络错误'}`)
  }
}

// 确认收货操作
async function handleConfirmReceipt() {
  try {
    await orderApi.confirmReceipt(orderId)
    await loadOrderDetail()
    ElMessage.success('确认收货成功')
  } catch (error) {
    console.error('确认收货失败:', error)
    ElMessage.error(`确认收货失败：${error.message || '网络错误'}`)
  }
}

// 取消订单操作
async function handleCancel() {
  ElMessageBox.confirm('确定要取消订单吗？', '取消订单', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await orderApi.cancel(orderId, { reason: '用户主动取消' })
      await loadOrderDetail()
      ElMessage.success('订单已取消')
    } catch (error) {
      console.error('取消订单失败:', error)
      ElMessage.error(`取消订单失败：${error.message || '网络错误'}`)
    }
  }).catch(() => {
    // 取消操作
  })
}

// 实际的订单状态更新函数
async function updateOrderStatus(status) {
  try {
    await orderApi.updateStatus(orderId, status)
    
    await loadOrderDetail()
    ElMessage.success('订单状态更新成功')
  } catch (error) {
    console.error('更新订单状态失败:', error)
    ElMessage.error(`更新订单状态失败: ${error.message || '网络错误'}`)
    // 恢复原始状态
    currentStatus.value = order.value.status
  }
}

// 提交物流信息并更新订单状态
async function submitLogisticsAndUpdateStatus() {
  if (!logisticsForm.value.company || !logisticsForm.value.trackingNumber) {
    ElMessage.warning('请填写完整的物流信息')
    return
  }
  
  try {
    // 先更新物流信息并发货
    await orderApi.ship(orderId, {
      logistics_company: logisticsForm.value.company,
      tracking_number: logisticsForm.value.trackingNumber
    })
    
    // 关闭对话框
    logisticsDialogVisible.value = false
    
    // 清空表单
    logisticsForm.value = {
      company: '',
      trackingNumber: ''
    }
    
    ElMessage.success('发货成功')
    
    // 重新加载订单详情
    await loadOrderDetail()
  } catch (error) {
    console.error('保存物流信息失败:', error)
    ElMessage.error(`保存物流信息失败: ${error.message || '网络错误'}`)
  }
}

// 物流信息填写相关方法
function getProductImage(product) {
  // 如果商品有SKU图片，优先使用
  if (product.sku_image) {
    return product.sku_image
  }
  
  // 如果商品有图片URL，直接使用
  if (product.image_url) {
    return product.image_url
  }
  
  // 构建基于颜色和尺寸的提示词
  let prompt = 'product placeholder image'
  
  if (product.color) {
    prompt += `, ${product.color} color`
  }
  
  if (product.size) {
    prompt += `, size ${product.size}`
  }
  
  // 添加商品名称
  if (product.product_name) {
    prompt += `, ${product.product_name}`
  }
  
  // 生成URL编码的提示词
  const encodedPrompt = encodeURIComponent(prompt)
  
  // 返回生成的占位图片URL
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodedPrompt}&image_size=square`
}

// 完成物流
async function handleCompleteLogistics() {
  try {
    await orderApi.completeLogistics(orderId)
    
    ElMessage.success('物流已完成')
    await loadOrderDetail() // 重新加载订单详情
  } catch (error) {
    ElMessage.error(error.message || '完成物流失败')
  }
}



// 获取时间轴颜色
function getTimelineColor(index) {
  if (index === 0) return '#409EFF' // 蓝色 - 开始
  if (index === logisticsRecords.value.length - 1) return '#67C23A' // 绿色 - 结束
  return '#909399' // 灰色 - 中间步骤
}

// 重置物流状态
async function resetLogisticsStatus() {
  try {
    await orderApi.resetLogistics(orderId)
    
    ElMessage.success('物流状态重置成功')
    await loadOrderDetail() // 重新加载订单详情
  } catch (error) {
    ElMessage.error(error.message || '重置物流状态失败')
  }
}

// 删除单个物流状态记录
async function deleteLogisticsRecord(index) {
  try {
    // 由于后端没有提供删除单个物流记录的API，我们使用重置物流状态后重新添加需要保留的记录
    const recordsToKeep = sortedLogisticsRecords.value.filter((_, i) => i !== index)
    
    // 重置物流状态
    await orderApi.resetLogistics(orderId)
    
    // 重新添加需要保留的记录，保持原来的时间顺序
    for (const record of recordsToKeep.reverse()) {
      await orderApi.addLogisticsTrack(orderId, {
        status: record.status,
        description: record.status
      })
    }
    
    ElMessage.success('物流状态删除成功')
    await loadOrderDetail() // 重新加载订单详情
  } catch (error) {
    ElMessage.error(error.message || '删除物流状态失败')
  }
}

function goBack() {
  router.go(-1)
}

onMounted(() => {
  loadOrderDetail()
})
</script>

<style scoped>
.order-detail-view {
  padding: var(--spacing-lg);
  background: var(--bg-color);
  min-height: 100vh;
}

.header {
  margin-bottom: var(--spacing-lg);
}

.loading {
  padding: var(--spacing-xl) 0;
}

.order-detail-content {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  font-weight: 600;
  font-size: var(--font-size-lg);
}

.order-basic-info {
  margin-bottom: var(--spacing-lg);
}

.order-items {
  margin-bottom: var(--spacing-lg);
}

.order-amount {
  margin-bottom: var(--spacing-lg);
}

.amount-summary {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.amount-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-color);
}

.amount-item.total {
  background: var(--bg-color);
  font-weight: 600;
  font-size: var(--font-size-lg);
}

.label {
  color: var(--text-secondary);
}

.value {
  color: var(--text-primary);
  font-weight: 500;
}

.total-amount {
  color: var(--primary-color);
  font-size: var(--font-size-xl);
}

.status-update {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.simple-logistics {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.logistics-card {
  border-left: 3px solid var(--primary-color);
  padding-left: var(--spacing-md);
}

.logistics-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logistics-time {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.form-help {
  font-size: 18px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

.logistics-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
}

.logistics-add-section,
.logistics-tracking-section {
  padding: 10px;
}

.logistics-add-section h3,
.logistics-tracking-section h3 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 15px;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .logistics-container {
    grid-template-columns: 1fr;
  }
}

.logistics-complete-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.logistics-complete-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 0;
}

.refund-button-section {
  margin-top: 20px;
  text-align: right;
}

.order-error-message {
  margin-bottom: 16px;
}

/* 移动端响应式设计 */
@media (max-width: 480px) {
  .payment-content {
    padding: 10px;
  }
  .payment-option {
    padding: 6px 10px;
  }
  .payment-icon {
    width: 18px;
    height: 18px;
  }
  .payment-amount {
    padding: 10px;
    margin-bottom: 15px;
  }
  .amount-label {
    font-size: 13px;
  }
  .amount-value {
    font-size: 16px;
  }
  .payment-action .el-button {
    font-size: 14px;
    padding: 8px 16px;
  }
}
</style>
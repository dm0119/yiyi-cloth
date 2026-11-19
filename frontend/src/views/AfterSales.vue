<template>
  <div class="after-sales-container">
    <div class="page-header">
      <h2>售后管理</h2>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-select v-model="filters.status" placeholder="售后状态" clearable style="width: 150px" @change="loadList">
        <el-option label="待处理" :value="1" />
        <el-option label="已同意" :value="2" />
        <el-option label="退货中" :value="3" />
        <el-option label="待退款" :value="4" />
        <el-option label="已完成" :value="5" />
        <el-option label="已拒绝" :value="6" />
      </el-select>
      <el-select v-model="filters.type" placeholder="售后类型" clearable style="width: 150px; margin-left: 12px" @change="loadList">
        <el-option label="急速退款" value="refund" />
        <el-option label="退货退款" value="return_refund" />
        <el-option label="换货" value="exchange" />
      </el-select>
      <el-button type="primary" style="margin-left: 12px" @click="loadList">查询</el-button>
      <el-button @click="resetFilters">重置</el-button>
    </div>

    <!-- 列表 -->
    <el-table :data="list" v-loading="loading" stripe border style="width: 100%">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="order_no" label="订单号" width="180">
        <template #default="{ row }">
          <el-link type="primary" @click="goToOrder(row.order_id)">{{ row.order_no }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="类型" width="110">
        <template #default="{ row }">
          <el-tag :type="getTypeTag(row.type)">{{ getTypeText(row.type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="getStatusTag(row.status)">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="reason" label="原因" min-width="120" show-overflow-tooltip />
      <el-table-column prop="refund_amount" label="退款金额" width="110">
        <template #default="{ row }">
          <span v-if="row.refund_amount > 0" style="color: #f56c6c">¥{{ Number(row.refund_amount).toFixed(2) }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="申请时间" width="170" />
      <el-table-column label="操作" width="300" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="viewDetail(row)">详情</el-button>
          <!-- 待处理 -->
          <el-button v-if="row.status === 1" type="success" size="small" @click="handleApprove(row)">同意</el-button>
          <el-button v-if="row.status === 1" type="danger" size="small" @click="handleReject(row)">拒绝</el-button>
          <!-- 已同意：等待买家退货 -->
          <el-tag v-if="row.status === 2" type="info" size="small">等待买家退货</el-tag>
          <!-- 退货中：可确认收货 -->
          <el-button v-if="row.status === 3" type="warning" size="small" @click="handleConfirmReceived(row)">确认收货</el-button>
          <!-- 待退款/待发货 -->
          <el-button v-if="row.status === 4 && row.type !== 'exchange'" type="success" size="small" @click="handleConfirmRefund(row)">确认退款</el-button>
          <el-button v-if="row.status === 4 && row.type === 'exchange'" type="primary" size="small" @click="handleReship(row)">重新发货</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="limit"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="loadList"
        @current-change="loadList"
      />
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="售后详情" width="700px" destroy-on-close>
      <div v-if="currentRecord" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="售后ID">{{ currentRecord.id }}</el-descriptions-item>
          <el-descriptions-item label="订单号">{{ currentRecord.order_no }}</el-descriptions-item>
          <el-descriptions-item label="售后类型">{{ getTypeText(currentRecord.type) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTag(currentRecord.status)">{{ getStatusText(currentRecord.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="退款金额">
            <span v-if="currentRecord.refund_amount > 0" style="color: #f56c6c; font-weight: bold;">
              ¥{{ Number(currentRecord.refund_amount).toFixed(2) }}
            </span>
            <span v-else-if="currentRecord.type === 'exchange' && currentRecord.items" style="color: #f56c6c; font-weight: bold;">
              ¥{{ calculateTotalAmount(currentRecord.items).toFixed(2) }}
            </span>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="申请原因">{{ currentRecord.reason }}</el-descriptions-item>
          <el-descriptions-item label="补充说明" :span="2" v-if="currentRecord.description">
            {{ currentRecord.description }}
          </el-descriptions-item>
          <el-descriptions-item label="拒绝原因" :span="2" v-if="currentRecord.reject_reason">
            <span style="color: #f56c6c">{{ currentRecord.reject_reason }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ currentRecord.created_at }}</el-descriptions-item>
          <el-descriptions-item label="处理时间" v-if="currentRecord.processed_at">{{ currentRecord.processed_at }}</el-descriptions-item>
        </el-descriptions>

        <!-- 换货规格 -->
        <div v-if="currentRecord.type === 'exchange' && (currentRecord.new_color || currentRecord.new_size)" style="margin-top: 16px">
          <h4>换货规格</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="新颜色" v-if="currentRecord.new_color">{{ currentRecord.new_color }}</el-descriptions-item>
            <el-descriptions-item label="新尺码" v-if="currentRecord.new_size">{{ currentRecord.new_size }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 退货物流（买家寄回） -->
        <div v-if="currentRecord.return_logistics_company || currentRecord.status >= 3" style="margin-top: 16px">
          <h4>退货物流（买家寄回）</h4>
          <el-descriptions :column="2" border v-if="currentRecord.return_logistics_company">
            <el-descriptions-item label="物流公司">{{ currentRecord.return_logistics_company }}</el-descriptions-item>
            <el-descriptions-item label="快递单号">{{ currentRecord.return_tracking_number }}</el-descriptions-item>
          </el-descriptions>
          <el-alert v-else type="info" :closable="false" show-icon>
            <template #title>等待买家填写退货物流信息</template>
          </el-alert>
        </div>

        <!-- 重新发货物流（换货） -->
        <div v-if="currentRecord.type === 'exchange' && (currentRecord.reship_logistics_company || currentRecord.status >= 4)" style="margin-top: 16px">
          <h4>重新发货物流（商家）</h4>
          <el-descriptions :column="2" border v-if="currentRecord.reship_logistics_company">
            <el-descriptions-item label="物流公司">{{ currentRecord.reship_logistics_company }}</el-descriptions-item>
            <el-descriptions-item label="快递单号">{{ currentRecord.reship_tracking_number }}</el-descriptions-item>
            <el-descriptions-item label="发货时间">{{ currentRecord.reshipped_at }}</el-descriptions-item>
          </el-descriptions>
          <el-alert v-else-if="currentRecord.status === 4" type="warning" :closable="false" show-icon>
            <template #title>请尽快重新发货</template>
          </el-alert>
        </div>

        <!-- 凭证图片 -->
        <div v-if="currentRecord.images && currentRecord.images.length > 0" style="margin-top: 16px">
          <h4>凭证图片</h4>
          <div class="image-list">
            <el-image
              v-for="(img, index) in currentRecord.images"
              :key="index"
              :src="img"
              :preview-src-list="currentRecord.images"
              :initial-index="index"
              fit="cover"
              style="width: 100px; height: 100px; margin-right: 8px; border-radius: 4px"
            />
          </div>
        </div>

        <!-- 订单商品 -->
        <div v-if="currentRecord.items && currentRecord.items.length > 0" style="margin-top: 16px">
          <h4>商品信息</h4>
          <el-table :data="currentRecord.items" border class="product-table">
            <el-table-column prop="product_name" label="商品名称" />
            <el-table-column prop="color" label="颜色" width="100" />
            <el-table-column prop="size" label="尺码" width="100" />
            <el-table-column prop="price" label="单价" width="100">
              <template #default="{ row }">¥{{ Number(row.price).toFixed(2) }}</template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="80" />
          </el-table>
        </div>
      </div>
    </el-dialog>

    <!-- 拒绝弹窗 -->
    <el-dialog v-model="rejectVisible" title="拒绝售后" width="400px" destroy-on-close>
      <el-form>
        <el-form-item label="拒绝原因" required>
          <el-input v-model="rejectReason" type="textarea" :rows="3" placeholder="请输入拒绝原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="danger" @click="submitReject" :loading="actionLoading">确认拒绝</el-button>
      </template>
    </el-dialog>

    <!-- 重新发货弹窗 -->
    <el-dialog v-model="reshipVisible" title="换货重新发货" width="420px" destroy-on-close>
      <el-form>
        <el-form-item label="物流公司" required>
          <el-select v-model="reshipForm.logistics_company" placeholder="请选择物流公司" style="width: 100%">
            <el-option label="顺丰速运" value="顺丰速运" />
            <el-option label="中通快递" value="中通快递" />
            <el-option label="圆通速递" value="圆通速递" />
            <el-option label="申通快递" value="申通快递" />
            <el-option label="韵达速递" value="韵达速递" />
            <el-option label="EMS" value="EMS" />
            <el-option label="京东物流" value="京东物流" />
            <el-option label="德邦快递" value="德邦快递" />
            <el-option label="极兔速递" value="极兔速递" />
            <el-option label="邮政快递" value="邮政快递" />
          </el-select>
        </el-form-item>
        <el-form-item label="快递单号" required>
          <el-input v-model="reshipForm.tracking_number" placeholder="请输入快递单号">
            <template #append>
              <el-button @click="generateTrackingNumber">随机生成</el-button>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reshipVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReship" :loading="actionLoading">确认发货</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const API_BASE = '/api'

// 列表数据
const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const limit = ref(20)

// 筛选
const filters = ref({
  status: '',
  type: ''
})

// 详情
const detailVisible = ref(false)
const currentRecord = ref(null)

// 拒绝
const rejectVisible = ref(false)
const rejectReason = ref('')
const rejectOrderId = ref(null)
const actionLoading = ref(false)

// 重新发货
const reshipVisible = ref(false)
const reshipForm = ref({ logistics_company: '', tracking_number: '' })
const reshipOrderId = ref(null)

onMounted(() => {
  loadList()
})

function getAuthHeaders() {
  const token = localStorage.getItem('admin_token') || localStorage.getItem('merchant_token')
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
}

async function loadList() {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: page.value,
      limit: limit.value
    })
    if (filters.value.status !== '' && filters.value.status !== null) {
      params.append('status', filters.value.status)
    }
    if (filters.value.type) {
      params.append('type', filters.value.type)
    }
    const res = await fetch(`${API_BASE}/after-sales?${params}`, { headers: getAuthHeaders() })
    const data = await res.json()
    if (data.success) {
      list.value = data.data.list
      total.value = data.data.total
    }
  } catch (error) {
    console.error('加载售后列表失败:', error)
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  filters.value = { status: '', type: '' }
  page.value = 1
  loadList()
}

async function viewDetail(row) {
  try {
    const res = await fetch(`${API_BASE}/after-sales/${row.id}`, { headers: getAuthHeaders() })
    const data = await res.json()
    if (data.success) {
      currentRecord.value = data.data
      detailVisible.value = true
    }
  } catch (error) {
    console.error('加载详情失败:', error)
  }
}

function goToOrder(orderId) {
  const base = router.currentRoute.value.path.startsWith('/merchant') ? '/merchant' : '/admin'
  router.push(`${base}/orders/${orderId}`)
}

// 同意售后
async function handleApprove(row) {
  try {
    await ElMessageBox.confirm('确定同意该售后申请吗？', '确认')
    const res = await fetch(`${API_BASE}/orders/${row.order_id}/after-sale/approve`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    const data = await res.json()
    if (data.success) {
      ElMessage.success('已同意售后申请')
      loadList()
    } else {
      ElMessage.error(data.message || '操作失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

// 拒绝售后
function handleReject(row) {
  rejectOrderId.value = row.order_id
  rejectReason.value = ''
  rejectVisible.value = true
}

async function submitReject() {
  if (!rejectReason.value) {
    ElMessage.warning('请输入拒绝原因')
    return
  }
  actionLoading.value = true
  try {
    const res = await fetch(`${API_BASE}/orders/${rejectOrderId.value}/after-sale/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reject_reason: rejectReason.value })
    })
    const data = await res.json()
    if (data.success) {
      ElMessage.success('已拒绝售后申请')
      rejectVisible.value = false
      loadList()
    } else {
      ElMessage.error(data.message || '操作失败')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    actionLoading.value = false
  }
}

// 确认收货
async function handleConfirmReceived(row) {
  try {
    await ElMessageBox.confirm('确认已收到退货商品？', '确认')
    const res = await fetch(`${API_BASE}/orders/${row.order_id}/after-sale/confirm-received`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    const data = await res.json()
    if (data.success) {
      ElMessage.success(data.message || '已确认收货')
      loadList()
    } else {
      ElMessage.error(data.message || '操作失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

// 确认退款
async function handleConfirmRefund(row) {
  try {
    await ElMessageBox.confirm(`确认退款 ¥${Number(row.refund_amount).toFixed(2)}？`, '确认退款', {
      type: 'warning'
    })
    const res = await fetch(`${API_BASE}/orders/${row.order_id}/after-sale/confirm-refund`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    const data = await res.json()
    if (data.success) {
      ElMessage.success('退款成功')
      loadList()
    } else {
      ElMessage.error(data.message || '操作失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

// 换货重新发货
function handleReship(row) {
  reshipOrderId.value = row.order_id
  reshipForm.value = { logistics_company: '', tracking_number: '' }
  reshipVisible.value = true
}

// 随机生成快递单号
function generateTrackingNumber() {
  if (!reshipForm.value.logistics_company) return
  
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
  const prefix = prefixes[reshipForm.value.logistics_company] || 'KD'
  const timestamp = Date.now().toString().slice(-10)
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  reshipForm.value.tracking_number = prefix + timestamp + random
}

async function submitReship() {
  if (!reshipForm.value.logistics_company || !reshipForm.value.tracking_number) {
    ElMessage.warning('请填写物流信息')
    return
  }
  actionLoading.value = true
  try {
    const res = await fetch(`${API_BASE}/orders/${reshipOrderId.value}/after-sale/reship`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reshipForm.value)
    })
    const data = await res.json()
    if (data.success) {
      ElMessage.success('发货成功')
      reshipVisible.value = false
      loadList()
    } else {
      ElMessage.error(data.message || '操作失败')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    actionLoading.value = false
  }
}

// 文本映射
function getTypeText(type) {
  const map = { refund: '急速退款', return_refund: '退货退款', exchange: '换货' }
  return map[type] || type
}
function getTypeTag(type) {
  const map = { refund: 'warning', return_refund: 'danger', exchange: 'primary' }
  return map[type] || 'info'
}
function getStatusText(status) {
  const map = { 1: '待处理', 2: '已同意', 3: '退货中', 4: '待退款', 5: '已完成', 6: '已拒绝' }
  return map[status] || '未知'
}
function getStatusTag(status) {
  const map = { 1: 'warning', 2: 'success', 3: 'primary', 4: 'info', 5: 'success', 6: 'danger' }
  return map[status] || 'info'
}

// 计算商品总金额
function calculateTotalAmount(items) {
  if (!items || !Array.isArray(items)) return 0
  return items.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0)
}
</script>

<style scoped>
.after-sales-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
}

.filter-bar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.detail-content h4 {
  margin: 16px 0 12px;
  font-size: 15px;
  color: #333;
}

/* 统一售后详情弹窗内所有文字颜色 */
.detail-content :deep(.el-descriptions) {
  color: #606266;
}

.detail-content :deep(.el-descriptions__body) {
  color: #606266 !important;
}

.detail-content :deep(.el-descriptions__label) {
  color: #606266 !important;
  font-weight: 700;
}

.detail-content :deep(.el-descriptions__content) {
  color: #606266 !important;
}

.detail-content :deep(.el-descriptions-item__label) {
  color: #606266 !important;
}

.detail-content :deep(.el-descriptions-item__content) {
  color: #606266 !important;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
}

/* 商品信息表格样式 - 与 el-descriptions 保持一致 */
.product-table {
  font-size: 14px;
}

.product-table :deep(.el-table__cell) {
  font-size: 14px;
  padding: 12px 16px;
}

.product-table :deep(.el-table__header th) {
  font-size: 14px;
  font-weight: 700;
  color: #606266;
  background-color: #f5f7fa;
  white-space: nowrap;
}

.product-table :deep(.el-table__header .cell) {
  white-space: nowrap;
}

.product-table :deep(.el-table__body td) {
  color: #606266 !important;
  font-size: 14px;
}

.product-table :deep(.el-table__body .cell) {
  font-size: 14px;
  color: #606266 !important;
}

.product-table :deep(.el-table__row td) {
  color: #606266 !important;
}

.product-table :deep(.el-table .cell) {
  color: #606266 !important;
}
</style>

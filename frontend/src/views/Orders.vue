<template>
  <div class="orders-view">
    <!-- 查询过滤器 -->
    <div class="filters">
      <el-form inline class="filter-form">
        <el-form-item label="订单号">
          <el-input 
            v-model="filters.order_no" 
            placeholder="请输入订单号" 
            clearable
            @keyup.enter="applyFilters"
          />
        </el-form-item>
        
        <el-form-item label="客户姓名">
          <el-input 
            v-model="filters.customer_name" 
            placeholder="请输入客户姓名" 
            clearable
            @keyup.enter="applyFilters"
          />
        </el-form-item>
        
        <el-form-item label="手机号">
          <el-input 
            v-model="filters.phone" 
            placeholder="请输入手机号" 
            clearable
            @keyup.enter="applyFilters"
          />
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select 
            v-model="filters.status" 
            placeholder="请选择状态" 
            clearable
            @change="applyFilters"
          >
            <el-option label="待支付" :value="1" />
            <el-option label="已支付" :value="2" />
            <el-option label="已发货" :value="3" />
            <el-option label="运输中" :value="4" />
            <el-option label="派送中" :value="5" />
            <el-option label="待收货" :value="6" />
            <el-option label="已完成" :value="7" />
            <el-option label="已取消" :value="8" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="金额范围">
          <el-input 
            v-model="filters.min_amount" 
            placeholder="最低金额" 
            style="width: 100px;"
            @keyup.enter="applyFilters"
          />
          <span style="margin: 0 5px;">-</span>
          <el-input 
            v-model="filters.max_amount" 
            placeholder="最高金额" 
            style="width: 100px;"
            @keyup.enter="applyFilters"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="applyFilters">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <div class="card">
      <!-- 订单表格 -->
      <div class="order-table-container">
        <el-table 
          ref="orderTableRef"
          :data="filteredOrders" 
          style="width: 100%" 
          stripe
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" v-permission="['order:manage']" />
          <el-table-column label="序号" width="80" align="center">
            <template #default="{ $index }">
              {{ $index + 1 }}
            </template>
          </el-table-column>
          <el-table-column label="订单信息" min-width="180">
            <template #default="{ row }">
              <div class="order-info">
                <p class="order-no">{{ row.order_no }}</p>
                <p class="order-time">{{ formatDate(row.created_at) }}</p>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="客户信息" min-width="150">
            <template #default="{ row }">
              <div class="customer-info">
                <p class="customer-name">{{ row.customer_name }}</p>
                <p class="customer-phone">{{ row.phone }}</p>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="金额" min-width="100" align="center">
            <template #default="{ row }">
              <span class="amount">¥{{ Number(row.total_amount).toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" min-width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="180" align="center" v-permission="['order:manage']">
            <template #default="{ row }">
              <div class="operation-buttons">
                <el-button 
                  size="small" 
                  type="primary" 
                  @click="viewOrderDetail(row.id)"
                  style="margin-right: 8px;"
                >
                  查看详情
                </el-button>

              </div>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-if="orders.length === 0" description="暂无订单" />
      </div>

      <!-- 批量操作工具栏 -->
      <div class="batch-actions" v-if="selectedOrders.length > 0" v-permission="['order:manage']">
        <el-button 
          type="danger" 
          @click="batchDeleteOrders"
          :disabled="selectedOrders.length === 0"
        >
          批量删除 ({{ selectedOrders.length }})
        </el-button>
        <el-button @click="clearSelection">
          清空选择
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { orderApi } from '../services/api.js'
import { ElMessageBox, ElMessage } from 'element-plus'
import { usePermission } from '../mixins/permission'

const { hasPermission } = usePermission()

const router = useRouter()
const orders = ref([])
const selectedOrders = ref([])
const orderTableRef = ref(null)

function handleSelectionChange(val) {
  selectedOrders.value = val
}

async function batchDeleteOrders() {
  if (!hasPermission('order:delete')) {
    ElMessage.warning('您没有删除订单的权限')
    return
  }
  
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('请选择要删除的订单')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedOrders.value.length} 个订单吗？删除后将无法恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const orderIds = selectedOrders.value.map(order => order.id)
    await orderApi.batchDelete(orderIds)
    
    ElMessage.success(`成功删除 ${selectedOrders.value.length} 个订单`)
    await loadOrders()
    clearSelection()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

function clearSelection() {
  if (orderTableRef.value) {
    orderTableRef.value.clearSelection()
  }
  selectedOrders.value = []
}

const filters = ref({
  order_no: '',
  customer_name: '',
  phone: '',
  status: '',
  min_amount: '',
  max_amount: ''
})

const filteredOrders = computed(() => {
  let result = orders.value || []
  
  if (filters.value.order_no) {
    result = result.filter(order => 
      order.order_no.toLowerCase().includes(filters.value.order_no.toLowerCase())
    )
  }
  
  if (filters.value.customer_name) {
    result = result.filter(order => 
      order.customer_name && order.customer_name.toLowerCase().includes(filters.value.customer_name.toLowerCase())
    )
  }
  
  if (filters.value.phone) {
    result = result.filter(order => 
      order.phone && order.phone.includes(filters.value.phone)
    )
  }
  
  if (filters.value.status !== '') {
    result = result.filter(order => order.status == filters.value.status)
  }
  
  if (filters.value.min_amount) {
    const minAmount = parseFloat(filters.value.min_amount)
    result = result.filter(order => Number(order.total_amount) >= minAmount)
  }
  
  if (filters.value.max_amount) {
    const maxAmount = parseFloat(filters.value.max_amount)
    result = result.filter(order => Number(order.total_amount) <= maxAmount)
  }
  
  return result
})

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

async function loadOrders() {
  try {
    const res = await orderApi.getList()
    orders.value = res.data
  } catch (error) {
    console.error('加载订单失败:', error)
    ElMessage.error('加载订单失败，请稍后重试')
  }
}

function viewOrderDetail(orderId) {
  if (!hasPermission('order:detail')) {
    ElMessage.warning('您没有查看订单详情的权限')
    return
  }
  router.push(`/admin/orders/${orderId}`)
}

function applyFilters() {
  // 过滤器功能已实现，通过computed属性filteredOrders实现
  // 这里可以添加额外的过滤逻辑
}

function resetFilters() {
  filters.value = {
    order_no: '',
    customer_name: '',
    phone: '',
    status: '',
    min_amount: '',
    max_amount: ''
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.orders-view {
  padding: 0;
}

.filters {
  background: var(--bg-white);
  border-radius: var(--card-radius);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  align-items: center;
}

.filter-form .el-form-item {
  margin-bottom: var(--spacing-sm);
}

.filter-form .el-input {
  width: 180px;
}

.card {
  background: var(--bg-white);
  border-radius: var(--card-radius);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
}

.order-table-container {
  overflow: hidden;
}

.batch-actions {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.order-table-container {
  overflow: hidden;
}

.order-info {
  text-align: left;
}

.order-no {
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.order-time {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin: 0;
}

.customer-info {
  text-align: left;
}

.customer-name {
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.customer-phone {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin: 0;
}

.amount {
  font-weight: 600;
  color: var(--primary-color);
}

.operation-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}
</style>

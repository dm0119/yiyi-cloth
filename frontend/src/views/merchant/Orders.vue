<template>
  <div class="merchant-orders">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>订单管理</span>
          <el-button type="primary" @click="loadOrders">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <!-- 搜索筛选 -->
      <div class="filter-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input
              v-model="filters.keyword"
              placeholder="订单号/客户姓名/手机号"
              clearable
              @clear="handleSearch"
            />
          </el-col>
          <el-col :span="4">
            <el-select v-model="filters.status" placeholder="订单状态" clearable @change="handleSearch">
              <el-option label="全部" value="" />
              <el-option label="待付款" :value="1" />
              <el-option label="待发货" :value="2" />
              <el-option label="已发货" :value="3" />
              <el-option label="待收货" :value="4" />
              <el-option label="已完成" :value="5" />
              <el-option label="已取消" :value="6" />
              <el-option label="退款中" :value="7" />
              <el-option label="已退款" :value="8" />
            </el-select>
          </el-col>
          <el-col :span="8">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="handleDateChange"
            />
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 订单列表 -->
      <el-table :data="orders" stripe v-loading="loading" class="order-table">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="order_no" label="订单号" width="180" />
        <el-table-column prop="customer_name" label="客户姓名" width="100" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column label="订单金额" width="120">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: bold">
              ¥{{ Number(row.total_amount || 0).toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="payment_method" label="支付方式" width="100">
          <template #default="{ row }">
            {{ getPaymentMethodText(row.payment_method) }}
          </template>
        </el-table-column>
        <el-table-column prop="address" label="收货地址" min-width="200" show-overflow-tooltip />
        <el-table-column label="下单时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button
              v-if="row.status === 2"
              type="success"
              size="small"
              @click="handleShip(row)"
            >
              <el-icon><Van /></el-icon>
              发货
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="800px"
    >
      <div v-if="currentOrder">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">
            {{ currentOrder.order_no }}
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(currentOrder.status)">
              {{ getStatusText(currentOrder.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="客户姓名">
            {{ currentOrder.customer_name }}
          </el-descriptions-item>
          <el-descriptions-item label="手机号">
            {{ currentOrder.phone }}
          </el-descriptions-item>
          <el-descriptions-item label="订单金额" :span="2">
            <span style="color: #f56c6c; font-size: 18px; font-weight: bold">
              ¥{{ Number(currentOrder.total_amount || 0).toFixed(2) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="优惠券信息" :span="2">
            <div v-if="currentOrder.original_amount && currentOrder.original_amount > currentOrder.total_amount">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>原价：¥{{ Number(currentOrder.original_amount || 0).toFixed(2) }}</span>
                <span style="color: #67c23a;">优惠：-¥{{ Number(currentOrder.original_amount - currentOrder.total_amount || 0).toFixed(2) }}</span>
              </div>
              <div style="color: #909399; font-size: 12px; margin-top: 4px;">
                已使用优惠券
              </div>
            </div>
            <div v-else style="color: #909399;">
              未使用优惠券
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="支付方式">
            {{ getPaymentMethodText(currentOrder.payment_method) }}
          </el-descriptions-item>
          <el-descriptions-item label="下单时间">
            {{ formatDateTime(currentOrder.created_at) }}
          </el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2">
            {{ currentOrder.address }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.remark" label="备注" :span="2">
            {{ currentOrder.remark }}
          </el-descriptions-item>
          <el-descriptions-item label="物流公司" v-if="currentOrder.logistics_company">
            {{ currentOrder.logistics_company }}
          </el-descriptions-item>
          <el-descriptions-item label="物流单号" v-if="currentOrder.tracking_number">
            {{ currentOrder.tracking_number }}
          </el-descriptions-item>
          <el-descriptions-item label="发货时间" v-if="currentOrder.shipped_at">
            {{ formatDateTime(currentOrder.shipped_at) }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 售后记录 -->
        <div class="after-sale-management">
          <h4>售后记录</h4>
          <div class="after-sale-info" v-if="currentOrder.after_sale_info">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="售后类型">
                <el-tag>{{ getAfterSaleTypeText(currentOrder.after_sale_info.type) }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="售后状态">
                <el-tag :type="getAfterSaleStatusType(currentOrder.after_sale_info.status)">
                  {{ getAfterSaleStatusText(currentOrder.after_sale_info.status) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="申请原因" :span="2">
                {{ currentOrder.after_sale_info.reason }}
              </el-descriptions-item>
              <el-descriptions-item label="详细说明" :span="2" v-if="currentOrder.after_sale_info.description">
                {{ currentOrder.after_sale_info.description }}
              </el-descriptions-item>
              <el-descriptions-item label="申请时间" :span="2">
                {{ formatDateTime(currentOrder.after_sale_info.created_at) }}
              </el-descriptions-item>
              <!-- 拒绝原因 -->
              <el-descriptions-item label="拒绝原因" :span="2" v-if="currentOrder.after_sale_info.reject_reason">
                <span style="color: #f56c6c;">{{ currentOrder.after_sale_info.reject_reason }}</span>
              </el-descriptions-item>
              <!-- 凭证图片 -->
              <el-descriptions-item label="凭证图片" :span="2" v-if="currentOrder.after_sale_info.images && currentOrder.after_sale_info.images.length > 0">
                <div class="after-sale-images">
                  <el-image
                    v-for="(img, index) in currentOrder.after_sale_info.images"
                    :key="index"
                    :src="img"
                    :preview-src-list="currentOrder.after_sale_info.images"
                    fit="cover"
                    style="width: 100px; height: 100px; margin-right: 10px;"
                  />
                </div>
              </el-descriptions-item>
              <!-- 换货信息 -->
              <template v-if="currentOrder.after_sale_info.type === 'exchange'">
                <el-descriptions-item label="换货颜色" v-if="currentOrder.after_sale_info.new_color">
                  <span style="color: #409eff; font-weight: bold;">{{ currentOrder.after_sale_info.new_color }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="换货尺码" v-if="currentOrder.after_sale_info.new_size">
                  <span style="color: #409eff; font-weight: bold;">{{ currentOrder.after_sale_info.new_size }}</span>
                </el-descriptions-item>
              </template>
              <!-- 退货物流（买家寄回） -->
              <template v-if="currentOrder.after_sale_info.return_logistics_company">
                <el-descriptions-item label="退货物流">
                  {{ currentOrder.after_sale_info.return_logistics_company }}
                </el-descriptions-item>
                <el-descriptions-item label="退货单号">
                  {{ currentOrder.after_sale_info.return_tracking_number }}
                </el-descriptions-item>
              </template>
              <!-- 重新发货物流（换货） -->
              <template v-if="currentOrder.after_sale_info.reship_logistics_company">
                <el-descriptions-item label="重新发货物流">
                  {{ currentOrder.after_sale_info.reship_logistics_company }}
                </el-descriptions-item>
                <el-descriptions-item label="新物流单号">
                  {{ currentOrder.after_sale_info.reship_tracking_number }}
                </el-descriptions-item>
                <el-descriptions-item label="重新发货时间" :span="2" v-if="currentOrder.after_sale_info.reshipped_at">
                  {{ formatDateTime(currentOrder.after_sale_info.reshipped_at) }}
                </el-descriptions-item>
              </template>
              <!-- 处理时间 -->
              <el-descriptions-item label="处理时间" :span="2" v-if="currentOrder.after_sale_info.processed_at">
                {{ formatDateTime(currentOrder.after_sale_info.processed_at) }}
              </el-descriptions-item>
            </el-descriptions>
            
            <!-- 操作按钮 -->
            <div class="after-sale-actions" v-if="currentOrder.after_sale_info.status === 1">
              <el-button 
                type="success" 
                @click="handleApproveAfterSale"
                :loading="approveLoading"
              >
                <el-icon><Check /></el-icon>
                同意售后
              </el-button>
              <el-button 
                type="danger" 
                @click="showRejectDialog"
              >
                <el-icon><Close /></el-icon>
                拒绝售后
              </el-button>
            </div>
          </div>
          <el-empty v-else description="暂无售后信息" />
        </div>

        <!-- 订单状态管理 -->
        <div class="status-management" v-if="currentOrder.status !== 4 && currentOrder.status !== 5 && currentOrder.status !== 7">
          <h4>订单状态管理</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="status-actions">
                <el-button 
                  v-if="currentOrder.status === 2" 
                  type="primary" 
                  @click="handleShip(currentOrder)"
                  :loading="shippingLoading"
                >
                  <el-icon><Van /></el-icon>
                  发货
                </el-button>
                <el-button 
                  v-if="currentOrder.status === 1 || currentOrder.status === 2" 
                  type="danger" 
                  @click="handleCancel(currentOrder)"
                >
                  <el-icon><Close /></el-icon>
                  取消订单
                </el-button>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="status-selector">
                <el-select 
                  v-model="selectedStatus" 
                  placeholder="选择状态" 
                  @change="handleStatusChange"
                  style="width: 200px;"
                >
                  <!-- 待付款状态：可取消 -->
                  <el-option 
                    v-if="currentOrder.status === 1" 
                    label="已取消" 
                    :value="5" 
                  />
                  <!-- 待发货状态：可发货或取消 -->
                  <template v-if="currentOrder.status === 2">
                    <el-option label="已发货" :value="3" />
                    <el-option label="已取消" :value="5" />
                  </template>
                  <!-- 已发货状态：只能设为待收货 -->
                  <el-option 
                    v-if="currentOrder.status === 3" 
                    label="待收货" 
                    :value="4" 
                  />
                  <!-- 待收货状态：需要买家在移动端确认收货，商家不能直接完成 -->
                  <template v-if="currentOrder.status === 4">
                    <el-option label="已取消" :value="5" />
                  </template>
                  <!-- 退款中状态：可取消 -->
                  <el-option 
                    v-if="currentOrder.status === 6" 
                    label="已取消" 
                    :value="5" 
                  />
                </el-select>
                <el-button 
                  type="primary" 
                  @click="handleStatusUpdate" 
                  :disabled="!selectedStatus || selectedStatus === currentOrder.status"
                  style="margin-left: 10px;"
                >
                  更新状态
                </el-button>
              </div>
            </el-col>
          </el-row>
        </div>

        <el-divider />

        <h4>商品信息</h4>
        <el-table :data="currentOrder.items" stripe>
          <el-table-column label="商品图片" width="100" align="center">
            <template #default="{ row }">
              <div style="display: flex; align-items: center; justify-content: center; width: 60px; height: 60px;">
                <img 
                  v-if="row.display_image && row.display_image.trim() !== ''" 
                  :src="row.display_image" 
                  style="width: 60px; height: 60px; border-radius: 4px; object-fit: cover; cursor: pointer;"
                  @click="previewImage(row.display_image)"
                  @error="handleImageError($event, row)"
                />
                <div v-else style="width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; background: #f5f7fa; border-radius: 4px; color: #999; font-size: 18px;">
                  <el-icon style="margin-right: 4px;"><Picture /></el-icon>
                  <span>无图片</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="product_name" label="商品名称" min-width="150" />
          <el-table-column label="规格" width="120">
            <template #default="{ row }">
              <div v-if="row.color || row.size">
                <div v-if="row.color" style="color: #666;">颜色：{{ row.color }}</div>
                <div v-if="row.size" style="color: #666;">尺码：{{ row.size }}</div>
              </div>
              <span v-else style="color: #999;">默认规格</span>
            </template>
          </el-table-column>
          <el-table-column prop="price" label="单价" width="120">
            <template #default="{ row }">
              <span style="color: #f56c6c;">¥{{ Number(row.price || 0).toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="100" />
          <el-table-column label="小计" width="120">
            <template #default="{ row }">
              <span style="color: #f56c6c; font-weight: bold;">¥{{ Number(row.price * row.quantity || 0).toFixed(2) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 发货对话框 -->
    <el-dialog
      v-model="shipDialogVisible"
      title="订单发货"
      width="500px"
    >
      <el-form :model="shipForm" label-width="120px">
        <el-form-item label="物流公司">
          <el-select v-model="shipForm.logistics_company" placeholder="请选择物流公司" style="width: 100%">
            <el-option label="顺丰速运" value="顺丰速运" />
            <el-option label="圆通速递" value="圆通速递" />
            <el-option label="中通快递" value="中通快递" />
            <el-option label="申通快递" value="申通快递" />
            <el-option label="韵达速递" value="韵达速递" />
            <el-option label="EMS" value="EMS" />
            <el-option label="京东物流" value="京东物流" />
            <el-option label="德邦快递" value="德邦快递" />
            <el-option label="极兔速递" value="极兔速递" />
            <el-option label="邮政快递" value="邮政快递" />
          </el-select>
        </el-form-item>
        <el-form-item label="快递单号">
          <el-input v-model="shipForm.tracking_number" placeholder="请输入快递单号">
            <template #append>
              <el-button @click="generateTrackingNo">随机生成</el-button>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmShip" :loading="confirmShipLoading">发货</el-button>
      </template>
    </el-dialog>

    <!-- 拒绝售后对话框 -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="拒绝售后"
      width="500px"
    >
      <el-form :model="rejectForm" label-width="120px">
        <el-form-item label="拒绝原因" required>
          <el-input
            v-model="rejectForm.reject_reason"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝原因"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleRejectAfterSale" :loading="rejectLoading">确定拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Search, View, Van, Picture, Check, Close } from '@element-plus/icons-vue'
import { merchantApi } from '../../services/api'
import { formatDateTime } from '../../utils/dateFormatter'

const loading = ref(false)
const orders = ref([])
const dateRange = ref(null)
const detailDialogVisible = ref(false)
const currentOrder = ref(null)
const shippingLoading = ref(false)
const selectedStatus = ref(null)

// 发货对话框相关
const shipDialogVisible = ref(false)
const shipForm = ref({
  logistics_company: '',
  tracking_number: ''
})
const confirmShipLoading = ref(false)

// 拒绝售后对话框相关
const rejectDialogVisible = ref(false)
const rejectForm = ref({
  reject_reason: ''
})
const approveLoading = ref(false)
const rejectLoading = ref(false)

const filters = reactive({
  keyword: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 加载订单列表
const loadOrders = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.size,
      keyword: filters.keyword,
      status: filters.status
    }

    if (dateRange.value && dateRange.value.length === 2) {
      const formatDate = (date) => {
        const d = new Date(date)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
      params.startDate = formatDate(dateRange.value[0])
      params.endDate = formatDate(dateRange.value[1])
    }

    const response = await merchantApi.getShopOrders(params)
    if (response.success) {
      orders.value = response.data || []
      pagination.total = response.total || 0
    }
  } catch (error) {
    console.error('加载订单列表失败:', error)
    ElMessage.error('加载订单列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadOrders()
}

// 日期范围改变
const handleDateChange = () => {
  pagination.page = 1
  loadOrders()
}

// 查看订单详情
const handleView = async (row) => {
  try {
    const response = await merchantApi.getOrderDetail(row.id)
    if (response.success) {
      currentOrder.value = response.data
      console.log('订单详情数据:', currentOrder.value)
      console.log('商品列表:', currentOrder.value.items)
      if (currentOrder.value.items && currentOrder.value.items.length > 0) {
        console.log('第一个商品的 display_image:', currentOrder.value.items[0].display_image)
      }
      
      detailDialogVisible.value = true
    } else {
      ElMessage.error('获取订单详情失败')
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
  }
}

// 预览图片
const previewImage = (imageUrl) => {
  if (imageUrl) {
    const link = document.createElement('a')
    link.href = imageUrl
    link.target = '_blank'
    link.click()
  }
}

// 图片加载失败处理
const handleImageError = (event, row) => {
  console.error('图片加载失败:', row.display_image)
  event.target.style.display = 'none'
}

// 打开发货对话框
const handleShip = async (row) => {
  currentOrder.value = row
  shipForm.value = {
    logistics_company: '',
    tracking_number: ''
  }
  shipDialogVisible.value = true
}

// 生成随机快递单号
const generateTrackingNo = () => {
  if (!shipForm.value.logistics_company) return
  
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
  const prefix = prefixes[shipForm.value.logistics_company] || 'KD'
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  shipForm.value.tracking_number = `${prefix}${timestamp}${random}`
}

// 确认发货
const confirmShip = async () => {
  if (!shipForm.value.logistics_company || !shipForm.value.tracking_number) {
    ElMessage.warning('请填写物流公司和物流单号')
    return
  }

  try {
    confirmShipLoading.value = true
    
    // 调用发货 API - 使用后端已有的 ship 接口
    const response = await fetch(`/api/orders/${currentOrder.value.id}/ship`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('merchant_token')}`
      },
      body: JSON.stringify({
        logistics_company: shipForm.value.logistics_company,
        tracking_number: shipForm.value.tracking_number
      })
    })
    
    const result = await response.json()
    
    if (result.success) {
      ElMessage.success('发货成功')
      shipDialogVisible.value = false
      loadOrders()
      // 刷新订单详情
      if (currentOrder.value && currentOrder.value.id) {
        const detailResponse = await merchantApi.getOrderDetail(currentOrder.value.id)
        if (detailResponse.success) {
          currentOrder.value = detailResponse.data
        }
      }
    } else {
      ElMessage.error(result.message || '发货失败')
    }
  } catch (error) {
    console.error('发货失败:', error)
    ElMessage.error('发货失败')
  } finally {
    confirmShipLoading.value = false
  }
}

// 取消订单
const handleCancel = async (row) => {
  try {
    await ElMessageBox.confirm('确定要取消订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await merchantApi.updateOrderStatus(row.id, 5)
    if (response.success) {
      ElMessage.success('订单已取消')
      loadOrders()
      // 刷新订单详情
      if (currentOrder.value && currentOrder.value.id === row.id) {
        const detailResponse = await merchantApi.getOrderDetail(row.id)
        if (detailResponse.success) {
          currentOrder.value = detailResponse.data
        }
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败:', error)
      ElMessage.error('取消订单失败')
    }
  }
}

// 状态选择改变
const handleStatusChange = (status) => {
  selectedStatus.value = status
}

// 更新订单状态
const handleStatusUpdate = async () => {
  if (!selectedStatus.value || !currentOrder.value) return
  
  try {
    const statusText = getStatusText(selectedStatus.value)
    await ElMessageBox.confirm(`确定要将订单状态更新为"${statusText}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await merchantApi.updateOrderStatus(currentOrder.value.id, selectedStatus.value)
    if (response.success) {
      ElMessage.success('订单状态更新成功')
      loadOrders()
      // 刷新订单详情
      const detailResponse = await merchantApi.getOrderDetail(currentOrder.value.id)
      if (detailResponse.success) {
        currentOrder.value = detailResponse.data
        selectedStatus.value = null
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新订单状态失败:', error)
      ElMessage.error('更新订单状态失败')
    }
  }
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.page = 1
  loadOrders()
}

// 页码改变
const handlePageChange = (page) => {
  pagination.page = page
  loadOrders()
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    1: 'info',
    2: 'warning',
    3: 'primary',
    4: 'success',
    5: 'info',
    6: 'warning',
    7: 'warning',
    8: 'success'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    1: '待付款',
    2: '待发货',
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
  return textMap[status] || '未知'
}

// 获取支付方式文本
const getPaymentMethodText = (method) => {
  const methodMap = {
    wechat: '微信支付',
    alipay: '支付宝',
    balance: '余额支付'
  }
  return methodMap[method] || method
}

// 获取售后类型文本
const getAfterSaleTypeText = (type) => {
  const typeMap = {
    refund: '急速退款',
    return_refund: '退货退款',
    exchange: '换货'
  }
  return typeMap[type] || '未知'
}

// 获取售后状态文本
const getAfterSaleStatusText = (status) => {
  const statusMap = {
    1: '待处理',
    2: '已同意',
    3: '退货中',
    4: '待退款',
    5: '已完成',
    6: '已拒绝'
  }
  return statusMap[status] || '未知'
}

// 获取售后状态类型
const getAfterSaleStatusType = (status) => {
  const typeMap = {
    1: 'warning',
    2: 'success',
    3: 'primary',
    4: 'info',
    5: 'success',
    6: 'danger'
  }
  return typeMap[status] || 'info'
}

// 同意售后
const handleApproveAfterSale = async () => {
  if (!currentOrder.value) return
  
  try {
    await ElMessageBox.confirm('确定要同意该售后申请吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    })
    
    approveLoading.value = true
    const response = await fetch(`/api/orders/${currentOrder.value.id}/after-sale/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('merchant_token')}`
      }
    })
    
    const result = await response.json()
    
    if (result.success) {
      ElMessage.success('已同意售后申请')
      // 刷新订单详情
      const detailResponse = await merchantApi.getOrderDetail(currentOrder.value.id)
      if (detailResponse.success) {
        currentOrder.value = detailResponse.data
      }
      loadOrders()
    } else {
      ElMessage.error(result.message || '操作失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('同意售后失败:', error)
      ElMessage.error('操作失败')
    }
  } finally {
    approveLoading.value = false
  }
}

// 显示拒绝售后对话框
const showRejectDialog = () => {
  rejectForm.value.reject_reason = ''
  rejectDialogVisible.value = true
}

// 拒绝售后
const handleRejectAfterSale = async () => {
  if (!rejectForm.value.reject_reason) {
    ElMessage.warning('请输入拒绝原因')
    return
  }
  
  try {
    rejectLoading.value = true
    const response = await fetch(`/api/orders/${currentOrder.value.id}/after-sale/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('merchant_token')}`
      },
      body: JSON.stringify({
        reject_reason: rejectForm.value.reject_reason
      })
    })
    
    const result = await response.json()
    
    if (result.success) {
      ElMessage.success('已拒绝售后申请')
      rejectDialogVisible.value = false
      // 刷新订单详情
      const detailResponse = await merchantApi.getOrderDetail(currentOrder.value.id)
      if (detailResponse.success) {
        currentOrder.value = detailResponse.data
      }
      loadOrders()
    } else {
      ElMessage.error(result.message || '操作失败')
    }
  } catch (error) {
    console.error('拒绝售后失败:', error)
    ElMessage.error('操作失败')
  } finally {
    rejectLoading.value = false
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.merchant-orders {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-section {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.order-table {
  margin-top: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

h4 {
  margin: 20px 0;
  color: #303133;
}

.status-management {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.status-management h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #409EFF;
}

.status-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.status-selector {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.after-sale-management {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.after-sale-management h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #E6A23C;
}

.after-sale-info {
  margin-top: 15px;
}

.after-sale-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.after-sale-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.return-management {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.return-management h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #E6A23C;
}

.return-info {
  margin-top: 15px;
}

.return-details {
  margin-bottom: 15px;
}

.return-images {
  margin-top: 15px;
}

.return-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.return-confirm {
  margin-top: 15px;
  padding: 15px;
  background: #fff;
  border-radius: 4px;
}

.image-slot {
  color: #c0c4cc;
}
</style>

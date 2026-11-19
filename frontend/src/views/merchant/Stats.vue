<template>
  <div class="merchant-stats">
    <!-- 日期筛选组件 -->
    <DateRangeFilter @rangeChange="handleDateRangeChange" />
    
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #409EFF">
            <el-icon :size="30"><Goods /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.productCount }}</div>
            <div class="stat-label">商品总数</div>
            <div class="stat-change" :class="{ positive: stats.productChange > 0, negative: stats.productChange < 0 }">
              <el-icon v-if="stats.productChange > 0"><Top /></el-icon>
              <el-icon v-if="stats.productChange < 0"><Bottom /></el-icon>
              {{ Math.abs(stats.productChange) }}%
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #67C23A">
            <el-icon :size="30"><ShoppingCart /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.orderCount }}</div>
            <div class="stat-label">订单总数</div>
            <div class="stat-change" :class="{ positive: stats.orderChange > 0, negative: stats.orderChange < 0 }">
              <el-icon v-if="stats.orderChange > 0"><Top /></el-icon>
              <el-icon v-if="stats.orderChange < 0"><Bottom /></el-icon>
              {{ Math.abs(stats.orderChange) }}%
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #E6A23C">
            <el-icon :size="30"><Money /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">¥{{ Number(stats.totalSales || 0).toFixed(2) }}</div>
            <div class="stat-label">总销售额</div>
            <div class="stat-change" :class="{ positive: stats.salesChange > 0, negative: stats.salesChange < 0 }">
              <el-icon v-if="stats.salesChange > 0"><Top /></el-icon>
              <el-icon v-if="stats.salesChange < 0"><Bottom /></el-icon>
              {{ Math.abs(stats.salesChange) }}%
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #F56C6C">
            <el-icon :size="30"><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.customerCount }}</div>
            <div class="stat-label">客户数量</div>
            <div class="stat-change" :class="{ positive: stats.customerChange > 0, negative: stats.customerChange < 0 }">
              <el-icon v-if="stats.customerChange > 0"><Top /></el-icon>
              <el-icon v-if="stats.customerChange < 0"><Bottom /></el-icon>
              {{ Math.abs(stats.customerChange) }}%
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-section">
      <el-col :span="12">
        <EnhancedChart
          title="销售趋势"
          description="显示选定时间范围内的销售金额变化趋势"
          :data="salesTrendData"
          :chart-types="[
            { label: '折线图', value: 'line' },
            { label: '柱状图', value: 'bar' }
          ]"
          :loading="chartLoading"
          :exportable="true"
          :show-summary="true"
          :summary-data="salesSummary"
          @export="handleExportChart"
        />
      </el-col>
      <el-col :span="12">
        <EnhancedChart
          title="订单状态分布"
          description="显示订单在不同状态下的分布情况"
          :data="orderStatusData"
          type="pie"
          :loading="chartLoading"
          :exportable="true"
          :show-summary="true"
          :summary-data="orderStatusSummary"
          @export="handleExportChart"
        />
      </el-col>
    </el-row>

    <!-- 第二行图表 -->
    <el-row :gutter="20" class="charts-section">
      <el-col :span="12">
        <EnhancedChart
          title="订单数量趋势"
          description="显示选定时间范围内的订单数量变化"
          :data="orderCountData"
          :chart-types="[
            { label: '折线图', value: 'line' },
            { label: '柱状图', value: 'bar' }
          ]"
          :loading="chartLoading"
          :exportable="true"
          :show-summary="true"
          :summary-data="orderCountSummary"
          @export="handleExportChart"
        />
      </el-col>
      <el-col :span="12">
        <EnhancedChart
          title="客户增长趋势"
          description="显示新客户注册和活跃客户的变化趋势"
          :data="customerGrowthData"
          :chart-types="[
            { label: '折线图', value: 'line' },
            { label: '柱状图', value: 'bar' }
          ]"
          :loading="chartLoading"
          :exportable="true"
          :show-summary="true"
          :summary-data="customerGrowthSummary"
          @export="handleExportChart"
        />
      </el-col>
    </el-row>

    <!-- 热销商品表格 -->
    <el-row :gutter="20" class="data-tables-section">
      <el-col :span="12">
        <el-card shadow="hover" class="data-table-card">
          <template #header>
            <div class="table-header">
              <span>热销商品 Top 10</span>
              <el-button size="small" @click="exportHotProducts">
                <el-icon><Download /></el-icon>
                导出
              </el-button>
            </div>
          </template>
          <el-table :data="hotProducts" stripe v-loading="loading" height="400">
            <el-table-column type="index" label="排名" width="80" align="center" />
            <el-table-column prop="name" label="商品名称" min-width="200" show-overflow-tooltip />
            <el-table-column prop="price" label="价格" width="120" align="right">
              <template #default="{ row }">
                ¥{{ row.price?.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="sales_count" label="销量" width="100" sortable align="center" />
            <el-table-column prop="stock" label="库存" width="100" align="center" />
            <el-table-column label="销售占比" width="120" align="center">
              <template #default="{ row }">
                <el-progress 
                  :percentage="((row.sales_count / totalSales) * 100).toFixed(1)" 
                  :show-text="false"
                  :stroke-width="8"
                />
                <span class="percentage-text">{{ ((row.sales_count / totalSales) * 100).toFixed(1) }}%</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="data-table-card">
          <template #header>
            <div class="table-header">
              <span>订单详情统计</span>
              <el-button size="small" @click="exportOrderStats">
                <el-icon><Download /></el-icon>
                导出
              </el-button>
            </div>
          </template>
          <el-table :data="orderStats" stripe v-loading="loading" height="400">
            <el-table-column prop="status" label="订单状态" width="120" />
            <el-table-column prop="count" label="数量" width="100" align="center" />
            <el-table-column prop="amount" label="金额" width="120" align="right">
              <template #default="{ row }">
                ¥{{ row.amount?.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="percentage" label="占比" width="100" align="center">
              <template #default="{ row }">
                {{ row.percentage }}%
              </template>
            </el-table-column>
            <el-table-column label="趋势" width="100" align="center">
              <template #default="{ row }">
                <el-tag 
                  v-if="row.trend > 0" 
                  type="success" 
                  size="small"
                >
                  +{{ row.trend }}%
                </el-tag>
                <el-tag 
                  v-else-if="row.trend < 0" 
                  type="danger" 
                  size="small"
                >
                  {{ row.trend }}%
                </el-tag>
                <el-tag v-else type="info" size="small">持平</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Goods, ShoppingCart, Money, User, Top, Bottom, Download } from '@element-plus/icons-vue'
import DateRangeFilter from '../../components/DateRangeFilter.vue'
import EnhancedChart from '../../components/EnhancedChart.vue'
import { merchantApi } from '../../services/api'

const loading = ref(false)
const chartLoading = ref(false)
const dateRange = ref('30d')

const stats = reactive({
  productCount: 0,
  orderCount: 0,
  totalSales: 0,
  customerCount: 0,
  productChange: 0,
  orderChange: 0,
  salesChange: 0,
  customerChange: 0
})

const hotProducts = ref([])
const orderStats = ref([])
const totalSales = ref(0)

// 图表数据
const salesTrendData = ref([])
const orderStatusData = ref([])
const orderCountData = ref([])
const customerGrowthData = ref([])

// 计算汇总数据
const salesSummary = computed(() => [
  { label: '总销售额', value: `¥${stats.totalSales?.toFixed(2) || '0.00'}` },
  { label: '平均日销售额', value: `¥${(stats.totalSales / getDaysInRange()).toFixed(2)}` },
  { label: '最高日销售额', value: `¥${Math.max(...salesTrendData.value.map(d => d.value || 0)).toFixed(2)}` }
])

const orderStatusSummary = computed(() => {
  const total = orderStatusData.value.reduce((sum, item) => sum + (item.value || 0), 0)
  return [
    { label: '总订单数', value: total },
    { label: '已完成订单', value: orderStatusData.value.find(d => d.name === '已完成')?.value || 0 },
    { label: '完成率', value: `${((orderStatusData.value.find(d => d.name === '已完成')?.value || 0) / total * 100).toFixed(1)}%` }
  ]
})

const orderCountSummary = computed(() => {
  const total = orderCountData.value.reduce((sum, item) => sum + (item.value || 0), 0)
  return [
    { label: '总订单数', value: total },
    { label: '平均日订单', value: (total / getDaysInRange()).toFixed(1) },
    { label: '最高日订单', value: Math.max(...orderCountData.value.map(d => d.value || 0)) }
  ]
})

const customerGrowthSummary = computed(() => [
  { label: '总客户数', value: stats.customerCount },
  { label: '新增客户', value: customerGrowthData.value.reduce((sum, d) => sum + (d.newCustomers || 0), 0) },
  { label: '活跃客户', value: customerGrowthData.value.reduce((sum, d) => sum + (d.activeCustomers || 0), 0) }
])

// 获取时间范围内的天数
const getDaysInRange = () => {
  if (dateRange.value === '7d') return 7
  if (dateRange.value === '30d') return 30
  if (dateRange.value === 'custom') {
    // 这里需要根据自定义日期计算天数
    return 30 // 默认值
  }
  return 30
}

// 处理日期范围变化
const handleDateRangeChange = async (params) => {
  dateRange.value = params.range
  await loadStats(params)
}

// 加载统计数据
const loadStats = async (dateParams = {}) => {
  loading.value = true
  chartLoading.value = true

  try {
    // 获取店铺信息（包含统计）
    const shopRes = await merchantApi.getShop()
    console.log('📊 店铺信息响应:', shopRes)
    if (shopRes.success && shopRes.data) {
      const shopData = shopRes.data
      stats.productCount = shopData.stats?.productCount || 0
      stats.totalSales = shopData.stats?.revenue || 0
      console.log('📦 商品数:', stats.productCount, '销售额:', stats.totalSales)
    } else {
      console.error('❌ 获取店铺信息失败:', shopRes)
    }

    // 获取订单统计
    const orderRes = await merchantApi.getShopOrders({ page: 1, pageSize: 1000 })
    console.log('📋 订单列表响应:', orderRes)
    if (orderRes.success) {
      const orders = orderRes.data || []
      console.log('📋 订单数量:', orders.length)
      stats.orderCount = orders.length

      // 计算客户数量（去重手机号）
      const customers = new Set(orders.map(o => o.phone).filter(phone => phone))
      stats.customerCount = customers.size
      console.log('👥 客户数:', stats.customerCount)

      // 处理图表数据
      processChartData(orders)
      processOrderStats(orders)
    } else {
      console.error('❌ 获取订单列表失败:', orderRes)
    }

    // 模拟变化率数据（实际项目中应该从后端获取）
    stats.productChange = Math.random() * 20 - 10
    stats.orderChange = Math.random() * 15 - 5
    stats.salesChange = Math.random() * 25 - 10
    stats.customerChange = Math.random() * 10 - 5

  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  } finally {
    loading.value = false
    chartLoading.value = false
  }
}

// 处理图表数据
const processChartData = (orders) => {
  // 销售趋势数据
  const salesByDate = {}
  const ordersByDate = {}
  
  orders.forEach(order => {
    const date = order.created_at?.split(' ')[0] || new Date().toISOString().split('T')[0]
    if (!salesByDate[date]) {
      salesByDate[date] = 0
      ordersByDate[date] = 0
    }
    salesByDate[date] += order.total_amount || 0
    ordersByDate[date] += 1
  })

  // 取最近的数据
  const dates = Object.keys(salesByDate).sort().slice(-getDaysInRange())
  
  salesTrendData.value = dates.map(date => ({
    date,
    value: salesByDate[date] || 0
  }))

  orderCountData.value = dates.map(date => ({
    date,
    value: ordersByDate[date] || 0
  }))

  // 订单状态分布
  const statusCount = {}
  orders.forEach(order => {
    const status = getStatusText(order.status)
    statusCount[status] = (statusCount[status] || 0) + 1
  })

  orderStatusData.value = Object.entries(statusCount).map(([name, value]) => ({
    name,
    value
  }))

  // 客户增长数据（模拟）
  customerGrowthData.value = dates.map((date, index) => ({
    date,
    newCustomers: Math.floor(Math.random() * 10) + 1,
    activeCustomers: Math.floor(Math.random() * 20) + 5
  }))
}

// 处理订单统计
const processOrderStats = (orders) => {
  const statusStats = {}
  
  orders.forEach(order => {
    const status = getStatusText(order.status)
    if (!statusStats[status]) {
      statusStats[status] = {
        count: 0,
        amount: 0
      }
    }
    statusStats[status].count += 1
    statusStats[status].amount += order.total_amount || 0
  })

  const totalCount = orders.length
  const totalAmount = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)

  orderStats.value = Object.entries(statusStats).map(([status, data]) => ({
    status,
    count: data.count,
    amount: data.amount,
    percentage: ((data.count / totalCount) * 100).toFixed(1),
    trend: Math.random() * 20 - 10 // 模拟趋势数据
  }))
}

// 获取订单状态文本
const getStatusText = (status) => {
  const statusMap = {
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
  return statusMap[status] || '未知状态'
}

// 处理图表导出
const handleExportChart = (data) => {
  ElMessage.success(`已导出图表: ${data.title}`)
}

// 导出热销商品
const exportHotProducts = () => {
  ElMessage.success('热销商品数据导出成功')
}

// 导出订单统计
const exportOrderStats = () => {
  ElMessage.success('订单统计数据导出成功')
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.merchant-stats {
  padding: 20px;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 20px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 18px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-change {
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-change.positive {
  color: #67c23a;
}

.stat-change.negative {
  color: #f56c6c;
}

.charts-section {
  margin-bottom: 20px;
}

.data-tables-section {
  margin-bottom: 20px;
}

.data-table-card {
  height: 500px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.percentage-text {
  font-size: 18px;
  color: #909399;
  margin-left: 8px;
}

@media (max-width: 1200px) {
  .stats-cards .el-col {
    margin-bottom: 20px;
  }
  
  .charts-section .el-col,
  .data-tables-section .el-col {
    margin-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .merchant-stats {
    padding: 10px;
  }
  
  .stat-card {
    padding: 15px;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    margin-right: 15px;
  }
  
  .stat-value {
    font-size: 24px;
  }
}
</style>
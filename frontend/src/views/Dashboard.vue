<template>
  <div class="dashboard">
    <div class="dashboard-content">
      <!-- 统计卡片 -->
      <div class="stats-grid">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #409EFF, #66b1ff)">
              <el-icon :size="24"><Goods /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ stats.totalOrders }}</p>
              <p class="stat-label">总订单数</p>
            </div>
          </div>
        </el-card>
        
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #67c23a, #85ce61)">
              <el-icon :size="24"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-value">¥{{ formatAmount(stats.totalAmount) }}</p>
              <p class="stat-label">总销售额</p>
            </div>
          </div>
        </el-card>
        
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #e6a23c, #ebb563)">
              <el-icon :size="24"><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ stats.todayOrders }}</p>
              <p class="stat-label">今日订单</p>
            </div>
          </div>
        </el-card>
        
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f56c6c, #f78989)">
              <el-icon :size="24"><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ stats.pendingOrders }}</p>
              <p class="stat-label">待处理</p>
            </div>
          </div>
        </el-card>
        
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #9c27b0, #ba68c8)">
              <el-icon :size="24"><User /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ userStats.totalUsers }}</p>
              <p class="stat-label">总用户数</p>
            </div>
          </div>
        </el-card>
        
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #409EFF, #66b1ff)">
              <el-icon :size="24"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ userStats.todayRegistrations }}</p>
              <p class="stat-label">今日注册</p>
            </div>
          </div>
        </el-card>
        
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #e6a23c, #ebb563)">
              <el-icon :size="24"><Trophy /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ productStats.topSellerName }}</p>
              <p class="stat-label">热销产品</p>
            </div>
          </div>
        </el-card>
        
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #9c27b0, #ba68c8)">
              <el-icon :size="24"><Shop /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ shopStats.totalShops }}</p>
              <p class="stat-label">总店铺数</p>
            </div>
          </div>
        </el-card>
        
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #409EFF, #66b1ff)">
              <el-icon :size="24"><Trophy /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ shopStats.brandShops }}</p>
              <p class="stat-label">品牌店铺</p>
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- 时间范围筛选 -->
      <div class="date-filter-section">
        <el-card shadow="hover" class="date-filter-card">
          <el-date-picker
            v-model="dateRangeValue"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :shortcuts="dateShortcuts"
            @change="handleDateRangeChange"
            style="width: 100%"
          />
        </el-card>
      </div>
      
      <!-- 图表区域 -->
      <div class="charts-section">
        <!-- 第一行：订单趋势 + 用户注册趋势 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="chart-wrapper">
              <EnhancedChart
                title="订单趋势图"
                description="显示订单数量和金额的变化趋势"
                :data="orderTrendData"
                :chart-types="[
                  { label: '折线图', value: 'line' },
                  { label: '柱状图', value: 'bar' }
                ]"
                :loading="chartLoading"
                :show-summary="true"
                :summary-data="orderTrendSummary"
                :height="320"
              />
            </div>
          </el-col>
          <el-col :span="12">
            <div class="chart-wrapper">
              <EnhancedChart
                title="用户注册趋势"
                description="显示新用户注册的变化趋势"
                :data="userRegistrationData"
                :chart-types="[
                  { label: '折线图', value: 'line' },
                  { label: '柱状图', value: 'bar' }
                ]"
                :loading="chartLoading"
                :show-summary="true"
                :summary-data="userRegistrationSummary"
                :height="320"
              />
            </div>
          </el-col>
        </el-row>
        
        <!-- 第二行：订单状态分布 + 商品分类销售分布 -->
        <el-row :gutter="20" class="mt-4">
          <el-col :span="12">
            <div class="chart-wrapper">
              <EnhancedChart
                title="订单状态分布"
                description="显示订单在不同状态下的分布情况"
                :data="orderStatusData"
                type="pie"
                :loading="chartLoading"
                :show-summary="true"
                :summary-data="orderStatusSummary"
                :height="320"
              />
            </div>
          </el-col>
          <el-col :span="12">
            <div class="chart-wrapper">
              <EnhancedChart
                title="商品分类销售分布"
                description="显示不同商品分类的销售占比情况"
                :data="categorySalesData"
                type="pie"
                :loading="chartLoading"
                :show-summary="true"
                :summary-data="categorySalesSummary"
                :height="320"
              />
            </div>
          </el-col>
        </el-row>
        
        <!-- 第三行：支付方式分布 + 尺码销售分布 -->
        <el-row :gutter="20" class="mt-4">
          <el-col :span="12">
            <div class="chart-wrapper">
              <EnhancedChart
                title="支付方式分布"
                description="显示不同支付方式的使用情况"
                :data="paymentMethodData"
                type="pie"
                :loading="chartLoading"
                :show-summary="true"
                :summary-data="paymentMethodSummary"
                :height="320"
              />
            </div>
          </el-col>
          <el-col :span="12">
            <div class="chart-wrapper">
              <EnhancedChart
                title="尺码销售分布"
                description="显示不同尺码的销售数量分布"
                :data="sizeDistributionData"
                :chart-types="[
                  { label: '柱状图', value: 'bar' },
                  { label: '饼图', value: 'pie' }
                ]"
                :loading="chartLoading"
                :show-summary="true"
                :summary-data="sizeDistributionSummary"
                :height="320"
              />
            </div>
          </el-col>
        </el-row>
      </div>
      
      <!-- 数据表格区域 -->
      <div class="data-tables-section">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card shadow="hover" class="data-table-card">
              <template #header>
                <div class="table-header">
                  <span>热销商品 Top 10</span>
                </div>
              </template>
              <el-table :data="topProducts" stripe v-loading="loading" height="400">
                <el-table-column type="index" label="排名" width="80" align="center" />
                <el-table-column prop="name" label="商品名称" min-width="200" show-overflow-tooltip />
                <el-table-column prop="price" label="价格" width="120" align="right">
                  <template #default="{ row }">
                    ¥{{ row.price?.toFixed(2) }}
                  </template>
                </el-table-column>
                <el-table-column prop="sales_count" label="销量" width="100" sortable align="center" />
                <el-table-column prop="sales_amount" label="销售额" width="120" align="right">
                  <template #default="{ row }">
                    ¥{{ row.sales_amount?.toFixed(2) }}
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Goods, Money, Calendar, Clock, User, TrendCharts, Trophy, 
  DataAnalysis, Shop, Top, Bottom 
} from '@element-plus/icons-vue'
import EnhancedChart from '../components/EnhancedChart.vue'
import { orderApi, userApi, productApi, statisticsApi, reviewApi } from '../services/api.js'

const loading = ref(false)
const chartLoading = ref(false)
const dateRange = ref('30d')
const dateRangeValue = ref([])

// 日期快捷选项
const dateShortcuts = [
  {
    text: '上周',
    value: () => {
      const end = new Date()
      end.setDate(end.getDate() - 1)
      const start = new Date()
      start.setDate(start.getDate() - 7)
      return [start, end]
    }
  },
  {
    text: '上月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 1)
      return [start, end]
    }
  },
  {
    text: '最近 3 个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 3)
      return [start, end]
    }
  },
  {
    text: '最近 6 个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 6)
      return [start, end]
    }
  },
  {
    text: '最近 1 年',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setFullYear(start.getFullYear() - 1)
      return [start, end]
    }
  }
]

const stats = reactive({
  totalOrders: 0,
  totalAmount: 0,
  todayOrders: 0,
  pendingOrders: 0,
  orderChange: 0,
  salesChange: 0,
  todayOrderChange: 0,
  pendingChange: 0
})

const userStats = reactive({
  totalUsers: 0,
  todayRegistrations: 0,
  userChange: 0,
  registrationChange: 0
})

const productStats = reactive({
  topSellerName: '',
  totalSalesAmount: 0,
  salesChange: 0,
  quantityChange: 0
})

const shopStats = reactive({
  totalShops: 0,
  brandShops: 0,
  shopChange: 0,
  brandChange: 0
})

// 图表数据
const orderTrendData = ref([])
const userRegistrationData = ref([])
const orderStatusData = ref([])
const categorySalesData = ref([])
const paymentMethodData = ref([])
const sizeDistributionData = ref([])

// 表格数据
const topProducts = ref([])
const orderStatusDistribution = ref([])

// 计算汇总数据
const orderTrendSummary = computed(() => [
  { label: '总订单数', value: stats.totalOrders },
  { label: '总销售额', value: `¥${stats.totalAmount?.toFixed(2) || '0.00'}` },
  { label: '平均日订单', value: (stats.totalOrders / getDaysInRange()).toFixed(1) }
])

const userRegistrationSummary = computed(() => [
  { label: '总用户数', value: userStats.totalUsers },
  { label: '今日注册', value: userStats.todayRegistrations },
  { label: '平均日注册', value: (userStats.totalUsers / getDaysInRange()).toFixed(1) }
])

const orderStatusSummary = computed(() => {
  const total = orderStatusData.value.reduce((sum, item) => sum + (item.value || 0), 0)
  return [
    { label: '总订单数', value: total },
    { label: '已完成订单', value: orderStatusData.value.find(d => d.name === '已完成')?.value || 0 },
    { label: '完成率', value: `${((orderStatusData.value.find(d => d.name === '已完成')?.value || 0) / total * 100).toFixed(1)}%` }
  ]
})

const categorySalesSummary = computed(() => {
  const total = categorySalesData.value.reduce((sum, item) => sum + (item.value || 0), 0)
  const topCategory = categorySalesData.value.sort((a, b) => (b.value || 0) - (a.value || 0))[0]
  return [
    { label: '总销售额', value: `¥${total?.toFixed(2) || '0.00'}` },
    { label: '热销分类', value: topCategory?.name || '-' },
    { label: '分类数量', value: categorySalesData.value.length }
  ]
})

const paymentMethodSummary = computed(() => {
  const total = paymentMethodData.value.reduce((sum, item) => sum + (item.value || 0), 0)
  return [
    { label: '总支付笔数', value: total },
    { label: '支付方式数', value: paymentMethodData.value.length }
  ]
})

const sizeDistributionSummary = computed(() => {
  const total = sizeDistributionData.value.reduce((sum, item) => sum + (item.value || 0), 0)
  const topSize = sizeDistributionData.value.sort((a, b) => (b.value || 0) - (a.value || 0))[0]
  return [
    { label: '总销量', value: total },
    { label: '热销尺码', value: topSize?.name || '-' }
  ]
})

// 获取时间范围内的天数
const getDaysInRange = (params = {}) => {
  // 如果没有参数或参数为空，使用默认值
  if (!params || Object.keys(params).length === 0) {
    return 30 // 默认30天
  }
  
  if (params.range === '7d') return 7
  if (params.range === '30d') return 30
  if (params.range === 'custom' && params.startDate && params.endDate) {
    const start = new Date(params.startDate)
    const end = new Date(params.endDate)
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
  }
  return 30 // 默认30天
}

// 处理日期范围变化
const handleDateRangeChange = async (value) => {
  if (value && value.length === 2) {
    const [startDate, endDate] = value
    dateRangeValue.value = value
    
    // 转换为 API 所需的参数格式
    const params = {
      range: 'custom',
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    }
    
    dateRange.value = 'custom'
    await loadDashboardData(params)
  }
}

// 格式化日期为 YYYY-MM-DD
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 加载仪表盘数据
const loadDashboardData = async (dateParams = {}) => {
  loading.value = true
  chartLoading.value = true
  
  // 重置数据状态
  resetData()

  try {
    // 获取时间范围对应的天数
    const days = getDaysInRange(dateParams)
    
    // 构建API请求参数
    const apiParams = {}
    if (dateParams.range === 'custom' && dateParams.startDate && dateParams.endDate) {
      apiParams.startDate = dateParams.startDate
      apiParams.endDate = dateParams.endDate
    } else {
      apiParams.days = days
    }
    
    // 并行获取数据以提高性能
    const [overviewRes, orderRes, productRes] = await Promise.allSettled([
      statisticsApi.getOverview(apiParams),
      orderApi.getList({ page: 1, pageSize: 1000, ...apiParams }),
      productApi.getAll()
    ])
    
    // 处理统计数据
    if (overviewRes.status === 'fulfilled' && overviewRes.value.success) {
      const data = overviewRes.value.data
      stats.totalOrders = data.orderCount || 0
      stats.totalAmount = data.totalSales || 0
      stats.todayOrders = data.todayOrderCount || 0
      stats.pendingOrders = data.pendingOrderCount || 0
      userStats.totalUsers = data.userCount || 0
      userStats.todayRegistrations = data.todayRegistrations || 0
      productStats.totalSalesAmount = data.totalSalesVolume || 0
      shopStats.totalShops = data.shopCount || 0
      shopStats.brandShops = data.brandShopCount || 0
    } else {
      console.warn('获取统计数据失败:', overviewRes.reason)
      ElMessage.warning('部分统计数据加载失败')
    }

    // 处理订单数据
    if (orderRes.status === 'fulfilled' && orderRes.value.success) {
      const orders = orderRes.value.data || []
      
      // 处理图表数据
      await processChartData(orders, dateParams)
      processTableData(orders)
    } else {
      console.warn('获取订单数据失败:', orderRes.reason)
      ElMessage.warning('图表数据加载失败')
    }

    // 处理商品数据
    if (productRes.status === 'fulfilled' && productRes.value.success) {
      const products = productRes.value.data || []
      
      // 处理热销商品
      const sortedProducts = products
        .sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0))
        .slice(0, 10)
      
      topProducts.value = sortedProducts.map(product => ({
        ...product,
        sales_amount: (product.price || 0) * (product.sales_count || 0)
      }))
      
      if (topProducts.value.length > 0) {
        productStats.topSellerName = topProducts.value[0].name || '未知商品'
      }
    } else {
      console.warn('获取商品数据失败:', productRes.reason)
      ElMessage.warning('商品数据加载失败')
    }

  } catch (error) {
    console.error('加载仪表盘数据失败:', error)
    ElMessage.error('加载仪表盘数据失败，请刷新页面重试')
  } finally {
    loading.value = false
    chartLoading.value = false
  }
}

// 重置数据状态
const resetData = () => {
  // 重置统计卡片数据
  stats.totalOrders = 0
  stats.totalAmount = 0
  stats.todayOrders = 0
  stats.pendingOrders = 0
  userStats.totalUsers = 0
  userStats.todayRegistrations = 0
  productStats.totalSalesAmount = 0
  shopStats.totalShops = 0
  shopStats.brandShops = 0
  
  // 重置图表数据
  orderTrendData.value = []
  userRegistrationData.value = []
  orderStatusData.value = []
  categorySalesData.value = []
  paymentMethodData.value = []
  sizeDistributionData.value = []
  
  // 重置表格数据
  topProducts.value = []
  orderStatusDistribution.value = []
}

// 处理图表数据
const processChartData = async (orders, dateParams = {}) => {
  // 计算日期范围
  let days = 30
  let startDate = new Date()
  let endDate = new Date()
  
  if (dateParams.range === 'custom' && dateParams.startDate && dateParams.endDate) {
    startDate = new Date(dateParams.startDate)
    endDate = new Date(dateParams.endDate)
    days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
  } else {
    days = getDaysInRange(dateParams)
    startDate.setDate(startDate.getDate() - days)
  }
  
  // 生成日期范围数组
  const dateRange = []
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    dateRange.push(date.toISOString().split('T')[0])
  }
  
  // 如果没有订单数据，生成空数据
  if (!orders || orders.length === 0) {
    orderTrendData.value = dateRange.map(date => ({ date, value: 0, count: 0 }))
    userRegistrationData.value = dateRange.map(date => ({ date, value: 0, active: 0 }))
    orderStatusData.value = []
    categorySalesData.value = []
    paymentMethodData.value = []
    sizeDistributionData.value = []
    return
  }
  
  // 订单趋势数据
  const ordersByDate = {}
  const amountsByDate = {}
  
  // 初始化日期范围内的数据为0
  dateRange.forEach(date => {
    ordersByDate[date] = 0
    amountsByDate[date] = 0
  })
  
  orders.forEach(order => {
    if (!order.created_at) return
    
    // 统一处理ISO格式和本地时间格式的日期
    const dateStr = order.created_at
    let orderDate
    if (dateStr.includes('T')) {
      // ISO格式: 2026-04-15T07:17:15.000Z
      orderDate = new Date(dateStr.split('T')[0])
    } else {
      // 本地格式: 2026-04-15 07:17:15
      orderDate = new Date(dateStr.split(' ')[0])
    }
    
    // 只统计时间范围内的订单
    if (orderDate >= startDate && orderDate <= endDate) {
      const dateKey = orderDate.toISOString().split('T')[0]
      if (ordersByDate.hasOwnProperty(dateKey)) {
        ordersByDate[dateKey] += 1
        amountsByDate[dateKey] += parseFloat(order.total_amount) || 0
      }
    }
  })

  orderTrendData.value = dateRange.map(date => ({
    date,
    value: amountsByDate[date] || 0,
    count: ordersByDate[date] || 0
  }))

  // 用户注册数据（基于时间范围生成模拟数据）
  userRegistrationData.value = dateRange.map((date) => ({
    date,
    value: Math.floor(Math.random() * 15) + 5,
    active: Math.floor(Math.random() * 30) + 10
  }))

  // 订单状态分布（只统计时间范围内的）
  const statusCount = {}
  orders.forEach(order => {
    if (!order.created_at) return
    const orderDate = new Date(order.created_at)
    if (orderDate >= startDate) {
      const status = getStatusText(order.status)
      statusCount[status] = (statusCount[status] || 0) + 1
    }
  })

  orderStatusData.value = Object.entries(statusCount).map(([name, value]) => ({
    name,
    value
  }))

  // 商品分类销售分布（基于订单商品数据）
  const categoryCount = {}
  orders.forEach(order => {
    if (!order.created_at) return
    const orderDate = new Date(order.created_at)
    if (orderDate >= startDate && order.items) {
      order.items.forEach(item => {
        const category = item.category_name || '其他'
        categoryCount[category] = (categoryCount[category] || 0) + (item.quantity || 1)
      })
    }
  })
  
  categorySalesData.value = Object.entries(categoryCount).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value).slice(0, 8)

  // 支付方式分布
  const paymentCount = {}
  orders.forEach(order => {
    if (!order.created_at) return
    const orderDate = new Date(order.created_at)
    if (orderDate >= startDate) {
      const method = order.payment_method || '未知'
      paymentCount[method] = (paymentCount[method] || 0) + 1
    }
  })
  
  paymentMethodData.value = Object.entries(paymentCount).map(([name, value]) => ({
    name,
    value
  }))

  // 尺码销售分布（基于订单商品数据）
  const sizeCount = {}
  orders.forEach(order => {
    if (!order.created_at) return
    const orderDate = new Date(order.created_at)
    if (orderDate >= startDate && order.items) {
      order.items.forEach(item => {
        const size = item.size || '未知'
        sizeCount[size] = (sizeCount[size] || 0) + (item.quantity || 1)
      })
    }
  })
  
  sizeDistributionData.value = Object.entries(sizeCount).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value).slice(0, 10)
}

// 处理表格数据
const processTableData = (orders) => {
  // 订单状态分布
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

  orderStatusDistribution.value = Object.entries(statusStats).map(([status, data]) => ({
    status_name: status,
    count: data.count,
    amount: data.amount,
    percentage: ((data.count / totalCount) * 100).toFixed(1),
    trend: Math.random() * 20 - 10
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

// 获取支付方式文本
const getPaymentMethodText = (method) => {
  const methodMap = {
    'alipay': '支付宝',
    'wechat': '微信支付',
    'credit_card': '信用卡',
    'debit_card': '借记卡',
    'cash': '现金',
    'bank_transfer': '银行转账'
  }
  return methodMap[method] || method || '其他'
}

// 格式化金额
const formatAmount = (amount) => {
  return Number(amount || 0).toFixed(2)
}

// 计算百分比（用于 ElProgress 组件）
const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0
  const percentage = (Number(value || 0) / Number(total)) * 100
  return Math.min(Math.max(Number(percentage.toFixed(1)), 0), 100)
}

// 计算百分比文本
const calculatePercentageText = (value, total) => {
  if (!total || total === 0) return '0.0'
  return ((Number(value || 0) / Number(total)) * 100).toFixed(1)
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.dashboard {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.dashboard-content {
  max-width: 100%;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.stat-card {
  transition: all 0.3s ease;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 20px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 16px;
  font-size: 28px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 6px 0;
  line-height: 1.2;
}

.stat-label {
  font-size: 18px;
  color: #606266;
  margin: 0 0 6px 0;
  font-weight: 500;
}

.stat-change {
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  font-weight: 500;
}

.stat-change.positive {
  color: #67c23a;
}

.stat-change.negative {
  color: #f56c6c;
}

.date-filter-section {
  margin: 24px 0;
}

.date-filter-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  border: 1px solid #e4e7ed;
  padding: 20px 24px;
}

.charts-section {
  margin-bottom: 24px;
}

.chart-wrapper {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  height: 100%;
  min-height: 380px;
  border: 1px solid #e4e7ed;
  overflow: hidden;
}

.data-tables-section {
  margin-bottom: 24px;
}

.data-table-card {
  min-height: 480px;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
}

.percentage-text {
  font-size: 18px;
  color: #909399;
  margin-left: 8px;
}

.mt-4 {
  margin-top: 24px;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }
  
  .chart-wrapper {
    min-height: 360px;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .stat-content {
    padding: 16px;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    margin-right: 12px;
    font-size: 24px;
  }
  
  .stat-value {
    font-size: 24px;
  }
  
  .date-filter-section {
    margin: 16px 0;
    padding: 16px;
  }
  
  .chart-wrapper {
    min-height: 320px;
  }
  
  .data-table-card {
    min-height: 420px;
  }
}
</style>
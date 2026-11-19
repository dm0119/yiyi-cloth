<template>
  <div class="merchant-dashboard" v-loading="loading">
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #409EFF">
            <el-icon :size="30"><Goods /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.productCount }}</div>
            <div class="stat-label">商品总数</div>
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
            <div class="stat-label">客户数</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="stats-cards" style="margin-top: 20px">
      <el-col :span="12">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-info">
            <div class="stat-value">¥{{ Number(stats.todaySales || 0).toFixed(2) }}</div>
            <div class="stat-label">今日销售额</div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-info">
            <div class="stat-value">¥{{ Number(stats.monthSales || 0).toFixed(2) }}</div>
            <div class="stat-label">本月销售额</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div class="date-filter-section">
      <el-card shadow="hover" class="date-filter-card">
        <el-date-picker
          v-model="dateRangeValue"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :shortcuts="dateShortcuts"
          :default-time="[new Date(2000, 0, 1, 0, 0, 0), new Date(2000, 0, 1, 23, 59, 59)]"
          :unlink-panels="true"
          @change="handleDateRangeChange"
          style="width: 100%"
        />
      </el-card>
    </div>

    <el-row :gutter="20" class="content-row">
      <el-col :span="12">
        <el-card class="equal-height-card">
          <template #header>
            <div class="card-header">
              <span>待处理订单 ({{ stats.pendingOrders }})</span>
              <el-button size="small" @click="viewOrder(null)">查看全部</el-button>
            </div>
          </template>
          <el-empty v-if="pendingOrders.length === 0" description="暂无待处理订单" />
          <el-table v-else :data="pendingOrders" stripe style="width: 100%">
            <el-table-column prop="id" label="订单号" width="120" />
            <el-table-column prop="customer_name" label="客户" width="100" />
            <el-table-column label="金额" width="100">
              <template #default="{ row }">
                <span style="color: #f56c6c; font-weight: bold">
                  ¥{{ Number(row.total_amount || 0).toFixed(2) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="下单时间" width="160">
              <template #default="{ row }">
                {{ formatDateTime(row.created_at) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="viewOrder(row)">
                  查看
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="equal-height-card">
          <template #header>
            <div class="card-header">
              <span>店铺信息</span>
              <el-button type="primary" size="small" @click="editShop">
                编辑
              </el-button>
            </div>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="店铺名称">{{ shop.name }}</el-descriptions-item>
            <el-descriptions-item label="店铺状态">
              <el-tag :type="shop.status === 'active' ? 'success' : 'danger'">
                {{ shop.status === 'active' ? '营业中' : '已关闭' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ shop.contact_phone || shop.contactPhone }}</el-descriptions-item>
            <el-descriptions-item label="联系邮箱">{{ shop.contact_email || shop.contactEmail }}</el-descriptions-item>
            <el-descriptions-item v-if="shop.license_no" label="营业执照号">
              {{ shop.license_no }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDateTime(shop.created_at) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="content-row">
      <el-col :span="12">
        <el-card class="equal-height-card">
          <template #header>
            <span>销量前十商品</span>
          </template>
          <div ref="topProductsChartRef" style="width: 100%; height: 350px;"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="equal-height-card">
          <template #header>
            <span>订单状态分布</span>
          </template>
          <div ref="orderStatusChartRef" style="width: 100%; height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="content-row">
      <el-col :span="24">
        <el-card class="equal-height-card">
          <template #header>
            <span>{{ salesTrendTitle }}</span>
          </template>
          <div ref="salesTrendChartRef" style="width: 100%; height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="content-row">
      <el-col :span="12">
        <el-card class="equal-height-card">
          <template #header>
            <span>近期销售记录</span>
          </template>
          <el-table :data="recentOrders" stripe style="width: 100%" max-height="350">
            <el-table-column prop="id" label="订单号" width="100" />
            <el-table-column prop="customer_name" label="客户" width="100" />
            <el-table-column label="金额" width="100">
              <template #default="{ row }">
                <span style="color: #67C23A; font-weight: bold">
                  ¥{{ Number(row.total_amount || 0).toFixed(2) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="时间" min-width="150">
              <template #default="{ row }">
                {{ formatDateTime(row.created_at) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="equal-height-card">
          <template #header>
            <span>商品类别分布</span>
          </template>
          <div ref="categoryChartRef" style="width: 100%; height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Goods, ShoppingCart, Money, User } from '@element-plus/icons-vue'
import { merchantApi } from '../../services/api'
import { formatDateTime } from '../../utils/dateFormatter'
import * as echarts from 'echarts'

const router = useRouter()

const loading = ref(false)
const dateRange = ref('7d')
const dateRangeValue = ref([])

const dateShortcuts = [
  {
    text: '最近 7 天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 6)
      return [start, end]
    }
  },
  {
    text: '最近 30 天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 29)
      return [start, end]
    }
  },
  {
    text: '本月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(1)
      return [start, end]
    }
  },
  {
    text: '上月',
    value: () => {
      const end = new Date()
      end.setDate(0)
      const start = new Date()
      start.setDate(1)
      start.setMonth(start.getMonth() - 1)
      return [start, end]
    }
  }
]

const stats = reactive({
  productCount: 0,
  orderCount: 0,
  totalSales: 0,
  customerCount: 0,
  pendingOrders: 0,
  todaySales: 0,
  monthSales: 0
})

const pendingOrders = ref([])
const recentOrders = ref([])
const shop = reactive({
  id: null,
  name: '',
  status: 'active',
  contactPhone: '',
  contact_email: '',
  contact_phone: '',
  licenseNo: '',
  license_no: '',
  created_at: ''
})

// 图表引用
const topProductsChartRef = ref(null)
const orderStatusChartRef = ref(null)
const salesTrendChartRef = ref(null)
const categoryChartRef = ref(null)

// 图表实例
let topProductsChart = null
let orderStatusChart = null
let salesTrendChart = null
let categoryChart = null

const salesTrendTitle = computed(() => {
  if (dateRange.value === 'custom' && dateRangeValue.value && dateRangeValue.value.length === 2) {
    const start = dateRangeValue.value[0]
    const end = dateRangeValue.value[1]
    const startStr = `${start.getMonth() + 1}/${start.getDate()}`
    const endStr = `${end.getMonth() + 1}/${end.getDate()}`
    return `${startStr}-${endStr} 销售趋势`
  } else if (dateRange.value === '7d') {
    return '近 7 日销售趋势'
  } else if (dateRange.value === '30d') {
    return '近 30 日销售趋势'
  } else if (dateRange.value === 'month') {
    return '本月销售趋势'
  } else {
    return '销售趋势'
  }
})

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

const getStatusType = (status) => {
  const typeMap = {
    1: 'info',
    2: 'warning',
    3: 'primary',
    4: 'success',
    5: 'success',
    6: 'info',
    7: 'danger',
    8: 'danger'
  }
  return typeMap[status] || 'info'
}

const viewOrder = (order) => {
  router.push('/merchant/orders')
}

const editShop = () => {
  router.push('/merchant/shop')
}

// 初始化销量前十商品图表
const initTopProductsChart = (products) => {
  if (!topProductsChartRef.value) return
  
  topProductsChart = echarts.init(topProductsChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '销量'
    },
    yAxis: {
      type: 'category',
      data: products.map(p => p.name.length > 8 ? p.name.substring(0, 8) + '...' : p.name)
    },
    series: [{
      name: '销量',
      type: 'bar',
      data: products.map(p => p.sales_count || 0),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#83bff6' },
          { offset: 0.5, color: '#188df0' },
          { offset: 1, color: '#188df0' }
        ])
      }
    }]
  }
  
  topProductsChart.setOption(option)
}

// 初始化订单状态分布图表
const initOrderStatusChart = (orders) => {
  if (!orderStatusChartRef.value) return
  
  orderStatusChart = echarts.init(orderStatusChartRef.value)
  
  // 统计各状态订单数
  const statusCount = {}
  orders.forEach(order => {
    const status = getStatusText(order.status)
    statusCount[status] = (statusCount[status] || 0) + 1
  })
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [{
      name: '订单状态',
      type: 'pie',
      radius: '50%',
      data: Object.keys(statusCount).map(key => ({
        name: key,
        value: statusCount[key]
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }
  
  orderStatusChart.setOption(option)
}

// 初始化销售趋势图表
const initSalesTrendChart = (orders, dateParams = {}) => {
  if (!salesTrendChartRef.value) return
  
  salesTrendChart = echarts.init(salesTrendChartRef.value)
  
  let startDate, endDate
  if (dateParams.range === 'custom' && dateParams.startDate && dateParams.endDate) {
    startDate = new Date(dateParams.startDate)
    endDate = new Date(dateParams.endDate)
  } else {
    endDate = new Date()
    startDate = new Date()
    if (dateParams.range === '7d') {
      startDate.setDate(startDate.getDate() - 6)
    } else if (dateParams.range === '30d') {
      startDate.setDate(startDate.getDate() - 29)
    } else {
      startDate.setDate(1)
    }
  }
  
  const dateRange = []
  const salesData = []
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0]
    dateRange.push(dateStr.substring(5))
    
    const daySales = orders
      .filter(o => new Date(o.created_at).toISOString().split('T')[0] === dateStr)
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
    
    salesData.push(daySales)
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dateRange
    },
    yAxis: {
      type: 'value',
      name: '销售额',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [{
      name: '销售额',
      type: 'line',
      data: salesData,
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
          { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
        ])
      },
      itemStyle: {
        color: '#409EFF'
      }
    }]
  }
  
  salesTrendChart.setOption(option)
}

// 初始化商品类别分布图表
const initCategoryChart = async (shopId) => {
  if (!categoryChartRef.value) return
  
  categoryChart = echarts.init(categoryChartRef.value)
  
  try {
    // 获取所有商品
    const productRes = await merchantApi.getShopProducts(shopId)
    if (!productRes.success) return
    
    const products = productRes.data || []
    
    // 按分类统计（后端返回 categories 数组）
    const categoryCount = {}
    products.forEach(p => {
      if (p.categories && p.categories.length > 0) {
        p.categories.forEach(cat => {
          categoryCount[cat.name] = (categoryCount[cat.name] || 0) + 1
        })
      } else {
        categoryCount['其他'] = (categoryCount['其他'] || 0) + 1
      }
    })
    
    const option = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [{
        name: '商品分类',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: Object.keys(categoryCount).map(key => ({
          name: key,
          value: categoryCount[key]
        }))
      }]
    }
    
    categoryChart.setOption(option)
  } catch (error) {
    console.error('加载商品分类数据失败:', error)
  }
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const handleDateRangeChange = async (value) => {
  console.log('日期选择器变化:', value)
  if (value && value.length === 2) {
    const [startDate, endDate] = value
    console.log('开始日期:', formatDate(startDate))
    console.log('结束日期:', formatDate(endDate))
    dateRangeValue.value = value
    
    dateRange.value = 'custom'
    await loadDashboardData({
      range: 'custom',
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    })
  } else {
    console.log('日期值无效:', value)
  }
}

const loadDashboardData = async (dateParams = {}) => {
  loading.value = true
  try {
    let startDate, endDate
    
    if (dateParams.range === 'custom' && dateParams.startDate && dateParams.endDate) {
      startDate = new Date(dateParams.startDate)
      endDate = new Date(dateParams.endDate)
      endDate.setHours(23, 59, 59, 999)
    } else {
      const today = new Date()
      endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
      
      if (dateParams.range === '7d') {
        startDate = new Date()
        startDate.setDate(startDate.getDate() - 6)
      } else if (dateParams.range === '30d') {
        startDate = new Date()
        startDate.setDate(startDate.getDate() - 29)
      } else {
        startDate = new Date()
        startDate.setDate(1)
      }
    }
    
    const shopRes = await merchantApi.getShop()
    if (shopRes.success && shopRes.data) {
      Object.assign(shop, shopRes.data)

      const shopId = shopRes.data.id

      const productRes = await merchantApi.getShopProducts(shopId)
      if (productRes.success) {
        const products = productRes.data || []
        stats.productCount = products.length
        
        const topProducts = products
          .filter(p => p.sales_count !== undefined)
          .sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0))
          .slice(0, 10)
        
        await nextTick()
        initTopProductsChart(topProducts)
      }

      try {
        const orderRes = await merchantApi.getShopOrders({ page: 1, pageSize: 1000 })
        console.log('订单 API 响应:', orderRes)
        
        if (orderRes && orderRes.success) {
          let allOrders = orderRes.data || []
          console.log(`获取到 ${allOrders.length} 条订单`)
          
          // 统计卡片使用所有订单数据（不受日期范围限制）
          stats.orderCount = allOrders.length
          stats.totalSales = allOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0)

          const allPending = allOrders.filter(o => o.status === 1 || o.status === 2)
          pendingOrders.value = allPending.slice(0, 5)
          stats.pendingOrders = allPending.length

          recentOrders.value = allOrders
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10)

          const today = new Date().toDateString()
          stats.todaySales = allOrders
            .filter(o => new Date(o.created_at).toDateString() === today)
            .reduce((sum, order) => sum + Number(order.total_amount || 0), 0)

          const thisMonth = new Date().getMonth()
          stats.monthSales = allOrders
            .filter(o => new Date(o.created_at).getMonth() === thisMonth)
            .reduce((sum, order) => sum + Number(order.total_amount || 0), 0)

          const customers = new Set(allOrders.map(o => o.phone).filter(p => p))
          stats.customerCount = customers.size
          
          // 图表使用日期范围筛选后的订单
          let orders = allOrders.filter(order => {
            if (!order.created_at) return false
            const orderDate = new Date(order.created_at)
            return orderDate >= startDate && orderDate <= endDate
          })
          
          console.log(`图表数据筛选后 (${formatDate(startDate)} 至 ${formatDate(endDate)}) 剩余 ${orders.length} 条订单`)
          
          // 如果筛选后没有数据，使用所有订单数据
          if (orders.length === 0) {
            console.log('️ 筛选后无数据，使用所有订单数据渲染图表')
            orders = allOrders
          }
          
          initOrderStatusChart(orders)
          
          initSalesTrendChart(orders, dateParams)
          
          await initCategoryChart(shopId)
        } else {
          console.log('订单 API 返回不成功或为空:', orderRes)
          stats.orderCount = 0
          stats.totalSales = 0
          stats.pendingOrders = 0
          stats.todaySales = 0
          stats.monthSales = 0
          stats.customerCount = 0
          pendingOrders.value = []
          recentOrders.value = []
        }
      } catch (error) {
        console.error('获取订单统计失败:', error)
        stats.orderCount = 0
        stats.totalSales = 0
        stats.pendingOrders = 0
        stats.todaySales = 0
        stats.monthSales = 0
        stats.customerCount = 0
        pendingOrders.value = []
        recentOrders.value = []
      }
    }
  } catch (error) {
    console.error('加载 Dashboard 数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 窗口大小改变时的处理函数
const handleResize = () => {
  topProductsChart?.resize()
  orderStatusChart?.resize()
  salesTrendChart?.resize()
  categoryChart?.resize()
}

onMounted(() => {
  loadDashboardData({ range: '7d' })
  
  // 窗口大小改变时重新渲染图表
  window.addEventListener('resize', handleResize)
})

// 组件卸载时销毁图表实例
onUnmounted(() => {
  topProductsChart?.dispose()
  orderStatusChart?.dispose()
  salesTrendChart?.dispose()
  categoryChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.merchant-dashboard h2 {
  margin-bottom: 20px;
  color: #333;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
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
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 18px;
  color: #999;
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

.content-row {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 图表卡片样式 */
.content-row .el-card {
  transition: all 0.3s;
}

.content-row .el-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* 确保同一行的卡片高度一致 */
.content-row {
  display: flex;
  align-items: stretch;
}

.content-row .el-col {
  display: flex;
}

.content-row .equal-height-card {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content-row .equal-height-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-row .equal-height-card :deep(.el-card__header) {
  flex-shrink: 0;
}
</style>

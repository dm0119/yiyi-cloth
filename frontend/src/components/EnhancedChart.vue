<template>
  <div class="enhanced-chart">
    <div class="chart-header">
      <div class="chart-title">
        <h3>{{ title }}</h3>
        <el-tooltip v-if="description" :content="description" placement="top">
          <el-icon><InfoFilled /></el-icon>
        </el-tooltip>
      </div>
      
      <div class="chart-controls">
        <el-select 
          v-if="chartTypes && chartTypes.length > 1" 
          v-model="selectedChartType" 
          size="small"
          @change="handleChartTypeChange"
          class="chart-type-selector"
        >
          <el-option
            v-for="type in chartTypes"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
        
        <el-button 
          v-if="exportable" 
          size="small" 
          @click="handleExport"
          class="export-btn"
        >
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>
    
    <div class="chart-container" v-loading="loading">
      <div ref="chartRef" class="chart" :style="{ height: height + 'px' }"></div>
      
      <div v-if="!data || data.length === 0" class="no-data">
        <el-empty description="暂无数据" />
      </div>
    </div>
    
    <div v-if="showSummary && summaryData" class="chart-summary">
      <div class="summary-item" v-for="item in summaryData" :key="item.label">
        <span class="summary-label">{{ item.label }}：</span>
        <span class="summary-value">{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { InfoFilled, Download } from '@element-plus/icons-vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  data: {
    type: Array,
    default: () => []
  },
  type: {
    type: String,
    default: 'line'
  },
  chartTypes: {
    type: Array,
    default: () => []
  },
  height: {
    type: Number,
    default: 400
  },
  loading: {
    type: Boolean,
    default: false
  },
  exportable: {
    type: Boolean,
    default: false
  },
  showSummary: {
    type: Boolean,
    default: false
  },
  summaryData: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['chartTypeChange', 'export'])

const chartRef = ref(null)
const chartInstance = ref(null)
const selectedChartType = ref(props.type)

// 图表配置映射
const chartConfigs = {
  line: {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
  },
  bar: {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
  },
  pie: {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'middle'
    }
  },
  mixed: {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
  }
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return
  
  if (chartInstance.value) {
    chartInstance.value.dispose()
  }
  
  chartInstance.value = echarts.init(chartRef.value)
  
  // 监听窗口大小变化
  const resizeObserver = new ResizeObserver(() => {
    if (chartInstance.value) {
      chartInstance.value.resize()
    }
  })
  
  resizeObserver.observe(chartRef.value)
  
  onUnmounted(() => {
    resizeObserver.disconnect()
    if (chartInstance.value) {
      chartInstance.value.dispose()
    }
  })
}

// 渲染图表
const renderChart = () => {
  if (!chartInstance.value) {
    console.warn('图表实例未初始化')
    return
  }
  
  if (!props.data || props.data.length === 0) {
    console.log('图表数据为空，跳过渲染')
    // 清空图表显示
    chartInstance.value.clear()
    return
  }
  
  const baseConfig = chartConfigs[selectedChartType.value] || chartConfigs.line
  
  let option = {
    ...baseConfig,
    series: []
  }
  
  // 根据图表类型生成不同的配置
  switch (selectedChartType.value) {
    case 'line':
      option = generateLineChartOption(option)
      break
    case 'bar':
      option = generateBarChartOption(option)
      break
    case 'pie':
      option = generatePieChartOption(option)
      break
    case 'mixed':
      option = generateMixedChartOption(option)
      break
    default:
      option = generateLineChartOption(option)
  }
  
  // 确保折线图和柱状图有 grid 配置
  if (selectedChartType.value !== 'pie' && !option.grid) {
    option.grid = {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
  }
  
  chartInstance.value.setOption(option, true)
}

// 生成折线图配置
const generateLineChartOption = (baseOption) => {
  const xAxisData = props.data.map(item => item.name || item.date)
  const seriesData = props.data.map(item => item.value || item.count)
  
  return {
    ...baseOption,
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: seriesData,
      type: 'line',
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
          { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
        ])
      },
      lineStyle: {
        color: '#409EFF'
      },
      itemStyle: {
        color: '#409EFF'
      }
    }]
  }
}

// 生成柱状图配置
const generateBarChartOption = (baseOption) => {
  const xAxisData = props.data.map(item => item.name || item.date)
  const seriesData = props.data.map(item => item.value || item.count)
  
  return {
    ...baseOption,
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: seriesData,
      type: 'bar',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#409EFF' },
          { offset: 1, color: '#66b1ff' }
        ])
      }
    }]
  }
}

// 生成饼图配置
const generatePieChartOption = (baseOption) => {
  const pieData = props.data.map((item, index) => ({
    value: item.value || item.count,
    name: item.name || `项目${index + 1}`
  }))
  
  // 饼图不需要 grid 配置，需要移除
  const { grid, ...pieBaseOption } = baseOption
  
  return {
    ...pieBaseOption,
    series: [{
      type: 'pie',
      radius: ['35%', '65%'],
      center: ['40%', '50%'],
      data: pieData,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      label: {
        position: 'outside'
      },
      labelLine: {
        length: 10,
        length2: 10
      }
    }]
  }
}

// 生成混合图表配置（双轴：柱状图+折线图）
const generateMixedChartOption = (baseOption) => {
  const xAxisData = props.data.map(item => item.name || item.date)
  const salesData = props.data.map(item => item.sales || item.value || 0)
  const ordersData = props.data.map(item => item.orders || item.count || 0)
  
  return {
    ...baseOption,
    legend: {
      data: ['销售额', '订单量'],
      bottom: 0
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '销售额',
        position: 'left',
        axisLabel: {
          formatter: '¥{value}'
        }
      },
      {
        type: 'value',
        name: '订单量',
        position: 'right',
        axisLabel: {
          formatter: '{value}'
        }
      }
    ],
    series: [
      {
        name: '销售额',
        type: 'bar',
        data: salesData,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#409EFF' },
            { offset: 1, color: '#66b1ff' }
          ])
        }
      },
      {
        name: '订单量',
        type: 'line',
        yAxisIndex: 1,
        data: ordersData,
        smooth: true,
        lineStyle: {
          color: '#67c23a'
        },
        itemStyle: {
          color: '#67c23a'
        }
      }
    ]
  }
}

// 处理图表类型变化
const handleChartTypeChange = (type) => {
  selectedChartType.value = type
  renderChart()
  emit('chartTypeChange', type)
}

// 处理导出
const handleExport = () => {
  if (!chartInstance.value) {
    ElMessage.warning('图表未初始化，无法导出')
    return
  }
  
  const imageData = chartInstance.value.getDataURL({
    type: 'png',
    pixelRatio: 2,
    backgroundColor: '#fff'
  })
  
  const link = document.createElement('a')
  link.download = `${props.title}_${new Date().toISOString().split('T')[0]}.png`
  link.href = imageData
  link.click()
  
  emit('export', { title: props.title, imageData })
}

// 监听数据变化
watch(() => props.data, (newData) => {
  if (newData && newData.length > 0) {
    nextTick(() => {
      renderChart()
    })
  }
}, { deep: true })

// 监听图表类型变化
watch(() => props.type, (newType) => {
  selectedChartType.value = newType
  renderChart()
})

onMounted(() => {
  initChart()
  if (props.data && props.data.length > 0) {
    nextTick(() => {
      renderChart()
    })
  }
})

// 暴露方法供父组件调用
const refreshChart = () => {
  renderChart()
}

defineExpose({
  refreshChart,
  getChartInstance: () => chartInstance.value
})
</script>

<style scoped>
.enhanced-chart {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.chart-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chart-type-selector {
  width: 120px;
}

.chart-container {
  position: relative;
  padding: 10px 20px;
}

.chart {
  width: 100%;
  height: 100%;
  min-height: 250px;
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.chart-summary {
  padding: 16px 20px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.summary-label {
  font-size: 14px;
  color: #606266;
}

.summary-value {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .chart-controls {
    width: 100%;
    justify-content: flex-end;
  }
  
  .chart-container {
    padding: 12px;
  }
}
</style>
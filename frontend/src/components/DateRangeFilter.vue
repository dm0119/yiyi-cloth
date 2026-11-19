<template>
  <div class="date-range-filter">
    <div class="filter-header">
      <span class="filter-title">时间范围</span>
    </div>
    
    <div class="filter-options">
      <el-radio-group v-model="selectedRange" @change="handleRangeChange" class="range-options">
        <el-radio-button value="7d">最近7天</el-radio-button>
        <el-radio-button value="30d">最近30天</el-radio-button>
        <el-radio-button value="custom">自定义</el-radio-button>
      </el-radio-group>
      
      <div v-if="selectedRange === 'custom'" class="custom-date-picker">
        <el-date-picker
          v-model="customDates"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickerOptions"
          @change="handleCustomDateChange"
          class="date-picker"
        />
      </div>
    </div>
    
    <div class="filter-info">
      <span class="current-range">{{ displayRange }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const emit = defineEmits(['rangeChange'])

const selectedRange = ref('30d')
const customDates = ref([])

// 日期选择器配置
const pickerOptions = {
  disabledDate(time) {
    return time.getTime() > Date.now()
  },
  shortcuts: [
    {
      text: '最近一周',
      onClick(picker) {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
        picker.$emit('pick', [start, end])
      }
    },
    {
      text: '最近一个月',
      onClick(picker) {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
        picker.$emit('pick', [start, end])
      }
    },
    {
      text: '最近三个月',
      onClick(picker) {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
        picker.$emit('pick', [start, end])
      }
    }
  ]
}

// 计算显示的时间范围文本
const displayRange = computed(() => {
  if (selectedRange.value === '7d') {
    return '最近7个自然日'
  } else if (selectedRange.value === '30d') {
    return '最近30个自然日'
  } else if (selectedRange.value === 'custom' && customDates.value.length === 2) {
    const start = customDates.value[0]
    const end = customDates.value[1]
    return `${formatDate(start)} 至 ${formatDate(end)}`
  }
  return '请选择时间范围'
})

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 处理范围变化
const handleRangeChange = (range) => {
  if (range !== 'custom') {
    emitRangeChange(range)
  }
}

// 处理自定义日期变化
const handleCustomDateChange = (dates) => {
  if (dates && dates.length === 2) {
    emitRangeChange('custom', dates)
  }
}

// 发出范围变化事件
const emitRangeChange = (range, dates = null) => {
  let params = { range }
  
  if (range === 'custom' && dates) {
    params.startDate = dates[0].toISOString().split('T')[0]
    params.endDate = dates[1].toISOString().split('T')[0]
  }
  
  emit('rangeChange', params)
}

// 监听自定义日期变化
watch(customDates, (newDates) => {
  if (newDates && newDates.length === 2) {
    handleCustomDateChange(newDates)
  }
})

// 暴露方法供父组件调用
const setRange = (range, startDate = null, endDate = null) => {
  selectedRange.value = range
  if (range === 'custom' && startDate && endDate) {
    customDates.value = [new Date(startDate), new Date(endDate)]
  }
}

defineExpose({
  setRange
})
</script>

<style scoped>
.date-range-filter {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.filter-header {
  margin-bottom: 12px;
}

.filter-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.filter-options {
  margin-bottom: 12px;
}

.range-options {
  margin-bottom: 12px;
}

.custom-date-picker {
  margin-top: 12px;
}

.date-picker {
  width: 280px;
}

.filter-info {
  padding-top: 12px;
  border-top: 1px solid #e9ecef;
}

.current-range {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

@media (max-width: 768px) {
  .date-range-filter {
    padding: 12px;
  }
  
  .date-picker {
    width: 100%;
  }
  
  .range-options {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
<template>
  <el-select 
    v-model="selectedValue" 
    :placeholder="placeholder"
    :style="{ width: width }"
    :multiple="multiple"
    :clearable="clearable"
    :filterable="filterable"
    :collapse-tags="collapseTags"
    :collapse-tags-tooltip="collapseTagsTooltip"
    @change="handleChange"
  >
    <el-option
      v-for="category in categoryOptions"
      :key="category.id"
      :label="category.name"
      :value="category.id"
    />
  </el-select>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { categoryApi } from '../services/api.js'

const props = defineProps({
  modelValue: {
    type: [Array, Number, String, null],
    default: () => []
  },
  multiple: {
    type: Boolean,
    default: true
  },
  clearable: {
    type: Boolean,
    default: true
  },
  filterable: {
    type: Boolean,
    default: true
  },
  collapseTags: {
    type: Boolean,
    default: true
  },
  collapseTagsTooltip: {
    type: Boolean,
    default: true
  },
  width: {
    type: String,
    default: '100%'
  },
  placeholder: {
    type: String,
    default: '请选择分类'
  },
  excludeIds: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const selectedValue = ref(props.modelValue)
const categoryOptions = ref([])

const loadCategories = async () => {
  try {
    const res = await categoryApi.getList()
    if (res.success) {
      categoryOptions.value = res.data.filter(cat => !props.excludeIds.includes(cat.id))
    }
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

const handleChange = (value) => {
  selectedValue.value = value
  emit('update:modelValue', value)
  emit('change', value)
}

watch(() => props.modelValue, (newValue) => {
  selectedValue.value = newValue
})

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
/* 样式将继承自Element Plus */
</style>
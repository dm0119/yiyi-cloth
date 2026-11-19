<template>
  <div class="categories-view">
    <div class="page-header">
      <el-button type="primary" @click="openAddModal()">
        + 添加分类
      </el-button>
    </div>
    
    <div class="card">
      <!-- 面包屑导航 -->
      <div class="breadcrumb">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item 
            v-for="(item, index) in breadcrumb" 
            :key="item.id"
            @click="loadCategories(item.id)"
            :class="{ 'breadcrumb-item': true, 'active': index === breadcrumb.length - 1 }"
          >
            {{ item.name }}
          </el-breadcrumb-item>
        </el-breadcrumb>
        <el-button 
          v-if="breadcrumb.length > 1" 
          type="default" 
          size="small" 
          @click="goToParent"
          style="margin-left: 10px"
        >
          ← 回到上级
        </el-button>
      </div>
      
      <!-- 分类标题 -->
      <div class="category-title">
        <h3>{{ breadcrumb[breadcrumb.length - 1]?.name || '所有分类' }}</h3>
      </div>

      <!-- 分类表格 -->
      <el-table 
        ref="categoryTableRef"
        :data="currentCategories" 
        style="width: 100%" 
        stripe
        row-key="id"
        lazy
        :load="loadChildren"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="序号" width="100" align="center">
          <template #default="{ $index }">
            {{ $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="分类名称" min-width="150">
          <template #default="{ row }">
            <span :style="{ paddingLeft: (row.level || 0) * 20 + 'px' }">
              {{ row.name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="sort_order" label="排序" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.sort_order }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="200" align="center" fixed="right">
          <template #default="{ row }">
            <!-- 查看下级分类按钮（一级和二级分类显示） -->
            <el-button 
              v-if="(row.parent_id === 0 || row.parent_id === null) || (row.parent_id > 0 && !isThirdLevel(row))" 
              type="info" 
              link 
              @click="viewChildren(row)"
            >
              查看下级
            </el-button>
            
            <!-- 添加下级分类按钮（一级和二级分类显示） -->
            <el-button 
              v-if="(row.parent_id === 0 || row.parent_id === null) || (row.parent_id > 0 && !isThirdLevel(row))" 
              type="success" 
              link 
              @click="addSubCategory(row)"
            >
              添加下级
            </el-button>
            
            <el-button type="primary" link @click="openEditModal(row)">
              编辑
            </el-button>
            <el-button type="danger" link @click="deleteCategory(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 批量操作工具栏 -->
      <div class="batch-actions" v-if="multipleSelection.length > 0">
        <el-button 
          type="danger" 
          @click="batchDelete"
          :disabled="multipleSelection.length === 0"
        >
          批量删除 ({{ multipleSelection.length }})
        </el-button>
        <el-button @click="clearSelection">
          清空选择
        </el-button>
      </div>
      
      <el-empty v-if="currentCategories.length === 0" description="暂无分类" />
    </div>

    <!-- 添加/编辑分类弹窗 -->
    <el-dialog
      v-model="showModal"
      :title="isEdit ? '编辑分类' : '添加分类'"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="category-form"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input 
            v-model="form.name" 
            placeholder="请输入分类名称"
            maxlength="50"
            show-word-limit
            @keyup.enter="handleSubmit"
          />
        </el-form-item>

        <el-form-item label="排序序号" prop="sort_order">
          <el-input-number 
            v-model="form.sort_order" 
            :min="0" 
            :max="999"
            :controls="false"
            placeholder="数字越小越靠前"
            style="width: 100%"
            @keyup.enter="handleSubmit"
          />
          <div class="form-tip">数字越小，分类排列越靠前</div>
        </el-form-item>

        <el-form-item label="父分类">
          <el-select 
            v-model="form.parent_id" 
            placeholder="选择父分类（不选择则为一级分类）"
            placement="right-start"
            style="width: 100%"
          >
            <el-option label="一级分类" :value="0" />
            <el-option 
              v-for="category in parentCategories" 
              :key="category.id" 
              :label="category.name" 
              :value="category.id" 
            />
          </el-select>
        </el-form-item>

        <div class="form-actions">
          <el-button @click="closeModal">取消</el-button>
          <el-button type="primary" @click="handleSubmit">
            {{ isEdit ? '保存修改' : '立即创建' }}
          </el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { categoryApi } from '../services/api.js'
import { ElMessage, ElMessageBox } from 'element-plus'

const categories = ref([])
const currentCategories = ref([]) // 当前显示的分类
const parentCategories = ref([]) // 用于选择父分类的列表
const showModal = ref(false)
const isEdit = ref(false)
const editingCategory = ref(null)
const formRef = ref(null)
const categoryTableRef = ref(null)
const multipleSelection = ref([]) // 多选分类
const breadcrumb = ref([]) // 面包屑导航，用于跟踪当前分类层级
const currentParentId = ref(0) // 当前父分类ID，0表示顶级分类

const form = ref({
  name: '',
  sort_order: 0,
  parent_id: 0
})

const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 50, message: '分类名称长度在1-50个字符之间', trigger: 'blur' }
  ],
  sort_order: [
    { required: true, message: '请输入排序序号', trigger: 'blur' }
  ]
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 加载分类
async function loadCategories(parentId = 0) {
  try {
    console.log('开始加载分类，parentId:', parentId)
    const res = await categoryApi.getList()
    console.log('分类API响应:', res)
    if (res.success) {
      console.log('分类数据:', res.data)
      // 过滤出当前父分类下的子分类
      currentCategories.value = (res.data || []).filter(cat => {
        const catParentId = cat.parent_id || 0
        return catParentId === parentId
      })
      console.log('过滤后的分类:', currentCategories.value)
      
      // 提取所有分类作为父分类选项
      parentCategories.value = res.data || []
      
      // 更新面包屑导航
      updateBreadcrumb(parentId, res.data || [])
    } else {
      console.error('分类API返回失败:', res.message)
      ElMessage.error('加载分类失败: ' + (res.message || '未知错误'))
    }
  } catch (error) {
    console.error('加载分类失败:', error)
    console.error('错误详情:', error.message)
    console.error('错误堆栈:', error.stack)
    ElMessage.error('加载分类失败: ' + error.message)
  }
}

// 更新面包屑导航
function updateBreadcrumb(parentId, allCategories) {
  breadcrumb.value = []
  
  // 添加首页（顶级分类）
  breadcrumb.value.push({
    name: '所有分类',
    id: 0
  })
  
  // 如果不是顶级分类，添加父分类路径
  if (parentId > 0) {
    const categoryMap = {}
    allCategories.forEach(cat => {
      categoryMap[cat.id] = cat
    })
    
    let currentId = parentId
    const path = []
    
    // 从当前父分类向上追溯到顶级分类
    while (currentId > 0 && categoryMap[currentId]) {
      path.unshift({
        name: categoryMap[currentId].name,
        id: currentId
      })
      currentId = categoryMap[currentId].parent_id || 0
    }
    
    // 将路径添加到面包屑
    breadcrumb.value = breadcrumb.value.concat(path)
  }
}

// 查看下级分类
function viewChildren(category) {
  currentParentId.value = category.id
  loadCategories(category.id)
}

// 回到上级分类
function goToParent() {
  if (breadcrumb.value.length > 1) {
    const parentCategory = breadcrumb.value[breadcrumb.value.length - 2]
    currentParentId.value = parentCategory.id
    loadCategories(parentCategory.id)
  }
}

// 添加下级分类
function addSubCategory(parentCategory) {
  isEdit.value = false
  editingCategory.value = null
  form.value = {
    name: '',
    sort_order: 0,
    parent_id: parentCategory.id
  }
  showModal.value = true
}

// 获取分类层级
function getCategoryLevel(category) {
  let level = 1
  let currentId = category.parent_id
  
  while (currentId > 0) {
    level++
    const parentCategory = parentCategories.value.find(cat => cat.id === currentId)
    if (!parentCategory) break
    currentId = parentCategory.parent_id || 0
  }
  
  return level
}

// 判断是否为三级分类
function isThirdLevel(category) {
  return getCategoryLevel(category) === 3
}



// 打开添加分类弹窗
function openAddModal() {
  isEdit.value = false
  editingCategory.value = null
  form.value = {
    name: '',
    sort_order: 0,
    parent_id: currentParentId.value  // 默认使用当前父分类
  }
  showModal.value = true
}

// 打开编辑分类弹窗
function openEditModal(category) {
  isEdit.value = true
  editingCategory.value = { ...category }
  form.value = {
    id: category.id,
    name: category.name,
    sort_order: category.sort_order || 0,
    parent_id: category.parent_id || 0  // 保持原有的父分类，null时设为0
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingCategory.value = null
}

async function handleSubmit() {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    if (isEdit.value) {
      await categoryApi.update(form.value.id, {
        name: form.value.name,
        sort_order: form.value.sort_order,
        parent_id: form.value.parent_id
      })
    } else {
      await categoryApi.create({
        name: form.value.name,
        sort_order: form.value.sort_order,
        parent_id: form.value.parent_id
      })
    }
    
    closeModal()
    // 重新加载分类，使用当前父分类ID
    loadCategories(currentParentId.value)
    ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error(error.message || '操作失败')
  }
}

async function deleteCategory(id) {
  try {
    await ElMessageBox.confirm(
      '确定要删除该分类吗？删除后该分类下的商品将变为未分类状态。',
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await categoryApi.delete(id)
    // 重新加载分类，使用当前父分类ID
    loadCategories(currentParentId.value)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 懒加载子分类（用于表格展开）
function loadChildren(tree, treeNode, resolve) {
  // 这里可以根据需要实现懒加载
  // 暂时返回空数组，因为我们已经在表格中处理了层级
  resolve([])
}

// 处理多选变化
function handleSelectionChange(selection) {
  multipleSelection.value = selection
}

// 清空选择
function clearSelection() {
  if (categoryTableRef.value) {
    categoryTableRef.value.clearSelection()
  }
  multipleSelection.value = []
}

// 批量删除分类
async function batchDelete() {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请先选择要删除的分类')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${multipleSelection.value.length} 个分类吗？删除后这些分类下的商品将变为未分类状态。`,
      '批量删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const deletePromises = multipleSelection.value.map(item => 
      categoryApi.delete(item.id)
    )

    await Promise.all(deletePromises)
    
    // 重新加载分类，使用当前父分类ID
    loadCategories(currentParentId.value)
    clearSelection()
    ElMessage.success(`成功删除 ${deletePromises.length} 个分类`)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '批量删除失败')
    }
  }
}

// 初始化加载顶级分类
onMounted(() => {
  loadCategories(0)
})
</script>

<style scoped>
.categories-view {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: flex-start;
  margin-bottom: var(--spacing-lg);
}

.card {
  background: var(--bg-white);
  border-radius: var(--card-radius);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
}

.breadcrumb {
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
}

.breadcrumb-item {
  cursor: pointer;
}

.breadcrumb-item:hover {
  color: var(--primary-color);
}

.breadcrumb-item.active {
  font-weight: bold;
  color: var(--primary-color);
}

.category-title {
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.batch-actions {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--bg-light);
  border-radius: var(--card-radius);
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.form-tip {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}
</style>
<template>
  <div class="reviews-management">
    <div class="card">
      <!-- 评价表格 -->
      <el-table 
        ref="reviewTableRef"
        :data="reviews" 
        style="width: 100%" 
        stripe
        @selection-change="handleReviewSelectionChange"
        v-loading="loading"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="序号" width="80" align="center">
          <template #default="{ $index }">
            {{ $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="商品信息" width="200">
          <template #default="{ row }">
            <div class="product-cell">
              <img v-if="getProductImage(row)" :src="getProductImage(row)" class="product-image" />
              <div class="product-info">
                <div class="product-name">{{ row.product_name || '未知商品' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="user_name" label="用户" width="120" />
        <el-table-column prop="rating" label="评分" width="100" align="center">
          <template #default="{ row }">
            <el-rate v-model="row.rating" disabled show-score />
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评价内容" min-width="250">
          <template #default="{ row }">
            <div class="review-content">{{ row.content || '此用户未填写评价内容' }}</div>
            <div v-if="row.images && row.images.length > 0" class="review-images">
              <el-image
                v-for="(image, index) in row.images"
                :key="index"
                :src="image"
                :preview-src-list="row.images"
                :preview-teleported="true"
                style="width: 50px; height: 50px; margin-right: 5px;"
                fit="cover"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '显示' : '隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="评价时间" width="160" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button 
              size="small" 
              :type="row.status === 1 ? 'info' : 'success'" 
              @click="toggleReviewStatus(row.id, row.status)"
            >
              {{ row.status === 1 ? '隐藏' : '显示' }}
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="deleteReview(row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 筛选器 -->
      <div class="filters">
        <el-form :inline="true" :model="filters">
          <el-form-item label="评价状态">
            <el-select v-model="filters.status" placeholder="全部" clearable style="width: 120px">
              <el-option label="正常" value="1" />
              <el-option label="隐藏" value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchReviews">查询</el-button>
            <el-button @click="resetFilters">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 批量操作工具栏 -->
      <div class="batch-actions" v-if="selectedReviewIds.length > 0">
        <el-button 
          type="danger" 
          @click="batchDeleteReviews"
          :disabled="selectedReviewIds.length === 0"
        >
          批量删除 ({{ selectedReviewIds.length }})
        </el-button>
        <el-button @click="clearReviewSelection">
          清空选择
        </el-button>
      </div>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { reviewApi } from '@/services/api.js'

const router = useRouter()

// 评价列表
const reviews = ref([])
const selectedReviewIds = ref([])
const reviewTableRef = ref(null)
const loading = ref(false)

// 分页信息
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0
})

// 筛选条件
const filters = ref({
  status: ''
})

// 处理选择变化
function handleReviewSelectionChange(val) {
  selectedReviewIds.value = val.map(item => item.id)
}

// 取消选择
function clearReviewSelection() {
  if (reviewTableRef.value) {
    reviewTableRef.value.clearSelection()
  }
  selectedReviewIds.value = []
}

// 获取评价列表
const fetchReviews = async () => {
  try {
    loading.value = true
    
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit
    }
    
    // 添加筛选条件
    if (filters.value.status !== '') {
      params.status = filters.value.status
    }
    
    const res = await reviewApi.getAllReviews(params)
    
    if (res.success) {
      reviews.value = res.data.reviews || []
      pagination.value = res.data.pagination || { page: 1, limit: 20, total: 0 }
    } else {
      ElMessage.error(res.message || '获取评价列表失败')
    }
  } catch (error) {
    console.error('获取评价列表失败:', error)
    ElMessage.error('获取评价列表失败')
  } finally {
    loading.value = false
  }
}

// 重置筛选
const resetFilters = () => {
  filters.value = {
    status: ''
  }
  pagination.value.page = 1
  fetchReviews()
}

// 分页改变
const handleSizeChange = (size) => {
  pagination.value.limit = size
  pagination.value.page = 1
  fetchReviews()
}

const handleCurrentChange = (page) => {
  pagination.value.page = page
  fetchReviews()
}

// 切换评价状态
const toggleReviewStatus = async (reviewId, currentStatus) => {
  try {
    const newStatus = currentStatus === 1 ? 0 : 1
    const res = await reviewApi.updateStatus(reviewId, newStatus)
    
    if (res.success) {
      ElMessage.success(newStatus === 1 ? '已显示该评价' : '已隐藏该评价')
      fetchReviews()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  }
}

// 删除评价
const deleteReview = async (reviewId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评价吗？此操作不可恢复。', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await reviewApi.delete(reviewId)
    
    if (res.success) {
      ElMessage.success('删除成功')
      fetchReviews()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评价失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除评价
async function batchDeleteReviews() {
  if (selectedReviewIds.value.length === 0) {
    ElMessage.warning('请选择要删除的评价')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedReviewIds.value.length} 条评价吗？删除后将无法恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const res = await reviewApi.batchDelete(selectedReviewIds.value)
    
    if (res.success) {
      ElMessage.success(`成功删除 ${selectedReviewIds.value.length} 条评价`)
      fetchReviews()
      clearReviewSelection()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 获取商品图片（从快照或默认）
const getProductImage = (review) => {
  if (review.product_snapshot) {
    try {
      const snapshot = typeof review.product_snapshot === 'string' 
        ? JSON.parse(review.product_snapshot) 
        : review.product_snapshot
      return snapshot.image || ''
    } catch (e) {
      return ''
    }
  }
  return ''
}

onMounted(() => {
  fetchReviews()
})
</script>

<style scoped>
.reviews-management {
  padding: 20px;
}

.page-title {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.batch-actions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  gap: 8px;
  align-items: center;
}

.filters {
  margin-top: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
}

.product-cell {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.product-image {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  object-fit: cover;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.product-name {
  font-size: 14px;
  color: #303133;
  line-height: 1.4;
}

.pagination {
  padding: 20px;
  display: flex;
  justify-content: center;
}

.filters {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.review-content {
  font-size: 14px;
  color: #303133;
  line-height: 1.5;
  margin-bottom: 5px;
}

.review-images {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.batch-operations {
  padding: 15px 20px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 15px;
}
</style>
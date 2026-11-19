<template>
  <div class="reviews-management">
    <div class="card">
      <!-- 评价表格 -->
      <el-table 
        :data="reviews" 
        style="width: 100%" 
        stripe
        v-loading="loading"
      >
        <el-table-column label="序号" width="80" align="center">
          <template #default="{ $index }">
            {{ $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="商品信息" width="200">
          <template #default="{ row }">
            <div class="product-cell">
              <img v-if="row.product_image" :src="row.product_image" class="product-image" />
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

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="fetchReviews"
          @current-change="fetchReviews"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { merchantApi } from '../../services/api'

const loading = ref(false)
const reviews = ref([])
const filters = reactive({
  status: ''
})
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 获取评价列表
const fetchReviews = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    if (filters.status) {
      params.status = filters.status
    }
    
    const res = await merchantApi.getReviews(params)
    console.log('商家评价 API 响应:', res)
    
    if (res.success) {
      reviews.value = res.data || []
      pagination.total = res.total || 0
    } else {
      ElMessage.error(res.message || '加载评价失败')
    }
  } catch (error) {
    console.error('加载评价失败:', error)
    ElMessage.error('加载评价失败')
  } finally {
    loading.value = false
  }
}

// 重置筛选
const resetFilters = () => {
  filters.status = ''
  pagination.page = 1
  fetchReviews()
}

onMounted(() => {
  fetchReviews()
})
</script>

<style scoped>
.reviews-management {
  padding: 20px;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 14px;
  color: #333;
}

.review-content {
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.review-images {
  display: flex;
  gap: 5px;
}

.filters {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>

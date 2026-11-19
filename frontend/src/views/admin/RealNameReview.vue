<template>
  <div class="realname-review-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">实名认证审核</span>
          <div class="header-actions">
            <el-select v-model="statusFilter" placeholder="筛选状态" clearable style="width: 150px; margin-right: 10px">
              <el-option label="全部" value="all" />
              <el-option label="待审核" value="pending" />
              <el-option label="已通过" value="approved" />
              <el-option label="已拒绝" value="rejected" />
            </el-select>
            <el-input v-model="keyword" placeholder="搜索用户名/手机号/姓名" style="width: 200px; margin-right: 10px" clearable @keyup.enter="search">
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="search">搜索</el-button>
            <el-button @click="reset">重置</el-button>
          </div>
        </div>
      </template>

      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <el-card shadow="never" class="stat-card">
            <div class="stat-item">
              <span class="stat-value">{{ stats.total || 0 }}</span>
              <span class="stat-label">总申请数</span>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="never" class="stat-card pending">
            <div class="stat-item">
              <span class="stat-value">{{ stats.pending || 0 }}</span>
              <span class="stat-label">待审核</span>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="never" class="stat-card approved">
            <div class="stat-item">
              <span class="stat-value">{{ stats.approved || 0 }}</span>
              <span class="stat-label">已通过</span>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="never" class="stat-card rejected">
            <div class="stat-item">
              <span class="stat-value">{{ stats.rejected || 0 }}</span>
              <span class="stat-label">已拒绝</span>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 申请列表 -->
      <el-table :data="tableData" v-loading="loading" stripe border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="real_name" label="真实姓名" width="100" />
        <el-table-column prop="id_card_number_masked" label="身份证号" width="180">
          <template #default="{ row }">
            <span class="id-card-masked">{{ row.id_card_number_masked || '***' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="身份证照片" width="180">
          <template #default="{ row }">
            <div class="id-card-preview">
              <el-image 
                v-if="row.id_card_front" 
                :src="row.id_card_front" 
                fit="cover" 
                class="id-card-thumb"
                @click="previewImage(row.id_card_front)"
              />
              <span v-else class="no-image">无</span>
              <el-image 
                v-if="row.id_card_back" 
                :src="row.id_card_back" 
                fit="cover" 
                class="id-card-thumb"
                @click="previewImage(row.id_card_back)"
              />
              <span v-else class="no-image">无</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="申请时间" width="160" />
        <el-table-column prop="reviewer_name" label="审核人" width="100" />
        <el-table-column prop="reviewed_at" label="审核时间" width="160" />
        <el-table-column prop="review_notes" label="审核意见" min-width="120" show-overflow-tooltip />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDetail(row)">详情</el-button>
            <el-button 
              v-if="row.status === 'pending'" 
              link 
              type="primary" 
              @click="showReviewDialog(row)"
            >
              审核
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="实名认证详情" width="700px">
      <div class="detail-content" v-if="currentApplication">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">{{ currentApplication.username }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentApplication.phone }}</el-descriptions-item>
          <el-descriptions-item label="真实姓名">{{ currentApplication.real_name }}</el-descriptions-item>
          <el-descriptions-item label="身份证号">
            <span class="id-card-full">{{ currentApplication.id_card_number_masked }}</span>
            <el-tag v-if="currentApplication.status === 'approved'" type="success" size="small" style="margin-left: 10px">已认证</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ currentApplication.created_at }}</el-descriptions-item>
          <el-descriptions-item label="审核状态">
            <el-tag :type="getStatusType(currentApplication.status)">
              {{ getStatusText(currentApplication.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="currentApplication.reviewer_name" label="审核人">
            {{ currentApplication.reviewer_name }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentApplication.reviewed_at" label="审核时间">
            {{ currentApplication.reviewed_at }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentApplication.review_notes" label="审核意见" :span="2">
            {{ currentApplication.review_notes }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">身份证照片</el-divider>
        <div class="id-card-images">
          <div class="id-card-image-item">
            <p class="image-label">身份证正面</p>
            <el-image 
              v-if="currentApplication.id_card_front"
              :src="currentApplication.id_card_front" 
              fit="contain" 
              class="id-card-image"
              :preview-src-list="[currentApplication.id_card_front]"
            />
            <span v-else class="no-image">未上传</span>
          </div>
          <div class="id-card-image-item">
            <p class="image-label">身份证反面</p>
            <el-image 
              v-if="currentApplication.id_card_back"
              :src="currentApplication.id_card_back" 
              fit="contain" 
              class="id-card-image"
              :preview-src-list="[currentApplication.id_card_back]"
            />
            <span v-else class="no-image">未上传</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog v-model="reviewDialogVisible" title="审核实名认证申请" width="500px">
      <div class="review-content" v-if="currentApplication">
        <el-form :model="reviewForm" label-width="100px">
          <el-form-item label="申请人">
            <span>{{ currentApplication.username }} ({{ currentApplication.phone }})</span>
          </el-form-item>
          <el-form-item label="真实姓名">
            <span>{{ currentApplication.real_name }}</span>
          </el-form-item>
          <el-form-item label="身份证号">
            <span class="id-card-masked">{{ currentApplication.id_card_number_masked }}</span>
          </el-form-item>
          <el-form-item label="身份证照片">
            <div class="id-card-preview-large">
              <el-image 
                v-if="currentApplication.id_card_front"
                :src="currentApplication.id_card_front" 
                fit="contain" 
                class="id-card-image"
                :preview-src-list="[currentApplication.id_card_front]"
              />
              <el-image 
                v-if="currentApplication.id_card_back"
                :src="currentApplication.id_card_back" 
                fit="contain" 
                class="id-card-image"
                :preview-src-list="[currentApplication.id_card_back]"
              />
            </div>
          </el-form-item>
          <el-form-item label="审核结果" required>
            <el-radio-group v-model="reviewForm.status">
              <el-radio value="approved">通过</el-radio>
              <el-radio value="rejected">拒绝</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="审核意见">
            <el-input
              v-model="reviewForm.review_notes"
              type="textarea"
              :rows="3"
              placeholder="请输入审核意见（拒绝时必填）"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReview" :loading="submitting">
          确认{{ reviewForm.status === 'approved' ? '通过' : '拒绝' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="imagePreviewVisible" title="图片预览" width="800px">
      <el-image 
        v-if="previewImageUrl"
        :src="previewImageUrl" 
        fit="contain" 
        style="width: 100%; height: 500px"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import axios from 'axios'

const API_BASE = '/api'

// 状态筛选
const statusFilter = ref('all')
const keyword = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const loading = ref(false)
const tableData = ref([])

// 统计
const stats = ref({
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  today: 0
})

// 详情对话框
const detailDialogVisible = ref(false)
const currentApplication = ref(null)

// 审核对话框
const reviewDialogVisible = ref(false)
const reviewForm = reactive({
  status: 'approved',
  review_notes: ''
})
const submitting = ref(false)

// 图片预览
const imagePreviewVisible = ref(false)
const previewImageUrl = ref('')

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return texts[status] || status
}

// 加载统计数据
const loadStats = async () => {
  try {
    const response = await axios.get(`${API_BASE}/admin/realname/stats`)
    if (response.data.success) {
      stats.value = response.data.data
    }
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

// 加载列表数据
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value
    }
    if (statusFilter.value && statusFilter.value !== 'all') {
      params.status = statusFilter.value
    }
    if (keyword.value) {
      params.keyword = keyword.value
    }
    
    const response = await axios.get(`${API_BASE}/admin/realname/list`, { params })
    if (response.data.success) {
      tableData.value = response.data.data.list
      total.value = response.data.data.total
    }
  } catch (error) {
    console.error('加载列表失败:', error)
    ElMessage.error('加载列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const search = () => {
  currentPage.value = 1
  loadData()
}

// 重置
const reset = () => {
  statusFilter.value = 'all'
  keyword.value = ''
  currentPage.value = 1
  loadData()
}

// 显示详情
const showDetail = (row) => {
  currentApplication.value = row
  detailDialogVisible.value = true
}

// 显示审核对话框
const showReviewDialog = (row) => {
  currentApplication.value = row
  reviewForm.status = 'approved'
  reviewForm.review_notes = ''
  reviewDialogVisible.value = true
}

// 提交审核
const submitReview = async () => {
  if (reviewForm.status === 'rejected' && !reviewForm.review_notes.trim()) {
    ElMessage.warning('请填写拒绝原因')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确认${reviewForm.status === 'approved' ? '通过' : '拒绝'}该实名认证申请？`,
      '审核确认',
      { type: 'warning' }
    )
  } catch {
    return
  }
  
  submitting.value = true
  try {
    const response = await axios.put(
      `${API_BASE}/admin/realname/${currentApplication.value.id}`,
      {
        status: reviewForm.status,
        review_notes: reviewForm.review_notes
      }
    )
    
    if (response.data.success) {
      ElMessage.success(response.data.message)
      reviewDialogVisible.value = false
      loadData()
      loadStats()
    }
  } catch (error) {
    console.error('审核失败:', error)
    ElMessage.error(error.response?.data?.message || '审核失败')
  } finally {
    submitting.value = false
  }
}

// 预览图片
const previewImage = (url) => {
  previewImageUrl.value = url
  imagePreviewVisible.value = true
}

// 初始化
onMounted(() => {
  loadStats()
  loadData()
})
</script>

<style scoped>
.realname-review-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 26px;
  font-weight: bold;
}

.header-actions {
  display: flex;
  align-items: center;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
}

.stat-card.pending .stat-value {
  color: #e6a23c;
}

.stat-card.approved .stat-value {
  color: #67c23a;
}

.stat-card.rejected .stat-value {
  color: #f56c6c;
}

.stat-label {
  font-size: 18px;
  color: #909399;
  margin-top: 5px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.id-card-preview {
  display: flex;
  gap: 5px;
}

.id-card-thumb {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  cursor: pointer;
}

.id-card-preview-large {
  display: flex;
  gap: 10px;
}

.id-card-images {
  display: flex;
  gap: 20px;
}

.id-card-image-item {
  flex: 1;
  text-align: center;
}

.image-label {
  margin-bottom: 10px;
  font-weight: bold;
}

.id-card-image {
  width: 100%;
  height: 200px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.id-card-masked {
  font-family: monospace;
  letter-spacing: 1px;
}

.id-card-full {
  font-family: monospace;
  letter-spacing: 1px;
}

.no-image {
  color: #909399;
  font-size: 18px;
}
</style>

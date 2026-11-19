<template>
  <div class="merchant-container">
    <!-- 页面标题和操作 -->
    <div class="page-header">
      <div class="header-content">
        <h1>商家入驻审核</h1>
        <p class="header-desc">审核商家入驻申请</p>
      </div>
    </div>

    <!-- 待审核列表 -->
    <el-card shadow="hover" class="merchant-card">
      <el-tabs v-model="activeTab" @tab-click="handleTabChange">
        <el-tab-pane label="待审核" name="pending">
          <el-table :data="pendingList" stripe style="width: 100%" v-loading="loading">
            <el-table-column label="序号" width="80" align="center">
              <template #default="{ $index }">
                {{ $index + 1 }}
              </template>
            </el-table-column>
            <el-table-column prop="applicant_username" label="申请人" min-width="120" />
            <el-table-column prop="shop_name" label="店铺名称" min-width="150" />
            <el-table-column prop="license_no" label="营业执照号" min-width="150" />
            <el-table-column prop="contact_phone" label="联系电话" min-width="120" />
            <el-table-column label="资质图片" width="120" align="center">
              <template #default="scope">
                <el-button link type="primary" @click="viewImages(scope.row)">查看图片</el-button>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="申请时间" min-width="180">
              <template #default="scope">
                {{ formatDateTime(scope.row.created_at) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right" align="center">
              <template #default="scope">
                <el-button 
                  type="success" 
                  size="small" 
                  @click="handleApprove(scope.row)" 
                  icon="Check"
                >
                  通过
                </el-button>
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="handleReject(scope.row)" 
                  icon="Close"
                >
                  拒绝
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="已审核" name="reviewed">
          <el-table :data="reviewedList" stripe style="width: 100%" v-loading="loading">
            <el-table-column label="序号" width="80" align="center">
              <template #default="{ $index }">
                {{ $index + 1 }}
              </template>
            </el-table-column>
            <el-table-column prop="applicant_username" label="申请人" min-width="120" />
            <el-table-column prop="shop_name" label="店铺名称" min-width="150" />
            <el-table-column prop="status_text" label="审核状态" min-width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="review_notes" label="审核意见" min-width="200" />
            <el-table-column prop="created_at" label="申请时间" min-width="180">
              <template #default="scope">
                {{ formatDateTime(scope.row.created_at) }}
              </template>
            </el-table-column>
            <el-table-column prop="reviewed_at" label="审核时间" min-width="180">
              <template #default="scope">
                {{ formatDateTime(scope.row.reviewed_at) }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    
    <!-- 拒绝意见对话框 -->
    <el-dialog
      v-model="reviewDialogVisible"
      title="拒绝审核"
      width="500px"
    >
      <el-form :model="reviewForm" label-width="80px">
        <el-form-item label="拒绝意见" required>
          <el-input
            v-model="reviewForm.reviewNotes"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="submitReview">确定</el-button>
      </template>
    </el-dialog>
    
    <!-- 资质图片查看对话框 -->
    <el-dialog v-model="imageDialogVisible" title="资质图片" width="800px">
      <div class="image-preview-container" v-if="currentApplication">
        <div class="image-item">
          <p class="image-title">店铺资格证</p>
          <el-image 
            v-if="currentApplication.license_image"
            :src="currentApplication.license_image" 
            fit="contain" 
            class="preview-image"
            :preview-src-list="[currentApplication.license_image]"
          />
          <p v-else class="no-image">未上传</p>
        </div>
        <div class="image-item">
          <p class="image-title">身份证正面</p>
          <el-image 
            v-if="currentApplication.id_card_front"
            :src="currentApplication.id_card_front" 
            fit="contain" 
            class="preview-image"
            :preview-src-list="[currentApplication.id_card_front]"
          />
          <p v-else class="no-image">未上传</p>
        </div>
        <div class="image-item">
          <p class="image-title">身份证反面</p>
          <el-image 
            v-if="currentApplication.id_card_back"
            :src="currentApplication.id_card_back" 
            fit="contain" 
            class="preview-image"
            :preview-src-list="[currentApplication.id_card_back]"
          />
          <p v-else class="no-image">未上传</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { merchantApi } from '../services/api'
import { formatDateTime } from '../utils/dateFormatter'

const activeTab = ref('pending')
const loading = ref(false)
const pendingList = ref([])
const reviewedList = ref([])
const reviewDialogVisible = ref(false)
const imageDialogVisible = ref(false)
const currentApplication = ref(null)

const reviewForm = reactive({
  applicationId: null,
  status: 'approved',
  reviewNotes: ''
})

const handleTabChange = async (tab) => {
  if (tab.name === 'pending') {
    await loadPendingList()
  } else {
    await loadReviewedList()
  }
}

const loadPendingList = async () => {
  loading.value = true
  try {
    const response = await merchantApi.getPendingList()
    console.log('待审核列表响应:', response)
    
    // 确保数据是数组格式
    if (Array.isArray(response.data)) {
      pendingList.value = response.data
    } else if (response.data) {
      // 如果是单个对象，转换为数组
      pendingList.value = [response.data]
    } else {
      pendingList.value = []
    }
  } catch (error) {
    console.error('加载待审核列表失败:', error)
    ElMessage.error('加载待审核列表失败')
  } finally {
    loading.value = false
  }
}

const loadReviewedList = async () => {
  loading.value = true
  try {
    console.log('正在请求已审核列表...')
    const response = await merchantApi.getReviewedList()
    console.log('已审核列表完整响应:', response)
    console.log('响应数据类型:', typeof response)
    console.log('响应data属性:', response.data)
    console.log('响应data类型:', typeof response.data)
    console.log('响应data长度:', Array.isArray(response.data) ? response.data.length : '不是数组')
    
    // 确保数据是数组格式
    if (Array.isArray(response.data)) {
      console.log('✅ 响应数据是数组，长度:', response.data.length)
      reviewedList.value = response.data
    } else if (response.data) {
      console.log('⚠️ 响应数据不是数组，是单个对象')
      console.log('响应数据内容:', response.data)
      reviewedList.value = [response.data]
    } else {
      console.log('❌ 响应数据为空或未定义')
      reviewedList.value = []
    }
    
    console.log('最终reviewedList值:', reviewedList.value)
    console.log('最终reviewedList长度:', reviewedList.value.length)
  } catch (error) {
    console.error('加载已审核列表失败:', error)
    console.error('错误详情:', error.message)
    ElMessage.error('加载已审核列表失败')
  } finally {
    loading.value = false
  }
}

const handleApprove = async (application) => {
  loading.value = true
  try {
    await merchantApi.review(application.id, 'approved', '')
    ElMessage.success('审核通过')
    await loadPendingList()
  } catch (error) {
    console.error('审核失败:', error)
    if (error.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('审核失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

const handleReject = (application) => {
  currentApplication.value = application
  reviewForm.applicationId = application.id
  reviewForm.reviewNotes = ''
  reviewDialogVisible.value = true
}

const submitReview = async () => {
  if (!reviewForm.applicationId) {
    ElMessage.warning('请选择申请记录')
    return
  }
  
  if (!reviewForm.reviewNotes || reviewForm.reviewNotes.trim() === '') {
    ElMessage.warning('请输入拒绝意见')
    return
  }
  
  loading.value = true
  try {
    const response = await merchantApi.review(
      reviewForm.applicationId,
      'rejected',
      reviewForm.reviewNotes
    )
    
    ElMessage.success(response.message || '审核成功')
    reviewDialogVisible.value = false
    
    // 刷新列表
    await loadPendingList()
  } catch (error) {
    console.error('审核失败:', error)
    if (error.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('审核失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

// 查看资质图片
const viewImages = (application) => {
  currentApplication.value = application
  imageDialogVisible.value = true
}

const getStatusType = (status) => {
  const statusMap = {
    pending: 'info',
    approved: 'success',
    rejected: 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return statusMap[status] || status
}

onMounted(() => {
  loadPendingList()
})
</script>

<style scoped>
.merchant-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 38px;
  font-weight: bold;
  margin: 0;
}

.page-header .header-desc {
  margin: 5px 0 0 0;
  color: #666;
}

.merchant-card {
  margin-top: 20px;
}

:deep(.el-tabs__content) {
  padding-top: 0;
}

.image-preview-container {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.image-item {
  flex: 1;
  max-width: 250px;
  text-align: center;
}

.image-title {
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.preview-image {
  width: 100%;
  height: 200px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.no-image {
  color: #999;
  font-style: italic;
  height: 200px;
  line-height: 200px;
  border: 1px dashed #ddd;
  border-radius: 4px;
  margin: 0;
}
</style>

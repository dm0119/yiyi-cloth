<template>
  <div class="shop-management">
    <div class="page-header">
      <h2>店铺管理</h2>
      <p class="page-subtitle">管理所有商家的店铺信息、状态及运营数据</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total">
              <el-icon><Shop /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">总店铺数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon active">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.active }}</div>
              <div class="stat-label">运营中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon pending">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.inactive }}</div>
              <div class="stat-label">已禁用</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="店铺名称">
          <el-input v-model="searchForm.shopName" placeholder="请输入店铺名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="营业执照号">
          <el-input v-model="searchForm.licenseNo" placeholder="请输入营业执照号" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="店铺状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 300px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table :data="filteredShopList" stripe v-loading="loading" border>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="店铺名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="license_no" label="营业执照号" min-width="180" show-overflow-tooltip />
        <el-table-column prop="legal_person" label="真实姓名" min-width="100" />
        <el-table-column prop="contact_phone" label="联系电话" min-width="130" />
        <el-table-column label="品牌" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.is_brand" type="warning" size="small">品牌</el-tag>
            <span v-else style="color: #999">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'active'" type="success" size="small">
              <el-icon style="margin-right: 4px"><CircleCheck /></el-icon>
              启用
            </el-tag>
            <el-tag v-else type="danger" size="small">
              <el-icon style="margin-right: 4px"><CircleClose /></el-icon>
              禁用
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" min-width="180" />
        <el-table-column label="操作" width="280" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleView(row)"
              link
            >
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button
              type="primary"
              size="small"
              @click="handleEdit(row)"
              link
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              type="warning"
              size="small"
              @click="handleToggleStatus(row)"
              link
            >
              <el-icon><Switch /></el-icon>
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(row)"
              link
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        style="margin-top: 20px; justify-content: center"
        background
      />
    </el-card>

    <!-- 查看/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      :destroy-on-close="true"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-divider content-position="left">基本信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="店铺名称" prop="name">
              <el-input v-model="formData.name" :disabled="dialogMode === 'view'" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="店铺描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="2" :disabled="dialogMode === 'view'" />
        </el-form-item>

        <el-divider content-position="left">营业执照信息</el-divider>
        <el-form-item label="营业执照号" prop="license_no">
          <el-input v-model="formData.license_no" :disabled="dialogMode === 'view'" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="真实姓名" prop="legal_person">
              <el-input v-model="formData.legal_person" :disabled="dialogMode === 'view'" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="申请人" prop="applicant_name">
              <el-input v-model="formData.applicant_name" :disabled="dialogMode === 'view'" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">联系方式</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系电话" prop="contact_phone">
              <el-input v-model="formData.contact_phone" :disabled="dialogMode === 'view'" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系邮箱" prop="contact_email">
              <el-input v-model="formData.contact_email" :disabled="dialogMode === 'view'" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">状态管理</el-divider>
        <el-form-item label="店铺状态" prop="status">
          <el-radio-group v-model="formData.status" :disabled="dialogMode === 'view'">
            <el-radio value="active">
              <el-icon><CircleCheck /></el-icon>
              启用
            </el-radio>
            <el-radio value="inactive">
              <el-icon><CircleClose /></el-icon>
              禁用
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button
          v-if="dialogMode !== 'view'"
          type="primary"
          @click="handleSubmit"
          :loading="submitLoading"
        >
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Refresh, View, Edit, Delete, Shop,
  CircleCheck, CircleClose, Clock, Switch
} from '@element-plus/icons-vue'
import { merchantApi } from '../services/api'
import BrandBadge from '../components/BrandBadge.vue'

const loading = ref(false)
const shopList = ref([])
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const searchForm = reactive({
  shopName: '',
  licenseNo: '',
  status: '',
  dateRange: []
})

const stats = reactive({
  total: 0,
  active: 0,
  inactive: 0
})

const dialogVisible = ref(false)
const dialogTitle = ref('查看店铺')
const dialogMode = ref('view')
const formRef = ref(null)
const formData = ref({
  name: '',
  license_no: '',
  description: '',
  legal_person: '',
  applicant_name: '',
  contact_phone: '',
  contact_email: '',
  status: 'active'
})
const submitLoading = ref(false)

const formRules = {
  name: [{ required: true, message: '请输入店铺名称', trigger: 'blur' }],
  license_no: [{ required: true, message: '请输入营业执照号', trigger: 'blur' }],
  contact_phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  status: [{ required: true, message: '请选择店铺状态', trigger: 'change' }]
}

// 根据搜索条件过滤店铺列表
const filteredShopList = computed(() => {
  let result = [...shopList.value]

  if (searchForm.shopName) {
    result = result.filter(item =>
      item.name.toLowerCase().includes(searchForm.shopName.toLowerCase())
    )
  }

  if (searchForm.licenseNo) {
    result = result.filter(item =>
      item.license_no?.includes(searchForm.licenseNo)
    )
  }

  if (searchForm.status) {
    result = result.filter(item => item.status === searchForm.status)
  }

  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    const [start, end] = searchForm.dateRange
    result = result.filter(item => {
      const createDate = item.created_at?.split(' ')[0]
      return createDate >= start && createDate <= end
    })
  }

  // 更新总数
  pagination.total = result.length

  // 分页
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return result.slice(start, end)
})

const getShopList = async () => {
  // 检查 token 是否存在，如果不存在则延迟加载
  const adminToken = localStorage.getItem('admin_token')
  if (!adminToken) {
    console.warn('⚠️ admin_token 不存在，延迟 300ms 后重试...')
    console.warn('当前 localStorage 内容:', {
      admin_token: localStorage.getItem('admin_token'),
      admin_user: localStorage.getItem('admin_user'),
      admin_permissions: localStorage.getItem('admin_permissions')
    })
    await new Promise(resolve => setTimeout(resolve, 300))
    return getShopList() // 递归重试
  }

  console.log('✓ admin_token 存在，开始请求 API')
  loading.value = true
  try {
    const response = await merchantApi.getAllShops()
    console.log('店铺列表响应:', response)
    shopList.value = Array.isArray(response.data) ? response.data : []

    // 更新统计数据
    stats.total = shopList.value.length
    stats.active = shopList.value.filter(item => item.status === 'active').length
    stats.inactive = shopList.value.filter(item => item.status === 'inactive').length

    pagination.total = shopList.value.length
  } catch (error) {
    console.error('获取店铺列表失败:', error)
    ElMessage.error('获取店铺列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  // filteredShopList 会自动根据搜索条件过滤
}

const handleReset = () => {
  searchForm.shopName = ''
  searchForm.licenseNo = ''
  searchForm.status = ''
  searchForm.dateRange = []
  pagination.page = 1
}

const handleSizeChange = () => {
  pagination.page = 1
}

const handlePageChange = () => {
  // filteredShopList 会自动处理分页
}

const handleView = (row) => {
  dialogTitle.value = '查看店铺详情'
  dialogMode.value = 'view'
  formData.value = { ...row }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑店铺信息'
  dialogMode.value = 'edit'
  formData.value = { ...row }
  dialogVisible.value = true
}

const handleToggleStatus = async (row) => {
  try {
    const action = row.status === 'active' ? '禁用' : '启用'
    await ElMessageBox.confirm(
      `确定${action}店铺 "${row.name}" 吗？${action === '禁用' ? '禁用后该店铺将无法进行任何经营活动。' : '启用后该店铺将恢复正常运营。'}`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const newStatus = row.status === 'active' ? 'inactive' : 'active'
    await merchantApi.updateShopInfo(row.id, { status: newStatus })

    ElMessage.success(`${action}成功`)
    getShopList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定删除店铺 "${row.name}" 吗？此操作不可恢复！`,
      '警告',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error',
        confirmButtonClass: 'el-button--danger'
      }
    )

    await merchantApi.deleteShop(row.id)
    ElMessage.success('删除成功')
    getShopList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    submitLoading.value = true

    await merchantApi.updateShop(formData.value)

    ElMessage.success('更新成功')
    dialogVisible.value = false
    getShopList()
  } catch (error) {
    console.error('更新失败:', error)
    ElMessage.error('更新失败')
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  getShopList()
})
</script>

<style scoped>
.shop-management {
  padding: var(--spacing-lg);
}

.page-header {
  margin-bottom: var(--spacing-lg);
}

.page-header h2 {
  font-size: var(--font-size-xl);
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 18px;
  color: var(--text-secondary);
  margin: 0;
}

/* 统计卡片样式 */
.stats-row {
  margin-bottom: var(--spacing-lg);
}

.stat-card {
  margin-bottom: 0;
}

.stat-card :deep(.el-card__body) {
  padding: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 38px;
  color: white;
  flex-shrink: 0;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.active {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.stat-icon.inactive {
  background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: var(--text-primary);
  line-height: 1.2;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 18px;
  color: var(--text-secondary);
}

.search-card {
  margin-bottom: var(--spacing-lg);
}

.search-card :deep(.el-card__body) {
  padding: var(--spacing-lg);
}

/* 表格样式 */
:deep(.el-table) {
  border-radius: 4px;
  overflow: hidden;
}

:deep(.el-table__header th) {
  background-color: #f5f7fa;
  font-weight: 600;
}

/* 对话框样式 */
:deep(.el-dialog__body) {
  padding: 20px 30px;
}

:deep(.el-divider__text) {
  font-weight: 600;
  color: var(--text-primary);
}

/* 按钮链接样式 */
:deep(.el-button--small.is-link) {
  padding: 0 4px;
  margin: 0 2px;
}

/* 状态标签样式 */
:deep(.el-tag) {
  display: inline-flex;
  align-items: center;
}
</style>

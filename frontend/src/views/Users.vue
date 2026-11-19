<template>
  <div class="users-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>用户管理</h1>
        <p class="header-desc">管理系统用户、角色分配及账号状态</p>
      </div>
      <el-button 
        v-permission="['user:create']" 
        type="primary" 
        @click="handleAddUser" 
        icon="Plus"
        size="large"
      >
        添加用户
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">总用户数</div>
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
              <div class="stat-label">正常用户</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon inactive">
              <el-icon><CircleClose /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.inactive }}</div>
              <div class="stat-label">禁用用户</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon role">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ roles.length }}</div>
              <div class="stat-label">角色数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索筛选区 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.role_id" placeholder="请选择角色" clearable style="width: 150px">
            <el-option label="全部" value="" />
            <el-option
              v-for="role in roles"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="正常" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
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

    <!-- 数据表格 -->
    <el-card>
      <el-table :data="users" stripe v-loading="loading" border>
        <el-table-column label="序号" width="60" align="center">
          <template #default="scope">
            {{ (pagination.page - 1) * pagination.pageSize + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" min-width="120" show-overflow-tooltip />
        <el-table-column prop="phone" label="手机号" min-width="130" />
        <el-table-column prop="role_id" label="角色" min-width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.role_id === 1 ? 'danger' : 'primary'" size="small">
              {{ getRoleName(scope.row.role_id) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 1" type="success" size="small">
              <el-icon style="margin-right: 4px"><CircleCheck /></el-icon>
              正常
            </el-tag>
            <el-tag v-else type="danger" size="small">
              <el-icon style="margin-right: 4px"><CircleClose /></el-icon>
              禁用
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" min-width="180" />
        <el-table-column label="操作" width="220" fixed="right" align="center">
          <template #default="scope">
            <el-button
              v-permission="['user:edit']"
              type="primary"
              size="small"
              @click="handleEditUser(scope.row)"
              link
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              v-if="scope.row.id !== 1"
              v-permission="['user:delete']"
              type="danger"
              size="small"
              @click="handleDeleteUser(scope.row)"
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
    
    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :destroy-on-close="true"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="rules"
        label-width="100px"
      >
        <el-divider content-position="left">基本信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="userForm.username" placeholder="请输入用户名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="真实姓名" prop="name">
              <el-input v-model="userForm.name" placeholder="请输入真实姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="userForm.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色" prop="role_id">
              <el-select v-model="userForm.role_id" placeholder="请选择角色" style="width: 100%">
                <el-option
                  v-for="role in roles.filter(r => r.name !== '超级管理员')"
                  :key="role.id"
                  :label="role.name"
                  :value="role.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="userForm.status"
            :active-value="1"
            :inactive-value="0"
            active-text="正常"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button
          v-if="!isView"
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
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Refresh, Edit, Delete, User, UserFilled,
  CircleCheck, CircleClose
} from '@element-plus/icons-vue'
import { userApi, roleApi } from '../services/api'
import { usePermission } from '../mixins/permission'

const { hasPermission } = usePermission()

const loading = ref(false)
const submitLoading = ref(false)
const users = ref([])
const roles = ref([])

// 统计数据
const stats = reactive({
  total: 0,
  active: 0,
  inactive: 0
})

// 分页（统一使用 page 而不是 currentPage）
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 搜索表单
const searchForm = reactive({
  username: '',
  phone: '',
  role_id: '',
  status: ''
})

// 对话框状态
const dialogVisible = ref(false)
const isEdit = ref(false)
const isView = ref(false)
const dialogTitle = ref('')

const userForm = reactive({
  id: '',
  username: '',
  password: '',
  name: '',
  phone: '',
  role_id: '',
  status: 1
})

const userFormRef = ref(null)

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '真实姓名长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  role_id: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

const getRoleName = (roleId) => {
  const role = roles.value.find(r => r.id === roleId)
  return role ? role.name : `角色 ID: ${roleId}`
}

// 计算过滤后的用户列表
const filteredUserList = computed(() => {
  let filtered = users.value
  
  if (searchForm.username) {
    filtered = filtered.filter(u => u.username.includes(searchForm.username))
  }
  if (searchForm.phone) {
    filtered = filtered.filter(u => u.phone.includes(searchForm.phone))
  }
  if (searchForm.role_id) {
    filtered = filtered.filter(u => u.role_id === searchForm.role_id)
  }
  if (searchForm.status) {
    filtered = filtered.filter(u => u.status === parseInt(searchForm.status))
  }
  
  return filtered
})

// 搜索
const handleSearch = () => {
  pagination.page = 1
}

// 计算筛选后的总条数
const filteredTotal = computed(() => {
  return filteredUserList.value.length
})

// 重置
const handleReset = () => {
  searchForm.username = ''
  searchForm.phone = ''
  searchForm.role_id = ''
  searchForm.status = ''
  pagination.page = 1
}

// 更新统计数据
const updateStats = () => {
  stats.total = users.value.length
  stats.active = users.value.filter(u => u.status === 1).length
  stats.inactive = users.value.filter(u => u.status === 0).length
}

const handleAddUser = () => {
  if (!hasPermission('user:create')) {
    ElMessage.warning('您没有添加用户的权限')
    return
  }
  isEdit.value = false
  isView.value = false
  dialogTitle.value = '添加用户'
  resetForm()
  dialogVisible.value = true
}

const handleEditUser = (user) => {
  if (!hasPermission('user:edit')) {
    ElMessage.warning('您没有编辑用户的权限')
    return
  }
  isEdit.value = true
  isView.value = false
  dialogTitle.value = '编辑用户'
  Object.assign(userForm, {
    id: user.id,
    username: user.username,
    name: user.name,
    phone: user.phone,
    role_id: user.role_id,
    status: user.status
  })
  dialogVisible.value = true
}

const handleDeleteUser = (user) => {
  if (!hasPermission('user:delete')) {
    ElMessage.warning('您没有删除用户的权限')
    return
  }
  if (user.id === 1) {
    ElMessage.warning('超级管理员用户不能删除')
    return
  }
  
  ElMessageBox.confirm('确定要删除这个用户吗？', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await userApi.delete(user.id)
      const index = users.value.findIndex(u => u.id === user.id)
      if (index > -1) {
        users.value.splice(index, 1)
        ElMessage.success('用户删除成功')
      }
    } catch (error) {
      ElMessage.error('删除用户失败：' + error.message)
      console.error('删除用户失败：', error)
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const handleStatusChange = async (user) => {
  if (!hasPermission('user:edit')) {
    ElMessage.warning('您没有编辑用户的权限')
    user.status = user.status === 1 ? 0 : 1
    return
  }
  if (user.id === 1) {
    user.status = 1
    ElMessage.warning('超级管理员用户状态不能修改')
    return
  }
  
  try {
    const originalStatus = user.status
    const newStatus = originalStatus === 1 ? 0 : 1
    await userApi.updateStatus(user.id, newStatus)
    const statusText = newStatus === 1 ? '启用' : '禁用'
    ElMessage.success(`用户已${statusText}`)
  } catch (error) {
    user.status = user.status === 1 ? 0 : 1
    ElMessage.error('更新用户状态失败：' + error.message)
    console.error('更新用户状态失败：', error)
  }
}

const handleSubmit = async () => {
  userFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          if (!hasPermission('user:edit')) {
            ElMessage.warning('您没有编辑用户的权限')
            return
          }
          await userApi.updateUser(userForm.id, {
            username: userForm.username,
            name: userForm.name,
            phone: userForm.phone,
            role_id: userForm.role_id,
            status: userForm.status
          })
          await fetchUsersList()
          ElMessage.success('用户编辑成功')
        } else {
          if (!hasPermission('user:create')) {
            ElMessage.warning('您没有添加用户的权限')
            return
          }
          const newUser = await userApi.create({
            username: userForm.username,
            password: userForm.password,
            name: userForm.name,
            phone: userForm.phone,
            role_id: userForm.role_id,
            status: userForm.status
          })
          users.value.push(newUser.data)
          ElMessage.success('用户添加成功')
        }
        dialogVisible.value = false
      } catch (error) {
        ElMessage.error('操作失败：' + error.message)
        console.error('操作失败：', error)
      }
    }
  })
}

const resetForm = () => {
  if (userFormRef.value) {
    userFormRef.value.resetFields()
  }
  userForm.id = ''
  userForm.username = ''
  userForm.password = ''
  userForm.name = ''
  userForm.email = ''
  userForm.phone = ''
  userForm.role_id = ''
  userForm.status = 1
}

const fetchUsersList = async () => {
  try {
    const params = {
      page: pagination.page,
      limit: pagination.pageSize
    }
    // 添加筛选参数
    if (searchForm.username) params.username = searchForm.username
    if (searchForm.phone) params.phone = searchForm.phone
    if (searchForm.role_id) params.role_id = searchForm.role_id
    if (searchForm.status) params.status = searchForm.status
    
    const usersResponse = await userApi.getList(params)
    console.log('API 返回的用户数据:', usersResponse.data)
    
    users.value = usersResponse.data.users || []
    pagination.total = usersResponse.data.pagination.total
  } catch (error) {
    ElMessage.error('获取用户列表失败：' + error.message)
    console.error('获取用户列表失败：', error)
  }
}

const handleSizeChange = (newSize) => {
  pagination.pageSize = newSize
  pagination.page = 1
  fetchUsersList()
}

const handlePageChange = (newPage) => {
  pagination.page = newPage
  fetchUsersList()
}

onMounted(async () => {
  try {
    // 尝试获取角色列表，如果失败（没有权限），则不显示角色信息
    try {
      const rolesResponse = await roleApi.getList()
      roles.value = rolesResponse.data || []
    } catch (roleError) {
      console.warn('获取角色列表失败（可能没有权限）:', roleError.message)
      // 如果没有角色权限，仍然可以显示用户列表
    }
    
    await fetchUsersList()
    updateStats()
  } catch (error) {
    ElMessage.error('获取数据失败：' + error.message)
    console.error('获取数据失败：', error)
  }
})

// 监听搜索条件变化，自动重置页码
watch(() => searchForm.role_id, () => {
  pagination.page = 1
})

watch(() => searchForm.status, () => {
  pagination.page = 1
})
</script>

<style scoped>
.users-container {
  padding: 20px;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-content h1 {
  margin: 0 0 8px 0;
  font-size: 38px;
  color: #303133;
}

.header-desc {
  margin: 0;
  font-size: 18px;
  color: #909399;
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.active {
  background: linear-gradient(135deg, #00b09b 0%, #96c93d 100%);
}

.stat-icon.inactive {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
}

.stat-icon.role {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-info {
  text-align: left;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 18px;
  color: #909399;
}

/* 搜索卡片 */
.search-card {
  margin-bottom: 20px;
}

/* 表格样式 */
:deep(.el-table) {
  font-size: 18px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

:deep(.el-tag) {
  margin-right: 4px;
}

/* 分页样式 */
:deep(.el-pagination) {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 对话框样式 */
:deep(.el-dialog__header) {
  padding-bottom: 10px;
}

:deep(.el-divider) {
  margin: 20px 0;
}

:deep(.el-divider__text) {
  font-weight: 600;
  color: #303133;
}
</style>

<template>
  <div class="roles-container">
    <!-- 页面标题和操作 -->
    <div class="page-header">
      <div class="header-content">
        <h1>角色管理</h1>
        <p class="header-desc">管理系统角色和权限分配，超级管理员可为各角色配置精细化的功能权限</p>
      </div>
      <el-button type="primary" @click="handleAddRole" icon="Plus" size="large">
        添加角色
      </el-button>
    </div>

    <!-- 角色列表 -->
    <el-card shadow="hover" class="roles-card">
      <el-table :data="roles" stripe style="width: 100%" v-loading="loading">
        <el-table-column label="序号" width="70" align="center">
          <template #default="{ $index }">
            {{ $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="角色名称" min-width="120">
          <template #default="{ row }">
            <div class="role-name-cell">
              <el-tag v-if="row.id === 1" type="danger" size="small" effect="dark" class="role-badge">超管</el-tag>
              <span class="role-name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="角色描述" min-width="220">
          <template #default="{ row }">
            <span class="role-desc">{{ row.description || '暂无描述' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="权限数量" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getPermissionCountType(row)" size="small" effect="plain">
              {{ row.name === '买家' ? '移动端用户' : getPermissionCount(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" min-width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right" align="center">
          <template #default="{ row }">
            <el-tooltip 
              :content="row.name === '买家' ? '买家是 C 端用户，无需后台权限' : '为该角色分配权限'"
              placement="top"
            >
              <el-button 
                type="success" 
                size="small" 
                @click="handleAssignPermissions(row)" 
                icon="Lock"
                :disabled="row.id === 1 || row.name === '买家'"
              >
                {{ row.name === '买家' ? '无需权限' : '分配权限' }}
              </el-button>
            </el-tooltip>
            <el-button 
              type="primary" 
              size="small" 
              @click="handleEditRole(row)" 
              icon="Edit"
              :disabled="row.id === 1"
            >
              编辑
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="handleDeleteRole(row)" 
              icon="Delete"
              :disabled="row.id === 1"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 添加/编辑角色对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑角色' : '添加角色'"
      width="500px"
      @close="resetForm"
    >
      <el-form :model="roleForm" :rules="rules" ref="roleFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="roleForm.description" type="textarea" :rows="3" placeholder="请输入角色描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 权限分配弹窗 -->
    <el-dialog
      v-model="showPermissionDialog"
      :title="'分配权限 — ' + currentRoleName"
      width="900px"
      top="5vh"
      :close-on-click-modal="false"
      @close="handlePermissionClose"
    >
      <PermissionAssign ref="permissionAssignRef" />
      <template #footer>
        <el-button @click="showPermissionDialog = false">取消</el-button>
        <el-button type="primary" @click="handlePermissionSave" :loading="submitLoading">保存权限</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { roleApi } from '../services/api'
import PermissionAssign from '../components/PermissionAssign.vue'

// 角色列表
const roles = ref([])
const loading = ref(false)
const submitLoading = ref(false)

// 对话框状态
const dialogVisible = ref(false)
const showPermissionDialog = ref(false)
const isEdit = ref(false)
const currentRoleId = ref(null)
const currentRoleName = ref('')

// 组件引用
const roleFormRef = ref(null)
const permissionAssignRef = ref(null)

// 表单数据
const roleForm = reactive({
  id: '',
  name: '',
  description: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '角色名称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入角色描述', trigger: 'blur' }
  ]
}

// 获取权限数量
const getPermissionCount = (role) => {
  const perms = parsePermissions(role.permissions)
  if (role.id === 1) return '全部权限'
  if (!perms || perms.length === 0) return '0'
  return perms.length + ' 个'
}

// 获取权限数量标签类型
const getPermissionCountType = (role) => {
  if (role.id === 1) return 'danger'
  const perms = parsePermissions(role.permissions)
  if (!perms || perms.length === 0) return 'info'
  if (perms.length > 20) return 'success'
  if (perms.length > 10) return 'warning'
  return 'info'
}

// 解析权限数据（兼容 JSON 字符串和数组）
const parsePermissions = (permissions) => {
  if (!permissions) return []
  if (Array.isArray(permissions)) return permissions
  if (typeof permissions === 'string') {
    try {
      const parsed = JSON.parse(permissions)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

// 添加角色
const handleAddRole = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 分配权限
const handleAssignPermissions = (role) => {
  // 买家角色不需要后台权限
  if (role.name === '买家') {
    ElMessage.info('买家角色是普通 C 端用户，不需要后台管理权限')
    return
  }
  
  currentRoleId.value = role.id
  currentRoleName.value = role.name
  showPermissionDialog.value = true
  
  nextTick(() => {
    if (permissionAssignRef.value) {
      const perms = parsePermissions(role.permissions)
      permissionAssignRef.value.setPermissions(perms)
    }
  })
}

// 编辑角色
const handleEditRole = (role) => {
  isEdit.value = true
  Object.assign(roleForm, {
    id: role.id,
    name: role.name,
    description: role.description || ''
  })
  dialogVisible.value = true
}

// 权限分配弹窗关闭
const handlePermissionClose = () => {
  showPermissionDialog.value = false
  currentRoleId.value = null
  currentRoleName.value = ''
}

// 保存权限分配
const handlePermissionSave = async () => {
  if (!permissionAssignRef.value) {
    ElMessage.error('权限组件未初始化')
    return
  }
  
  try {
    submitLoading.value = true
    const permissions = permissionAssignRef.value.getPermissions()
    await roleApi.updatePermissions(currentRoleId.value, permissions)
    await fetchRolesList()
    showPermissionDialog.value = false
    ElMessage.success('权限分配成功')
  } catch (error) {
    ElMessage.error('权限分配失败：' + error.message)
  } finally {
    submitLoading.value = false
  }
}

// 删除角色
const handleDeleteRole = async (role) => {
  if (role.id === 1) {
    ElMessage.warning('超级管理员角色不能删除')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除角色「${role.name}」吗？`,
      '确认删除',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    
    try {
      await roleApi.delete(role.id)
      await fetchRolesList()
      ElMessage.success('角色删除成功')
    } catch (apiError) {
      if (apiError.message && apiError.message.includes('该角色下存在')) {
        await ElMessageBox.confirm(apiError.message, '确认强制删除', {
          confirmButtonText: '强制删除',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await roleApi.delete(role.id, { force: true })
        await fetchRolesList()
        ElMessage.success('角色删除成功，关联用户已被置为无角色')
      } else {
        throw apiError
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除角色失败：' + (error.message || error))
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  roleFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        submitLoading.value = true
        if (isEdit.value) {
          await roleApi.update(roleForm.id, {
            name: roleForm.name,
            description: roleForm.description
          })
          ElMessage.success('角色编辑成功')
        } else {
          await roleApi.create({
            name: roleForm.name,
            description: roleForm.description,
            permissions: []
          })
          ElMessage.success('角色添加成功，请点击「分配权限」为其配置权限')
        }
        await fetchRolesList()
        dialogVisible.value = false
      } catch (error) {
        ElMessage.error('操作失败：' + error.message)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  roleForm.id = ''
  roleForm.name = ''
  roleForm.description = ''
  if (roleFormRef.value) {
    roleFormRef.value.resetFields()
  }
}

// 从 API 获取角色列表
const fetchRolesList = async () => {
  try {
    loading.value = true
    const res = await roleApi.getList()
    roles.value = res.data || []
  } catch (error) {
    ElMessage.error('获取角色列表失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}/${month}/${day} ${hours}:${minutes}`
}

// 页面加载时初始化数据
onMounted(async () => {
  await fetchRolesList()
})
</script>

<style scoped>
.roles-container {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 64px);
}

/* 页面标题 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 24px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.header-content h1 {
  margin: 0 0 6px 0;
  font-size: 22px;
  font-weight: 700;
  color: #1d2129;
}

.header-desc {
  margin: 0;
  font-size: 13px;
  color: #86909c;
}

/* 角色卡片 */
.roles-card {
  border-radius: 10px;
  border: none;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.roles-card :deep(.el-card__body) {
  padding: 0;
}

/* 角色名称样式 */
.role-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.role-name {
  font-weight: 600;
  color: #1d2129;
}

.role-badge {
  flex-shrink: 0;
}

.role-desc {
  color: #86909c;
  font-size: 13px;
}

/* 表格样式 */
:deep(.el-table th) {
  background-color: #fafbfc;
  font-weight: 600;
  color: #4e5969;
  font-size: 13px;
}

:deep(.el-table .cell) {
  padding: 12px 16px;
}

/* 按钮样式 */
:deep(.el-button--small) {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 6px;
}

/* 对话框 */
:deep(.el-dialog) {
  border-radius: 12px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

:deep(.el-dialog__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e6eb;
  margin: 0;
  flex-shrink: 0;
}

:deep(.el-dialog__body) {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid #e5e6eb;
  flex-shrink: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .roles-container {
    padding: 16px;
  }
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
}
</style>

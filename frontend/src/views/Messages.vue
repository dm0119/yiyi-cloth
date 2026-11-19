<template>
  <div class="messages-page">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>站内信</span>
          <el-button type="primary" @click="showNewMessageDialog = true">
            <el-icon><Plus /></el-icon>
            发送消息
          </el-button>
        </div>
      </template>

      <!-- 筛选 -->
      <div class="filter-bar">
        <el-radio-group v-model="activeTab" @change="loadMessages">
          <el-radio-button value="all">全部</el-radio-button>
          <el-radio-button value="unread">未读</el-radio-button>
          <el-radio-button value="important">重要</el-radio-button>
        </el-radio-group>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索消息主题或内容"
          clearable
          @clear="loadMessages"
          @keyup.enter="loadMessages"
          style="width: 300px; margin-left: 20px;"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 消息列表 -->
      <el-table :data="messages" stripe style="width: 100%" v-loading="loading">
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag v-if="!row.is_read" type="danger" size="small">未读</el-tag>
            <el-tag v-else type="info" size="small">已读</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发送者" width="120">
          <template #default="{ row }">
            <span>{{ getSenderName(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="主题" min-width="200">
          <template #default="{ row }">
            <span :style="{ fontWeight: !row.is_read ? 'bold' : 'normal' }">
              {{ row.subject || '无主题' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="内容" min-width="300" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.content }}
          </template>
        </el-table-column>
        <el-table-column label="时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewMessage(row)">查看</el-button>
            <el-button v-if="!row.is_read" type="success" link size="small" @click="markAsRead(row.id)">标为已读</el-button>
            <el-button :type="row.is_important ? 'warning' : 'info'" link size="small" @click="toggleImportant(row)">
              {{ row.is_important ? '取消重要' : '设为重要' }}
            </el-button>
            <el-button type="danger" link size="small" @click="deleteMessage(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadMessages"
          @current-change="loadMessages"
        />
      </div>
    </el-card>

    <!-- 消息详情弹窗 -->
    <el-dialog v-model="showDetailDialog" title="消息详情" width="600px">
      <div v-if="selectedMessage" class="message-detail">
        <div class="detail-header">
          <h3>{{ selectedMessage.subject || '无主题' }}</h3>
          <p>发送者：{{ getSenderName(selectedMessage) }}</p>
          <p>时间：{{ formatTime(selectedMessage.created_at) }}</p>
        </div>
        <div class="detail-body">{{ selectedMessage.content }}</div>
      </div>
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 发送消息弹窗 -->
    <el-dialog v-model="showNewMessageDialog" title="发送消息" width="600px" @close="resetNewMessageForm">
      <el-form :model="newMessage" label-width="100px">
        <el-form-item label="收件人角色" required>
          <el-select 
            v-model="selectedRole" 
            placeholder="请选择收件人角色" 
            @change="handleRoleChange"
            style="width: 100%;"
          >
            <el-option 
              v-for="role in availableRoles" 
              :key="role.value" 
              :label="role.label" 
              :value="role.value" 
            />
          </el-select>
        </el-form-item>

        <el-form-item label="收件人" required v-if="selectedRole">
          <div v-if="loadingUsers" class="loading-container">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>正在加载用户列表...</span>
          </div>
          <el-empty v-else-if="usersByRole.length === 0" description="该角色暂无可用用户" :image-size="80" />
          <div v-else class="user-list-container">
            <div class="user-list-header">
              <el-checkbox 
                v-model="selectAll" 
                @change="handleSelectAll"
                :indeterminate="isIndeterminate"
              >
                全选
              </el-checkbox>
              <span class="selected-count">已选择 {{ selectedUserIds.length }} / {{ usersByRole.length }}</span>
            </div>
            <el-scrollbar max-height="300px">
              <div 
                v-for="user in usersByRole" 
                :key="user.id"
                class="user-item"
                @click="toggleUserSelection(user.id)"
              >
                <el-checkbox 
                  :model-value="selectedUserIds.includes(user.id)"
                  @change="handleUserCheckboxChange(user.id, $event)"
                  @click.stop
                />
                <div class="user-info">
                  <span class="user-name">{{ user.username || user.phone }}</span>
                  <span class="user-contact">{{ user.phone || user.email }}</span>
                </div>
              </div>
            </el-scrollbar>
          </div>
        </el-form-item>

        <el-form-item label="主题">
          <el-input v-model="newMessage.subject" placeholder="请输入消息主题（可选）" />
        </el-form-item>
        <el-form-item label="内容" required>
          <el-input 
            v-model="newMessage.content" 
            type="textarea" 
            :rows="5" 
            placeholder="请输入消息内容" 
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>

        <!-- 选择确认信息 -->
        <el-alert 
          v-if="selectedRole && selectedUserIds.length > 0"
          :title="`确认发送：${getRoleLabel(selectedRole)} - 已选择 ${selectedUserIds.length} 个用户`"
          type="success"
          :closable="false"
          show-icon
          style="margin-top: 10px;"
        />
      </el-form>
      <template #footer>
        <el-button @click="showNewMessageDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="sendMessage" 
          :loading="sending"
          :disabled="!canSendMessage"
        >
          发送
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Search, Loading } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const sending = ref(false)
const loadingUsers = ref(false)
const activeTab = ref('all')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const messages = ref([])
const selectedMessage = ref(null)
const showDetailDialog = ref(false)
const showNewMessageDialog = ref(false)
const currentUserRole = ref(0)
const selectedRole = ref('')
const usersByRole = ref([])
const selectedUserIds = ref([])
const selectAll = ref(false)
const isIndeterminate = ref(false)

const newMessage = ref({
  receiver_role: '',
  receiver_id: '',
  subject: '',
  content: '',
  receiver_ids: []
})

const allRoles = [
  { value: 1, label: '超级管理员' },
  { value: 2, label: '运营人员' },
  { value: 3, label: '客服人员' },
  { value: 6, label: '商家' },
  { value: 5, label: '买家' }
]

// 角色名称到ID的映射
const roleNameToId = {
  '超级管理员': 1,
  '运营人员': 2,
  '客服人员': 3,
  '买家': 5,
  '商家': 6
}

const availableRoles = computed(() => {
  const currentRoleName = currentUserRole.value
  const currentRoleId = roleNameToId[currentRoleName] || 0
  
  // 运营人员可以看到所有角色（包括买家）
  if (currentRoleId === 2) {
    return allRoles
  }
  // 买家不能给自己发消息
  if (currentRoleId === 5) {
    return allRoles.filter(role => role.value !== 5)
  }
  // 其他后台角色不能给买家发消息（只有运营人员可以）
  return allRoles.filter(role => role.value !== 5)
})

const buyers = ref([])

const canSendMessage = computed(() => {
  if (!selectedRole.value) return false
  if (selectedUserIds.value.length === 0) return false
  if (!newMessage.value.content) return false
  
  const currentRoleId = roleNameToId[currentUserRole.value] || 0
  if (currentRoleId === 5) {
    return selectedUserIds.value.length === 1
  }
  
  return true
})

const getSenderName = (message) => {
  if (message.is_broadcast) return '系统群发'
  const names = {
    1: '超级管理员',
    2: '运营人员',
    3: '客服人员',
    5: '买家',
    6: '商家'
  }
  return names[message.sender_role] || '未知'
}

const getRoleLabel = (roleValue) => {
  const role = allRoles.find(r => r.value === roleValue)
  return role ? role.label : '未知角色'
}

const getUserDisplayName = (user) => {
  return user.username || user.phone || `用户${user.id}`
}

const getSelectedUserName = () => {
  const user = usersByRole.value.find(u => u.id === newMessage.value.receiver_id)
  return user ? getUserDisplayName(user) : ''
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString('zh-CN')
}

async function getToken() {
  return localStorage.getItem('admin_token') || localStorage.getItem('merchant_token')
}

async function loadMessages() {
  loading.value = true
  try {
    const token = await getToken()
    let url = `/api/messages/list?page=${currentPage.value}&pageSize=${pageSize.value}`
    if (activeTab.value === 'unread') url += '&type=unread'
    if (activeTab.value === 'important') url += '&type=important'
    if (searchKeyword.value) url += `&keyword=${encodeURIComponent(searchKeyword.value)}`

    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    if (data.success) {
      messages.value = data.data.messages || []
      total.value = data.data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载消息失败')
  } finally {
    loading.value = false
  }
}

async function viewMessage(row) {
  selectedMessage.value = row
  showDetailDialog.value = true
  if (!row.is_read) {
    await markAsRead(row.id)
  }
}

async function markAsRead(id) {
  try {
    const token = await getToken()
    await fetch(`/api/messages/${id}/read`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    loadMessages()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

async function toggleImportant(row) {
  try {
    const token = await getToken()
    await fetch(`/api/messages/${row.id}/important`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    loadMessages()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

async function deleteMessage(id) {
  try {
    await ElMessageBox.confirm('确定要删除这条消息吗？', '提示', { type: 'warning' })
    const token = await getToken()
    await fetch(`/api/messages/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    ElMessage.success('删除成功')
    loadMessages()
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('删除失败')
  }
}

async function loadUsersByRole(roleId) {
  if (!roleId) {
    usersByRole.value = []
    return
  }
  
  loadingUsers.value = true
  try {
    const token = await getToken()
    const res = await fetch(`/api/messages/users/by-role?role=${roleId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    if (data.success) {
      usersByRole.value = data.data.users || []
    } else {
      ElMessage.error(data.error || '加载用户列表失败')
      usersByRole.value = []
    }
  } catch (error) {
    ElMessage.error('加载用户列表失败')
    usersByRole.value = []
  } finally {
    loadingUsers.value = false
  }
}

async function loadBuyers() {
  try {
    const token = await getToken()
    const res = await fetch('/api/messages/buyers/list', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    if (data.success) {
      buyers.value = data.data.buyers || []
    }
  } catch (error) {
    console.error('加载买家列表失败:', error)
  }
}

function handleRoleChange(roleId) {
  newMessage.value.receiver_id = ''
  newMessage.value.receiver_ids = []
  selectedUserIds.value = []
  selectAll.value = false
  isIndeterminate.value = false
  loadUsersByRole(roleId)
}

function handleUserChange(userId) {
  // 用户选择完成，可以在这里添加额外逻辑
}

function handleSelectAll(checked) {
  if (checked) {
    selectedUserIds.value = usersByRole.value.map(user => user.id)
  } else {
    selectedUserIds.value = []
  }
  updateSelectAllState()
}

function handleUserCheckboxChange(userId, checked) {
  if (checked) {
    if (!selectedUserIds.value.includes(userId)) {
      selectedUserIds.value.push(userId)
    }
  } else {
    selectedUserIds.value = selectedUserIds.value.filter(id => id !== userId)
  }
  updateSelectAllState()
}

function toggleUserSelection(userId) {
  const index = selectedUserIds.value.indexOf(userId)
  if (index > -1) {
    selectedUserIds.value.splice(index, 1)
  } else {
    selectedUserIds.value.push(userId)
  }
  updateSelectAllState()
}

function updateSelectAllState() {
  const total = usersByRole.value.length
  const selected = selectedUserIds.value.length
  
  selectAll.value = selected === total && total > 0
  isIndeterminate.value = selected > 0 && selected < total
}

function resetNewMessageForm() {
  selectedRole.value = ''
  newMessage.value = { 
    receiver_role: '', 
    receiver_id: '',
    subject: '', 
    content: '', 
    receiver_ids: [] 
  }
  usersByRole.value = []
  selectedUserIds.value = []
  selectAll.value = false
  isIndeterminate.value = false
}

async function sendMessage() {
  if (!selectedRole.value) {
    ElMessage.warning('请选择收件人角色')
    return
  }
  if (selectedUserIds.value.length === 0) {
    ElMessage.warning('请选择收件人')
    return
  }
  if (!newMessage.value.content) {
    ElMessage.warning('请输入消息内容')
    return
  }

  // 确认发送
  const confirmMsg = `确定要发送消息给 ${getRoleLabel(selectedRole.value)} 的 ${selectedUserIds.value.length} 个用户吗？`
  
  try {
    await ElMessageBox.confirm(confirmMsg, '确认发送', { 
      type: 'warning',
      confirmButtonText: '确定发送',
      cancelButtonText: '取消'
    })
  } catch {
    return
  }

  sending.value = true
  try {
    const token = await getToken()
    const body = {
      receiver_role: selectedRole.value,
      receiver_ids: selectedUserIds.value,
      subject: newMessage.value.subject,
      content: newMessage.value.content
    }

    const res = await fetch('/api/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    const data = await res.json()
    if (data.success) {
      ElMessage.success('发送成功')
      showNewMessageDialog.value = false
      resetNewMessageForm()
      loadMessages()
    } else {
      ElMessage.error(data.error || '发送失败')
    }
  } catch (error) {
    ElMessage.error('发送失败')
  } finally {
    sending.value = false
  }
}

onMounted(() => {
  const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}')
  const merchantUser = JSON.parse(localStorage.getItem('merchant_user') || '{}')
  currentUserRole.value = adminUser.role || merchantUser.role || 0
  loadMessages()
})
</script>

<style scoped>
.messages-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.message-detail {
  padding: 10px 0;
}

.detail-header h3 {
  margin: 0 0 10px 0;
  font-size: 26px;
}

.detail-header p {
  margin: 5px 0;
  color: #666;
  font-size: 18px;
}

.detail-body {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  white-space: pre-wrap;
  line-height: 1.8;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: #409eff;
  font-size: 18px;
}

.loading-container .is-loading {
  font-size: 26px;
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.user-list-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
}

.user-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 10px;
}

.selected-count {
  font-size: 18px;
  color: #909399;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.user-item:hover {
  background-color: #f5f7fa;
}

.user-info {
  margin-left: 10px;
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-name {
  font-size: 18px;
  color: #303133;
}

.user-contact {
  font-size: 18px;
  color: #909399;
}
</style>

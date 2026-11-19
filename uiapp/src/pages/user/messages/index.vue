<template>
  <view class="messages-page">
    <!-- 头部 -->
    <view class="header">
      <view class="header-title">站内信</view>
      <view class="header-actions">
        <button class="btn-new" @click="showNewMessageModal = true">
          <text class="icon">✉️</text>
          新消息
        </button>
      </view>
    </view>

    <!-- 消息类型筛选 -->
    <view class="message-tabs">
      <view 
        v-for="tab in tabs" 
        :key="tab.key"
        :class="['tab-item', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
        <view v-if="tab.count > 0" class="badge">{{ tab.count }}</view>
      </view>
    </view>

    <!-- 消息列表 -->
    <view class="message-list">
      <view 
        v-for="message in filteredMessages" 
        :key="message.id"
        :class="['message-item', { unread: !message.is_read, important: message.is_important }]"
        @click="openMessageDetail(message)"
      >
        <view class="message-avatar">
          <text class="avatar-icon">{{ getRoleIcon(message.sender_role) }}</text>
        </view>
        <view class="message-content">
          <view class="message-header">
            <text class="sender-name">{{ getRoleName(message.sender_role) }}</text>
            <text class="message-time">{{ formatTime(message.created_at) }}</text>
          </view>
          <view class="message-subject">{{ message.subject || '无主题' }}</view>
          <view class="message-preview">{{ message.content }}</view>
        </view>
        <view v-if="!message.is_read" class="unread-indicator"></view>
      </view>

      <view v-if="filteredMessages.length === 0" class="empty-state">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无消息</text>
      </view>
    </view>

    <!-- 新消息弹窗 -->
    <view v-if="showNewMessageModal" class="modal-overlay" @click="showNewMessageModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">发送新消息</text>
          <button class="modal-close" @click="showNewMessageModal = false">×</button>
        </view>
        <view class="modal-body">
          <!-- 发送模式选择 -->
          <view v-if="userInfo.role === 2" class="send-mode-selector">
            <label>发送模式</label>
            <view class="mode-options">
              <view 
                :class="['mode-option', { active: sendMode === 'single' }]"
                @click="sendMode = 'single'"
              >
                <text class="mode-icon">👤</text>
                <text class="mode-label">选择发送</text>
                <text class="mode-desc">选择特定买家</text>
              </view>
              <view 
                :class="['mode-option', { active: sendMode === 'broadcast' }]"
                @click="sendMode = 'broadcast'"
              >
                <text class="mode-icon">📢</text>
                <text class="mode-label">群发通知</text>
                <text class="mode-desc">发给所有买家</text>
              </view>
            </view>
          </view>
          
          <!-- 选择发送模式 -->
          <view v-if="sendMode === 'single' || userInfo.role !== 2">
            <view class="form-group">
              <label>收件人</label>
              <picker 
                :range="availableRoles" 
                range-key="label"
                @change="onReceiverRoleChange"
              >
                <view class="picker">{{ selectedReceiverRole.label }}</view>
              </picker>
            </view>
            
            <!-- 买家选择器（仅运营人员选择发送模式时显示） -->
            <view v-if="selectedReceiverRole.value === 4 && userInfo.role === 2" class="form-group">
              <label>选择买家</label>
              <view class="buyer-selector">
                <button 
                  class="select-buyer-btn"
                  @click="showBuyerSelector = true"
                >
                  <text class="btn-text">
                    {{ selectedBuyers.length > 0 ? `已选择 ${selectedBuyers.length} 个买家` : '选择买家' }}
                  </text>
                  <text class="btn-icon">▼</text>
                </button>
              </view>
            </view>
          </view>
          
          <!-- 群发模式 -->
          <view v-if="sendMode === 'broadcast' && userInfo.role === 2" class="broadcast-info">
            <view class="info-icon">📢</view>
            <view class="info-content">
              <text class="info-title">群发通知</text>
              <text class="info-desc">此消息将发送给所有买家用户</text>
            </view>
          </view>
          
          <view class="form-group">
            <label>主题</label>
            <input v-model="newMessage.subject" placeholder="请输入消息主题" />
          </view>
          <view class="form-group">
            <label>内容</label>
            <textarea 
              v-model="newMessage.content" 
              placeholder="请输入消息内容"
              maxlength="500"
            />
          </view>
          <view class="form-actions">
            <button class="btn-cancel" @click="showNewMessageModal = false">取消</button>
            <button class="btn-send" @click="sendMessage">
              {{ sendMode === 'broadcast' ? '群发' : '发送' }}
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 买家选择器弹窗 -->
    <view v-if="showBuyerSelector" class="modal-overlay" @click="showBuyerSelector = false">
      <view class="modal-content buyer-selector-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">选择买家</text>
          <button class="modal-close" @click="showBuyerSelector = false">×</button>
        </view>
        <view class="modal-body">
          <view class="buyer-search">
            <input 
              v-model="buyerSearchKeyword" 
              placeholder="搜索买家用户名或手机号"
              class="search-input"
            />
          </view>
          <view class="buyer-list">
            <view 
              v-for="buyer in filteredBuyers" 
              :key="buyer.id"
              :class="['buyer-item', { selected: isBuyerSelected(buyer.id) }]"
              @click="toggleBuyerSelection(buyer)"
            >
              <view class="buyer-avatar">👤</view>
              <view class="buyer-info">
                <text class="buyer-name">{{ buyer.username }}</text>
                <text class="buyer-phone">{{ buyer.phone }}</text>
              </view>
              <view v-if="isBuyerSelected(buyer.id)" class="selected-icon">✓</view>
            </view>
            
            <view v-if="filteredBuyers.length === 0" class="empty-buyers">
              <text class="empty-icon">👥</text>
              <text class="empty-text">暂无买家数据</text>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="btn-cancel" @click="showBuyerSelector = false">取消</button>
          <button class="btn-confirm" @click="confirmBuyerSelection">确定</button>
        </view>
      </view>
    </view>

    <!-- 消息详情弹窗 -->
    <view v-if="selectedMessage" class="modal-overlay" @click="selectedMessage = null">
      <view class="modal-content message-detail" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ selectedMessage.subject || '消息详情' }}</text>
          <button class="modal-close" @click="selectedMessage = null">×</button>
        </view>
        <view class="message-detail-content">
          <view class="message-info">
            <text class="sender">发件人: {{ getRoleName(selectedMessage.sender_role) }}</text>
            <text class="time">{{ formatTime(selectedMessage.created_at) }}</text>
          </view>
          <view class="message-body">{{ selectedMessage.content }}</view>
          <view class="message-actions">
            <button class="btn-reply" @click="replyToMessage">回复</button>
            <button class="btn-delete" @click="deleteMessage">删除</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { messageApi } from '@/services/api.js'

export default {
  setup() {
    const store = useStore()
    
    // 响应式数据
    const activeTab = ref('all')
    const showNewMessageModal = ref(false)
    const showBuyerSelector = ref(false)
    const selectedMessage = ref(null)
    const messages = ref([])
    const sendMode = ref('single') // 'single' 或 'broadcast'
    const newMessage = ref({
      receiver_role: '',
      subject: '',
      content: '',
      receiver_ids: [] // 选择的买家ID列表
    })
    
    // 买家相关数据
    const buyers = ref([])
    const selectedBuyers = ref([])
    const buyerSearchKeyword = ref('')
    
    // 角色配置（后台角色 + 买家）
    const availableRoles = [
      { value: 1, label: '超级管理员' },
      { value: 2, label: '运营人员' },
      { value: 3, label: '客服人员' },
      { value: 5, label: '商家' },
      { value: 4, label: '买家' }
    ]
    
    const selectedReceiverRole = ref(availableRoles[0])
    
    // 标签页配置
    const tabs = computed(() => [
      { key: 'all', label: '全部', count: messages.value.length },
      { key: 'unread', label: '未读', count: messages.value.filter(m => !m.is_read).length },
      { key: 'important', label: '重要', count: messages.value.filter(m => m.is_important).length }
    ])
    
    // 过滤消息
    const filteredMessages = computed(() => {
      switch (activeTab.value) {
        case 'unread':
          return messages.value.filter(m => !m.is_read)
        case 'important':
          return messages.value.filter(m => m.is_important)
        default:
          return messages.value
      }
    })
    
    // 方法
    const getRoleIcon = (roleId) => {
      const icons = {
        1: '👑', // 超级管理员
        2: '👨‍💼', // 运营人员
        3: '💁', // 客服人员
        4: '👤', // 买家
        5: '🏪'  // 商家
      }
      return icons[roleId] || '👤'
    }
    
    const getRoleName = (roleId) => {
      const names = {
        1: '超级管理员',
        2: '运营人员',
        3: '客服人员',
        4: '买家',
        5: '商家'
      }
      return names[roleId] || '未知角色'
    }
    
    const formatTime = (time) => {
      const date = new Date(time)
      const now = new Date()
      const diff = now - date
      
      if (diff < 24 * 60 * 60 * 1000) {
        return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      } else {
        return date.toLocaleDateString('zh-CN')
      }
    }
    
    const onReceiverRoleChange = (e) => {
      const index = e.detail.value
      selectedReceiverRole.value = availableRoles[index]
      newMessage.value.receiver_role = availableRoles[index].value
    }
    
    const openMessageDetail = async (message) => {
      selectedMessage.value = message
      // 标记为已读
      if (!message.is_read) {
        await markAsRead(message.id)
      }
    }
    
    // 买家选择相关方法
    const loadBuyers = async () => {
      try {
        const response = await messageApi.getBuyers()
        buyers.value = response.data?.buyers || []
      } catch (error) {
        console.error('加载买家列表失败:', error)
      }
    }
    
    const filteredBuyers = computed(() => {
      if (!buyerSearchKeyword.value.trim()) {
        return buyers.value
      }
      const keyword = buyerSearchKeyword.value.toLowerCase()
      return buyers.value.filter(buyer => 
        buyer.username.toLowerCase().includes(keyword) ||
        (buyer.phone && buyer.phone.includes(keyword))
      )
    })
    
    const isBuyerSelected = (buyerId) => {
      return selectedBuyers.value.some(buyer => buyer.id === buyerId)
    }
    
    const toggleBuyerSelection = (buyer) => {
      const index = selectedBuyers.value.findIndex(b => b.id === buyer.id)
      if (index > -1) {
        selectedBuyers.value.splice(index, 1)
      } else {
        selectedBuyers.value.push(buyer)
      }
    }
    
    const confirmBuyerSelection = () => {
      newMessage.value.receiver_ids = selectedBuyers.value.map(buyer => buyer.id)
      showBuyerSelector.value = false
    }
    
    const sendMessage = async () => {
      if (!newMessage.value.content.trim()) {
        uni.showToast({ title: '请输入消息内容', icon: 'none' })
        return
      }
      
      try {
        // 构建发送参数
        const sendParams = {
          receiver_role: newMessage.value.receiver_role,
          subject: newMessage.value.subject,
          content: newMessage.value.content
        }
        
        // 如果是运营给买家发送，添加特殊参数
        if (userInfo.value.role === 2 && newMessage.value.receiver_role === 4) {
          if (sendMode.value === 'broadcast') {
            // 群发模式
            sendParams.send_mode = 'broadcast'
          } else {
            // 选择发送模式
            sendParams.send_mode = 'select'
            sendParams.receiver_ids = newMessage.value.receiver_ids
          }
        }
        
        // 调用发送消息API
        await messageApi.sendMessage(sendParams)
        
        uni.showToast({ 
          title: sendMode.value === 'broadcast' ? '群发成功' : '发送成功', 
          icon: 'success' 
        })
        
        showNewMessageModal.value = false
        newMessage.value = { 
          receiver_role: '', 
          subject: '', 
          content: '',
          receiver_ids: [] 
        }
        selectedBuyers.value = []
        sendMode.value = 'single'
        
        loadMessages()
      } catch (error) {
        uni.showToast({ title: '发送失败', icon: 'none' })
      }
    }
    
    const replyToMessage = () => {
      if (selectedMessage.value) {
        newMessage.value = {
          receiver_role: selectedMessage.value.sender_role,
          subject: `回复: ${selectedMessage.value.subject}`,
          content: ''
        }
        selectedMessage.value = null
        showNewMessageModal.value = true
      }
    }
    
    const deleteMessage = async () => {
      if (!selectedMessage.value) return
      
      try {
        await messageApi.deleteMessage(selectedMessage.value.id)
        uni.showToast({ title: '删除成功', icon: 'success' })
        selectedMessage.value = null
        loadMessages()
      } catch (error) {
        uni.showToast({ title: '删除失败', icon: 'none' })
      }
    }
    
    const loadMessages = async () => {
      try {
        const response = await messageApi.getMessages()
        messages.value = response.data?.messages || []
      } catch (error) {
        console.error('加载消息失败:', error)
      }
    }
    
    const markAsRead = async (messageId) => {
      try {
        await messageApi.markAsRead(messageId)
        // 更新本地状态
        const message = messages.value.find(m => m.id === messageId)
        if (message) {
          message.is_read = true
        }
      } catch (error) {
        console.error('标记已读失败:', error)
      }
    }
    
    // 生命周期
    onMounted(() => {
      loadMessages()
    })
    
    return {
      activeTab,
      showNewMessageModal,
      selectedMessage,
      messages,
      newMessage,
      availableRoles,
      selectedReceiverRole,
      tabs,
      filteredMessages,
      getRoleIcon,
      getRoleName,
      formatTime,
      onReceiverRoleChange,
      openMessageDetail,
      sendMessage,
      replyToMessage,
      deleteMessage
    }
  }
}
</script>

<style scoped>
.messages-page {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.btn-new {
  background: #007AFF;
  color: white;
  border: none;
  padding: 15rpx 25rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.message-tabs {
  display: flex;
  background: white;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 25rpx;
  font-size: 28rpx;
  color: #666;
  position: relative;
  transition: all 0.3s;
}

.tab-item.active {
  color: #007AFF;
  background: #f0f8ff;
}

.badge {
  position: absolute;
  top: 15rpx;
  right: 15rpx;
  background: #FF3B30;
  color: white;
  border-radius: 20rpx;
  padding: 5rpx 10rpx;
  font-size: 20rpx;
  min-width: 30rpx;
  text-align: center;
}

.message-list {
  background: white;
  border-radius: 15rpx;
  overflow: hidden;
}

.message-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  position: relative;
  transition: background-color 0.3s;
}

.message-item:last-child {
  border-bottom: none;
}

.message-item.unread {
  background: #f8fdff;
}

.message-item.important {
  border-left: 8rpx solid #FF9500;
}

.message-avatar {
  margin-right: 20rpx;
}

.avatar-icon {
  font-size: 40rpx;
}

.message-content {
  flex: 1;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.sender-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.message-time {
  font-size: 24rpx;
  color: #999;
}

.message-subject {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 5rpx;
  font-weight: 500;
}

.message-preview {
  font-size: 26rpx;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unread-indicator {
  width: 12rpx;
  height: 12rpx;
  background: #007AFF;
  border-radius: 50%;
  margin-left: 20rpx;
}

.empty-state {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
}

.empty-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 20rpx;
  width: 90%;
  max-width: 600rpx;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  background: none;
  border: none;
  font-size: 40rpx;
  color: #999;
  cursor: pointer;
}

.modal-body {
  padding: 30rpx;
}

.form-group {
  margin-bottom: 30rpx;
}

.form-group label {
  display: block;
  margin-bottom: 10rpx;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.picker {
  width: 100%;
  padding: 20rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  font-size: 28rpx;
  background: white;
}

.form-group textarea {
  height: 200rpx;
  resize: none;
}

.form-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
}

.btn-cancel,
.btn-send,
.btn-reply,
.btn-delete {
  flex: 1;
  padding: 20rpx;
  border: none;
  border-radius: 10rpx;
  font-size: 28rpx;
  cursor: pointer;
}

.btn-cancel {
  background: #f0f0f0;
  color: #666;
}

.btn-send {
  background: #007AFF;
  color: white;
}

.btn-reply {
  background: #34C759;
  color: white;
}

.btn-delete {
  background: #FF3B30;
  color: white;
}

.message-detail-content {
  padding: 30rpx;
}

.message-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30rpx;
  font-size: 26rpx;
  color: #666;
}

.message-body {
  font-size: 30rpx;
  line-height: 1.6;
  color: #333;
  margin-bottom: 40rpx;
}

.message-actions {
  display: flex;
  gap: 20rpx;
}
</style>
<template>
  <view class="messages-page">
    <!-- 头部 -->
    <view class="header">
      <view class="header-actions">
        <text class="unread-badge" v-if="unreadCount > 0">{{ unreadCount }}条未读</text>
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
        <view v-if="tab.count > 0 && tab.key !== 'all'" class="badge">{{ tab.count }}</view>
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
          <text class="avatar-icon">{{ getSenderIcon(message) }}</text>
        </view>
        <view class="message-content">
          <view class="message-header">
            <text class="sender-name">{{ getSenderName(message) }}</text>
            <text class="message-time">{{ formatTime(message.created_at) }}</text>
          </view>
          <view class="message-subject">{{ message.subject || '系统通知' }}</view>
          <view class="message-preview">{{ message.content }}</view>
        </view>
        <view v-if="!message.is_read" class="unread-indicator"></view>
      </view>

      <view v-if="filteredMessages.length === 0" class="empty-state">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无消息</text>
      </view>
    </view>

    <!-- 消息详情弹窗 -->
    <view v-if="showDetailModal" class="modal-overlay" @click="showDetailModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">消息详情</text>
          <text class="modal-close" @click="showDetailModal = false">×</text>
        </view>
        <view class="modal-body" v-if="selectedMessage">
          <view class="detail-header">
            <text class="detail-subject">{{ selectedMessage.subject || '系统通知' }}</text>
            <text class="detail-sender">来自：{{ getSenderName(selectedMessage) }}</text>
            <text class="detail-time">{{ formatTime(selectedMessage.created_at) }}</text>
          </view>
          <view class="detail-body">{{ selectedMessage.content }}</view>
          <view class="detail-actions">
            <button class="btn-important" :class="{ active: selectedMessage.is_important }" @click="toggleImportant">
              {{ selectedMessage.is_important ? '取消重要' : '标为重要' }}
            </button>
            <button class="btn-delete" @click="deleteMessage">删除</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { messageApi } from '@/services/api.js'

const activeTab = ref('all')
const showDetailModal = ref(false)
const selectedMessage = ref(null)
const messages = ref([])
const unreadCount = ref(0)

const tabs = computed(() => [
  { key: 'all', label: '全部', count: messages.value.length },
  { key: 'unread', label: '未读', count: messages.value.filter(m => !m.is_read).length },
  { key: 'important', label: '重要', count: messages.value.filter(m => m.is_important).length }
])

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

const getSenderIcon = (message) => {
  if (message.is_broadcast) return '📢'
  const icons = {
    1: '👑',
    2: '👨‍💼',
    3: '💁',
    5: '🏪'
  }
  return icons[message.sender_role] || '👤'
}

const getSenderName = (message) => {
  if (message.is_broadcast) return '系统群发'
  const names = {
    1: '超级管理员',
    2: '运营人员',
    3: '客服人员',
    5: '商家'
  }
  return names[message.sender_role] || '未知角色'
}

const formatTime = (time) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    if (hours > 0) return `${hours}小时前`
    const minutes = Math.floor(diff / (60 * 1000))
    return minutes > 0 ? `${minutes}分钟前` : '刚刚'
  }
  
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days}天前`
  }
  
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}

async function loadMessages() {
  try {
    const res = await messageApi.getMessages()
    messages.value = res.data?.messages || []
  } catch (error) {
    console.error('加载消息失败:', error)
  }
}

async function loadUnreadCount() {
  try {
    const res = await messageApi.getUnreadCount()
    if (res.success) {
      unreadCount.value = res.data.unreadCount || 0
    }
  } catch (error) {
    console.error('获取未读消息数失败:', error)
  }
}

function openMessageDetail(message) {
  selectedMessage.value = message
  showDetailModal.value = true
  
  if (!message.is_read) {
    markAsRead(message.id)
  }
}

async function markAsRead(messageId) {
  try {
    await messageApi.markAsRead(messageId)
    const msg = messages.value.find(m => m.id === messageId)
    if (msg) {
      msg.is_read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  } catch (error) {
    console.error('标记已读失败:', error)
  }
}

function deleteMessage() {
  if (!selectedMessage.value) return
  
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条消息吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await messageApi.deleteMessage(selectedMessage.value.id)
          uni.showToast({ title: '删除成功', icon: 'success' })
          showDetailModal.value = false
          loadMessages()
          loadUnreadCount()
        } catch (error) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}

async function toggleImportant() {
  if (!selectedMessage.value) return
  
  try {
    await messageApi.markAsImportant(selectedMessage.value.id)
    selectedMessage.value.is_important = !selectedMessage.value.is_important
    uni.showToast({ 
      title: selectedMessage.value.is_important ? '已标为重要' : '已取消重要', 
      icon: 'success' 
    })
  } catch (error) {
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

onMounted(() => {
  loadMessages()
  loadUnreadCount()
})

onShow(() => {
  loadMessages()
  loadUnreadCount()
})
</script>

<style scoped>
.messages-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.header-actions {
  display: flex;
  align-items: center;
}

.unread-badge {
  font-size: 24rpx;
  color: #ff6b6b;
  background-color: #fff0f0;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.message-tabs {
  display: flex;
  background-color: #fff;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #eee;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
}

.tab-item.active {
  color: #ff6b6b;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 4rpx;
  background-color: #ff6b6b;
  border-radius: 2rpx;
}

.badge {
  display: inline-block;
  min-width: 32rpx;
  height: 32rpx;
  line-height: 32rpx;
  padding: 0 8rpx;
  font-size: 20rpx;
  color: #fff;
  background-color: #ff6b6b;
  border-radius: 16rpx;
  margin-left: 8rpx;
  vertical-align: middle;
}

.message-list {
  padding: 20rpx;
}

.message-item {
  display: flex;
  align-items: flex-start;
  padding: 24rpx;
  margin-bottom: 16rpx;
  background-color: #fff;
  border-radius: 16rpx;
  position: relative;
}

.message-item.unread {
  background-color: #fff8f0;
}

.message-item.important {
  border-left: 4rpx solid #ff6b6b;
}

.message-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.avatar-icon {
  font-size: 40rpx;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
  padding-right: 30rpx;
}

.sender-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.message-time {
  font-size: 22rpx;
  color: #999;
}

.message-subject {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-preview {
  font-size: 24rpx;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.unread-indicator {
  width: 16rpx;
  height: 16rpx;
  background-color: #ff6b6b;
  border-radius: 50%;
  position: absolute;
  top: 30rpx;
  right: 120rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 90%;
  max-height: 80vh;
  background-color: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  width: 60rpx;
  height: 60rpx;
  border: none;
  background: none;
  font-size: 40rpx;
  color: #999;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.modal-body {
  padding: 30rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.detail-header {
  margin-bottom: 30rpx;
}

.detail-subject {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.detail-sender {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.detail-time {
  display: block;
  font-size: 24rpx;
  color: #999;
}

.detail-body {
  font-size: 28rpx;
  color: #333;
  line-height: 1.8;
  white-space: pre-wrap;
  margin-bottom: 30rpx;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
}

.btn-important {
  padding: 16rpx 40rpx;
  font-size: 28rpx;
  color: #faad14;
  background-color: #fff;
  border: 1rpx solid #faad14;
  border-radius: 8rpx;
}

.btn-important.active {
  color: #fff;
  background-color: #faad14;
}

.btn-delete {
  padding: 16rpx 40rpx;
  font-size: 28rpx;
  color: #fff;
  background-color: #ff4d4f;
  border: none;
  border-radius: 8rpx;
}
</style>

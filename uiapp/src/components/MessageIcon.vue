<template>
  <!-- 右上角站内信图标组件 -->
  <view class="message-icon-container">
    <view class="message-icon" @click="toggleMessagePanel">
      <!-- 铃铛图标 -->
      <text class="icon-bell" v-if="iconType === 'bell'">🔔</text>
      <!-- 信封图标 -->
      <text class="icon-envelope" v-else>✉️</text>
      
      <!-- 未读消息数量 -->
      <view v-if="unreadCount > 0" class="unread-badge">
        <text class="badge-text">{{ unreadCount > 99 ? '99+' : unreadCount }}</text>
      </view>
    </view>

    <!-- 消息面板 -->
    <view v-if="showMessagePanel" class="message-panel">
      <view class="panel-header">
        <text class="panel-title">站内信</text>
        <button class="panel-close" @click="showMessagePanel = false">×</button>
      </view>
      
      <view class="panel-content">
        <!-- 消息列表 -->
        <view 
          v-for="message in recentMessages" 
          :key="message.id"
          :class="['message-item', { unread: !message.is_read }]"
          @click="openMessage(message)"
        >
          <view class="message-avatar">
            <text class="avatar-icon">{{ getRoleIcon(message.sender_role) }}</text>
          </view>
          <view class="message-content">
            <view class="message-sender">{{ getRoleName(message.sender_role) }}</view>
            <view class="message-preview">{{ message.content }}</view>
            <view class="message-time">{{ formatTime(message.created_at) }}</view>
          </view>
          <view v-if="!message.is_read" class="unread-dot"></view>
        </view>
        
        <view v-if="recentMessages.length === 0" class="empty-message">
          <text class="empty-icon">📭</text>
          <text class="empty-text">暂无消息</text>
        </view>
      </view>
      
      <view class="panel-footer">
        <button class="view-all-btn" @click="goToMessagePage">查看全部</button>
      </view>
    </view>

    <!-- 遮罩层 -->
    <view 
      v-if="showMessagePanel" 
      class="panel-overlay" 
      @click="showMessagePanel = false"
    ></view>
  </view>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { messageApi } from '@/services/api.js'

export default {
  name: 'MessageIcon',
  
  props: {
    iconType: {
      type: String,
      default: 'bell', // 'bell' 或 'envelope'
      validator: (value) => ['bell', 'envelope'].includes(value)
    },
    position: {
      type: String,
      default: 'header' // 'header' 或 'sidebar'
    }
  },
  
  setup(props) {
    const store = useStore()
    
    // 响应式数据
    const showMessagePanel = ref(false)
    const unreadCount = ref(0)
    const recentMessages = ref([])
    
    // 计算属性
    const userInfo = computed(() => store.getters.userInfo)
    const isBackendUser = computed(() => {
      if (!userInfo.value) return false
      return [1, 2, 3, 5].includes(userInfo.value.role) // 后台角色
    })
    
    // 方法
    const toggleMessagePanel = () => {
      if (!isBackendUser.value) {
        uni.showToast({ title: '只有后台用户可以查看站内信', icon: 'none' })
        return
      }
      showMessagePanel.value = !showMessagePanel.value
      if (showMessagePanel.value) {
        loadRecentMessages()
      }
    }
    
    const loadUnreadCount = async () => {
      try {
        if (!isBackendUser.value) return
        
        const response = await messageApi.getUnreadCount()
        if (response.success) {
          unreadCount.value = response.data.unreadCount
        }
      } catch (error) {
        console.error('获取未读消息数失败:', error)
      }
    }
    
    const loadRecentMessages = async () => {
      try {
        if (!isBackendUser.value) return
        
        const response = await messageAPI.getRecentMessages(5)
        if (response.success) {
          recentMessages.value = response.data.messages
        }
      } catch (error) {
        console.error('加载最近消息失败:', error)
      }
    }
    
    const openMessage = async (message) => {
      // 标记为已读
      if (!message.is_read) {
        await messageAPI.markAsRead(message.id)
        message.is_read = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
      
      // 打开消息详情
      showMessagePanel.value = false
      uni.navigateTo({
        url: '/pages/user/messages/detail?id=' + message.id
      })
    }
    
    const goToMessagePage = () => {
      showMessagePanel.value = false
      uni.navigateTo({
        url: '/pages/user/messages/index'
      })
    }
    
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
      
      if (diff < 60 * 1000) {
        return '刚刚'
      } else if (diff < 60 * 60 * 1000) {
        return Math.floor(diff / (60 * 1000)) + '分钟前'
      } else if (diff < 24 * 60 * 60 * 1000) {
        return Math.floor(diff / (60 * 60 * 1000)) + '小时前'
      } else {
        return date.toLocaleDateString('zh-CN')
      }
    }
    
    // WebSocket 实时更新
    let wsConnection = null
    
    const connectWebSocket = () => {
      if (!userInfo.value || !isBackendUser.value) return
      
      try {
        const wsUrl = `ws://localhost:3000/ws/messages?userId=${userInfo.value.id}&role=${userInfo.value.role}`
        
        wsConnection = new WebSocket(wsUrl)
        
        wsConnection.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.type === 'new_message') {
              // 实时更新未读数量
              loadUnreadCount()
              
              // 如果面板打开，刷新消息列表
              if (showMessagePanel.value) {
                loadRecentMessages()
              }
            }
          } catch (error) {
            console.error('解析WebSocket消息失败:', error)
          }
        }
        
        wsConnection.onclose = () => {
          // 3秒后重连
          setTimeout(connectWebSocket, 3000)
        }
        
      } catch (error) {
        console.error('建立WebSocket连接失败:', error)
      }
    }
    
    // 轮询检查新消息
    let pollingInterval = null
    
    const startPolling = () => {
      pollingInterval = setInterval(() => {
        if (isBackendUser.value) {
          loadUnreadCount()
        }
      }, 30000) // 30秒检查一次
    }
    
    // 生命周期
    onMounted(() => {
      if (isBackendUser.value) {
        loadUnreadCount()
        connectWebSocket()
        startPolling()
      }
      
      // 监听登录状态变化
      store.watch(
        (state) => state.user.isLoggedIn,
        (isLoggedIn) => {
          if (isLoggedIn && isBackendUser.value) {
            loadUnreadCount()
            connectWebSocket()
            startPolling()
          } else {
            if (wsConnection) {
              wsConnection.close()
            }
            clearInterval(pollingInterval)
            unreadCount.value = 0
            recentMessages.value = []
          }
        }
      )
    })
    
    onUnmounted(() => {
      if (wsConnection) {
        wsConnection.close()
      }
      clearInterval(pollingInterval)
    })
    
    return {
      showMessagePanel,
      unreadCount,
      recentMessages,
      toggleMessagePanel,
      openMessage,
      goToMessagePage,
      getRoleIcon,
      getRoleName,
      formatTime
    }
  }
}
</script>

<style scoped>
.message-icon-container {
  position: relative;
  display: inline-block;
}

.message-icon {
  position: relative;
  cursor: pointer;
  padding: 8rpx;
  border-radius: 8rpx;
  transition: background-color 0.3s;
}

.message-icon:hover {
  background-color: #f5f5f5;
}

.icon-bell,
.icon-envelope {
  font-size: 36rpx;
  display: block;
}

.unread-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #FF3B30;
  color: white;
  border-radius: 20rpx;
  min-width: 30rpx;
  height: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  font-weight: bold;
}

.badge-text {
  line-height: 1;
}

.message-panel {
  position: absolute;
  top: 100%;
  right: 0;
  width: 400rpx;
  background: white;
  border-radius: 15rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 10rpx;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.panel-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.panel-close {
  background: none;
  border: none;
  font-size: 36rpx;
  color: #999;
  cursor: pointer;
  padding: 0;
}

.panel-content {
  max-height: 400rpx;
  overflow-y: auto;
}

.message-item {
  display: flex;
  align-items: flex-start;
  padding: 20rpx 25rpx;
  border-bottom: 1rpx solid #f8f8f8;
  cursor: pointer;
  transition: background-color 0.3s;
  position: relative;
}

.message-item:last-child {
  border-bottom: none;
}

.message-item:hover {
  background-color: #f8f9fa;
}

.message-item.unread {
  background-color: #f0f8ff;
}

.message-avatar {
  margin-right: 15rpx;
  flex-shrink: 0;
}

.avatar-icon {
  font-size: 32rpx;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-sender {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 5rpx;
}

.message-preview {
  font-size: 24rpx;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 5rpx;
}

.message-time {
  font-size: 22rpx;
  color: #999;
}

.unread-dot {
  position: absolute;
  top: 25rpx;
  right: 25rpx;
  width: 12rpx;
  height: 12rpx;
  background: #007AFF;
  border-radius: 50%;
}

.empty-message {
  text-align: center;
  padding: 60rpx 0;
  color: #999;
}

.empty-icon {
  font-size: 60rpx;
  display: block;
  margin-bottom: 15rpx;
}

.empty-text {
  font-size: 26rpx;
}

.panel-footer {
  padding: 20rpx 25rpx;
  border-top: 1rpx solid #f0f0f0;
}

.view-all-btn {
  width: 100%;
  background: #007AFF;
  color: white;
  border: none;
  padding: 20rpx;
  border-radius: 10rpx;
  font-size: 26rpx;
  cursor: pointer;
}

.panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 999;
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .message-panel {
    width: 90vw;
    right: 5vw;
  }
}
</style>
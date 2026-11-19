<template>
  <!-- 全局消息通知组件 -->
  <view v-if="showNotification" class="notification-container">
    <view 
      :class="['notification', notificationType]"
      @click="handleNotificationClick"
    >
      <view class="notification-icon">
        <text>{{ getNotificationIcon(notificationType) }}</text>
      </view>
      <view class="notification-content">
        <view class="notification-title">{{ notificationData.title }}</view>
        <view class="notification-message">{{ notificationData.message }}</view>
        <view class="notification-time">{{ formatTime(notificationData.time) }}</view>
      </view>
      <button class="notification-close" @click.stop="closeNotification">×</button>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'MessageNotification',
  
  setup() {
    const store = useStore()
    
    // 响应式数据
    const showNotification = ref(false)
    const notificationData = ref({})
    const notificationTimer = ref(null)
    
    // 计算属性
    const notificationType = computed(() => {
      return notificationData.value.type || 'info'
    })
    
    // 方法
    const getNotificationIcon = (type) => {
      const icons = {
        info: '💬',
        warning: '⚠️',
        error: '❌',
        success: '✅',
        important: '❗'
      }
      return icons[type] || '💬'
    }
    
    const formatTime = (time) => {
      if (!time) return ''
      const date = new Date(time)
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
    
    const showNewMessageNotification = (message) => {
      notificationData.value = {
        title: '新消息',
        message: `来自${getRoleName(message.sender_role)}: ${message.content.substring(0, 30)}...`,
        type: 'info',
        time: new Date(),
        messageId: message.id,
        senderRole: message.sender_role
      }
      showNotification.value = true
      
      // 5秒后自动关闭
      clearTimeout(notificationTimer.value)
      notificationTimer.value = setTimeout(() => {
        closeNotification()
      }, 5000)
    }
    
    const showSystemNotification = (title, message, type = 'info') => {
      notificationData.value = {
        title,
        message,
        type,
        time: new Date()
      }
      showNotification.value = true
      
      clearTimeout(notificationTimer.value)
      notificationTimer.value = setTimeout(() => {
        closeNotification()
      }, 5000)
    }
    
    const closeNotification = () => {
      showNotification.value = false
      clearTimeout(notificationTimer.value)
    }
    
    const handleNotificationClick = () => {
      if (notificationData.value.messageId) {
        // 跳转到消息详情
        uni.navigateTo({
          url: '/pages/user/messages/index'
        })
      }
      closeNotification()
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
    
    // WebSocket连接
    let wsConnection = null
    
    const connectWebSocket = () => {
      try {
        const userInfo = store.getters.userInfo
        if (!userInfo || !userInfo.id) return
        
        // 构建WebSocket URL
        const wsUrl = `ws://localhost:3000/ws/messages?userId=${userInfo.id}&role=${userInfo.role}`
        
        wsConnection = new WebSocket(wsUrl)
        
        wsConnection.onopen = () => {
          console.log('消息通知WebSocket连接成功')
        }
        
        wsConnection.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            handleWebSocketMessage(data)
          } catch (error) {
            console.error('解析WebSocket消息失败:', error)
          }
        }
        
        wsConnection.onclose = () => {
          console.log('消息通知WebSocket连接关闭')
          // 3秒后重连
          setTimeout(connectWebSocket, 3000)
        }
        
        wsConnection.onerror = (error) => {
          console.error('消息通知WebSocket连接错误:', error)
        }
        
      } catch (error) {
        console.error('建立WebSocket连接失败:', error)
      }
    }
    
    const handleWebSocketMessage = (data) => {
      switch (data.type) {
        case 'new_message':
          showNewMessageNotification(data.message)
          break
        case 'system_notification':
          showSystemNotification(data.title, data.message, data.notificationType)
          break
        case 'important_alert':
          showSystemNotification(data.title, data.message, 'important')
          break
      }
    }
    
    // 轮询检查新消息（备用方案）
    let pollingInterval = null
    
    const startPolling = () => {
      pollingInterval = setInterval(async () => {
        try {
          const userInfo = store.getters.userInfo
          if (!userInfo) return
          
          const response = await store.dispatch('message/checkNewMessages')
          if (response.data && response.data.hasNewMessages) {
            showSystemNotification('新消息提醒', `您有 ${response.data.count} 条新消息`, 'info')
          }
        } catch (error) {
          console.error('轮询检查新消息失败:', error)
        }
      }, 30000) // 30秒检查一次
    }
    
    // 生命周期
    onMounted(() => {
      // 优先使用WebSocket，失败时使用轮询
      connectWebSocket()
      
      // 监听登录状态变化
      store.watch(
        (state) => state.user.isLoggedIn,
        (isLoggedIn) => {
          if (isLoggedIn) {
            connectWebSocket()
          } else {
            if (wsConnection) {
              wsConnection.close()
            }
            clearInterval(pollingInterval)
          }
        }
      )
    })
    
    onUnmounted(() => {
      if (wsConnection) {
        wsConnection.close()
      }
      clearTimeout(notificationTimer.value)
      clearInterval(pollingInterval)
    })
    
    // 暴露方法供其他组件调用
    return {
      showNotification,
      notificationData,
      notificationType,
      getNotificationIcon,
      formatTime,
      closeNotification,
      handleNotificationClick,
      showNewMessageNotification,
      showSystemNotification
    }
  }
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 100rpx;
  right: 30rpx;
  z-index: 9999;
  max-width: 400rpx;
}

.notification {
  background: white;
  border-radius: 15rpx;
  padding: 25rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: flex-start;
  border-left: 8rpx solid #007AFF;
  animation: slideIn 0.3s ease-out;
  cursor: pointer;
  transition: transform 0.2s;
}

.notification:hover {
  transform: translateY(-2rpx);
}

.notification.info {
  border-left-color: #007AFF;
}

.notification.warning {
  border-left-color: #FF9500;
}

.notification.error {
  border-left-color: #FF3B30;
}

.notification.success {
  border-left-color: #34C759;
}

.notification.important {
  border-left-color: #FF2D55;
  background: #FFF5F5;
}

.notification-icon {
  margin-right: 20rpx;
  font-size: 36rpx;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 5rpx;
}

.notification-message {
  font-size: 26rpx;
  color: #666;
  line-height: 1.4;
  margin-bottom: 5rpx;
}

.notification-time {
  font-size: 22rpx;
  color: #999;
}

.notification-close {
  background: none;
  border: none;
  font-size: 32rpx;
  color: #999;
  cursor: pointer;
  padding: 0;
  margin-left: 15rpx;
  line-height: 1;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .notification-container {
    right: 20rpx;
    left: 20rpx;
    max-width: none;
  }
  
  .notification {
    max-width: 100%;
  }
}
</style>
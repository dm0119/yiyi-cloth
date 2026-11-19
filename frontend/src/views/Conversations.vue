<template>
  <div class="conversations-container">
    <!-- 左侧会话列表 -->
    <div class="conversation-list">
      <div class="list-header">
        <h2>会话列表</h2>
        <div class="filter-buttons">
          <el-button 
            type="primary" 
            :plain="activeFilter !== 'all'" 
            @click="activeFilter = 'all'"
          >
            全部
          </el-button>
          <el-button 
            type="warning" 
            :plain="activeFilter !== 'active'" 
            @click="activeFilter = 'active'"
          >
            活跃
          </el-button>
          <el-button 
            type="info" 
            :plain="activeFilter !== 'closed'" 
            @click="activeFilter = 'closed'"
          >
            已关闭
          </el-button>
        </div>
      </div>
      <div class="list-content">
        <el-scrollbar height="100%">
          <div 
            v-for="conversation in filteredConversations" 
            :key="conversation.id"
            class="conversation-item"
            :class="{ active: selectedConversation?.id === conversation.id }"
            @click="selectConversation(conversation)"
          >
            <div class="conversation-info">
              <h3>{{ conversation.buyer_name }}</h3>
              <p class="last-message">{{ getLastMessage(conversation) }}</p>
              <span class="time">{{ formatTime(conversation.updated_at) }}</span>
            </div>
            <div class="conversation-status">
              <el-tag 
                :type="conversation.status === 'active' ? 'success' : 'info'"
                size="small"
              >
                {{ conversation.status === 'active' ? '活跃' : '已关闭' }}
              </el-tag>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>

    <!-- 右侧会话详情 -->
    <div class="conversation-detail" v-if="selectedConversation">
      <div class="detail-header">
        <div class="header-info">
          <h2>{{ selectedConversation.buyer_name }}</h2>
          <span class="status">
            {{ selectedConversation.status === 'active' ? '在线' : '离线' }}
          </span>
        </div>
        <div class="header-actions">
          <el-button 
            type="primary" 
            size="small"
            @click="refreshMessages"
          >
            <el-icon><RefreshRight /></el-icon>
          </el-button>
          <el-button 
            :type="selectedConversation.status === 'active' ? 'danger' : 'success'"
            size="small"
            @click="toggleConversationStatus"
          >
            {{ selectedConversation.status === 'active' ? '关闭会话' : '重新开启' }}
          </el-button>
          <el-button 
            type="danger" 
            size="small"
            @click="deleteConversation"
            v-if="hasPermission('conversation:delete')"
          >
            删除会话
          </el-button>
        </div>
      </div>

      <!-- 消息列表 -->
      <div class="message-list">
        <div class="message-scroll-container" ref="messageScrollContainer">
          <div class="message-content-wrapper">
            <div 
              v-for="message in messages" 
              :key="message.id"
              class="message-item"
              :class="message.sender_role === 'customer_service' ? 'sent' : 'received'"
            >
              <div class="message-content">
                <p>{{ message.content }}</p>
                <span class="message-time">{{ formatTime(message.created_at) }}</span>
                <el-tag 
                  v-if="message.sender_role === 'buyer' && message.is_read"
                  size="small"
                  type="success"
                >
                  已读
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 消息输入区域 -->
      <div class="message-input">
        <el-input
          v-model="messageInput"
          placeholder="输入消息..."
          type="textarea"
          :rows="2"
          resize="none"
          @keyup.enter.exact="sendMessage"
        ></el-input>
        <div class="input-actions">
          <el-button type="primary" @click="sendMessage">发送</el-button>
        </div>
      </div>
    </div>

    <!-- 未选择会话时的提示 -->
    <div class="no-selection" v-else>
      <el-empty description="请选择一个会话开始聊天"></el-empty>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { ElMessage, ElNotification, ElMessageBox } from 'element-plus'
import { RefreshRight } from '@element-plus/icons-vue'
import { io } from 'socket.io-client'
import { conversationApi } from '../services/api'
import { usePermission } from '../mixins/permission'

export default {
  name: 'Conversations',
  props: {
    id: {
      type: String,
      default: null
    }
  },
  setup(props) {
    const conversations = ref([])
    const selectedConversation = ref(null)
    const messages = ref([])
    const messageInput = ref('')
    const activeFilter = ref('all')
    const messageScrollbar = ref(null)
    const messageScrollContainer = ref(null)
    const socket = ref(null)
    const { hasPermission } = usePermission()

    // 获取会话列表
    const getConversations = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('admin_user'))
        const response = await conversationApi.getList({
          userId: user.id,
          role: user.role
        })
        conversations.value = response.data || []

        // 如果有 props.id，自动选择对应的会话
        if (props.id) {
          const conversation = conversations.value.find(c => c.id === parseInt(props.id))
          if (conversation) {
            selectConversation(conversation)
          }
        }
      } catch (error) {
        ElMessage.error('获取会话列表失败')
        console.error('获取会话列表失败:', error)
        conversations.value = []
      }
    }

    // 筛选会话
    const filteredConversations = computed(() => {
      if (activeFilter.value === 'all') {
        return conversations.value
      }
      return conversations.value.filter(c => c.status === activeFilter.value)
    })

    // 检查是否是管理员
    const isAdmin = computed(() => {
      const user = JSON.parse(localStorage.getItem('admin_user'))
      return user && user.role === '超级管理员'
    })

    // 选择会话
    const selectConversation = async (conversation) => {
      selectedConversation.value = conversation
      await getMessages(conversation.id)
      
      // 连接Socket.io
      if (socket.value) {
        socket.value.disconnect()
      }
      
      socket.value = io('http://localhost:3000')
      
      // 加入会话房间
      socket.value.on('connect', () => {
        socket.value.emit('join-conversation', conversation.id)
      })
      
      // 接收新消息
      socket.value.on('new-message', (message) => {
        messages.value.push(message)
        scrollToBottom()
        
        // 如果不是当前会话的消息，显示通知
        if (message.conversation_id !== selectedConversation.value.id) {
          ElNotification({
            title: '新消息',
            message: message.content,
            type: 'info'
          })
        }
      })
      
      // 消息已读通知
      socket.value.on('messages-read', (data) => {
        if (data.conversationId === selectedConversation.value.id) {
          messages.value.forEach(msg => {
            if (msg.sender_role === 'buyer') {
              msg.is_read = true
            }
          })
        }
      })
    }

    // 获取消息列表
    const getMessages = async (conversationId) => {
      try {
        const response = await conversationApi.getMessages(conversationId, {
          page: 1,
          pageSize: 100
        })
        messages.value = response.messages || []
        
        // 滚动到底部
        nextTick(() => {
          scrollToBottom()
        })
        
        // 标记消息为已读
        markMessagesAsRead(conversationId)
      } catch (error) {
        ElMessage.error('获取消息列表失败')
        console.error('获取消息列表失败:', error)
        messages.value = []
      }
    }

    // 刷新消息
    const refreshMessages = async () => {
      if (selectedConversation.value) {
        await getMessages(selectedConversation.value.id)
      }
    }

    // 发送消息
    const sendMessage = async () => {
      if (!messageInput.value.trim() || !selectedConversation.value) return
      
      const messageData = {
        conversationId: selectedConversation.value.id,
        senderId: JSON.parse(localStorage.getItem('admin_user')).id,
        senderRole: 'customer_service',
        content: messageInput.value.trim(),
        type: 'text'
      }
      
      try {
        // 通过Socket.io发送消息
        socket.value.emit('send-message', messageData)
        messageInput.value = ''
      } catch (error) {
        ElMessage.error('发送消息失败')
        console.error('发送消息失败:', error)
      }
    }

    // 切换会话状态
    const toggleConversationStatus = async () => {
      if (!selectedConversation.value) return
      
      try {
        const newStatus = selectedConversation.value.status === 'active' ? 'closed' : 'active'
        const response = await conversationApi.closeConversation(selectedConversation.value.id, newStatus)
        
        if (response.message) {
          selectedConversation.value.status = newStatus
          getConversations()
          ElMessage.success(response.message)
        }
      } catch (error) {
        ElMessage.error('更新会话状态失败')
        console.error('更新会话状态失败:', error)
      }
    }

    // 删除会话
    const deleteConversation = async () => {
      if (!selectedConversation.value) return
      
      if (!hasPermission('conversation:delete')) {
        ElMessage.warning('您没有删除会话的权限')
        return
      }
      
      try {
        await ElMessageBox.confirm(
          '删除后该会话及其所有消息将被隐藏，确定要删除吗？',
          '删除确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        await conversationApi.delete(selectedConversation.value.id)
        
        selectedConversation.value = null
        messages.value = []
        getConversations()
        ElMessage.success('会话已删除')
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除会话失败')
          console.error('删除会话失败:', error)
        }
      }
    }

    // 标记消息为已读
    const markMessagesAsRead = async (conversationId) => {
      try {
        await conversationApi.markMessagesAsRead(conversationId, {
          userId: JSON.parse(localStorage.getItem('admin_user')).id,
          role: 'customer_service'
        })
        
        // 通知对方消息已读
        if (socket.value) {
          socket.value.emit('mark-read', {
            conversationId,
            userId: JSON.parse(localStorage.getItem('admin_user')).id,
            role: 'customer_service'
          })
        }
      } catch (error) {
        console.error('标记消息为已读失败:', error)
      }
    }

    // 格式化时间
    const formatTime = (time) => {
      const date = new Date(time)
      return date.toLocaleTimeString()
    }

    // 获取最后一条消息
    const getLastMessage = (conversation) => {
      // 这里可以优化为从API获取最后一条消息
      return '点击查看消息历史'
    }

    // 滚动到底部
    const scrollToBottom = () => {
      nextTick(() => {
        if (messageScrollContainer.value) {
          const container = messageScrollContainer.value
          // 使用平滑滚动
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          })
        }
      })
    }

    // 监听props.id变化
    watch(() => props.id, (newId) => {
      if (newId && conversations.value.length > 0) {
        const conversation = conversations.value.find(c => c.id === parseInt(newId))
        if (conversation) {
          selectConversation(conversation)
        }
      }
    })

    // 初始化
    onMounted(() => {
      getConversations()
    })

    return {
      conversations,
      selectedConversation,
      messages,
      messageInput,
      activeFilter,
      messageScrollbar,
      messageScrollContainer,
      filteredConversations,
      isAdmin,
      hasPermission,
      getConversations,
      selectConversation,
      getMessages,
      refreshMessages,
      sendMessage,
      toggleConversationStatus,
      deleteConversation,
      formatTime,
      getLastMessage,
      scrollToBottom
    }
  }
}
</script>

<style scoped>
.conversations-container {
  display: flex;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.conversation-list {
  width: 350px;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  min-width: 0;
}

.list-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fafafa;
}

.list-header h2 {
  margin: 0 0 16px 0;
  font-size: 26px;
}

.filter-buttons {
  display: flex;
  gap: 8px;
}

.list-content {
  flex: 1;
  overflow: hidden;
}

.conversation-item {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.conversation-item:hover {
  background-color: #f5f7fa;
}

.conversation-item.active {
  background-color: #e6f7ff;
  border-right: 3px solid #1890ff;
}

.conversation-info h3 {
  margin: 0 0 8px 0;
  font-size: 22px;
}

.last-message {
  margin: 0 0 4px 0;
  font-size: 18px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 250px;
}

.time {
  font-size: 18px;
  color: #999;
}

.conversation-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fafafa;
  overflow: hidden;
  min-width: 0;
}

.detail-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.header-info h2 {
  margin: 0;
  font-size: 26px;
}

.status {
  margin-left: 8px;
  font-size: 18px;
  color: #52c41a;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.message-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  overflow: hidden;
}

.message-scroll-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  min-height: 0;
}

/* 自定义滚动条样式 */
.message-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.message-scroll-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.message-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  transition: background 0.3s;
}

.message-scroll-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* Firefox 滚动条样式 */
.message-scroll-container {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.05);
}

.message-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: fit-content;
}

.message-item {
  display: flex;
  align-items: flex-end;
  animation: messageSlideIn 0.3s ease-out;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-item.sent {
  justify-content: flex-end;
}

.message-item.received {
  justify-content: flex-start;
}

.message-content {
  max-width: 60%;
  padding: 12px 16px;
  border-radius: 8px;
  position: relative;
  word-wrap: break-word;
  word-break: break-word;
}

.message-item.sent .message-content {
  background-color: #1890ff;
  color: #fff;
  border-bottom-right-radius: 0;
}

.message-item.received .message-content {
  background-color: #fff;
  color: #333;
  border-bottom-left-radius: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message-content p {
  margin: 0 0 4px 0;
  line-height: 1.5;
}

.message-time {
  font-size: 12px;
  opacity: 0.7;
  display: inline-block;
  margin-right: 8px;
}

.message-input {
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  background-color: #fff;
  flex-shrink: 0;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.no-selection {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fafafa;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .conversations-container {
    flex-direction: column;
  }
  
  .conversation-list {
    width: 100%;
    height: 40%;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .conversation-detail {
    height: 60%;
  }
  
  .message-content {
    max-width: 80%;
  }
}
</style>

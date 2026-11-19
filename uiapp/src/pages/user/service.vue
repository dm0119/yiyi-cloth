<template>
  <view class="service-container">
    <van-nav-bar title="联系客服" left-text="返回" left-arrow @click-left="goBack" />
    
    <view class="chat-container" v-if="isLoggedIn">
      <!-- 关联内容区域 -->
      <view class="related-content" v-if="relatedItems.length > 0">
        <view class="related-header">
          <text class="related-title">关联内容</text>
          <van-icon name="close" @click="clearRelatedItems" size="20" color="#999" />
        </view>
        <view class="related-list">
          <view 
            v-for="item in relatedItems" 
            :key="item.id"
            class="related-item"
            :class="item.type"
          >
            <view class="related-info">
              <text class="related-label">{{ item.type === 'product' ? '商品' : '订单' }}</text>
              <text class="related-name">{{ item.name }}</text>
              <text v-if="item.type === 'order'" class="related-detail">订单号: {{ item.order_no }}</text>
              <text v-else class="related-detail">价格: ¥{{ item.price }}</text>
            </view>
            <van-icon name="cross" @click="removeRelatedItem(item)" size="20" color="#ff4d4f" />
          </view>
        </view>
      </view>

      <!-- 消息列表 -->
      <scroll-view class="message-list" scroll-y="true" :scroll-top="scrollTop" @scroll="onScroll">
        <view 
          v-for="message in messages" 
          :key="message.id || Math.random()"
          class="message-item"
          :class="message.sender_role === 'buyer' ? 'sent' : 'received'"
        >
          <view class="message-content">
            <text class="message-text">{{ message.content }}</text>
            
            <!-- 关联内容展示 -->
            <view v-if="message.relatedItems && message.relatedItems.length > 0" class="message-related">
              <view 
                v-for="item in message.relatedItems" 
                :key="item.id"
                class="message-related-item"
              >
                <text class="related-type">{{ item.type === 'product' ? '【商品】' : '【订单】' }}</text>
                <text class="related-name">{{ item.name }}</text>
                <text v-if="item.type === 'product'" class="related-price">¥{{ item.price }}</text>
                <text v-else class="related-order">订单号: {{ item.order_no }}</text>
              </view>
            </view>
            
            <view class="message-footer">
              <text class="message-time">{{ formatTime(message.created_at) }}</text>
              <van-tag 
                v-if="message.sender_role === 'customer_service' && message.is_read"
                size="small"
                type="success"
                plain
              >
                已读
              </van-tag>
            </view>
          </view>
        </view>
        <view class="loading" v-if="loading">
          <van-loading type="spinner" size="20" />
          <text>加载中...</text>
        </view>
      </scroll-view>
      
      <!-- 输入区域 -->
      <view class="input-container">
        <view class="input-tools">
          <van-button 
            type="default" 
            size="small" 
            icon="link" 
            plain
            @click="showRelatedItems"
          >
            添加
          </van-button>
        </view>
        <van-field
          v-model="messageInput"
          placeholder="输入消息..."
          type="textarea"
          :rows="2"
          autosize
          maxlength="500"
          :show-word-limit="false"
          @keypress.enter="sendMessage"
        />
        <van-button type="primary" size="small" @click="sendMessage">
          发送
        </van-button>
      </view>
    </view>
    
    <!-- 未登录提示 -->
    <view class="login-prompt" v-else>
      <van-empty description="请先登录" />
      <van-button type="primary" @click="goToLogin">登录</van-button>
    </view>

    <!-- 关联内容选择对话框 -->
    <van-popup v-model:show="showRelatedDialog" position="bottom" round>
      <view class="related-dialog">
        <view class="dialog-header">
          <text class="dialog-title">选择关联内容</text>
          <van-icon name="close" @click="showRelatedDialog = false" size="24" color="#999" />
        </view>

        <!-- 收藏商品 -->
        <view class="dialog-section">
          <view class="section-header" @click="toggleSection('favorites')">
            <text class="section-title">我的收藏</text>
            <van-icon :name="expandedSections.favorites ? 'arrow-up' : 'arrow-down'" size="20" color="#999" />
          </view>
          <view v-if="expandedSections.favorites" class="item-list">
            <view v-if="loadingProducts" class="loading">
              <van-loading type="spinner" size="20" />
            </view>
            <view 
              v-for="product in products" 
              :key="product.id"
              class="list-item product-item"
              @click="selectRelatedItem(product)"
            >
              <image :src="product.image" mode="aspectFill" class="item-image" />
              <view class="item-info">
                <text class="item-name">{{ product.name }}</text>
                <text class="item-price">¥{{ product.price }}</text>
              </view>
              <van-icon name="arrow" size="20" color="#999" />
            </view>
            <view v-if="!loadingProducts && products.length === 0" class="empty">
              <text>暂无收藏商品</text>
            </view>
          </view>
        </view>



        <!-- 订单列表 -->
        <view class="dialog-section">
          <view class="section-header" @click="toggleSection('orders')">
            <text class="section-title">订单</text>
            <van-icon :name="expandedSections.orders ? 'arrow-up' : 'arrow-down'" size="20" color="#999" />
          </view>
          <view v-if="expandedSections.orders" class="item-list">
            <view v-if="loadingOrders" class="loading">
              <van-loading type="spinner" size="20" />
            </view>
            <view 
              v-for="order in orders" 
              :key="order.id"
              class="list-item order-item"
              @click="selectRelatedItem(order)"
            >
              <view class="item-info">
                <text class="item-name">{{ order.name }}</text>
                <text class="item-detail">订单号: {{ order.order_no }}</text>
              </view>
              <van-icon name="arrow" size="20" color="#999" />
            </view>
            <view v-if="!loadingOrders && orders.length === 0" class="empty">
              <text>暂无订单</text>
            </view>
          </view>
        </view>
      </view>
    </van-popup>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { onUnload } from '@dcloudio/uni-app'
import io from 'socket.io-client'
import api from '../../services/api'

const messageInput = ref('')
const messages = ref([])
const scrollTop = ref(0)
const lastScrollTop = ref(0)
const loading = ref(false)
const conversationId = ref(null)
const isLoggedIn = ref(false)
const socket = ref(null)
const relatedItems = ref([])
const showRelatedDialog = ref(false)
const products = ref([]) // 收藏商品
const orders = ref([])
const loadingProducts = ref(false)
const loadingOrders = ref(false)
// 折叠状态
const expandedSections = ref({
  favorites: false,
  orders: false
})

// 检查登录状态
function checkLogin() {
  let user = uni.getStorageSync('userInfo')
  let loggedIn = uni.getStorageSync('isLoggedIn')

  // 如果没有移动端登录信息，检查管理端的登录信息
  if (!loggedIn || !user) {
    const adminUser = uni.getStorageSync('admin_user')
    const adminToken = uni.getStorageSync('admin_token')

    if (adminToken && adminUser) {
      // 转换管理端用户信息为移动端需要的格式
      user = {
        id: adminUser.id,
        username: adminUser.username,
        phone: adminUser.phone,
        name: adminUser.name,
        role: adminUser.role
      }
      loggedIn = true

      // 保存为移动端的登录信息格式
      uni.setStorageSync('userInfo', user)
      uni.setStorageSync('isLoggedIn', true)
    }
  }

  isLoggedIn.value = loggedIn && user
  return isLoggedIn.value
}

// 返回上一页
function goBack() {
  uni.navigateBack()
}

// 跳转到登录页
function goToLogin() {
  uni.navigateTo({
    url: '/pages/user/login'
  })
}

// 初始化会话
async function initConversation() {
  if (!checkLogin()) return
  
  try {
    const user = uni.getStorageSync('userInfo')
    
    // 获取或创建会话
    const response = await api.conversationApi.createConversation({
      buyerId: user.id,
      csId: 37 // 默认客服ID，真正的客服用户
    })
    
    // 检查响应是否包含会话ID
    if (response.id) {
      conversationId.value = response.id
    } else if (response.data?.id) {
      conversationId.value = response.data.id
    } else {
      console.error('创建会话失败:', response.message || response.error)
      uni.showToast({
        title: response.message || response.error || '连接客服失败',
        icon: 'none'
      })
      return
    }
    await loadMessages()
    
    // 初始化Socket连接
    initSocket()
  } catch (error) {
    console.error('初始化会话失败:', error)
    uni.showToast({
      title: '连接客服失败',
      icon: 'none'
    })
  }
}

// 加载消息历史
async function loadMessages() {
  if (!conversationId.value) return
  
  try {
    loading.value = true
    const response = await api.conversationApi.getMessageHistory(conversationId.value, {
      page: 1,
      pageSize: 100
    })
    
    // 增加空值校验，避免读取undefined的属性
    messages.value = response?.messages || []
    
    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    console.error('加载消息失败:', error)
    uni.showToast({
      title: '加载消息失败',
      icon: 'none'
    })
    // 兜底：设置空数组，避免渲染报错
    messages.value = []
  } finally {
    loading.value = false
  }
}

// 发送消息
async function sendMessage() {
  if (!messageInput.value.trim() && relatedItems.value.length === 0) return
  
  try {
    const user = uni.getStorageSync('userInfo')
    
    // 构建消息内容，包含关联的商品或订单信息
    let messageContent = messageInput.value.trim()
    if (relatedItems.value.length > 0) {
      const relatedText = relatedItems.value.map(item => {
        if (item.type === 'product') {
          return `【商品】${item.name} - ¥${item.price}`
        } else {
          return `【订单】${item.name} - ${item.order_no}`
        }
      }).join('\n')
      messageContent = messageContent ? `${messageContent}\n\n${relatedText}` : relatedText
    }
    
    const messageData = {
      conversationId: conversationId.value,
      senderId: user.id,
      senderRole: 'buyer',
      content: messageContent,
      type: 'text'
    }
    
    // 同时保存关联内容的详细信息，用于展示
    const localMessageData = {
      ...messageData,
      relatedItems: [...relatedItems.value],
      created_at: new Date().toISOString()
    }
    
    // 通过Socket发送消息
    if (socket.value && socket.value.connected) {
      socket.value.emit('send-message', messageData)
      // 本地添加消息（使用临时ID，避免与服务器返回的消息重复）
      const tempMessage = {
        ...localMessageData,
        id: 'temp_' + Date.now()
      }
      messages.value.push(tempMessage)
      messageInput.value = ''
      relatedItems.value = []
      scrollToBottom()
    } else {
      // Socket连接失败时，使用API发送
      const response = await api.conversationApi.sendMessage(conversationId.value, messageData)
      // 增加空值校验
      if (response?.data) {
        messages.value.push({
          ...response.data,
          relatedItems: [...relatedItems.value]
        })
      }
      messageInput.value = ''
      relatedItems.value = []
      scrollToBottom()
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    uni.showToast({
      title: '发送消息失败',
      icon: 'none'
    })
  }
}

// 初始化Socket连接
function initSocket() {
  if (!conversationId.value) return
  
  try {
    // 创建Socket连接
    socket.value = io('http://localhost:3000')
    
    // 连接成功
    socket.value.on('connect', () => {
      console.log('Socket连接成功')
      // 加入会话房间
      socket.value.emit('join-conversation', conversationId.value)
    })
  } catch (error) {
    console.error('Socket.IO初始化失败:', error)
  }
  
  // 接收新消息
  socket.value.on('new-message', (message) => {
    // 检查是否是自己发送的临时消息，避免重复
    const user = uni.getStorageSync('userInfo')
    if (user && message.sender_id === user.id) {
      // 移除临时消息
      const tempIndex = messages.value.findIndex(msg => 
        msg.id && typeof msg.id === 'string' && msg.id.startsWith('temp_')
      )
      if (tempIndex !== -1) {
        messages.value.splice(tempIndex, 1)
      }
    }
    // 添加服务器返回的消息
    messages.value.push(message)
    scrollToBottom()
  })
  
  // 消息已读通知
  socket.value.on('messages-read', (data) => {
    if (data.conversationId === conversationId.value) {
      messages.value.forEach(msg => {
        if (msg.sender_role === 'buyer') {
          msg.is_read = true
        }
      })
    }
  })
  
  // 连接错误
  socket.value.on('connect_error', (error) => {
    console.error('Socket连接错误:', error)
  })
  
  // 断开连接
  socket.value.on('disconnect', () => {
    console.log('Socket断开连接')
  })
}

// 格式化时间
function formatTime(time) {
  const date = new Date(time)
  return date.toLocaleTimeString()
}

// 滚动到底部
function scrollToBottom() {
  nextTick(() => {
    // 延迟执行，确保DOM已更新
    setTimeout(() => {
      uni.createSelectorQuery()
        .select('.message-list')
        .boundingClientRect()
        .select('.message-item:last-child')
        .boundingClientRect()
        .exec((res) => {
          if (res && res[1]) {
            scrollTop.value = res[1].bottom
          }
        })
    }, 100)
  })
}

// 监听滚动事件
function onScroll(e) {
  lastScrollTop.value = e.detail.scrollTop
}

// 刷新消息
function refreshMessages() {
  if (conversationId.value) {
    loadMessages()
  }
}

// 页面挂载时初始化
onMounted(() => {
  checkLogin()
  // 处理从商品详情页面传递过来的商品信息
  handleRelatedItems()
  if (isLoggedIn.value) {
    initConversation()
    // 监听网络状态变化
    uni.onNetworkStatusChange((res) => {
      if (res.isConnected && socket.value && !socket.value.connected) {
        initSocket()
      }
    })
  }
})

// 页面卸载时清理资源
onUnload(() => {
  console.log('客服页面卸载，清理资源')
  // 断开 socket 连接
  if (socket.value) {
    try {
      socket.value.removeAllListeners() // 移除所有监听器
      socket.value.disconnect() // 断开连接
      console.log('Socket 已断开')
    } catch (error) {
      console.error('断开 Socket 连接时出错:', error)
    }
    socket.value = null
  }
  // 清理网络状态监听器
  uni.offNetworkStatusChange()
})

// 处理从商品详情页面传递过来的商品信息
function handleRelatedItems() {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options
  
  if (options.relatedItems) {
    try {
      const items = JSON.parse(decodeURIComponent(options.relatedItems))
      if (Array.isArray(items)) {
        relatedItems.value = items
      }
    } catch (error) {
      console.error('解析商品信息失败:', error)
    }
  }
}

// 显示关联内容选择对话框
async function showRelatedItems() {
  await loadProducts()
  await loadOrders()
  showRelatedDialog.value = true
}

// 加载用户的商品（这里使用收藏的商品作为示例）
async function loadProducts() {
  try {
    loadingProducts.value = true
    const response = await api.favoritesApi.getList()
    // 处理分页数据格式
    let productList = []
    if (response.success) {
      if (Array.isArray(response.data)) {
        productList = response.data
      } else if (response.data && Array.isArray(response.data.list)) {
        productList = response.data.list
      } else if (response.list && Array.isArray(response.list)) {
        productList = response.list
      }
      
      products.value = productList.map(item => ({
        id: item.id || item.product_id || item.productId,
        type: 'product',
        name: item.name || item.product_name,
        price: item.price,
        image: item.image
      }))
    } else {
      console.error('商品数据格式错误:', response)
      products.value = []
    }
  } catch (error) {
    console.error('加载商品失败:', error)
    products.value = []
  } finally {
    loadingProducts.value = false
  }
}



// 加载用户的订单
async function loadOrders() {
  try {
    loadingOrders.value = true
    const response = await api.orderApi.getList()
    // 处理分页数据格式
    let orderList = []
    if (response.success) {
      if (Array.isArray(response.data)) {
        orderList = response.data
      } else if (response.data && Array.isArray(response.data.list)) {
        orderList = response.data.list
      } else if (response.list && Array.isArray(response.list)) {
        orderList = response.list
      }
      
      orders.value = orderList.map(item => ({
        id: item.id,
        type: 'order',
        name: '订单 #' + item.id,
        order_no: item.order_no || item.id,
        status: item.status
      }))
    }
  } catch (error) {
    console.error('加载订单失败:', error)
    orders.value = []
  } finally {
    loadingOrders.value = false
  }
}

// 选择关联内容
function selectRelatedItem(item) {
  // 检查是否已经添加
  const exists = relatedItems.value.some(related => related.id === item.id && related.type === item.type)
  if (!exists) {
    relatedItems.value.push(item)
  }
  showRelatedDialog.value = false
}

// 清除关联内容
function clearRelatedItems() {
  relatedItems.value = []
}

// 删除单个关联项
function removeRelatedItem(item) {
  const index = relatedItems.value.findIndex(related => related.id === item.id && related.type === item.type)
  if (index !== -1) {
    relatedItems.value.splice(index, 1)
  }
}



// 切换折叠状态
function toggleSection(section) {
  expandedSections.value[section] = !expandedSections.value[section]
}

// 页面卸载时清理
onUnmounted(() => {
  if (socket.value) {
    socket.value.disconnect()
  }
  // 移除网络状态监听 - 页面卸载时uni-app会自动清理
})
</script>

<style scoped>
.service-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.message-list {
  flex: 1;
  padding: 16rpx;
  overflow-y: auto;
}

.message-item {
  margin-bottom: 16rpx;
  display: flex;
  align-items: flex-end;
}

.message-item.sent {
  justify-content: flex-end;
}

.message-item.received {
  justify-content: flex-start;
}

.message-content {
  max-width: 70%;
  padding: 12rpx 16rpx;
  border-radius: 8rpx;
  position: relative;
}

.message-item.sent .message-content {
  background-color: #1989fa;
  color: #fff;
  border-bottom-right-radius: 0;
}

.message-item.received .message-content {
  background-color: #fff;
  color: #333;
  border-bottom-left-radius: 0;
}

.message-text {
  display: block;
  word-wrap: break-word;
  line-height: 1.5;
  margin-bottom: 8rpx;
  white-space: pre-wrap;
}

.message-related {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8rpx;
  padding: 12rpx;
  margin-bottom: 8rpx;
}

.message-related-item {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  margin-bottom: 8rpx;
}

.message-related-item:last-child {
  margin-bottom: 0;
}

.message-item.sent .message-related {
  background-color: rgba(255, 255, 255, 0.2);
}

.message-item.received .message-related {
  background-color: rgba(0, 0, 0, 0.03);
}

.related-type {
  font-size: 20rpx;
  color: #1989fa;
  font-weight: 500;
}

.message-item.sent .related-type {
  color: #c8e0ff;
}

.related-name {
  font-size: 24rpx;
  font-weight: 500;
}

.related-price, .related-order {
  font-size: 22rpx;
  opacity: 0.8;
}

.message-footer {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.message-time {
  font-size: 24rpx;
  opacity: 0.7;
  margin-right: 8rpx;
}

.input-container {
  padding: 16rpx;
  background-color: #fff;
  border-top: 1px solid #eee;
  display: flex;
  align-items: flex-end;
  gap: 16rpx;
  border-radius: 20rpx 20rpx 0 0;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.input-container :deep(.van-field__control) {
  min-height: 60rpx;
  border-radius: 15rpx;
  background-color: #f0f0f0;
}

.input-container :deep(.van-field__wrapper) {
  background-color: transparent;
}

.input-container :deep(.van-button) {
  border-radius: 15rpx;
  margin-bottom: 15rpx;
}

.loading {
  text-align: center;
  padding: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  color: #999;
  font-size: 24rpx;
}

.login-prompt {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
}

.login-prompt :deep(.van-button) {
  margin-top: 24rpx;
}
/* 关联内容样式 */
.related-content {
  background-color: #fff;
  border-bottom: 1px solid #eee;
  padding: 16rpx;
}

.related-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}



.related-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  border-left: 4rpx solid #1989fa;
  position: relative;
}

.related-item:active {
  background-color: #e8e8e8;
}

.related-item .van-icon {
  cursor: pointer;
  padding: 8rpx;
  border-radius: 50%;
}

.related-item .van-icon:active {
  background-color: rgba(0, 0, 0, 0.1);
}

.related-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.related-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  border-left: 4rpx solid #1989fa;
}

.related-item.product {
  border-left-color: #67c23a;
}

.related-item.order {
  border-left-color: #e6a23c;
}

.related-info {
  flex: 1;
}

.related-label {
  font-size: 20rpx;
  color: #999;
  margin-right: 8rpx;
}

.related-name {
  font-size: 24rpx;
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.related-detail {
  font-size: 20rpx;
  color: #666;
}

/* 输入区域工具 */
.input-tools {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 8rpx 16rpx 0;
  min-width: 60rpx;
}

/* 关联内容选择对话框 */
.related-dialog {
  padding: 24rpx;
  max-height: 70vh;
  overflow-y: auto;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.dialog-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.dialog-section {
  margin-bottom: 32rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
  cursor: pointer;
}

.section-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.section-header:active {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8rpx;
  padding: 12rpx;
  margin: 0 -12rpx;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 16rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  cursor: pointer;
}

.list-item:active {
  background-color: #e8e8e8;
}

.item-image {
  width: 80rpx;
  height: 80rpx;
  border-radius: 8rpx;
  margin-right: 16rpx;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 24rpx;
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.item-price {
  font-size: 24rpx;
  color: #1989fa;
  font-weight: 600;
}

.item-detail {
  font-size: 20rpx;
  color: #666;
}

.empty {
  text-align: center;
  padding: 32rpx;
  color: #999;
  font-size: 24rpx;
}
</style>

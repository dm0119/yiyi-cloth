<template>
  <view class="container">
    <view class="user-header">
      <view class="user-avatar">
        <van-icon name="user-o" size="80" color="#ff6b6b" />
      </view>
      <view class="user-info">
        <text class="user-name">{{ userInfo.name || '未登录' }}</text>
        <text class="user-phone" @click="handleLogin">{{ userInfo.phone || '点击登录' }}</text>
      </view>
    </view>

    <view class="menu-section" v-if="isLoggedIn">
      <van-cell-group>
        <!-- 实名认证入口：始终显示，根据状态显示不同文字 -->
        <van-cell 
          title="实名认证" 
          :value="isRealNameVerified ? '已完成' : '未完成'"
          :style="{ color: isRealNameVerified ? '#52c41a' : '#ff9800' }"
          @click="goToRealName" 
        />
        <van-cell title="我的地址"  @click="goToAddress" />
        <van-cell title="我的收藏"  @click="goToFavorites" />
        <van-cell title="浏览记录"  @click="goToHistory" />
        <van-cell title="站内信" :value="unreadCount > 0 ? `${unreadCount}条未读` : ''" @click="goToMessages" />
        <van-cell title="优惠券"  @click="goToCoupons" />
        <van-cell title="交易记录"  @click="goToTransactions" />
      </van-cell-group>
    </view>

    <view class="menu-section">
      <van-cell-group>
        <van-cell title="联系客服"  @click="contactService" />
      </van-cell-group>
    </view>

    <view class="menu-section logout-section" v-if="isLoggedIn">
      <van-cell-group>
        <van-cell title="退出登录"  @click="logout" />
      </van-cell-group>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'

const userInfo = ref({
  name: '',
  phone: ''
})
const isLoggedIn = ref(false)
const isRealNameVerified = ref(false)
const unreadCount = ref(0)

async function loadUserInfo() {
  // 首先检查移动端自己的登录信息
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
  
  if (loggedIn && user) {
    userInfo.value = user
    isLoggedIn.value = true
    
    // 检查实名认证状态
    checkRealNameStatus()
  } else {
    userInfo.value = { name: '', phone: '' }
    isLoggedIn.value = false
    isRealNameVerified.value = false
  }
}

// 检查实名认证状态
async function checkRealNameStatus() {
  try {
    const { realNameApi } = await import('@/services/api.js')
    const res = await realNameApi.getStatus()
    if (res.success) {
      isRealNameVerified.value = res.data.status === 'approved'
      
      // 更新 userInfo 中的实名认证状态
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo) {
        userInfo.real_name_status = res.data.status
        uni.setStorageSync('userInfo', userInfo)
      }
    }
  } catch (error) {
    console.error('检查实名认证状态失败:', error)
    isRealNameVerified.value = false
  }
}

// 跳转到实名认证页面
function goToRealName() {
  uni.navigateTo({
    url: '/pages/user/real-name'
  })
}

function handleLogin() {
  if (!isLoggedIn.value) {
    uni.navigateTo({
      url: '/pages/user/login'
    })
  }
}

function logout() {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        // 清除本地存储的用户信息
        uni.removeStorageSync('userInfo')
        uni.removeStorageSync('isLoggedIn')
        
        // 更新页面状态
        userInfo.value = { name: '', phone: '' }
        isLoggedIn.value = false
        
        uni.showToast({
          title: '已退出登录',
          icon: 'success'
        })
      }
    }
  })
}

function goToAddress() {
  checkLogin(() => {
    uni.navigateTo({
      url: '/pages/user/address/index'
    })
  })
}

function goToFavorites() {
  checkLogin(() => {
    uni.navigateTo({
      url: '/pages/user/favorites/index'
    })
  })
}

function goToHistory() {
  checkLogin(() => {
    uni.navigateTo({
      url: '/pages/user/history'
    })
  })
}

function goToCoupons() {
  checkLogin(() => {
    uni.navigateTo({
      url: '/pages/user/coupons'
    })
  })
}

function goToTransactions() {
  checkLogin(() => {
    uni.navigateTo({
      url: '/pages/user/transactions'
    })
  })
}

function goToMessages() {
  checkLogin(() => {
    uni.navigateTo({
      url: '/pages/user/messages/buyer-messages'
    })
  })
}

async function loadUnreadCount() {
  if (!isLoggedIn.value) return
  try {
    const { messageApi } = await import('@/services/api.js')
    const res = await messageApi.getUnreadCount()
    if (res.success) {
      unreadCount.value = res.data.unreadCount || 0
    }
  } catch (error) {
    console.error('获取未读消息数失败:', error)
  }
}

function contactService() {
  checkLogin(() => {
    uni.navigateTo({
      url: '/pages/user/service'
    })
  })
}

function checkLogin(callback) {
  if (isLoggedIn.value) {
    callback()
  } else {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/user/login'
      })
    }, 1500)
  }
}

onMounted(() => {
  loadUserInfo()
  loadUnreadCount()
})

onShow(() => {
  loadUserInfo()
  loadUnreadCount()
})
</script>

<style scoped>
  /* CSS变量定义 */
  :root {
    --primary-color: #ff6b6b; /* 主题色：粉红色 */
    --primary-hover: #ee5a5a; /* 主题色悬停：深粉红色 */
    --secondary-color: #4ecdc4; /* 次要色：青色 */
    --success-color: #52c41a; /* 成功色：绿色 */
    --warning-color: #faad14; /* 警告色：橙色 */
    --error-color: #ff4d4f; /* 错误色：红色 */
    --text-primary: #333333; /* 主要文字颜色：深灰色 */
    --text-secondary: #666666; /* 次要文字颜色：中灰色 */
    --text-muted: #999999; /* 弱化文字颜色：浅灰色 */
    --bg-color: #f8f9fa; /* 背景色：浅灰白色 */
    --bg-white: #ffffff; /* 白色背景：纯白色 */
    --border-color: #e8e8e8; /* 边框颜色：浅灰色 */
    --card-radius: 12px; /* 卡片圆角：12像素 */
    --button-radius: 8px; /* 按钮圆角：8像素 */
    --font-size-xs: 22rpx; /* 超小字体：22rpx */
    --font-size-sm: 24rpx; /* 小字体：24rpx */
    --font-size-md: 28rpx; /* 中等字体：28rpx */
    --font-size-lg: 32rpx; /* 大字体：32rpx */
    --font-size-xl: 36rpx; /* 超大字体：36rpx */
    --font-size-xxl: 40rpx; /* 特大字体：40rpx */
    --spacing-xs: 10rpx; /* 超小间距：10rpx */
    --spacing-sm: 16rpx; /* 小间距：16rpx */
    --spacing-md: 24rpx; /* 中等间距：24rpx */
    --spacing-lg: 32rpx; /* 大间距：32rpx */
    --spacing-xl: 48rpx; /* 超大间距：48rpx */
    --shadow-sm: 0 4rpx 16rpx rgba(0, 0, 0, 0.05); /* 小阴影：轻微的投影效果 */
    --shadow-md: 0 8rpx 24rpx rgba(0, 0, 0, 0.1); /* 中等阴影：明显的投影效果 */
    --transition-fast: 0.2s ease; /* 快速过渡动画：0.2秒缓动 */
  }
  
  /* 页面基础样式 */
  page {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; /* 字体：系统默认字体栈 */
    font-size: var(--font-size-md); /* 基础字体大小：中等字体 */
    color: var(--text-primary); /* 文字颜色：主要文字颜色 */
    background: linear-gradient(to bottom, #ffb6c1 0%, #fffaf0 100%); /* 背景：粉色到米色的渐变 */
    line-height: 1.5; /* 行高：1.5倍字体大小 */
    -webkit-font-smoothing: antialiased; /* 字体平滑：抗锯齿效果 */
  }
  
  * {
    margin: 0; /* 外边距：0 */
    padding: 0; /* 内边距：0 */
    box-sizing: border-box; /* 盒模型：包含边框和内边距 */
  }
  
  .container {
    background: transparent; /* 背景：透明 */
    min-height: 100vh; /* 最小高度：100%视口高度 */
    padding-bottom: var(--spacing-xl); /* 底部内边距：超大间距 */
  }

.user-header {
  background: transparent; /* 背景：透明 */
  padding: var(--spacing-xl) var(--spacing-md); /* 内边距：上下超大，左右中等 */
  display: flex; /* 布局：弹性布局 */
  align-items: center; /* 垂直对齐：居中 */
  gap: var(--spacing-md); /* 间距：中等间距 */
}

.user-avatar {
  width: 120rpx; /* 宽度：120rpx */
  height: 120rpx; /* 高度：120rpx */
  background: var(--bg-white); /* 背景：白色 */
  border-radius: 50%; /* 圆角：50%圆形 */
  display: flex; /* 布局：弹性布局 */
  align-items: center; /* 垂直对齐：居中 */
  justify-content: center; /* 水平对齐：居中 */
}

.user-info {
  flex: 1; /* 弹性：占据剩余空间 */
  display: flex; /* 布局：弹性布局 */
  flex-direction: column; /* 方向：垂直排列 */
  gap: var(--spacing-xs); /* 间距：超小间距 */
}

.user-name {
  font-size: var(--font-size-xl); /* 字体大小：超大字体 */
  font-weight: 600; /* 字体粗细：600 */
  color: var(--text-primary); /* 文字颜色：主要文字颜色 */
}

.user-phone {
  font-size: var(--font-size-sm); /* 字体大小：小字体 */
  color: var(--text-secondary); /* 文字颜色：次要文字颜色 */
}

.menu-section {
  margin: var(--spacing-md); /* 外边距：中等间距 */
  border-radius: var(--card-radius); /* 圆角：卡片圆角 */
  overflow: hidden; /* 溢出：隐藏超出部分 */
}

/* Vant Cell组件通用标题样式 */
/* 适用组件：我的地址、我的收藏、浏览记录、优惠券、我的钱包、联系客服 */
.menu-section >>> .van-cell__title {
  font-size: var(--font-size-md); /* 字体大小：中等字体 */
  color: var(--text-primary); /* 文字颜色：主要文字颜色 */
  font-weight: 500; /* 字体粗细：500 */
  vertical-align: middle; /* 垂直对齐：居中对齐 */
  display: inline-block; /* 显示：内联块级元素 */
}

/* Vant Cell 组件通用图标样式 */
/* 适用组件：我的地址、我的收藏、浏览记录、优惠券、交易记录、联系客服 */
.menu-section >>> .van-cell__left-icon {
  color: var(--primary-color); /* 图标颜色：主题色 */
  vertical-align: middle; /* 垂直对齐：居中对齐 */
  margin-right: 8rpx; /* 右边距：与文字保持间距 */
}

/* Vant Cell 组件通用右箭头样式 */
/* 适用组件：我的地址、我的收藏、浏览记录、优惠券、交易记录、联系客服 */
.menu-section >>> .van-cell__right-icon {
  color: var(--text-muted); /* 箭头颜色：弱化文字颜色 */
}

/* Vant Cell 组件通用高度和内边距样式 */
/* 适用组件：我的地址、我的收藏、浏览记录、优惠券、交易记录、联系客服、退出登录 */
.menu-section >>> .van-cell {
  height: 80rpx; /* 单元格高度：80rpx */
  line-height: 80rpx; /* 行高：80rpx，与高度一致 */
  padding: 0 var(--spacing-md); /* 内边距：左右中等间距 */
}

/* 退出登录组件样式：文字居中显示 */
/* 组件内容：退出登录 */
.logout-section >>> .van-cell .van-cell__title {
  text-align: center; /* 文字对齐：居中 */
  width: 100%; /* 宽度：100% */
}
</style>

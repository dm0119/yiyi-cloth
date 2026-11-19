<template>
  <view class="container">
    
    <view v-if="discussion" class="discussion-detail">
      <view class="discussion-header">
        <text class="user-name">{{ discussion.user_name }}</text>
        <text class="create-time">{{ formatTime(discussion.created_at) }}</text>
      </view>
      <view class="discussion-content">
        <text class="title">{{ discussion.title }}</text>
        <text class="content">{{ discussion.content }}</text>
        <view v-if="discussion.images && discussion.images.length > 0" class="image-list">
          <image 
            v-for="(image, index) in discussion.images" 
            :key="index"
            :src="getImageUrl(image)"
            class="image-item"
            mode="aspectFill"
          />
        </view>
        <view v-if="discussion.products && discussion.products.length > 0" class="product-list">
          <view 
            v-for="product in discussion.products" 
            :key="product.id"
            class="product-item"
            @click="goToProductDetail(product.id)"
          >
            <image :src="getImageUrl(product.image)" class="product-image" mode="aspectFill" />
              <text class="product-name">{{ product.name }}</text>
              <text class="product-price">¥{{ (parseFloat(product.price) || 0).toFixed(2) }}</text>
          </view>
        </view>
      </view>
      <view class="discussion-footer">
        <view class="stat">
          <van-icon name="eye-o" size="16" />
          <text>{{ discussion.view_count || 0 }}</text>
        </view>
        <view class="stat">
          <van-icon name="chat-o" size="16" />
          <text>{{ discussion.comment_count || 0 }}</text>
        </view>
        <view class="stat" @click="showMore">
          <van-icon name="more-o" size="16" />
          <text>举报</text>
        </view>
      </view>
    </view>
    
    <view class="comments-section">
      <text class="section-title">评论 ({{ comments.length }})</text>
      <view 
        v-for="comment in comments" 
        :key="comment.id"
        class="comment-item"
      >
        <view class="comment-header">
          <text class="user-name">{{ comment.user_name }}</text>
          <text class="create-time">{{ formatTime(comment.created_at) }}</text>
        </view>
        <view class="comment-content">
          <text>{{ comment.content }}</text>
          <image v-if="comment.image" :src="getImageUrl(comment.image)" class="comment-image" mode="aspectFill" />
        </view>
      </view>
    </view>
    
    <view class="comment-input-section">
      <input 
        v-model="commentContent" 
        class="comment-input" 
        placeholder="写下你的评论..."
      />
      <button class="upload-button" @click="chooseImage">
        <span>图片</span>
      </button>
      <van-button type="primary" size="small" @click="submitComment">发送</van-button>
    </view>
    
    <van-loading v-if="loading" type="spinner" vertical>加载中...</van-loading>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { discussionApi } from '@/services/api.js'

const API_BASE = 'http://localhost:3000'

function getImageUrl(url) {
  if (!url) return 'https://via.placeholder.com/200x200'
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  if (url.startsWith('/uploads/')) {
    return `${API_BASE}${url}`
  }
  return url
}

const route = getCurrentPages()[getCurrentPages().length - 1].route
const options = getCurrentPages()[getCurrentPages().length - 1].options
const id = options.id

const discussion = ref(null)
const comments = ref([])
const loading = ref(true)
const commentContent = ref('')
const commentImage = ref('')

function formatTime(time) {
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function loadDiscussionDetail() {
  try {
    const res = await discussionApi.getDiscussionDetail(id)
    if (res.success && res.data) {
      discussion.value = res.data
      comments.value = res.data.comments || []
    }
  } catch (error) {
    console.error('加载讨论详情失败:', error)
  } finally {
    loading.value = false
  }
}

async function submitComment() {
  if (!commentContent.value.trim()) {
    uni.showToast({ title: '请输入评论内容', icon: 'none' })
    return
  }
  
  try {
    const res = await discussionApi.createComment(id, {
      content: commentContent.value,
      image: commentImage.value
    })
    if (res.success) {
      uni.showToast({ title: '评论成功', icon: 'success' })
      commentContent.value = ''
      commentImage.value = ''
      loadDiscussionDetail() // 重新加载评论
    }
  } catch (error) {
    console.error('提交评论失败:', error)
    uni.showToast({ title: '评论失败', icon: 'none' })
  }
}

async function chooseImage() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      try {
        uni.showLoading({ title: '上传中...' })
        console.log('选择的图片路径:', res.tempFilePaths[0])
        const imageUrl = await discussionApi.uploadCommentImage(res.tempFilePaths[0])
        console.log('上传成功，返回的图片URL:', imageUrl)
        commentImage.value = imageUrl
        uni.hideLoading()
        uni.showToast({ title: '图片上传成功', icon: 'success' })
      } catch (error) {
        uni.hideLoading()
        uni.showToast({ title: '图片上传失败', icon: 'none' })
        console.error('上传图片失败:', error)
      }
    }
  })
}

function goBack() {
  uni.navigateBack()
}

function checkLogin(callback) {
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

function showMore() {
  // 显示更多操作菜单
  uni.showActionSheet({
    itemList: ['举报'],
    success: (res) => {
      if (res.tapIndex === 0) {
        // 先检查登录状态
        checkLogin(() => {
          // 显示举报原因输入框
          uni.showModal({
            title: '举报原因',
            placeholderText: '请输入举报原因',
            editable: true,
            success: async (modalRes) => {
              if (modalRes.confirm && modalRes.content) {
                try {
                  const res = await discussionApi.reportDiscussion({
                    discussion_id: id,
                    reason: modalRes.content
                  })
                  if (res.success) {
                    uni.showToast({ title: '举报成功', icon: 'success' })
                  } else {
                    // 显示具体的错误信息
                    uni.showToast({ 
                      title: res.message || '举报失败', 
                      icon: 'none' 
                    })
                  }
                } catch (error) {
                  console.error('举报失败:', error)
                  uni.showToast({ 
                    title: error.message || '举报失败', 
                    icon: 'none' 
                  })
                }
              }
            }
          })
        })
      }
    }
  })
}

function goToProductDetail(productId) {
  uni.navigateTo({
    url: `/pages/product/detail?id=${productId}`
  })
}

onMounted(() => {
  loadDiscussionDetail()
})
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: var(--bg-color);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--bg-white);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 10;
}

.title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.right {
  display: flex;
  align-items: center;
}

.discussion-detail {
  background: var(--bg-white);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
}

.discussion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.user-name {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--text-primary);
}

.create-time {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.discussion-content {
  margin-bottom: var(--spacing-sm);
}

.title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.content {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: var(--spacing-sm);
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
}

.image-item {
  width: 300rpx;
  height: 300rpx;
  border-radius: var(--card-radius);
}

.product-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.product-item {
  width: 150rpx;
  background: var(--bg-color);
  border-radius: var(--card-radius);
  padding: var(--spacing-xs);
}

.product-image {
  width: 100%;
  height: 120rpx;
  border-radius: var(--card-radius);
  margin-bottom: var(--spacing-xs);
}

.product-name {
  font-size: var(--font-size-xs);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  font-size: var(--font-size-xs);
  color: var(--primary-color);
  font-weight: 500;
}

.discussion-footer {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border-color);
}

.stat {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.comments-section {
  background: var(--bg-white);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.comment-item {
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-color);
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.comment-content {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  line-height: 1.5;
}

.comment-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: var(--card-radius);
  margin-top: var(--spacing-xs);
}

.comment-input-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--bg-white);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  bottom: 0;
  z-index: 5;
}

.comment-input {
  flex: 1;
  border: 1px solid var(--border-color);
  border-radius: 20rpx;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-base);
  min-height: 80rpx;
}

.upload-button {
  height: 32rpx;
  padding: 0 20rpx;
  border: 1px solid #1989fa;
  background: #1989fa;
  color: white;
  font-size: 24rpx;
  border-radius: 4rpx;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  font-weight: normal;
  line-height: 1;
}

.upload-button:hover {
  background: #409eff;
  border-color: #409eff;
}
</style>
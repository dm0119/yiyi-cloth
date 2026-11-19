<template>
  <view class="container">
    <view class="content">
      <view v-if="loading" class="loading-state">
        <van-loading type="spinner" vertical>加载中...</van-loading>
      </view>

      <view v-else-if="orderItems && orderItems.length > 0" class="review-content">

        
        <!-- 待评价商品部分（仅在非查看模式显示） -->
        <view v-if="!viewOnly" class="section">
          <view class="section-title">待评价商品</view>
          <view 
            v-for="item in orderItems.filter(item => item.canReview)" 
            :key="item.id"
            class="item-card"
          >
            <view class="item-header">
              <view class="item-info">
                <text class="item-name">{{ item.product_name }}</text>
                <text class="item-spec">规格: {{ item.size || '无' }} {{ item.color || '无' }}</text>
                <text class="item-price">¥{{ Number(item.price).toFixed(2) }} × {{ item.quantity }}</text>
              </view>
            </view>

            <view class="rating-section">
              <text class="rating-label">评分</text>
              <view class="rating-stars">
                <text 
                  v-for="n in 5" 
                  :key="n"
                  :class="n <= (ratings[item.product_id] || 0) ? 'star full-star' : 'star void-star'"
                  @click="onRateClick(item.product_id, n)"
                >
                  {{ n <= (ratings[item.product_id] || 0) ? '★' : '☆' }}
                </text>
              </view>
            </view>

            <view class="review-input-section">
              <textarea
                class="review-textarea"
                :placeholder="`请评价 ${item.product_name}`"
                :value="contents[item.product_id] || ''"
                @input="onContentInput(item.product_id, $event)"
                maxlength="500"
                :auto-height="true"
                show-word-limit
              />
            </view>

            <!-- 图片上传区域 -->
            <view class="image-upload-section">
              <view class="upload-title">上传图片（最多5张）</view>
              <view class="image-list">
                <!-- 已上传的图片 -->
                <view 
                  v-for="(image, index) in images[item.product_id]" 
                  :key="index"
                  class="image-item"
                >
                  <image :src="image" mode="aspectFill" class="uploaded-image" />
                  <view class="image-delete" @click="removeImage(item.product_id, index)">
                    ×
                  </view>
                </view>
                <!-- 上传按钮 -->
                <view 
                  v-if="images[item.product_id].length < 5 && !uploading[item.product_id]"
                  class="upload-btn"
                  @click="chooseImage(item.product_id)"
                >
                  <text class="upload-icon">+</text>
                  <text class="upload-text">添加图片</text>
                </view>
                <!-- 上传中 -->
                <view v-else-if="uploading[item.product_id]" class="uploading">
                  <van-loading type="spinner" size="24px" />
                  <text>上传中...</text>
                  <view class="progress-bar">
                    <view class="progress" :style="{ width: uploadProgress[item.product_id] + '%' }"></view>
                  </view>
                  <text class="progress-text">{{ uploadProgress[item.product_id] }}%</text>
                </view>
              </view>
            </view>
          </view>

          <view v-if="orderItems.filter(item => item.canReview).length === 0" class="no-reviewable">
            <van-empty description="该订单下没有可评价的商品" />
          </view>
        </view>
        
        <!-- 已评价商品部分 -->
        <view v-if="orderItems.some(item => item.hasReviewed)" class="section">
          <view class="section-title">已评价商品</view>
          <view 
            v-for="item in orderItems.filter(item => item.hasReviewed)" 
            :key="'reviewed-' + item.id"
            class="item-card"
          >
            <view class="item-header">
              <view class="item-info">
                <text class="item-name">{{ item.product_name }}</text>
                <text class="item-spec">规格: {{ item.size || '无' }} {{ item.color || '无' }}</text>
                <text class="item-price">¥{{ Number(item.price).toFixed(2) }} × {{ item.quantity }}</text>
              </view>
            </view>

            <view class="rating-section">
              <text class="rating-label">评分</text>
              <view class="rating-stars">
                <text 
                  v-for="n in 5" 
                  :key="n"
                  :class="n <= item.review.rating ? 'star full-star' : 'star void-star'"
                >
                  {{ n <= item.review.rating ? '★' : '☆' }}
                </text>
              </view>
            </view>

            <view class="review-input-section">
              <text class="review-textarea">{{ item.review.content || '此用户未填写评价内容' }}</text>
            </view>

            <!-- 已评价商品的图片 -->
            <view v-if="item.review.images && Array.isArray(item.review.images) && item.review.images.length > 0" class="image-upload-section">
              <view class="upload-title">评价图片</view>
              <view class="image-list">
                <view 
                  v-for="(image, index) in item.review.images" 
                  :key="index"
                  class="image-item"
                >
                  <!-- 打印图片URL -->
                  <text v-if="false">{{ image }}</text>
                  <!-- 使用image组件 -->
                  <image 
                    :src="config.getFullImageUrl(image)" 
                    mode="aspectFill" 
                    class="uploaded-image"
                    @error="handleImageError"
                    @load="handleImageLoad"
                  />
                </view>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 查看模式下如果没有评价 -->
        <view v-if="viewOnly && !orderItems.some(item => item.hasReviewed)" class="no-data">
          <van-empty description="暂无评价记录" />
        </view>
        
        <!-- 非查看模式下如果没有可评价商品且没有已评价商品 -->
        <view v-if="!viewOnly && orderItems.filter(item => item.canReview).length === 0 && orderItems.filter(item => item.hasReviewed).length === 0" class="no-data">
          <van-empty description="暂无评价记录" />
        </view>
      </view>

      <view v-else class="no-data">
        <van-empty description="暂无待评价商品" />
      </view>
    </view>

    <view v-if="!viewOnly && orderItems && orderItems.some(item => item.canReview)" class="footer">
      <van-button 
        type="primary" 
        block 
        @click="submitReview"
        :loading="submitting"
      >
        提交评价
      </van-button>
    </view>
  </view>
</template>

<script>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { showConfirmDialog, showToast } from 'vant/es'
import { orderApi, reviewApi } from '@/services/api.js'
import config from '@/config.js'

export default {
  setup() {
    const orderId = ref(null)
    const viewOnly = ref(false)
    const loading = ref(true)
    const submitting = ref(false)
    const orderItems = ref([])
    
    // 评分数据
    const ratings = ref({})
    // 评价内容数据
    const contents = ref({})
    // 评价图片数据
    const images = ref({})
    // 上传中状态
    const uploading = ref({})
    // 上传进度
    const uploadProgress = ref({})
    
    // 添加评分点击事件处理
    const onRateClick = (productId, rating) => {
      ratings.value[productId] = rating
    }
    
    onLoad((options) => {
      orderId.value = options.orderId
      viewOnly.value = options.viewOnly === 'true'
      loadOrderReviewable()
    })
    
    // 加载订单可评价商品
    const loadOrderReviewable = async () => {
      try {
        loading.value = true
        
        // 先获取订单详情
        const orderRes = await orderApi.getById(orderId.value)
        
        if (orderRes.success) {
          // 获取所有订单项
          const allOrderItems = orderRes.data.items || []
          
          // 然后获取该订单的评价信息
          const reviewRes = await reviewApi.getByOrder(orderId.value)
          const reviews = reviewRes.success ? (reviewRes.data || []) : []
          
          // 合并数据，标记哪些商品已经评价
          orderItems.value = allOrderItems.map(item => {
            // 尝试通过product_id匹配评价，因为order_item_id可能不存在
            const review = reviews.find(r => r.product_id === item.product_id)
            return {
              ...item,
              hasReviewed: !!review,  // 是否已评价
              review: review || null,  // 评价信息
              canReview: !review  // 只有没有评价的商品才能评价
            }
          })
          
          // 初始化评分、内容和图片数据（仅对可评价的商品）
          orderItems.value.forEach(item => {
            if (item.canReview) {
              ratings.value[item.product_id] = 5 // 默认5星
              contents.value[item.product_id] = ''
              images.value[item.product_id] = []
              uploading.value[item.product_id] = false
              uploadProgress.value[item.product_id] = 0
            }
          })
          
          // 打印评价数据，检查图片URL
          console.log('评价数据:', reviews)
          // 打印订单项数据
          console.log('订单项数据:', orderItems.value)
        } else {
          showToast({
            message: orderRes.message || '获取订单信息失败'
          })
        }
      } catch (error) {
        console.error('获取订单信息失败:', error)
        showToast({
          message: error.message || '获取订单信息失败'
        })
      } finally {
        loading.value = false
      }
    }
    
    // 评价内容输入
    const onContentInput = (productId, event) => {
      contents.value[productId] = event.detail.value
    }
    
    // 选择图片
    const chooseImage = async (productId) => {
      try {
        if (images.value[productId].length >= 5) {
          showToast({
            message: '最多只能上传5张图片'
          })
          return
        }
        
        const res = await uni.chooseImage({
          count: 5 - images.value[productId].length,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera']
        })
        
        if (res.tempFilePaths.length > 0) {
          // 先添加本地预览
          const localImages = res.tempFilePaths
          images.value[productId] = [...images.value[productId], ...localImages]
          
          // 然后上传图片
          await uploadImages(productId, res.tempFiles)
        }
      } catch (error) {
        console.error('选择图片失败:', error)
        showToast({
          message: '选择图片失败，请重试'
        })
      }
    }
    
    // 上传图片
    const uploadImages = async (productId, files) => {
      try {
        uploading.value[productId] = true
        uploadProgress.value[productId] = 0
        
        // 模拟上传进度
        const progressInterval = setInterval(() => {
          if (uploadProgress.value[productId] < 90) {
            uploadProgress.value[productId] += 10
          }
        }, 200)
        
        // 实际调用后端API上传图片
        const uploadedUrls = []
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const result = await reviewApi.uploadReviewImages([file])
          if (result.success && result.data && result.data.length > 0) {
            uploadedUrls.push(result.data[0])
            console.log('上传成功，返回的URL:', result.data[0])
          }
        }
        
        clearInterval(progressInterval)
        uploadProgress.value[productId] = 100
        
        // 替换本地预览为服务器返回的真实URL
        const currentImages = images.value[productId]
        // 使用 tempFilePaths 来匹配本地图片
        const tempFilePaths = files.map(file => file.path || file.tempFilePath)
        const updatedImages = currentImages.map(img => {
          const index = tempFilePaths.indexOf(img)
          return index !== -1 && uploadedUrls[index] ? uploadedUrls[index] : img
        })
        
        images.value[productId] = updatedImages
        console.log('更新后的图片URL:', images.value[productId])
        
        showToast({
          message: '图片上传成功'
        })
      } catch (error) {
        console.error('上传图片失败:', error)
        showToast({
          message: error.message || '图片上传失败'
        })
        
        // 上传失败时移除本地预览
        const tempFilePaths = files.map(file => file.path || file.tempFilePath)
        images.value[productId] = images.value[productId].filter(img => !tempFilePaths.includes(img))
      } finally {
        uploading.value[productId] = false
        uploadProgress.value[productId] = 0
      }
    }
    
    // 删除图片
    const removeImage = (productId, index) => {
      const productImages = images.value[productId] || []
      productImages.splice(index, 1)
      images.value[productId] = [...productImages]
    }
    
    // 提交评价
    const submitReview = async () => {
      try {
        // 验证是否所有可评价商品都有评分
        const canReviewItems = orderItems.value.filter(item => item.canReview)
        const unRatedItems = canReviewItems.filter(item => !ratings.value[item.product_id] || ratings.value[item.product_id] === 0)
        
        if (unRatedItems.length > 0) {
          showToast({
            message: `请为${unRatedItems[0].product_name}评分`
          })
          return
        }
        
        // 验证评价内容长度是否符合要求
        const invalidContentItems = canReviewItems.filter(item => {
          const content = contents.value[item.product_id] || ''
          return content.length > 500
        })
        
        if (invalidContentItems.length > 0) {
          showToast({
            message: `${invalidContentItems[0].product_name}的评价内容超过500字限制`
          })
          return
        }
        
        // 验证是否有正在上传的图片
        const uploadingItems = canReviewItems.filter(item => uploading.value[item.product_id])
        if (uploadingItems.length > 0) {
          showToast({
            message: '图片正在上传中，请稍后再提交'
          })
          return
        }
        
        submitting.value = true
        
        // 提交所有评价
        for (const item of canReviewItems) {
          const rating = ratings.value[item.product_id]
          const content = contents.value[item.product_id]
          const productImages = images.value[item.product_id] || []
          
          // 过滤掉本地预览路径，只保留服务器URL
          const serverImages = productImages.filter(img => img.startsWith('http'))
          
          // 只有评分或内容不为空才提交评价
          if (rating > 0 || content || serverImages.length > 0) {
            const reviewData = {
              order_id: orderId.value,
              product_id: item.product_id,
              order_item_id: item.id,
              user_name: uni.getStorageSync('userInfo')?.name || '用户',
              rating,
              content,
              images: serverImages
            }
            
            const res = await reviewApi.create(reviewData)
            
            if (!res.success) {
              throw new Error(res.message || '评价提交失败')
            }
          }
        }
        
        showToast({
          message: '评价提交成功',
          onClose: () => {
            uni.navigateTo({
              url: `/pages/order/detail?id=${orderId.value}`
            })
          }
        })
      } catch (error) {
        console.error('提交评价失败:', error)
        showToast({
          message: error.message || '评价提交失败，请重试'
        })
      } finally {
        submitting.value = false
      }
    }
    
    // 返回上一页
    const goBack = () => {
      if (viewOnly.value) {
        // 查看模式下返回订单详情页面
        uni.navigateTo({
          url: `/pages/order/detail?id=${orderId.value}`
        })
      } else {
        // 编辑模式下返回上一页
        uni.navigateBack()
      }
    }
    
    // 处理图片加载失败
    const handleImageError = (e) => {
      console.error('图片加载失败:', e.target.src)
      // 图片加载失败时，可以设置一个默认的占位符图片
      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2YyZjJmMiIvPjxwYXRoIGQ9Ik03NSAxMDBDMTAwIDEwMCAxMTUgODUgMTE1IDYwQzExNSAzNSAxMDAgMjAgNzUgMjBDNTAgMjAgMzUgMzUgMzUgNjBDMzUgODUgNTAgMTAwIDc1IDEwMFoiIGZpbGw9IiNmOGY4ZjgiLz48cGF0aCBkPSJNNzUgODBDODcgODAgOTYgNzEgOTYgNjBDOTYgNDkgODcgNDAgNzUgNDBjLTEyIDAtMjEgOS0yMSAyMHM5IDIxIDIxIDIxIDIxLTkgMjEtMjFzLTktMjEtMjEtMjF6IiBmaWxsPSIjYjViNWI1Ii8+PC9zdmc+'
    }
    
    // 处理图片加载成功
    const handleImageLoad = (e) => {
      console.log('图片加载成功:', e.target.src)
    }
    
    return {
      orderId,
      viewOnly,
      loading,
      submitting,
      orderItems,
      ratings,
      contents,
      images,
      uploading,
      uploadProgress,
      onRateClick,
      onContentInput,
      chooseImage,
      removeImage,
      submitReview,
      goBack,
      handleImageError,
      handleImageLoad,
      config
    }
  }
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
  
  .content {
    padding: 20rpx;
    
    .loading-state {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 100rpx 0;
    }
    
    .review-content {
      .section {
        background-color: #fff;
        border-radius: 20rpx;
        padding: 20rpx;
        margin-bottom: 20rpx;
        
        .section-title {
          font-size: 32rpx;
          font-weight: bold;
          margin-bottom: 20rpx;
          padding-bottom: 20rpx;
          border-bottom: 2rpx solid #eee;
        }
        
        .item-card {
          background-color: #fafafa;
          border-radius: 16rpx;
          padding: 20rpx;
          margin-bottom: 20rpx;
          
          .item-header {
            margin-bottom: 20rpx;
            
            .item-info {
              
              .item-name {
                display: block;
                font-size: 28rpx;
                font-weight: bold;
                margin-bottom: 10rpx;
              }
              
              .item-spec {
                display: block;
                font-size: 24rpx;
                color: #666;
                margin-bottom: 10rpx;
              }
              
              .item-price {
                display: block;
                font-size: 26rpx;
                color: #ff6b35;
              }
            }
          }
          
          .rating-section {
            display: flex;
            align-items: center;
            margin-bottom: 20rpx;
            
            .rating-label {
              font-size: 28rpx;
              margin-right: 20rpx;
            }
          }
          
          .review-input-section {
            margin-bottom: 20rpx;
            
            .review-textarea {
              width: 100%;
              min-height: 120rpx;
              padding: 20rpx;
              border: 2rpx solid #eee;
              border-radius: 10rpx;
              font-size: 28rpx;
            }
          }
          
          .image-upload-section {
            margin-bottom: 20rpx;
            
            .upload-title {
              font-size: 26rpx;
              margin-bottom: 15rpx;
              color: #666;
            }
            
            .image-list {
              display: flex;
              flex-wrap: wrap;
              gap: 15rpx;
            }
            
            .image-item {
              position: relative;
              width: 150rpx;
              height: 150rpx;
              border-radius: 8rpx;
              overflow: hidden;
              background-color: #f0f0f0;
            }
            
            .uploaded-image {
              width: 100%;
              height: 100%;
            }
            
            .image-delete {
              position: absolute;
              top: 5rpx;
              right: 5rpx;
              width: 30rpx;
              height: 30rpx;
              background-color: rgba(0, 0, 0, 0.6);
              color: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24rpx;
              cursor: pointer;
            }
            
            .upload-btn {
              width: 150rpx;
              height: 150rpx;
              border: 2rpx dashed #ddd;
              border-radius: 8rpx;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              background-color: #fafafa;
              cursor: pointer;
              transition: all 0.3s ease;
              
              &:hover {
                border-color: #ff6b35;
                background-color: #fff8f5;
              }
              
              .upload-icon {
                font-size: 48rpx;
                color: #999;
                margin-bottom: 10rpx;
              }
              
              .upload-text {
                font-size: 20rpx;
                color: #999;
              }
            }
            
            .uploading {
              width: 150rpx;
              height: 150rpx;
              border: 2rpx dashed #ddd;
              border-radius: 8rpx;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              background-color: #fafafa;
              padding: 10rpx;
              
              text {
                font-size: 20rpx;
                color: #999;
                margin-top: 10rpx;
              }
              
              .progress-bar {
                width: 100%;
                height: 8rpx;
                background-color: #f0f0f0;
                border-radius: 4rpx;
                margin: 10rpx 0;
                overflow: hidden;
                
                .progress {
                  height: 100%;
                  background-color: #ff6b35;
                  border-radius: 4rpx;
                  transition: width 0.3s ease;
                }
              }
              
              .progress-text {
                font-size: 18rpx;
                color: #ff6b35;
                margin-top: 5rpx;
              }
            }
          }
        }
        
        .no-reviewable {
          padding: 100rpx 0;
          text-align: center;
        }
      }
      
      .no-data {
        padding: 100rpx 0;
        text-align: center;
      }
    }
  }
  
  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20rpx 20rpx 40rpx;
    background-color: #fff;
    border-top: 2rpx solid #eee;
  }
}

/* 评分星星样式 */
.rating-stars {
  display: flex;
  gap: 8rpx;
  margin-left: 20rpx;
}

.star {
  font-size: 48rpx;
  color: #bbbbbb;
  cursor: pointer;
}

.full-star {
  color: #ffd21e;
}
</style>
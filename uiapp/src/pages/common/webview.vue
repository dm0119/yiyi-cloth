<template>
  <view class="webview-container">
    <view class="header">
      <van-icon name="arrow-left" @click="goBack" />
      <text class="title">支付页面</text>
    </view>
    <web-view :src="url" @message="handleMessage"></web-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const url = ref('')

onLoad((options) => {
  if (options.url) {
    url.value = decodeURIComponent(options.url)
  }
})

function goBack() {
  uni.navigateBack()
}

function handleMessage(e) {
  console.log('WebView message:', e)
  // 处理webview发送的消息
}
</script>

<style scoped>
  /* CSS变量定义 */
  :root {
    --primary-color: #ff6b6b;
    --primary-hover: #ee5a5a;
    --secondary-color: #4ecdc4;
    --success-color: #52c41a;
    --warning-color: #faad14;
    --error-color: #ff4d4f;
    --text-primary: #333333;
    --text-secondary: #666666;
    --text-muted: #999999;
    --bg-color: #f8f9fa;
    --bg-white: #ffffff;
    --border-color: #e8e8e8;
    --card-radius: 12px;
    --button-radius: 8px;
    --font-size-xs: 22rpx;
    --font-size-sm: 24rpx;
    --font-size-md: 28rpx;
    --font-size-lg: 32rpx;
    --font-size-xl: 36rpx;
    --font-size-xxl: 40rpx;
    --spacing-xs: 10rpx;
    --spacing-sm: 16rpx;
    --spacing-md: 24rpx;
    --spacing-lg: 32rpx;
    --spacing-xl: 48rpx;
    --shadow-sm: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
    --shadow-md: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
    --transition-fast: 0.2s ease;
  }
  
  /* 页面基础样式 */
  page {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: var(--font-size-md);
    color: var(--text-primary);
    background: linear-gradient(to bottom, #ffb6c1 0%, #fffaf0 100%);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  .webview-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

.header {
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.title {
  margin-left: 12px;
  font-size: 16px;
  font-weight: 600;
}

web-view {
  flex: 1;
}
</style>

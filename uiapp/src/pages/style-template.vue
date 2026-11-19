<template>
  <!-- 页面结构 -->
</template>

<script setup>
  // 页面逻辑
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

  /* 容器样式 */
  .container {
    padding: var(--spacing-md);
    min-height: 100vh;
    background: transparent;
  }

  /* 卡片样式 */
  .card {
    background: var(--bg-white);
    border-radius: var(--card-radius);
    padding: var(--spacing-md);
    box-shadow: var(--shadow-sm);
    margin-bottom: var(--spacing-md);
  }

  /* 按钮样式 */
  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-md);
    border-radius: var(--button-radius);
    transition: all var(--transition-fast);
    border: none;
    outline: none;
  }

  .btn-primary {
    background: white;
    color: var(--primary-color);
    border: 2rpx solid var(--primary-color);
  }

  .btn-primary:active {
    background: var(--bg-color);
  }

  .btn-secondary {
    background: var(--bg-white);
    color: var(--text-primary);
    border: 2rpx solid var(--border-color);
  }

  .btn-secondary:active {
    background: var(--bg-color);
  }

  .btn-danger {
    background: white;
    color: var(--error-color);
    border: 2rpx solid var(--error-color);
  }

  .btn-danger:active {
    background: var(--bg-color);
  }

  .btn-block {
    width: 100%;
  }

  .btn-lg {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: var(--font-size-lg);
  }

  /* 表单样式 */
  .form-group {
    margin-bottom: var(--spacing-md);
  }

  .form-label {
    display: block;
    margin-bottom: var(--spacing-xs);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }

  .form-input {
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-md);
    border: 2rpx solid var(--border-color);
    border-radius: var(--button-radius);
    background: var(--bg-white);
  }

  .form-input:focus {
    border-color: var(--primary-color);
  }

  /* 工具类 */
  .text-center {
    text-align: center;
  }

  .text-primary {
    color: var(--primary-color);
  }

  .text-success {
    color: var(--success-color);
  }

  .text-warning {
    color: var(--warning-color);
  }

  .text-error {
    color: var(--error-color);
  }

  .text-muted {
    color: var(--text-muted);
  }

  .mt-sm {
    margin-top: var(--spacing-sm);
  }

  .mt-md {
    margin-top: var(--spacing-md);
  }

  .mb-sm {
    margin-bottom: var(--spacing-sm);
  }

  .mb-md {
    margin-bottom: var(--spacing-md);
  }

  .flex {
    display: flex;
  }

  .flex-wrap {
    flex-wrap: wrap;
  }

  .flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .flex-between {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .flex-column {
    flex-direction: column;
  }

  .gap-sm {
    gap: var(--spacing-sm);
  }

  .gap-md {
    gap: var(--spacing-md);
  }

  /* 价格样式 */
  .price {
    color: var(--primary-color);
    font-weight: 600;
    font-size: var(--font-size-lg);
  }

  .price-symbol {
    font-size: var(--font-size-sm);
  }

  /* 徽章样式 */
  .badge {
    display: inline-block;
    padding: 4rpx 16rpx;
    font-size: var(--font-size-xs);
    border-radius: 20rpx;
    background: var(--bg-color);
    color: var(--text-secondary);
  }

  .badge-success {
    background: #f6ffed;
    color: var(--success-color);
  }

  .badge-warning {
    background: #fffbe6;
    color: var(--warning-color);
  }

  .badge-error {
    background: #fff2f0;
    color: var(--error-color);
  }

  /* 空状态样式 */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-xl);
    color: var(--text-muted);
  }

  .empty-state-icon {
    font-size: 80rpx;
    margin-bottom: var(--spacing-md);
  }

  /* 安全区域适配 */
  .safe-area-bottom {
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
  }

  /* 评价星星样式 */
  .van-rate {
    --van-rate-icon-void-color: #bbbbbb !important;
    --van-rate-icon-full-color: #ffd21e !important;
    --van-rate-icon-color: #ffd21e !important;
  }

  .van-icon-star-o {
    color: #bbbbbb !important;
  }

  .van-icon-star {
    color: #ffd21e !important;
  }

  .van-rate .van-icon {
    color: #bbbbbb !important;
  }

  .van-rate .van-rate__item--full .van-icon {
    color: #ffd21e !important;
  }

  .van-rate .van-rate__item--half .van-icon {
    color: #ffd21e !important;
  }
</style>
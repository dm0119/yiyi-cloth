<template>
  <view class="realname-page">
    <!-- 状态栏 -->
    <view class="status-bar" :class="statusClass">
      <view class="status-icon">
        <text v-if="realnameStatus === 'approved'" class="icon-success">✓</text>
        <text v-else class="icon-none">!</text>
      </view>
      <view class="status-text">
        <text class="status-title">{{ statusTitle }}</text>
        <text class="status-desc">{{ statusDesc }}</text>
      </view>
    </view>

    <!-- 已认证状态 -->
    <view v-if="realnameStatus === 'approved'" class="verified-content">
      <view class="info-card">
        <view class="info-row">
          <text class="label">真实姓名</text>
          <text class="value">{{ realnameInfo.real_name }}</text>
        </view>
        <view class="info-row">
          <text class="label">身份证号</text>
          <text class="value id-card">{{ realnameInfo.id_card_number_masked }}</text>
        </view>
        <view class="info-row">
          <text class="label">认证时间</text>
          <text class="value">{{ realnameInfo.reviewed_at }}</text>
        </view>
      </view>
    </view>

    <!-- 未认证/被拒绝状态 -->
    <view v-else class="apply-content">
      <view class="apply-notice">
        <text class="notice-title">请完成实名认证</text>
        <text class="notice-desc">实名认证后即可享受完整的购物体验</text>
      </view>
      
      <view class="apply-form">
        <view class="form-item">
          <text class="form-label">真实姓名</text>
          <input 
            class="form-input" 
            v-model="formData.real_name" 
            placeholder="请输入真实姓名"
            maxlength="20"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">身份证号</text>
          <input 
            class="form-input" 
            v-model="formData.id_card_number" 
            :placeholder="formData.id_card_number ? formData.id_card_number.replace(/^(.{6}).*(.{4})$/, '$1********$2') : '请输入 18 位身份证号'"
            maxlength="18"
            type="text"
          />
          <text class="form-tip">身份证号将用于实名认证，我们会严格保密</text>
        </view>
      </view>
      
      <view class="agreement">
        <checkbox-group @change="onAgreementChange">
          <label class="agreement-label">
            <checkbox :checked="agreed" color="#07c160" />
            <text class="agreement-text">
              我已阅读并同意<text class="link" @click.stop="showAgreement">《实名认证服务协议》</text>
            </text>
          </label>
        </checkbox-group>
      </view>
      
      <button 
        class="btn-submit" 
        :disabled="!canSubmit || submitting"
        @click="handleSubmit"
      >
        {{ submitting ? '提交中...' : '提交认证' }}
      </button>
    </view>

    <!-- 协议弹窗 -->
    <view v-if="showAgreementPopup" class="agreement-popup" @click="showAgreementPopup = false">
      <view class="agreement-content" @click.stop>
        <view class="agreement-header">
          <text>实名认证服务协议</text>
          <text class="close-btn" @click="showAgreementPopup = false">×</text>
        </view>
        <scroll-view class="agreement-body" scroll-y>
          <text>1. 本服务仅用于验证用户身份信息的真实性...\n\n2. 您提供的身份信息将受到严格保护...\n\n3. 如发现身份信息被冒用，请及时联系我们...\n\n4. 实名认证通过后不可修改...\n\n（完整协议内容请在实际项目中补充）</text>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { realNameApi } from '../../services/api.js'

// 状态
const realnameStatus = ref('none')
const realnameInfo = ref({})
const submitting = ref(false)
const agreed = ref(false)
const showAgreementPopup = ref(false)

// 表单数据
const formData = ref({
  real_name: '',
  id_card_number: ''
})

// 当前上传的类型（已移除）
const currentUploadType = ref('')

// 计算属性
const statusClass = computed(() => {
  return {
    'status-approved': realnameStatus.value === 'approved',
    'status-none': realnameStatus.value === 'none' || realnameStatus.value === 'rejected'
  }
})

const statusTitle = computed(() => {
  const titles = {
    approved: '已实名认证',
    none: '未完成实名认证',
    rejected: '认证未通过'
  }
  return titles[realnameStatus.value] || '未认证'
})

const statusDesc = computed(() => {
  const descs = {
    approved: '您已完成实名认证，可享受完整服务',
    none: '完成实名认证后可下单购买商品',
    rejected: '请重新提交认证申请'
  }
  return descs[realnameStatus.value] || ''
})

const canSubmit = computed(() => {
  // 验证身份证号格式
  const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/
  return (
    formData.value.real_name.trim() &&
    formData.value.id_card_number.length === 18 &&
    idCardRegex.test(formData.value.id_card_number) &&
    agreed.value
  )
})

// 加载实名信息
const loadRealnameInfo = async () => {
  try {
    uni.showLoading({ title: '加载中...' })
    const res = await realNameApi.getStatus()
    if (res.success) {
      realnameStatus.value = res.data.status || 'none'
      realnameInfo.value = res.data
    }
  } catch (error) {
    console.error('加载实名信息失败:', error)
  } finally {
    uni.hideLoading()
  }
}

// 选择图片（已移除）
const chooseImage = (type) => {
  console.log('图片上传功能已移除')
}

// 预览图片（已移除）
const previewImage = (url) => {
  console.log('图片预览功能已移除')
}

// 协议
const showAgreement = () => {
  showAgreementPopup.value = true
}

const onAgreementChange = (e) => {
  agreed.value = e.detail.value.length > 0
}

// 提交认证
const handleSubmit = async () => {
  // 验证身份证号格式
  const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/
  if (!idCardRegex.test(formData.value.id_card_number)) {
    uni.showToast({ title: '身份证号格式不正确', icon: 'none' })
    return
  }
  
  // 验证真实姓名一致性
  const registeredName = uni.getStorageSync('registeredName')
  if (registeredName && formData.value.real_name.trim() !== registeredName.trim()) {
    uni.showModal({
      title: '提示',
      content: '您输入的真实姓名与注册时填写的姓名不一致，请确认是否继续提交？',
      confirmText: '继续提交',
      cancelText: '修改',
      success: (res) => {
        if (res.confirm) {
          // 用户选择继续提交，更新注册姓名为当前输入的姓名
          uni.setStorageSync('registeredName', formData.value.real_name.trim())
          submitRealNameApplication()
        }
      }
    })
    return
  }
  
  // 直接提交
  submitRealNameApplication()
}

// 提交实名认证申请的函数
const submitRealNameApplication = async () => {
  submitting.value = true
  try {
    const res = await realNameApi.apply(formData.value)
    if (res.success) {
      uni.showToast({ title: '实名认证已通过', icon: 'success' })
      
      // 更新用户信息中的实名认证状态
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo) {
        userInfo.real_name_status = 'approved'
        uni.setStorageSync('userInfo', userInfo)
      }
      
      setTimeout(() => {
        // 跳转到我的页面
        uni.switchTab({
          url: '/pages/user/index'
        })
      }, 1500)
    }
  } catch (error) {
    uni.showToast({ title: error.message || '提交失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

// 取消申请
const handleCancel = async () => {
  uni.showModal({
    title: '提示',
    content: '确定要取消当前的认证申请吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await realNameApi.cancelPending()
          if (result.success) {
            uni.showToast({ title: '已取消申请', icon: 'success' })
            setTimeout(() => {
              loadRealnameInfo()
            }, 1500)
          }
        } catch (error) {
          uni.showToast({ title: error.message || '取消失败', icon: 'none' })
        }
      }
    }
  })
}

// 页面加载
onMounted(() => {
  loadRealnameInfo()
})
</script>

<style scoped>
.realname-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.status-bar {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.status-approved {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
}

.status-pending {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
}

.status-none {
  background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
}

.status-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  font-size: 40rpx;
}

.status-approved .status-icon {
  background: #4caf50;
  color: #fff;
}

.status-pending .status-icon {
  background: #ff9800;
  color: #fff;
}

.status-none .status-icon {
  background: #f44336;
  color: #fff;
}

.status-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.status-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.status-desc {
  font-size: 24rpx;
  color: #666;
}

.verified-content,
.pending-content,
.apply-content {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
}

.info-card {
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1px solid #eee;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  color: #666;
  font-size: 28rpx;
}

.value {
  color: #333;
  font-size: 28rpx;
}

.id-card {
  font-family: monospace;
  letter-spacing: 2rpx;
}

.id-card-images,
.id-card-preview {
  display: flex;
  gap: 20rpx;
}

.id-card-item {
  flex: 1;
  text-align: center;
}

.id-card-label {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.id-card-image {
  width: 100%;
  height: 200rpx;
  border: 1px solid #ddd;
  border-radius: 8rpx;
}

.pending-notice,
.apply-notice {
  text-align: center;
  padding: 40rpx 0;
}

.notice-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.notice-desc {
  display: block;
  font-size: 26rpx;
  color: #666;
}

.btn-cancel {
  margin-top: 40rpx;
  background: #fff;
  color: #f44336;
  border: 1px solid #f44336;
  border-radius: 44rpx;
  font-size: 28rpx;
}

.apply-form {
  margin-top: 20rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
}

.form-input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.form-tip {
  display: block;
  margin-top: 12rpx;
  padding-left: 24rpx;
  font-size: 24rpx;
  color: #999;
  line-height: 1.5;
}

.upload-area {
  width: 100%;
  height: 300rpx;
  background: #f5f5f5;
  border: 2rpx dashed #ddd;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-image {
  width: 100%;
  height: 100%;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-placeholder .icon {
  font-size: 80rpx;
  color: #999;
  line-height: 1;
}

.upload-placeholder .desc {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

.upload-tip {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-top: 10rpx;
}

.agreement {
  margin: 30rpx 0;
}

.agreement-label {
  display: flex;
  align-items: center;
  font-size: 24rpx;
}

.agreement-text {
  color: #666;
  margin-left: 10rpx;
}

.link {
  color: #07c160;
}

.btn-submit {
  width: 100%;
  height: 88rpx;
  background: #07c160;
  color: #fff;
  border-radius: 44rpx;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-submit[disabled] {
  background: #ccc;
  color: #fff;
}

.agreement-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.agreement-content {
  width: 90%;
  max-height: 70vh;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.agreement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1px solid #eee;
  font-size: 32rpx;
  font-weight: bold;
}

.close-btn {
  font-size: 48rpx;
  color: #999;
}

.agreement-body {
  padding: 30rpx;
  max-height: 500rpx;
  font-size: 26rpx;
  line-height: 1.8;
  color: #666;
  white-space: pre-wrap;
}
</style>

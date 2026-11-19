<template>
  <div class="login-container">
    <div class="login-wrapper">
      <div class="announcement-panel">
        <div class="announcement-section">
          <div class="announcement-header">
            <span class="announcement-title">入驻申请动态</span>
            <div class="filter-tabs">
              <span
                v-for="tab in filterTabs"
                :key="tab.value"
                :class="['filter-tab', { active: currentFilter === tab.value }]"
                @click="changeFilter(tab.value)"
              >
                {{ tab.label }}
              </span>
            </div>
          </div>

          <div class="date-filter">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="small"
              @change="onDateChange"
              clearable
            />
          </div>

          <div class="announcement-scroll-wrapper">
            <div class="announcement-scroll" ref="scrollRef">
              <div
                v-for="item in filteredByDate"
                :key="item.id"
                class="announcement-item"
                :class="'status-' + item.status"
              >
                <div class="announcement-status-badge">
                  <span class="badge-text">{{ item.status_text }}</span>
                </div>
                <div class="announcement-content">
                  <div class="info-row">
                    <span class="info-label">申请人：</span>
                    <span class="info-value">{{ item.applicant_name }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">店铺：</span>
                    <span class="info-value">{{ item.shop_name }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">电话：</span>
                    <span class="info-value">{{ item.contact_phone }}</span>
                  </div>
                  <div class="info-row time-row">
                    <span class="info-label">时间：</span>
                    <span class="info-value time-text">{{ formatTime(item) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="empty-announcement" v-if="!loadingAnnouncements && filteredByDate.length === 0">
            <span class="empty-text">暂无申请动态</span>
          </div>
        </div>
      </div>

      <el-card class="login-card" shadow="hover">
        <template #header>
          <div class="login-title">
            <el-icon class="title-icon"></el-icon>
            <span>依依大码服装在线销售系统后台登录</span>
          </div>
        </template>

        <el-radio-group v-model="loginType" class="login-type-radio">
          <el-radio-button value="login">登录</el-radio-button>
          <el-radio-button value="register">商家入驻</el-radio-button>
        </el-radio-group>

        <!-- 登录表单 -->
        <el-form
          v-if="loginType === 'login'"
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          auto-complete="off"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入账号"
              prefix-icon="User"
              clearable
              size="large"
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
              clearable
              size="large"
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <div class="login-button-item">
            <el-button
              type="primary"
              :loading="loading"
              @click="handleLogin"
              size="large"
              class="login-btn">
              登录
            </el-button>
          </div>
        </el-form>

        <!-- 商家入驻表单 -->
        <el-form
          v-if="loginType === 'register'"
          ref="merchantFormRef"
          :model="merchantForm"
          :rules="merchantRules"
          class="login-form merchant-form"
          auto-complete="off"
          @submit.prevent="handleMerchantApply"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="店铺名称" prop="shopName">
                <el-input
                  v-model="merchantForm.shopName"
                  placeholder="请输入店铺名称"
                  size="large"
                />
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="营业执照号" prop="licenseNo">
                <el-input
                  v-model="merchantForm.licenseNo"
                  placeholder="请输入18位营业执照号码，例如：91110108MA009X123456"
                  size="large"
                >
                  <template #append>
                    <el-button @click="generateLicenseNo">
                      <el-icon><Refresh /></el-icon>
                    </el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="申请人姓名" prop="applicantName">
                <el-input
                  v-model="merchantForm.applicantName"
                  placeholder="请输入申请人姓名"
                  size="large"
                />
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="用户名" prop="username">
                <el-input
                  v-model="merchantForm.username"
                  placeholder="请输入用户名"
                  size="large"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="联系电话" prop="contactPhone">
                <el-input
                  v-model="merchantForm.contactPhone"
                  placeholder="请输入联系电话"
                  size="large"
                />
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="联系邮箱" prop="contactEmail">
                <el-input
                  v-model="merchantForm.contactEmail"
                  placeholder="请输入联系邮箱"
                  size="large"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="登录密码" prop="password">
                <el-input
                  v-model="merchantForm.password"
                  type="password"
                  placeholder="请设置登录密码（6-20 位）"
                  show-password
                  size="large"
                />
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input
                  v-model="merchantForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入密码"
                  show-password
                  size="large"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="店铺简介" prop="description">
            <el-input
              v-model="merchantForm.description"
              type="textarea"
              placeholder="请简要描述您的店铺"
              :rows="3"
              size="large"
            />
          </el-form-item>
          
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="店铺资格证" prop="licenseImage">
                <el-upload
                  class="license-uploader"
                  :show-file-list="false"
                  :before-upload="(file) => handleImageUpload(file, 'licenseImage')"
                  action="#"
                >
                  <img v-if="merchantForm.licenseImage" :src="merchantForm.licenseImage" class="uploaded-image" />
                  <el-icon v-else class="license-uploader-icon"><Plus /></el-icon>
                </el-upload>
                <div class="upload-tip">请上传店铺营业执照或资质证明图片</div>
              </el-form-item>
            </el-col>
            
            <el-col :span="8">
              <el-form-item label="身份证正面" prop="idCardFront">
                <el-upload
                  class="license-uploader"
                  :show-file-list="false"
                  :before-upload="(file) => handleImageUpload(file, 'idCardFront')"
                  action="#"
                >
                  <img v-if="merchantForm.idCardFront" :src="merchantForm.idCardFront" class="uploaded-image" />
                  <el-icon v-else class="license-uploader-icon"><Plus /></el-icon>
                </el-upload>
                <div class="upload-tip">请上传法人身份证正面照片</div>
              </el-form-item>
            </el-col>
            
            <el-col :span="8">
              <el-form-item label="身份证反面" prop="idCardBack">
                <el-upload
                  class="license-uploader"
                  :show-file-list="false"
                  :before-upload="(file) => handleImageUpload(file, 'idCardBack')"
                  action="#"
                >
                  <img v-if="merchantForm.idCardBack" :src="merchantForm.idCardBack" class="uploaded-image" />
                  <el-icon v-else class="license-uploader-icon"><Plus /></el-icon>
                </el-upload>
                <div class="upload-tip">请上传法人身份证反面照片</div>
              </el-form-item>
            </el-col>
          </el-row>
          
          <div class="login-button-item">
            <el-button
              type="primary"
              :loading="loading"
              @click="handleMerchantApply"
              size="large"
              class="login-btn">
              提交入驻申请
            </el-button>
          </div>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock, User, Refresh, Plus } from '@element-plus/icons-vue'
import { authApi, merchantApi } from '../services/api'

const router = useRouter()
const loginFormRef = ref()
const merchantFormRef = ref()
const scrollRef = ref()
const loading = ref(false)
const loginType = ref('login')

const announcements = ref([])
const loadingAnnouncements = ref(true)
const currentFilter = ref('all')
const dateRange = ref(null)
const scrollTop = ref(0)
let autoScrollTimer = null

const filterTabs = [
  { label: '全部', value: 'all' },
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已拒绝', value: 'rejected' }
]

const displayedAnnouncements = computed(() => {
  if (currentFilter.value === 'all') {
    return announcements.value
  }
  return announcements.value.filter(item => item.status === currentFilter.value)
})

const filteredByDate = computed(() => {
  if (!dateRange.value || dateRange.value.length !== 2) {
    return displayedAnnouncements.value
  }
  const [start, end] = dateRange.value
  const startDate = new Date(start)
  startDate.setHours(0, 0, 0, 0)
  const endDate = new Date(end)
  endDate.setHours(23, 59, 59, 999)
  return displayedAnnouncements.value.filter(item => {
    const itemDate = new Date(item.reviewed_at || item.created_at)
    return itemDate >= startDate && itemDate <= endDate
  })
})

const loginForm = reactive({
  username: '',
  password: ''
})

const merchantForm = reactive({
  shopName: '',
  licenseNo: '',
  applicantName: '',
  username: '',
  contactPhone: '',
  contactEmail: '',
  password: '',
  confirmPassword: '',
  description: '',
  licenseImage: '',
  idCardFront: '',
  idCardBack: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '账号长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const merchantRules = {
  shopName: [
    { required: true, message: '请输入店铺名称', trigger: 'blur' },
    { min: 2, max: 50, message: '店铺名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  licenseNo: [
    { required: true, message: '请输入营业执照号码', trigger: 'blur' },
    { pattern: /^91[A-Z0-9]{16}$/, message: '请输入正确的 18 位营业执照号码（以 91 开头，后跟 16 位字母或数字）', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  applicantName: [
    { required: true, message: '请输入申请人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请设置登录密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== merchantForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const generateLicenseNo = () => {
  const prefixes = ['91110108', '91310115', '91440305', '91330108', '91440106']
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const randomChars = Math.random().toString(36).substring(2, 12).toUpperCase()
  const licenseNo = `${randomPrefix}${randomChars}`
  merchantForm.licenseNo = licenseNo.substring(0, 18)
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    // 调用登录 API
    const response = await authApi.login(loginForm.username, loginForm.password)
    const user = response.data.user

    // 调试信息
    console.log('登录成功，用户信息:', user, '角色:', user.role, '权限数据:', response.data.permissions)

    // 根据角色跳转到不同的后台
    if (user.role === '商家') {
      // 清除可能存在的 admin_token，避免混淆
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      localStorage.removeItem('admin_permissions')
      
      // 商家跳转到商家后台首页
      localStorage.setItem('merchant_token', response.data.token)
      localStorage.setItem('merchant_user', JSON.stringify(user))
      localStorage.setItem('merchant_permissions', JSON.stringify(response.data.permissions))
      
      // 验证商家登录状态是否成功写入
      const finalMerchantToken = localStorage.getItem('merchant_token')
      const finalMerchantPermissions = localStorage.getItem('merchant_permissions')
      console.log('商家登录验证:', {
        token: finalMerchantToken ? '✓' : '✗',
        permissions: finalMerchantPermissions ? '✓' : '✗'
      })
      
      if (!finalMerchantToken || !finalMerchantPermissions) {
        ElMessage.error('登录状态异常，请重试')
        loading.value = false
        return
      }
      
      ElMessage.success('登录成功')
      // 商家跳转到商家后台
      router.push('/merchant/dashboard')
    } else if (user.role === '买家') {
      // 清除所有后台 token
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      localStorage.removeItem('admin_permissions')
      localStorage.removeItem('merchant_token')
      localStorage.removeItem('merchant_user')
      localStorage.removeItem('merchant_permissions')
      
      ElMessage.success('登录成功')
      // 买家跳转到管理后台首页（因为买家也可以作为客服/运营人员）
      router.push('/admin/dashboard')
    } else {
      // 超级管理员/运营人员/客服人员跳转到管理后台
      // 清除可能存在的商家 token，避免混淆
      localStorage.removeItem('merchant_token')
      localStorage.removeItem('merchant_user')
      localStorage.removeItem('merchant_permissions')
      
      localStorage.setItem('admin_token', response.data.token)
      localStorage.setItem('admin_user', JSON.stringify(user))
      localStorage.setItem('admin_permissions', JSON.stringify(response.data.permissions))
      
      // 验证管理员登录状态是否成功写入
      const finalAdminToken = localStorage.getItem('admin_token')
      const finalAdminPermissions = localStorage.getItem('admin_permissions')
      console.log('管理员登录验证:', {
        token: finalAdminToken ? '✓' : '✗',
        permissions: finalAdminPermissions ? '✓' : '✗'
      })
      
      if (!finalAdminToken || !finalAdminPermissions) {
        ElMessage.error('登录状态异常，请重试')
        loading.value = false
        return
      }
      
      ElMessage.success('登录成功')

      // 检查是否有店铺管理权限，如果有则跳转到店铺管理
      const permissions = response.data.permissions || []
      if (permissions.includes('shop:view')) {
        console.log('✓ 有店铺管理权限，跳转到店铺管理页面')
        router.push('/admin/shops')
      } else {
        console.log('⚠️  没有店铺管理权限，跳转到首页')
        router.push('/admin/dashboard')
      }
    }
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('登录失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

const handleMerchantApply = async () => {
  if (!merchantFormRef.value) return
  
  // 验证图片是否上传
  if (!merchantForm.licenseImage || !merchantForm.idCardFront || !merchantForm.idCardBack) {
    ElMessage.warning('请上传店铺资格证和身份证正反面图片')
    return
  }
  
  try {
    await merchantFormRef.value.validate()
    loading.value = true
    
    // 调用入驻申请 API，传递密码（字段名与后端 shops 表一致）
    const applyData = {
      name: merchantForm.shopName,
      license_no: merchantForm.licenseNo,
      legal_person: merchantForm.applicantName,
      username: merchantForm.username,
      contact_phone: merchantForm.contactPhone,
      contact_email: merchantForm.contactEmail,
      password: merchantForm.password,
      description: merchantForm.description,
      license_image: merchantForm.licenseImage,
      id_card_front: merchantForm.idCardFront,
      id_card_back: merchantForm.idCardBack
    }
    
    const response = await merchantApi.apply(applyData)
    
    ElMessage.success(response.message || '入驻申请已提交')
    
    // 清空表单
    merchantFormRef.value.resetFields()
    // 重置图片
    merchantForm.licenseImage = ''
    merchantForm.idCardFront = ''
    merchantForm.idCardBack = ''
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('入驻申请失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

// 图片上传处理
const handleImageUpload = async (file, field) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5
  
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB')
    return false
  }
  
  // 使用 FormData 上传
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    const result = await response.json()
    
    if (result.success && result.url) {
      merchantForm[field] = result.url
      ElMessage.success('上传成功')
    } else {
      ElMessage.error(result.message || '上传失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败，请重试')
  }
  
  return false // 阻止默认上传
}

async function loadAnnouncements() {
  try {
    const res = await merchantApi.getAnnouncements({
      status: currentFilter.value === 'all' ? undefined : currentFilter.value,
      limit: 20
    })
    if (res.success && res.data) {
      announcements.value = res.data
    }
  } catch (error) {
    console.error('加载公告失败:', error)
  } finally {
    loadingAnnouncements.value = false
  }
}

function changeFilter(status) {
  currentFilter.value = status
  loadAnnouncements()
}

function onDateChange() {
  // 日期筛选通过 computed 自动处理，这里只需重置滚动位置
  if (scrollRef.value) {
    scrollRef.value.scrollTop = 0
  }
}

function formatTime(item) {
  const time = item.reviewed_at || item.created_at
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  if (year === now.getFullYear()) {
    return `${month}-${day} ${hour}:${minute}`
  }
  return `${year}-${month}-${day} ${hour}:${minute}`
}

function startAutoScroll() {
  if (autoScrollTimer) clearInterval(autoScrollTimer)
  autoScrollTimer = setInterval(() => {
    if (scrollRef.value) {
      scrollRef.value.scrollTop += 1
      if (scrollRef.value.scrollTop >= scrollRef.value.scrollHeight - scrollRef.value.clientHeight) {
        scrollRef.value.scrollTop = 0
      }
    }
  }, 50)
}

function stopAutoScroll() {
  if (autoScrollTimer) {
    clearInterval(autoScrollTimer)
    autoScrollTimer = null
  }
}

onMounted(() => {
  loadAnnouncements()
  startAutoScroll()
})

onUnmounted(() => {
  stopAutoScroll()
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #ffb6c1 0%, #fffaf0 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.login-wrapper {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  max-width: 1100px;
  width: 100%;
}

.announcement-panel {
  flex: 1;
  min-width: 0;
}

.login-card {
  width: 600px;
  flex-shrink: 0;
  border-radius: 12px;
  background: transparent;
}

.login-title {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: bold;
  color: #333;
}

.title-icon {
  font-size: 38px;
  margin-right: 8px;
  color: #667eea;
}

.login-type-radio {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.login-form {
  margin-top: 20px;
}

.login-button-item {
  text-align: center;
  margin-top: 10px;
}

.login-button-item :deep(.el-button) {
  width: auto !important;
  display: inline-block !important;
}

.login-btn {
  height: 40px;
  font-size: 22px;
}

.license-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.license-uploader:hover {
  border-color: #409eff;
}

.license-uploader-icon {
  font-size: 38px;
  color: #8c939d;
}

.uploaded-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
}

.upload-tip {
  font-size: 18px;
  color: #999;
  margin-top: 4px;
}

.announcement-section {
  margin-bottom: 16px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.announcement-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
}

.announcement-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.filter-tabs {
  display: flex;
  gap: 6px;
}

.filter-tab {
  font-size: 18px;
  color: #666;
  padding: 2px 10px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.filter-tab:hover {
  background: rgba(0, 0, 0, 0.1);
}

.filter-tab.active {
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
  font-weight: 500;
}

.date-filter {
  margin-top: 8px;
  margin-bottom: 8px;
}

.date-filter :deep(.el-date-editor) {
  width: 100%;
}

.announcement-scroll-wrapper {
  max-height: 280px;
  overflow: hidden;
}

.announcement-scroll {
  max-height: 280px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #c0c4cc transparent;
}

.announcement-scroll::-webkit-scrollbar {
  width: 4px;
}

.announcement-scroll::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 2px;
}

.announcement-item {
  display: flex;
  align-items: flex-start;
  padding: 8px;
  margin-bottom: 6px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 6px;
  border-left: 3px solid #c0c4cc;
  transition: all 0.2s ease;
}

.announcement-item:hover {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.announcement-item.status-pending {
  border-left-color: #e6a23c;
}

.announcement-item.status-approved {
  border-left-color: #67c23a;
}

.announcement-item.status-rejected {
  border-left-color: #f56c6c;
}

.announcement-status-badge {
  flex-shrink: 0;
  margin-right: 8px;
}

.badge-text {
  font-size: 18px;
  padding: 2px 6px;
  border-radius: 3px;
  background: #c0c4cc;
  color: #fff;
  white-space: nowrap;
}

.status-pending .badge-text {
  background: #e6a23c;
}

.status-approved .badge-text {
  background: #67c23a;
}

.status-rejected .badge-text {
  background: #f56c6c;
}

.announcement-content {
  flex: 1;
  min-width: 0;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 2px;
}

.time-row {
  margin-bottom: 0;
}

.info-label {
  font-size: 18px;
  color: #909399;
  flex-shrink: 0;
}

.info-value {
  font-size: 18px;
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.time-text {
  color: #c0c4cc;
  font-size: 18px;
}

.empty-announcement {
  text-align: center;
  padding: 20px;
}

.empty-text {
  font-size: 18px;
  color: #c0c4cc;
}

/* 商家入驻表单样式 */
.merchant-form {
  max-width: 700px;
}

.merchant-form :deep(.el-form-item__label) {
  font-size: 14px;
}

.merchant-form :deep(.el-row) {
  margin-bottom: 0;
}

.merchant-form :deep(.el-col) {
  margin-bottom: 0;
}

.merchant-form .license-uploader {
  width: 100%;
  max-width: 150px;
  height: 100px;
}

.merchant-form .uploaded-image {
  width: 100%;
  max-width: 150px;
  height: 100px;
}

.merchant-form .upload-tip {
  font-size: 12px;
  line-height: 1.4;
  margin-top: 4px;
}
</style>
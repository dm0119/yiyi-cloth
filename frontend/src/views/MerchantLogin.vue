<template>
  <div class="merchant-login-container">
    <div class="login-box">
      <h2 class="login-title">商家后台登录</h2>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        size="large"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入手机号/邮箱"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
            size="large"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            style="width: 100%"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
        
        <div class="links">
          <router-link to="/admin/login">返回管理员登录</router-link>
          <span class="divider">|</span>
          <router-link to="/merchant-apply">商家入驻申请</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { userApi } from '../services/api'

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入手机号/邮箱', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    console.log('=== 开始登录 ===')
    console.log('登录表单数据:', { username: loginForm.username, password: '***' })
    
    // 调用登录 API
    console.log('1. 调用登录 API...')
    const response = await userApi.login(loginForm.username, loginForm.password)
    console.log('登录 API 响应:', response)
    
    // API 返回格式：{ success: true, data: { token, user, permissions } }
    console.log('2. 解析响应数据...')
    const loginData = response?.data
    console.log('loginData:', loginData)
    
    if (!loginData) {
      throw new Error('登录响应数据为空')
    }
    
    const user = loginData.user
    const permissions = loginData.permissions
    const token = loginData.token
    
    console.log('3. 提取用户信息:')
    console.log('  - user:', user)
    console.log('  - permissions:', permissions)
    console.log('  - token:', token ? '存在' : '不存在')
    
    if (!user || !token) {
      throw new Error('登录响应数据不完整：缺少用户信息或 token')
    }
    
    console.log('4. 检查用户角色...')
    console.log('  - user.role:', user.role)
    
    // 检查是否为商家角色
    if (user.role !== '商家') {
      ElMessage.error('您没有商家后台的访问权限')
      return
    }
    
    console.log('5. 保存登录信息到 localStorage...')
    // 保存登录信息
    localStorage.setItem('merchant_token', token)
    localStorage.setItem('merchant_user', JSON.stringify(user))
    localStorage.setItem('merchant_permissions', JSON.stringify(permissions))
    
    console.log('6. 验证保存结果:')
    console.log('  - merchant_token:', localStorage.getItem('merchant_token') ? '存在' : '不存在')
    console.log('  - merchant_user:', localStorage.getItem('merchant_user'))
    console.log('  - merchant_permissions:', localStorage.getItem('merchant_permissions'))
    
    ElMessage.success('登录成功')
    
    console.log('7. 跳转到商家后台...')
    // 跳转到商家后台
    router.push('/merchant/dashboard')
  } catch (error) {
    console.error('❌ 登录失败:', error)
    console.error('错误堆栈:', error.stack)
    if (error.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('登录失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.merchant-login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
}

.links {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
}

.links a {
  color: #667eea;
  text-decoration: none;
}

.links a:hover {
  text-decoration: underline;
}

.divider {
  margin: 0 10px;
  color: #ccc;
}
</style>

<template>
  <div class="debug-container">
    <h1>登录状态调试</h1>
    
    <el-card header="LocalStorage 数据">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="admin_token">{{ adminToken ? '存在' : '不存在' }}</el-descriptions-item>
        <el-descriptions-item label="merchant_token">{{ merchantToken ? '存在' : '不存在' }}</el-descriptions-item>
        <el-descriptions-item label="admin_user" :span="2">{{ adminUser ? JSON.stringify(adminUser, null, 2) : '不存在' }}</el-descriptions-item>
        <el-descriptions-item label="admin_permissions" :span="2">
          <div v-if="adminPermissions">
            <div>权限数量: {{ adminPermissions.length }}</div>
            <el-tag 
              v-for="perm in adminPermissions" 
              :key="perm" 
              style="margin: 2px"
              :type="perm === 'shop:view' ? 'success' : 'info'"
            >
              {{ perm }}
            </el-tag>
          </div>
          <div v-else>不存在</div>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card header="权限检查" style="margin-top: 20px">
      <el-alert 
        v-if="hasShopView" 
        title="✓ 有 shop:view 权限" 
        type="success" 
        show-icon
        style="margin-bottom: 10px"
      />
      <el-alert 
        v-else 
        title="✗ 没有 shop:view 权限" 
        type="error" 
        show-icon
        style="margin-bottom: 10px"
      />
      
      <el-button type="primary" @click="goToShopManagement">跳转到店铺管理</el-button>
      <el-button @click="goToDashboard">跳转到数据概览</el-button>
    </el-card>

    <el-card header="操作" style="margin-top: 20px">
      <el-button type="danger" @click="clearStorage">清除所有数据</el-button>
      <el-button @click="reload">刷新页面</el-button>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const adminToken = ref(localStorage.getItem('admin_token'))
const merchantToken = ref(localStorage.getItem('merchant_token'))
const adminUser = ref(null)
const adminPermissions = ref(null)

try {
  adminUser.value = JSON.parse(localStorage.getItem('admin_user') || 'null')
  adminPermissions.value = JSON.parse(localStorage.getItem('admin_permissions') || '[]')
} catch (e) {
  console.error('解析 LocalStorage 数据失败:', e)
}

const hasShopView = computed(() => {
  return adminPermissions.value && Array.isArray(adminPermissions.value) && adminPermissions.value.includes('shop:view')
})

const goToShopManagement = () => {
  router.push('/admin/shops')
}

const goToDashboard = () => {
  router.push('/admin/dashboard')
}

const clearStorage = () => {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')
  localStorage.removeItem('admin_permissions')
  localStorage.removeItem('merchant_token')
  localStorage.removeItem('merchant_user')
  localStorage.removeItem('merchant_permissions')
  alert('已清除所有数据，将跳转到登录页')
  router.push('/login')
}

const reload = () => {
  window.location.reload()
}
</script>

<style scoped>
.debug-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 20px;
}
</style>

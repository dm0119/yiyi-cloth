<template>
  <div class="debug-shop-management">
    <div class="page-header">
      <h2>店铺管理调试</h2>
      <p class="page-subtitle">调试店铺管理页面的加载过程</p>
    </div>

    <el-card>
      <h3>调试信息</h3>
      <el-divider />
      <el-table :data="debugInfo" border>
        <el-table-column prop="key" label="键" width="150" />
        <el-table-column prop="value" label="值" />
      </el-table>
    </el-card>

    <el-card style="margin-top: 20px">
      <h3>店铺列表</h3>
      <el-divider />
      <el-button type="primary" @click="getShopList">获取店铺列表</el-button>
      <el-table :data="shopList" border style="margin-top: 20px">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="店铺名称" />
        <el-table-column prop="status" label="状态" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { merchantApi } from '../services/api'

const debugInfo = ref([])
const shopList = ref([])

function addDebugInfo(key, value) {
  debugInfo.value.push({ key, value: JSON.stringify(value, null, 2) })
  console.log(`${key}:`, value)
}

const getShopList = async () => {
  addDebugInfo('开始获取店铺列表', new Date().toISOString())
  addDebugInfo('admin_token', localStorage.getItem('admin_token') ? '存在' : '不存在')
  addDebugInfo('admin_permissions', JSON.parse(localStorage.getItem('admin_permissions') || '[]'))
  
  try {
    const response = await merchantApi.getAllShops()
    addDebugInfo('API响应', response)
    addDebugInfo('response.data', response.data)
    addDebugInfo('Array.isArray(response.data)', Array.isArray(response.data))
    
    shopList.value = Array.isArray(response.data) ? response.data : []
    addDebugInfo('shopList', shopList.value)
    
    ElMessage.success('获取店铺列表成功')
  } catch (error) {
    addDebugInfo('获取店铺列表失败', error)
    ElMessage.error('获取店铺列表失败')
  } finally {
    addDebugInfo('获取店铺列表结束', new Date().toISOString())
  }
}

onMounted(() => {
  addDebugInfo('组件挂载', new Date().toISOString())
  addDebugInfo('路由信息', window.location.href)
  getShopList()
})
</script>

<style scoped>
.debug-shop-management {
  padding: var(--spacing-lg);
}

.page-header {
  margin-bottom: var(--spacing-lg);
}

.page-header h2 {
  font-size: var(--font-size-xl);
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}
</style>
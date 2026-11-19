<template>
  <div class="debug-permissions">
    <el-card shadow="hover">
      <template #header>
        <h3>权限调试信息</h3>
      </template>
      
      <div class="permission-info">
        <div class="info-section">
          <h4>localStorage 中的权限数据</h4>
          <pre>{{ permissionsString }}</pre>
          <el-button type="primary" @click="refreshPermissions">刷新权限</el-button>
        </div>
        
        <div class="info-section">
          <h4>解析后的权限数组</h4>
          <pre>{{ permissionsArray }}</pre>
        </div>
        
        <div class="info-section">
          <h4>菜单配置</h4>
          <pre>{{ menuItems }}</pre>
        </div>
        
        <div class="info-section">
          <h4>菜单过滤结果</h4>
          <pre>{{ filteredMenu }}</pre>
        </div>
        
        <div class="info-section">
          <h4>权限检查详情</h4>
          <div v-for="check in permissionChecks" :key="check.permission" class="permission-check">
            <span>{{ check.permission }}</span>
            <el-tag :type="check.has ? 'success' : 'danger'">
              {{ check.has ? '有权限' : '无权限' }}
            </el-tag>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { menuItems } from '../config/menu'

const permissionsString = ref('')
const permissionsArray = ref([])
const filteredMenu = ref([])
const permissionChecks = ref([])

function refreshPermissions() {
  try {
    const perms = localStorage.getItem('admin_permissions')
    permissionsString.value = perms || 'null'
    permissionsArray.value = perms ? JSON.parse(perms) : []
    
    // 检查关键权限
    const keyPermissions = [
      'product:view', 'product:manage', 'category:manage', 'category:view',
      'order:view', 'order:manage', 'order:detail', 'coupon:manage',
      'review:manage', 'discussion:manage', 'zone:manage', 'conversation:manage'
    ]
    
    permissionChecks.value = keyPermissions.map(perm => ({
      permission: perm,
      has: permissionsArray.value.includes(perm)
    }))
    
    // 过滤菜单
    const hasAll = permissionsArray.value.includes('all')
    if (hasAll) {
      filteredMenu.value = menuItems
    } else {
      filteredMenu.value = menuItems.map(item => {
        if (item.children && item.children.length > 0) {
          const visibleChildren = item.children.filter(child => 
            permissionsArray.value.includes(child.permission)
          )
          if (visibleChildren.length > 0) {
            return { ...item, children: visibleChildren }
          }
          return null
        }
        return item
      }).filter(item => item !== null)
    }
    
  } catch (error) {
    permissionsString.value = `解析失败: ${error.message}`
  }
}

refreshPermissions()
</script>

<style scoped>
.debug-permissions {
  padding: 20px;
}

.permission-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-section {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 15px;
}

.info-section h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: var(--text-primary);
}

pre {
  background: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  max-height: 300px;
  font-size: 12px;
}

.permission-check {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color);
}

.permission-check:last-child {
  border-bottom: none;
}
</style>

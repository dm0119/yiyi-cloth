<template>
  <el-container class="admin-layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '240px'" class="sidebar">
      <div class="logo">
        <span>{{ isMerchant ? '商家后台' : '后台管理' }}</span>
      </div>

      <el-menu
        :default-active="activeMenu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        :collapse="isCollapse"
        :unique-opened="true"
        router
      >
        <template v-for="item in filteredMenuItems" :key="item.index">
          <!-- 有子菜单的父菜单项 -->
          <el-sub-menu
            v-if="item.children && item.children.length > 0"
            :index="item.index"
          >
            <template #title>
              <el-icon><component :is="getIconComponent(item.icon)" /></el-icon>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item
              v-for="child in item.children"
              :key="child.index"
              :index="child.index"
            >
              <span>{{ child.title }}</span>
            </el-menu-item>
          </el-sub-menu>
          <!-- 没有子菜单的菜单项 -->
          <el-menu-item v-else :index="item.index">
            <el-icon><component :is="getIconComponent(item.icon)" /></el-icon>
            <template #title>{{ item.title }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-icon" @click="toggleCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <h2>{{ currentRouteMeta?.title || (isMerchant ? '商家后台' : '后台管理') }}</h2>
        </div>

        <div class="header-right">
          <div class="message-icon-wrapper" @click="goToMessages">
            <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99">
              <el-icon class="message-icon"><Bell /></el-icon>
            </el-badge>
          </div>
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" :icon="UserFilled" />
              <span class="username">{{ user.name || user.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区域 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DataAnalysis, Goods, List, Grid, Comment, User, UserFilled, Star, ChatRound, ChatDotRound, ShoppingCart, ArrowDown, Fold, Expand, Discount, HotWater, Key, Location, Shop, TrendCharts, RefreshLeft, Bell } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { menuItems } from '../config/menu'
import { merchantMenu } from '../config/merchantMenu'

const route = useRoute()
const router = useRouter()

const isCollapse = ref(false)
const user = ref({ name: '', username: '' })
const isMerchant = ref(false)
const unreadCount = ref(0)

const activeMenu = computed(() => route.path)

const currentRouteMeta = computed(() => {
  return route.meta
})

// 判断是否为商家角色
const checkUserRole = () => {
  const merchantToken = localStorage.getItem('merchant_token')
  const adminToken = localStorage.getItem('admin_token')
  
  if (merchantToken && !adminToken) {
    isMerchant.value = true
    return 'merchant'
  } else if (adminToken) {
    isMerchant.value = false
    return 'admin'
  }
  return 'guest'
}

const userPermissions = computed(() => {
  try {
    if (isMerchant.value) {
      const perms = JSON.parse(localStorage.getItem('merchant_permissions') || '[]')
      return perms
    } else {
      const perms = JSON.parse(localStorage.getItem('admin_permissions') || '[]')
      return perms
    }
  } catch {
    return []
  }
})

const filteredMenuItems = computed(() => {
  if (isMerchant.value) {
    // 商家菜单过滤
    const permissions = userPermissions.value
    const filtered = merchantMenu.filter(menu => {
      if (menu.permission) {
        return permissions.includes(menu.permission)
      }
      if (menu.children && menu.children.length > 0) {
        const visibleChildren = menu.children.filter(child => {
          return !child.permission || permissions.includes(child.permission)
        })
        if (visibleChildren.length > 0) {
          return {
            ...menu,
            children: visibleChildren,
            index: menu.path,
            title: menu.label,
            icon: menu.icon
          }
        }
        return false
      }
      return true
    })
    
    // 转换为 AdminLayout 需要的格式
    return filtered.map(menu => ({
      index: menu.path,
      title: menu.label,
      icon: menu.icon,
      children: menu.children ? menu.children.map(child => ({
        index: child.path,
        title: child.label,
        permission: child.permission
      })) : []
    }))
  } else {
    // 管理员菜单过滤
    if (userPermissions.value.includes('all')) {
      return menuItems
    }

    const result = []
    for (const item of menuItems) {
      if (item.permission) {
        if (userPermissions.value.includes(item.permission)) {
          result.push(item)
        }
        continue
      }
      if (item.children && item.children.length > 0) {
        const visibleChildren = item.children.filter(child =>
          userPermissions.value.includes(child.permission)
        )
        if (visibleChildren.length > 0) {
          result.push({ ...item, children: visibleChildren })
        }
      }
    }
    return result
  }
})

const getIconComponent = (iconName) => {
  const iconComponents = {
    DataAnalysis,
    Goods,
    List,
    Grid,
    Comment,
    User,
    UserFilled,
    Star,
    ChatRound,
    ChatDotRound,
    ShoppingCart,
    Discount,
    HotWater,
    Key,
    Location,
    Shop,
    TrendCharts,
    RefreshLeft
  }
  return iconComponents[iconName] || DataAnalysis
}

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const goToMessages = () => {
  const isAdmin = localStorage.getItem('admin_token')
  if (isAdmin) {
    router.push('/admin/messages')
  } else {
    router.push('/merchant/messages')
  }
}

async function loadUnreadCount() {
  try {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('merchant_token')
    if (!token) return
    const res = await fetch('/api/messages/unread/count', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    if (data.success) {
      unreadCount.value = data.data.unreadCount || 0
    }
  } catch (error) {
    console.error('获取未读消息数失败:', error)
  }
}

const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      // 清除所有登录信息（包括商家和管理员）
      localStorage.removeItem('merchant_token')
      localStorage.removeItem('merchant_user')
      localStorage.removeItem('merchant_permissions')
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_permissions')
      localStorage.removeItem('admin_user')

      ElMessage.success('已退出登录')
      router.push('/login')
    } catch {
      // 取消退出
    }
  }
}

onMounted(() => {
  // 检查用户角色
  checkUserRole()
  
  // 加载用户信息
  const userData = isMerchant.value 
    ? JSON.parse(localStorage.getItem('merchant_user') || '{}')
    : JSON.parse(localStorage.getItem('admin_user') || '{}')
  user.value = userData
  
  // 加载未读消息数
  loadUnreadCount()
})
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b3a4b;
  color: white;
  font-size: 18px;
  font-weight: bold;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.collapse-icon {
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.collapse-icon:hover {
  color: #409EFF;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.message-icon-wrapper {
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
}

.message-icon {
  font-size: 22px;
  color: #606266;
  transition: color 0.3s;
}

.message-icon:hover {
  color: #409EFF;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #606266;
}

.username {
  margin: 0 8px;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>

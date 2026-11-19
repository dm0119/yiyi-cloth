import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

// 公共页面
import Dashboard from '../views/Dashboard.vue'
import Products from '../views/Products.vue'
import Orders from '../views/Orders.vue'
import OrderDetail from '../views/OrderDetail.vue'
import Categories from '../views/Categories.vue'
import Reviews from '../views/Reviews.vue'
import Roles from '../views/Roles.vue'
import Users from '../views/Users.vue'
import HotProducts from '../views/HotProducts.vue'
import NewProducts from '../views/NewProducts.vue'
import Login from '../views/Login.vue'
import Conversations from '../views/Conversations.vue'
import Coupons from '../views/Coupons.vue'
import Zones from '../views/Zones.vue'
import Discussions from '../views/Discussions.vue'
import DebugPermissions from '../views/DebugPermissions.vue'
import DebugShopManagement from '../views/DebugShopManagement.vue'
import DebugLogin from '../views/DebugLogin.vue'
import MerchantReview from '../views/MerchantReview.vue'
import ShopManagement from '../views/ShopManagement.vue'
import BrandManagement from '../views/brand/BrandManagement.vue'
import AfterSales from '../views/AfterSales.vue'
import Messages from '../views/Messages.vue'

// 商家后台页面
import MerchantProductManage from '../views/merchant/ProductManage.vue'
import MerchantHotProductManage from '../views/merchant/HotProductManage.vue'
import MerchantNewProductManage from '../views/merchant/NewProductManage.vue'
import MerchantDashboard from '../views/merchant/Dashboard.vue'
import MerchantShop from '../views/merchant/Shop.vue'
import MerchantProducts from '../views/merchant/Products.vue'
import MerchantOrders from '../views/merchant/Orders.vue'
import MerchantStats from '../views/merchant/Stats.vue'
import MerchantReviews from '../views/merchant/Reviews.vue'

import AdminLayout from '../components/AdminLayout.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录', requiresAuth: false }
  },
  // 管理后台系统（超管/运营/客服）
  {
    path: '/admin',
    name: 'AdminLayout',
    component: AdminLayout,
    meta: { requiresAuth: true, role: 'admin' },
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: '数据统计', icon: 'DataAnalysis', permission: 'dashboard:view', requiresAuth: true }
      },
      {
        path: 'products',
        name: 'Products',
        component: Products,
        meta: { title: '商品管理', icon: 'Goods', permission: 'product:view' }
      },
      {
        path: 'categories',
        name: 'Categories',
        component: Categories,
        meta: { title: '分类管理', icon: 'Folder', permission: 'category:view' }
      },
      {
        path: 'hot-products',
        name: 'HotProducts',
        component: HotProducts,
        meta: { title: '热门推荐', icon: 'HotWater', permission: 'hot_product:view' }
      },
      {
        path: 'new-products',
        name: 'NewProducts',
        component: NewProducts,
        meta: { title: '新品推荐', icon: 'Crown', permission: 'new_product:view' }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: Orders,
        meta: { title: '订单管理', icon: 'ShoppingCart', permission: 'order:view' }
      },
      {
        path: 'orders/:id',
        name: 'OrderDetail',
        component: OrderDetail,
        meta: { title: '订单详情', icon: 'ShoppingCart', permission: 'order:detail' },
        props: true
      },
      {
        path: 'reviews',
        name: 'Reviews',
        component: Reviews,
        meta: { title: '评价管理', icon: 'Star', permission: 'review:view' }
      },
      {
        path: 'coupons',
        name: 'Coupons',
        component: Coupons,
        meta: { title: '优惠券管理', icon: 'Discount', permission: 'coupon:view' }
      },
      {
        path: 'users',
        name: 'Users',
        component: Users,
        meta: { title: '用户管理', icon: 'User', permission: 'user:view' }
      },
      {
        path: 'roles',
        name: 'Roles',
        component: Roles,
        meta: { title: '角色管理', icon: 'Key', permission: 'role:view' }
      },
      {
        path: 'merchant-applications',
        name: 'MerchantApplications',
        component: MerchantReview,
        meta: { title: '入驻申请审核', icon: 'Shop', permission: 'merchant:review' }
      },
      {
        path: 'shops',
        name: 'ShopManagement',
        component: ShopManagement,
        meta: { title: '店铺管理', icon: 'Grid', permission: 'shop:view' }
      },
      {
        path: 'brands',
        name: 'BrandManagement',
        component: BrandManagement,
        meta: { title: '品牌管理', icon: 'Star', permission: 'shop:manage' }
      },
      {
        path: 'discussions',
        name: 'Discussions',
        component: Discussions,
        meta: { title: '社区管理', icon: 'ChatRound', permission: 'discussion:view' }
      },
      {
        path: 'zones',
        name: 'Zones',
        component: Zones,
        meta: { title: '专区管理', icon: 'Location', permission: 'zone:view' }
      },
      {
        path: 'conversations',
        name: 'Conversations',
        component: Conversations,
        meta: { title: '会话管理', icon: 'ChatDotRound', permission: 'conversation:view' }
      },
      {
        path: 'after-sales',
        name: 'AfterSales',
        component: AfterSales,
        meta: { title: '售后管理', icon: 'RefreshLeft', permission: 'order:view' }
      },
      {
        path: 'messages',
        name: 'Messages',
        component: Messages,
        meta: { title: '站内信', icon: 'Bell', permission: 'message:view' }
      },
      {
        path: 'stats',
        name: 'AdminStats',
        component: MerchantStats,
        meta: { title: '数据统计', icon: 'TrendCharts', permission: 'statistics:view' }
      }
    ]
  },
  // 商家后台系统
  {
    path: '/merchant',
    name: 'MerchantLayout',
    component: AdminLayout,
    meta: { requiresAuth: true, role: 'merchant' },
    redirect: '/merchant/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'MerchantDashboard',
        component: MerchantDashboard,
        meta: { title: '数据统计', icon: 'DataAnalysis', permission: 'product:view' }
      },
      {
        path: 'products',
        name: 'MerchantProductManage',
        component: MerchantProductManage,
        meta: { title: '商品管理', icon: 'Goods', permission: 'product:view' }
      },
      {
        path: 'hot-products',
        name: 'MerchantHotProductManage',
        component: MerchantHotProductManage,
        meta: { title: '热门推荐', icon: 'HotWater', permission: 'hot_product:view' }
      },
      {
        path: 'new-products',
        name: 'MerchantNewProductManage',
        component: MerchantNewProductManage,
        meta: { title: '新品推荐', icon: 'Crown', permission: 'new_product:view' }
      },
      {
        path: 'orders',
        name: 'MerchantOrders',
        component: MerchantOrders,
        meta: { title: '订单管理', icon: 'ShoppingCart', permission: 'order:view' }
      },
      {
        path: 'reviews',
        name: 'MerchantReviews',
        component: MerchantReviews,
        meta: { title: '评价管理', icon: 'Star', permission: 'review:view' }
      },
      {
        path: 'coupons',
        name: 'MerchantCoupons',
        component: Coupons,
        meta: { title: '优惠券管理', icon: 'Discount', permission: 'coupon:view' }
      },
      {
        path: 'stats',
        name: 'MerchantStats',
        component: MerchantStats,
        meta: { title: '数据统计', icon: 'TrendCharts', permission: 'statistics:view' }
      },
      {
        path: 'shop',
        name: 'MerchantShop',
        component: MerchantShop,
        meta: { title: '店铺管理', icon: 'Shop', permission: 'shop:view' }
      },
      {
        path: 'product',
        name: 'MerchantProductCenter',
        component: MerchantProductManage,
        meta: { title: '商品中心', icon: 'Goods' }
      },
      {
        path: 'order',
        name: 'MerchantOrderCenter',
        component: MerchantOrders,
        meta: { title: '订单中心', icon: 'ShoppingCart' }
      },
      {
        path: 'after-sales',
        name: 'MerchantAfterSales',
        component: AfterSales,
        meta: { title: '售后管理', icon: 'RefreshLeft', permission: 'order:view' }
      },
      {
        path: 'messages',
        name: 'MerchantMessages',
        component: Messages,
        meta: { title: '站内信', icon: 'Bell', permission: 'message:view' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * 获取当前登录用户信息
 * 返回：{ type: 'admin' | 'merchant' | null, token: string, permissions: string[] }
 */
function getCurrentUser() {
  const adminToken = localStorage.getItem('admin_token')
  const merchantToken = localStorage.getItem('merchant_token')
  
  // 优先使用管理员 token（如果同时存在）
  if (adminToken) {
    const permissions = JSON.parse(localStorage.getItem('admin_permissions') || '[]')
    return {
      type: 'admin',
      token: adminToken,
      permissions: permissions
    }
  }
  
  // 使用商家 token
  if (merchantToken) {
    const permissions = JSON.parse(localStorage.getItem('merchant_permissions') || '[]')
    return {
      type: 'merchant',
      token: merchantToken,
      permissions: permissions
    }
  }
  
  // 未登录
  return null
}

/**
 * 找到第一个有权限访问的路由
 */
function findFirstPermittedRoute(childrenRoutes, permissions) {
  if (!permissions || permissions.length === 0) {
    return null
  }
  
  return childrenRoutes.find(route => {
    return route.meta && route.meta.permission && permissions.includes(route.meta.permission)
  })
}

/**
 * 路由守卫 - 三层检查机制
 * 1. 认证检查：是否登录
 * 2. 角色检查：是否有资格访问该系统（管理员/商家）
 * 3. 权限检查：是否有具体页面的访问权限
 */
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || '服装商城'} - 后台管理`
  
  const user = getCurrentUser()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)
  const targetRole = to.meta.role // 'admin' 或 'merchant'
  
  console.log('🔶 路由守卫:', {
    path: to.path,
    requiresAuth,
    targetRole,
    currentUser: user ? user.type : '未登录',
    permissions: user?.permissions?.length || 0
  })
  
  // ========== 第一层：认证检查 ==========
  if (requiresAuth && !user) {
    console.log('❌ 未登录，跳转到登录页')
    next({ 
      name: 'Login', 
      query: { redirect: to.fullPath } 
    })
    return
  }
  
  // 登录页特殊处理：已登录则跳转到对应首页
  if (to.path === '/login') {
    if (user) {
      const layoutName = user.type === 'admin' ? 'AdminLayout' : 'MerchantLayout'
      const layoutRoutes = routes.find(r => r.name === layoutName)?.children
      const firstRoute = findFirstPermittedRoute(layoutRoutes, user.permissions)
      const redirectPath = firstRoute 
        ? `/${user.type === 'admin' ? 'admin' : 'merchant'}/${firstRoute.path}`
        : `/${user.type === 'admin' ? 'admin' : 'merchant'}/dashboard`
      
      console.log('✅ 已登录，跳转到首页:', redirectPath)
      next({ path: redirectPath })
      return
    }
    next()
    return
  }
  
  // ========== 第二层：角色检查 ==========
  if (targetRole && user) {
    // 角色不匹配
    if (user.type !== targetRole && user.type !== 'admin') {
      console.log(`❌ 角色不匹配：当前用户 ${user.type}，需要 ${targetRole}`)
      ElMessage.error('您没有访问此系统的权限')
      
      // 跳转到用户对应的首页
      const redirectPath = user.type === 'admin' ? '/admin/dashboard' : '/merchant/dashboard'
      next({ path: redirectPath })
      return
    }
  }
  
  // ========== 第三层：权限检查 ==========
  const requiredPermission = to.meta.permission
  if (requiredPermission && user) {
    // 超级管理员或有 'all'/'*' 权限，直接通过
    if (user.permissions.includes('all') || user.permissions.includes('*')) {
      console.log('✅ 拥有所有权限，直接通过')
      next()
      return
    }
    
    // 特殊处理：dashboard 页面对所有登录用户开放（作为首页）
    if (requiredPermission === 'dashboard:view') {
      console.log('✅ 访问首页，允许通过')
      next()
      return
    }
    
    // 检查是否有指定权限
    if (!user.permissions.includes(requiredPermission)) {
      console.log(`❌ 缺少权限：${requiredPermission}`)
      
      // 跳转到第一个有权限的页面
      const layoutName = user.type === 'admin' ? 'AdminLayout' : 'MerchantLayout'
      const layoutRoutes = routes.find(r => r.name === layoutName)?.children
      const firstRoute = findFirstPermittedRoute(layoutRoutes, user.permissions)
      
      if (firstRoute && firstRoute.path !== to.path) {
        const basePath = user.type === 'admin' ? '/admin' : '/merchant'
        const redirectPath = `${basePath}/${firstRoute.path}`
        console.log('🔄 跳转到有权限的页面:', redirectPath)
        next({ path: redirectPath })
        return
      }
      
      // 没有任何权限，显示错误并跳转到登录页（避免无限重定向）
      console.log('⚠️ 用户没有任何权限，跳转到登录页')
      ElMessage.error('您没有访问此页面的权限，请联系管理员')
      localStorage.removeItem('merchant_token')
      localStorage.removeItem('merchant_permissions')
      localStorage.removeItem('merchant_user')
      next({ name: 'Login' })
      return
    }
  }
  
  // 所有检查通过
  console.log('✅ 所有检查通过，允许访问')
  next()
})

export default router

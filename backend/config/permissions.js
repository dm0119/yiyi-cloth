/**
 * 权限配置
 * 提供所有权限代码的完整列表
 */

// 角色ID常量（解决硬编码问题）
const ROLE_IDS = {
  SUPER_ADMIN: 1,
  OPERATOR: 2,
  CUSTOMER_SERVICE: 3,
  BUYER: 5,
  MERCHANT: 6
}

// 角色名称常量
const ROLE_NAMES = {
  SUPER_ADMIN: '超级管理员',
  OPERATOR: '运营人员',
  CUSTOMER_SERVICE: '客服人员',
  BUYER: '买家',
  MERCHANT: '商家'
}

const ALL_PERMISSIONS = [
  // 仪表盘
  'dashboard:view',
  
  // 用户管理
  'user:view',
  'user:detail',
  'user:edit',
  'user:freeze',
  'user:delete',
  'user:manage',
  
  // 角色管理
  'role:view',
  'role:create',
  'role:edit',
  'role:delete',
  'role:manage',
  
  // 商品管理
  'product:view',
  'product:detail',  // 修复：添加缺失的product:detail权限
  'product:create',
  'product:edit',
  'product:delete',
  'product:status',
  'product:manage',
  
  // 分类管理
  'category:view',
  'category:create',
  'category:edit',
  'category:delete',
  'category:manage',
  
  // 热门推荐
  'hot_product:view',
  'hot_product:manage',
  
  // 新品推荐
  'new_product:view',
  'new_product:manage',
  
  // 订单管理
  'order:view',
  'order:detail',
  'order:edit',
  'order:ship',
  'order:refund',
  'order:close',
  'order:logistics',
  'order:manage',
  
  // 优惠券
  'coupon:view',
  'coupon:create',
  'coupon:edit',
  'coupon:delete',
  'coupon:issue',
  'coupon:manage',
  
  // 评价管理
  'review:view',
  'review:audit',
  'review:delete',
  'review:manage',
  
  // 社区管理
  'discussion:view',
  'discussion:audit',
  'discussion:delete',
  'discussion:manage',
  
  // 专区管理
  'zone:view',
  'zone:manage',
  
  // 客服管理
  'conversation:view',
  'conversation:chat',
  'conversation:assign',
  'conversation:history',
  'conversation:manage',
  'conversation:close',
  
  // 商家管理
  'merchant:view',
  'merchant:review',
  'merchant:edit',
  'merchant:delete',
  
  // 店铺管理
  'shop:view',
  'shop:edit',
  'shop:manage',
  
  // 统计
  'statistics:view',
  'statistics:export'
]

/**
 * 获取所有权限代码
 * @returns {string[]} 权限代码数组
 */
function getAllPermissionCodes() {
  return [...ALL_PERMISSIONS]
}

/**
 * 检查权限代码是否有效
 * @param {string} permission 权限代码
 * @returns {boolean} 是否有效
 */
function isValidPermission(permission) {
  return ALL_PERMISSIONS.includes(permission)
}

/**
 * 过滤出有效的权限代码
 * @param {string[]} permissions 权限代码数组
 * @returns {string[]} 有效的权限代码数组
 */
function filterValidPermissions(permissions) {
  return permissions.filter(p => isValidPermission(p))
}

/**
 * 超级管理员判断函数
 * @param {Object|Array} roles - 角色对象或角色数组
 * @returns {boolean} 是否为超级管理员
 */
function isSuperAdmin(roles) {
  if (!roles) return false
  if (Array.isArray(roles)) {
    return roles.length > 0 && roles[0].name === ROLE_NAMES.SUPER_ADMIN
  }
  return roles.name === ROLE_NAMES.SUPER_ADMIN
}

/**
 * 检查用户是否有指定权限
 * @param {string[]} userPermissions - 用户权限数组
 * @param {string} requiredPermission - 需要的权限
 * @returns {boolean} 是否有权限
 */
function hasPermission(userPermissions, requiredPermission) {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false
  }
  // 超级管理员拥有所有权限
  if (userPermissions.includes('all') || userPermissions.includes('*')) {
    return true
  }
  return userPermissions.includes(requiredPermission)
}

/**
 * 检查用户是否有菜单权限
 * @param {string[]} userPermissions - 用户权限数组
 * @param {string} menuCode - 菜单代码
 * @returns {boolean} 是否有菜单权限
 */
function hasMenuPermission(userPermissions, menuCode) {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false
  }
  // 超级管理员拥有所有菜单权限
  if (userPermissions.includes('all') || userPermissions.includes('*')) {
    return true
  }
  
  // 菜单权限映射到操作权限
  const menuToPermission = {
    'dashboard': 'dashboard:view',
    'user': 'user:view',
    'role': 'role:view',
    'product': 'product:view',
    'category': 'category:view',
    'order': 'order:view',
    'coupon': 'coupon:view',
    'review': 'review:view',
    'discussion': 'discussion:view',
    'zone': 'zone:view',
    'conversation': 'conversation:view',
    'merchant': 'merchant:view',
    'shop': 'shop:view',
    'statistics': 'statistics:view'
  }
  
  const requiredPermission = menuToPermission[menuCode]
  if (!requiredPermission) {
    return false
  }
  
  return userPermissions.includes(requiredPermission)
}

/**
 * 权限树结构（用于前端菜单渲染）
 */
const permissionTree = {
  dashboard: {
    label: '数据统计',
    permissions: ['dashboard:view']
  },
  user: {
    label: '用户管理',
    permissions: ['user:view', 'user:detail', 'user:edit', 'user:freeze', 'user:delete', 'user:manage']
  },
  role: {
    label: '角色管理',
    permissions: ['role:view', 'role:create', 'role:edit', 'role:delete', 'role:manage']
  },
  product: {
    label: '商品管理',
    permissions: ['product:view', 'product:detail', 'product:create', 'product:edit', 'product:delete', 'product:status', 'product:manage']
  },
  category: {
    label: '分类管理',
    permissions: ['category:view', 'category:create', 'category:edit', 'category:delete', 'category:manage']
  },
  order: {
    label: '订单管理',
    permissions: ['order:view', 'order:detail', 'order:edit', 'order:ship', 'order:refund', 'order:close', 'order:logistics', 'order:manage']
  },
  coupon: {
    label: '优惠券',
    permissions: ['coupon:view', 'coupon:create', 'coupon:edit', 'coupon:delete', 'coupon:issue', 'coupon:manage']
  },
  review: {
    label: '评价管理',
    permissions: ['review:view', 'review:audit', 'review:delete', 'review:manage']
  },
  discussion: {
    label: '社区管理',
    permissions: ['discussion:view', 'discussion:audit', 'discussion:delete', 'discussion:manage']
  },
  zone: {
    label: '专区管理',
    permissions: ['zone:view', 'zone:manage']
  },
  conversation: {
    label: '客服管理',
    permissions: ['conversation:view', 'conversation:chat', 'conversation:history', 'conversation:manage', 'conversation:close', 'conversation:delete']
  },
  merchant: {
    label: '商家管理',
    permissions: ['merchant:view', 'merchant:review', 'merchant:edit', 'merchant:delete']
  },
  shop: {
    label: '店铺管理',
    permissions: ['shop:view', 'shop:manage']
  },
  statistics: {
    label: '数据统计',
    permissions: ['statistics:view', 'statistics:export']
  }
}

/**
 * 默认角色权限配置
 */
const defaultRolePermissions = {
  'super_admin': {
    name: '超级管理员',
    description: '拥有系统所有权限',
    permissions: ['*']
  },
  'operator': {
    name: '运营人员',
    description: '负责商品、订单、内容运营',
    permissions: ['dashboard:view', 'user:view', 'user:detail', 'product:view', 'product:create', 'product:edit', 'product:status', 'product:manage', 'category:view', 'category:create', 'category:edit', 'category:delete', 'category:manage', 'order:view', 'order:detail', 'order:edit', 'order:ship', 'order:refund', 'order:close', 'order:manage', 'coupon:view', 'coupon:create', 'coupon:edit', 'coupon:delete', 'coupon:manage', 'review:view', 'review:audit', 'review:manage', 'message:view', 'statistics:view']
  },
  'customer_service': {
    name: '客服人员',
    description: '处理用户咨询、投诉、售后',
    permissions: ['dashboard:view', 'conversation:view', 'conversation:chat', 'conversation:history', 'conversation:manage', 'conversation:close', 'conversation:delete', 'product:view', 'category:view', 'order:view', 'order:detail', 'review:view', 'user:view', 'user:detail', 'message:view', 'statistics:view']
  },
  'buyer': {
    name: '买家',
    description: '普通 C 端用户',
    permissions: []
  },
  'merchant': {
    name: '商家',
    description: '店铺运营者，负责商品管理和店铺运营',
    permissions: ['dashboard:view', 'product:view', 'product:create', 'product:edit', 'product:status', 'category:view', 'order:view', 'order:detail', 'order:edit', 'order:ship', 'order:close', 'coupon:view', 'coupon:create', 'coupon:edit', 'review:view', 'statistics:view', 'message:view']
  }
}

module.exports = {
  ALL_PERMISSIONS,
  ROLE_IDS,
  ROLE_NAMES,
  getAllPermissionCodes,
  isValidPermission,
  filterValidPermissions,
  isSuperAdmin,
  hasPermission,
  hasMenuPermission,
  permissionTree,
  defaultRolePermissions
}

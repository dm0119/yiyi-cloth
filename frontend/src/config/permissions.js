/**
 * 前端权限配置
 * 与后端权限树同步
 */

// 权限树结构（与后端一致）
export const permissionTree = [
  {
    id: 1,
    code: 'dashboard',
    label: '控制台',
    type: 'menu',
    children: [
      { id: 11, code: 'dashboard:view', label: '查看控制台', type: 'button' }
    ]
  },
  {
    id: 2,
    code: 'product:center',
    label: '商品中心',
    type: 'parent',
    children: [
      {
        id: 21,
        code: 'products',
        label: '商品管理',
        type: 'menu',
        children: [
          { id: 211, code: 'product:view', label: '查看商品', type: 'button' },
          { id: 212, code: 'product:create', label: '新增商品', type: 'button' },
          { id: 213, code: 'product:edit', label: '编辑商品', type: 'button' },
          { id: 214, code: 'product:delete', label: '删除商品', type: 'button' },
          { id: 215, code: 'product:status', label: '上架/下架', type: 'button' }
        ]
      },
      {
        id: 22,
        code: 'categories',
        label: '分类管理',
        type: 'menu',
        children: [
          { id: 221, code: 'category:view', label: '查看分类', type: 'button' },
          { id: 222, code: 'category:create', label: '新增分类', type: 'button' },
          { id: 223, code: 'category:edit', label: '编辑分类', type: 'button' },
          { id: 224, code: 'category:delete', label: '删除分类', type: 'button' }
        ]
      },
      {
        id: 23,
        code: 'hot_products',
        label: '热门推荐',
        type: 'menu',
        children: [
          { id: 231, code: 'hot_product:view', label: '查看推荐', type: 'button' },
          { id: 232, code: 'hot_product:manage', label: '管理推荐', type: 'button' }
        ]
      },
      {
        id: 24,
        code: 'new_products',
        label: '新品推荐',
        type: 'menu',
        children: [
          { id: 241, code: 'new_product:view', label: '查看新品', type: 'button' },
          { id: 242, code: 'new_product:manage', label: '管理新品', type: 'button' }
        ]
      }
    ]
  },
  {
    id: 3,
    code: 'order:center',
    label: '订单中心',
    type: 'parent',
    children: [
      {
        id: 31,
        code: 'orders',
        label: '订单管理',
        type: 'menu',
        children: [
          { id: 311, code: 'order:view', label: '查看订单', type: 'button' },
          { id: 312, code: 'order:detail', label: '订单详情', type: 'button' },
          { id: 313, code: 'order:edit', label: '编辑订单', type: 'button' },
          { id: 314, code: 'order:ship', label: '订单发货', type: 'button' },
          { id: 315, code: 'order:refund', label: '订单退款', type: 'button' },
          { id: 316, code: 'order:close', label: '关闭订单', type: 'button' },

        ]
      },
      {
        id: 32,
        code: 'coupons',
        label: '优惠券管理',
        type: 'menu',
        children: [
          { id: 321, code: 'coupon:view', label: '查看优惠券', type: 'button' },
          { id: 322, code: 'coupon:create', label: '新增优惠券', type: 'button' },
          { id: 323, code: 'coupon:edit', label: '编辑优惠券', type: 'button' },
          { id: 324, code: 'coupon:delete', label: '删除优惠券', type: 'button' },
          { id: 325, code: 'coupon:issue', label: '发放优惠券', type: 'button' }
        ]
      },
      {
        id: 33,
        code: 'reviews',
        label: '评价管理',
        type: 'menu',
        children: [
          { id: 331, code: 'review:view', label: '查看评价', type: 'button' },
          { id: 332, code: 'review:audit', label: '评价审核', type: 'button' },
          { id: 333, code: 'review:delete', label: '删除评价', type: 'button' }
        ]
      }
    ]
  },
  {
    id: 4,
    code: 'user:center',
    label: '用户中心',
    type: 'parent',
    children: [
      {
        id: 41,
        code: 'users',
        label: '用户管理',
        type: 'menu',
        children: [
          { id: 411, code: 'user:view', label: '查看用户', type: 'button' },
          { id: 412, code: 'user:detail', label: '用户详情', type: 'button' },
          { id: 413, code: 'user:edit', label: '编辑用户', type: 'button' },
          { id: 414, code: 'user:freeze', label: '冻结/解冻', type: 'button' }
        ]
      },
      {
        id: 42,
        code: 'roles',
        label: '角色管理',
        type: 'menu',
        children: [
          { id: 421, code: 'role:view', label: '查看角色', type: 'button' },
          { id: 422, code: 'role:create', label: '新增角色', type: 'button' },
          { id: 423, code: 'role:edit', label: '编辑角色', type: 'button' },
          { id: 424, code: 'role:delete', label: '删除角色', type: 'button' }
        ]
      }
    ]
  },
  {
    id: 5,
    code: 'community:center',
    label: '社区中心',
    type: 'parent',
    children: [
      {
        id: 51,
        code: 'discussions',
        label: '社区管理',
        type: 'menu',
        children: [
          { id: 511, code: 'discussion:view', label: '查看社区', type: 'button' },
          { id: 512, code: 'discussion:audit', label: '帖子审核', type: 'button' },
          { id: 513, code: 'discussion:delete', label: '删除帖子', type: 'button' }
        ]
      },
      {
        id: 52,
        code: 'zones',
        label: '专区管理',
        type: 'menu',
        children: [
          { id: 521, code: 'zone:view', label: '查看专区', type: 'button' },
          { id: 522, code: 'zone:manage', label: '管理专区', type: 'button' }
        ]
      }
    ]
  },
  {
    id: 6,
    code: 'service:center',
    label: '客服中心',
    type: 'parent',
    children: [
      {
        id: 61,
        code: 'conversations',
        label: '会话管理',
        type: 'menu',
        children: [
          { id: 611, code: 'conversation:view', label: '查看会话', type: 'button' },
          { id: 612, code: 'conversation:chat', label: '在线沟通', type: 'button' },
          { id: 613, code: 'conversation:assign', label: '会话分配', type: 'button' },
          { id: 614, code: 'conversation:history', label: '会话记录', type: 'button' }
        ]
      }
    ]
  },
  {
    id: 8,
    code: 'shop:center',
    label: '店铺中心',
    type: 'parent',
    children: [
      {
        id: 81,
        code: 'merchant-applications',
        label: '入驻申请审核',
        type: 'menu',
        children: [
          { id: 811, code: 'merchant:review', label: '审核入驻申请', type: 'button' }
        ]
      },
      {
        id: 82,
        code: 'shops',
        label: '店铺管理',
        type: 'menu',
        children: [
          { id: 821, code: 'shop:view', label: '查看店铺', type: 'button' },
          { id: 822, code: 'shop:manage', label: '管理店铺', type: 'button' }
        ]
      }
    ]
  },
  {
    id: 7,
    code: 'statistics',
    label: '数据统计',
    type: 'menu',
    children: [
      { id: 71, code: 'statistics:view', label: '查看统计', type: 'button' },
      { id: 72, code: 'statistics:export', label: '数据导出', type: 'button' }
    ]
  }
]

// 角色默认权限配置
export const defaultRolePermissions = {
  super_admin: {
    name: '超级管理员',
    description: '系统最高权限，管理所有功能',
    permissions: ['all']
  },
  operator: {
    name: '运营人员',
    description: '负责商品、订单、内容运营',
    permissions: [
      'dashboard:view',
      'product:view', 'product:create', 'product:edit', 'product:status',
      'category:view', 'category:create', 'category:edit',
      'hot_product:view', 'hot_product:manage',
      'new_product:view', 'new_product:manage',
      'order:view', 'order:detail', 'order:edit', 'order:ship', 'order:close',
      'coupon:view', 'coupon:create', 'coupon:edit', 'coupon:delete',
      'review:view', 'review:audit',
      'user:view', 'user:detail', 'user:edit', 'user:freeze',
      'discussion:view', 'discussion:audit',
      'zone:view', 'zone:manage',
      'conversation:view', 'conversation:chat', 'conversation:history',
      'merchant:review',
      'shop:view', 'shop:manage',
      'message:view',
      'statistics:view'
    ]
  },
  customer_service: {
    name: '客服人员',
    description: '处理用户咨询、投诉、售后',
    permissions: [
      'dashboard:view',
      'product:view',
      'category:view',
      'hot_product:view',
      'new_product:view',
      'order:view', 'order:detail',
      'coupon:view',
      'review:view',
      'user:view', 'user:detail',
      'discussion:view',
      'zone:view',
      'conversation:view', 'conversation:chat', 'conversation:assign', 'conversation:history',
      'message:view',
      'statistics:view'
    ]
  },
  buyer: {
    name: '买家',
    description: '普通 C 端用户',
    permissions: []
  },
  merchant: {
    name: '商家',
    description: '店铺运营者，负责商品管理和店铺运营',
    permissions: [
      'dashboard:view',
      'product:view', 'product:create', 'product:edit', 'product:status',
      'category:view',
      'order:view', 'order:detail', 'order:ship', 'order:close',
      'coupon:view', 'coupon:create', 'coupon:edit',
      'review:view',
      'statistics:view'
    ]
  }
}

/**
 * 检查是否有某个权限
 * @param {Array} userPermissions - 用户权限列表
 * @param {String} permissionCode - 权限代码
 * @returns {Boolean}
 */
export const hasPermission = (userPermissions, permissionCode) => {
  if (!userPermissions) return false
  if (userPermissions.includes('all')) return true
  return userPermissions.includes(permissionCode)
}

/**
 * 检查是否有某个菜单的访问权限
 * @param {Array} userPermissions - 用户权限列表
 * @param {String} menuCode - 菜单代码
 * @returns {Boolean}
 */
export const hasMenuPermission = (userPermissions, menuCode) => {
  if (!userPermissions) return false
  if (userPermissions.includes('all')) return true

  // 查找菜单对应的权限
  const findMenuPermission = (tree, code) => {
    for (const node of tree) {
      if (node.code === code) return true
      if (node.children) {
        if (findMenuPermission(node.children, code)) return true
      }
    }
    return false
  }

  return userPermissions.some(p => findMenuPermission(permissionTree, p))
}

/**
 * 获取所有权限代码（扁平化）
 * @returns {Array}
 */
export const getAllPermissionCodes = () => {
  const codes = []
  
  const traverse = (nodes) => {
    for (const node of nodes) {
      if (node.type === 'button') {
        codes.push(node.code)
      }
      if (node.children) {
        traverse(node.children)
      }
    }
  }
  
  traverse(permissionTree)
  return codes
}

/**
 * 获取权限树中所有节点的 code
 * @returns {Array}
 */
export const getAllPermissionNodes = () => {
  const nodes = []
  
  const traverse = (tree) => {
    for (const node of tree) {
      nodes.push({
        id: node.id,
        code: node.code,
        label: node.label,
        type: node.type
      })
      if (node.children) {
        traverse(node.children)
      }
    }
  }
  
  traverse(permissionTree)
  return nodes
}

/**
 * Vue 插件：安装全局权限方法
 */
export const install = (app) => {
  app.config.globalProperties.$hasPermission = hasPermission
  app.config.globalProperties.$hasMenu = hasMenuPermission
}

export default {
  permissionTree,
  defaultRolePermissions,
  hasPermission,
  hasMenuPermission,
  getAllPermissionCodes,
  getAllPermissionNodes,
  install
}

/**
 * 权限工具函数
 * 用于检查用户是否有指定的权限
 * 
 * 修复说明：统一Token优先级，与router/index.js保持一致
 * 优先级：admin_token > merchant_token
 */

function getPermissions() {
  const merchantToken = localStorage.getItem('merchant_token')
  const adminToken = localStorage.getItem('admin_token')
  
  // 优先使用管理员token（与router/index.js保持一致）
  if (adminToken) {
    try {
      return JSON.parse(localStorage.getItem('admin_permissions') || '[]')
    } catch {
      return []
    }
  }
  
  // 如果没有管理员token，使用商家token
  if (merchantToken) {
    try {
      return JSON.parse(localStorage.getItem('merchant_permissions') || '[]')
    } catch {
      return []
    }
  }
  
  return []
}

/**
 * 检查用户是否有指定的权限
 * @param {string} permission - 权限代码
 * @returns {boolean} - 是否有权限
 */
export function hasPermission(permission) {
  if (!permission) {
    return true
  }
  
  try {
    const permissions = getPermissions()
    return permissions.includes(permission)
  } catch {
    return false
  }
}

/**
 * 检查用户是否有任意一个权限
 * @param {string[]} permissions - 权限数组
 * @returns {boolean} - 是否有权限
 */
export function hasAnyPermission(permissions) {
  if (!permissions || permissions.length === 0) {
    return true
  }
  
  try {
    const userPermissions = getPermissions()
    return permissions.some(p => userPermissions.includes(p))
  } catch {
    return false
  }
}

/**
 * 检查用户是否拥有所有指定的权限
 * @param {string[]} permissions - 权限数组
 * @returns {boolean} - 是否有权限
 */
export function hasAllPermissions(permissions) {
  if (!permissions || permissions.length === 0) {
    return true
  }
  
  try {
    const userPermissions = getPermissions()
    return permissions.every(p => userPermissions.includes(p))
  } catch {
    return false
  }
}

/**
 * 获取用户的所有权限
 * @returns {string[]} - 用户权限数组
 */
export function getUserPermissions() {
  try {
    return getPermissions()
  } catch {
    return []
  }
}

/**
 * 权限混入
 * 用于页面级别的权限控制
 */

import { hasPermission, hasAnyPermission, hasAllPermissions, getUserPermissions } from '../utils/permission'

export default {
  computed: {
    /**
     * 用户权限
     */
    userPermissions() {
      return getUserPermissions()
    }
  },
  
  methods: {
    /**
     * 检查是否有指定的权限
     * @param {string} permission - 权限代码
     * @returns {boolean} - 是否有权限
     */
    checkPermission(permission) {
      return hasPermission(permission)
    },
    
    /**
     * 检查是否有任意一个权限
     * @param {string[]} permissions - 权限数组
     * @returns {boolean} - 是否有权限
     */
    checkAnyPermission(permissions) {
      return hasAnyPermission(permissions)
    },
    
    /**
     * 检查是否拥有所有指定的权限
     * @param {string[]} permissions - 权限数组
     * @returns {boolean} - 是否有权限
     */
    checkAllPermissions(permissions) {
      return hasAllPermissions(permissions)
    }
  }
}

// Vue 3 Composition API
export function usePermission() {
  const checkPermission = (permission) => {
    return hasPermission(permission)
  }
  
  const checkAnyPermission = (permissions) => {
    return hasAnyPermission(permissions)
  }
  
  const checkAllPermissions = (permissions) => {
    return hasAllPermissions(permissions)
  }
  
  return {
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    userPermissions: getUserPermissions()
  }
}

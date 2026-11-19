/**
 * 权限指令
 * 用于按钮级别的权限控制
 */

import { hasPermission, hasAnyPermission } from '../utils/permission'

/**
 * 权限指令配置
 */
export default {
  beforeMount(el, binding) {
    // 保存原始显示状态
    el._originalDisplay = el.style.display
    
    const { value } = binding
    // 处理数组形式的权限参数
    const permissions = Array.isArray(value) ? value : [value]
    
    console.log('权限指令 beforeMount:', permissions, '权限检查结果:', hasAnyPermission(permissions))
    
    if (permissions && permissions.length > 0) {
      if (!hasAnyPermission(permissions)) {
        // 如果没有权限,隐藏元素而不是移除
        console.log('隐藏元素:', permissions)
        el.style.display = 'none'
      }
    }
  },
  
  mounted(el, binding) {
    const { value } = binding
    // 处理数组形式的权限参数
    const permissions = Array.isArray(value) ? value : [value]
    
    if (permissions && permissions.length > 0) {
      if (!hasAnyPermission(permissions)) {
        // 如果没有权限,隐藏元素
        el.style.display = 'none'
      } else {
        // 如果有权限,恢复显示
        el.style.display = el._originalDisplay || ''
      }
    }
  },
  
  updated(el, binding) {
    const { value, oldValue } = binding
    
    // 如果权限值发生变化,重新检查
    if (value !== oldValue) {
      // 处理数组形式的权限参数
      const permissions = Array.isArray(value) ? value : [value]
      
      if (permissions && permissions.length > 0) {
        if (!hasAnyPermission(permissions)) {
          // 如果没有权限,隐藏元素
          el.style.display = 'none'
        } else {
          // 如果有权限,恢复显示
          el.style.display = el._originalDisplay || ''
        }
      }
    }
  }
}

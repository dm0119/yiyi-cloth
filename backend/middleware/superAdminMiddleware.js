const { permissionMiddleware } = require('../utils/permissionMiddleware')
const { ROLE_NAMES } = require('../config/permissions')

/**
 * 超级管理员专用中间件
 * 只允许超级管理员访问的接口
 * 
 * 修复说明：统一超级管理员判断逻辑，支持多种判断方式
 */
function superAdminOnly(req, res, next) {
  // 检查req.user是否存在
  if (!req.user) {
    return res.status(403).json({
      success: false,
      message: '权限不足: 仅超级管理员可执行此操作'
    })
  }

  // 检查是否有超级管理员角色（兼容多种判断方式）
  // 方式1: 直接检查role字段（中文或常量）
  // 方式2: 检查permissions是否包含'*'或'all'（超级权限标记）
  // 方式3: 检查roleId是否为1
  const isSuperAdmin = 
    req.user.role === ROLE_NAMES.SUPER_ADMIN ||
    req.user.role === '超级管理员' ||
    (Array.isArray(req.user.permissions) && 
     (req.user.permissions.includes('*') || req.user.permissions.includes('all'))) ||
    req.user.roleId === 1 ||
    req.user.id === 1

  if (!isSuperAdmin) {
    return res.status(403).json({
      success: false,
      message: '权限不足: 仅超级管理员可执行此操作'
    })
  }

  next()
}

module.exports = {
  superAdminOnly,
  permissionMiddleware
}

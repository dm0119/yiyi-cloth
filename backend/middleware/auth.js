const jwt = require('jsonwebtoken')
const config = require('../config')
const { hasPermission, hasMenuPermission, permissionTree } = require('../config/permissions')

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ success: false, message: '未提供认证令牌' })
  }

  jwt.verify(token, config.jwtSecret || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: '无效的认证令牌' })
    }
    // 确保用户 ID 存在
    if (!user.id) {
      return res.status(403).json({ success: false, message: '无效的用户信息' })
    }
    req.user = user
    next()
  })
}

/**
 * 验证权限中间件
 * @param {String} requiredPermission - 需要的权限代码
 * @returns {Function}
 */
function checkPermission(requiredPermission) {
  return (req, res, next) => {
    const userPermissions = req.user.permissions || []
    
    // 超级管理员权限
    if (hasPermission(userPermissions, 'all')) {
      return next()
    }
    
    // 检查是否有指定权限
    if (hasPermission(userPermissions, requiredPermission)) {
      return next()
    }
    
    return res.status(403).json({ 
      success: false, 
      message: '权限不足，无法执行此操作' 
    })
  }
}

/**
 * 验证菜单权限中间件
 * @param {String} menuCode - 菜单代码
 * @returns {Function}
 */
function checkMenuPermission(menuCode) {
  return (req, res, next) => {
    const userPermissions = req.user.permissions || []
    
    // 超级管理员权限
    if (userPermissions.includes('all')) {
      return next()
    }
    
    // 检查是否有菜单访问权限
    if (hasMenuPermission(userPermissions, menuCode)) {
      return next()
    }
    
    return res.status(403).json({ 
      success: false, 
      message: '无菜单访问权限' 
    })
  }
}

/**
 * 验证任意权限（支持多个权限）
 * @param {Array} permissionCodes - 权限代码数组
 * @param {String} operator - 'and' 或 'or'，默认 'or'
 * @returns {Function}
 */
function checkPermissions(permissionCodes, operator = 'or') {
  return (req, res, next) => {
    const userPermissions = req.user.permissions || []
    
    // 超级管理员权限
    if (userPermissions.includes('all')) {
      return next()
    }
    
    if (operator === 'and') {
      // 需要所有权限
      const hasAll = permissionCodes.every(code => userPermissions.includes(code))
      if (hasAll) {
        return next()
      }
    } else {
      // 只需要一个权限
      const hasAny = permissionCodes.some(code => userPermissions.includes(code))
      if (hasAny) {
        return next()
      }
    }
    
    return res.status(403).json({ 
      success: false, 
      message: '权限不足，无法执行此操作' 
    })
  }
}

/**
 * 验证是否为管理员（超级管理员、运营、客服）
 */
function isAdmin(req, res, next) {
  const user = req.user
  if (!user) {
    return res.status(401).json({ success: false, message: '未授权访问' })
  }
  
  const adminRoles = ['超级管理员', '运营人员', '客服人员']
  if (user.role && adminRoles.includes(user.role)) {
    return next()
  }
  
  return res.status(403).json({ 
    success: false, 
    message: '需要管理员权限' 
  })
}

module.exports = {
  authenticateToken,
  checkPermission,
  checkMenuPermission,
  checkPermissions,
  isAdmin
}
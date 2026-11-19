/**
 * 权限中间件
 * 支持缓存的权限验证
 */

const jwt = require('jsonwebtoken')
const config = require('../config')
const { query } = require('../db/connection')
const { ROLE_NAMES } = require('../config/permissions')
const { logger } = require('./logger')
const { businessLogger } = require('../services/businessLogger')

// 懒加载权限缓存，避免循环依赖
let permissionCache = null
function getPermissionCache() {
  if (!permissionCache) {
    try {
      permissionCache = require('../services/permissionCache')
    } catch (e) {
      logger.warn('权限缓存服务加载失败', { error: e.message })
    }
  }
  return permissionCache
}

function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwtSecret)
  } catch {
    return null
  }
}

function checkPermission(userPermissions, requiredPermission, isSuperAdmin = false) {
  if (!userPermissions || userPermissions.length === 0) {
    return false
  }
  
  // 超级管理员拥有所有权限
  if (isSuperAdmin) {
    return true
  }
  
  return userPermissions.includes(requiredPermission)
}

async function getRolePermissions(roleId) {
  // 优先使用缓存
  const cache = getPermissionCache()
  if (cache) {
    return await cache.getRolePermissions(roleId)
  }
  
  // 降级到直接查询数据库
  try {
    const roles = await query('SELECT permissions, name FROM roles WHERE id = ?', [roleId])
    
    if (roles && roles.length > 0 && roles[0]) {
      // 超级管理员返回所有权限
      if (roles[0].name === ROLE_NAMES.SUPER_ADMIN) {
        const { getAllPermissionCodes } = require('../config/permissions')
        return getAllPermissionCodes()
      }
      
      // 检查 permissions 是否已经是对象（MySQL JSON 类型）
      if (typeof roles[0].permissions === 'object' && !Array.isArray(roles[0].permissions)) {
        return Object.keys(roles[0].permissions)
      }
      // 如果是数组，直接返回
      if (Array.isArray(roles[0].permissions)) {
        return roles[0].permissions
      }
      // 如果是字符串，尝试解析
      if (typeof roles[0].permissions === 'string') {
        try {
          return JSON.parse(roles[0].permissions)
        } catch {
          return []
        }
      }
      return []
    }
    return []
  } catch (error) {
    logger.error('获取角色权限失败', { roleId, error: error.message })
    return []
  }
}

async function getUserShopId(userId) {
  try {
    const shops = await query('SELECT id FROM shops WHERE user_id = ?', [userId])
    if (shops && shops.length > 0 && shops[0]) {
      return shops[0].id
    }
    return null
  } catch (error) {
    logger.error('获取用户店铺ID失败', { userId, error: error.message })
    return null
  }
}

function permissionMiddleware(requiredPermission) {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization
      if (!authHeader) {
        logger.logPermission('unknown', requiredPermission, false)
        return res.status(401).json({ 
          success: false, 
          message: '未提供认证令牌' 
        })
      }
      
      const token = authHeader.replace('Bearer ', '')
      const decoded = verifyToken(token)
      if (!decoded || !decoded.id) {
        logger.logPermission('unknown', requiredPermission, false)
        return res.status(401).json({ 
          success: false, 
          message: '令牌无效' 
        })
      }
      
      const users = await query(
        'SELECT id, username, role_id, status FROM users WHERE id = ?',
        [decoded.id]
      )
      
      if (!users || users.length === 0) {
        logger.logPermission('unknown', requiredPermission, false)
        return res.status(404).json({ 
          success: false, 
          message: '用户不存在' 
        })
      }
      
      const user = users[0]
      if (user.status !== 1) {
        logger.logPermission(user.username, requiredPermission, false)
        return res.status(403).json({ 
          success: false, 
          message: '用户已被冻结' 
        })
      }
      
      // 获取角色名称
      const roles = await query('SELECT name FROM roles WHERE id = ?', [user.role_id])
      const roleName = roles && roles.length > 0 ? roles[0].name : null
      const isSuperAdmin = roleName === ROLE_NAMES.SUPER_ADMIN
      
      const rolePermissions = await getRolePermissions(user.role_id)
      
      // 获取用户店铺ID（如果是商家）
      const shopId = await getUserShopId(user.id)
      
      logger.debug(`权限验证: 用户=${user.username}, 角色=${roleName}, 需要权限=${requiredPermission}`)
      
      if (!checkPermission(rolePermissions, requiredPermission, isSuperAdmin)) {
        // 记录权限验证失败日志
        businessLogger.logPermissionCheck(user.id, user.username, requiredPermission, false)
        logger.logPermission(user.username, requiredPermission, false)
        
        return res.status(403).json({ 
          success: false, 
          message: `权限不足: 缺少权限 "${requiredPermission}"`,
          requiredPermission,
          availablePermissions: rolePermissions
        })
      }
      
      // 记录权限验证成功日志（仅在首次验证时）
      if (!req.permissionChecked) {
        req.permissionChecked = true
        businessLogger.logPermissionCheck(user.id, user.username, requiredPermission, true)
      }
      
      req.user = {
        id: user.id,
        username: user.username,
        roleId: user.role_id,
        role: roleName,  // 存储实际的角色名称，供业务逻辑使用
        permissions: rolePermissions,
        shopId: shopId
      }
      
      next()
    } catch (error) {
      logger.error('权限验证中间件错误', { error: error.message })
      return res.status(500).json({ 
        success: false, 
        message: '服务器错误' 
      })
    }
  }
}

function checkPermissions(permissions, requiredPermissions, isSuperAdmin = false) {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true
  }
  
  if (!permissions || permissions.length === 0) {
    return false
  }
  
  // 超级管理员拥有所有权限
  if (isSuperAdmin) {
    return true
  }
  
  return requiredPermissions.some(p => permissions.includes(p))
}

// 导出 hasPermission 函数供外部使用
function hasPermission(userPermissions, requiredPermission, isSuperAdmin = false) {
  if (!userPermissions || userPermissions.length === 0) {
    return false
  }
  
  // 超级管理员拥有所有权限
  if (isSuperAdmin) {
    return true
  }
  
  return userPermissions.includes(requiredPermission)
}

module.exports = {
  verifyToken,
  permissionMiddleware,
  hasPermission,
  checkPermissions,
  getRolePermissions,
  checkPermission,
  getUserShopId
}

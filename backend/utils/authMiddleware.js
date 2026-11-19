const jwt = require('jsonwebtoken')
const config = require('../config')
const { query } = require('../db/connection')
const { ROLE_NAMES } = require('../config/permissions')

// JWT验证中间件
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) {
    return res.status(401).json({ success: false, message: '未提供认证令牌' })
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret)
    
    // 先查询用户基本信息（不依赖 roles 表）
    const [userInfo] = await query(
      'SELECT * FROM users WHERE id = ?',
      [decoded.id]
    )
    
    if (!userInfo) {
      return res.status(401).json({ success: false, message: '用户不存在或已被删除' })
    }
    
    // 分别查询角色信息，避免 JOIN 失败导致整个认证失败
    let role = null
    let permissions = []
    if (userInfo.role_id) {
      const [roleResult] = await query(
        'SELECT name, permissions FROM roles WHERE id = ?',
        [userInfo.role_id]
      )
      if (roleResult) {
        role = roleResult
        
        // 解析权限
        if (role.permissions) {
          if (Array.isArray(role.permissions)) {
            permissions = role.permissions
          } else if (typeof role.permissions === 'string') {
            try {
              permissions = JSON.parse(role.permissions)
            } catch (e) {
              if (role.permissions.includes(',')) {
                permissions = role.permissions.split(',').map(p => p.trim())
              } else if (role.permissions.trim() !== '') {
                permissions = [role.permissions.trim()]
              }
            }
          } else if (typeof role.permissions === 'object') {
            permissions = role.permissions
          }
        }
      }
    }
    
    // 将用户信息和角色信息合并到 req.user
    req.user = {
      ...userInfo,
      role: role ? role.name : null,
      permissions: permissions
    }
    next()
  } catch (error) {
    console.error('认证失败:', error.message)
    return res.status(401).json({ success: false, message: '认证令牌无效或已过期' })
  }
}

// 权限检查中间件
function checkPermission(requiredPermission) {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.permissions) {
        return res.status(403).json({ success: false, message: '无权访问' })
      }
      
      // 检查是否有超级管理员权限（使用角色常量或检查权限数组）
      const isSuperAdmin = 
        req.user.role === ROLE_NAMES.SUPER_ADMIN ||
        (Array.isArray(req.user.permissions) && 
         (req.user.permissions.includes('*') || req.user.permissions.includes('all')))
      
      if (isSuperAdmin) {
        next()
        return
      }
      
      // 检查是否有指定权限
      if (Array.isArray(req.user.permissions) && req.user.permissions.includes(requiredPermission)) {
        next()
        return
      }
      
      return res.status(403).json({ success: false, message: '无权访问' })
    } catch (error) {
      return res.status(403).json({ success: false, message: '认证失败' })
    }
  }
}

module.exports = { authenticateToken, checkPermission }
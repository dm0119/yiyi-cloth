const { query } = require('../db/connection')
const { permissionTree, defaultRolePermissions, ROLE_IDS } = require('../config/permissions')
const { logger } = require('../utils/logger')
const { businessLogger } = require('../services/businessLogger')
const response = require('../utils/responseHelper')

// 记录权限变更审计日志（模块级函数，避免 this 绑定问题）
async function logPermissionChange({ operatorId, operatorName, roleId, oldPermissions, newPermissions, operation }) {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, username, action, target_type, target_id, old_value, new_value, ip_address, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        operatorId,
        operatorName,
        operation,
        'role',
        roleId,
        JSON.stringify(oldPermissions),
        JSON.stringify(newPermissions),
        '127.0.0.1'
      ]
    )
  } catch (error) {
    logger.error('记录审计日志失败', { error: error.message })
  }
}

const roleController = {
  async getRoleList(req, res) {
    try {
      const sql = 'SELECT id, name, description, permissions, status, created_at FROM roles'
      logger.debug('执行角色列表查询', { sql })
      const roles = await query(sql)
      logger.debug('查询结果', { count: roles.length })
      response.list(res, roles, '查询成功')
    } catch (error) {
      logger.error('角色列表查询失败', { error: error.message })
      response.serverError(res, '查询失败')
    }
  },

  async getRoleInfo(req, res) {
    try {
      const { roleId } = req.params
      const [role] = await query('SELECT id, name, description, permissions, status, created_at FROM roles WHERE id = ?', [roleId])
      
      if (!role) {
        return response.notFound(res, '角色不存在')
      }
      
      response.item(res, role, '查询成功')
    } catch (error) {
      response.serverError(res, '查询失败')
    }
  },

  async createRole(req, res) {
    try {
      const { name, description, permissions } = req.body
      
      if (!name || !permissions) {
        return response.badRequest(res, '角色名称和权限不能为空')
      }

      const [existing] = await query('SELECT id FROM roles WHERE name = ?', [name])
      if (existing) {
        return response.badRequest(res, '角色名称已存在')
      }

      const [result] = await query(
        'INSERT INTO roles (name, description, permissions) VALUES (?, ?, ?)',
        [name, description, JSON.stringify(permissions)]
      )

      // 记录角色创建日志
      businessLogger.logRoleCreate(req.user?.id, req.user?.username, result.insertId, name)
      
      response.created(res, { id: result.insertId, name, description, permissions }, '创建成功')
    } catch (error) {
      logger.error('创建角色失败', { error: error.message })
      response.serverError(res, '创建失败')
    }
  },

  async updateRole(req, res) {
    try {
      const { roleId } = req.params
      const { name, description } = req.body

      // 验证用户信息
      if (!req.user || !req.user.username) {
        return response.unauthorized(res, '用户信息不完整，请重新登录')
      }

      if (!name) {
        return response.badRequest(res, '角色名称不能为空')
      }

      // P0: 禁止修改超级管理员角色的基本信息
      if (parseInt(roleId) === ROLE_IDS.SUPER_ADMIN) {
        return response.forbidden(res, '超级管理员角色不可修改')
      }

      const [existing] = await query('SELECT id, name, description FROM roles WHERE id = ?', [roleId])
      if (!existing) {
        return response.notFound(res, '角色不存在')
      }

      await query(
        'UPDATE roles SET name = ?, description = ? WHERE id = ?',
        [name, description, roleId]
      )

      // P2: 记录审计日志
      await logPermissionChange({
        operatorId: req.user.id,
        operatorName: req.user.username,
        roleId: parseInt(roleId),
        oldPermissions: { name: existing.name, description: existing.description },
        newPermissions: { name, description },
        operation: 'update_role'
      })

      res.json({ success: true, data: { id: parseInt(roleId), name, description } })
    } catch (error) {
      logger.error('更新角色失败', { error: error.message })
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async deleteRole(req, res) {
    try {
      const { roleId } = req.params
      const { force } = req.body || false
      
      if (parseInt(roleId) === ROLE_IDS.SUPER_ADMIN) {
        return response.forbidden(res, '超级管理员角色不能删除')
      }

      const [existing] = await query('SELECT id FROM roles WHERE id = ?', [roleId])
      if (!existing) {
        return response.notFound(res, '角色不存在')
      }

      // 检查是否有关联用户
      const [userCount] = await query('SELECT COUNT(*) as count FROM users WHERE role_id = ?', [roleId])
      if (userCount.count > 0 && !force) {
        return response.badRequest(res, `该角色下存在${userCount.count}个用户，删除后这些用户将失去对应权限，是否继续？`)
      }

      // 如果强制删除，先将关联用户的 role_id 置空
      if (userCount.count > 0 && force) {
        await query('UPDATE users SET role_id = NULL WHERE role_id = ?', [roleId])
      }

      // 删除角色
      await query('DELETE FROM roles WHERE id = ?', [roleId])
      
      // 记录角色删除日志
      businessLogger.logRoleDelete(req.user?.id, req.user?.username, parseInt(roleId), existing.name)
      
      response.success(res, null, '角色删除成功')
    } catch (error) {
      logger.error('删除角色失败', { error: error.message })
      response.serverError(res, '删除失败')
    }
  },

  // 获取权限树
  async getPermissionTree(req, res) {
    try {
      response.success(res, permissionTree, '查询成功')
    } catch (error) {
      response.serverError(res, '查询失败')
    }
  },

  // 获取角色默认权限
  async getDefaultPermissions(req, res) {
    try {
      const { roleCode } = req.params
      
      if (!defaultRolePermissions[roleCode]) {
        return response.notFound(res, '角色代码不存在')
      }
      
      response.success(res, {
        name: defaultRolePermissions[roleCode].name,
        description: defaultRolePermissions[roleCode].description,
        permissions: defaultRolePermissions[roleCode].permissions
      }, '查询成功')
    } catch (error) {
      response.serverError(res, '查询失败')
    }
  },

  // 分配权限
  async assignPermissions(req, res) {
    try {
      const { roleId } = req.params
      const { permissions } = req.body

      if (!permissions || !Array.isArray(permissions)) {
        return response.badRequest(res, '权限格式不正确')
      }

      // 验证用户信息
      if (!req.user || !req.user.username) {
        return response.unauthorized(res, '用户信息不完整，请重新登录')
      }

      // P0: 禁止修改超级管理员角色的权限
      if (parseInt(roleId) === ROLE_IDS.SUPER_ADMIN) {
        return response.forbidden(res, '超级管理员权限不可修改')
      }

      const [existing] = await query('SELECT id, permissions FROM roles WHERE id = ?', [roleId])
      if (!existing) {
        return response.notFound(res, '角色不存在')
      }

      // P1: 验证权限代码有效性
      const { getAllPermissionCodes } = require('../config/permissions')
      const allPermissions = getAllPermissionCodes()
      const invalidPermissions = permissions.filter(p => !allPermissions.includes(p))
      if (invalidPermissions.length > 0) {
        return response.badRequest(res, '包含无效的权限代码', { invalidPermissions })
      }

      // P2: 记录审计日志
      let oldPermissions = existing.permissions
      if (typeof oldPermissions === 'string') {
        try {
          oldPermissions = JSON.parse(oldPermissions)
        } catch (e) {
          // 如果不是JSON，尝试解析为逗号分隔的字符串
          if (oldPermissions.includes(',')) {
            oldPermissions = oldPermissions.split(',').map(p => p.trim())
          } else if (oldPermissions.trim() !== '') {
            oldPermissions = [oldPermissions.trim()]
          } else {
            oldPermissions = []
          }
          logger.debug('权限数据格式已从字符串转换为数组', { oldPermissions })
        }
      }

      await query(
        'UPDATE roles SET permissions = ? WHERE id = ?',
        [JSON.stringify(permissions), roleId]
      )

      // 记录审计日志
      await logPermissionChange({
        operatorId: req.user.id,
        operatorName: req.user.username,
        roleId: parseInt(roleId),
        oldPermissions,
        newPermissions: permissions,
        operation: 'update_permissions'
      })
      
      // 记录权限变更日志
      const roleName = existing.name || '未知'
      businessLogger.logPermissionChange(
        req.user.id, 
        req.user.username, 
        parseInt(roleId), 
        roleName,
        { added: permissions.filter(p => !oldPermissions.includes(p)), removed: oldPermissions.filter(p => !permissions.includes(p)) }
      )

      // 清除该角色的权限缓存
      try {
        const permissionCache = require('../services/permissionCache')
        await permissionCache.invalidateRole(parseInt(roleId))
      } catch (e) {
        logger.warn('清除权限缓存失败', { error: e.message })
      }

      response.success(res, null, '权限分配成功')
    } catch (error) {
      logger.error('权限分配失败', { error: error.message })
      response.serverError(res, '权限分配失败')
    }
  },

  // P2: 获取审计日志
  async getAuditLogs(req, res) {
    try {
      const { roleId, userId, page = 1, limit = 20 } = req.query

      let sql = 'SELECT * FROM audit_logs WHERE 1=1'
      const params = []

      if (roleId) {
        sql += ' AND target_id = ? AND target_type = "role"'
        params.push(roleId)
      }

      if (userId) {
        sql += ' AND user_id = ?'
        params.push(userId)
      }

      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
      params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit))

      const logs = await query(sql, params)

      // 获取总数
      const countSql = sql.split('ORDER BY')[0].replace('SELECT *', 'SELECT COUNT(*) as total')
      const [countResult] = await query(countSql, params.slice(0, -2))

      res.json({
        success: true,
        data: logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total
        }
      })
    } catch (error) {
      console.error('获取审计日志失败:', error)
      res.status(500).json({ success: false, message: error.message })
    }
  }
}

module.exports = roleController

/**
 * 统一权限服务
 * 
 * 整合旧系统（roles.permissions JSON字段）和新系统（role_permissions 表）
 * 提供统一的权限管理接口
 * 
 * 使用方式：
 * const permissionService = require('../services/permissionService')
 * 
 * // 获取角色权限
 * const permissions = await permissionService.getRolePermissions(roleId)
 * 
 * // 设置角色权限
 * await permissionService.setRolePermissions(roleId, ['product:view', 'order:manage'])
 * 
 * // 检查新权限系统是否启用
 * const isEnabled = await permissionService.isNewSystemEnabled()
 */

const { query } = require('../db/connection')
const { logger } = require('../utils/logger')
const { ROLE_NAMES } = require('../config/permissions')

class PermissionService {
  constructor() {
    this.newSystemEnabled = null // 缓存新系统是否启用
  }

  /**
   * 检查新权限系统是否已启用
   * 通过检查 role_permissions 表是否存在
   */
  async isNewSystemEnabled() {
    if (this.newSystemEnabled !== null) {
      return this.newSystemEnabled
    }

    try {
      // 尝试查询新系统表
      await query('SELECT COUNT(*) as count FROM role_permissions LIMIT 1')
      this.newSystemEnabled = true
      logger.info('新权限系统已启用')
      return true
    } catch (error) {
      // 表不存在，使用旧系统
      this.newSystemEnabled = false
      logger.info('使用旧权限系统（JSON字段）')
      return false
    }
  }

  /**
   * 获取角色权限（统一接口）
   * 优先从新系统获取，失败则回退到旧系统
   */
  async getRolePermissions(roleId) {
    const isNew = await this.isNewSystemEnabled()
    
    if (isNew) {
      try {
        return await this.getRolePermissionsFromNewSystem(roleId)
      } catch (error) {
        logger.warn(`新系统获取权限失败，回退到旧系统: ${error.message}`)
      }
    }
    
    return await this.getRolePermissionsFromOldSystem(roleId)
  }

  /**
   * 从旧系统获取权限（roles.permissions JSON字段）
   */
  async getRolePermissionsFromOldSystem(roleId) {
    try {
      const [role] = await query('SELECT name, permissions FROM roles WHERE id = ?', [roleId])
      
      if (!role) {
        logger.warn(`角色不存在: ${roleId}`)
        return []
      }

      // 超级管理员拥有所有权限
      if (role.name === ROLE_NAMES.SUPER_ADMIN) {
        const { getAllPermissionCodes } = require('../config/permissions')
        return getAllPermissionCodes()
      }

      // 解析权限
      if (!role.permissions) {
        return []
      }

      if (Array.isArray(role.permissions)) {
        return role.permissions
      }

      if (typeof role.permissions === 'string') {
        try {
          return JSON.parse(role.permissions)
        } catch {
          if (role.permissions.includes(',')) {
            return role.permissions.split(',').map(p => p.trim())
          }
          return [role.permissions.trim()]
        }
      }

      return []
    } catch (error) {
      logger.error('从旧系统获取权限失败', { roleId, error: error.message })
      return []
    }
  }

  /**
   * 从新系统获取权限（role_permissions 表）
   */
  async getRolePermissionsFromNewSystem(roleId) {
    try {
      // 检查是否为超级管理员
      const [role] = await query('SELECT name FROM roles WHERE id = ?', [roleId])
      
      if (!role) {
        return []
      }

      // 超级管理员拥有所有权限
      if (role.name === ROLE_NAMES.SUPER_ADMIN) {
        const { getAllPermissionCodes } = require('../config/permissions')
        return getAllPermissionCodes()
      }

      // 从 role_permissions 表获取权限代码
      const permissions = await query(
        `SELECT DISTINCT p.code 
         FROM role_permissions rp
         JOIN permissions p ON rp.permission_id = p.id
         WHERE rp.role_id = ? AND p.status = 1`,
        [roleId]
      )

      return permissions.map(p => p.code)
    } catch (error) {
      logger.error('从新系统获取权限失败', { roleId, error: error.message })
      throw error
    }
  }

  /**
   * 设置角色权限（统一接口）
   * 同时写入新旧系统（兼容模式）
   */
  async setRolePermissions(roleId, permissions) {
    // 验证权限代码有效性
    const { getAllPermissionCodes } = require('../config/permissions')
    const allPermissions = getAllPermissionCodes()
    const invalidPermissions = permissions.filter(p => !allPermissions.includes(p))
    
    if (invalidPermissions.length > 0) {
      throw new Error(`包含无效权限: ${invalidPermissions.join(', ')}`)
    }

    // 写入旧系统
    await this.setRolePermissionsOldSystem(roleId, permissions)
    
    // 如果新系统已启用，也写入新系统
    if (await this.isNewSystemEnabled()) {
      await this.setRolePermissionsNewSystem(roleId, permissions)
    }
    
    logger.info(`角色权限已更新: roleId=${roleId}, permissions=${permissions.length}`)
  }

  /**
   * 写入旧系统权限
   */
  async setRolePermissionsOldSystem(roleId, permissions) {
    await query(
      'UPDATE roles SET permissions = ? WHERE id = ?',
      [JSON.stringify(permissions), roleId]
    )
  }

  /**
   * 写入新系统权限
   */
  async setRolePermissionsNewSystem(roleId, permissions) {
    const connection = await new Promise((resolve, reject) => {
      require('../db/connection').getConnection((err, conn) => {
        if (err) reject(err)
        else resolve(conn)
      })
    })

    try {
      // 开始事务
      await new Promise((resolve, reject) => {
        connection.beginTransaction(err => {
          if (err) reject(err)
          else resolve()
        })
      })

      // 删除旧权限
      await new Promise((resolve, reject) => {
        connection.query(
          'DELETE FROM role_permissions WHERE role_id = ?',
          [roleId],
          (err) => {
            if (err) reject(err)
            else resolve()
          }
        )
      })

      // 插入新权限
      if (permissions.length > 0) {
        // 获取权限ID
        const placeholders = permissions.map(() => '?').join(',')
        const [permRecords] = await new Promise((resolve, reject) => {
          connection.query(
            `SELECT id, code FROM permissions WHERE code IN (${placeholders})`,
            permissions,
            (err, results) => {
              if (err) reject(err)
              else resolve([results])
            }
          )
        })

        // 批量插入
        const rolePermissions = permRecords
          .filter(r => r)
          .map(r => [roleId, r.id])

        if (rolePermissions.length > 0) {
          const values = rolePermissions.map(rp => rp.join(',')).join('),(')
          await new Promise((resolve, reject) => {
            connection.query(
              `INSERT INTO role_permissions (role_id, permission_id) VALUES ${values}`,
              [],
              (err) => {
                if (err) reject(err)
                else resolve()
              }
            )
          })
        }
      }

      // 提交事务
      await new Promise((resolve, reject) => {
        connection.commit(err => {
          if (err) reject(err)
          else resolve()
        })
      })

    } catch (error) {
      // 回滚事务
      await new Promise(resolve => {
        connection.rollback(() => resolve())
      })
      throw error
    } finally {
      connection.release()
    }
  }

  /**
   * 获取角色菜单（用于前端菜单渲染）
   */
  async getRoleMenus(roleId) {
    const isNew = await this.isNewSystemEnabled()
    
    if (isNew) {
      try {
        return await this.getRoleMenusFromNewSystem(roleId)
      } catch (error) {
        logger.warn(`从新系统获取菜单失败: ${error.message}`)
      }
    }
    
    return await this.getRoleMenusFromOldSystem(roleId)
  }

  /**
   * 从旧系统获取菜单
   */
  async getRoleMenusFromOldSystem(roleId) {
    const permissions = await this.getRolePermissionsFromOldSystem(roleId)
    
    // 权限到菜单的映射
    const permissionToMenu = {
      'dashboard:view': 'dashboard',
      'user:view': 'user',
      'role:view': 'role',
      'product:view': 'product',
      'category:view': 'category',
      'order:view': 'order',
      'coupon:view': 'coupon',
      'review:view': 'review',
      'discussion:view': 'discussion',
      'zone:view': 'zone',
      'conversation:view': 'conversation',
      'merchant:view': 'merchant',
      'shop:view': 'shop',
      'statistics:view': 'statistics'
    }

    const menus = new Set()
    for (const perm of permissions) {
      const menu = permissionToMenu[perm]
      if (menu) {
        menus.add(menu)
      }
    }

    return Array.from(menus)
  }

  /**
   * 从新系统获取菜单
   */
  async getRoleMenusFromNewSystem(roleId) {
    const menus = await query(
      `SELECT DISTINCT m.id, m.name, m.path, m.icon, m.parent_id
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       JOIN menus m ON p.menu_id = m.id
       WHERE rp.role_id = ? AND m.status = 1 AND p.status = 1`,
      [roleId]
    )

    return menus
  }

  /**
   * 迁移角色到新系统
   */
  async migrateRoleToNewSystem(roleId) {
    if (!(await this.isNewSystemEnabled())) {
      throw new Error('新权限系统未启用')
    }

    const permissions = await this.getRolePermissionsFromOldSystem(roleId)
    await this.setRolePermissionsNewSystem(roleId, permissions)
    
    logger.info(`角色已迁移到新系统: roleId=${roleId}`)
  }

  /**
   * 获取权限系统统计
   */
  async getStats() {
    const stats = {
      newSystemEnabled: await this.isNewSystemEnabled(),
      roles: {},
      permissions: {},
      cache: {}
    }

    // 统计角色
    const roles = await query('SELECT COUNT(*) as count FROM roles')
    stats.roles.total = roles[0]?.count || 0

    // 统计权限
    const perms = await query('SELECT COUNT(*) as count FROM permissions')
    stats.permissions.total = perms[0]?.count || 0

    if (stats.newSystemEnabled) {
      const rolePerms = await query('SELECT COUNT(*) as count FROM role_permissions')
      stats.permissions.assigned = rolePerms[0]?.count || 0
    }

    // 缓存统计
    try {
      const permissionCache = require('./permissionCache')
      stats.cache = permissionCache.getStats()
    } catch (e) {
      stats.cache = { error: '缓存服务未加载' }
    }

    return stats
  }
}

// 导出单例
const permissionService = new PermissionService()

module.exports = permissionService

/**
 * 权限缓存服务
 * 
 * 提供两层缓存：内存缓存(LRU) + Redis缓存
 * 大幅减少数据库查询，提升性能
 * 
 * 使用方式：
 * const permissionCache = require('../services/permissionCache')
 * 
 * // 获取角色权限（自动缓存）
 * const permissions = await permissionCache.getRolePermissions(roleId)
 * 
 * // 清除角色缓存
 * await permissionCache.invalidateRole(roleId)
 * 
 * // 清除所有缓存
 * await permissionCache.invalidateAll()
 */

const { query } = require('../db/connection')
const { safeRedis, isAvailable: isRedisAvailable } = require('./redisClient')
const { logger } = require('../utils/logger')
const config = require('../config')

// LRU 内存缓存
class LRUCache {
  constructor(maxSize = 1000) {
    this.maxSize = maxSize
    this.cache = new Map()
  }

  get(key) {
    if (!this.cache.has(key)) return undefined
    
    // 移到末尾（最近使用）
    const value = this.cache.get(key)
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // 删除最旧的条目
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }

  has(key) {
    return this.cache.has(key)
  }

  delete(key) {
    return this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  size() {
    return this.cache.size
  }
}

class PermissionCache {
  constructor() {
    // 内存缓存
    this.memoryCache = new LRUCache(config.cache?.permission?.maxSize || 1000)
    
    // 缓存配置
    this.ttl = config.cache?.permission?.ttl || 300 // 默认5分钟
    
    // 缓存键前缀
    this.prefix = 'permission:'
    
    // 统计信息
    this.stats = {
      memoryHits: 0,
      memoryMisses: 0,
      redisHits: 0,
      redisMisses: 0,
      dbQueries: 0
    }
    
    logger.info('权限缓存服务初始化完成', {
      maxSize: this.memoryCache.maxSize,
      ttl: this.ttl,
      redisEnabled: isRedisAvailable()
    })
  }

  /**
   * 获取缓存键
   */
  getCacheKey(type, id) {
    return `${this.prefix}${type}:${id}`
  }

  /**
   * 获取角色权限（优先缓存）
   * @param {number} roleId - 角色ID
   * @returns {Promise<Array>} 权限数组
   */
  async getRolePermissions(roleId) {
    const cacheKey = this.getCacheKey('role', roleId)
    
    // 1. 先查内存缓存
    const cached = this.memoryCache.get(cacheKey)
    if (cached !== undefined) {
      this.stats.memoryHits++
      logger.debug(`权限缓存命中（内存）: roleId=${roleId}`)
      return cached
    }
    this.stats.memoryMisses++
    
    // 2. 尝试 Redis 缓存
    if (isRedisAvailable()) {
      const redisCached = await safeRedis.getJson(cacheKey)
      if (redisCached !== null) {
        this.stats.redisHits++
        // 回填到内存缓存
        this.memoryCache.set(cacheKey, redisCached)
        logger.debug(`权限缓存命中（Redis）: roleId=${roleId}`)
        return redisCached
      }
      this.stats.redisMisses++
    }
    
    // 3. 查询数据库
    this.stats.dbQueries++
    const permissions = await this.loadRolePermissionsFromDb(roleId)
    
    // 4. 写入缓存
    if (permissions) {
      this.memoryCache.set(cacheKey, permissions)
      if (isRedisAvailable()) {
        await safeRedis.setJson(cacheKey, permissions, this.ttl)
      }
    }
    
    return permissions
  }

  /**
   * 从数据库加载角色权限
   */
  async loadRolePermissionsFromDb(roleId) {
    try {
      const [role] = await query('SELECT permissions, name FROM roles WHERE id = ?', [roleId])
      
      if (!role) {
        logger.warn(`角色不存在: roleId=${roleId}`)
        return null
      }
      
      let permissions = []
      
      // 超级管理员拥有所有权限
      if (role.name === '超级管理员') {
        const { getAllPermissionCodes } = require('../config/permissions')
        permissions = getAllPermissionCodes()
      } else if (role.permissions) {
        // 解析权限
        if (Array.isArray(role.permissions)) {
          permissions = role.permissions
        } else if (typeof role.permissions === 'string') {
          try {
            permissions = JSON.parse(role.permissions)
          } catch {
            if (role.permissions.includes(',')) {
              permissions = role.permissions.split(',').map(p => p.trim())
            } else {
              permissions = [role.permissions.trim()]
            }
          }
        }
      }
      
      logger.debug(`从数据库加载角色权限: roleId=${roleId}, permissions=${permissions.length}`)
      return permissions
      
    } catch (error) {
      logger.error('从数据库加载角色权限失败', { roleId, error: error.message })
      return null
    }
  }

  /**
   * 获取用户完整权限信息
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 用户权限信息
   */
  async getUserPermissions(userId) {
    const cacheKey = this.getCacheKey('user', userId)
    
    // 1. 先查内存缓存
    const cached = this.memoryCache.get(cacheKey)
    if (cached !== undefined) {
      this.stats.memoryHits++
      return cached
    }
    this.stats.memoryMisses++
    
    // 2. Redis 缓存
    if (isRedisAvailable()) {
      const redisCached = await safeRedis.getJson(cacheKey)
      if (redisCached !== null) {
        this.stats.redisHits++
        this.memoryCache.set(cacheKey, redisCached)
        return redisCached
      }
      this.stats.redisMisses++
    }
    
    // 3. 查询数据库
    this.stats.dbQueries++
    const userPermissions = await this.loadUserPermissionsFromDb(userId)
    
    // 4. 写入缓存
    if (userPermissions) {
      this.memoryCache.set(cacheKey, userPermissions)
      if (isRedisAvailable()) {
        await safeRedis.setJson(cacheKey, userPermissions, this.ttl)
      }
    }
    
    return userPermissions
  }

  /**
   * 从数据库加载用户权限信息
   */
  async loadUserPermissionsFromDb(userId) {
    try {
      const [user] = await query(
        `SELECT u.id, u.username, u.role_id, r.name as role_name, r.permissions 
         FROM users u 
         LEFT JOIN roles r ON u.role_id = r.id 
         WHERE u.id = ?`,
        [userId]
      )
      
      if (!user) {
        return null
      }
      
      let permissions = []
      
      // 超级管理员拥有所有权限
      if (user.role_name === '超级管理员') {
        const { getAllPermissionCodes } = require('../config/permissions')
        permissions = getAllPermissionCodes()
      } else if (user.permissions) {
        if (Array.isArray(user.permissions)) {
          permissions = user.permissions
        } else if (typeof user.permissions === 'string') {
          try {
            permissions = JSON.parse(user.permissions)
          } catch {
            permissions = user.permissions.split(',').map(p => p.trim())
          }
        }
      }
      
      return {
        userId: user.id,
        username: user.username,
        roleId: user.role_id,
        roleName: user.role_name,
        permissions
      }
      
    } catch (error) {
      logger.error('从数据库加载用户权限失败', { userId, error: error.message })
      return null
    }
  }

  /**
   * 清除角色缓存
   * @param {number} roleId - 角色ID
   */
  async invalidateRole(roleId) {
    const cacheKey = this.getCacheKey('role', roleId)
    
    // 清除内存缓存
    this.memoryCache.delete(cacheKey)
    
    // 清除 Redis 缓存
    if (isRedisAvailable()) {
      await safeRedis.del(cacheKey)
    }
    
    logger.info(`权限缓存已清除: roleId=${roleId}`)
  }

  /**
   * 清除用户缓存
   * @param {number} userId - 用户ID
   */
  async invalidateUser(userId) {
    const cacheKey = this.getCacheKey('user', userId)
    
    this.memoryCache.delete(cacheKey)
    
    if (isRedisAvailable()) {
      await safeRedis.del(cacheKey)
    }
    
    logger.info(`用户权限缓存已清除: userId=${userId}`)
  }

  /**
   * 清除所有权限缓存
   */
  async invalidateAll() {
    // 清除内存缓存
    this.memoryCache.clear()
    
    // 清除 Redis 缓存
    if (isRedisAvailable()) {
      await safeRedis.delPattern(`${this.prefix}*`)
    }
    
    logger.info('所有权限缓存已清除')
  }

  /**
   * 预热缓存（用户登录时调用）
   * @param {number} userId - 用户ID
   */
  async warmUp(userId) {
    try {
      // 加载用户权限
      const userPerm = await this.getUserPermissions(userId)
      
      // 如果有角色，预热角色权限
      if (userPerm && userPerm.roleId) {
        await this.getRolePermissions(userPerm.roleId)
      }
      
      logger.debug(`权限缓存预热完成: userId=${userId}`)
      return true
    } catch (error) {
      logger.error('权限缓存预热失败', { userId, error: error.message })
      return false
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    const total = this.stats.memoryHits + this.stats.memoryMisses + 
                   this.stats.redisHits + this.stats.redisMisses
    const hitRate = total > 0 ? 
      ((this.stats.memoryHits + this.stats.redisHits) / total * 100).toFixed(2) : 0
    
    return {
      ...this.stats,
      memorySize: this.memoryCache.size(),
      hitRate: `${hitRate}%`,
      totalQueries: this.stats.dbQueries
    }
  }

  /**
   * 重置统计信息
   */
  resetStats() {
    this.stats = {
      memoryHits: 0,
      memoryMisses: 0,
      redisHits: 0,
      redisMisses: 0,
      dbQueries: 0
    }
  }
}

// 导出单例
const permissionCache = new PermissionCache()

module.exports = permissionCache

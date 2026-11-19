/**
 * Redis 客户端连接管理
 * 
 * 使用方式：
 * const redis = require('../services/redisClient')
 * redis.get('key').then(val => console.log(val))
 */

const Redis = require('ioredis')
const config = require('../config')
const { logger } = require('../utils/logger')

let redisClient = null
let isConnected = false

// Redis 配置
const redisConfig = {
  host: config.redis?.host || '127.0.0.1',
  port: config.redis?.port || 6379,
  password: config.redis?.password || undefined,
  db: config.redis?.db || 0,
  keyPrefix: config.redis?.keyPrefix || 'backend:',
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  enableOfflineQueue: false
}

/**
 * 创建 Redis 客户端
 */
function createRedisClient() {
  if (!config.redis?.enabled) {
    logger.warn('Redis 未启用，将使用内存缓存替代')
    return null
  }

  try {
    const client = new Redis(redisConfig)
    
    client.on('connect', () => {
      isConnected = true
      logger.info('Redis 连接成功', { host: redisConfig.host, port: redisConfig.port })
    })
    
    client.on('error', (err) => {
      isConnected = false
      logger.error('Redis 连接错误', { error: err.message })
    })
    
    client.on('close', () => {
      isConnected = false
      logger.warn('Redis 连接已关闭')
    })
    
    client.on('reconnecting', () => {
      logger.info('Redis 正在重连...')
    })
    
    return client
  } catch (error) {
    logger.error('创建 Redis 客户端失败', { error: error.message })
    return null
  }
}

/**
 * 获取 Redis 客户端实例
 */
function getRedisClient() {
  if (!redisClient) {
    redisClient = createRedisClient()
  }
  return redisClient
}

/**
 * 尝试连接 Redis
 */
async function connect() {
  const client = getRedisClient()
  if (client && !isConnected) {
    try {
      await client.connect()
      return true
    } catch (error) {
      logger.error('Redis 连接失败', { error: error.message })
      return false
    }
  }
  return isConnected
}

/**
 * 检查 Redis 是否可用
 */
function isAvailable() {
  return isConnected && redisClient !== null
}

/**
 * 安全的 Redis 操作
 */
const safeRedis = {
  async get(key) {
    if (!isAvailable()) return null
    try {
      return await redisClient.get(key)
    } catch (error) {
      logger.error('Redis GET 失败', { key, error: error.message })
      return null
    }
  },

  async set(key, value, ttlSeconds = null) {
    if (!isAvailable()) return false
    try {
      if (ttlSeconds) {
        await redisClient.setex(key, ttlSeconds, value)
      } else {
        await redisClient.set(key, value)
      }
      return true
    } catch (error) {
      logger.error('Redis SET 失败', { key, error: error.message })
      return false
    }
  },

  async del(key) {
    if (!isAvailable()) return false
    try {
      await redisClient.del(key)
      return true
    } catch (error) {
      logger.error('Redis DEL 失败', { key, error: error.message })
      return false
    }
  },

  async delPattern(pattern) {
    if (!isAvailable()) return false
    try {
      const keys = await redisClient.keys(pattern)
      if (keys.length > 0) {
        await redisClient.del(...keys)
      }
      return keys.length
    } catch (error) {
      logger.error('Redis DEL Pattern 失败', { pattern, error: error.message })
      return 0
    }
  },

  async getJson(key) {
    const value = await this.get(key)
    if (!value) return null
    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  },

  async setJson(key, value, ttlSeconds = null) {
    return await this.set(key, JSON.stringify(value), ttlSeconds)
  }
}

module.exports = {
  getRedisClient,
  connect,
  isAvailable,
  safeRedis,
  redisConfig
}

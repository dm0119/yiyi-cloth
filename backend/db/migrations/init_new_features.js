/**
 * 新功能初始化脚本
 * 
 * 运行此脚本初始化：
 * 1. 业务日志表
 * 2. 检查新权限系统表
 * 
 * 使用方式：
 * cd backend
 * node db/migrations/init-new-features.js
 */

const mysql = require('mysql2/promise')
const config = require('../../config')

async function init() {
  console.log('🔄 开始初始化新功能...\n')

  // 创建数据库连接
  const connection = await mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database
  })

  try {
    // 1. 创建业务日志表
    console.log('📝 创建业务日志表...')
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS business_logs (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED DEFAULT NULL COMMENT '操作用户ID',
        username VARCHAR(50) DEFAULT '' COMMENT '操作用户名',
        action VARCHAR(50) NOT NULL COMMENT '操作类型',
        resource VARCHAR(50) DEFAULT '' COMMENT '资源类型',
        details JSON DEFAULT NULL COMMENT '操作详情',
        ip VARCHAR(45) DEFAULT '' COMMENT 'IP地址',
        user_agent VARCHAR(500) DEFAULT '' COMMENT '用户代理',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_action (action),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='业务操作日志表'
    `)
    console.log('✅ 业务日志表创建成功\n')

    // 2. 检查新权限系统表是否存在
    console.log('🔍 检查新权限系统表...')
    try {
      await connection.execute('SELECT COUNT(*) FROM role_permissions LIMIT 1')
      console.log('✅ 新权限系统表已存在\n')
    } catch (error) {
      if (error.code === 'ER_NO_SUCH_TABLE') {
        console.log('⚠️ 新权限系统表不存在，将继续使用旧系统\n')
      } else {
        throw error
      }
    }

    // 3. 初始化 Redis 连接测试
    console.log('🔍 测试 Redis 连接...')
    try {
      const redisClient = require('../../services/redisClient')
      const isAvailable = redisClient.isAvailable()
      if (isAvailable) {
        console.log('✅ Redis 连接正常\n')
      } else {
        await redisClient.connect()
        console.log('✅ Redis 连接成功\n')
      }
    } catch (error) {
      console.log(`⚠️ Redis 连接失败（将使用内存缓存）: ${error.message}\n`)
    }

    // 4. 输出统计信息
    console.log('📊 系统统计:')
    try {
      const permissionService = require('../../services/permissionService')
      const stats = await permissionService.getStats()
      console.log(`   新权限系统: ${stats.newSystemEnabled ? '已启用' : '未启用'}`)
      console.log(`   角色数量: ${stats.roles.total}`)
      console.log(`   权限数量: ${stats.permissions.total}`)
      if (stats.cache && stats.cache.hitRate) {
        console.log(`   缓存命中率: ${stats.cache.hitRate}`)
        console.log(`   数据库查询: ${stats.cache.dbQueries}`)
      }
    } catch (e) {
      console.log(`   无法获取统计: ${e.message}`)
    }

    console.log('\n🎉 初始化完成！')

  } catch (error) {
    console.error('❌ 初始化失败:', error.message)
    process.exit(1)
  } finally {
    await connection.end()
  }
}

init()

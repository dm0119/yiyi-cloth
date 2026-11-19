/**
 * 数据库表初始化
 * 用于在启动时确保必要的数据库表存在
 */

const mysql = require('mysql2/promise')
const config = require('../config')

async function initTables() {
  let connection
  try {
    connection = await mysql.createConnection({
      host: config.database.host,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database,
      port: config.database.port,
      charset: config.database.charset
    })

    // 检查数据库连接
    await connection.query('SELECT 1')
  } catch (error) {
    console.error('数据库连接失败:', error.message)
    throw error
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

module.exports = { initTables }

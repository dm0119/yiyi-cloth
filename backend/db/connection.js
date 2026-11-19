/**
 * 数据库连接模块
 * 提供连接池、query、事务等功能
 */

const mysql = require('mysql2/promise')
const config = require('../config')

// 创建连接池
const pool = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  port: config.database.port,
  charset: config.database.charset,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

/**
 * 执行 SQL 查询
 * @param {string} sql - SQL 语句
 * @param {Array} params - 参数数组
 * @returns {Promise<Array>} 查询结果
 */
async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params)
  return rows
}

/**
 * 执行 SQL 查询（不指定数据库）
 * @param {string} sql - SQL 语句
 * @param {Array} params - 参数数组
 * @returns {Promise<Array>} 查询结果
 */
async function queryWithoutDb(sql, params = []) {
  const conn = await mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    port: config.database.port,
    charset: config.database.charset
  })
  const [rows] = await conn.execute(sql, params)
  await conn.end()
  return rows
}

/**
 * 直接执行 SQL（不预处理）
 * @param {string} sql - SQL 语句
 * @param {Array} params - 参数数组
 * @returns {Promise<Array>} 查询结果
 */
async function executeDirect(sql, params = []) {
  const [rows] = await pool.query(sql, params)
  return rows
}

/**
 * 获取数据库连接（回调方式）
 * @param {Function} callback - 回调函数
 */
function getConnection(callback) {
  pool.getConnection().then(conn => {
    callback(null, conn)
  }).catch(err => {
    callback(err, null)
  })
}

/**
 * 在事务中执行操作
 * @param {Function} callback - 事务回调，接收 connection 参数
 * @returns {Promise<any>} 事务结果
 */
async function withTransaction(callback) {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

module.exports = {
  pool,
  query,
  queryWithoutDb,
  executeDirect,
  getConnection,
  withTransaction
}

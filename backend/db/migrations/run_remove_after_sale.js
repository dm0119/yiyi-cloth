const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')
const config = require('../../config')

async function runMigration() {
  let connection
  
  try {
    connection = await mysql.createConnection({
      host: config.database.host,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database,
      multipleStatements: true
    })

    console.log('数据库连接成功')

    const sql = fs.readFileSync(path.join(__dirname, 'remove_after_sale.sql'), 'utf8')
    
    await connection.query(sql)
    
    console.log('售后相关表和字段已成功删除')
    
  } catch (error) {
    console.error('迁移失败:', error.message)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

runMigration()

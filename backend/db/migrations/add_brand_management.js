const { query, queryWithoutDb } = require('../../db/connection')
const config = require('../../config')

async function addBrandManagement() {
  try {
    await queryWithoutDb(`CREATE DATABASE IF NOT EXISTS ${config.database.database}`)
    await queryWithoutDb(`USE ${config.database.database}`)
    
    console.log('开始添加品牌管理功能...')

    // 1. 在 shops 表添加品牌相关字段
    console.log('修改 shops 表...')
    
    // 检查字段是否已存在
    const columns = await query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'shops' 
      AND COLUMN_NAME IN ('is_brand', 'brand_certified_at')
    `)
    
    const hasIsBrand = columns.some(col => col.COLUMN_NAME === 'is_brand')
    const hasBrandCertifiedAt = columns.some(col => col.COLUMN_NAME === 'brand_certified_at')
    
    if (!hasIsBrand) {
      await query(`
        ALTER TABLE shops 
        ADD COLUMN is_brand TINYINT DEFAULT 0 COMMENT '是否品牌店铺 0-否 1-是'
      `)
      console.log('✓ 添加 is_brand 字段')
    } else {
      console.log('✓ is_brand 字段已存在')
    }
    
    if (!hasBrandCertifiedAt) {
      await query(`
        ALTER TABLE shops 
        ADD COLUMN brand_certified_at DATETIME NULL COMMENT '品牌认证时间'
      `)
      console.log('✓ 添加 brand_certified_at 字段')
    } else {
      console.log('✓ brand_certified_at 字段已存在')
    }
    
    // 2. 添加索引优化查询性能
    try {
      await query(`
        ALTER TABLE shops 
        ADD INDEX idx_is_brand (is_brand)
      `)
      console.log('✓ 添加品牌索引')
    } catch (error) {
      if (error.code === 'ER_DUP_KEY') {
        console.log('✓ 品牌索引已存在')
      } else {
        throw error
      }
    }
    
    console.log('品牌管理功能添加完成！')
  } catch (error) {
    console.error('添加品牌管理功能失败:', error)
    throw error
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  addBrandManagement()
    .then(() => {
      console.log('迁移完成！')
      process.exit(0)
    })
    .catch((error) => {
      console.error('迁移失败:', error)
      process.exit(1)
    })
}

module.exports = { addBrandManagement }

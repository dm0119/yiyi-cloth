/**
 * 实名认证控制器
 * 功能：实名认证申请、查询（买家自动审批，无需上传身份证照片）
 */

const { query } = require('../db/connection')
const { formatDate } = require('../utils/dateFormatter')
const { logger } = require('../utils/logger')
const crypto = require('crypto')

// 生成加密密钥的哈希（确保密钥长度正确）
function getEncryptionKey() {
  const key = process.env.ENCRYPT_KEY || 'realname-secret-key-2026'
  return crypto.createHash('sha256').update(key).digest('hex')
}

// 身份证号加密函数
function encryptIdCard(idCardNumber) {
  if (!idCardNumber) return null
  const algorithm = 'aes-256-cbc'
  const key = Buffer.from(getEncryptionKey(), 'hex')
  const iv = Buffer.alloc(16, 0)
  
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(idCardNumber, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}

// 身份证号解密函数
function decryptIdCard(encrypted) {
  if (!encrypted) return null
  try {
    const algorithm = 'aes-256-cbc'
    const key = Buffer.from(getEncryptionKey(), 'hex')
    const iv = Buffer.alloc(16, 0)
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (e) {
    logger.error('身份证号解密失败:', e.message)
    return encrypted
  }
}

// 身份证号脱敏函数（只显示前3后4位）
function maskIdCard(idCardNumber) {
  if (!idCardNumber || idCardNumber.length < 7) return idCardNumber
  return idCardNumber.substring(0, 3) + '****' + idCardNumber.substring(idCardNumber.length - 4)
}

const realNameController = {
  
  /**
   * 提交实名认证（买家自动审批）
   * POST /api/realname/apply
   */
  async apply(req, res) {
    try {
      const userId = req.user.id
      const { real_name, id_card_number } = req.body
      
      // 验证必填字段
      if (!real_name || !id_card_number) {
        return res.status(400).json({ 
          success: false, 
          message: '请填写完整的实名认证信息，包括真实姓名和身份证号' 
        })
      }
      
      // 验证身份证号格式（18 位）
      const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/
      if (!idCardRegex.test(id_card_number)) {
        return res.status(400).json({ 
          success: false, 
          message: '身份证号格式不正确' 
        })
      }
      
      // 检查用户是否已认证
      const [user] = await query(
        `SELECT id, real_name_status, real_name FROM users WHERE id = ?`,
        [userId]
      )
      
      if (!user) {
        return res.status(404).json({ success: false, message: '用户不存在' })
      }
      
      if (user.real_name_status === 'approved') {
        return res.status(400).json({ 
          success: false, 
          message: '您已完成实名认证，无需重复申请' 
        })
      }
      
      // 加密身份证号
      const encryptedIdCard = encryptIdCard(id_card_number)
      const now = new Date()
      
      // 买家自动审批，直接更新用户表
      await query(
        `UPDATE users 
         SET real_name = ?, id_card_number = ?, real_name_status = 'approved', real_name_reviewed_at = ?, updated_at = NOW()
         WHERE id = ?`,
        [real_name, encryptedIdCard, now, userId]
      )
      
      logger.info(`用户 ${userId} 完成实名认证（自动审批）`)
      
      res.json({
        success: true,
        message: '实名认证已通过',
        data: {
          status: 'approved',
          verified_at: formatDate(now)
        }
      })
    } catch (error) {
      logger.error('实名认证失败:', error)
      res.status(500).json({ success: false, message: '认证失败：' + error.message })
    }
  },
  
  /**
   * 获取当前用户实名状态
   * GET /api/realname/status
   */
  async getStatus(req, res) {
    try {
      const userId = req.user.id
      
      const [user] = await query(
        `SELECT id, real_name, id_card_number, real_name_status, real_name_reviewed_at 
         FROM users WHERE id = ?`,
        [userId]
      )
      
      if (!user) {
        return res.status(404).json({ success: false, message: '用户不存在' })
      }
      
      const data = {
        status: user.real_name_status || 'none',
        real_name: user.real_name || null,
        id_card_number_masked: user.id_card_number ? maskIdCard(decryptIdCard(user.id_card_number)) : null,
        reviewed_at: formatDate(user.real_name_reviewed_at)
      }
      
      res.json({
        success: true,
        data: data
      })
    } catch (error) {
      logger.error('获取实名状态失败:', error)
      res.status(500).json({ success: false, message: '获取失败：' + error.message })
    }
  },
  
  /**
   * 获取我的实名认证详情
   * GET /api/realname/my
   */
  async getMyInfo(req, res) {
    try {
      const userId = req.user.id
      
      const [user] = await query(
        `SELECT real_name, id_card_number, real_name_status, real_name_reviewed_at 
         FROM users WHERE id = ?`,
        [userId]
      )
      
      if (!user || user.real_name_status !== 'approved') {
        return res.json({
          success: true,
          data: {
            verified: false,
            status: user?.real_name_status || 'none',
            message: '您尚未完成实名认证'
          }
        })
      }
      
      res.json({
        success: true,
        data: {
          verified: true,
          real_name: user.real_name,
          id_card_number_masked: maskIdCard(decryptIdCard(user.id_card_number)),
          status: 'approved',
          reviewed_at: formatDate(user.real_name_reviewed_at)
        }
      })
    } catch (error) {
      logger.error('获取实名信息失败:', error)
      res.status(500).json({ success: false, message: '获取失败：' + error.message })
    }
  }
}

module.exports = realNameController

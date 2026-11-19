const { query } = require('../db/connection')
const crypto = require('crypto')

// 密码错误最大次数
const MAX_ERROR_COUNT = 5
// 锁定时间（分钟）
const LOCK_DURATION_MINUTES = 30

const payPasswordController = {
  
  /**
   * 设置支付密码
   * POST /api/user/pay-password/set
   */
  async setPayPassword(req, res) {
    try {
      const userId = req.user?.id || req.body?.user_id
      const { pay_password, confirm_password } = req.body
      
      if (!userId) {
        return res.status(401).json({ success: false, message: '请先登录' })
      }
      
      // 验证必填字段
      if (!pay_password || !confirm_password) {
        return res.status(400).json({ success: false, message: '请填写支付密码和确认密码' })
      }
      
      // 验证密码长度（6位数字）
      if (!/^\d{6}$/.test(pay_password)) {
        return res.status(400).json({ success: false, message: '支付密码必须为6位数字' })
      }
      
      // 验证两次密码是否一致
      if (pay_password !== confirm_password) {
        return res.status(400).json({ success: false, message: '两次输入的支付密码不一致' })
      }
      
      // 检查用户是否已设置过支付密码
      const [user] = await query('SELECT pay_password_status FROM users WHERE id = ?', [userId])
      if (!user) {
        return res.status(404).json({ success: false, message: '用户不存在' })
      }
      
      // 如果已设置，需要验证旧密码
      if (user.pay_password_status === 1) {
        const { old_password } = req.body
        if (!old_password) {
          return res.status(400).json({ success: false, message: '修改支付密码需要验证旧密码' })
        }
        
        // 验证旧密码
        const hashedOldPassword = hashPassword(old_password)
        const [oldUser] = await query('SELECT pay_password FROM users WHERE id = ?', [userId])
        if (oldUser.pay_password !== hashedOldPassword) {
          return res.status(400).json({ success: false, message: '原支付密码错误' })
        }
      }
      
      // 加密新密码
      const hashedPassword = hashPassword(pay_password)
      
      // 更新数据库
      await query(
        'UPDATE users SET pay_password = ?, pay_password_status = 1, pay_password_error_count = 0 WHERE id = ?',
        [hashedPassword, userId]
      )
      
      res.json({ success: true, message: '支付密码设置成功' })
      
    } catch (error) {
      console.error('设置支付密码失败:', error)
      res.status(500).json({ success: false, message: '设置支付密码失败' })
    }
  },
  
  /**
   * 验证支付密码
   * POST /api/user/pay-password/verify
   */
  async verifyPayPassword(req, res) {
    try {
      const userId = req.user?.id || req.body?.user_id
      const { pay_password, order_id } = req.body
      
      if (!userId) {
        return res.status(401).json({ success: false, message: '请先登录' })
      }
      
      // 验证必填字段
      if (!pay_password) {
        return res.status(400).json({ success: false, message: '请输入支付密码' })
      }
      
      // 查询用户
      const [user] = await query(
        'SELECT pay_password, pay_password_status, pay_password_error_count, pay_password_locked_until FROM users WHERE id = ?',
        [userId]
      )
      
      if (!user) {
        return res.status(404).json({ success: false, message: '用户不存在' })
      }
      
      // 检查是否设置了支付密码
      if (user.pay_password_status !== 1) {
        return res.status(400).json({ 
          success: false, 
          message: '您还未设置支付密码，请先设置',
          need_set_password: true
        })
      }
      
      // 检查是否被锁定
      if (user.pay_password_locked_until) {
        const lockUntil = new Date(user.pay_password_locked_until)
        if (lockUntil > new Date()) {
          const minutes = Math.ceil((lockUntil - new Date()) / 60000)
          return res.status(403).json({ 
            success: false, 
            message: `密码错误次数过多，请 ${minutes} 分钟后再试`,
            locked: true,
            lock_minutes: minutes
          })
        } else {
          // 锁定已过期，重置错误计数
          await query('UPDATE users SET pay_password_error_count = 0, pay_password_locked_until = NULL WHERE id = ?', [userId])
        }
      }
      
      // 验证密码
      const hashedPassword = hashPassword(pay_password)
      if (hashedPassword === user.pay_password) {
        // 密码正确，重置错误计数
        await query('UPDATE users SET pay_password_error_count = 0 WHERE id = ?', [userId])
        
        return res.json({ 
          success: true, 
          message: '支付密码验证成功',
          verified: true
        })
      } else {
        // 密码错误，增加错误计数
        const newErrorCount = user.pay_password_error_count + 1
        
        if (newErrorCount >= MAX_ERROR_COUNT) {
          // 达到最大错误次数，锁定账户
          const lockUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000)
          await query(
            'UPDATE users SET pay_password_error_count = ?, pay_password_locked_until = ? WHERE id = ?',
            [newErrorCount, lockUntil, userId]
          )
          
          return res.status(403).json({ 
            success: false, 
            message: `支付密码错误超过${MAX_ERROR_COUNT}次，请 ${LOCK_DURATION_MINUTES} 分钟后再试`,
            locked: true,
            lock_minutes: LOCK_DURATION_MINUTES,
            error_count: newErrorCount
          })
        } else {
          // 未达到最大次数，更新错误计数
          await query('UPDATE users SET pay_password_error_count = ? WHERE id = ?', [newErrorCount, userId])
          
          return res.status(400).json({ 
            success: false, 
            message: `支付密码错误，剩余${MAX_ERROR_COUNT - newErrorCount}次机会`,
            error_count: newErrorCount,
            remaining: MAX_ERROR_COUNT - newErrorCount
          })
        }
      }
      
    } catch (error) {
      console.error('验证支付密码失败:', error)
      res.status(500).json({ success: false, message: '验证支付密码失败' })
    }
  },
  
  /**
   * 检查支付密码设置状态
   * GET /api/user/pay-password/status
   */
  async getPayPasswordStatus(req, res) {
    try {
      const userId = req.user?.id || req.query?.user_id
      
      if (!userId) {
        return res.status(401).json({ success: false, message: '请先登录' })
      }
      
      const [user] = await query(
        'SELECT pay_password_status, pay_password_error_count, pay_password_locked_until FROM users WHERE id = ?',
        [userId]
      )
      
      if (!user) {
        return res.status(404).json({ success: false, message: '用户不存在' })
      }
      
      // 检查是否被锁定
      let locked = false
      let lock_minutes = 0
      if (user.pay_password_locked_until) {
        const lockUntil = new Date(user.pay_password_locked_until)
        if (lockUntil > new Date()) {
          locked = true
          lock_minutes = Math.ceil((lockUntil - new Date()) / 60000)
        }
      }
      
      res.json({
        success: true,
        data: {
          is_set: user.pay_password_status === 1,
          locked: locked,
          lock_minutes: lock_minutes,
          error_count: user.pay_password_error_count
        }
      })
      
    } catch (error) {
      console.error('获取支付密码状态失败:', error)
      res.status(500).json({ success: false, message: '获取支付密码状态失败' })
    }
  },
  
  /**
   * 验证支付密码（专门用于支付流程）
   * POST /api/payments/verify-password
   */
  async verifyForPayment(req, res) {
    try {
      const userId = req.user?.id
      const { pay_password } = req.body
      
      if (!userId) {
        return res.status(401).json({ success: false, message: '请先登录' })
      }
      
      if (!pay_password) {
        return res.status(400).json({ success: false, message: '请输入支付密码' })
      }
      
      // 直接调用验证逻辑
      const [user] = await query(
        'SELECT pay_password, pay_password_status, pay_password_error_count, pay_password_locked_until FROM users WHERE id = ?',
        [userId]
      )
      
      if (!user) {
        return res.status(404).json({ success: false, message: '用户不存在' })
      }
      
      if (user.pay_password_status !== 1) {
        return res.status(400).json({ 
          success: false, 
          message: '您还未设置支付密码',
          need_set_password: true
        })
      }
      
      // 检查锁定
      if (user.pay_password_locked_until) {
        const lockUntil = new Date(user.pay_password_locked_until)
        if (lockUntil > new Date()) {
          const minutes = Math.ceil((lockUntil - new Date()) / 60000)
          return res.status(403).json({ 
            success: false, 
            message: `密码错误次数过多，请 ${minutes} 分钟后再试`,
            locked: true
          })
        }
      }
      
      // 验证密码
      const hashedPassword = hashPassword(pay_password)
      if (hashedPassword === user.pay_password) {
        await query('UPDATE users SET pay_password_error_count = 0 WHERE id = ?', [userId])
        
        return res.json({ 
          success: true, 
          verified: true,
          message: '密码验证通过'
        })
      } else {
        const newErrorCount = user.pay_password_error_count + 1
        
        if (newErrorCount >= MAX_ERROR_COUNT) {
          const lockUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000)
          await query(
            'UPDATE users SET pay_password_error_count = ?, pay_password_locked_until = ? WHERE id = ?',
            [newErrorCount, lockUntil, userId]
          )
          
          return res.status(403).json({ 
            success: false, 
            message: `密码错误，请 ${LOCK_DURATION_MINUTES} 分钟后再试`,
            locked: true
          })
        }
        
        await query('UPDATE users SET pay_password_error_count = ? WHERE id = ?', [newErrorCount, userId])
        
        return res.status(400).json({ 
          success: false, 
          message: `支付密码错误，还剩${MAX_ERROR_COUNT - newErrorCount}次机会`,
          remaining: MAX_ERROR_COUNT - newErrorCount
        })
      }
      
    } catch (error) {
      console.error('支付密码验证失败:', error)
      res.status(500).json({ success: false, message: '验证失败' })
    }
  }
}

// SHA256哈希密码
function hashPassword(password) {
  return crypto.createHash('sha256').update(String(password)).digest('hex')
}

module.exports = payPasswordController

const { query } = require('../db/connection')
const { formatDate } = require('../utils/dateFormatter')

const historyController = {
  async create(req, res) {
    try {
      const user_id = req.user.id
      const { product_id, product_name, price, image } = req.body
      
      if (!user_id || !product_id) {
        return res.status(400).json({ success: false, message: '缺少必要参数' })
      }
      
      // 先检查是否已存在相同的浏览记录
      const [existing] = await query(
        'SELECT id FROM browse_history WHERE user_id = ? AND product_id = ?',
        [user_id, product_id]
      )
      
      if (existing) {
        // 如果已存在，更新浏览时间
        await query(
          'UPDATE browse_history SET viewed_at = NOW() WHERE id = ?',
          [existing.id]
        )
        return res.json({ success: true, message: '浏览记录已更新' })
      }
      
      // 插入新的浏览记录
      const result = await query(
        `INSERT INTO browse_history (user_id, product_id, product_name, price, image, viewed_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [user_id, product_id, product_name, price, image]
      )
      
      // 限制每个用户的浏览记录数量
      await query(
        `DELETE FROM browse_history
         WHERE user_id = ? AND id NOT IN (
           SELECT id FROM (
             SELECT id FROM browse_history
             WHERE user_id = ?
             ORDER BY viewed_at DESC
             LIMIT 50
           ) AS temp
         )`,
        [user_id, user_id]
      )
      
      res.json({ success: true, message: '浏览记录已添加' })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  async getByUser(req, res) {
    try {
      const user_id = req.user.id
      
      if (!user_id) {
        return res.status(400).json({ success: false, message: '缺少用户ID' })
      }
      
      const history = await query(
        `SELECT * FROM browse_history
         WHERE user_id = ?
         ORDER BY viewed_at DESC`,
        [user_id]
      )
      
      // 格式化日期
      const formattedHistory = history.map(item => ({
        ...item,
        viewed_at: formatDate(item.viewed_at)
      }))
      
      res.json({ success: true, data: formattedHistory })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  async delete(req, res) {
    try {
      const { id } = req.params
      const user_id = req.user.id
      
      if (!id || !user_id) {
        return res.status(400).json({ success: false, message: '缺少必要参数' })
      }
      
      const result = await query(
        'DELETE FROM browse_history WHERE id = ? AND user_id = ?',
        [id, user_id]
      )
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: '浏览记录不存在' })
      }
      
      res.json({ success: true, message: '浏览记录已删除' })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  async clear(req, res) {
    try {
      const user_id = req.user.id
      
      if (!user_id) {
        return res.status(400).json({ success: false, message: '缺少用户ID' })
      }
      
      await query('DELETE FROM browse_history WHERE user_id = ?', [user_id])
      
      res.json({ success: true, message: '浏览记录已清空' })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  async sync(req, res) {
    try {
      const user_id = req.user.id
      const { history } = req.body
      
      if (!user_id || !Array.isArray(history)) {
        return res.status(400).json({ success: false, message: '缺少必要参数' })
      }
      
      // 开始事务
      await query('START TRANSACTION')
      
      try {
        // 清空用户的所有浏览记录
        await query('DELETE FROM browse_history WHERE user_id = ?', [user_id])
        
        // 批量插入浏览记录
        if (history.length > 0) {
          const values = history.map(item => [
            user_id,
            item.product_id,
            item.product_name,
            item.price,
            item.image,
            item.viewed_at || new Date().toISOString()
          ])
          
          await query(
            `INSERT INTO browse_history (user_id, product_id, product_name, price, image, viewed_at)
             VALUES ?`,
            [values]
          )
        }
        
        // 提交事务
        await query('COMMIT')
        
        res.json({ success: true, message: '浏览记录已同步' })
      } catch (error) {
        // 回滚事务
        await query('ROLLBACK')
        throw error
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  }
}

module.exports = historyController
const { query } = require('../db/connection')
const { formatDate } = require('../utils/dateFormatter')

const shopFollowController = {
  // 获取用户关注的店铺列表
  async getList(req, res) {
    try {
      const userId = req.query.userId || (req.body && req.body.userId)
      const { page = 1, limit = 10 } = req.query

      const pageNum = parseInt(page) || 1
      const limitNum = parseInt(limit) || 10
      const offset = (pageNum - 1) * limitNum

      const countSql = `
        SELECT COUNT(*) as total
        FROM shop_follows sf
        INNER JOIN shops s ON sf.shop_id = s.id
        WHERE sf.user_id = ? AND s.status = 'active'
      `
      const countResult = await query(countSql, [userId])
      const total = Array.isArray(countResult) && countResult.length > 0
        ? countResult[0].total
        : 0

      const sql = `
        SELECT
          sf.id as follow_id,
          sf.created_at as follow_created_at,
          s.id,
          s.name,
          s.description,
          s.logo_url,
          s.banner_url,
          s.status,
          (SELECT COUNT(*) FROM products WHERE shop_id = s.id AND status = 1 AND deleted = 0) as product_count
        FROM shop_follows sf
        INNER JOIN shops s ON sf.shop_id = s.id
        WHERE sf.user_id = ? AND s.status = 'active'
        ORDER BY sf.created_at DESC
        LIMIT ${limitNum} OFFSET ${offset}
      `
      const follows = await query(sql, [userId])

      follows.forEach(f => {
        f.follow_created_at = formatDate(f.follow_created_at)
        f.product_count = parseInt(f.product_count) || 0
      })

      res.json({
        success: true,
        data: {
          list: follows,
          total,
          page: pageNum,
          limit: limitNum
        }
      })
    } catch (error) {
      console.error('获取关注店铺列表失败:', error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  // 关注店铺
  async add(req, res) {
    try {
      const userId = req.body.userId || (req.query && req.query.userId)
      const { shop_id } = req.body

      if (!shop_id) {
        return res.status(400).json({ success: false, message: '店铺ID不能为空' })
      }

      const shopResult = await query('SELECT id, status FROM shops WHERE id = ? AND status = "active"', [shop_id])
      const shop = Array.isArray(shopResult) && shopResult.length > 0 ? shopResult[0] : null
      if (!shop) {
        return res.status(404).json({ success: false, message: '店铺不存在或已关闭' })
      }

      const existingResult = await query(
        'SELECT id FROM shop_follows WHERE user_id = ? AND shop_id = ?',
        [userId, shop_id]
      )
      const existing = Array.isArray(existingResult) && existingResult.length > 0
      if (existing) {
        return res.status(400).json({ success: false, message: '已关注该店铺' })
      }

      await query(
        'INSERT INTO shop_follows (user_id, shop_id) VALUES (?, ?)',
        [userId, shop_id]
      )

      res.json({ success: true, message: '关注成功' })
    } catch (error) {
      console.error('关注店铺失败:', error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  // 取消关注
  async remove(req, res) {
    try {
      const userId = req.query.userId || (req.body && req.body.userId)
      const { shopId } = req.params

      const existingResult = await query(
        'SELECT id FROM shop_follows WHERE user_id = ? AND shop_id = ?',
        [userId, shopId]
      )
      const existing = Array.isArray(existingResult) && existingResult.length > 0
      if (!existing) {
        return res.status(404).json({ success: false, message: '关注记录不存在' })
      }

      await query(
        'DELETE FROM shop_follows WHERE user_id = ? AND shop_id = ?',
        [userId, shopId]
      )

      res.json({ success: true, message: '取消关注成功' })
    } catch (error) {
      console.error('取消关注失败:', error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  // 检查是否已关注
  async check(req, res) {
    try {
      const userId = req.query.userId || (req.body && req.body.userId)
      const { shopId } = req.params

      const result = await query(
        'SELECT id FROM shop_follows WHERE user_id = ? AND shop_id = ?',
        [userId, shopId]
      )
      const followed = Array.isArray(result) && result.length > 0

      res.json({
        success: true,
        data: {
          is_followed: followed
        }
      })
    } catch (error) {
      console.error('检查关注状态失败:', error)
      res.status(500).json({ success: false, message: error.message })
    }
  }
}

module.exports = shopFollowController

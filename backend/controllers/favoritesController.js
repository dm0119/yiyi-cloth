const { query } = require('../db/connection')
const { formatDate } = require('../utils/dateFormatter')

const favoritesController = {
  async getList(req, res) {
    try {
      // 强制使用认证用户的ID，避免越权操作
      const userId = req.user.id
      const { page = 1, limit = 10, sort = 'created_at_desc' } = req.query
      
      const pageNum = parseInt(page) || 1
      const limitNum = parseInt(limit) || 10
      const offset = (pageNum - 1) * limitNum
      
      let orderBy = 'f.created_at DESC'
      if (sort === 'price_asc') {
        orderBy = 'p.price ASC'
      } else if (sort === 'price_desc') {
        orderBy = 'p.price DESC'
      }
      
      const countSql = `
        SELECT COUNT(*) as total
        FROM favorites f
        INNER JOIN products p ON f.product_id = p.id
        WHERE f.user_id = ? AND p.status = 1
      `
      const [countResult] = await query(countSql, [userId])
      const total = countResult.total
      
      const sql = `
        SELECT 
          f.id as favorite_id,
          f.created_at as favorite_created_at,
          p.id,
          p.name,
          p.price,
          p.image,
          p.stock,
          p.status
        FROM favorites f
        INNER JOIN products p ON f.product_id = p.id
        WHERE f.user_id = ? AND p.status = 1
        ORDER BY ${orderBy}
        LIMIT ${limitNum} OFFSET ${offset}
      `
      const favorites = await query(sql, [userId])
      
      favorites.forEach(f => {
        if (f.image) {
          try {
            f.image = typeof f.image === 'string' ? JSON.parse(f.image) : f.image
          } catch (e) {
            f.image = f.image
          }
        }
        
        f.favorite_created_at = formatDate(f.favorite_created_at)
        f.price = parseFloat(f.price) || 0
        f.stock = parseInt(f.stock) || 0
      })
      
      res.json({
        success: true,
        data: {
          list: favorites,
          total: total,
          page: parseInt(page),
          limit: parseInt(limit)
        }
      })
    } catch (error) {
      console.error('获取收藏列表失败:', error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async add(req, res) {
    try {
      // 强制使用认证用户的ID
      const userId = req.user.id
      const { product_id } = req.body
      
      if (!product_id) {
        return res.status(400).json({ success: false, message: '商品ID不能为空' })
      }
      
      const [product] = await query('SELECT id FROM products WHERE id = ? AND status = 1', [product_id])
      if (!product) {
        return res.status(404).json({ success: false, message: '商品不存在' })
      }
      
      const [existing] = await query(
        'SELECT id FROM favorites WHERE user_id = ? AND product_id = ?',
        [userId, product_id]
      )
      if (existing) {
        return res.status(400).json({ success: false, message: '已收藏该商品' })
      }
      
      await query(
        'INSERT INTO favorites (user_id, product_id) VALUES (?, ?)',
        [userId, product_id]
      )
      
      res.json({ success: true, message: '收藏成功' })
    } catch (error) {
      console.error('添加收藏失败:', error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async remove(req, res) {
    try {
      // 强制使用认证用户的ID
      const userId = req.user.id
      const { productId } = req.params
      
      const [favorite] = await query(
        'SELECT id FROM favorites WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      )
      
      if (!favorite) {
        return res.status(404).json({ success: false, message: '收藏记录不存在' })
      }
      
      await query(
        'DELETE FROM favorites WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      )
      
      res.json({ success: true, message: '取消收藏成功' })
    } catch (error) {
      console.error('取消收藏失败:', error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async check(req, res) {
    try {
      // 强制使用认证用户的ID
      const userId = req.user.id
      const { productId } = req.params
      
      const [favorite] = await query(
        'SELECT id FROM favorites WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      )
      
      res.json({
        success: true,
        data: {
          is_favorited: !!favorite
        }
      })
    } catch (error) {
      console.error('检查收藏状态失败:', error)
      res.status(500).json({ success: false, message: error.message })
    }
  }
}

module.exports = favoritesController

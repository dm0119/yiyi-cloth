const { query } = require('../db/connection')
const { formatDate } = require('../utils/dateFormatter')

// 检查并创建review_replies表
async function createReplyTableIfNotExists() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS review_replies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        review_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME NOT NULL,
        FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
      )
    `)
  } catch (error) {
    console.warn('创建review_replies表失败:', error)
  }
}

const reviewController = {
  // 创建评价
  async create(req, res) {
    try {
      const { order_id, product_id, order_item_id, rating, content, images, is_anonymous } = req.body
      
      // 验证评分范围
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: '评分必须在 1-5 之间' })
      }
      
      // 检查订单和商品是否存在，并获取订单项信息
      const orderSql = `
        SELECT o.id, o.status, o.customer_name, oi.id as item_id, oi.product_id as item_product_id
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id AND oi.product_id = ?
        WHERE o.id = ?
      `
      const orderResults = await query(orderSql, [product_id, order_id])
      
      if (orderResults.length === 0) {
        return res.status(400).json({ success: false, message: '订单不存在' })
      }
      
      const order = orderResults[0]
      
      // 检查订单状态是否已完成（状态 5），只有已完成的订单才能评价
      if (order.status !== 5) {
        return res.status(400).json({ success: false, message: '只有已完成的订单才能评价' })
      }
      
      // 检查订单项是否存在
      if (!order.item_id) {
        return res.status(400).json({ success: false, message: '该订单中没有此商品' })
      }
      
      // 如果有传入 order_item_id，验证是否匹配
      if (order_item_id && order_item_id !== order.item_id) {
        return res.status(400).json({ success: false, message: '订单项 ID 不匹配' })
      }
      
      // 使用订单项 ID 进行精确检查（精确到具体 SKU）
      const reviewItemId = order_item_id || order.item_id
      const existingReviewSql = 'SELECT id FROM reviews WHERE order_item_id = ?'
      const existingReviews = await query(existingReviewSql, [reviewItemId])
      
      if (existingReviews.length > 0) {
        return res.status(400).json({ success: false, message: '该商品已评价过' })
      }
      
      // 从订单自动获取用户名称，不允许前端传入
      const user_name = is_anonymous ? '匿名用户' : order.customer_name
      
      // 处理图片数据
      let imagesJson = null
      if (images) {
        if (Array.isArray(images)) {
          // 过滤无效的图片 URL
          const validImages = images.filter(img => img && typeof img === 'string' && img.trim() !== '')
          if (validImages.length > 0) {
            imagesJson = JSON.stringify(validImages)
          }
        } else if (typeof images === 'string') {
          // 处理字符串格式的图片数据
          try {
            const parsedImages = JSON.parse(images)
            if (Array.isArray(parsedImages)) {
              const validImages = parsedImages.filter(img => img && typeof img === 'string' && img.trim() !== '')
              if (validImages.length > 0) {
                imagesJson = JSON.stringify(validImages)
              }
            }
          } catch (e) {
            // 解析失败，忽略图片数据
            console.warn('Invalid images format:', e)
          }
        }
      }
      
      // 插入评价数据
      const insertSql = `
        INSERT INTO reviews (order_id, product_id, order_item_id, user_name, rating, content, images) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
      const result = await query(insertSql, [order_id, product_id, order_item_id || order.item_id, user_name, rating, content, imagesJson])
      
      res.json({ success: true, message: '评价成功', data: { id: result.insertId } })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  // 获取商品的评价列表
  async getByProduct(req, res) {
    try {
        const { product_id } = req.params
        const { page = 1, limit = 10 } = req.query
        const pageNum = Math.max(1, parseInt(page) || 1)
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10))  // 限制每页最多 100 条
        const offset = (pageNum - 1) * limitNum
        
        // 检查并创建 review_replies 表
        await createReplyTableIfNotExists()
        
        // 获取评价列表（使用冗余的 product_name 字段，不依赖 products 表）
        const sql = `
          SELECT r.*, o.customer_name as user_name
          FROM reviews r
          LEFT JOIN orders o ON r.order_id = o.id
          WHERE r.product_id = ? AND r.status = 1
          ORDER BY r.created_at DESC
          LIMIT ${limitNum} OFFSET ${offset}
        `
        const reviews = await query(sql, [product_id])
      
      // 获取评价总数
      const countSql = `
        SELECT COUNT(*) as count
        FROM reviews
        WHERE product_id = ? AND status = 1
      `
      const countResult = await query(countSql, [product_id])
      const total = countResult[0].count
      
      // 处理图片字段和日期格式化，并获取回复信息
      for (const review of reviews) {
        if (review.images) {
          try {
            review.images = typeof review.images === 'string' ? JSON.parse(review.images) : review.images
          } catch (e) {
            review.images = []
          }
        } else {
          review.images = []
        }
        
        // 格式化日期时间
        review.created_at = formatDate(review.created_at)

        // 使用订单中的客户姓名作为用户名
        if (!review.user_name) {
          review.user_name = review.user_name || '匿名用户'
        }
        
        review.rating = parseInt(review.rating) || 0
        
        // 获取回复信息
        const replySql = `
          SELECT id, review_id, content, created_at
          FROM review_replies
          WHERE review_id = ?
          ORDER BY created_at DESC
          LIMIT 1
        `
        const replyResult = await query(replySql, [review.id])
        if (replyResult.length > 0) {
          review.reply = {
            id: replyResult[0].id,
            content: replyResult[0].content,
            created_at: formatDate(replyResult[0].created_at)
          }
        } else {
          review.reply = null
        }
      }
      
      res.json({ 
        success: true, 
        data: { 
          reviews,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        } 
      })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  // 获取订单的评价
  async getByOrder(req, res) {
    try {
      const { order_id } = req.params
      
      const sql = `
        SELECT r.*, p.name as product_name, p.image as product_image
        FROM reviews r
        LEFT JOIN products p ON r.product_id = p.id
        WHERE r.order_id = ?
        ORDER BY r.created_at DESC
      `
      const reviews = await query(sql, [order_id])
      
      // 处理图片字段和日期格式化
      reviews.forEach(review => {
        if (review.images) {
          try {
            review.images = typeof review.images === 'string' ? JSON.parse(review.images) : review.images
          } catch (e) {
            review.images = []
          }
        } else {
          review.images = []
        }
        
        // 格式化日期时间
        review.created_at = formatDate(review.created_at)
        
        review.rating = parseInt(review.rating) || 0
      })
      
      res.json({ success: true, data: reviews })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  // 获取所有评价（用于后台管理）
  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, status, product_id, order_id } = req.query
      
      let sql = `
        SELECT r.*, p.name as product_name, o.order_no, o.customer_name
        FROM reviews r
        LEFT JOIN products p ON r.product_id = p.id
        LEFT JOIN orders o ON r.order_id = o.id
        WHERE 1=1
      `
      let countSql = `
        SELECT COUNT(*) as count
        FROM reviews r
        LEFT JOIN products p ON r.product_id = p.id
        LEFT JOIN orders o ON r.order_id = o.id
        WHERE 1=1
      `
      const params = []
      const countParams = []
      
      // 添加筛选条件
      if (status !== undefined && status !== '') {
        sql += ' AND r.status = ?'
        countSql += ' AND r.status = ?'
        params.push(parseInt(status))
        countParams.push(parseInt(status))
      }
      
      if (product_id) {
        sql += ' AND r.product_id = ?'
        countSql += ' AND r.product_id = ?'
        params.push(parseInt(product_id))
        countParams.push(parseInt(product_id))
      }
      
      if (order_id) {
        sql += ' AND r.order_id = ?'
        countSql += ' AND r.order_id = ?'
        params.push(parseInt(order_id))
        countParams.push(parseInt(order_id))
      }
      
      sql += ' ORDER BY r.created_at DESC'
      
      const pageNum = Math.max(1, parseInt(page) || 1)
      const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10))  // 限制每页最多100条
      const offset = (pageNum - 1) * limitNum
      sql += ` LIMIT ${limitNum} OFFSET ${offset}`
      
      const reviews = await query(sql, params)
      const countResult = await query(countSql, countParams)
      const total = countResult[0].count
      
      // 处理图片字段和日期格式化，并获取回复信息
      for (const review of reviews) {
        if (review.images) {
          try {
            review.images = typeof review.images === 'string' ? JSON.parse(review.images) : review.images
          } catch (e) {
            review.images = []
          }
        } else {
          review.images = []
        }
        
        // 格式化日期时间
        review.created_at = formatDate(review.created_at)
        
        review.rating = parseInt(review.rating) || 0
        
        // 获取回复信息
        const replySql = `
          SELECT id, review_id, content, created_at
          FROM review_replies
          WHERE review_id = ?
          ORDER BY created_at DESC
          LIMIT 1
        `
        const replyResult = await query(replySql, [review.id])
        if (replyResult.length > 0) {
          review.reply = {
            id: replyResult[0].id,
            content: replyResult[0].content,
            created_at: formatDate(replyResult[0].created_at)
          }
        } else {
          review.reply = null
        }
      }
      
      res.json({ 
        success: true, 
        data: { 
          reviews,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        } 
      })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  // 更新评价状态（用于后台管理）
  async updateStatus(req, res) {
    try {
      const { id } = req.params
      const { status } = req.body
      
      if (status === undefined) {
        return res.status(400).json({ success: false, message: '状态不能为空' })
      }
      
      await query('UPDATE reviews SET status = ? WHERE id = ?', [parseInt(status), id])
      
      res.json({ success: true, message: '状态更新成功' })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  // 删除评价（用于后台管理）
  async delete(req, res) {
    try {
      const { id } = req.params
      
      await query('DELETE FROM reviews WHERE id = ?', [id])
      
      res.json({ success: true, message: '删除成功' })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  // 批量删除评价
  async batchDelete(req, res) {
    try {
      const { ids } = req.body
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, message: '请选择要删除的评价' })
      }
      
      const placeholders = ids.map(() => '?').join(',')
      await query(`DELETE FROM reviews WHERE id IN (${placeholders})`, ids)
      
      res.json({ success: true, message: `成功删除 ${ids.length} 个评价` })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  // 回复评价
  async reply(req, res) {
    try {
      const { id } = req.params
      const { content } = req.body
      
      // 验证回复内容
      if (!content || content.trim() === '') {
        return res.status(400).json({ success: false, message: '回复内容不能为空' })
      }
      
      // 检查并创建review_replies表
      await createReplyTableIfNotExists()
      
      // 检查评价是否存在
      const reviewResult = await query('SELECT id FROM reviews WHERE id = ?', [id])
      if (reviewResult.length === 0) {
        return res.status(404).json({ success: false, message: '评价不存在' })
      }
      
      // 插入回复记录
      const result = await query(
        'INSERT INTO review_replies (review_id, content, created_at) VALUES (?, ?, NOW())',
        [id, content.trim()]
      )
      
      // 获取完整的回复信息
      const reply = await query(
        'SELECT id, review_id, content, created_at FROM review_replies WHERE id = ?',
        [result.insertId]
      )
      
      // 格式化日期
      if (reply[0]) {
        reply[0].created_at = formatDate(reply[0].created_at)
      }
      
      res.json({ success: true, message: '回复成功', data: { reply: reply[0] } })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  // 获取评价的回复
  async getReply(req, res) {
    try {
      const { id } = req.params
      
      const reply = await query(
        'SELECT id, review_id, content, created_at FROM review_replies WHERE review_id = ? ORDER BY created_at DESC LIMIT 1',
        [id]
      )
      
      res.json({ success: true, data: { reply: reply[0] || null } })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  // 获取商品评价统计
  async getStatsByProduct(req, res) {
    try {
      const { product_id } = req.params
      
      // 获取评价统计
      const statsSql = `
        SELECT 
          COUNT(*) as total_reviews,
          AVG(rating) as avg_rating,
          SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating_5,
          SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as rating_4,
          SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating_3,
          SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as rating_2,
          SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating_1
        FROM reviews 
        WHERE product_id = ? AND status = 1
      `
      const stats = await query(statsSql, [product_id])
      
      const result = stats[0]
      result.avg_rating = result.avg_rating ? parseFloat(result.avg_rating).toFixed(1) : '0.0'
      
      res.json({ success: true, data: result })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  // 获取商品评价汇总列表（只显示未删除的商品）
  async getProductSummary(req, res) {
    try {
      const { page = 1, limit = 10, product_name, include_deleted } = req.query
      
      const pageNum = Math.max(1, parseInt(page) || 1)
      const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10))
      const offset = (pageNum - 1) * limitNum
      
      let sql = `
        SELECT 
          p.id,
          p.name,
          p.image,
          COUNT(r.id) as total_reviews,
          AVG(r.rating) as avg_rating,
          SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) as rating_5,
          SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END) as rating_4,
          SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END) as rating_3,
          SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END) as rating_2,
          SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END) as rating_1
        FROM products p
        LEFT JOIN reviews r ON p.id = r.product_id AND r.status = 1
        WHERE p.deleted_at IS NULL
      `
      let countSql = `
        SELECT COUNT(DISTINCT p.id) as count
        FROM products p
        LEFT JOIN reviews r ON p.id = r.product_id AND r.status = 1
        WHERE p.deleted_at IS NULL
      `
      const params = []
      const countParams = []
      
      // 添加商品名称筛选
      if (product_name) {
        sql += ' AND p.name LIKE ?'
        countSql += ' AND p.name LIKE ?'
        params.push(`%${product_name}%`)
        countParams.push(`%${product_name}%`)
      }
      
      sql += ' GROUP BY p.id, p.name, p.image ORDER BY p.id DESC'
      
      sql += ` LIMIT ${limitNum} OFFSET ${offset}`
      
      const products = await query(sql, params)
      const countResult = await query(countSql, countParams)
      const total = countResult[0].count
      
      // 处理数据
      products.forEach(product => {
        product.avg_rating = product.avg_rating ? parseFloat(product.avg_rating).toFixed(1) : '0.0'
      })
      
      res.json({ 
        success: true, 
        data: { 
          products,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        } 
      })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  // 批量更新商品评价状态
  async batchUpdateStatusByProduct(req, res) {
    try {
      const { product_id } = req.params
      const { status } = req.body
      
      if (status === undefined) {
        return res.status(400).json({ success: false, message: '状态不能为空' })
      }
      
      await query('UPDATE reviews SET status = ? WHERE product_id = ?', [parseInt(status), product_id])
      
      res.json({ success: true, message: '批量更新成功' })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  // 获取所有评价列表（独立于商品，用于后台管理）
  async getAllReviews(req, res) {
    try {
      const { page = 1, limit = 20, status } = req.query
      
      const pageNum = Math.max(1, parseInt(page) || 1)
      const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20))
      const offset = (pageNum - 1) * limitNum
      
      let sql = `
        SELECT 
          r.id,
          r.order_id,
          r.product_id,
          p.name as product_name,
          r.user_name,
          r.rating,
          r.content,
          r.images,
          r.status,
          r.created_at,
          o.order_no,
          o.customer_name
        FROM reviews r
        LEFT JOIN orders o ON r.order_id = o.id
        LEFT JOIN products p ON r.product_id = p.id
        WHERE 1=1 AND p.deleted_at IS NULL
      `
      let countSql = `
        SELECT COUNT(*) as count
        FROM reviews r
        LEFT JOIN orders o ON r.order_id = o.id
        LEFT JOIN products p ON r.product_id = p.id
        WHERE 1=1 AND p.deleted_at IS NULL
      `
      const params = []
      const countParams = []
      
      // 添加筛选条件
      if (status !== undefined && status !== '') {
        sql += ' AND r.status = ?'
        countSql += ' AND r.status = ?'
        params.push(parseInt(status))
        countParams.push(parseInt(status))
      }
      
      sql += ' ORDER BY r.created_at DESC'
      sql += ` LIMIT ${limitNum} OFFSET ${offset}`
      
      const reviews = await query(sql, params)
      const countResult = await query(countSql, countParams)
      const total = countResult[0].count
      
      // 处理数据
      for (const review of reviews) {
        // 解析图片
        if (review.images) {
          try {
            review.images = typeof review.images === 'string' ? JSON.parse(review.images) : review.images
          } catch (e) {
            review.images = []
          }
        } else {
          review.images = []
        }
        
        // 格式化日期
        review.created_at = formatDate(review.created_at)
        review.rating = parseInt(review.rating) || 0
      }
      
      res.json({ 
        success: true, 
        data: { 
          reviews,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
          }
        } 
      })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  }
}

module.exports = reviewController
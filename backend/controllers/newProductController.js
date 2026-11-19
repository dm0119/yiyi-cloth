const { query } = require('../db/connection')
const { formatDate } = require('../utils/dateFormatter')

const newProductController = {
  async getList(req, res) {
    try {
      const sql = `
        SELECT np.*, 
               p.name, 
               p.price, 
               p.image, 
               p.images,
               p.stock,
               p.status as product_status,
               COUNT(oi.id) as sales_count,
               COALESCE(AVG(r.rating), 0) as avg_rating,
               GROUP_CONCAT(c.id) as category_ids, 
               GROUP_CONCAT(c.name) as category_names
        FROM new_products np
        LEFT JOIN products p ON np.product_id = p.id
        LEFT JOIN order_items oi ON p.id = oi.product_id
        LEFT JOIN reviews r ON p.id = r.product_id
        LEFT JOIN product_categories pc ON p.id = pc.product_id
        LEFT JOIN categories c ON pc.category_id = c.id
        WHERE p.status = 1
        GROUP BY np.id
        ORDER BY np.sort_order ASC, np.created_at DESC
      `
      const newProducts = await query(sql)

      newProducts.forEach(np => {
        if (np.category_ids) {
          const ids = np.category_ids.split(',')
          const names = np.category_names.split(',')
          np.categories = ids.map((id, i) => ({ id: parseInt(id), name: names[i] }))
        } else {
          np.categories = []
        }
        delete np.category_ids
        delete np.category_names

        if (np.images) {
          try {
            np.images = typeof np.images === 'string' ? JSON.parse(np.images) : np.images
          } catch (e) {
            np.images = []
          }
        } else {
          np.images = []
        }

        np.created_at = formatDate(np.created_at)
        np.updated_at = formatDate(np.updated_at)
        np.price = parseFloat(np.price) || 0
        np.stock = parseInt(np.stock) || 0
        np.sales_count = parseInt(np.sales_count) || 0
        np.avg_rating = parseFloat(np.avg_rating) || 0
      })

      res.json({ success: true, data: newProducts })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async getAvailableProducts(req, res) {
    try {
      const { keyword } = req.query
      let sql = `
        SELECT p.*, 
               COUNT(oi.id) as sales_count,
               COALESCE(AVG(r.rating), 0) as avg_rating,
               GROUP_CONCAT(c.id) as category_ids, 
               GROUP_CONCAT(c.name) as category_names
        FROM products p
        LEFT JOIN order_items oi ON p.id = oi.product_id
        LEFT JOIN reviews r ON p.id = r.product_id
        LEFT JOIN product_categories pc ON p.id = pc.product_id
        LEFT JOIN categories c ON pc.category_id = c.id
        WHERE p.status = 1
      `
      const params = []

      if (keyword && keyword.trim()) {
        sql += ' AND (p.name LIKE ? OR p.description LIKE ?)'
        const searchTerm = `%${keyword.trim()}%`
        params.push(searchTerm, searchTerm)
      }

      sql += ' GROUP BY p.id ORDER BY p.created_at DESC'
      const products = await query(sql, params)

      products.forEach(p => {
        if (p.category_ids) {
          const ids = p.category_ids.split(',')
          const names = p.category_names.split(',')
          p.categories = ids.map((id, i) => ({ id: parseInt(id), name: names[i] }))
        } else {
          p.categories = []
        }
        delete p.category_ids
        delete p.category_names

        if (p.images) {
          try {
            p.images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images
          } catch (e) {
            p.images = []
          }
        } else {
          p.images = []
        }

        p.created_at = formatDate(p.created_at)
        p.updated_at = formatDate(p.updated_at)
        p.price = parseFloat(p.price) || 0
        p.stock = parseInt(p.stock) || 0
        p.sales_count = parseInt(p.sales_count) || 0
        p.avg_rating = parseFloat(p.avg_rating) || 0
      })

      res.json({ success: true, data: products })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async add(req, res) {
    try {
      const { product_id, sort_order } = req.body

      const [existing] = await query('SELECT id FROM new_products WHERE product_id = ?', [product_id])
      if (existing) {
        return res.status(400).json({ success: false, message: '该商品已在新品推荐中' })
      }

      const sql = `INSERT INTO new_products (product_id, sort_order) VALUES (?, ?)`
      const result = await query(sql, [product_id, sort_order || 0])

      res.json({ success: true, message: '添加成功', data: { id: result.insertId } })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async updateSortOrder(req, res) {
    try {
      const { id } = req.params
      const { sort_order } = req.body

      await query('UPDATE new_products SET sort_order = ? WHERE id = ?', [sort_order, id])
      res.json({ success: true, message: '更新成功' })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params
      await query('DELETE FROM new_products WHERE id = ?', [id])
      res.json({ success: true, message: '删除成功' })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async getForMobile(req, res) {
    try {
      const { sort } = req.query
      let orderBy = 'np.created_at DESC'
      
      if (sort === 'sales') {
        orderBy = 'sales_count DESC, p.created_at DESC'
      } else if (sort === 'price_asc') {
        orderBy = 'p.price ASC, sales_count DESC, p.created_at DESC'
      } else if (sort === 'price_desc') {
        orderBy = 'p.price DESC, sales_count DESC, p.created_at DESC'
      } else if (sort === 'newest') {
        orderBy = 'p.created_at DESC'
      }
      
      const sql = `
        SELECT np.product_id,
               p.name, 
               p.price, 
               p.image, 
               p.images,
               p.description,
               p.stock,
               COUNT(oi.id) as sales_count,
               COALESCE(AVG(r.rating), 0) as avg_rating
        FROM new_products np
        LEFT JOIN products p ON np.product_id = p.id
        LEFT JOIN order_items oi ON p.id = oi.product_id
        LEFT JOIN reviews r ON p.id = r.product_id
        WHERE p.status = 1
        GROUP BY np.product_id
        ORDER BY ${orderBy}
      `
      const newProducts = await query(sql)

      newProducts.forEach(np => {
        if (np.images) {
          try {
            np.images = typeof np.images === 'string' ? JSON.parse(np.images) : np.images
          } catch (e) {
            np.images = []
          }
        } else {
          np.images = []
        }

        np.price = parseFloat(np.price) || 0
        np.stock = parseInt(np.stock) || 0
        np.sales_count = parseInt(np.sales_count) || 0
        np.avg_rating = parseFloat(np.avg_rating) || 0
      })

      res.json({ success: true, data: newProducts })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  }
}

module.exports = newProductController

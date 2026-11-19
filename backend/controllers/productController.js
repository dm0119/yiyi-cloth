const { query } = require('../db/connection')
const { formatDate } = require('../utils/dateFormatter')

// 辅助函数：获取商品的 SKU 列表
async function getProductSkus(productId, shopId = null) {
  // 如果提供了 shopId，先验证商品是否属于该店铺
  if (shopId) {
    const [product] = await query('SELECT id, shop_id FROM products WHERE id = ? AND shop_id = ?', [productId, shopId])
    if (!product) {
      return [] // 商品不存在或不属于该店铺
    }
  }
  
  // 查询 SKU 列表
  const skus = await query(
    'SELECT id, color, size, stock, sku_code, status, image FROM product_skus WHERE product_id = ? ORDER BY color, size',
    [productId]
  )
  return skus
}

// 辅助函数：计算总库存（从 SKU 汇总）
async function calculateTotalStock(productId) {
  const result = await query(
    'SELECT SUM(stock) as total_stock FROM product_skus WHERE product_id = ? AND status = 1',
    [productId]
  )
  return result[0]?.total_stock || 0
}

const productController = {
  async getList(req, res) {
    try {
      const { category_id, sort, include_children } = req.query
      
      let sql = `
        SELECT p.*, 
               s.id as shop_id,
               s.name as shop_name,
               s.is_brand as shop_is_brand,
               s.status as shop_status,
               COUNT(CASE 
                 WHEN o.status IN (5, 4, 2, 3) 
                 THEN 1 
                 ELSE NULL 
               END) as sales_count,
               COALESCE(AVG(r.rating), 0) as avg_rating,
               GROUP_CONCAT(DISTINCT c.id) as category_ids, 
               GROUP_CONCAT(DISTINCT c.name) as category_names
        FROM products p
        INNER JOIN shops s ON p.shop_id = s.id
        LEFT JOIN product_categories pc ON p.id = pc.product_id
        LEFT JOIN categories c ON pc.category_id = c.id
        LEFT JOIN order_items oi ON p.id = oi.product_id
        LEFT JOIN orders o ON oi.order_id = o.id
          AND o.status NOT IN ('cancelled', 'refunded', 'closed')
        LEFT JOIN reviews r ON p.id = r.product_id
        WHERE p.status = 1 
          AND p.deleted = 0
          AND s.status = 'active'
      `
      const params = []
      
      if (category_id && category_id !== '0') {
        if (include_children === 'true') {
          // 递归获取所有层级的子分类
          async function getAllDescendantIds(parentId) {
            const ids = [parentId]
            const children = await query(
              `SELECT id FROM categories WHERE parent_id = ?`, 
              [parentId]
            )
            for (const child of children) {
              const descendants = await getAllDescendantIds(child.id)
              ids.push(...descendants)
            }
            return ids
          }
          
          const allCategoryIds = await getAllDescendantIds(parseInt(category_id))
          if (allCategoryIds.length > 0) {
            const placeholders = allCategoryIds.map(() => '?').join(',')
            sql += ` AND EXISTS (
              SELECT 1 FROM product_categories pc2 
              WHERE pc2.product_id = p.id 
              AND pc2.category_id IN (${placeholders})
            )`
            params.push(...allCategoryIds)
          }
        } else {
          // 使用 EXISTS 子查询，确保商品直接属于指定分类
          sql += ` AND EXISTS (
            SELECT 1 FROM product_categories pc2 
            WHERE pc2.product_id = p.id 
            AND pc2.category_id = ?
          )`
          params.push(parseInt(category_id))
        }
      }
      
      sql += ' GROUP BY p.id'
      
      switch (sort) {
        case 'sales':
          sql += ' ORDER BY sales_count DESC, p.created_at DESC'
          break
        case 'price_asc':
          sql += ' ORDER BY p.price ASC, p.created_at DESC'
          break
        case 'price_desc':
          sql += ' ORDER BY p.price DESC, p.created_at DESC'
          break
        default:
          sql += ' ORDER BY p.created_at DESC'
      }
      
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
        
        // 格式化日期时间
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

  // 获取单个商品的 SKU 列表
  async getSkus(req, res) {
    try {
      const { id } = req.params
      const shopId = req.user?.shop_id || req.user?.shopId
      
      // 如果是商家，验证商品是否属于该店铺
      const skus = await getProductSkus(id, shopId)
      res.json({ success: true, data: skus })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  // 创建商品 SKU
  async createSku(req, res) {
    try {
      const { product_id, color, size, stock, sku_code, status = 1 } = req.body
      
      if (!product_id || !color || !size) {
        return res.status(400).json({ success: false, message: '商品 ID、颜色和尺码为必填项' })
      }
      
      const sql = `INSERT INTO product_skus (product_id, color, size, stock, sku_code, status) 
                   VALUES (?, ?, ?, ?, ?, ?)`
      const result = await query(sql, [product_id, color, size, stock || 0, sku_code || null, status])
      
      res.json({ success: true, message: '创建成功', data: { id: result.insertId } })
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        res.status(400).json({ success: false, message: '该颜色尺码组合已存在' })
      } else {
        res.status(500).json({ success: false, message: error.message })
      }
    }
  },

  // 更新商品 SKU
  async updateSku(req, res) {
    try {
      const { id } = req.params
      const { color, size, stock, sku_code, status } = req.body
      const currentShopId = req.user?.shop_id || req.user?.shopId
      
      if (!currentShopId) {
        return res.status(403).json({ success: false, message: '未识别商家身份，无法更新SKU' })
      }
      
      // 检查SKU所属的商品是否属于当前商家
      const skuCheck = await query(
        `SELECT ps.id, p.shop_id 
         FROM product_skus ps 
         JOIN products p ON ps.product_id = p.id 
         WHERE ps.id = ? AND p.deleted = 0`,
        [id]
      )
      
      if (skuCheck.length === 0) {
        return res.status(404).json({ success: false, message: 'SKU不存在' })
      }
      
      if (skuCheck[0].shop_id !== currentShopId) {
        return res.status(403).json({ success: false, message: '无权更新其他商家的SKU' })
      }
      
      const sql = `UPDATE product_skus SET color=?, size=?, stock=?, sku_code=?, status=? WHERE shop_id = ? AND id=?`
      await query(sql, [color, size, stock || 0, sku_code || null, status || 1, id])
      
      res.json({ success: true, message: '更新成功' })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  // 批量更新 SKU 库存
  async batchUpdateSkus(req, res) {
    try {
      const { product_id, skus } = req.body
      const currentShopId = req.user?.shop_id || req.user?.shopId
      
      if (!currentShopId) {
        return res.status(403).json({ success: false, message: '未识别商家身份，无法批量更新SKU' })
      }
      
      if (!product_id || !Array.isArray(skus)) {
        return res.status(400).json({ success: false, message: '参数错误' })
      }
      
      // 检查商品是否属于当前商家
      const productCheck = await query(
        'SELECT id, shop_id FROM products WHERE id = ? AND deleted = 0',
        [product_id]
      )
      
      if (productCheck.length === 0) {
        return res.status(404).json({ success: false, message: '商品不存在' })
      }
      
      if (productCheck[0].shop_id !== currentShopId) {
        return res.status(403).json({ success: false, message: '无权更新其他商家的商品SKU' })
      }
      
      // 使用事务确保批量更新的原子性
      const { withTransaction } = require('../db/connection')
      await withTransaction(async (connection) => {
        for (const sku of skus) {
          if (sku.id) {
            // 检查SKU是否属于指定商品
            const skuCheck = await connection.query(
              'SELECT id FROM product_skus WHERE shop_id = ? AND id = ? AND product_id = ?',
              [sku.id, product_id]
            )
            
            if (skuCheck.length > 0) {
              await connection.query(
                'UPDATE product_skus SET stock=?, status=? WHERE shop_id = ? AND id=? AND product_id=?',
                [sku.stock, sku.status || 1, sku.id, product_id]
              )
            }
          } else if (sku.color && sku.size) {
            await connection.query(
              'INSERT INTO product_skus (product_id, color, size, stock, status) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE stock=VALUES(stock), status=VALUES(status)',
              [product_id, sku.color, sku.size, sku.stock, sku.status || 1]
            )
          }
        }
      })
      
      res.json({ success: true, message: '批量更新成功' })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  // 删除 SKU
  async deleteSku(req, res) {
    try {
      const { id } = req.params
      await query('DELETE FROM product_skus WHERE id = ?', [id])
      res.json({ success: true, message: '删除成功' })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params
      const sql = `
        SELECT p.*, 
               s.id as shop_id, 
               s.name as shop_name,
               s.is_brand as shop_is_brand,
               s.status as shop_status,
               GROUP_CONCAT(c.id) as category_ids, GROUP_CONCAT(c.name) as category_names
        FROM products p
        LEFT JOIN shops s ON p.shop_id = s.id
        LEFT JOIN product_categories pc ON p.id = pc.product_id
        LEFT JOIN categories c ON pc.category_id = c.id
        WHERE p.id = ?
        GROUP BY p.id
      `
      const products = await query(sql, [id])
      if (products.length === 0) {
        return res.status(404).json({ success: false, message: '商品不存在' })
      }
      
      const product = products[0]
      
      // 保存店铺信息
      const shopId = product.shop_id
      const shopName = product.shop_name
      const shopStatus = product.shop_status
      
      if (product.category_ids) {
        const ids = product.category_ids.split(',')
        const names = product.category_names.split(',')
        product.categories = ids.map((cid, i) => ({ id: parseInt(cid), name: names[i] }))
      } else {
        product.categories = []
      }
      delete product.category_ids
      delete product.category_names
      
      if (product.images) {
              try {
                product.images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images
              } catch (e) {
                product.images = []
              }
            } else {
              product.images = []
            }
            
            // 获取 SKU 信息
            const skus = await getProductSkus(id, shopId)
            product.skus = skus
            
            // 如果没有 SKU，使用旧的 colors 和 sizes 字段生成临时 SKU 数据
            if (skus.length === 0 && product.colors && product.sizes) {
              const colors = product.colors.split(',').map(c => c.trim()).filter(c => c)
              const sizes = product.sizes.split(',').map(s => s.trim()).filter(s => s)
              product.skus = []
              for (const color of colors) {
                for (const size of sizes) {
                  product.skus.push({
                    color,
                    size,
                    stock: Math.floor(product.stock / (colors.length * sizes.length)) || 0
                  })
                }
              }
            }
            
            // 格式化日期时间
            product.created_at = formatDate(product.created_at)
            product.updated_at = formatDate(product.updated_at)
            
            product.price = parseFloat(product.price) || 0
            product.stock = parseInt(product.stock) || 0
            
            // 确保店铺信息存在
            if (shopId) {
              product.shop_id = shopId
              product.shop_name = shopName || '未知店铺'
              product.shop_status = shopStatus
            }
            
            res.json({ success: true, data: product })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  async getAll(req, res) {
    try {
      const sql = `
        SELECT p.*, 
               COUNT(oi.id) as sales_count,
               COALESCE(AVG(r.rating), 0) as avg_rating,
               GROUP_CONCAT(DISTINCT c.id) as category_ids, 
               GROUP_CONCAT(DISTINCT c.name) as category_names,
               s.name as shop_name
        FROM products p
        LEFT JOIN product_categories pc ON p.id = pc.product_id
        LEFT JOIN categories c ON pc.category_id = c.id
        LEFT JOIN order_items oi ON p.id = oi.product_id
        LEFT JOIN reviews r ON p.id = r.product_id
        LEFT JOIN shops s ON p.shop_id = s.id
        WHERE p.status = 1 AND p.deleted = 0
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `
      const products = await query(sql)
      
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
        
        // 格式化日期时间
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
  
  async getByCategory(req, res) {
    try {
      const { category_id, sort, include_children } = req.query
      
      let sql = `
        SELECT p.*, 
               COUNT(oi.id) as sales_count,
               COALESCE(AVG(r.rating), 0) as avg_rating,
               GROUP_CONCAT(DISTINCT c.id) as category_ids, 
               GROUP_CONCAT(DISTINCT c.name) as category_names
        FROM products p
        LEFT JOIN product_categories pc ON p.id = pc.product_id
        LEFT JOIN categories c ON pc.category_id = c.id
        LEFT JOIN order_items oi ON p.id = oi.product_id
        LEFT JOIN reviews r ON p.id = r.product_id
        WHERE p.status = 1 AND p.deleted = 0
      `
      const params = []
      
      if (category_id && category_id !== '0') {
        if (include_children === 'true') {
          // 递归获取所有层级的子分类
          async function getAllDescendantIds(parentId) {
            const ids = [parentId]
            const children = await query(
              `SELECT id FROM categories WHERE parent_id = ?`, 
              [parentId]
            )
            for (const child of children) {
              const descendants = await getAllDescendantIds(child.id)
              ids.push(...descendants)
            }
            return ids
          }
          
          const allCategoryIds = await getAllDescendantIds(parseInt(category_id))
          if (allCategoryIds.length > 0) {
            const placeholders = allCategoryIds.map(() => '?').join(',')
            sql += ` AND EXISTS (
              SELECT 1 FROM product_categories pc2 
              WHERE pc2.product_id = p.id 
              AND pc2.category_id IN (${placeholders})
            )`
            params.push(...allCategoryIds)
          }
        } else {
          // 使用 EXISTS 子查询，确保商品直接属于指定分类
          sql += ` AND EXISTS (
            SELECT 1 FROM product_categories pc2 
            WHERE pc2.product_id = p.id 
            AND pc2.category_id = ?
          )`
          params.push(parseInt(category_id))
        }
      }
      
      sql += ' GROUP BY p.id'
      
      switch (sort) {
        case 'sales':
          sql += ' ORDER BY sales_count DESC, p.created_at DESC'
          break
        case 'price_asc':
          sql += ' ORDER BY p.price ASC, p.created_at DESC'
          break
        case 'price_desc':
          sql += ' ORDER BY p.price DESC, p.created_at DESC'
          break
        default:
          sql += ' ORDER BY p.created_at DESC'
      }
      
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
        
        // 格式化日期时间
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
  
  async create(req, res) {
    try {
      // 打印接收到的 SKU 数据，检查 image 字段
      console.log('接收到的 SKU 数据:', req.body.skus)
      
      const { name, price, image, images, description, stock, sizes, colors, category_ids, fit_type, status, skus, shop_id, tags, size_chart, size_recommendations } = req.body
      
      // 验证库存不能为负数
      if (stock < 0) {
        return res.status(400).json({ success: false, message: '库存不能为负数' })
      }
      
      // 验证必须选择分类
      if (!category_ids || !Array.isArray(category_ids) || category_ids.length === 0) {
        return res.status(400).json({ success: false, message: '请选择商品分类' })
      }
      
      // 处理标签
      const tagsJson = tags && Array.isArray(tags) ? JSON.stringify(tags) : null
      
      // 处理尺码表
      const sizeChartJson = size_chart && typeof size_chart === 'object' ? JSON.stringify(size_chart) : null
      
      const sql = `INSERT INTO products (name, price, image, images, description, stock, sizes, colors, fit_type, status, shop_id, tags, size_chart, size_recommendations) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      const imagesJson = images && Array.isArray(images) ? JSON.stringify(images) : null
      const result = await query(sql, [name, price, image, imagesJson, description, stock, sizes, colors, fit_type || 'regular', status || 1, shop_id || null, tagsJson, sizeChartJson, size_recommendations || null])
      
      const productId = result.insertId
      
      if (category_ids && Array.isArray(category_ids) && category_ids.length > 0) {
        // 去重处理
        const uniqueCategoryIds = [...new Set(category_ids)]
        
        // 先验证分类ID是否存在，过滤掉无效的分类
        const categoryIdPlaceholders = uniqueCategoryIds.map(() => '?').join(',')
        const validCategoryIds = await query(
          `SELECT id FROM categories WHERE id IN (${categoryIdPlaceholders})`,
          uniqueCategoryIds
        )
        const validIds = validCategoryIds.map(c => c.id)
        
        // 只插入有效的分类 ID
        for (const catId of validIds) {
          await query(
            'INSERT IGNORE INTO product_categories (product_id, category_id) VALUES (?, ?)',
            [productId, catId]
          )
        }
      }
      
      // 如果提供了 SKU 数据，插入到 product_skus 表
      if (skus && Array.isArray(skus) && skus.length > 0) {
        for (const sku of skus) {
          if (sku.color && sku.size) {
            await query(
              'INSERT INTO product_skus (product_id, color, size, stock, sku_code, status, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [productId, sku.color, sku.size, sku.stock || 0, sku.sku_code || null, sku.status ?? 1, sku.image || null]
            )
          }
        }
      }
      
      res.json({ success: true, message: '创建成功', data: { id: productId } })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  async update(req, res) {
    try {
      const { id } = req.params
      const currentShopId = req.user?.shop_id || req.user?.shopId
      
      if (!currentShopId) {
        return res.status(403).json({ success: false, message: '未识别商家身份，无法更新商品' })
      }
      
      // 打印接收到的 SKU 数据，检查 image 字段
      console.log('接收到的 SKU 数据:', req.body.skus)
      
      const { name, price, image, images, description, stock, sizes, colors, category_ids, fit_type, status, skus, tags, size_chart, size_recommendations } = req.body
      
      // 验证库存不能为负数
      if (stock < 0) {
        return res.status(400).json({ success: false, message: '库存不能为负数' })
      }
      
      // 验证必须选择分类
      if (!category_ids || !Array.isArray(category_ids) || category_ids.length === 0) {
        return res.status(400).json({ success: false, message: '请选择商品分类' })
      }
      
      // 先检查商品是否存在且属于当前商家
      const productCheck = await query('SELECT id, shop_id FROM products WHERE id = ? AND deleted = 0', [id])
      if (productCheck.length === 0) {
        return res.status(404).json({ success: false, message: '商品不存在' })
      }
      
      const product = productCheck[0]
      if (product.shop_id !== currentShopId) {
        return res.status(403).json({ success: false, message: '无权修改其他商家的商品' })
      }
      
      // 处理标签
      const tagsJson = tags && Array.isArray(tags) ? JSON.stringify(tags) : null
      
      // 处理尺码表
      const sizeChartJson = size_chart && typeof size_chart === 'object' ? JSON.stringify(size_chart) : null
      
      const imagesJson = images && Array.isArray(images) ? JSON.stringify(images) : null
      const sql = `UPDATE products SET name=?, price=?, image=?, images=?, description=?, stock=?, sizes=?, colors=?, fit_type=?, status=?, tags=?, size_chart=?, size_recommendations=? 
                   WHERE id=? AND shop_id=?`
      await query(sql, [name, price, image, imagesJson, description, stock, sizes, colors, fit_type || 'regular', status, tagsJson, sizeChartJson, size_recommendations || null, id, currentShopId])
      
      await query('DELETE FROM product_categories WHERE product_id = ?', [id])
      
      if (category_ids && Array.isArray(category_ids) && category_ids.length > 0) {
        // 先验证分类ID是否存在，过滤掉无效的分类
        const categoryIdPlaceholders = category_ids.map(() => '?').join(',')
        const validCategoryIds = await query(
          `SELECT id FROM categories WHERE id IN (${categoryIdPlaceholders})`,
          category_ids
        )
        const validIds = validCategoryIds.map(c => c.id)
        
        // 只插入有效的分类ID
        for (const catId of validIds) {
          try {
            await query(
              'INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)',
              [id, catId]
            )
          } catch (err) {
            // 忽略重复插入错误
            if (err.code !== 'ER_DUP_ENTRY') {
              console.error('插入商品分类失败:', err)
            }
          }
        }
      }
      
      // 如果提供了 SKU 数据，更新 product_skus 表
      if (skus && Array.isArray(skus) && skus.length > 0) {
        // 先获取现有 SKU 列表
        const existingSkus = await query('SELECT id, color, size FROM product_skus WHERE product_id = ?', [id])
        const existingSkuMap = new Map(existingSkus.map(sku => [`${sku.color}-${sku.size}`, sku.id]))
        
        // 用于跟踪已处理的 SKU
        const processedSkus = new Set()
        
        // 更新或插入 SKU
        for (const sku of skus) {
          if (sku.color && sku.size) {
            const skuKey = `${sku.color}-${sku.size}`
            if (existingSkuMap.has(skuKey)) {
              // 更新现有 SKU
              const skuId = existingSkuMap.get(skuKey)
              await query(
                'UPDATE product_skus SET stock=?, sku_code=?, status=?, image=? WHERE id=?',
                [sku.stock || 0, sku.sku_code || null, sku.status ?? 1, sku.image || null, skuId]
              )
            } else {
              // 插入新 SKU
              await query(
                'INSERT INTO product_skus (product_id, color, size, stock, sku_code, status, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [id, sku.color, sku.size, sku.stock || 0, sku.sku_code || null, sku.status ?? 1, sku.image || null]
              )
            }
            processedSkus.add(skuKey)
          }
        }
        
        // 删除不再存在的 SKU
        for (const [skuKey, skuId] of existingSkuMap.entries()) {
          if (!processedSkus.has(skuKey)) {
            await query('DELETE FROM product_skus WHERE id = ?', [skuId])
          }
        }
      }
      
      res.json({ success: true, message: '更新成功' })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  async delete(req, res) {
    try {
      const { id } = req.params
      const currentShopId = req.user?.shop_id || req.user?.shopId
      
      if (!currentShopId) {
        return res.status(403).json({ success: false, message: '未识别商家身份，无法删除商品' })
      }
      
      // 先检查商品是否存在且属于当前商家
      const productCheck = await query('SELECT id, name, image, price, shop_id FROM products WHERE id = ? AND deleted = 0', [id])
      if (productCheck.length === 0) {
        return res.status(404).json({ success: false, message: '商品不存在' })
      }
      
      const product = productCheck[0]
      if (product.shop_id !== currentShopId) {
        return res.status(403).json({ success: false, message: '无权删除其他商家的商品' })
      }
      
      // 使用事务确保操作的原子性
      const { withTransaction } = require('../db/connection')
      await withTransaction(async (connection) => {
        // 1. 先保存商品快照到评价表（如果该商品有评价）
        if (product.id) {
          // 更新该商品的评价，保存商品快照信息
          await connection.query(`
            UPDATE reviews 
            SET product_name = ?, 
                product_snapshot = ?, 
                product_deleted = 1
            WHERE product_id = ? AND (product_name IS NULL OR product_snapshot IS NULL)
          `, [
            product.name,
            JSON.stringify({
              id: product.id,
              name: product.name,
              image: product.image,
              price: product.price,
              deleted_at: new Date()
            }),
            id
          ])
        }
        
        // 2. 软删除商品：更新 deleted 和 deleted_at 字段
        await connection.query('UPDATE products SET deleted = 1, deleted_at = NOW() WHERE id = ? AND shop_id = ?', [id, currentShopId])
        
        // 3. 更新相关SKU的状态为禁用
        await connection.query('UPDATE product_skus SET status = 0 WHERE product_id = ?', [id])
      })
      
      res.json({ success: true, message: '删除成功' })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  // 批量删除商品
  async batchDelete(req, res) {
    try {
      const { ids } = req.body
      const currentShopId = req.user?.shop_id || req.user?.shopId
      
      if (!currentShopId) {
        return res.status(403).json({ success: false, message: '未识别商家身份，无法批量删除商品' })
      }
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, message: '请选择要删除的商品' })
      }
      
      // 检查所有商品是否都属于当前商家
      const placeholders = ids.map(() => '?').join(',')
      const products = await query(
        `SELECT id, name, image, price, shop_id FROM products WHERE id IN (${placeholders}) AND deleted = 0`,
        ids
      )
      
      // 验证所有权
      const unauthorizedProducts = products.filter(p => p.shop_id !== currentShopId)
      if (unauthorizedProducts.length > 0) {
        return res.status(403).json({ 
          success: false, 
          message: `无权删除其他商家的商品，涉及商品ID: ${unauthorizedProducts.map(p => p.id).join(', ')}` 
        })
      }
      
      // 1. 保存商品快照到评价表
      for (const product of products) {
        await query(`
          UPDATE reviews 
          SET product_name = ?, 
              product_snapshot = ?, 
              product_deleted = 1
          WHERE product_id = ? AND (product_name IS NULL OR product_snapshot IS NULL)
        `, [
          product.name,
          JSON.stringify({
            id: product.id,
            name: product.name,
            image: product.image,
            price: product.price,
            deleted_at: new Date()
          }),
          product.id
        ])
      }
      
      // 2. 软删除商品：更新 deleted 和 deleted_at 字段，确保只能删除自己商家的商品
      await query(
        `UPDATE products SET deleted = 1, deleted_at = NOW() WHERE id IN (${placeholders}) AND shop_id = ?`,
        [...ids, currentShopId]
      )
      
      res.json({ success: true, message: `成功删除 ${ids.length} 个商品` })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async search(req, res) {
    try {
      console.log('搜索 API 被调用，keyword:', req.query.keyword)
      const { keyword } = req.query
      let sql = `
        SELECT p.*, 
               COALESCE(AVG(r.rating), 0) as rating,
               GROUP_CONCAT(c.id) as category_ids, 
               GROUP_CONCAT(c.name) as category_names
        FROM products p
        LEFT JOIN product_categories pc ON p.id = pc.product_id
        LEFT JOIN categories c ON pc.category_id = c.id
        LEFT JOIN reviews r ON p.id = r.product_id
        WHERE p.status = 1 AND p.deleted = 0
      `
      const params = []
      
      if (keyword && keyword.trim()) {
        sql += ' AND (p.name LIKE ? OR p.description LIKE ?)'
        const searchTerm = `%${keyword.trim()}%`
        params.push(searchTerm, searchTerm)
      }
      
      sql += ' GROUP BY p.id'
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
        }
      })
      
      res.json({ success: true, data: products })
    } catch (error) {
      console.error('搜索错误:', error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  // 获取系统预设标签
  async getSystemTags(req, res) {
    try {
      const systemTags = {
        '版型': ['宽松', '修身', '直筒', 'A 字', '茧型', 'H 型'],
        '功能': ['遮肚子', '遮手臂', '遮胯', '显瘦', '显高', '遮肉', '百搭'],
        '适用体型': ['苹果型', '梨型', 'H 型', '沙漏型', '大码通用', '微胖'],
        '面料': ['高弹力', '透气', '垂感好', '不起球', '亲肤', '吸汗', '速干'],
        '设计': ['V 领', '高腰', '收腰', '泡泡袖', 'A 字裙摆', '圆领', '方领', '一字肩'],
        '风格': ['通勤', '休闲', '运动', '甜美', '简约', '复古', '韩版', '欧美'],
        '季节': ['春季', '夏季', '秋季', '冬季', '四季通用']
      }
      
      res.json({ success: true, data: systemTags })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  // 按标签筛选商品
  async getByTag(req, res) {
    try {
      // 路径参数 tag + 查询参数 shop_id, page, limit
      const tag = req.params.tag
      const { shop_id, page = 1, limit = 20 } = req.query
      
      if (!tag) {
        return res.status(400).json({ success: false, message: '标签不能为空' })
      }
      
      const offset = (parseInt(page) - 1) * parseInt(limit)
      
      let sql = `
        SELECT p.*, 
               s.id as shop_id,
               s.name as shop_name,
               s.is_brand as shop_is_brand,
               COALESCE(AVG(r.rating), 0) as rating,
               GROUP_CONCAT(DISTINCT c.name) as category_names
        FROM products p
        INNER JOIN shops s ON p.shop_id = s.id
        LEFT JOIN product_categories pc ON p.id = pc.product_id
        LEFT JOIN categories c ON pc.category_id = c.id
        LEFT JOIN reviews r ON p.id = r.product_id
        WHERE p.status = 1 
          AND p.deleted = 0
          AND s.status = 'active'
          AND JSON_CONTAINS(p.tags, ?)
      `
      
      const params = [JSON.stringify(tag)]
      
      if (shop_id) {
        sql += ' AND p.shop_id = ?'
        params.push(shop_id)
      }
      
      sql += ' GROUP BY p.id ORDER BY p.created_at DESC LIMIT ? OFFSET ?'
      params.push(parseInt(limit), parseInt(offset))
      
      const products = await query(sql, params)
      
      // 处理标签和分类数据
      products.forEach(p => {
        if (p.tags) {
          try {
            p.tags = typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags
          } catch (e) {
            p.tags = []
          }
        }
        
        if (p.category_names) {
          p.categories = p.category_names.split(',').map(name => ({ name }))
          delete p.category_names
        } else {
          p.categories = []
        }
      })
      
      // 获取总数
      const countSql = `
        SELECT COUNT(DISTINCT p.id) as total
        FROM products p
        INNER JOIN shops s ON p.shop_id = s.id
        WHERE p.status = 1 
          AND p.deleted = 0
          AND s.status = 'active'
          AND JSON_CONTAINS(p.tags, ?)
      `
      
      const countParams = [JSON.stringify(tag)]
      if (shop_id) {
        countSql += ' AND p.shop_id = ?'
        countParams.push(shop_id)
      }
      
      const [{ total }] = await query(countSql, countParams)
      
      res.json({ 
        success: true, 
        data: products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(total),
          totalPages: Math.ceil(total / limit)
        }
      })
    } catch (error) {
      console.error('按标签筛选错误:', error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  // 获取热门标签统计
  async getPopularTags(req, res) {
    try {
      const { shop_id } = req.query
      
      let sql = `
        SELECT p.tags, COUNT(*) as usage_count
        FROM products p
        INNER JOIN shops s ON p.shop_id = s.id
        WHERE p.status = 1 
          AND p.deleted = 0
          AND s.status = 'active'
          AND p.tags IS NOT NULL
      `
      
      const params = []
      if (shop_id) {
        sql += ' AND p.shop_id = ?'
        params.push(shop_id)
      }
      
      sql += ' GROUP BY p.tags ORDER BY usage_count DESC LIMIT 100'
      
      const results = await query(sql, params)
      
      // 统计每个标签的使用次数
      const tagCount = {}
      results.forEach(product => {
        if (product.tags) {
          try {
            const tags = typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags
            tags.forEach(tag => {
              tagCount[tag] = (tagCount[tag] || 0) + 1
            })
          } catch (e) {
            // 忽略解析错误
          }
        }
      })
      
      // 转换为数组并排序
      const popularTags = Object.entries(tagCount)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20) // 返回前 20 个热门标签
      
      res.json({ success: true, data: popularTags })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async search(req, res) {
    try {
      const { keyword, category_id, shop_id, page = 1, limit = 20 } = req.query
      const offset = (parseInt(page) - 1) * parseInt(limit)
      
      let sql = `
        SELECT 
          p.id,
          p.name,
          p.description,
          p.price,
          p.image,
          p.images,
          p.stock,
          p.status,
          p.created_at,
          p.updated_at,
          p.tags,
          p.size_recommendations,
          p.shop_id,
          s.id as shop_id,
          s.name as shop_name,
          s.is_brand as shop_is_brand
        FROM products p
        LEFT JOIN shops s ON p.shop_id = s.id
        WHERE p.status = 1
      `
      
      const params = []
      
      if (keyword) {
        sql += ' AND (p.name LIKE ? OR p.description LIKE ?)'
        params.push(`%${keyword}%`, `%${keyword}%`)
      }
      
      if (category_id) {
        sql += ' AND EXISTS ('
        sql += '  SELECT 1 FROM product_categories pc WHERE pc.product_id = p.id AND pc.category_id = ?'
        sql += ')'
        params.push(parseInt(category_id))
      }
      
      if (shop_id) {
        sql += ' AND p.shop_id = ?'
        params.push(shop_id)
      }
      
      sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?'
      params.push(parseInt(limit), offset)
      
      const products = await query(sql, params)
      
      // 格式化返回数据
      products.forEach(p => {
        if (p.images) {
          try {
            p.images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images
          } catch (e) {
            p.images = []
          }
        } else {
          p.images = []
        }
        
        // 格式化日期时间
        p.created_at = formatDate(p.created_at)
        p.updated_at = formatDate(p.updated_at)
        
        p.price = parseFloat(p.price) || 0
        p.stock = parseInt(p.stock) || 0
        p.rating = parseFloat(p.rating) || 0
      })
      
      console.log('搜索结果数量:', products.length)
      res.json({ success: true, data: products })
    } catch (error) {
      console.error('搜索错误:', error)
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  async getSalesStats(req, res) {
    try {
      const { limit = 10 } = req.query
      const validLimit = parseInt(limit) || 10
      
      const salesSql = `
        SELECT 
          p.id, 
          p.name, 
          p.image, 
          COUNT(oi.id) as sales_count,
          COALESCE(SUM(oi.quantity * oi.price), 0) as sales_amount
        FROM products p
        LEFT JOIN order_items oi ON p.id = oi.product_id
        LEFT JOIN orders o ON oi.order_id = o.id
        WHERE p.status = 1
        GROUP BY p.id
        ORDER BY sales_count DESC
        LIMIT ${validLimit}
      `
      const salesStats = await query(salesSql)
      
      salesStats.forEach(product => {
        product.sales_count = parseInt(product.sales_count) || 0
        product.sales_amount = parseFloat(product.sales_amount) || 0
      })
      
      res.json({
        success: true,
        data: salesStats
      })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  // 移动端：获取热门商品（按销量排序）
  async getHotProducts(req, res) {
    try {
      const { sort } = req.query
      
      let sortSql = 'sales_count DESC, p.created_at DESC'
      if (sort === 'price_asc') {
        sortSql = 'p.price ASC'
      } else if (sort === 'price_desc') {
        sortSql = 'p.price DESC'
      }
      
      const products = await query(
        `SELECT p.id, p.name, p.price, p.image, p.images,
                COALESCE(SUM(oi.quantity), 0) as sales_count,
                COALESCE(AVG(r.rating), 0) as avg_rating
         FROM products p
         LEFT JOIN order_items oi ON p.id = oi.product_id
         LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN (2, 3, 4)
         LEFT JOIN reviews r ON p.id = r.product_id
         WHERE p.status = 1 AND p.deleted = 0
         GROUP BY p.id, p.name, p.price, p.image, p.images
         ORDER BY ${sortSql}
         LIMIT 20`
      )
      
      products.forEach(p => {
        p.price = parseFloat(p.price) || 0
        p.sales_count = parseInt(p.sales_count) || 0
        p.avg_rating = parseFloat(p.avg_rating) || 0
        if (p.images) {
          try {
            p.images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images
          } catch (e) {
            p.images = []
          }
        } else {
          p.images = []
        }
      })
      
      res.json({ success: true, data: products })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  // 移动端：获取新品（按创建时间排序）
  async getNewProducts(req, res) {
    try {
      const { sort } = req.query
      
      let sortSql = 'p.created_at DESC'
      if (sort === 'price_asc') {
        sortSql = 'p.price ASC'
      } else if (sort === 'price_desc') {
        sortSql = 'p.price DESC'
      }
      
      const products = await query(
        `SELECT p.id, p.name, p.price, p.image, p.images, p.created_at,
                COALESCE(AVG(r.rating), 0) as avg_rating
         FROM products p
         LEFT JOIN reviews r ON p.id = r.product_id
         WHERE p.status = 1 AND p.deleted = 0
         GROUP BY p.id, p.name, p.price, p.image, p.images, p.created_at
         ORDER BY ${sortSql}
         LIMIT 20`
      )
      
      products.forEach(p => {
        p.price = parseFloat(p.price) || 0
        p.avg_rating = parseFloat(p.avg_rating) || 0
        if (p.images) {
          try {
            p.images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images
          } catch (e) {
            p.images = []
          }
        } else {
          p.images = []
        }
      })
      
      res.json({ success: true, data: products })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  }
}

module.exports = productController

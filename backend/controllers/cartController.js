const { query, withTransaction } = require('../db/connection')
const { createValidationError, createNotFoundError, createBusinessError, createInternalError } = require('../utils/errorHandler')

const cartController = {
  /**
   * 获取用户购物车列表
   */
  async getList(req, res, next) {
    try {
      const user_id = req.user.id

      const [items] = await query(
        `SELECT ci.*, p.name as product_name, p.image, p.price, p.stock, p.deleted, s.name as shop_name
         FROM cart_items ci
         LEFT JOIN products p ON ci.product_id = p.id
         LEFT JOIN shops s ON p.shop_id = s.id
         WHERE ci.user_id = ?
         ORDER BY ci.created_at DESC`,
        [user_id]
      )

      // 过滤掉已删除商品
      const validItems = items.filter(item => !item.deleted)

      res.json({
        success: true,
        data: validItems
      })
    } catch (error) {
      next(createInternalError('获取购物车失败', { error: error.message }))
    }
  },

  /**
   * 添加商品到购物车
   */
  async add(req, res, next) {
    try {
      const user_id = req.user.id
      const { product_id, quantity, size, color } = req.body

      if (!product_id || !quantity) {
        return next(createValidationError('缺少必填参数', {
          missingFields: [...(!product_id ? ['product_id'] : []), ...(!quantity ? ['quantity'] : [])]
        }))
      }

      if (quantity <= 0) {
        return next(createValidationError('数量必须大于0', { quantity }))
      }

      // 检查商品是否存在
      const productId = Number(product_id)
      if (isNaN(productId) || productId <= 0) {
        return next(createValidationError('商品ID无效', { product_id }))
      }
      
      const [product] = await query('SELECT * FROM products WHERE id = ?', [productId])
      if (!product) {
        return next(createNotFoundError('商品不存在', { product_id: productId }))
      }

      if (product.deleted !== 0 || product.status !== 1) {
        return next(createBusinessError('商品已下架', { product_id }))
      }

      if (product.stock < quantity) {
        return next(createBusinessError('商品库存不足', {
          product_id,
          available_stock: product.stock,
          required_quantity: quantity
        }))
      }

      // 检查购物车中是否已有相同商品（相同商品ID、规格）
      const [existing] = await query(
        `SELECT * FROM cart_items
         WHERE user_id = ? AND product_id = ? AND size = ? AND color = ?`,
        [user_id, product_id, size || '', color || '']
      )

      if (existing) {
        // 更新数量
        const newQuantity = existing.quantity + quantity
        if (newQuantity > product.stock) {
          return next(createBusinessError('商品库存不足', {
            product_id,
            available_stock: product.stock,
            required_quantity: newQuantity
          }))
        }

        await query(
          `UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?`,
          [newQuantity, existing.id]
        )

        res.json({
          success: true,
          message: '购物车商品数量已更新',
          data: {
            cart_id: existing.id,
            quantity: newQuantity
          }
        })
      } else {
        // 添加新商品到购物车
        const [result] = await query(
          `INSERT INTO cart_items (user_id, product_id, quantity, size, color, created_at)
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [user_id, product_id, quantity, size || '', color || '']
        )

        res.json({
          success: true,
          message: '商品已添加到购物车',
          data: {
            cart_id: result.insertId,
            quantity: quantity
          }
        })
      }
    } catch (error) {
      next(createInternalError('添加购物车失败', { error: error.message }))
    }
  },

  /**
   * 更新购物车商品数量
   */
  async update(req, res, next) {
    try {
      const { id } = req.params
      const { quantity } = req.body
      const user_id = req.user.id

      if (!quantity || quantity <= 0) {
        return next(createValidationError('数量必须大于0', { quantity }))
      }

      // 查询购物车商品
      const [item] = await query(
        `SELECT ci.*, p.stock
         FROM cart_items ci
         LEFT JOIN products p ON ci.product_id = p.id
         WHERE ci.id = ? AND ci.user_id = ?`,
        [id, user_id]
      )

      if (!item) {
        return next(createNotFoundError('购物车商品不存在', { cartId: id }))
      }

      if (item.stock < quantity) {
        return next(createBusinessError('商品库存不足', {
          product_id: item.product_id,
          available_stock: item.stock,
          required_quantity: quantity
        }))
      }

      // 更新数量
      await query(
        `UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?`,
        [quantity, id]
      )

      res.json({
        success: true,
        message: '购物车商品数量已更新'
      })
    } catch (error) {
      next(createInternalError('更新购物车失败', { error: error.message }))
    }
  },

  /**
   * 删除购物车商品
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params
      const user_id = req.user.id

      const result = await query(
        'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
        [id, user_id]
      )

      if (result.affectedRows === 0) {
        return next(createNotFoundError('购物车商品不存在或无权删除', { cartId: id }))
      }

      res.json({
        success: true,
        message: '购物车商品已删除'
      })
    } catch (error) {
      next(createInternalError('删除购物车商品失败', { error: error.message }))
    }
  },

  /**
   * 清空购物车
   */
  async clear(req, res, next) {
    try {
      const user_id = req.user.id

      await query('DELETE FROM cart_items WHERE user_id = ?', [user_id])

      res.json({
        success: true,
        message: '购物车已清空'
      })
    } catch (error) {
      next(createInternalError('清空购物车失败', { error: error.message }))
    }
  },

  /**
   * 批量删除购物车商品
   */
  async batchDelete(req, res, next) {
    try {
      const { ids } = req.body
      const user_id = req.user.id

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return next(createValidationError('请选择要删除的商品', { ids }))
      }

      // 验证所有ID都是有效数字
      const validIds = ids.filter(id => {
        const numId = Number(id);
        return !isNaN(numId) && numId > 0 && Number.isInteger(numId);
      });
      
      if (validIds.length === 0) {
        return next(createValidationError('没有有效的商品ID', { ids }))
      }

      // 使用参数化查询防止SQL注入
      const placeholders = validIds.map(() => '?').join(',')
      const sql = `DELETE FROM cart_items WHERE id IN (${placeholders}) AND user_id = ?`
      const params = [...validIds, user_id]
      
      const result = await query(sql, params)

      if (result.affectedRows === 0) {
        return next(createNotFoundError('购物车商品不存在或无权删除', { cartIds: validIds }))
      }

      res.json({
        success: true,
        message: '购物车商品已删除',
        data: {
          deleted_count: result.affectedRows
        }
      })
    } catch (error) {
      next(createInternalError('批量删除购物车商品失败', { error: error.message }))
    }
  }
}

module.exports = cartController

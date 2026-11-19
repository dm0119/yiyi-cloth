const { query, withTransaction } = require('../db/connection')
const { formatDate } = require('../utils/dateFormatter')
const { createValidationError, createNotFoundError, createBusinessError, createInternalError } = require('../utils/errorHandler')
const InventoryService = require('../services/inventoryService')

// 售后状态
const AfterSaleStatus = {
  PENDING: 1,        // 待处理
  APPROVED: 2,       // 已同意(待填写退货物流)
  RETURNING: 3,      // 退货中
  WAITING_REFUND: 4, // 待退款
  COMPLETED: 5,      // 已完成
  REJECTED: 6        // 已拒绝
}

// 售后类型
const AfterSaleType = {
  REFUND: 'refund',                // 急速退款（待发货）
  RETURN_REFUND: 'return_refund',  // 退货退款
  EXCHANGE: 'exchange'             // 换货
}

// 订单状态
const OrderStatus = {
  PENDING: 1,
  PAID: 2,
  SHIPPED: 3,
  AWAITING_RECEIPT: 4,
  COMPLETED: 5,
  CANCELLED: 6,
  AFTER_SALE_PENDING: 7,
  RETURNING: 8,
  WAITING_REFUND: 9,
  REFUNDED: 10,
  AFTER_SALE_REJECTED: 11
}

const afterSaleController = {
  // ==================== 买家端接口 ====================

  /**
   * 买家申请售后
   * POST /mobile/orders/:id/after-sale
   */
  async apply(req, res, next) {
    try {
      const { id: orderId } = req.params
      const userId = req.user.id
      const { type, reason, description, images, new_color, new_size } = req.body

      // 参数校验
      if (!type) {
        return next(createValidationError('售后类型不能为空', {}))
      }
      if (type !== AfterSaleType.EXCHANGE && !reason) {
        return next(createValidationError('售后原因不能为空', {}))
      }

      if (!['refund', 'return_refund', 'exchange'].includes(type)) {
        return next(createValidationError('无效的售后类型', { type }))
      }

      // 查询订单
      const [order] = await query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, userId])
      if (!order) {
        return next(createNotFoundError('订单不存在', { orderId }))
      }

      // 根据售后类型校验订单状态
      if (type === AfterSaleType.REFUND) {
        // 急速退款：仅限待发货状态
        if (order.status !== OrderStatus.PAID) {
          return next(createBusinessError('急速退款仅限待发货状态的订单', { currentStatus: order.status }))
        }
      } else {
        // 退货退款/换货：已发货、待收货、已完成(7天内)
        if (![OrderStatus.SHIPPED, OrderStatus.AWAITING_RECEIPT, OrderStatus.COMPLETED].includes(order.status)) {
          return next(createBusinessError('当前订单状态不支持该售后类型', { currentStatus: order.status }))
        }
        // 已完成订单7天内可申请
        if (order.status === OrderStatus.COMPLETED) {
          const completedAt = order.completed_at || order.updated_at
          const daysDiff = (Date.now() - new Date(completedAt).getTime()) / (1000 * 60 * 60 * 24)
          if (daysDiff > 7) {
            return next(createBusinessError('已完成订单超过7天不可申请售后', {}))
          }
        }
      }

      // 检查是否已有进行中的售后
      const [existingAfterSale] = await query(
        'SELECT id FROM order_returns WHERE order_id = ? AND status IN (1, 2, 3, 4)',
        [orderId]
      )
      if (existingAfterSale) {
        return next(createBusinessError('该订单已有进行中的售后申请', {}))
      }

      // 换货必须填写新规格
      if (type === AfterSaleType.EXCHANGE && !new_color && !new_size) {
        return next(createValidationError('换货请选择新的颜色或尺码', {}))
      }

      // 换货时验证新规格是否有效
      if (type === AfterSaleType.EXCHANGE) {
        // 获取订单商品信息
        const [orderItem] = await query(
          'SELECT product_id FROM order_items WHERE order_id = ? LIMIT 1',
          [orderId]
        )
        
        if (!orderItem || !orderItem.product_id) {
          return next(createBusinessError('无法获取商品信息', {}))
        }

        // 查询该商品的所有SKU
        const skus = await query(
          'SELECT id, color, size, stock, status FROM product_skus WHERE product_id = ?',
          [orderItem.product_id]
        )

        // 验证买家选择的规格是否存在且有库存
        const targetSku = skus.find(sku => 
          sku.color === new_color && sku.size === new_size
        )

        if (!targetSku) {
          return next(createBusinessError('选择的规格不存在，请从商品规格中选择', {}))
        }

        if (targetSku.status !== 1) {
          return next(createBusinessError('选择的规格已下架', {}))
        }

        if (targetSku.stock <= 0) {
          return next(createBusinessError('选择的规格库存不足', {}))
        }
      }

      const result = await withTransaction(async (connection) => {
        // 计算退款金额
        const refundAmount = type === AfterSaleType.EXCHANGE ? 0 : order.total_amount

        // 创建售后记录
        const [afterSaleResult] = await connection.execute(
          `INSERT INTO order_returns (order_id, user_id, type, reason, description, images, status, refund_amount, new_color, new_size, shop_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId, userId, type, reason, description || null,
            images ? JSON.stringify(images) : null,
            type === AfterSaleType.REFUND ? AfterSaleStatus.COMPLETED : AfterSaleStatus.PENDING,
            refundAmount, new_color || null, new_size || null,
            order.shop_id || null
          ]
        )
        const afterSaleId = afterSaleResult.insertId

        if (type === AfterSaleType.REFUND) {
          // 急速退款：自动处理
          // 1. 更新订单状态为已退款
          await connection.execute(
            'UPDATE orders SET status = ?, after_sale_type = ?, after_sale_id = ?, updated_at = NOW() WHERE id = ?',
            [OrderStatus.REFUNDED, type, afterSaleId, orderId]
          )

          // 2. 恢复库存
          const [orderItems] = await connection.query(
            'SELECT product_id, quantity, color, size FROM order_items WHERE order_id = ?',
            [orderId]
          )
          for (const item of orderItems) {
            if (item.product_id) {
              await InventoryService.safeRestoreStock(
                connection, item.product_id, item.quantity, item.color || '', item.size || ''
              )
            }
          }

          // 3. 恢复优惠券（保留 order_id 和 used_at 作为历史记录，仅恢复状态为未使用）
          await connection.execute(
            `UPDATE user_coupons SET status = 'unused' WHERE order_id = ? AND status = 'used'`,
            [orderId]
          )

          // 获取支付方式名称用于退款提示
          const paymentMethodNames = {
            alipay: '支付宝',
            wechat: '微信支付',
            credit_card: '信用卡',
            debit_card: '借记卡',
            cash: '现金',
            bank_transfer: '银行转账'
          }
          const paymentMethodName = paymentMethodNames[order.payment_method] || order.payment_method || '原支付方式'

          // 4. 创建退款交易记录（包含支付方式）
          await connection.execute(
            `INSERT INTO transaction_records (user_id, order_id, order_no, type, amount, payment_method, status, description, transaction_time)
               VALUES (?, ?, ?, 'refund', ?, ?, 'success', ?, NOW())`,
            [userId, orderId, order.order_no, refundAmount, order.payment_method, `订单${order.order_no}急速退款（${paymentMethodName}）`]
          )

          // 5. 更新售后记录处理时间
          await connection.execute(
            'UPDATE order_returns SET processed_at = NOW() WHERE id = ?',
            [afterSaleId]
          )
          
          return { afterSaleId, type, paymentMethod: order.payment_method, paymentMethodName }
        } else {
          // 退货退款/换货：更新订单状态为售后申请中
          await connection.execute(
            'UPDATE orders SET status = ?, after_sale_type = ?, after_sale_id = ?, updated_at = NOW() WHERE id = ?',
            [OrderStatus.AFTER_SALE_PENDING, type, afterSaleId, orderId]
          )
        }

        return { afterSaleId, type }
      })

      const paymentMethodNames = {
        alipay: '支付宝',
        wechat: '微信支付',
        credit_card: '信用卡',
        debit_card: '借记卡',
        cash: '现金',
        bank_transfer: '银行转账'
      }
      const message = type === AfterSaleType.REFUND
        ? `急速退款成功，款项将原路退回-${paymentMethodNames[result.paymentMethodName] || result.paymentMethod || '原支付方式'}，1-3个工作日内到账`
        : '售后申请已提交，请等待商家处理'
      res.json({ success: true, message, data: result })
    } catch (error) {
      next(createInternalError('申请售后失败', { error: error.message }))
    }
  },

  /**
   * 买家取消售后申请
   * POST /mobile/orders/:id/after-sale/cancel
   */
  async cancel(req, res, next) {
    try {
      const { id: orderId } = req.params
      const userId = req.user.id

      const [order] = await query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, userId])
      if (!order) {
        return next(createNotFoundError('订单不存在', { orderId }))
      }

      if (order.status !== OrderStatus.AFTER_SALE_PENDING) {
        return next(createBusinessError('当前订单状态无法取消售后', { currentStatus: order.status }))
      }

      const [afterSale] = await query(
        'SELECT * FROM order_returns WHERE order_id = ? AND status = ? ORDER BY id DESC LIMIT 1',
        [orderId, AfterSaleStatus.PENDING]
      )
      if (!afterSale) {
        return next(createBusinessError('没有可取消的售后申请', {}))
      }

      await withTransaction(async (connection) => {
        // 更新售后记录为已拒绝（买家主动取消）
        await connection.execute(
          'UPDATE order_returns SET status = ?, reject_reason = ?, processed_at = NOW() WHERE id = ?',
          [AfterSaleStatus.REJECTED, '买家主动取消', afterSale.id]
        )

        // 恢复订单状态：根据原来的售后类型恢复到之前的正常状态
        // 售后申请中(7)的订单，之前应该是已发货(3)/待收货(4)/已完成(5)
        // 通过原始状态推断：如果有物流信息且未确认收货，回到待收货(4)；如果已完成，回到已完成(5)
        let restoreStatus
        if (order.after_sale_type === AfterSaleType.REFUND) {
          restoreStatus = OrderStatus.PAID
        } else if (order.tracking_number && !order.completed_at) {
          restoreStatus = OrderStatus.AWAITING_RECEIPT
        } else if (order.completed_at) {
          restoreStatus = OrderStatus.COMPLETED
        } else if (order.tracking_number) {
          restoreStatus = OrderStatus.SHIPPED
        } else {
          restoreStatus = OrderStatus.PAID
        }

        await connection.execute(
          'UPDATE orders SET status = ?, after_sale_type = NULL, after_sale_id = NULL, updated_at = NOW() WHERE id = ?',
          [restoreStatus, orderId]
        )
      })

      res.json({ success: true, message: '售后申请已取消' })
    } catch (error) {
      next(createInternalError('取消售后失败', { error: error.message }))
    }
  },

  /**
   * 买家填写退货物流
   * POST /mobile/orders/:id/after-sale/return-logistics
   */
  async fillReturnLogistics(req, res, next) {
    try {
      const { id: orderId } = req.params
      const userId = req.user.id
      const { logistics_company, tracking_number } = req.body

      if (!logistics_company || !tracking_number) {
        return next(createValidationError('物流公司和快递单号不能为空', {}))
      }

      const [order] = await query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, userId])
      if (!order) {
        return next(createNotFoundError('订单不存在', { orderId }))
      }

      const [afterSale] = await query(
        'SELECT * FROM order_returns WHERE order_id = ? AND status = ? ORDER BY id DESC LIMIT 1',
        [orderId, AfterSaleStatus.APPROVED]
      )
      if (!afterSale) {
        return next(createBusinessError('没有待填写退货物流的售后记录', {}))
      }

      await withTransaction(async (connection) => {
        // 更新售后记录
        await connection.execute(
          `UPDATE order_returns SET status = ?, return_logistics_company = ?, return_tracking_number = ?, updated_at = NOW() WHERE id = ?`,
          [AfterSaleStatus.RETURNING, logistics_company, tracking_number, afterSale.id]
        )

        // 更新订单状态为退货中
        await connection.execute(
          'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
          [OrderStatus.RETURNING, orderId]
        )
      })

      res.json({ success: true, message: '退货物流信息已提交' })
    } catch (error) {
      next(createInternalError('填写退货物流失败', { error: error.message }))
    }
  },

  /**
   * 买家的售后记录列表
   * GET /mobile/after-sales
   */
  async getUserAfterSales(req, res, next) {
    try {
      const userId = req.user.id
      const { status } = req.query

      let sql = `SELECT r.*, o.order_no, o.total_amount, o.status as order_status
                 FROM order_returns r
                 LEFT JOIN orders o ON r.order_id = o.id
                 WHERE r.user_id = ?`
      let params = [userId]

      if (status !== undefined && status !== '') {
        sql += ' AND r.status = ?'
        params.push(status)
      }

      sql += ' ORDER BY r.created_at DESC'

      const records = await query(sql, params)
      const formattedRecords = records.map(record => ({
        ...record,
        images: typeof record.images === 'string' ? JSON.parse(record.images) : record.images,
        created_at: formatDate(record.created_at),
        updated_at: formatDate(record.updated_at),
        processed_at: formatDate(record.processed_at)
      }))

      res.json({ success: true, data: formattedRecords })
    } catch (error) {
      next(createInternalError('获取售后记录失败', { error: error.message }))
    }
  },

  /**
   * 售后详情（买家/商家/管理员通用）
   * GET /after-sales/:id 或 /mobile/after-sales/:id
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params
      const user = req.user

      const [afterSale] = await query(
        `SELECT r.*, o.order_no, o.total_amount, o.original_amount, o.status as order_status,
                o.customer_name, o.phone, o.address, o.logistics_company, o.tracking_number,
                o.shop_id, s.return_address
         FROM order_returns r
         LEFT JOIN orders o ON r.order_id = o.id
         LEFT JOIN shops s ON o.shop_id = s.id
         WHERE r.id = ?`,
        [id]
      )

      if (!afterSale) {
        return next(createNotFoundError('售后记录不存在', { id }))
      }

      // 权限校验
      const isAdmin = user.role === '超级管理员' || (user.permissions && user.permissions.includes('order:view'))
      if (!isAdmin && afterSale.user_id !== user.id && afterSale.shop_id !== user.shopId) {
        return next(createValidationError('无权查看该售后记录', {}))
      }

      // 获取订单商品
      const items = await query('SELECT * FROM order_items WHERE order_id = ?', [afterSale.order_id])

      res.json({
        success: true,
        data: {
          ...afterSale,
          images: typeof afterSale.images === 'string' ? JSON.parse(afterSale.images) : afterSale.images,
          items,
          created_at: formatDate(afterSale.created_at),
          updated_at: formatDate(afterSale.updated_at),
          processed_at: formatDate(afterSale.processed_at)
        }
      })
    } catch (error) {
      next(createInternalError('获取售后详情失败', { error: error.message }))
    }
  },

  // ==================== 商家/管理员端接口 ====================

  /**
   * 售后列表（商家/管理员）
   * GET /after-sales
   */
  async getList(req, res, next) {
    try {
      const { status, type, page = 1, limit = 20 } = req.query
      const user = req.user
      const offset = (parseInt(page) - 1) * parseInt(limit)

      const isAdmin = user.role === '超级管理员' || (user.permissions && user.permissions.includes('order:view'))

      let whereConditions = []
      let params = []

      if (!isAdmin && user.shopId) {
        whereConditions.push('r.shop_id = ?')
        params.push(user.shopId)
      }

      if (status !== undefined && status !== '') {
        whereConditions.push('r.status = ?')
        params.push(parseInt(status))
      }

      if (type) {
        whereConditions.push('r.type = ?')
        params.push(type)
      }

      const whereClause = whereConditions.length > 0 ? ' WHERE ' + whereConditions.join(' AND ') : ''

      // 查询总数
      const countResult = await query(`SELECT COUNT(*) as total FROM order_returns r${whereClause}`, params)
      const total = countResult[0].total

      // 查询列表
      const sql = `SELECT r.*, o.order_no, o.total_amount, o.status as order_status
                   FROM order_returns r
                   LEFT JOIN orders o ON r.order_id = o.id
                   ${whereClause}
                   ORDER BY r.created_at DESC
                   LIMIT ? OFFSET ?`
      const records = await query(sql, [...params, parseInt(limit), offset])

      const formattedRecords = records.map(record => ({
        ...record,
        images: typeof record.images === 'string' ? JSON.parse(record.images) : record.images,
        created_at: formatDate(record.created_at),
        updated_at: formatDate(record.updated_at),
        processed_at: formatDate(record.processed_at),
        reshipped_at: formatDate(record.reshipped_at)
      }))

      res.json({
        success: true,
        data: {
          list: formattedRecords,
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          total_pages: Math.ceil(total / parseInt(limit))
        }
      })
    } catch (error) {
      next(createInternalError('获取售后列表失败', { error: error.message }))
    }
  },

  /**
   * 商家同意售后
   * POST /orders/:id/after-sale/approve
   */
  async approve(req, res, next) {
    try {
      const { id: orderId } = req.params
      const user = req.user

      const [order] = await query('SELECT * FROM orders WHERE id = ?', [orderId])
      if (!order) {
        return next(createNotFoundError('订单不存在', { orderId }))
      }

      // 权限校验
      const isAdmin = user.role === '超级管理员' || (user.permissions && user.permissions.includes('order:manage'))
      if (!isAdmin && order.shop_id !== user.shopId) {
        return next(createValidationError('无权操作该订单', {}))
      }

      if (order.status !== OrderStatus.AFTER_SALE_PENDING) {
        return next(createBusinessError('当前订单状态无法同意售后', { currentStatus: order.status }))
      }

      const [afterSale] = await query(
        'SELECT * FROM order_returns WHERE order_id = ? AND status = ? ORDER BY id DESC LIMIT 1',
        [orderId, AfterSaleStatus.PENDING]
      )
      if (!afterSale) {
        return next(createBusinessError('没有待处理的售后申请', {}))
      }

      await withTransaction(async (connection) => {
        if (afterSale.type === AfterSaleType.REFUND) {
          // 急速退款不应该走到这里，但以防万一
          return
        }

        if (afterSale.type === AfterSaleType.EXCHANGE || afterSale.type === AfterSaleType.RETURN_REFUND) {
          // 更新售后记录为已同意（待买家填写退货物流）
          await connection.execute(
            'UPDATE order_returns SET status = ?, admin_id = ?, processed_at = NOW() WHERE id = ?',
            [AfterSaleStatus.APPROVED, user.id, afterSale.id]
          )
          // 订单状态保持为售后申请中(7)，等买家填写物流后变为退货中(8)
        }
      })

      res.json({ success: true, message: '已同意售后申请' })
    } catch (error) {
      next(createInternalError('同意售后失败', { error: error.message }))
    }
  },

  /**
   * 商家拒绝售后
   * POST /orders/:id/after-sale/reject
   */
  async reject(req, res, next) {
    try {
      const { id: orderId } = req.params
      const { reject_reason } = req.body
      const user = req.user

      if (!reject_reason) {
        return next(createValidationError('拒绝原因不能为空', {}))
      }

      const [order] = await query('SELECT * FROM orders WHERE id = ?', [orderId])
      if (!order) {
        return next(createNotFoundError('订单不存在', { orderId }))
      }

      const isAdmin = user.role === '超级管理员' || (user.permissions && user.permissions.includes('order:manage'))
      if (!isAdmin && order.shop_id !== user.shopId) {
        return next(createValidationError('无权操作该订单', {}))
      }

      if (order.status !== OrderStatus.AFTER_SALE_PENDING) {
        return next(createBusinessError('当前订单状态无法拒绝售后', { currentStatus: order.status }))
      }

      const [afterSale] = await query(
        'SELECT * FROM order_returns WHERE order_id = ? AND status = ? ORDER BY id DESC LIMIT 1',
        [orderId, AfterSaleStatus.PENDING]
      )
      if (!afterSale) {
        return next(createBusinessError('没有待处理的售后申请', {}))
      }

      await withTransaction(async (connection) => {
        // 更新售后记录
        await connection.execute(
          'UPDATE order_returns SET status = ?, reject_reason = ?, admin_id = ?, processed_at = NOW() WHERE id = ?',
          [AfterSaleStatus.REJECTED, reject_reason, user.id, afterSale.id]
        )

        // 恢复订单状态
        let restoreStatus
        if (order.tracking_number && order.completed_at) {
          restoreStatus = OrderStatus.COMPLETED
        } else if (order.tracking_number) {
          restoreStatus = OrderStatus.AWAITING_RECEIPT
        } else {
          restoreStatus = OrderStatus.PAID
        }

        await connection.execute(
          'UPDATE orders SET status = ?, after_sale_type = NULL, after_sale_id = NULL, updated_at = NOW() WHERE id = ?',
          [restoreStatus, orderId]
        )
      })

      res.json({ success: true, message: '已拒绝售后申请' })
    } catch (error) {
      next(createInternalError('拒绝售后失败', { error: error.message }))
    }
  },

  /**
   * 商家确认收到退货
   * POST /orders/:id/after-sale/confirm-received
   */
  async confirmReceived(req, res, next) {
    try {
      const { id: orderId } = req.params
      const user = req.user

      const [order] = await query('SELECT * FROM orders WHERE id = ?', [orderId])
      if (!order) {
        return next(createNotFoundError('订单不存在', { orderId }))
      }

      const isAdmin = user.role === '超级管理员' || (user.permissions && user.permissions.includes('order:manage'))
      if (!isAdmin && order.shop_id !== user.shopId) {
        return next(createValidationError('无权操作该订单', {}))
      }

      const [afterSale] = await query(
        'SELECT * FROM order_returns WHERE order_id = ? AND status = ? ORDER BY id DESC LIMIT 1',
        [orderId, AfterSaleStatus.RETURNING]
      )
      if (!afterSale) {
        return next(createBusinessError('没有退货中的售后记录', {}))
      }

      await withTransaction(async (connection) => {
        if (afterSale.type === AfterSaleType.RETURN_REFUND) {
          // 退货退款：变为待退款
          await connection.execute(
            'UPDATE order_returns SET status = ? WHERE id = ?',
            [AfterSaleStatus.WAITING_REFUND, afterSale.id]
          )
          await connection.execute(
            'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
            [OrderStatus.WAITING_REFUND, orderId]
          )
        } else if (afterSale.type === AfterSaleType.EXCHANGE) {
          // 换货：商家需要重新发货，保持退货中状态，等待商家填写新物流
          await connection.execute(
            'UPDATE order_returns SET status = ? WHERE id = ?',
            [AfterSaleStatus.WAITING_REFUND, afterSale.id]  // 复用此状态表示"待重新发货"
          )
          // 订单状态保持退货中(8)，等待商家重新发货
        }
      })

      res.json({ success: true, message: afterSale.type === AfterSaleType.EXCHANGE ? '已确认收货，请重新发货' : '已确认收到退货' })
    } catch (error) {
      next(createInternalError('确认收货失败', { error: error.message }))
    }
  },

  /**
   * 商家确认退款
   * POST /orders/:id/after-sale/confirm-refund
   */
  async confirmRefund(req, res, next) {
    try {
      const { id: orderId } = req.params
      const user = req.user

      const [order] = await query('SELECT * FROM orders WHERE id = ?', [orderId])
      if (!order) {
        return next(createNotFoundError('订单不存在', { orderId }))
      }

      const isAdmin = user.role === '超级管理员' || (user.permissions && user.permissions.includes('order:manage'))
      if (!isAdmin && order.shop_id !== user.shopId) {
        return next(createValidationError('无权操作该订单', {}))
      }

      if (order.status !== OrderStatus.WAITING_REFUND) {
        return next(createBusinessError('当前订单状态无法确认退款', { currentStatus: order.status }))
      }

      const [afterSale] = await query(
        'SELECT * FROM order_returns WHERE order_id = ? AND status = ? ORDER BY id DESC LIMIT 1',
        [orderId, AfterSaleStatus.WAITING_REFUND]
      )
      if (!afterSale) {
        return next(createBusinessError('没有待退款的售后记录', {}))
      }

      await withTransaction(async (connection) => {
        // 更新售后记录为已完成
        await connection.execute(
          'UPDATE order_returns SET status = ?, processed_at = NOW() WHERE id = ?',
          [AfterSaleStatus.COMPLETED, afterSale.id]
        )

        // 更新订单状态为已退款
        await connection.execute(
          'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
          [OrderStatus.REFUNDED, orderId]
        )

        // 恢复库存
        const [orderItems] = await connection.query(
          'SELECT product_id, quantity, color, size FROM order_items WHERE order_id = ?',
          [orderId]
        )
        for (const item of orderItems) {
          if (item.product_id) {
            await InventoryService.safeRestoreStock(
              connection, item.product_id, item.quantity, item.color || '', item.size || ''
            )
          }
        }

        // 恢复优惠券（保留 order_id 和 used_at 作为历史记录，仅恢复状态为未使用）
        await connection.execute(
          `UPDATE user_coupons SET status = 'unused' WHERE order_id = ? AND status = 'used'`,
          [orderId]
        )

        // 创建退款交易记录
        await connection.execute(
          `INSERT INTO transaction_records (user_id, order_id, order_no, type, amount, status, description, transaction_time)
           VALUES (?, ?, ?, 'refund', ?, 'success', ?, NOW())`,
          [order.user_id, orderId, order.order_no, afterSale.refund_amount, `订单${order.order_no}退款`]
        )
      })

      res.json({ success: true, message: '退款成功' })
    } catch (error) {
      next(createInternalError('确认退款失败', { error: error.message }))
    }
  },

  /**
   * 商家换货重新发货
   * POST /orders/:id/after-sale/reship
   */
  async reship(req, res, next) {
    try {
      const { id: orderId } = req.params
      const { logistics_company, tracking_number } = req.body
      const user = req.user

      if (!logistics_company || !tracking_number) {
        return next(createValidationError('物流公司和快递单号不能为空', {}))
      }

      const [order] = await query('SELECT * FROM orders WHERE id = ?', [orderId])
      if (!order) {
        return next(createNotFoundError('订单不存在', { orderId }))
      }

      const isAdmin = user.role === '超级管理员' || (user.permissions && user.permissions.includes('order:manage'))
      if (!isAdmin && order.shop_id !== user.shopId) {
        return next(createValidationError('无权操作该订单', {}))
      }

      const [afterSale] = await query(
        'SELECT * FROM order_returns WHERE order_id = ? AND type = ? AND status = ? ORDER BY id DESC LIMIT 1',
        [orderId, AfterSaleType.EXCHANGE, AfterSaleStatus.WAITING_REFUND]
      )
      if (!afterSale) {
        return next(createBusinessError('没有待重新发货的换货记录', {}))
      }

      await withTransaction(async (connection) => {
        // 更新售后记录为已完成，并保存重新发货物流信息
        await connection.execute(
          `UPDATE order_returns SET status = ?, reship_logistics_company = ?, reship_tracking_number = ?, reshipped_at = NOW(), processed_at = NOW() WHERE id = ?`,
          [AfterSaleStatus.COMPLETED, logistics_company, tracking_number, afterSale.id]
        )

        // 更新订单物流信息和状态（换货发货后回到已发货状态）
        await connection.execute(
          'UPDATE orders SET status = ?, logistics_company = ?, tracking_number = ?, shipped_at = NOW(), after_sale_type = NULL, after_sale_id = NULL, updated_at = NOW() WHERE id = ?',
          [OrderStatus.SHIPPED, logistics_company, tracking_number, orderId]
        )
      })

      res.json({ success: true, message: '换货发货成功' })
    } catch (error) {
      next(createInternalError('换货发货失败', { error: error.message }))
    }
  }
}

module.exports = afterSaleController

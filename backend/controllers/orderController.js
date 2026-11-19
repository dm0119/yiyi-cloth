const { query, withTransaction } = require('../db/connection')
const { formatDate } = require('../utils/dateFormatter')
const { createValidationError, createNotFoundError, createBusinessError, createInternalError } = require('../utils/errorHandler')
const InventoryService = require('../services/inventoryService')
const InputValidator = require('../utils/inputValidator')

let sequenceCounter = 0

const OrderStatus = {
  PENDING: 1,
  PAID: 2,
  SHIPPED: 3,
  AWAITING_RECEIPT: 4,
  COMPLETED: 5
}

const orderCreateValidationSchema = {
  body: {
    customer_name: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 50
    },
    phone: {
      type: 'string',
      required: true,
      pattern: /^1[3-9]\d{9}$/,
      patternMessage: '手机号格式不正确'
    },
    address: {
      type: 'string',
      required: true,
      minLength: 10,
      maxLength: 200
    },
    items: {
      type: 'array',
      required: true,
      minLength: 1,
      itemSchema: {
        product_id: { type: 'number', required: true, positive: true, integer: true },
        product_name: { type: 'string', required: true },
        price: { type: 'number', required: true, positive: true },
        quantity: { type: 'number', required: true, positive: true, integer: true },
        color: { type: 'string', required: false },
        size: { type: 'string', required: false }
      }
    },
    coupon_id: {
      type: 'number',
      required: false,
      positive: true,
      integer: true
    }
  }
}

const validateOrderCreate = InputValidator.createValidationMiddleware(orderCreateValidationSchema)

Object.assign(OrderStatus, {
  CANCELLED: 6,
  PENDING_RETURN: 7,
  RETURNING: 8,
  RETURN_RECEIVED: 9,
  REFUNDED: 10,
  RETURN_REJECTED: 11
})

function generateOrderNo() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
  return `${year}${month}${day}${hour}${minute}${second}${random}`
}

/**
 * 检查优惠券是否适用于某个商品
 * @param {Object} coupon - 优惠券配置
 * @param {Object} item - 商品项（包含 product_id, price, quantity, shop_id）
 * @returns {boolean} 是否适用
 */
function isCouponApplicableToItem(coupon, item) {
  if (!coupon || !coupon.scope) return false
  
  // 全场通用券
  if (coupon.scope === 'all') {
    return true
  }
  
  // 店铺全场券，检查是否同一店铺
  if (coupon.scope === 'shop_all') {
    return coupon.shop_id === item.shop_id
  }
  
  // 特定商品券，需要查询 coupon_products 表
  // 这里简化处理，假设 item 已经包含了 product_id
  if (coupon.scope === 'specific_product') {
    // 如果优惠券配置中包含了 productIds（需要调用方传入）
    if (coupon.productIds && Array.isArray(coupon.productIds)) {
      return coupon.productIds.includes(item.product_id)
    }
    // 否则默认适用（实际应该在调用前查询）
    return true
  }
  
  // 其他范围暂不支持
  return false
}

async function useCouponService(connection, user_id, coupon_id, order_id) {
  try {
    await connection.execute(
      'UPDATE user_coupons SET status = ?, order_id = ?, used_at = NOW() WHERE user_id = ? AND coupon_id = ?',
      ['used', order_id, user_id, coupon_id]
    )
  } catch (error) {
    throw new Error(`优惠券核销失败：${error.message}`)
  }
}

const orderController = {
  async create(req, res, next) {
    try {
      const user = req.user
      if (!user) {
        return next({ status: 401, message: '用户未登录' })
      }

      const isAdmin = user.role === '超级管理员' || (user.permissions && user.permissions.includes('order:manage'))
      const isMerchant = user.role === '商家' || (user.permissions && user.permissions.includes('product:manage'))
      
      // 检查买家是否已完成实名认证（商家和管理员不需要）
      if (!isAdmin && !isMerchant) {
        const [userInfo] = await query('SELECT real_name_status FROM users WHERE id = ?', [user.id])
        if (userInfo && userInfo.real_name_status !== 'approved') {
          const statusText = {
            'none': '未提交实名认证',
            'pending': '实名认证正在审核中',
            'rejected': '实名认证未通过'
          }
          return next({
            status: 403,
            message: '您需要先完成实名认证才能下单',
            code: 'REAL_NAME_REQUIRED',
            details: {
              current_status: userInfo.real_name_status,
              message: statusText[userInfo.real_name_status] || '请先完成实名认证'
            }
          })
        }
      }

      // 只有商家管理订单时才需要 shop_id 验证
      // 普通用户（买家）创建订单不需要 shop_id
      if (!isAdmin && isMerchant) {
        if (!user.shopId) {
          return next({ status: 403, message: '用户没有关联的店铺，无权操作' })
        }

        if (req.query && typeof req.query === 'object') {
          req.query.shop_id = user.shopId
        }

        if (req.body && typeof req.body === 'object') {
          req.body.shop_id = user.shopId
        }
      }

      if (!req.body) return next(createValidationError('请求体不能为空', {}))
      const { customer_name, phone, address, items } = req.body
      const user_id = req.user.id

      if (!customer_name || !phone || !address) {
        return next(createValidationError('请填写完整的订单信息', {
          missingFields: [
            ...(!customer_name ? ['customer_name'] : []),
            ...(!phone ? ['phone'] : []),
            ...(!address ? ['address'] : [])
          ]
        }))
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return next(createValidationError('请选择商品', { items: '至少选择一个商品' }))
      }

      for (const item of items) {
        if (!item.product_name || typeof item.price !== 'number' || typeof item.quantity !== 'number' || item.price <= 0 || item.quantity <= 0) {
          return next(createValidationError('商品信息不完整或非法', {
            item,
            missingFields: [
              ...(!item.product_name ? ['product_name'] : []),
              ...(typeof item.price !== 'number' || item.price <= 0 ? ['price'] : []),
              ...(typeof item.quantity !== 'number' || item.quantity <= 0 ? ['quantity'] : [])
            ]
          }))
        }
      }

      const productIds = items.map(i => i.product_id || i.id).filter(Boolean)
      if (productIds.length !== items.length) {
        return next(createValidationError('部分商品缺少 product_id', {}))
      }

      const { coupon_id } = req.body
      if (coupon_id) {
        const [coupon] = await query(`SELECT * FROM coupons WHERE id = ? AND valid_from <= NOW() AND valid_to >= NOW()`, [coupon_id])
        if (!coupon) return next(createBusinessError('优惠券不存在或已过期', { coupon_id }))
        const [userCoupon] = await query(`SELECT * FROM user_coupons WHERE user_id = ? AND coupon_id = ? AND status = 'unused'`, [user_id, coupon_id])
        if (!userCoupon) return next(createBusinessError('该优惠券不可用', { coupon_id }))
      }

      const result = await withTransaction(async (connection) => {
        const { coupon_id } = req.body
        const status = OrderStatus.PENDING

        const productIds = items.map(item => item.product_id || item.id).filter(Boolean)
        const [products] = await connection.query(
          `SELECT id, shop_id, name, price FROM products WHERE id IN (${productIds.join(',')})`
        )
        const productMap = new Map(products.map(p => [p.id, p]))

        const groupedItems = {}
        items.forEach(item => {
          const productId = item.product_id || item.id
          const product = productMap.get(productId)
          if (!product) {
            throw new Error(`商品 ${productId} 不存在`)
          }

          const shopKey = product.shop_id || 'null'
          if (!groupedItems[shopKey]) {
            groupedItems[shopKey] = []
          }
          groupedItems[shopKey].push({
            ...item,
            shop_id: product.shop_id,
            product_name: product.name
          })
        })

        const createdOrders = []

        for (const [shopKey, orderItems] of Object.entries(groupedItems)) {
          const orderNo = generateOrderNo()
          const shopId = shopKey === 'null' ? null : parseInt(shopKey)

          // 计算原价
          let originalAmount = 0
          for (const item of orderItems) {
            originalAmount += item.price * item.quantity
          }

          // 计算优惠券折扣（按商品价格比例分摊到每个商品）
          let discountAmount = 0
          const itemDiscounts = {} // 记录每个商品的优惠金额
          
          if (coupon_id) {
            const [coupon] = await connection.query(
              `SELECT type, value, scope, shop_id FROM coupons WHERE id = ?`,
              [coupon_id]
            )
            
            if (coupon && coupon.length > 0) {
              const couponConfig = coupon[0]
              
              // 计算适用优惠券的商品总金额
              let applicableAmount = 0
              const applicableItems = []
              
              for (const item of orderItems) {
                const isApplicable = isCouponApplicableToItem(couponConfig, item)
                if (isApplicable) {
                  const itemTotal = item.price * item.quantity
                  applicableAmount += itemTotal
                  applicableItems.push({
                    ...item,
                    itemTotal
                  })
                }
              }
              
              // 计算总折扣金额
              if (couponConfig.type === 'fixed_amount' || couponConfig.type === 'threshold' || couponConfig.type === 'fixed') {
                discountAmount = Math.min(Number(couponConfig.value), applicableAmount)
              } else if (couponConfig.type === 'percentage') {
                discountAmount = applicableAmount * (Number(couponConfig.value) / 100)
              }
              
              // 按价格比例分摊到每个适用商品
              if (applicableItems.length > 0 && discountAmount > 0) {
                let remainingDiscount = discountAmount
                
                for (let i = 0; i < applicableItems.length; i++) {
                  const item = applicableItems[i]
                  const ratio = item.itemTotal / applicableAmount
                  
                  if (i === applicableItems.length - 1) {
                    // 最后一个商品承担剩余的所有折扣，避免精度问题
                    itemDiscounts[item.product_id] = remainingDiscount
                  } else {
                    const itemDiscount = Math.min(
                      Math.round(discountAmount * ratio * 100) / 100,
                      remainingDiscount
                    )
                    itemDiscounts[item.product_id] = itemDiscount
                    remainingDiscount -= itemDiscount
                  }
                }
              }
            }
          }

          // 计算实付金额
          const totalAmount = originalAmount - discountAmount

          const expiresAt = new Date()
          expiresAt.setMinutes(expiresAt.getMinutes() + 15)

          const orderSql = `INSERT INTO orders (order_no, customer_name, phone, address, original_amount, total_amount, status, expires_at, user_id, shop_id)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          const [orderResult] = await connection.execute(orderSql, [
            orderNo,
            customer_name || '',
            phone || '',
            address || '',
            originalAmount,
            totalAmount,
            status,
            expiresAt,
            user_id,
            shopId
          ])
          const orderId = orderResult.insertId

          const itemSql = `INSERT INTO order_items (order_id, product_id, product_name, price, quantity, size, color, discount_amount)
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
          for (const item of orderItems) {
            let productId = 0
            const idValue = item.product_id || item.id || 0
            const size = item.size || ''
            const color = item.color || ''
            const itemDiscount = itemDiscounts[item.product_id || item.id] || 0
            
            if (idValue) {
              const parsedId = parseInt(idValue.toString().trim())
              if (!isNaN(parsedId) && parsedId > 0 && parsedId <= 2147483647) {
                productId = parsedId
                await InventoryService.safeDeductStock(
                  connection,
                  productId,
                  item.quantity,
                  item.color || '',
                  item.size || ''
                )
              }
            }

            await connection.execute(itemSql, [orderId, productId, item.product_name, item.price, item.quantity, size, color, itemDiscount])
          }

          if (coupon_id) {
            await useCouponService(connection, user_id, coupon_id, orderId)
          }

          createdOrders.push({
            order_no: orderNo,
            order_id: orderId,
            shop_id: shopId,
            original_amount: originalAmount,
            total_amount: totalAmount,
            discount_amount: discountAmount
          })
        }

        return {
          orders: createdOrders,
          total_count: createdOrders.length
        }
      })

      res.json({
        success: true,
        message: '下单成功',
        data: result
      })
    } catch (error) {
      next(createInternalError('创建订单失败', { error: error.message }))
    }
  },

  async getList(req, res) {
    try {
      const { status } = req.query
      const user_id = req.user.id
      const user = req.user

      if (!user_id) {
        return res.status(401).json({ success: false, message: '用户未认证' })
      }

      const isAdmin = user.role === '超级管理员' || (user.permissions && user.permissions.includes('order:view'))

      let sql = isAdmin ? 'SELECT * FROM orders' : 'SELECT * FROM orders WHERE user_id = ?'
      let params = isAdmin ? [] : [user_id]

      if (status !== undefined && status !== '') {
        sql += isAdmin ? ' WHERE status = ?' : ' AND status = ?'
        params.push(status)
      }

      sql += ' ORDER BY created_at DESC'
      const orders = await query(sql, params)

      const formattedOrders = await Promise.all(orders.map(async (order) => {
        const couponSql = `
          SELECT c.*, uc.status as coupon_status, uc.used_at
          FROM user_coupons uc
          LEFT JOIN coupons c ON uc.coupon_id = c.id
          WHERE uc.order_id = ?
        `
        const usedCoupons = await query(couponSql, [order.id])

        let couponInfo = {
          name: '未使用优惠券',
          type: null,
          value: null,
          discount_amount: '0.00',
          status: 'unused'
        }

        const usedCoupon = usedCoupons.find(coupon => (coupon.coupon_status === 'used' || coupon.used_at) && coupon.id)

        if (usedCoupon) {
          const discountAmount = usedCoupon.type === 'percentage' && usedCoupon.value ?
            (Number(order.total_amount) * (Number(usedCoupon.value) / 100)) :
            (usedCoupon.value ? Number(usedCoupon.value) : 0)

          couponInfo = {
            id: usedCoupon.id,
            name: usedCoupon.name || '未知优惠券',
            type: usedCoupon.type,
            value: usedCoupon.value,
            discount_amount: discountAmount.toFixed(2),
            status: 'used'
          }
        }

        const itemsSql = `
          SELECT oi.product_id, oi.product_name, oi.price, oi.quantity, oi.size, oi.color,
                 c.name as category_name
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          LEFT JOIN product_categories pc ON p.id = pc.product_id
          LEFT JOIN categories c ON pc.category_id = c.id
          WHERE oi.order_id = ?
        `
        const items = await query(itemsSql, [order.id])

        return {
          ...order,
          created_at: formatDate(order.created_at),
          updated_at: formatDate(order.updated_at),
          shipped_at: formatDate(order.shipped_at),
          expires_at: formatDate(order.expires_at),
          coupon_info: couponInfo,
          items: items || []
        }
      }))

      res.json({ success: true, data: formattedOrders })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async updateStatus(req, res, next) {
    try {
      const user = req.user
      if (!user) {
        return next(createValidationError('用户未登录'))
      }

      const isAdmin = user.role === '超级管理员' || (user.permissions && user.permissions.includes('order:manage'))

      // 管理员和商家（有shopId）走正常逻辑
      // 买家（无shopId）走特殊逻辑，只能确认收货
      const isBuyerWithoutShop = !isAdmin && !user.shopId

      if (!isBuyerWithoutShop && !isAdmin) {
        // 非管理员且非买家的商家必须有shopId
        if (!user.shopId) {
          return next(createValidationError('用户没有关联的店铺，无权操作'))
        }

        if (req.query && typeof req.query === 'object') {
          req.query.shop_id = user.shopId
        }

        if (req.body && typeof req.body === 'object') {
          req.body.shop_id = user.shopId
        }
      }

      const { id } = req.params
      const { status } = req.body

      if (!id || isNaN(parseInt(id))) {
        return next(createValidationError('无效的订单 ID', { id: id }))
      }

      const validStatuses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
      if (status && !validStatuses.includes(parseInt(status))) {
        return next(createValidationError('无效的订单状态', {
          validStatuses,
          provided: status
        }))
      }

      const [currentOrder] = await query('SELECT id, status, shop_id, user_id FROM orders WHERE id = ?', [id])
      if (!currentOrder) {
        return next(createNotFoundError('订单不存在', { orderId: id }))
      }

      const currentStatus = currentOrder.status
      const newStatus = parseInt(status)

      const statusTransitions = {
        1: [2, 6],
        2: [3, 6],
        3: [4, 5],
        4: [5, 9],
        5: [7, 8],
        6: [10],
        7: [8],
        8: [],
        9: [5, 8],
        10: [],
        11: [5]
      }

      if (!isAdmin) {
        const allowedTransitions = statusTransitions[currentStatus] || []
        if (!allowedTransitions.includes(newStatus)) {
          return next(createBusinessError('订单状态流转不允许', {
            currentStatus,
            newStatus,
            allowedTransitions,
            message: `无法从状态 ${currentStatus} 更改为状态 ${newStatus}`
          }))
        }
      } else {
        const invalidAdminTransitions = [
          { from: 5, to: 1 },
          { from: 5, to: 2 },
          { from: 5, to: 3 },
          { from: 6, to: 1 },
          { from: 6, to: 2 },
        ]

        const isInvalid = invalidAdminTransitions.some(t =>
          t.from === currentStatus && t.to === newStatus
        )

        if (isInvalid) {
          return next(createBusinessError('管理员也无法执行此状态流转', {
            currentStatus,
            newStatus,
            message: '违反了订单状态流转的业务逻辑'
          }))
        }
      }

      const userId = user.id ? parseInt(user.id) : null

      let whereCondition = 'id = ?'
      let params = [id]

      if (!isAdmin && user.shopId) {
        whereCondition += ' AND shop_id = ?'
        params.push(user.shopId)
      } else if (!isAdmin && userId) {
        const newStatus = parseInt(status)
        if (newStatus !== 5) {
          return next(createValidationError('买家只能确认收货', {
            allowedStatus: 5,
            message: '买家只能将订单状态更新为已完成（确认收货）'
          }))
        }

        const orderResult = await query(`SELECT status, user_id FROM orders WHERE id = ?`, [id])

        if (!orderResult || orderResult.length === 0) {
          return next(createNotFoundError('订单不存在', { orderId: id }))
        }

        const order = orderResult[0]

        if (order.user_id !== userId) {
          return next(createValidationError('无权操作该订单', {}))
        }

        if (![3, 4].includes(order.status)) {
          return next(createBusinessError('只有已发货或待收货状态的订单才能确认收货', {
            currentStatus: order.status
          }))
        }

        const updateSql = `UPDATE orders SET status = 5, completed_at = NOW(), updated_at = NOW() WHERE id = ?`
        const result = await query(updateSql, [id])

        if (result.affectedRows === 0) {
          return next(createInternalError('确认收货失败', {}))
        }

        return res.json({ success: true, message: '确认收货成功' })
      } else if (!isAdmin) {
        return next(createValidationError('无权操作订单', {}))
      }

      const updateSql = `UPDATE orders SET status = ?, updated_at = NOW() WHERE ${whereCondition}`
      const result = await query(updateSql, [...params, parseInt(status)])

      if (result.affectedRows === 0) {
        return next(createNotFoundError('订单不存在或无权操作', { orderId: id }))
      }

      if (parseInt(status) === 6) {
        const orderCheck = await query('SELECT id, status, shop_id FROM orders WHERE id = ?', [id])
        if (orderCheck.length === 0) {
          return next(createNotFoundError('订单不存在', { orderId: id }))
        }

        const order = orderCheck[0]

        if ([1, 2].includes(order.status)) {
          const orderItems = await query('SELECT product_id, quantity, color, size FROM order_items WHERE order_id = ?', [id])

          for (const item of orderItems) {
            try {
              await query(
                `UPDATE product_skus SET stock = stock + ? WHERE product_id = ? AND color = ? AND size = ?`,
                [item.quantity, item.product_id, item.color || '', item.size || '']
              )
            } catch (error) {
              console.error(`恢复库存失败：${error.message}`)
            }
          }
        }

        // 恢复优惠券
        await query(
          `UPDATE user_coupons 
           SET status = 'unused', order_id = NULL, used_at = NULL 
           WHERE order_id = ? AND status = 'used'`,
          [id]
        )
      }

      res.json({
        success: true,
        message: '订单状态更新成功',
        data: {
          order_id: id,
          new_status: parseInt(status)
        }
      })
    } catch (error) {
      next(createInternalError('更新订单状态失败', { error: error.message }))
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params
      const user = req.user

      if (!id || isNaN(parseInt(id))) {
        return next(createValidationError('无效的订单 ID', { id: id }))
      }

      const [order] = await query('SELECT * FROM orders WHERE id = ?', [id])

      if (!order) {
        return next(createNotFoundError('订单不存在', { orderId: id }))
      }

      const isAdmin = user.role === '超级管理员' || (user.permissions && user.permissions.includes('order:view'))

      if (!isAdmin) {
        if (user.shopId && order.shop_id !== user.shopId) {
          return next(createValidationError('无权查看该订单', {}))
        }
        if (user.id && order.user_id !== user.id && !user.shopId) {
          return next(createValidationError('无权查看该订单', {}))
        }
      }

      const orderItems = await query('SELECT * FROM order_items WHERE order_id = ?', [id])

      // 确保 items 是数组格式
      const items = Array.isArray(orderItems) ? orderItems : []

      const couponSql = `
        SELECT c.*, uc.status as coupon_status, uc.used_at
        FROM user_coupons uc
        LEFT JOIN coupons c ON uc.coupon_id = c.id
        WHERE uc.order_id = ?
      `
      const usedCoupons = await query(couponSql, [id])

      let couponInfo = {
        name: '未使用优惠券',
        type: null,
        value: null,
        discount_amount: '0.00',
        status: 'unused'
      }
      const usedCoupon = usedCoupons.find(coupon => (coupon.coupon_status === 'used' || coupon.used_at) && coupon.id)

      if (usedCoupon) {
        const discountAmount = usedCoupon.type === 'percentage' && usedCoupon.value ?
          (Number(order.total_amount) * (Number(usedCoupon.value) / 100)) :
          (usedCoupon.value ? Number(usedCoupon.value) : 0)

        couponInfo = {
          id: usedCoupon.id,
          name: usedCoupon.name || '未知优惠券',
          type: usedCoupon.type,
          value: usedCoupon.value,
          discount_amount: discountAmount.toFixed(2),
          status: 'used'
        }
      }

      // 查询售后信息（如果订单有售后记录）
      let afterSaleInfo = null
      // 只要订单有过售后记录就查询（通过售后表查询）
        const [afterSale] = await query(
          'SELECT * FROM order_returns WHERE order_id = ? ORDER BY id DESC LIMIT 1',
          [id]
        )
        if (afterSale) {
          afterSaleInfo = {
            ...afterSale,
            images: typeof afterSale.images === 'string' ? JSON.parse(afterSale.images) : afterSale.images,
            created_at: formatDate(afterSale.created_at),
            updated_at: formatDate(afterSale.updated_at),
            processed_at: formatDate(afterSale.processed_at),
            reshipped_at: formatDate(afterSale.reshipped_at)
          }
        }

      res.json({
        success: true,
        data: {
          ...order,
          items: items,
          coupon_info: couponInfo,
          after_sale_info: afterSaleInfo,
          created_at: formatDate(order.created_at),
          updated_at: formatDate(order.updated_at),
          shipped_at: formatDate(order.shipped_at),
          expires_at: formatDate(order.expires_at)
        }
      })
    } catch (error) {
      next(createInternalError('获取订单详情失败', { error: error.message }))
    }
  },

  async cancel(req, res, next) {
    try {
      const { id } = req.params
      const user = req.user

      if (!id || isNaN(parseInt(id))) {
        return next(createValidationError('无效的订单 ID', { id: id }))
      }

      const [order] = await query('SELECT id, status, user_id, shop_id FROM orders WHERE id = ?', [id])

      if (!order) {
        return next(createNotFoundError('订单不存在', { orderId: id }))
      }

      if (order.status !== OrderStatus.PENDING) {
        return next(createBusinessError('只有待支付状态的订单可以取消', {
          currentStatus: order.status
        }))
      }

      const isAdmin = user.role === '超级管理员' || (user.permissions && user.permissions.includes('order:manage'))

      if (!isAdmin && user.shopId && order.shop_id !== user.shopId) {
        return next(createValidationError('无权取消该订单', {}))
      }

      if (!isAdmin && user.id && order.user_id !== user.id) {
        return next(createValidationError('无权取消该订单', {}))
      }

      await query('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', [OrderStatus.CANCELLED, id])

      const orderItems = await query('SELECT product_id, quantity, color, size FROM order_items WHERE order_id = ?', [id])

      for (const item of orderItems) {
        try {
          await query(
            `UPDATE product_skus SET stock = stock + ? WHERE product_id = ? AND color = ? AND size = ?`,
            [item.quantity, item.product_id, item.color || '', item.size || '']
          )
        } catch (error) {
          console.error(`恢复库存失败：${error.message}`)
        }
      }

      res.json({
        success: true,
        message: '订单已取消',
        data: {
          order_id: id,
          status: OrderStatus.CANCELLED
        }
      })
    } catch (error) {
      next(createInternalError('取消订单失败', { error: error.message }))
    }
  },

  async getReviewable(req, res, next) {
    try {
      const { id } = req.params
      const user = req.user

      if (!id || isNaN(parseInt(id))) {
        return next(createValidationError('无效的订单 ID', { id: id }))
      }

      const [order] = await query('SELECT * FROM orders WHERE id = ?', [id])

      if (!order) {
        return next(createNotFoundError('订单不存在', { orderId: id }))
      }

      if (order.user_id !== user.id) {
        return next(createValidationError('无权查看该订单', {}))
      }

      const reviewable = order.status === OrderStatus.COMPLETED

      res.json({
        success: true,
        data: {
          order_id: id,
          reviewable
        }
      })
    } catch (error) {
      next(createInternalError('获取订单可评价状态失败', { error: error.message }))
    }
  },

  async ship(req, res, next) {
    try {
      const { id } = req.params
      const { logistics_company, tracking_number } = req.body
      const user = req.user

      if (!id || isNaN(parseInt(id))) {
        return next(createValidationError('无效的订单 ID', { id: id }))
      }

      const [order] = await query('SELECT * FROM orders WHERE id = ?', [id])

      if (!order) {
        return next(createNotFoundError('订单不存在', { orderId: id }))
      }

      if (user.shopId && order.shop_id !== user.shopId) {
        return next(createValidationError('无权操作该订单', {}))
      }

      if (order.status !== OrderStatus.PAID) {
        return next(createBusinessError('只有待发货状态的订单可以发货', {
          currentStatus: order.status
        }))
      }

      await query(
        `UPDATE orders SET status = ?, logistics_company = ?, tracking_number = ?, shipped_at = NOW(), updated_at = NOW() WHERE id = ?`,
        [OrderStatus.SHIPPED, logistics_company, tracking_number, id]
      )

      res.json({
        success: true,
        message: '订单已发货',
        data: {
          order_id: id,
          status: OrderStatus.SHIPPED
        }
      })
    } catch (error) {
      next(createInternalError('订单发货失败', { error: error.message }))
    }
  },

  async setAwaitingReceipt(req, res, next) {
    try {
      const { id } = req.params
      const user = req.user

      if (!id || isNaN(parseInt(id))) {
        return next(createValidationError('无效的订单 ID', { id: id }))
      }

      const [order] = await query('SELECT * FROM orders WHERE id = ?', [id])

      if (!order) {
        return next(createNotFoundError('订单不存在', { orderId: id }))
      }

      if (user.shopId && order.shop_id !== user.shopId) {
        return next(createValidationError('无权操作该订单', {}))
      }

      await query(
        `UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?`,
        [OrderStatus.AWAITING_RECEIPT, id]
      )

      res.json({
        success: true,
        message: '订单状态已更新为待收货',
        data: {
          order_id: id,
          status: OrderStatus.AWAITING_RECEIPT
        }
      })
    } catch (error) {
      next(createInternalError('更新订单状态失败', { error: error.message }))
    }
  },

  async confirmReceipt(req, res, next) {
    try {
      const { id } = req.params
      const user = req.user

      if (!id || isNaN(parseInt(id))) {
        return next(createValidationError('无效的订单 ID', { id: id }))
      }

      const [order] = await query('SELECT * FROM orders WHERE id = ?', [id])

      if (!order) {
        return next(createNotFoundError('订单不存在', { orderId: id }))
      }

      if (order.user_id !== user.id) {
        return next(createValidationError('无权操作该订单', {}))
      }

      if (![OrderStatus.SHIPPED, OrderStatus.AWAITING_RECEIPT].includes(order.status)) {
        return next(createBusinessError('只有已发货或待收货状态的订单可以确认收货', {
          currentStatus: order.status
        }))
      }

      await query(
        `UPDATE orders SET status = ?, completed_at = NOW(), updated_at = NOW() WHERE id = ?`,
        [OrderStatus.COMPLETED, id]
      )

      res.json({
        success: true,
        message: '确认收货成功',
        data: {
          order_id: id,
          status: OrderStatus.COMPLETED
        }
      })
    } catch (error) {
      next(createInternalError('确认收货失败', { error: error.message }))
    }
  },

  async getUserOrders(req, res, next) {
    try {
      const { status } = req.query
      const user_id = req.user.id

      if (!user_id) {
        return next(createValidationError('用户未认证', {}))
      }

      let sql = 'SELECT * FROM orders WHERE user_id = ?'
      let params = [user_id]

      if (status !== undefined && status !== '') {
        sql += ' AND status = ?'
        params.push(status)
      }

      sql += ' ORDER BY created_at DESC'
      const orders = await query(sql, params)

      const formattedOrders = await Promise.all(orders.map(async (order) => {
        const couponSql = `
          SELECT c.*, uc.status as coupon_status, uc.used_at
          FROM user_coupons uc
          LEFT JOIN coupons c ON uc.coupon_id = c.id
          WHERE uc.order_id = ?
        `
        const usedCoupons = await query(couponSql, [order.id])

        let couponInfo = {
          name: '未使用优惠券',
          type: null,
          value: null,
          discount_amount: '0.00',
          status: 'unused'
        }

        const usedCoupon = usedCoupons.find(coupon => coupon.coupon_status === 'used' && coupon.id)

        if (usedCoupon) {
          const discountAmount = usedCoupon.type === 'percentage' && usedCoupon.value ?
            (Number(order.total_amount) * (Number(usedCoupon.value) / 100)) :
            (usedCoupon.value ? Number(usedCoupon.value) : 0)

          couponInfo = {
            id: usedCoupon.id,
            name: usedCoupon.name || '未知优惠券',
            type: usedCoupon.type,
            value: usedCoupon.value,
            discount_amount: discountAmount.toFixed(2),
            status: 'used'
          }
        }

        return {
          ...order,
          created_at: formatDate(order.created_at),
          updated_at: formatDate(order.updated_at),
          shipped_at: formatDate(order.shipped_at),
          expires_at: formatDate(order.expires_at),
          coupon_info: couponInfo
        }
      }))

      res.json({ success: true, data: formattedOrders })
    } catch (error) {
      next(createInternalError('获取订单列表失败', { error: error.message }))
    }
  },

  async mergePay(req, res, next) {
    try {
      const { order_ids } = req.body
      const user = req.user

      if (!order_ids || !Array.isArray(order_ids) || order_ids.length === 0) {
        return next(createValidationError('请提供订单 ID 列表', {}))
      }

      const placeholders = order_ids.map(() => '?').join(',')
      const [orders] = await query(`SELECT * FROM orders WHERE id IN (${placeholders})`, order_ids)

      if (orders.length !== order_ids.length) {
        return next(createNotFoundError('部分订单不存在', {}))
      }

      for (const order of orders) {
        if (order.user_id !== user.id) {
          return next(createValidationError('无权操作部分订单', {}))
        }
        if (order.status !== OrderStatus.PENDING) {
          return next(createBusinessError('只有待支付状态的订单可以合并支付', {
            order_id: order.id,
            status: order.status
          }))
        }
      }

      const totalAmount = orders.reduce((sum, order) => sum + Number(order.total_amount), 0)

      res.json({
        success: true,
        message: '可以合并支付',
        data: {
          order_ids,
          total_amount: totalAmount,
          order_count: orders.length
        }
      })
    } catch (error) {
      next(createInternalError('合并支付失败', { error: error.message }))
    }
  },

  async getTransactionRecords(req, res, next) {
    try {
      const user_id = req.user.id
      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 20
      const offset = (page - 1) * limit

      if (!user_id) {
        return next(createValidationError('用户未认证', {}))
      }

      // 查询交易记录总数
      const countResult = await query(
        'SELECT COUNT(*) as total FROM transaction_records WHERE user_id = ?',
        [user_id]
      )
      const total = countResult[0].total

      // 查询交易记录（分页）
      const sql = `
        SELECT id, user_id, order_id, order_no, type, amount, payment_method, status, description, transaction_time, created_at
        FROM transaction_records
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `

      const records = await query(sql, [user_id, limit, offset])

      const formattedRecords = records.map(record => ({
        ...record,
        created_at: formatDate(record.created_at),
        transaction_time: formatDate(record.transaction_time)
      }))

      res.json({
        success: true,
        data: {
          list: formattedRecords,
          total: total,
          page: page,
          limit: limit,
          total_pages: Math.ceil(total / limit)
        }
      })
    } catch (error) {
      console.error('获取交易记录失败:', error)
      next(createInternalError('获取交易记录失败', { error: error.message }))
    }
  }
}

module.exports = orderController

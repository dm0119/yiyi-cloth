const { query, withTransaction } = require('../db/connection')

console.log('===== couponController.js 已加载 =====')

// 获取所有可领取优惠券
exports.getAvailableCoupons = async (req, res) => {
  try {
    const { userId, shop_id, product_id } = req.query
    
    if (!userId) {
      return res.status(400).json({ success: false, message: '用户 ID 不能为空' })
    }
    
    let whereClause = `
      c.status = 1 
      AND c.valid_from <= NOW() 
      AND c.valid_to >= NOW() 
      AND c.total_quantity > (
        SELECT COUNT(*) FROM user_coupons uc WHERE uc.coupon_id = c.id
      )
    `
    
    let params = []
    
    // 如果指定了店铺，显示该店铺的商家券 + 所有平台券
    if (shop_id) {
      whereClause += ` AND (c.shop_id = ? OR c.shop_id IS NULL)`
      params.push(parseInt(shop_id))
    }
    
    // 如果指定了商品，显示适用该商品的优惠券
    if (product_id) {
      whereClause += ` AND (
        c.scope = 'all' 
        OR c.scope = 'shop_all'
        OR (c.scope = 'specific_product' AND EXISTS (
          SELECT 1 FROM coupon_products cp WHERE cp.coupon_id = c.id AND cp.product_id = ?
        ))
      )`
      params.push(parseInt(product_id))
    }
    
    const coupons = await query(
      `SELECT 
        c.*,
        CASE WHEN c.shop_id IS NULL THEN 'platform' ELSE 'merchant' END as coupon_type,
        s.name as shop_name,
        (SELECT COUNT(*) FROM user_coupons uc WHERE uc.coupon_id = c.id) AS received_quantity
       FROM coupons c
       LEFT JOIN shops s ON c.shop_id = s.id
       WHERE ${whereClause}
       ORDER BY c.shop_id IS NULL DESC, c.created_at DESC`,
      params
    )
    
    // 查询用户已领取的优惠券 ID
    const userCouponIds = await query(
      `SELECT coupon_id FROM user_coupons WHERE user_id = ?`,
      [parseInt(userId)]
    )
    
    const userCouponIdSet = new Set(userCouponIds.map(item => item.coupon_id))
    
    // 过滤掉用户已领取的优惠券
    const availableCoupons = coupons.filter(coupon => !userCouponIdSet.has(coupon.id))
    
    // 为每个优惠券添加 productIds
    const couponIds = availableCoupons.map(c => c.id)
    if (couponIds.length > 0) {
      const products = await query(
        `SELECT coupon_id, product_id FROM coupon_products WHERE coupon_id IN (${couponIds.map(() => '?').join(',')})`,
        couponIds
      )
      
      const productMap = new Map()
      products.forEach(p => {
        if (!productMap.has(p.coupon_id)) productMap.set(p.coupon_id, [])
        productMap.get(p.coupon_id).push(p.product_id)
      })
      
      availableCoupons.forEach(c => {
        c.productIds = productMap.get(c.id) || []
      })
    }
    
    res.json({ success: true, data: availableCoupons })
  } catch (error) {
    console.error('获取可领取优惠券失败:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// 获取用户优惠券
exports.getUserCoupons = async (req, res) => {
  try {
    const { userId, status } = req.query
    
    if (!userId) {
      return res.status(400).json({ success: false, message: '用户 ID 不能为空' })
    }
    
    let whereClause = 'WHERE user_coupons.user_id = ?'
    const params = [userId]
    
    if (status === 'unused') {
      whereClause += ` AND user_coupons.status = 'unused' AND user_coupons.coupon_id IN (SELECT id FROM coupons WHERE valid_to >= NOW())`
    } else if (status === 'used') {
      whereClause += ` AND user_coupons.status = 'used'`
    } else if (status === 'expired') {
      whereClause += ` AND (user_coupons.status = 'expired' OR (user_coupons.status = 'unused' AND user_coupons.coupon_id IN (SELECT id FROM coupons WHERE valid_to < NOW())))`
    }
    
    const userCoupons = await query(
      `SELECT user_coupons.*, coupons.name, coupons.description, coupons.type, coupons.value, coupons.min_amount, coupons.scope, coupons.shop_id, coupons.valid_from, coupons.valid_to,
              s.name as shop_name
       FROM user_coupons 
       LEFT JOIN coupons ON user_coupons.coupon_id = coupons.id
       LEFT JOIN shops s ON coupons.shop_id = s.id
       ${whereClause} 
       ORDER BY user_coupons.created_at DESC`,
      params
    )
    
    // 查询所有优惠券关联的商品 ID
    const couponIds = userCoupons.map(uc => uc.coupon_id)
    if (couponIds.length > 0) {
      const products = await query(
        `SELECT coupon_id, product_id FROM coupon_products WHERE coupon_id IN (${couponIds.map(() => '?').join(',')})`,
        couponIds
      )
      
      const productMap = new Map()
      products.forEach(p => {
        if (!productMap.has(p.coupon_id)) productMap.set(p.coupon_id, [])
        productMap.get(p.coupon_id).push(p.product_id)
      })
      
      userCoupons.forEach(uc => {
        uc.productIds = productMap.get(uc.coupon_id) || []
        uc.categoryIds = []
      })
    }
    
    // 更新过期但未使用的优惠券状态
    if (status !== 'used') {
      await query(
        `UPDATE user_coupons 
         SET status = 'expired' 
         WHERE user_id = ? AND status = 'unused' AND coupon_id IN (SELECT id FROM coupons WHERE valid_to < NOW())`,
        [userId]
      )
      
      // 重新查询以获取最新状态
      if (status === 'expired' || !status) {
        const updatedUserCoupons = await query(
          `SELECT user_coupons.*, coupons.name, coupons.description, coupons.type, coupons.value, coupons.min_amount, coupons.scope, coupons.shop_id, coupons.valid_from, coupons.valid_to,
                  s.name as shop_name
           FROM user_coupons 
           LEFT JOIN coupons ON user_coupons.coupon_id = coupons.id
           LEFT JOIN shops s ON coupons.shop_id = s.id
           ${whereClause} 
           ORDER BY user_coupons.created_at DESC`,
          params
        )
        
        // 为更新后的优惠券添加 productIds 字段
        const updatedCouponIds = updatedUserCoupons.map(uc => uc.coupon_id)
        if (updatedCouponIds.length > 0) {
          const updatedProducts = await query(
            `SELECT coupon_id, product_id FROM coupon_products WHERE coupon_id IN (${updatedCouponIds.map(() => '?').join(',')})`,
            updatedCouponIds
          )
          
          const updatedProductMap = new Map()
          updatedProducts.forEach(p => {
            if (!updatedProductMap.has(p.coupon_id)) updatedProductMap.set(p.coupon_id, [])
            updatedProductMap.get(p.coupon_id).push(p.product_id)
          })
          
          updatedUserCoupons.forEach(uc => {
            uc.productIds = updatedProductMap.get(uc.coupon_id) || []
            uc.categoryIds = []
          })
        }
        
        return res.json({ success: true, data: updatedUserCoupons })
      }
    }
    
    res.json({ success: true, data: userCoupons })
  } catch (error) {
    console.error('获取用户优惠券失败:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// 领取优惠券（使用 JWT 认证）
exports.receiveCoupon = async (req, res) => {
  try {
    const { coupon_id } = req.body
    const user_id = req.user.id
    
    if (!coupon_id) {
      return res.status(400).json({ success: false, message: '优惠券 ID 不能为空' })
    }
    
    // 检查优惠券是否存在
    const [coupon] = await query(
      `SELECT * FROM coupons WHERE id = ? AND status = 1 AND valid_from <= NOW() AND valid_to >= NOW()`,
      [coupon_id]
    )
    
    if (!coupon) {
      return res.status(404).json({ success: false, message: '优惠券不存在或已过期' })
    }
    
    // 检查是否已领取
    const [existing] = await query(
      `SELECT * FROM user_coupons WHERE user_id = ? AND coupon_id = ?`,
      [user_id, coupon_id]
    )
    
    if (existing) {
      return res.status(400).json({ success: false, message: '您已领取过该优惠券' })
    }
    
    // 检查是否已发完
    const [count] = await query(
      `SELECT COUNT(*) as count FROM user_coupons WHERE coupon_id = ?`,
      [coupon_id]
    )
    
    if (count.count >= coupon.total_quantity) {
      return res.status(400).json({ success: false, message: '优惠券已领完' })
    }
    
    // 领取优惠券
    await query(
      `INSERT INTO user_coupons (user_id, coupon_id, status, obtained_at, valid_from, valid_to)
       VALUES (?, ?, 'unused', NOW(), ?, ?)`,
      [user_id, coupon_id, coupon.valid_from, coupon.valid_to]
    )
    
    res.json({ success: true, message: '领取成功' })
  } catch (error) {
    console.error('领取优惠券失败:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// 检查商品可用优惠券
exports.checkProductCoupons = async (req, res) => {
  try {
    const { userId, productId } = req.query
    
    if (!userId || !productId) {
      return res.status(400).json({ success: false, message: '用户 ID 和商品 ID 不能为空' })
    }
    
    // 查询用户未使用且未过期的优惠券
    const userCoupons = await query(
      `SELECT user_coupons.*, coupons.type, coupons.value, coupons.min_amount, coupons.scope, coupons.shop_id, coupons.valid_to,
              s.name as shop_name
       FROM user_coupons 
       LEFT JOIN coupons ON user_coupons.coupon_id = coupons.id
       LEFT JOIN shops s ON coupons.shop_id = s.id
       WHERE user_coupons.user_id = ? 
       AND user_coupons.status = 'unused' 
       AND coupons.valid_to >= NOW()`,
      [userId]
    )
    
    // 查询所有优惠券关联的商品 ID
    const couponIds = userCoupons.map(uc => uc.coupon_id)
    if (couponIds.length > 0) {
      const products = await query(
        `SELECT coupon_id, product_id FROM coupon_products WHERE coupon_id IN (${couponIds.map(() => '?').join(',')})`,
        couponIds
      )
      
      const productMap = new Map()
      products.forEach(p => {
        if (!productMap.has(p.coupon_id)) productMap.set(p.coupon_id, [])
        productMap.get(p.coupon_id).push(p.product_id)
      })
      
      userCoupons.forEach(uc => {
        uc.productIds = productMap.get(uc.coupon_id) || []
        uc.categoryIds = []
      })
    }
    
    // 查询商品信息
    const [product] = await query(
      `SELECT id, price FROM products WHERE id = ?`,
      [productId]
    )
    
    if (!product) {
      return res.status(404).json({ success: false, message: '商品不存在' })
    }
    
    // 筛选可用优惠券
    const availableCoupons = userCoupons.filter(coupon => {
      // 检查使用门槛
      if (coupon.min_amount && coupon.min_amount > product.price) {
        return false
      }
      
      // 检查使用范围
      if (coupon.scope === 'all' || coupon.scope === 'shop_all') {
        return true
      } else if (coupon.scope === 'specific_product') {
        return coupon.productIds.includes(productId)
      }
      
      return false
    })
    
    res.json({ success: true, data: availableCoupons })
  } catch (error) {
    console.error('检查商品可用优惠券失败:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// 推荐最优优惠券
exports.recommendBestCoupon = async (req, res) => {
  try {
    const { userId, orderTotal, productIds } = req.body
    
    if (!userId || !orderTotal || !productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ success: false, message: '参数不完整' })
    }
    
    // 查询用户未使用且未过期的优惠券
    const userCoupons = await query(
      `SELECT user_coupons.*, coupons.type, coupons.value, coupons.min_amount, coupons.scope, coupons.shop_id, coupons.valid_to,
              s.name as shop_name
       FROM user_coupons 
       LEFT JOIN coupons ON user_coupons.coupon_id = coupons.id
       LEFT JOIN shops s ON coupons.shop_id = s.id
       WHERE user_coupons.user_id = ? 
       AND user_coupons.status = 'unused' 
       AND coupons.valid_to >= NOW()`,
      [userId]
    )
    
    // 查询所有优惠券关联的商品 ID
    const couponIds = userCoupons.map(uc => uc.coupon_id)
    if (couponIds.length > 0) {
      const products = await query(
        `SELECT coupon_id, product_id FROM coupon_products WHERE coupon_id IN (${couponIds.map(() => '?').join(',')})`,
        couponIds
      )
      
      const productMap = new Map()
      products.forEach(p => {
        if (!productMap.has(p.coupon_id)) productMap.set(p.coupon_id, [])
        productMap.get(p.coupon_id).push(p.product_id)
      })
      
      userCoupons.forEach(uc => {
        uc.productIds = productMap.get(uc.coupon_id) || []
        uc.categoryIds = []
      })
    }
    
    // 计算每张优惠券的实际优惠金额
    const couponsWithSavings = userCoupons.map(coupon => {
      // 检查使用门槛
      if (coupon.min_amount && coupon.min_amount > orderTotal) {
        return { ...coupon, savings: 0 }
      }
      
      let savings = 0
      if (coupon.type === 'fixed_amount' || coupon.type === 'fixed') {
        savings = Math.min(coupon.value, orderTotal)
      } else if (coupon.type === 'percentage') {
        savings = orderTotal * (coupon.value / 100)
      }
      
      return { ...coupon, savings }
    })
    
    // 按优惠金额排序，返回最优的
    couponsWithSavings.sort((a, b) => b.savings - a.savings)
    
    res.json({ success: true, data: couponsWithSavings })
  } catch (error) {
    console.error('推荐最优优惠券失败:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// 使用优惠券（核销）
exports.useCoupon = async (req, res) => {
  try {
    const { user_coupon_id } = req.body
    const user_id = req.user.id
    
    if (!user_coupon_id) {
      return res.status(400).json({ success: false, message: '优惠券 ID 不能为空' })
    }
    
    // 检查优惠券是否存在且属于该用户
    const [userCoupon] = await query(
      `SELECT * FROM user_coupons WHERE id = ? AND user_id = ? AND status = 'unused'`,
      [user_coupon_id, user_id]
    )
    
    if (!userCoupon) {
      return res.status(404).json({ success: false, message: '优惠券不存在或不可用' })
    }
    
    // 检查优惠券是否过期
    const [coupon] = await query(
      `SELECT * FROM coupons WHERE id = ?`,
      [userCoupon.coupon_id]
    )
    
    if (!coupon || coupon.valid_to < new Date()) {
      await query(
        `UPDATE user_coupons SET status = 'expired' WHERE id = ?`,
        [user_coupon_id]
      )
      return res.status(400).json({ success: false, message: '优惠券已过期' })
    }
    
    // 更新状态为已使用
    await query(
      `UPDATE user_coupons SET status = 'used', used_at = NOW() WHERE id = ?`,
      [user_coupon_id]
    )
    
    res.json({ success: true, message: '优惠券已使用' })
  } catch (error) {
    console.error('使用优惠券失败:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// 后台管理相关方法
exports.createCoupon = async (req, res) => {
  try {
    const user = req.user
    const { name, description, type, value, min_amount, scope, productIds, total_quantity, valid_from, valid_to, status } = req.body
    
    // 商家创建优惠券时，自动添加 shop_id；运营人员创建平台优惠券时 shop_id 为 null
    const shop_id = user.shopId || null
    
    // 验证使用范围
    if (scope === 'specific_product' && (!productIds || productIds.length === 0)) {
      return res.status(400).json({ 
        success: false, 
        message: '指定商品优惠券必须选择至少一个商品' 
      })
    }
    
    // 验证使用范围：商家只能创建店铺券，运营人员只能创建平台券
    if (shop_id) {
      if (!['shop_all', 'specific_product'].includes(scope)) {
        return res.status(400).json({ 
          success: false, 
          message: '商家优惠券的使用范围必须是：店内全场或指定商品' 
        })
      }
    } else {
      // 运营人员创建平台优惠券，使用范围必须是 all
      if (scope !== 'all') {
        return res.status(400).json({ 
          success: false, 
          message: '平台优惠券的使用范围必须是：平台全场通用' 
        })
      }
    }
    
    // 转换日期时间格式：将 ISO 格式转换为 MySQL 格式
    const formatDateTime = (dateString) => {
      if (!dateString) return null
      // 如果已经是 Date 对象，转为字符串
      if (dateString instanceof Date) {
        return dateString.toISOString().replace('T', ' ').substring(0, 19)
      }
      // 如果是 ISO 格式字符串（包含 T），转换为 MySQL 格式
      if (typeof dateString === 'string' && dateString.includes('T')) {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return dateString
        return date.toISOString().replace('T', ' ').substring(0, 19)
      }
      // 如果已经是 MySQL 格式，直接返回
      if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
        return dateString
      }
      return dateString
    }
    
    const result = await query(
      `INSERT INTO coupons (name, description, type, value, min_amount, scope, shop_id, total_quantity, valid_from, valid_to, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, type, value, min_amount, scope, shop_id, total_quantity, formatDateTime(valid_from), formatDateTime(valid_to), status || 1]
    )
    
    // 如果是指定商品，添加关联
    if (scope === 'specific_product' && productIds && productIds.length > 0) {
      for (const productId of productIds) {
        await query(
          `INSERT INTO coupon_products (coupon_id, product_id) VALUES (?, ?)`,
          [result.insertId, productId]
        )
      }
    }
    
    res.json({ success: true, message: '优惠券创建成功', data: { id: result.insertId } })
  } catch (error) {
    console.error('创建优惠券失败:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getAllCoupons = async (req, res) => {
  try {
    const user = req.user
    
    // 判断是否是管理员（超级管理员、运营或有coupon:manage权限）
    const isAdmin = user.role === '超级管理员' || user.role === '运营' || (user.permissions && user.permissions.includes('coupon:manage'))
    
    let coupons
    if (isAdmin) {
      // 管理员可以看到所有优惠券（平台券 + 所有店铺券）
      coupons = await query(`SELECT * FROM coupons ORDER BY created_at DESC`)
    } else {
      // 商家只能看到自己店铺的优惠券
      if (!user.shopId) {
        return res.status(400).json({ success: false, message: '商家未关联店铺' })
      }
      coupons = await query(`SELECT * FROM coupons WHERE shop_id = ? ORDER BY created_at DESC`, [user.shopId])
    }
    
    // 查询所有优惠券关联的商品 ID
    const couponIds = coupons.map(c => c.id)
    if (couponIds.length > 0) {
      const products = await query(
        `SELECT coupon_id, product_id FROM coupon_products WHERE coupon_id IN (${couponIds.map(() => '?').join(',')})`,
        couponIds
      )
      
      const productMap = new Map()
      products.forEach(p => {
        if (!productMap.has(p.coupon_id)) productMap.set(p.coupon_id, [])
        productMap.get(p.coupon_id).push(p.product_id)
      })
      
      coupons.forEach(c => {
        c.productIds = productMap.get(c.id) || []
      })
    }
    
    res.json({ success: true, data: coupons })
  } catch (error) {
    console.error('获取优惠券列表失败:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getCouponById = async (req, res) => {
  try {
    const { id } = req.params
    const user = req.user
    
    // 判断是否是管理员（超级管理员、运营或有coupon:manage权限）
    const isAdmin = user.role === '超级管理员' || user.role === '运营' || (user.permissions && user.permissions.includes('coupon:manage'))
    
    let coupon
    if (isAdmin) {
      // 管理员可以查看任何优惠券
      [coupon] = await query(`SELECT * FROM coupons WHERE id = ?`, [id])
    } else {
      // 商家只能查看自己店铺的优惠券
      if (!user.shopId) {
        return res.status(400).json({ success: false, message: '商家未关联店铺' })
      }
      [coupon] = await query(`SELECT * FROM coupons WHERE id = ? AND shop_id = ?`, [id, user.shopId])
    }
    
    if (!coupon) {
      return res.status(404).json({ success: false, message: '优惠券不存在或无权查看' })
    }
    
    // 查询关联的商品 ID
    const products = await query(
      `SELECT product_id FROM coupon_products WHERE coupon_id = ?`,
      [id]
    )
    coupon.productIds = products.map(p => p.product_id)
    
    res.json({ success: true, data: coupon })
  } catch (error) {
    console.error('获取优惠券详情失败:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params
    const user = req.user
    const { name, description, type, value, min_amount, scope, productIds, total_quantity, valid_from, valid_to, status } = req.body
    
    // 判断是否是管理员（超级管理员、运营或有coupon:manage权限）
    const isAdmin = user.role === '超级管理员' || user.role === '运营' || (user.permissions && user.permissions.includes('coupon:manage'))
    
    let coupon
    if (isAdmin) {
      [coupon] = await query(`SELECT * FROM coupons WHERE id = ?`, [id])
    } else {
      // 商家只能更新自己店铺的优惠券
      if (!user.shopId) {
        return res.status(400).json({ success: false, message: '商家未关联店铺' })
      }
      [coupon] = await query(`SELECT * FROM coupons WHERE id = ? AND shop_id = ?`, [id, user.shopId])
    }
    
    if (!coupon) {
      return res.status(404).json({ success: false, message: '优惠券不存在或无权操作' })
    }
    
    // 转换日期时间格式：将 ISO 格式转换为 MySQL 格式
    const formatDateTime = (dateString) => {
      if (!dateString) return null
      // 如果已经是 Date 对象，转为字符串
      if (dateString instanceof Date) {
        return dateString.toISOString().replace('T', ' ').substring(0, 19)
      }
      // 如果是 ISO 格式字符串（包含 T），转换为 MySQL 格式
      if (typeof dateString === 'string' && dateString.includes('T')) {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return dateString
        return date.toISOString().replace('T', ' ').substring(0, 19)
      }
      // 如果已经是 MySQL 格式，直接返回
      if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
        return dateString
      }
      return dateString
    }
    
    console.log('【DEBUG】更新优惠券请求数据:', JSON.stringify(req.body))
    console.log('【DEBUG】解构后 - scope:', scope, 'productIds:', productIds, '类型:', typeof productIds)
    console.log('更新优惠券 - valid_from:', valid_from, 'valid_to:', valid_to)
    console.log('转换后 - valid_from:', formatDateTime(valid_from), 'valid_to:', formatDateTime(valid_to))
    
    await query(
      `UPDATE coupons SET name=?, description=?, type=?, value=?, min_amount=?, scope=?, total_quantity=?, valid_from=?, valid_to=?, status=? WHERE id=?`,
      [name, description, type, value, min_amount, scope, total_quantity, formatDateTime(valid_from), formatDateTime(valid_to), status, id]
    )
    
    // 更新关联的商品
    if (scope === 'specific_product') {
      // 删除旧的关联
      await query(`DELETE FROM coupon_products WHERE coupon_id = ?`, [id])
      
      // 添加新的关联
      if (productIds && productIds.length > 0) {
        for (const productId of productIds) {
          await query(
            `INSERT INTO coupon_products (coupon_id, product_id) VALUES (?, ?)`,
            [id, productId]
          )
        }
      }
    } else {
      // 如果不是指定商品类型，删除所有关联
      await query(`DELETE FROM coupon_products WHERE coupon_id = ?`, [id])
    }
    
    res.json({ success: true, message: '优惠券更新成功' })
  } catch (error) {
    console.error('更新优惠券失败:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params
    const user = req.user
    
    // 判断是否是管理员（超级管理员、运营或有coupon:manage权限）
    const isAdmin = user.role === '超级管理员' || user.role === '运营' || (user.permissions && user.permissions.includes('coupon:manage'))
    
    let coupon
    if (isAdmin) {
      [coupon] = await query(`SELECT * FROM coupons WHERE id = ?`, [id])
    } else {
      // 商家只能删除自己店铺的优惠券
      if (!user.shopId) {
        return res.status(400).json({ success: false, message: '商家未关联店铺' })
      }
      [coupon] = await query(`SELECT * FROM coupons WHERE id = ? AND shop_id = ?`, [id, user.shopId])
    }
    
    if (!coupon) {
      return res.status(404).json({ success: false, message: '优惠券不存在或无权操作' })
    }
    
    // 删除关联的商品
    await query(`DELETE FROM coupon_products WHERE coupon_id = ?`, [id])
    
    // 删除优惠券
    await query(`DELETE FROM coupons WHERE id = ?`, [id])
    
    res.json({ success: true, message: '优惠券删除成功' })
  } catch (error) {
    console.error('删除优惠券失败:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// 获取优惠券关联的商品详情
exports.getCouponProducts = async (req, res) => {
  try {
    const { id } = req.params
    const user = req.user
    
    // 查询优惠券是否存在
    const [coupon] = await query(`SELECT * FROM coupons WHERE id = ?`, [id])
    
    if (!coupon) {
      return res.status(404).json({ success: false, message: '优惠券不存在' })
    }
    
    // 查询关联的商品ID
    const productIds = await query(
      `SELECT product_id FROM coupon_products WHERE coupon_id = ?`,
      [id]
    )
    
    if (productIds.length === 0) {
      return res.json({ success: true, data: [] })
    }
    
    const ids = productIds.map(p => p.product_id)
    
    // 查询商品详情
    const products = await query(
      `SELECT id, name, price, image, stock FROM products WHERE id IN (${ids.map(() => '?').join(',')})`,
      ids
    )
    
    res.json({ success: true, data: products })
  } catch (error) {
    console.error('获取优惠券商品详情失败:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

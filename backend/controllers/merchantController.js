const { query } = require('../db/connection')
const { generateShopAvatarData } = require('../utils/shopAvatar')
const { formatDate } = require('../utils/dateFormatter')
const bcrypt = require('bcryptjs')

// 商家入驻申请
async function apply(req, res) {
  try {
    const {
      name,
      license_no,
      legal_person,
      username,
      password,
      contact_phone,
      contact_email,
      description,
      license_image,
      id_card_front,
      id_card_back
    } = req.body

    // 验证必填字段
    if (!name || !license_no || !legal_person || !username || !password || !contact_phone) {
      return res.status(400).json({ success: false, message: '请填写所有必填字段' })
    }
    
    // 验证资质图片（可选，但建议上传）
    if (!license_image || !id_card_front || !id_card_back) {
      return res.status(400).json({ success: false, message: '请上传店铺资格证和身份证正反面图片' })
    }

    // 检查用户名是否已存在
    const existingUsers = await query('SELECT id FROM users WHERE username = ?', [username])
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: '用户名已存在' })
    }

    // 检查店铺名称是否已存在
    const existingShops = await query('SELECT id FROM shops WHERE name = ?', [name])
    if (existingShops.length > 0) {
      return res.status(400).json({ success: false, message: '店铺名称已存在' })
    }

    // 检查是否已经提交过申请（从 shop_data JSON 中查询 username）
    const existingApplications = await query(
      "SELECT id FROM merchant_applications WHERE JSON_UNQUOTE(JSON_EXTRACT(shop_data, '$.username')) = ?",
      [username]
    )
    if (existingApplications.length > 0) {
      return res.status(400).json({ success: false, message: '您已经提交过入驻申请，请等待审核结果' })
    }

    // 密码验证（不加密，审核通过时再加密）
    console.log('密码类型:', typeof password, '密码值:', password)
    const passwordStr = String(password || '')
    if (!passwordStr || passwordStr.length < 6) {
      return res.status(400).json({ success: false, message: '密码格式不正确，长度至少 6 位' })
    }

    // 将申请数据存为 JSON 格式（使用与数据库 shops 表一致的字段名）
    const applicationData = {
      name,
      license_no,
      legal_person,
      username,
      password: passwordStr,
      contact_phone,
      contact_email,
      description
    }

    // 创建入驻申请记录（不创建用户和店铺，等待审核通过后再创建）
    // 保存资质图片到单独字段
    await query(
      `INSERT INTO merchant_applications 
       (shop_data, status, created_at, license_image, id_card_front, id_card_back)
       VALUES (?, 'pending', NOW(), ?, ?, ?)`,
      [JSON.stringify(applicationData), license_image, id_card_front, id_card_back]
    )

    res.json({ success: true, message: '申请提交成功，请等待审核' })
  } catch (error) {
    console.error('商家入驻申请失败:', error)
    // 返回具体错误信息便于调试
    res.status(500).json({ 
      success: false, 
      message: '申请失败，请稍后重试',
      error: error.message,
      code: error.code,
      errno: error.errno
    })
  }
}

// 获取入驻申请状态
async function getStatus(req, res) {
  try {
    const userId = req.user.id

    const shops = await query(
      'SELECT id, name, status, created_at FROM shops WHERE user_id = ?',
      [userId]
    )

    if (shops.length === 0) {
      return res.json({ success: true, data: null })
    }

    const shop = shops[0]
    let statusText = '未知'
    if (shop.status === 'active') statusText = '已通过'
    else if (shop.status === 'inactive') statusText = '已拒绝'

    res.json({
      success: true,
      data: {
        shopId: shop.id,
        shopName: shop.name,
        status: shop.status,
        statusText,
        createdAt: shop.created_at
      }
    })
  } catch (error) {
    console.error('获取入驻申请状态失败:', error)
    res.status(500).json({ success: false, message: '获取状态失败' })
  }
}

/**
 * 获取商家店铺信息（移动端）
 */
async function getShopInfoForMobile(req, res) {
  try {
    const { shopId } = req.params
    
    // 查询店铺信息
    const shopsResult = await query(
      `SELECT id, user_id, name, description, logo_url, banner_url, status, is_brand, return_address, shipping_address, created_at
       FROM shops
       WHERE id = ?`,
      [shopId]
    )
    const shops = Array.isArray(shopsResult) ? shopsResult : []

    if (!shops || shops.length === 0) {
      return res.status(404).json({
        success: false,
        message: '店铺不存在'
      })
    }
    
    const shop = shops[0]
    
    // 检查店铺状态
    if (shop.status !== 'active') {
      return res.json({
        success: true,
        data: {
          ...shop,
          is_closed: true,
          closed_reason: getClosedReason(shop.status),
          avatar: generateShopAvatarData(shop)
        }
      })
    }
    
    // 查询店铺统计
    const stats = await getShopStats(shopId)
    
    // 查询店铺热门商品（按销量自动排序）
    const hotProductsResult = await query(
      `SELECT p.id, p.name, p.price, p.image, p.images,
              COALESCE(SUM(oi.quantity), 0) as sales_count
       FROM products p
       LEFT JOIN order_items oi ON p.id = oi.product_id
       LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN (2, 3, 4)
       WHERE p.shop_id = ? AND p.status = 1 AND p.deleted = 0
       GROUP BY p.id
       ORDER BY sales_count DESC, p.created_at DESC
       LIMIT 10`,
      [shopId]
    )
    
    // 查询店铺新品（按创建时间自动排序）
    const newProductsResult = await query(
      `SELECT p.id, p.name, p.price, p.image, p.images, p.created_at
       FROM products p
       WHERE p.shop_id = ? AND p.status = 1 AND p.deleted = 0
       ORDER BY p.created_at DESC
       LIMIT 10`,
      [shopId]
    )
    
    // 处理图片
    const processProducts = (products) => {
      if (!Array.isArray(products)) return []
      return products.map(p => {
        if (p.images) {
          try {
            p.images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images
            p.image = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : (p.image || '')
          } catch (e) {
            p.images = []
          }
        }
        p.price = parseFloat(p.price) || 0
        return p
      })
    }
    
    res.json({
      success: true,
      data: {
        ...shop,
        is_closed: false,
        stats,
        avatar: generateShopAvatarData(shop),
        hot_products: processProducts(hotProductsResult),
        new_products: processProducts(newProductsResult)
      }
    })
  } catch (error) {
    console.error('获取店铺信息失败:', error)
    res.status(500).json({ 
      success: false, 
      message: '获取店铺信息失败',
      error: error.message 
    })
  }
}

/**
 * 获取商家商品列表（移动端）
 */
async function getShopProductsForMobile(req, res) {
  try {
    const { shopId } = req.params
    const { sort = 'all', page = 1, pageSize = 20, categoryId } = req.query
    
    const offset = (parseInt(page) - 1) * parseInt(pageSize)
    
    let categoryFilter = ''
    let params = [shopId, parseInt(pageSize), offset]
    
    if (categoryId) {
      categoryFilter = `AND EXISTS (
        SELECT 1 FROM product_categories pc2 
        WHERE pc2.product_id = p.id AND pc2.category_id = ?
      )`
      params = [shopId, categoryId, parseInt(pageSize), offset]
    }
    
    // 如果是热销或新品，使用自动排序
    if (sort === 'hot' || sort === 'new') {
      const sortSql = sort === 'hot' ? 'sales_count DESC, p.created_at DESC' : 'p.created_at DESC'
      
      const productsResult = await query(
        `SELECT p.*,
                COALESCE(AVG(r.rating), 0) as avg_rating,
                COALESCE(SUM(oi.quantity), 0) as sales_count
         FROM products p
         LEFT JOIN order_items oi ON p.id = oi.product_id
         LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN (2, 3, 4)
         LEFT JOIN reviews r ON p.id = r.product_id
         WHERE p.shop_id = ?
           AND p.status = 1
           AND p.deleted = 0
           ${categoryFilter}
         GROUP BY p.id
         ORDER BY ${sortSql}
         LIMIT ? OFFSET ?`,
        params
      )
      const products = Array.isArray(productsResult) ? productsResult : []
      
      // 处理数据
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
      
      res.json({
        success: true,
        data: {
          products,
          total: products.length,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      })
    } else {
      // 默认排序（全部商品）
      let sortSql = 'p.created_at DESC'
      if (sort === 'price_asc') {
        sortSql = 'p.price ASC'
      } else if (sort === 'price_desc') {
        sortSql = 'p.price DESC'
      } else if (sort === 'time') {
        sortSql = 'p.created_at DESC'
      } else if (sort === 'default') {
        sortSql = 'p.created_at DESC'
      }
      
      const productsResult = await query(
        `SELECT p.*,
                COALESCE(AVG(r.rating), 0) as avg_rating
         FROM products p
         LEFT JOIN reviews r ON p.id = r.product_id
         WHERE p.shop_id = ?
           AND p.status = 1
           AND p.deleted = 0
           ${categoryFilter}
         GROUP BY p.id
         ORDER BY ${sortSql}
         LIMIT ? OFFSET ?`,
        params
      )
      const products = Array.isArray(productsResult) ? productsResult : []
      
      // 处理数据
      products.forEach(p => {
        p.price = parseFloat(p.price) || 0
        p.sales_count = 0
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
      
      // 查询总数
      let countParams = [shopId]
      let countCategoryFilter = ''
      if (categoryId) {
        countCategoryFilter = `AND EXISTS (
          SELECT 1 FROM product_categories pc2 
          WHERE pc2.product_id = p.id AND pc2.category_id = ?
        )`
        countParams = [shopId, categoryId]
      }
      
      const countResultRaw = await query(
        `SELECT COUNT(*) as total
         FROM products p
         WHERE p.shop_id = ?
           AND p.status = 1
           AND p.deleted = 0
           ${countCategoryFilter}`,
        countParams
      )
      const countResult = Array.isArray(countResultRaw) && countResultRaw.length > 0 ? countResultRaw[0] : { total: 0 }
      
      res.json({
        success: true,
        data: {
          products,
          total: countResult.total,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      })
    }
  } catch (error) {
    console.error('获取店铺商品失败:', error)
    res.status(500).json({ 
      success: false, 
      message: '获取店铺商品失败',
      error: error.message 
    })
  }
}

/**
 * 获取商家商品分类（移动端）
 */
async function getShopCategories(req, res) {
  try {
    const { shopId } = req.params
    
    const categoriesResult = await query(
      `SELECT c.id, c.name, COUNT(pc.product_id) as product_count
       FROM categories c
       LEFT JOIN product_categories pc ON c.id = pc.category_id
       LEFT JOIN products p ON pc.product_id = p.id 
         AND p.shop_id = ? 
         AND p.status = 1 
         AND p.deleted = 0
       GROUP BY c.id, c.name
       HAVING product_count > 0`,
      [shopId]
    )
    
    res.json({
      success: true,
      data: Array.isArray(categoriesResult) ? categoriesResult : []
    })
  } catch (error) {
    console.error('获取店铺分类失败:', error)
    res.status(500).json({ 
      success: false, 
      message: '获取店铺分类失败',
      error: error.message 
    })
  }
}

/**
 * 获取商家订单列表（商家后台）
 */
async function getShopOrders(req, res) {
  try {
    const userId = req.user.id
    const { page = 1, pageSize = 10, keyword, status, startDate, endDate } = req.query
    
    // 获取商家的店铺
    const shopsResult = await query(
      'SELECT id FROM shops WHERE user_id = ? AND status = "active"',
      [userId]
    )
    const shops = Array.isArray(shopsResult) ? shopsResult : []

    if (!shops || shops.length === 0) {
      return res.json({
        success: true,
        data: [],
        total: 0
      })
    }
    
    const shopId = shops[0].id
    
    // 构建查询条件
    let whereConditions = ['o.shop_id = ?']
    let queryParams = [shopId]
    
    if (status && status.trim()) {
      whereConditions.push('o.status = ?')
      queryParams.push(status)
    }
    
    if (keyword && keyword.trim()) {
      whereConditions.push('(o.id LIKE ? OR o.customer_name LIKE ? OR o.phone LIKE ?)')
      const keywordPattern = `%${keyword}%`
      queryParams.push(keywordPattern, keywordPattern, keywordPattern)
    }
    
    if (startDate) {
      whereConditions.push('DATE(o.created_at) >= ?')
      queryParams.push(startDate)
    }
    
    if (endDate) {
      whereConditions.push('DATE(o.created_at) <= ?')
      queryParams.push(endDate)
    }
    
    const whereClause = whereConditions.join(' AND ')
    const offset = (parseInt(page) - 1) * parseInt(pageSize)
    
    const ordersResult = await query(
      `SELECT o.*,
              GROUP_CONCAT(DISTINCT p.name SEPARATOR ', ') as product_names,
              COUNT(o.id) OVER() as total
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE ${whereClause}
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(pageSize), offset]
    )
    
    res.json({
      success: true,
      data: Array.isArray(ordersResult) ? ordersResult : [],
      total: (Array.isArray(ordersResult) && ordersResult.length > 0) ? ordersResult[0].total : 0,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    })
  } catch (error) {
    console.error('获取店铺订单失败:', error)
    res.status(500).json({ 
      success: false, 
      message: '获取店铺订单失败',
      error: error.message 
    })
  }
}

/**
 * 获取公告列表（用于登录页展示，不需要登录）
 */
async function getAnnouncements(req, res) {
  try {
    const { status, limit = 10 } = req.query
    
    let statusFilter = ''
    const params = [parseInt(limit)]
    
    if (status && status !== 'all') {
      statusFilter = 'WHERE ma.status = ?'
      params.unshift(status)
    }
    
    const announcementsResult = await query(
      `SELECT ma.id,
              ma.status,
              ma.created_at,
              ma.reviewed_at,
              JSON_UNQUOTE(JSON_EXTRACT(ma.shop_data, '$.legal_person')) AS applicant_name,
              JSON_UNQUOTE(JSON_EXTRACT(ma.shop_data, '$.contact_phone')) AS contact_phone,
              JSON_UNQUOTE(JSON_EXTRACT(ma.shop_data, '$.name')) AS shop_name
       FROM merchant_applications ma
       ${statusFilter}
       ORDER BY ma.reviewed_at DESC, ma.created_at DESC
       LIMIT ?`,
      params
    )
    
    const announcements = (Array.isArray(announcementsResult) ? announcementsResult : []).map(item => {
      let statusText = '待审核'
      if (item.status === 'approved') {
        statusText = '已通过'
      } else if (item.status === 'rejected') {
        statusText = '已拒绝'
      }
      
      return {
        id: item.id,
        applicant_name: maskSensitiveInfo(item.applicant_name, 1, 1),
        shop_name: maskSensitiveInfo(item.shop_name, 1, 1),
        contact_phone: maskPhone(item.contact_phone),
        status: item.status,
        status_text: statusText,
        created_at: item.created_at,
        reviewed_at: item.reviewed_at
      }
    })
    
    res.json({
      success: true,
      data: announcements
    })
  } catch (error) {
    console.error('获取公告列表失败:', error)
    res.status(500).json({ 
      success: false, 
      message: '获取公告列表失败',
      error: error.message 
    })
  }
}

/**
 * 加密敏感信息 - 姓名
 */
function maskSensitiveInfo(text, keepStart = 1, keepEnd = 1) {
  if (!text || text.length <= keepStart + keepEnd) {
    return text || ''
  }
  const start = text.substring(0, keepStart)
  const end = text.substring(text.length - keepEnd)
  const middle = '*'.repeat(text.length - keepStart - keepEnd)
  return start + middle + end
}

/**
 * 加密手机号码
 */
function maskPhone(phone) {
  if (!phone || phone.length < 7) {
    return phone || ''
  }
  return phone.substring(0, 3) + '****' + phone.substring(phone.length - 4)
}

/**
 * 获取商家统计信息
 */
async function getShopStats(shopId) {
  try {
    // 商品数量
    const productResultRaw = await query(
      'SELECT COUNT(*) as count FROM products WHERE shop_id = ? AND status = 1 AND deleted = 0',
      [shopId]
    )
    const productResult = Array.isArray(productResultRaw) && productResultRaw.length > 0 ? productResultRaw[0] : { count: 0 }

    // 总销量
    const salesResultRaw = await query(
      `SELECT COALESCE(SUM(oi.quantity), 0) as count
       FROM order_items oi
       INNER JOIN products p ON oi.product_id = p.id
       INNER JOIN orders o ON oi.order_id = o.id
       WHERE p.shop_id = ? 
         AND p.status = 1 
         AND p.deleted = 0
         AND o.status IN (2, 3, 4)`,
      [shopId]
    )
    
    // 总销售额
    const revenueResultRaw = await query(
      `SELECT COALESCE(SUM(oi.quantity * oi.price), 0) as total
       FROM order_items oi
       INNER JOIN products p ON oi.product_id = p.id
       INNER JOIN orders o ON oi.order_id = o.id
       WHERE p.shop_id = ? 
         AND p.status = 1 
         AND p.deleted = 0
         AND o.status IN (2, 3, 4)`,
      [shopId]
    )
    
    const salesResult = Array.isArray(salesResultRaw) && salesResultRaw.length > 0 ? salesResultRaw[0] : { count: 0 }
    const revenueResult = Array.isArray(revenueResultRaw) && revenueResultRaw.length > 0 ? revenueResultRaw[0] : { total: 0 }

    return {
      productCount: productResult.count || 0,
      salesCount: parseInt(salesResult.count) || 0,
      revenue: parseFloat(revenueResult.total) || 0
    }
  } catch (error) {
    console.error('获取店铺统计失败:', error)
    return {
      productCount: 0,
      salesCount: 0,
      revenue: 0
    }
  }
}

/**
 * 获取店铺关闭原因
 */
function getClosedReason(status) {
  const reasons = {
    'inactive': '店铺已被禁用'
  }
  return reasons[status] || '店铺无法访问'
}

/**
 * 获取退货原因统计（商家后台）
 */
async function getReturnReasons(req, res) {
  try {
    const userId = req.user.id
    
    // 获取商家的店铺
    const shopsResult = await query(
      'SELECT id FROM shops WHERE user_id = ? AND status = "active"',
      [userId]
    )
    const shops = Array.isArray(shopsResult) ? shopsResult : []
    
    if (!shops || shops.length === 0) {
      return res.json({
        success: true,
        data: []
      })
    }
    
    const shopId = shops[0].id
    
    // 查询退货原因统计（只统计有退货原因的订单）
    // 排除待发货状态（status=2）直接退款的情况
    const reasonsResult = await query(
      `SELECT return_reason, COUNT(*) as count
       FROM orders
       WHERE shop_id = ?
         AND return_reason IS NOT NULL
         AND return_reason != ''
         AND return_reason != 'null'
         AND status NOT IN (2)  -- 排除待发货状态直接退款
       GROUP BY return_reason
       ORDER BY count DESC`,
      [shopId]
    )
    
    const reasons = Array.isArray(reasonsResult) ? reasonsResult : []
    
    res.json({
      success: true,
      data: reasons
    })
  } catch (error) {
    console.error('获取退货原因统计失败:', error)
    res.status(500).json({
      success: false,
      message: '获取退货原因统计失败',
      error: error.message
    })
  }
}

/**
 * 获取尺码分布统计（商家后台）
 */
async function getSizeDistribution(req, res) {
  try {
    const userId = req.user.id
    
    // 获取商家的店铺
    const shopsResult = await query(
      'SELECT id FROM shops WHERE user_id = ? AND status = "active"',
      [userId]
    )
    const shops = Array.isArray(shopsResult) ? shopsResult : []
    
    if (!shops || shops.length === 0) {
      return res.json({
        success: true,
        data: []
      })
    }
    
    const shopId = shops[0].id
    
    // 查询尺码分布统计（从订单明细中统计）
    const sizeResult = await query(
      `SELECT oi.size, COUNT(*) as count
       FROM order_items oi
       INNER JOIN products p ON oi.product_id = p.id
       INNER JOIN orders o ON oi.order_id = o.id
       WHERE p.shop_id = ?
         AND oi.size IS NOT NULL
         AND oi.size != ''
         AND oi.size != 'null'
       GROUP BY oi.size
       ORDER BY count DESC`,
      [shopId]
    )
    
    const sizes = Array.isArray(sizeResult) ? sizeResult : []
    
    res.json({
      success: true,
      data: sizes
    })
  } catch (error) {
    console.error('获取尺码分布统计失败:', error)
    res.status(500).json({
      success: false,
      message: '获取尺码分布统计失败',
      error: error.message
    })
  }
}

/**
 * 获取订单详情（商家后台）
 */
async function getOrderDetail(req, res) {
  try {
    const { orderId } = req.params
    const userId = req.user.id

    // 验证订单ID
    if (!orderId || isNaN(parseInt(orderId))) {
      return res.status(400).json({
        success: false,
        message: '无效的订单ID'
      })
    }

    // 获取商家的店铺
    const shopsResult = await query(
      'SELECT id FROM shops WHERE user_id = ? AND status = "active"',
      [userId]
    )
    const shops = Array.isArray(shopsResult) ? shopsResult : []

    if (!shops || shops.length === 0) {
      return res.status(403).json({
        success: false,
        message: '您没有可操作的店铺'
      })
    }

    const shopId = shops[0].id

    // 获取订单基本信息
    const ordersResult = await query(
      `SELECT o.*, 
              s.name as shop_name, 
              s.logo_url as shop_logo
       FROM orders o
       LEFT JOIN shops s ON o.shop_id = s.id
       WHERE o.id = ? AND o.shop_id = ?`,
      [orderId, shopId]
    )
    const orders = Array.isArray(ordersResult) ? ordersResult : []

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: '订单不存在或无权查看'
      })
    }

    const order = orders[0]

    // 获取订单商品信息
    const itemsResult = await query(
      `SELECT oi.*, 
              p.name as product_name, 
              p.image as product_image,
              ps.image as sku_image
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       LEFT JOIN product_skus ps ON oi.product_id = ps.product_id 
                                AND oi.color = ps.color 
                                AND oi.size = ps.size
       WHERE oi.order_id = ?`,
      [orderId]
    )
    const items = Array.isArray(itemsResult) ? itemsResult : []

    // 处理商品数据
    const processedItems = items.map(item => {
      const displayImage = item.sku_image || item.product_image
      console.log('商品图片信息:', {
        product_id: item.product_id,
        product_name: item.product_name,
        sku_image: item.sku_image,
        product_image: item.product_image,
        display_image: displayImage
      })
      return {
        ...item,
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 0,
        display_image: displayImage
      }
    })

    // 查询售后信息（如果订单有售后记录）
    let afterSaleInfo = null
    const [afterSale] = await query(
      'SELECT * FROM order_returns WHERE order_id = ? ORDER BY id DESC LIMIT 1',
      [orderId]
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

    // 返回完整的订单详情
    res.json({
      success: true,
      data: {
        ...order,
        total_amount: parseFloat(order.total_amount) || 0,
        original_amount: parseFloat(order.original_amount) || 0,
        items: processedItems,
        after_sale_info: afterSaleInfo,
        shop: {
          id: shopId,
          name: order.shop_name,
          logo_url: order.shop_logo
        }
      }
    })
  } catch (error) {
    console.error('获取订单详情失败:', error)
    res.status(500).json({
      success: false,
      message: '获取订单详情失败',
      error: error.message
    })
  }
}

/**
 * 更新订单状态（商家后台）
 */
async function updateOrderStatus(req, res) {
  try {
    const { orderId } = req.params
    const { status } = req.body
    const userId = req.user.id

    // 验证订单ID
    if (!orderId || isNaN(parseInt(orderId))) {
      return res.status(400).json({
        success: false,
        message: '无效的订单ID'
      })
    }

    // 验证状态值
    const validStatuses = [1, 2, 3, 4, 5, 6, 7]
    if (!status || !validStatuses.includes(parseInt(status))) {
      return res.status(400).json({
        success: false,
        message: '无效的订单状态'
      })
    }

    // 获取商家的店铺
    const shopsResult = await query(
      'SELECT id FROM shops WHERE user_id = ? AND status = "active"',
      [userId]
    )
    const shops = Array.isArray(shopsResult) ? shopsResult : []

    if (!shops || shops.length === 0) {
      return res.status(403).json({
        success: false,
        message: '您没有可操作的店铺'
      })
    }

    const shopId = shops[0].id

    // 检查订单是否属于该店铺
    const ordersResult = await query(
      'SELECT id FROM orders WHERE id = ? AND shop_id = ?',
      [orderId, shopId]
    )
    const orders = Array.isArray(ordersResult) ? ordersResult : []

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: '订单不存在或无权操作'
      })
    }

    // 更新订单状态
    const result = await query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ? AND shop_id = ?',
      [status, orderId, shopId]
    )

    if (result.affectedRows === 0) {
      return res.status(500).json({
        success: false,
        message: '更新订单状态失败'
      })
    }

    res.json({
      success: true,
      message: '订单状态更新成功'
    })
  } catch (error) {
    console.error('更新订单状态失败:', error)
    res.status(500).json({
      success: false,
      message: '更新订单状态失败',
      error: error.message
    })
  }
}

/**
 * 获取所有店铺列表（管理员）
 */
async function getAllShops(req, res) {
  try {
    const { page = 1, pageSize = 10, keyword, status } = req.query
    
    let whereConditions = []
    let queryParams = []
    
    if (status && status.trim()) {
      whereConditions.push('s.status = ?')
      queryParams.push(status)
    }
    
    if (keyword && keyword.trim()) {
      whereConditions.push('(s.name LIKE ? OR s.description LIKE ? OR u.username LIKE ?)')
      const keywordPattern = `%${keyword}%`
      queryParams.push(keywordPattern, keywordPattern, keywordPattern)
    }
    
    const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(' AND ')}` : ''
    const offset = (parseInt(page) - 1) * parseInt(pageSize)

    const shopsResult = await query(
      `SELECT s.*, u.username as owner_username, u.phone as owner_phone, u.email as owner_email
       FROM shops s
       LEFT JOIN users u ON s.user_id = u.id
       ${whereClause}
       ORDER BY s.created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(pageSize), offset]
    )

    // 确保 shopsResult 是数组
    const shopsArray = Array.isArray(shopsResult) ? shopsResult : []

    // 获取总数
    const countResultResult = await query(
      `SELECT COUNT(*) as total FROM shops s ${whereClause}`,
      queryParams
    )
    const countResult = Array.isArray(countResultResult) && countResultResult.length > 0 ? countResultResult[0] : { total: 0 }
    
    // 处理数据
    shopsArray.forEach(shop => {
      shop.avatar = generateShopAvatarData(shop)
    })
    
    res.json({
      success: true,
      data: shopsArray,
      total: countResult.total || 0,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    })
  } catch (error) {
    console.error('获取店铺列表失败:', error)
    res.status(500).json({ 
      success: false, 
      message: '获取店铺列表失败',
      error: error.message 
    })
  }
}

/**
 * 获取未品牌化的店铺列表（用于品牌管理）
 */
async function getNonBrandShops(req, res) {
  try {
    const { page = 1, pageSize = 10, keyword, status } = req.query
    
    let whereConditions = ['s.is_brand = 0']  // 只显示未品牌化的店铺
    let queryParams = []
    
    if (status && status.trim()) {
      whereConditions.push('s.status = ?')
      queryParams.push(status)
    }
    
    if (keyword && keyword.trim()) {
      whereConditions.push('(s.name LIKE ? OR s.description LIKE ? OR u.username LIKE ?)')
      const keywordPattern = `%${keyword}%`
      queryParams.push(keywordPattern, keywordPattern, keywordPattern)
    }
    
    const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(' AND ')}` : ''
    const offset = (parseInt(page) - 1) * parseInt(pageSize)
    
    // 调试日志
    console.log('getNonBrandShops 参数:', { page, pageSize, keyword, status })
    console.log('getNonBrandShops whereClause:', whereClause)
    console.log('getNonBrandShops queryParams:', queryParams)
    console.log('getNonBrandShops offset:', offset)

    const shopsResult = await query(
      `SELECT s.*, u.username as owner_username, u.phone as owner_phone, u.email as owner_email
       FROM shops s
       LEFT JOIN users u ON s.user_id = u.id
       ${whereClause}
       ORDER BY s.created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(pageSize), offset]
    )

    const shopsArray = Array.isArray(shopsResult) ? shopsResult : []

    const countResultResult = await query(
      `SELECT COUNT(*) as total FROM shops s ${whereClause}`,
      queryParams
    )
    const countResult = Array.isArray(countResultResult) && countResultResult.length > 0 ? countResultResult[0] : { total: 0 }
    
    // 处理 avatar（只有当 shop.id 存在时）
    if (shopsArray.length > 0) {
      shopsArray.forEach(shop => {
        if (shop.id) {
          shop.avatar = generateShopAvatarData(shop)
        }
      })
    }
    
    res.json({
      success: true,
      data: shopsArray,
      total: countResult.total || 0,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    })
  } catch (error) {
    console.error('获取未品牌化店铺列表失败:', error)
    res.status(500).json({ 
      success: false, 
      message: '获取未品牌化店铺列表失败',
      error: error.message 
    })
  }
}

/**
 * 获取店铺详情（管理员）
 */
async function getShopDetail(req, res) {
  try {
    const { shopId } = req.params

    const shopsResult = await query(
      `SELECT s.*, u.username as owner_username, u.phone as owner_phone, u.email as owner_email,
              ma.license_image, ma.id_card_front, ma.id_card_back
       FROM shops s
       LEFT JOIN users u ON s.user_id = u.id
       LEFT JOIN merchant_applications ma ON ma.user_id = s.user_id OR JSON_UNQUOTE(JSON_EXTRACT(ma.shop_data, '$.username')) = u.username
       WHERE s.id = ?`,
      [shopId]
    )

    const shops = Array.isArray(shopsResult) ? shopsResult : []

    if (!shops || shops.length === 0) {
      return res.status(404).json({
        success: false,
        message: '店铺不存在'
      })
    }

    const shop = shops[0]
    shop.avatar = generateShopAvatarData(shop)
    
    // 获取店铺统计
    const stats = await getShopStats(shopId)
    shop.stats = stats
    
    res.json({
      success: true,
      data: shop
    })
  } catch (error) {
    console.error('获取店铺详情失败:', error)
    res.status(500).json({ 
      success: false, 
      message: '获取店铺详情失败',
      error: error.message 
    })
  }
}

/**
 * 更新店铺信息（管理员）
 */
async function updateShopInfo(req, res) {
  try {
    const { shopId } = req.params
    const { name, description, status, logo_url, banner_url, return_address, shipping_address } = req.body
    
    // 检查店铺是否存在
    const shopsCheckResult = await query('SELECT * FROM shops WHERE id = ?', [shopId])
    const shopsCheck = Array.isArray(shopsCheckResult) ? shopsCheckResult : []
    if (!shopsCheck || shopsCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: '店铺不存在'
      })
    }

    // 更新店铺信息
    const updates = []
    const params = []
    
    if (name !== undefined) {
      updates.push('name = ?')
      params.push(name)
    }
    if (description !== undefined) {
      updates.push('description = ?')
      params.push(description)
    }
    if (status !== undefined) {
      updates.push('status = ?')
      params.push(status)
    }
    if (logo_url !== undefined) {
      updates.push('logo_url = ?')
      params.push(logo_url)
    }
    if (banner_url !== undefined) {
      updates.push('banner_url = ?')
      params.push(banner_url)
    }
    if (return_address !== undefined) {
      updates.push('return_address = ?')
      params.push(return_address)
    }
    if (shipping_address !== undefined) {
      updates.push('shipping_address = ?')
      params.push(shipping_address)
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有要更新的字段'
      })
    }
    
    params.push(shopId)
    
    await query(
      `UPDATE shops SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      params
    )
    
    res.json({
      success: true,
      message: '店铺信息更新成功'
    })
  } catch (error) {
    console.error('更新店铺信息失败:', error)
    res.status(500).json({ 
      success: false, 
      message: '更新店铺信息失败',
      error: error.message 
    })
  }
}

/**
 * 删除店铺（管理员）
 */
async function deleteShop(req, res) {
  try {
    const { shopId } = req.params
    
    // 检查店铺是否存在
    const delShopResult = await query('SELECT * FROM shops WHERE id = ?', [shopId])
    const delShopCheck = Array.isArray(delShopResult) ? delShopResult : []
    if (!delShopCheck || delShopCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: '店铺不存在'
      })
    }

    // 检查店铺是否有商品
    const delProductsResult = await query('SELECT COUNT(*) as count FROM products WHERE shop_id = ?', [shopId])
    const delProductsCount = Array.isArray(delProductsResult) && delProductsResult.length > 0 ? delProductsResult[0].count : 0
    if (delProductsCount > 0) {
      return res.status(400).json({
        success: false,
        message: '该店铺还有商品，无法删除'
      })
    }

    // 检查店铺是否有订单
    const delOrdersResult = await query('SELECT COUNT(*) as count FROM orders WHERE shop_id = ?', [shopId])
    const delOrdersCount = Array.isArray(delOrdersResult) && delOrdersResult.length > 0 ? delOrdersResult[0].count : 0
    if (delOrdersCount > 0) {
      return res.status(400).json({
        success: false,
        message: '该店铺有订单，无法删除'
      })
    }
    
    // 删除店铺
    await query('DELETE FROM shops WHERE id = ?', [shopId])
    
    res.json({
      success: true,
      message: '店铺删除成功'
    })
  } catch (error) {
    console.error('删除店铺失败:', error)
    res.status(500).json({ 
      success: false, 
      message: '删除店铺失败',
      error: error.message 
    })
  }
}

/**
 * 获取待审核的商家申请列表
 */
async function getPendingList(req, res) {
  try {
    // 从 merchant_applications 表查询待审核数据，从 JSON 中提取字段（字段名与前端期望的一致）
    const pendingResult = await query(
      `SELECT ma.id,
              ma.status,
              ma.created_at,
              ma.license_image,
              ma.id_card_front,
              ma.id_card_back,
              JSON_UNQUOTE(JSON_EXTRACT(ma.shop_data, '$.username')) AS applicant_username,
              JSON_UNQUOTE(JSON_EXTRACT(ma.shop_data, '$.legal_person')) AS legal_person,
              JSON_UNQUOTE(JSON_EXTRACT(ma.shop_data, '$.contact_phone')) AS contact_phone,
              JSON_UNQUOTE(JSON_EXTRACT(ma.shop_data, '$.contact_email')) AS contact_email,
              JSON_UNQUOTE(JSON_EXTRACT(ma.shop_data, '$.name')) AS shop_name,
              JSON_UNQUOTE(JSON_EXTRACT(ma.shop_data, '$.license_no')) AS license_no,
              JSON_UNQUOTE(JSON_EXTRACT(ma.shop_data, '$.description')) AS description
       FROM merchant_applications ma
       WHERE ma.status = 'pending'
       ORDER BY ma.created_at DESC`
    )

    console.log('待审核列表查询结果:', JSON.stringify(pendingResult, null, 2))
    console.log('待审核列表数量:', pendingResult.length)
    if (pendingResult.length > 0) {
      console.log('第一条数据的 shop_name:', pendingResult[0].shop_name)
      console.log('第一条数据的 applicant_username:', pendingResult[0].applicant_username)
    }

    res.json({
      success: true,
      data: Array.isArray(pendingResult) ? pendingResult : []
    })
  } catch (error) {
    console.error('获取待审核列表失败:', error)
    res.status(500).json({ 
      success: false, 
      message: '获取待审核列表失败',
      error: error.message 
    })
  }
}

/**
 * 获取已审核的商家申请列表
 */
async function getReviewedList(req, res) {
  try {
    // 从 merchant_applications 表查询已审核数据，从 JSON 中提取字段（字段名与前端期望的一致）
    const reviewedResult = await query(
      `SELECT ma.id,
              ma.status,
              ma.review_notes,
              ma.reviewed_at,
              ma.created_at,
              ma.license_image,
              ma.id_card_front,
              ma.id_card_back,
              JSON_UNQUOTE(JSON_EXTRACT(ma.shop_data, '$.legal_person')) AS applicant_username,
              JSON_UNQUOTE(JSON_EXTRACT(ma.shop_data, '$.contact_phone')) AS contact_phone,
              JSON_UNQUOTE(JSON_EXTRACT(ma.shop_data, '$.contact_email')) AS contact_email,
              JSON_UNQUOTE(JSON_EXTRACT(ma.shop_data, '$.name')) AS shop_name,
              JSON_UNQUOTE(JSON_EXTRACT(ma.shop_data, '$.license_no')) AS license_no
       FROM merchant_applications ma
       WHERE ma.status IN ('approved', 'rejected')
       ORDER BY ma.reviewed_at DESC`
    )

    // 处理状态文本，使与前端期望的状态值一致
    const processedData = reviewedResult.map(item => {
      // 状态转换：approved -> 已通过, rejected -> 已拒绝
      let statusText = '未知'
      let displayStatus = item.status // 使用原始状态供前端处理
      if (item.status === 'approved') {
        statusText = '已通过'
        displayStatus = 'approved'
      } else if (item.status === 'rejected') {
        statusText = '已拒绝'
        displayStatus = 'rejected'
      }
      
      return {
        ...item,
        status_text: statusText,
        status: displayStatus // 保持与前端期望一致
      }
    })

    res.json({
      success: true,
      data: processedData
    })
  } catch (error) {
    console.error('获取已审核列表失败:', error)
    res.status(500).json({ 
      success: false, 
      message: '获取已审核列表失败',
      error: error.message 
    })
  }
}

/**
 * 审核商家申请
 */
async function reviewApplication(req, res) {
  const { query, withTransaction } = require('../db/connection')
  try {
    const { applicationId, status, reviewNotes } = req.body
    const userId = req.user.id
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: '无效的审核状态'
      })
    }
    
    // 查询申请信息（从 merchant_applications 表）
    const appRowsResult = await query(
      'SELECT * FROM merchant_applications WHERE id = ?',
      [applicationId]
    )
    const appRows = Array.isArray(appRowsResult) ? appRowsResult : []
    
    if (appRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '申请不存在'
      })
    }
    
    const application = appRows[0]
    
    // 使用 withTransaction 确保所有操作在同一个数据库连接中执行
    await withTransaction(async (connection) => {
      console.log('[审核] 开始事务处理，申请ID:', applicationId, '状态:', status)
      
      // 注意：connection.query 返回 [rows, fields]，需要解构
      const [updateResult] = await connection.query(
        `UPDATE merchant_applications 
         SET status = ?, review_notes = ?, reviewed_by = ?, reviewed_at = NOW(), updated_at = NOW()
         WHERE id = ?`,
        [status, reviewNotes || '', userId, applicationId]
      )
      console.log('[审核] 申请状态已更新:', updateResult)
      
      // 如果审核通过，创建用户和店铺
      if (status === 'approved') {
        console.log('[审核] 开始创建用户和店铺')
        
        // 从 shop_data JSON 中提取申请信息（字段名与数据库 shops 表一致）
        let shopData;
        try {
          shopData = typeof application.shop_data === 'string' 
            ? JSON.parse(application.shop_data) 
            : application.shop_data
          console.log('[审核] shop_data 解析成功:', JSON.stringify(shopData))
        } catch (parseError) {
          console.error('[审核] shop_data 解析失败:', parseError)
          throw new Error('申请数据格式错误: ' + parseError.message)
        }
        
        // 直接使用 JSON 中的字段名（与数据库一致）
        const appData = {
          username: shopData.username,
          password: shopData.password,
          legalPerson: shopData.legal_person,
          shopName: shopData.name,
          licenseNo: shopData.license_no,
          contactPhone: shopData.contact_phone,
          contactEmail: shopData.contact_email,
          description: shopData.description
        }
        console.log('[审核] appData:', JSON.stringify(appData))
        
        // 查找商家角色 ID
        const [rolesResult] = await connection.query('SELECT id FROM roles WHERE name = ?', ['商家'])
        console.log('[审核] 查找商家角色(中文):', rolesResult)
        let merchantRoleId = rolesResult && rolesResult.length > 0 ? rolesResult[0].id : null
        if (!merchantRoleId) {
          const [rolesResultEn] = await connection.query('SELECT id FROM roles WHERE name = ?', ['merchant'])
          console.log('[审核] 查找商家角色(英文):', rolesResultEn)
          merchantRoleId = rolesResultEn && rolesResultEn.length > 0 ? rolesResultEn[0].id : 5
        }
        console.log('[审核] 商家角色ID:', merchantRoleId)
        
        // 密码加密
          const hashedPassword = bcrypt.hashSync(appData.password, 10)
          
          // 创建用户（角色为商家）
          console.log('[审核] 准备创建用户:', appData.username)
          const [userResult] = await connection.query(
            'INSERT INTO users (username, password, name, phone, role_id, status) VALUES (?, ?, ?, ?, ?, 1)',
            [appData.username, hashedPassword, appData.legalPerson, appData.contactPhone, merchantRoleId]
          )
          console.log('[审核] 用户创建结果:', userResult)
        
        const newUserId = userResult.insertId
        console.log(`✓ 用户创建成功：${appData.username}, ID: ${newUserId}`)
        
        // 创建店铺
        console.log('[审核] 准备创建店铺:', appData.shopName)
        await connection.query(
          `INSERT INTO shops 
           (name, license_no, legal_person, contact_phone, contact_email, description, user_id, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
          [appData.shopName, appData.licenseNo, appData.legalPerson, 
           appData.contactPhone, appData.contactEmail, appData.description, newUserId]
        )
        console.log(`✓ 店铺创建成功：${appData.shopName}`)
        
        console.log(`✓ 商家入驻审核通过：用户 ${appData.username} 已创建为商家，店铺已创建`)
      } else {
        // 审核拒绝，不创建用户和店铺，只保留申请记录
        console.log(`✓ 商家入驻审核拒绝：申请 ID ${applicationId} 已拒绝，审核意见：${reviewNotes || ''}`)
      }
      
      console.log('[审核] 事务提交')
    })
    
    res.json({
      success: true,
      message: status === 'approved' ? '审核通过' : '审核拒绝'
    })
  } catch (error) {
    console.error('审核申请失败:', error)
    res.status(500).json({ 
      success: false, 
      message: '审核申请失败',
      error: error.message 
    })
  }
}

/**
 * 获取商家自己的店铺信息（商家后台）
 */
async function getShop(req, res) {
  try {
    const userId = req.user.id
    
    // JOIN merchant_applications 获取资质图片
    const shopsResult = await query(
      `SELECT s.*, ma.license_image, ma.id_card_front, ma.id_card_back
       FROM shops s
       LEFT JOIN merchant_applications ma ON JSON_UNQUOTE(JSON_EXTRACT(ma.shop_data, '$.username')) = (
         SELECT username FROM users WHERE id = ?
       )
       WHERE s.user_id = ?
       ORDER BY ma.created_at DESC
       LIMIT 1`,
      [userId, userId]
    )
    const shops = Array.isArray(shopsResult) ? shopsResult : []
    
    if (!shops || shops.length === 0) {
      return res.status(404).json({
        success: false,
        message: '暂无店铺信息，请先申请入驻'
      })
    }
    
    const shop = shops[0]
    const stats = await getShopStats(shop.id)
    
    res.json({
      success: true,
      data: {
        ...shop,
        stats
      }
    })
  } catch (error) {
    console.error('获取店铺信息失败:', error)
    res.status(500).json({
      success: false,
      message: '获取店铺信息失败',
      error: error.message
    })
  }
}

/**
 * 更新商家自己的店铺信息（商家后台）
 */
async function updateShop(req, res) {
  try {
    const userId = req.user.id
    const { name, description, logo_url, banner_url, contact_phone, contact_email, return_address, shipping_address } = req.body
    
    const shopsResult = await query(
      'SELECT * FROM shops WHERE user_id = ?',
      [userId]
    )
    const shops = Array.isArray(shopsResult) ? shopsResult : []
    
    if (!shops || shops.length === 0) {
      return res.status(404).json({
        success: false,
        message: '暂无店铺信息'
      })
    }
    
    const shop = shops[0]
    const updates = []
    const params = []
    
    if (name !== undefined) { updates.push('name = ?'); params.push(name) }
    if (description !== undefined) { updates.push('description = ?'); params.push(description) }
    if (logo_url !== undefined) { updates.push('logo_url = ?'); params.push(logo_url) }
    if (banner_url !== undefined) { updates.push('banner_url = ?'); params.push(banner_url) }
    if (contact_phone !== undefined) { updates.push('contact_phone = ?'); params.push(contact_phone) }
    if (contact_email !== undefined) { updates.push('contact_email = ?'); params.push(contact_email) }
    if (return_address !== undefined) { updates.push('return_address = ?'); params.push(return_address) }
    if (shipping_address !== undefined) { updates.push('shipping_address = ?'); params.push(shipping_address) }
    
    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: '没有要更新的字段' })
    }
    
    params.push(shop.id)
    await query(
      `UPDATE shops SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      params
    )
    
    res.json({ success: true, message: '店铺信息更新成功' })
  } catch (error) {
    console.error('更新店铺信息失败:', error)
    res.status(500).json({ success: false, message: '更新店铺信息失败' })
  }
}

/**
 * 获取商家自己的评价列表（商家后台）
 */
async function getShopReviews(req, res) {
  try {
    const userId = req.user.id
    const { page = 1, pageSize = 20, status, product_id } = req.query
    
    // 获取商家的店铺
    const shopsResult = await query(
      'SELECT id FROM shops WHERE user_id = ? AND status = "active"',
      [userId]
    )
    const shops = Array.isArray(shopsResult) ? shopsResult : []

    if (!shops || shops.length === 0) {
      return res.json({
        success: true,
        data: [],
        total: 0
      })
    }
    
    const shopId = shops[0].id
    
    // 构建查询条件
    let whereConditions = ['p.shop_id = ?']
    let queryParams = [shopId]
    
    if (status !== undefined && status !== '') {
      whereConditions.push('r.status = ?')
      queryParams.push(parseInt(status))
    }
    
    if (product_id) {
      whereConditions.push('r.product_id = ?')
      queryParams.push(parseInt(product_id))
    }
    
    const whereClause = whereConditions.join(' AND ')
    const pageNum = Math.max(1, parseInt(page) || 1)
    const pageSizeNum = Math.min(100, Math.max(1, parseInt(pageSize) || 20))
    const offset = (pageNum - 1) * pageSizeNum
    
    // 获取评价列表
    const sql = `
      SELECT 
        r.id,
        r.order_id,
        r.product_id,
        p.name as product_name,
        p.image as product_image,
        r.user_name,
        r.rating,
        r.content,
        r.images,
        r.status,
        r.created_at,
        o.order_no,
        o.customer_name
      FROM reviews r
      INNER JOIN products p ON r.product_id = p.id
      LEFT JOIN orders o ON r.order_id = o.id
      WHERE ${whereClause} AND p.deleted = 0
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `
    
    const reviews = await query(sql, [...queryParams, pageSizeNum, offset])
    
    // 获取评价总数
    const countSql = `
      SELECT COUNT(*) as count
      FROM reviews r
      INNER JOIN products p ON r.product_id = p.id
      WHERE ${whereClause} AND p.deleted = 0
    `
    const countResult = await query(countSql, queryParams)
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
      const date = new Date(review.created_at)
      review.created_at = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
      review.rating = parseInt(review.rating) || 0
      
      // 获取回复信息
      const replyResult = await query(
        'SELECT id, content, created_at FROM review_replies WHERE review_id = ? ORDER BY created_at DESC LIMIT 1',
        [review.id]
      )
      if (replyResult.length > 0) {
        const replyDate = new Date(replyResult[0].created_at)
        review.reply = {
          id: replyResult[0].id,
          content: replyResult[0].content,
          created_at: `${replyDate.getFullYear()}-${String(replyDate.getMonth() + 1).padStart(2, '0')}-${String(replyDate.getDate()).padStart(2, '0')} ${String(replyDate.getHours()).padStart(2, '0')}:${String(replyDate.getMinutes()).padStart(2, '0')}`
        }
      } else {
        review.reply = null
      }
    }
    
    res.json({
      success: true,
      data: reviews,
      total,
      page: pageNum,
      pageSize: pageSizeNum
    })
  } catch (error) {
    console.error('获取店铺评价失败:', error)
    res.status(500).json({ 
      success: false, 
      message: '获取店铺评价失败',
      error: error.message 
    })
  }
}

/**
 * 获取商家自己的商品列表（商家后台）
 */
async function getShopProducts(req, res) {
  try {
    const userId = req.user.id
    const { shopId } = req.params
    
    // 验证店铺归属
    const shopsResult = await query(
      'SELECT id FROM shops WHERE id = ? AND user_id = ?',
      [shopId, userId]
    )
    const shops = Array.isArray(shopsResult) ? shopsResult : []
    
    if (!shops || shops.length === 0) {
      return res.status(403).json({ success: false, message: '无权访问该店铺' })
    }
    
    const productsResult = await query(
      `SELECT p.*,
              COALESCE(SUM(oi.quantity), 0) as sales_count,
              GROUP_CONCAT(DISTINCT c.id) as category_ids,
              GROUP_CONCAT(DISTINCT c.name) as category_names
       FROM products p
       LEFT JOIN product_categories pc ON p.id = pc.product_id
       LEFT JOIN categories c ON pc.category_id = c.id
       LEFT JOIN order_items oi ON p.id = oi.product_id
       LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN (2, 3, 4, 5)
       WHERE p.shop_id = ? AND p.deleted = 0
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [shopId]
    )
    
    const products = Array.isArray(productsResult) ? productsResult : []
    products.forEach(p => {
      p.price = parseFloat(p.price) || 0
      p.sales_count = parseInt(p.sales_count) || 0
      
      // 处理分类信息
      if (p.category_ids) {
        const ids = p.category_ids.split(',')
        const names = p.category_names.split(',')
        p.categories = ids.map((id, i) => ({ id: parseInt(id), name: names[i] }))
      } else {
        p.categories = []
      }
      delete p.category_ids
      delete p.category_names
      
      // 添加 image 字段（取 images 数组的第一个）
      if (p.images) {
        try {
          p.images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images
          p.image = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : ''
        } catch (e) {
          p.images = []
          p.image = ''
        }
      } else {
        p.image = ''
      }
    })
    
    res.json({ success: true, data: products })
  } catch (error) {
    console.error('获取商品列表失败:', error)
    res.status(500).json({ success: false, message: '获取商品列表失败' })
  }
}

// 搜索店铺
async function searchShops(req, res) {
  try {
    const { keyword } = req.query
    
    if (!keyword) {
      return res.status(400).json({ success: false, message: '搜索关键词不能为空' })
    }
    
    const sql = `
      SELECT id, name, description, logo_url, banner_url, status, is_brand, created_at
      FROM shops
      WHERE (name LIKE ? OR description LIKE ?)
      ORDER BY status DESC, created_at DESC
    `
    
    const shops = await query(sql, [`%${keyword}%`, `%${keyword}%`])
    
    res.json({ success: true, data: shops })
  } catch (error) {
    console.error('搜索店铺失败:', error)
    res.status(500).json({ success: false, message: '搜索店铺失败' })
  }
}

// ==================== 品牌管理相关 ====================

/**
 * 获取品牌列表（品牌店铺列表）
 */
async function getBrands(req, res) {
  try {
    const { keyword } = req.query
    
    let whereConditions = ['s.is_brand = 1']
    let queryParams = []
    
    if (keyword && keyword.trim()) {
      whereConditions.push('(s.name LIKE ? OR s.description LIKE ?)')
      const keywordPattern = `%${keyword}%`
      queryParams.push(keywordPattern, keywordPattern)
    }
    
    const whereClause = whereConditions.join(' AND ')
    
    // 查询所有品牌店铺，返回店铺ID
    const brandsResult = await query(
      `SELECT 
         s.id as shop_id,
         s.name as brand_name,
         s.logo_url,
         s.description,
         s.status,
         s.brand_certified_at
       FROM shops s
       WHERE ${whereClause}
       ORDER BY s.brand_certified_at DESC`,
      queryParams
    )
    
    const brands = Array.isArray(brandsResult) ? brandsResult : []
    
    res.json({
      success: true,
      data: brands
    })
  } catch (error) {
    console.error('获取品牌列表失败:', error)
    res.status(500).json({ 
      success: false, 
      message: '获取品牌列表失败',
      error: error.message 
    })
  }
}

/**
 * 获取品牌店铺列表
 */
async function getBrandShops(req, res) {
  try {
    const { page = 1, pageSize = 10, keyword } = req.query
    
    let whereConditions = ['s.is_brand = 1']
    let queryParams = []
    
    if (keyword && keyword.trim()) {
      whereConditions.push('(s.name LIKE ? OR s.description LIKE ?)')
      const keywordPattern = `%${keyword}%`
      queryParams.push(keywordPattern, keywordPattern)
    }
    
    const whereClause = whereConditions.join(' AND ')
    const offset = (parseInt(page) - 1) * parseInt(pageSize)

    const shopsResult = await query(
      `SELECT s.*, u.username as owner_username, u.phone as owner_phone
       FROM shops s
       LEFT JOIN users u ON s.user_id = u.id
       WHERE ${whereClause}
       ORDER BY s.brand_certified_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(pageSize), offset]
    )

    const shopsArray = Array.isArray(shopsResult) ? shopsResult : []

    const countResultResult = await query(
      `SELECT COUNT(*) as total FROM shops s WHERE ${whereClause}`,
      queryParams
    )
    const countResult = Array.isArray(countResultResult) && countResultResult.length > 0 ? countResultResult[0] : { total: 0 }
    
    res.json({
      success: true,
      data: shopsArray,
      total: countResult.total || 0,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    })
  } catch (error) {
    console.error('获取品牌店铺列表失败:', error)
    res.status(500).json({ 
      success: false, 
      message: '获取品牌店铺列表失败',
      error: error.message 
    })
  }
}

/**
 * 根据品牌名称获取店铺列表（移动端）
 */
async function getBrandShopsByName(req, res) {
  try {
    const { brand } = req.query
    
    if (!brand) {
      return res.status(400).json({
        success: false,
        message: '请提供品牌名称'
      })
    }
    
    const shopsResult = await query(
      `SELECT s.*, u.username as owner_username, u.phone as owner_phone
       FROM shops s
       LEFT JOIN users u ON s.user_id = u.id
       WHERE s.is_brand = 1 AND s.name = ?
       ORDER BY s.brand_certified_at DESC`,
      [brand]
    )
    
    const shops = Array.isArray(shopsResult) ? shopsResult : []
    
    res.json({
      success: true,
      data: shops
    })
  } catch (error) {
    console.error('获取品牌店铺失败:', error)
    res.status(500).json({ 
      success: false, 
      message: '获取品牌店铺失败',
      error: error.message 
    })
  }
}

/**
 * 添加店铺为品牌
 */
async function addBrandShop(req, res) {
  try {
    const { shopId } = req.body
    
    // 检查店铺是否存在
    const shopsCheckResult = await query('SELECT * FROM shops WHERE id = ?', [shopId])
    const shopsCheck = Array.isArray(shopsCheckResult) ? shopsCheckResult : []
    if (!shopsCheck || shopsCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: '店铺不存在'
      })
    }

    // 检查是否已经是品牌
    if (shopsCheck[0].is_brand === 1) {
      return res.status(400).json({
        success: false,
        message: '该店铺已经是品牌店铺'
      })
    }

    // 更新为品牌店铺
    await query(
      `UPDATE shops 
       SET is_brand = 1, brand_certified_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [shopId]
    )
    
    res.json({
      success: true,
      message: '成功添加为品牌店铺'
    })
  } catch (error) {
    console.error('添加品牌店铺失败:', error)
    res.status(500).json({ 
      success: false, 
      message: '添加品牌店铺失败',
      error: error.message 
    })
  }
}

/**
 * 移除品牌店铺
 */
async function removeBrandShop(req, res) {
  try {
    const { shopId } = req.params
    
    // 检查店铺是否存在
    const shopsCheckResult = await query('SELECT * FROM shops WHERE id = ?', [shopId])
    const shopsCheck = Array.isArray(shopsCheckResult) ? shopsCheckResult : []
    if (!shopsCheck || shopsCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: '店铺不存在'
      })
    }

    // 更新为普通店铺
    await query(
      `UPDATE shops 
       SET is_brand = 0, brand_certified_at = NULL 
       WHERE id = ?`,
      [shopId]
    )
    
    res.json({
      success: true,
      message: '已移除品牌店铺标识'
    })
  } catch (error) {
    console.error('移除品牌店铺失败:', error)
    res.status(500).json({ 
      success: false, 
      message: '移除品牌店铺失败',
      error: error.message 
    })
  }
}


module.exports = {
  apply,
  getStatus,
  getShopInfoForMobile,
  getShopProductsForMobile,
  getShopCategories,
  getShopOrders,
  getShopStats,
  getAllShops,
  getNonBrandShops,
  getShopDetail,
  updateShopInfo,
  deleteShop,
  getPendingList,
  getReviewedList,
  reviewApplication,
  getShop,
  updateShop,
  getShopReviews,
  getShopProducts,
  updateOrderStatus,
  getOrderDetail,
  getReturnReasons,
  getSizeDistribution,
  searchShops,
  getAnnouncements,
  // 品牌管理相关
  getBrands,
  getBrandShops,
  getBrandShopsByName,
  addBrandShop,
  removeBrandShop,
}



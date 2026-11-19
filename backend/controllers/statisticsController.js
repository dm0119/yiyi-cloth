const { query } = require('../db/connection')

const statisticsController = {
  // 获取综合统计数据
  async getOverview(req, res) {
    try {
      const { days = 30 } = req.query
      const daysNum = parseInt(days) || 30
      
      // 获取用户总数
      const [userCount] = await query('SELECT COUNT(*) as count FROM users WHERE status = 1')
      
      // 获取商品总数
      const [productCount] = await query('SELECT COUNT(*) as count FROM products WHERE status = 1 AND deleted = 0')
      
      // 获取订单总数（所有订单，不受时间范围限制）
      const [orderCount] = await query('SELECT COUNT(*) as count FROM orders')
      
      // 获取今日订单数
      const [todayOrderCount] = await query('SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = CURDATE()')
      
      // 获取今日销售额
      const [todaySales] = await query('SELECT COALESCE(SUM(total_amount), 0) as amount FROM orders WHERE status IN (5, 2) AND DATE(created_at) = CURDATE()')
      
      // 获取总销售额（带时间范围）
      const [totalSales] = await query(
        'SELECT COALESCE(SUM(total_amount), 0) as amount FROM orders WHERE status IN (5, 2) AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)',
        [daysNum]
      )
      
      // 获取待处理订单数
      const [pendingOrderCount] = await query('SELECT COUNT(*) as count FROM orders WHERE status = 1')
      
      // 获取店铺总数
      const [shopCount] = await query('SELECT COUNT(*) as count FROM shops')
      
      // 获取品牌店铺数
      const [brandShopCount] = await query('SELECT COUNT(*) as count FROM shops WHERE is_brand = 1')
      
      // 获取总销量（所有订单项的数量总和）
      const [totalSalesVolume] = await query('SELECT COALESCE(SUM(quantity), 0) as count FROM order_items')
      
      // 获取今日注册用户数
      const [todayRegistrations] = await query('SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = CURDATE()')
      
      res.json({
        success: true,
        data: {
          userCount: userCount.count,
          productCount: productCount.count,
          orderCount: orderCount.count,
          todayOrderCount: todayOrderCount.count,
          todaySales: parseFloat(todaySales.amount) || 0,
          totalSales: parseFloat(totalSales.amount) || 0,
          pendingOrderCount: pendingOrderCount.count,
          shopCount: shopCount.count,
          brandShopCount: brandShopCount.count,
          totalSalesVolume: totalSalesVolume.count || 0,
          todayRegistrations: todayRegistrations.count || 0
        }
      })
    } catch (error) {
      console.error('获取统计数据失败:', error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  // 获取订单状态分布
  async getStatusDistribution(req, res) {
    try {
      const [distribution] = await query(`
        SELECT status, COUNT(*) as count 
        FROM orders 
        GROUP BY status
      `)
      
      if (!distribution || !Array.isArray(distribution)) {
        return res.json({ success: true, data: {} })
      }
      
      const result = {}
      distribution.forEach(item => {
        result[item.status] = item.count
      })
      
      res.json({ success: true, data: result })
    } catch (error) {
      console.error('获取订单状态分布失败:', error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  // 获取订单趋势
  async getOrderTrend(req, res) {
    try {
      const { period = 'day', days = 7 } = req.query
      
      let dateFormat = '%Y-%m-%d'
      let dateCondition = "DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)"
      
      if (period === 'month') {
        dateFormat = '%Y-%m'
        dateCondition = "DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)"
      } else if (period === 'year') {
        dateFormat = '%Y'
        dateCondition = "DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL ? YEAR)"
      }
      
      const [trend] = await query(`
        SELECT DATE_FORMAT(created_at, ?) as date, 
               COUNT(*) as count, 
               COALESCE(SUM(total_amount), 0) as amount
        FROM orders
        WHERE ${dateCondition}
        GROUP BY DATE_FORMAT(created_at, ?)
        ORDER BY date
      `, [dateFormat, parseInt(days), dateFormat])
      
      if (!trend || !Array.isArray(trend)) {
        return res.json({ success: true, data: [] })
      }
      
      res.json({ success: true, data: trend })
    } catch (error) {
      console.error('获取订单趋势失败:', error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  // 获取尺码分布
  async getSizeDistribution(req, res) {
    try {
      const { period = 'all' } = req.query
      
      let condition = ''
      if (period !== 'all') {
        condition = "AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)"
      }
      
      const [distribution] = await query(`
        SELECT oi.size, COUNT(*) as count
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status IN (5, 2, 3, 4)
        ${condition}
        GROUP BY oi.size
        ORDER BY count DESC
      `, period !== 'all' ? [parseInt(period)] : [])
      
      if (!distribution || !Array.isArray(distribution)) {
        return res.json({ success: true, data: {} })
      }
      
      const result = {}
      distribution.forEach(item => {
        result[item.size || '未知'] = item.count
      })
      
      res.json({ success: true, data: result })
    } catch (error) {
      console.error('获取尺码分布失败:', error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  // 获取退货原因分布
  async getReturnReasonDistribution(req, res) {
    try {
      const { period = 'all' } = req.query
      
      let condition = ''
      if (period !== 'all') {
        condition = "AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)"
      }
      
      const [distribution] = await query(`
        SELECT reason, COUNT(*) as count
        FROM order_returns
        WHERE status IN (3, 5)
        ${condition}
        GROUP BY reason
        ORDER BY count DESC
      `, period !== 'all' ? [parseInt(period)] : [])
      
      if (!distribution || !Array.isArray(distribution)) {
        return res.json({ success: true, data: {} })
      }
      
      const result = {}
      distribution.forEach(item => {
        result[item.reason || '其他'] = item.count
      })
      
      res.json({ success: true, data: result })
    } catch (error) {
      console.error('获取退货原因分布失败:', error)
      res.status(500).json({ success: false, message: error.message })
    }
  }
}

module.exports = statisticsController

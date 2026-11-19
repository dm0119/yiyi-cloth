const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const sharp = require('sharp')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const http = require('http')
const socketIo = require('socket.io')
const config = require('./config')
const { initTables } = require('./db/tables')
const { query } = require('./db/connection')
const { errorHandler } = require('./utils/errorHandler')
const { authenticateToken } = require('./utils/authMiddleware')
const productRoutes = require('./routes/products')
const mobileProductRoutes = require('./routes/mobile/products')
const orderRoutes = require('./routes/orders')
const mobileOrderRoutes = require('./routes/mobile/orders')
const categoryRoutes = require('./routes/categories')
const mobileCategoryRoutes = require('./routes/mobile/categories')
const reviewRoutes = require('./routes/reviews')
const mobileReviewRoutes = require('./routes/mobile/reviews')
const userRoutes = require('./routes/users')
const roleRoutes = require('./routes/roles')
const mobileUserRoutes = require('./routes/mobile/users')
const uploadRoutes = require('./routes/upload')
const hotProductRoutes = require('./routes/hot-products')
const newProductRoutes = require('./routes/new-products')
const conversationRoutes = require('./routes/conversations')
const couponRoutes = require('./routes/coupons')
const favoritesRoutes = require('./routes/mobile/favorites')
const shopFollowRoutes = require('./routes/mobile/shopFollows')
const mobileAddressRoutes = require('./routes/mobile/addresses')
const historyRoutes = require('./routes/history')
const zoneRoutes = require('./routes/zones')
const mobileZoneRoutes = require('./routes/mobile/zones')
const discussionRoutes = require('./routes/discussions')
const mobileDiscussionRoutes = require('./routes/mobile/discussions')
const reportRoutes = require('./routes/reports')
const mobilePaymentRoutes = require('./routes/mobile/payments')
const paymentController = require('./controllers/paymentController')
const merchantRoutes = require('./routes/merchants')
const shopRoutes = require('./routes/shops')
const mobileMerchantRoutes = require('./routes/mobile/merchants')
const mobileCartRoutes = require('./routes/mobile/cart')
const brandRoutes = require('./routes/brands')
const realNameRoutes = require('./routes/realName')
const payPasswordRoutes = require('./routes/user/payPassword')
const mobilePayPasswordRoutes = require('./routes/mobile/payPassword')
const afterSaleRoutes = require('./routes/afterSales')
const mobileAfterSaleRoutes = require('./routes/mobile/afterSales')
const internalMessageRoutes = require('./routes/internalMessages')

const userController = require('./controllers/userController')
const statisticsController = require('./controllers/statisticsController')
const statisticsRoutes = require('./routes/statistics')

const app = express()

const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

app.use(cors())
app.use('/uploads', express.static(uploadsDir))

// 先注册全局中间件
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 然后注册上传路由
app.use('/api/upload', uploadRoutes)

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  res.set('Pragma', 'no-cache')
  res.set('Expires', '0')
  next()
})

// 保留简单的日志输出用于开发调试
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})



app.use('/api/products', productRoutes)
app.use('/api/mobile/products', mobileProductRoutes)
app.use('/api/orders', authenticateToken, orderRoutes)
app.use('/api/mobile/orders', authenticateToken, mobileOrderRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/mobile/categories', mobileCategoryRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/mobile/reviews', mobileReviewRoutes)
app.use('/api/users', userRoutes)
app.use('/api/roles', roleRoutes)
app.use('/api/hot-products', hotProductRoutes)
app.use('/api/new-products', newProductRoutes)
app.use('/api/conversations', conversationRoutes)
app.use('/api/mobile/conversations', conversationRoutes)
app.use('/api/coupons', couponRoutes)
app.use('/api/mobile/coupons', couponRoutes)
app.use('/api/mobile/favorites', authenticateToken, favoritesRoutes)
app.use('/api/mobile/shop-follows', authenticateToken, shopFollowRoutes)
app.use('/api/mobile/addresses', authenticateToken, mobileAddressRoutes)
app.use('/api/mobile/zones', mobileZoneRoutes)
app.use('/api/history', authenticateToken, historyRoutes)
app.use('/api/zones', zoneRoutes)
app.use('/api/discussions', discussionRoutes)
app.use('/api/mobile/discussions', mobileDiscussionRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/mobile/reports', reportRoutes)
app.use('/api/mobile/payments', authenticateToken, mobilePaymentRoutes)
app.use('/api/merchants', merchantRoutes)
app.use('/api/shops', shopRoutes)
app.use('/api/mobile/merchants', mobileMerchantRoutes)
app.use('/api/mobile/cart', mobileCartRoutes)
app.use('/api/brands', brandRoutes)
app.use('/api/statistics', statisticsRoutes)
app.use('/api/real-name-applications', realNameRoutes)
app.use('/api/user/pay-password', payPasswordRoutes)
app.use('/api/mobile/pay-password', mobilePayPasswordRoutes)
app.use('/api/after-sales', authenticateToken, afterSaleRoutes)
app.use('/api/mobile/after-sales', authenticateToken, mobileAfterSaleRoutes)
app.use('/api/messages', authenticateToken, internalMessageRoutes)

// 路由匹配检查中间件（生产环境可移除）
app.use((req, res, next) => {
  // 生产环境中可移除路由匹配日志
  next()
})

app.use('/api/mobile/users', mobileUserRoutes)

// 管理员登录路由
app.post('/api/admin/login', userController.adminLogin)

// 通用登录路由（前端 API 调用）- 使用普通登录方法，支持所有角色
app.post('/api/auth/login', userController.login)

// 直接添加注册端点用于测试
app.post('/api/mobile/users/register', async (req, res) => {
  try {
    const { username, password, phone, name, email, pay_password } = req.body
    
    // 验证必填字段
    if (!username || !password || !phone) {
      return res.status(400).json({ success: false, message: '用户名、密码和手机号不能为空' })
    }
    
    // 检查用户名是否已存在
    const existingUser = await query('SELECT id FROM users WHERE username = ?', [username])
    if (existingUser && existingUser.length > 0) {
      return res.status(400).json({ success: false, message: '用户名已存在' })
    }
    
    // 检查手机号是否已存在
    const existingPhone = await query('SELECT id FROM users WHERE phone = ?', [phone])
    if (existingPhone && existingPhone.length > 0) {
      return res.status(400).json({ success: false, message: '手机号已被注册' })
    }
    
    // 密码加密
    const hashedPassword = bcrypt.hashSync(password, 10)
    
    // 获取默认用户角色（买家角色）
    const [buyerRole] = await query('SELECT id FROM roles WHERE name = ?', ['买家'])
    const buyerRoleId = buyerRole ? buyerRole.id : 2
    
    // 处理支付密码（如果提供）
    let payPasswordHash = null
    let payPasswordStatus = 0
    if (pay_password) {
      if (!/^\d{6}$/.test(pay_password)) {
        return res.status(400).json({ success: false, message: '支付密码必须为6位数字' })
      }
      const crypto = require('crypto')
      payPasswordHash = crypto.createHash('sha256').update(String(pay_password)).digest('hex')
      payPasswordStatus = 1
    }
    
    // 创建用户
    const result = await query(
      'INSERT INTO users (username, password, email, phone, name, role_id, status, pay_password, pay_password_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [username, hashedPassword, email || null, phone, name || username, buyerRoleId, 1, payPasswordHash, payPasswordStatus]
    )
    
    res.json({ 
      success: true, 
      message: pay_password ? '注册成功，支付密码已设置' : '注册成功', 
      data: { 
        userId: result.insertId,
        payPasswordSet: payPasswordStatus === 1
      } 
    })
  } catch (error) {
    console.error('注册错误:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// 支付相关API
app.post('/api/payments/simulate-pay', authenticateToken, paymentController.simulatePay)

// 用户登出
app.post('/api/logout', (req, res) => {
  res.json({ success: true, message: '登出成功' })
})

app.get('/api/health', async (req, res) => {
  try {
    res.json({ 
      status: 'ok', 
      message: '服务器运行正常'
    })
  } catch (error) {
    res.json({ 
      status: 'ok', 
      message: '服务器运行正常'
    })
  }
})



// 导入定时任务
const { startExpiredOrderChecker } = require('./jobs');

// 启动服务器
async function startServer() {
  try {
    // 初始化数据库表
    console.log('初始化数据库表...')
    await initTables()
    console.log('数据库表初始化完成')
    
    // 检查是否需要清空订单数据（用于测试）
    if (process.env.CLEAR_ORDERS === 'true') {
      console.log('\n=== 检测到 CLEAR_ORDERS=true，正在清空订单数据... ===\n')
      const { withTransaction } = require('./db/connection')
      await withTransaction(async (connection) => {
        await connection.query('SET FOREIGN_KEY_CHECKS = 0')
        // 只清空订单相关数据
        await connection.query('DELETE FROM order_returns')
        await connection.query('DELETE FROM logistics')
        await connection.query('DELETE FROM order_items')
        await connection.query('DELETE FROM orders')
        await connection.query('SET FOREIGN_KEY_CHECKS = 1')
      })
      console.log('✅ 订单数据已清空！可以重新开始测试\n')
    }
    
    // 创建HTTP服务器
    const server = http.createServer(app)
    
    // 创建Socket.io实例
    const io = socketIo(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    })
    
    // Socket.io事件处理
    io.on('connection', (socket) => {
      
      // 用户加入会话房间
      socket.on('join-conversation', (conversationId) => {
        socket.join(conversationId)
      })
      
      // 用户发送消息
      socket.on('send-message', (messageData) => {
        const { conversationId, senderId, senderRole, content, type = 'text' } = messageData
        
        // 检查会话是否存在
        query('SELECT id, status FROM conversations WHERE id = ?', [conversationId])
          .then(conversations => {
            const conversation = conversations[0]
            
            if (!conversation) {
              socket.emit('message-error', { error: '会话不存在' })
              return Promise.reject('会话不存在')
            }
            
            // 如果会话已关闭，自动重新开启
            if (conversation.status === 'closed') {
              return query('UPDATE conversations SET status = ? WHERE id = ?', ['active', conversationId])
                .then(() => conversation)
            }
            return conversation
          })
          .then(conversation => {
            // 插入消息
            return query('INSERT INTO messages (conversation_id, sender_id, sender_role, content, type) VALUES (?, ?, ?, ?, ?)',
              [conversationId, senderId, senderRole, content, type])
          })
          .then(result => {
            // 更新会话的更新时间
            return query('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [conversationId])
              .then(() => result)
          })
          .then(result => {
            // 获取完整的消息信息
            return query('SELECT * FROM messages WHERE id = ?', [result.insertId])
          })
          .then(messages => {
            const message = messages[0]
            // 向会话房间内的所有用户发送消息
            io.to(conversationId).emit('new-message', message)
          })
          .catch(error => {
            console.error('发送消息失败:', error)
            socket.emit('message-error', { error: '发送消息失败' })
          })
      })
      
      // 标记消息为已读
      socket.on('mark-read', (data) => {
        const { conversationId, userId, role } = data
        
        query(`UPDATE messages 
               SET is_read = 1 
               WHERE conversation_id = ? AND sender_role != ?`,
              [conversationId, role])
          .then(() => {
            // 向会话房间内的所有用户发送已读通知
            io.to(conversationId).emit('messages-read', { conversationId, userId })
          })
          .catch(error => {
            console.error('标记消息为已读失败:', error)
          })
      })
      
      // 用户断开连接
      socket.on('disconnect', () => {
      })
    })
    
    // 启动服务器
    server.listen(config.server.port, () => {
      console.log(`服务器启动成功，端口: ${config.server.port}`)
      console.log(`Socket.io服务器已启动`)
      
      // 启动订单过期定时任务（每5分钟检查一次）
      startExpiredOrderChecker()
    })
  } catch (error) {
    console.error('服务器启动失败:', error)
    process.exit(1)
  }
}

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
startServer().catch(error => {
  console.error('启动服务器失败:', error);
  process.exit(1);
});

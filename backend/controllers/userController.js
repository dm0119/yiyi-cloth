const { query } = require('../db/connection')
const bcrypt = require('bcryptjs')
const { formatDate } = require('../utils/dateFormatter')
const { ROLE_NAMES, ROLE_IDS, getAllPermissionCodes } = require('../config/permissions')
const { logger } = require('../utils/logger')
const { businessLogger } = require('../services/businessLogger')

const userController = {
  async register(req, res) {
    try {
      const { username, password, phone, name, email, id_card, pay_password } = req.body
      
      // 验证必填字段
      if (!username || !password || !phone) {
        return res.status(400).json({ success: false, message: '用户名、密码和手机号不能为空' })
      }
      
      // 如果提供了身份证号，验证格式并自动更新实名状态
      let realNameStatus = 'none'
      let idCardNumber = null
      if (id_card) {
        // 简单的身份证号格式验证（18 位）
        const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/
        if (!idCardRegex.test(id_card)) {
          return res.status(400).json({ success: false, message: '身份证号格式不正确' })
        }
        idCardNumber = id_card
        // 注册时填写身份证号，状态设为已认证（简化流程）
        realNameStatus = 'approved'
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
      
      // 获取默认用户角色（买家角色）
      const [buyerRole] = await query('SELECT id FROM roles WHERE name = ?', [ROLE_NAMES.BUYER])
      const buyerRoleId = buyerRole ? buyerRole.id : ROLE_IDS.BUYER
      
      // 密码加密
      const hashedPassword = bcrypt.hashSync(password, 10)
      
      // 处理支付密码（如果提供了）
      let payPasswordHash = null
      let payPasswordStatus = 0
      if (pay_password) {
        // 验证支付密码格式（6 位数字）
        if (!/^\d{6}$/.test(pay_password)) {
          return res.status(400).json({ success: false, message: '支付密码必须为 6 位数字' })
        }
        // 加密支付密码
        const crypto = require('crypto')
        payPasswordHash = crypto.createHash('sha256').update(String(pay_password)).digest('hex')
        payPasswordStatus = 1
      }
      
      // 创建用户
      const result = await query(
        'INSERT INTO users (username, password, email, phone, name, role_id, status, real_name_status, id_card_number, pay_password, pay_password_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [username, hashedPassword, email || null, phone, name, buyerRoleId, 1, realNameStatus, idCardNumber, payPasswordHash, payPasswordStatus]
      )
      
      // 获取新创建的用户信息
      const [newUser] = await query('SELECT id, username, real_name, email, phone, role_id, status, real_name_status, pay_password_status FROM users WHERE id = ?', [result.insertId])
      
      // 生成 JWT token
      const jwt = require('jsonwebtoken')
      const config = require('../config')
      const token = jwt.sign(
        { id: newUser.id, username: newUser.username, name: newUser.real_name },
        config.jwtSecret || 'your-secret-key',
        { expiresIn: '24h' }
      )
      
      res.json({ success: true, message: '注册成功', data: { user: newUser, token } })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  async login(req, res) {
    try {
      const { username, password } = req.body
      
      // 验证必填字段
      if (!username || !password) {
        return res.status(400).json({ success: false, message: '用户名和密码不能为空' })
      }
      
      // 查询用户
      const [user] = await query('SELECT * FROM users WHERE username = ?', [username])
      if (!user) {
        return res.status(401).json({ success: false, message: '用户名或密码错误' })
      }
      
      // 检查用户状态
      if (user.status !== 1) {
        return res.status(401).json({ success: false, message: '账号已被禁用' })
      }
      
      // 验证密码
      const passwordMatch = bcrypt.compareSync(String(password), user.password)
      if (!passwordMatch) {
        return res.status(401).json({ success: false, message: '用户名或密码错误' })
      }
      
      // 查询用户角色和权限
      let role = null
      if (user.role_id) {
        const [results] = await query('SELECT name, permissions FROM roles WHERE id = ?', [user.role_id])
        if (results) {
          role = results
        }
      }
      
      // 获取用户店铺信息
      let shop = null
      const [shopResult] = await query('SELECT * FROM shops WHERE user_id = ?', [user.id])
      if (shopResult) {
        shop = shopResult
      }
      
      // 处理权限格式，确保返回数组
      let permissions = []
      if (role && role.permissions) {
        // 超级管理员拥有所有权限
        if (role.name === '超级管理员') {
          const { getAllPermissionCodes } = require('../config/permissions')
          permissions = ['all', ...getAllPermissionCodes()]
        } else if (Array.isArray(role.permissions)) {
          permissions = role.permissions
        } else if (typeof role.permissions === 'string') {
          try {
            permissions = JSON.parse(role.permissions)
          } catch (e) {
            // 如果解析失败，尝试按逗号分割
            permissions = role.permissions.split(',').map(p => p.trim())
          }
        } else if (typeof role.permissions === 'object') {
          // 如果是对象，直接使用
          permissions = role.permissions
        }
      }
      
      // 生成JWT token
      const jwt = require('jsonwebtoken')
      const config = require('../config')
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          name: user.name,
          role: role ? role.name : null,
          shopId: shop ? shop.id : null,
          permissions: permissions
        },
        config.jwtSecret || 'your-secret-key',
        { expiresIn: '24h' }
      )
      
      // 记录登录日志
      businessLogger.logLogin(user.id, user.username, true, req.ip)
      logger.logLogin(user.username, true, req.ip, user.id)
      
      // 构造返回数据
      res.json({
        success: true,
        message: '登录成功',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            name: user.name,
            role: role ? role.name : null,
            shop: shop
          },
          permissions: permissions
        }
      })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async adminLogin(req, res) {
    try {
      const { username, password } = req.body
      
      // 验证必填字段
      if (!username || !password) {
        return res.status(400).json({ success: false, message: '用户名和密码不能为空' })
      }
      
      // 查询用户（支持用户名、手机号、邮箱登录）
      const [user] = await query(
        'SELECT * FROM users WHERE username = ? OR phone = ? OR email = ?',
        [username, username, username]
      )
      if (!user) {
        return res.status(401).json({ success: false, message: '用户名或密码错误' })
      }
      
      // 检查用户状态
      if (user.status !== 1) {
        return res.status(401).json({ success: false, message: '账号已被禁用' })
      }
      
      // 验证密码
      const passwordMatch = bcrypt.compareSync(String(password), user.password)
      if (!passwordMatch) {
        return res.status(401).json({ success: false, message: '用户名或密码错误' })
      }
      
      // 查询用户角色和权限
      let role = null
      let permissions = []
      if (user.role_id) {
        const [results] = await query('SELECT name, permissions FROM roles WHERE id = ?', [user.role_id])
        console.log('角色查询结果:', results)
        if (results) {
          role = results
          
          // 处理权限格式，确保返回数组
          if (role.name === '超级管理员') {
            // 超级管理员拥有所有权限
            permissions = ['all', ...getAllPermissionCodes()]
          } else if (role.permissions) {
            if (Array.isArray(role.permissions)) {
              permissions = role.permissions
            } else if (typeof role.permissions === 'string') {
              try {
                permissions = JSON.parse(role.permissions)
              } catch (e) {
                permissions = role.permissions.split(',').map(p => p.trim())
              }
            }
          }
        }
      }
      
      // 检查角色是否存在
      if (!role) {
        return res.status(403).json({ success: false, message: '角色不存在，无法登录后台管理系统' })
      }
      
      // 检查是否为买家角色，买家不能登录后台管理系统
      if (role.name === ROLE_NAMES.BUYER) {
        return res.status(403).json({ success: false, message: '买家角色不能登录后台管理系统' })
      }
      
      // 生成JWT token
      const jwt = require('jsonwebtoken')
      const config = require('../config')
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          name: user.name,
          role: role.name,
          permissions: permissions
        },
        config.jwtSecret || 'your-secret-key',
        { expiresIn: '24h' }
      )
      
      // 记录登录日志
      businessLogger.logLogin(user.id, user.username, true, req.ip)
      logger.logLogin(user.username, true, req.ip, user.id)

      // 构造返回数据，格式与前端期望的一致
      res.json({
        success: true,
        message: '登录成功',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            role: role.name,
            role_id: user.role_id
          },
          permissions: permissions
        }
      })
    } catch (error) {
      console.error('登录错误:', error)
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  async getUserInfo(req, res) {
    try {
      const { userId } = req.params
      
      // 查询用户信息（包含实名认证相关字段）
      const [user] = await query(
        'SELECT id, username, email, phone, real_name, role_id, id_card_front, id_card_back, real_name_status FROM users WHERE id = ? AND status = 1', 
        [userId]
      )
      if (!user) {
        return res.status(404).json({ success: false, message: '用户不存在' })
      }
      
      // 查询用户角色和权限
      const [role] = await query('SELECT name, permissions FROM roles WHERE id = ?', [user.role_id])
      
      // 构造返回数据
      const userInfo = {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        name: user.real_name,
        role: role.name,
        permissions: role.permissions,
        // 实名认证相关
        id_card_front: user.id_card_front,
        id_card_back: user.id_card_back,
        real_name_status: user.real_name_status
      }
      
      res.json({ success: true, data: userInfo })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  async updateUserInfo(req, res) {
    try {
      console.log('=== 开始处理用户信息更新请求 ===')
      
      // 记录完整的请求信息
      console.log('请求方法:', req.method)
      console.log('请求 URL:', req.url)
      console.log('请求参数:', req.params)
      console.log('请求体:', req.body)
      console.log('请求头:', req.headers)
      
      const { userId } = req.params
      const { name, phone, email, username, role_id, status } = req.body
      
      // 验证必填字段
      console.log('验证必填字段 - name:', name, 'phone:', phone)
      if (!name || !phone) {
        console.log('必填字段验证失败')
        return res.status(400).json({ success: false, message: '姓名和手机号不能为空' })
      }
      
      // 验证 role_id 是否有效（如果提供了）
      if (role_id !== undefined && role_id !== null) {
        const [role] = await query('SELECT id FROM roles WHERE id = ?', [role_id])
        if (!role) {
          return res.status(400).json({ success: false, message: '无效的角色 ID' })
        }
      }
      
      // 检查手机号是否已被其他用户使用
      console.log('检查手机号是否已被其他用户使用:', phone, '排除用户 ID:', userId)
      const [existingPhone] = await query('SELECT id FROM users WHERE phone = ? AND id != ?', [phone, userId])
      if (existingPhone) {
        console.log('手机号已被使用:', existingPhone)
        return res.status(400).json({ success: false, message: '手机号已被其他用户使用' })
      }
      
      // 更新用户信息
      console.log('准备执行 SQL 更新操作:')
      console.log('用户 ID:', userId)
      console.log('更新字段 - name:', name)
      console.log('更新字段 - phone:', phone)
      console.log('更新字段 - email:', email)
      console.log('更新字段 - username:', username)
      console.log('更新字段 - role_id:', role_id)
      console.log('更新字段 - status:', status)
      
      // 如果要修改username,需要检查是否与其他用户重复
      if (username) {
        const [existingUsername] = await query('SELECT id FROM users WHERE username = ? AND id != ?', [username, userId])
        if (existingUsername) {
          return res.status(400).json({ success: false, message: '用户名已被使用' })
        }
      }
      
      // 动态构建SQL,只更新提供的字段
      const updateFields = []
      const updateParams = []
      
      if (name !== undefined) {
        updateFields.push('name = ?')
        updateParams.push(name)
      }
      if (phone !== undefined) {
        updateFields.push('phone = ?')
        updateParams.push(phone)
      }
      if (email !== undefined) {
        updateFields.push('email = ?')
        updateParams.push(email)
      }
      if (username !== undefined) {
        updateFields.push('username = ?')
        updateParams.push(username)
      }
      if (role_id !== undefined) {
        updateFields.push('role_id = ?')
        updateParams.push(role_id)
      }
      if (status !== undefined) {
        updateFields.push('status = ?')
        updateParams.push(status)
      }
      
      updateParams.push(userId)
      
      const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`
      const params = updateParams
      
      console.log('执行 SQL:', sql)
      console.log('SQL 参数:', params)
      
      const result = await query(sql, params)
      
      console.log('SQL 执行结果:', {
        affectedRows: result.affectedRows,
        changedRows: result.changedRows,
        insertId: result.insertId,
        serverStatus: result.serverStatus,
        warningStatus: result.warningStatus,
        info: result.info
      })
      
      // 验证更新是否成功
      if (result.affectedRows === 1) {
        console.log('更新操作成功，影响行数:', result.affectedRows)
        console.log('实际修改行数:', result.changedRows)
        
        // 更新成功后，查询用户信息验证
        console.log('验证数据库中实际存储的数据:')
        const [updatedUser] = await query('SELECT * FROM users WHERE id = ?', [userId])
        console.log('数据库中存储的用户信息:', {
          id: updatedUser.id,
          username: updatedUser.username,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role_id: updatedUser.role_id,
          status: updatedUser.status,
          updated_at: updatedUser.updated_at
        })
      } else {
        console.log('更新操作未影响任何行，可能用户不存在或数据未变化')
      }
      
      res.json({ success: true, message: '用户信息更新成功' })
    } catch (error) {
      console.error('更新用户信息错误:', error)
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  async changePassword(req, res) {
    try {
      const { userId } = req.params
      const { oldPassword, newPassword } = req.body
      
      // 验证必填字段
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ success: false, message: '旧密码和新密码不能为空' })
      }
      
      // 查询用户
      const [user] = await query('SELECT password FROM users WHERE id = ?', [userId])
      if (!user) {
        return res.status(404).json({ success: false, message: '用户不存在' })
      }
      
      // 验证旧密码
      const passwordMatch = bcrypt.compareSync(oldPassword, user.password)
      if (!passwordMatch) {
        return res.status(400).json({ success: false, message: '旧密码错误' })
      }
      
      // 加密新密码
      const hashedNewPassword = bcrypt.hashSync(newPassword, 10)
      
      // 更新密码
      await query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, userId])
      
      res.json({ success: true, message: '密码修改成功' })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async getUserList(req, res) {
    try {
      // 获取分页参数，默认每页10条数据
      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 10
      const offset = (page - 1) * limit
      
      // 获取筛选参数
      const { username, phone, role_id, status } = req.query
      
      // 构建查询条件
      let whereClause = 'WHERE 1=1'
      const params = []
      
      if (username) {
        whereClause += ' AND username LIKE ?'
        params.push(`%${username}%`)
      }
      if (phone) {
        whereClause += ' AND phone LIKE ?'
        params.push(`%${phone}%`)
      }
      if (role_id) {
        whereClause += ' AND role_id = ?'
        params.push(parseInt(role_id))
      }
      if (status !== undefined && status !== '') {
        whereClause += ' AND status = ?'
        params.push(parseInt(status))
      }
      
      // 查询总用户数
      const [totalResult] = await query(`SELECT COUNT(*) as total FROM users ${whereClause}`, params)
      const total = totalResult.total
      
      // 查询分页用户数据（包含实名认证状态）
      const queryParams = [...params, limit, offset]
      const users = await query(
        `SELECT id, username, name as real_name, email, phone, role_id, status, real_name_status, created_at FROM users ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`,
        queryParams
      )
      
      // 为每个用户获取角色信息并格式化日期
      const usersWithRoles = await Promise.all(users.map(async (user) => {
        let roleName = null
        
        if (user.role_id) {
          try {
            const [role] = await query('SELECT name FROM roles WHERE id = ?', [user.role_id])
            if (role) {
              roleName = role.name
            }
          } catch (roleError) {
            console.warn(`获取角色信息失败 (role_id: ${user.role_id}):`, roleError.message)
            roleName = `角色ID: ${user.role_id}`
          }
        }
        
        return {
          ...user,
          created_at: formatDate(user.created_at),
          role: roleName
        }
      }))
      
      res.json({ 
        success: true, 
        data: {
          users: usersWithRoles,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  // 删除用户
  async deleteUser(req, res) {
    try {
      const { userId } = req.params
      console.log('deleteUser 被调用，userId:', userId)
      
      // 超级管理员不能删除
      if (userId === '1') {
        console.log('尝试删除超级管理员')
        return res.status(403).json({ success: false, message: '超级管理员用户不能删除' })
      }
      
      console.log('准备删除用户，userId:', userId, 'type:', typeof userId)
      
      // 执行删除操作
      const result = await query('DELETE FROM users WHERE id = ?', [userId])
      console.log('删除结果:', result)
      
      if (result.affectedRows === 0) {
        console.log('删除失败，affectedRows 为 0')
        return res.status(404).json({ success: false, message: '用户不存在' })
      }
      
      console.log('删除成功')
      res.json({ success: true, message: '用户删除成功' })
    } catch (error) {
      console.error('删除用户出错:', error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  // 更新用户状态
  async updateStatus(req, res) {
    try {
      const { userId } = req.params
      const { status } = req.body
      
      // 超级管理员状态不能修改
      if (userId === '1') {
        return res.status(403).json({ success: false, message: '超级管理员用户状态不能修改' })
      }
      
      // 执行更新操作
      const result = await query('UPDATE users SET status = ? WHERE id = ?', [status, userId])
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: '用户不存在' })
      }
      
      res.json({ success: true, message: '用户状态更新成功' })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  // 忘记密码：验证用户名和姓名
  async verifyUserInfo(req, res) {
    try {
      console.log('=== 开始处理忘记密码验证请求 ===')
      console.log('请求方法:', req.method)
      console.log('请求URL:', req.url)
      console.log('请求参数:', req.params)
      console.log('请求体:', req.body)
      
      const { username, name } = req.body
      
      // 验证必填字段
      if (!username || !name) {
        console.log('验证失败：用户名或姓名为空', { username, name })
        return res.status(400).json({ success: false, message: '用户名和姓名不能为空' })
      }
      
      console.log('开始查询用户：username =', username)
      // 查询用户
      const [user] = await query('SELECT id, username, real_name, status FROM users WHERE username = ?', [username])
      console.log('查询结果：', user)
      
      if (!user) {
        console.log('验证失败：用户不存在')
        return res.status(404).json({ success: false, message: '用户不存在' })
      }
      
      if (user.status !== 1) {
        console.log('验证失败：用户状态为禁用')
        return res.status(401).json({ success: false, message: '账号已被禁用' })
      }
      
      // 验证姓名
      console.log('验证姓名：数据库中姓名 =', user.real_name, '，输入的姓名 =', name)
      if (user.real_name !== name) {
        console.log('验证失败：姓名不匹配')
        return res.status(401).json({ success: false, message: '姓名验证失败' })
      }
      
      console.log('验证成功：', { userId: user.id, username: user.username })
      res.json({ success: true, message: '验证成功', data: { userId: user.id, username: user.username } })
    } catch (error) {
      console.error('验证过程中发生错误：', error)
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  // 忘记密码：重置密码
  async resetPassword(req, res) {
    try {
      const { userId } = req.params
      const { newPassword } = req.body
      
      // 验证必填字段
      if (!newPassword) {
        return res.status(400).json({ success: false, message: '新密码不能为空' })
      }
      
      // 密码加密
      const hashedPassword = bcrypt.hashSync(newPassword, 10)
      
      // 更新密码
      await query('UPDATE users SET password = ? WHERE id = ? AND status = 1', [hashedPassword, userId])
      
      res.json({ success: true, message: '密码重置成功' })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  // 创建用户（管理员用）
  async create(req, res) {
    try {
      const { username, password, phone, name, email, role_id, status = 1 } = req.body
      
      // 验证必填字段
      if (!username || !password || !phone || !name || !role_id) {
        return res.status(400).json({ success: false, message: '用户名、密码、手机号、姓名和角色不能为空' })
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
      
      // 创建用户
      const result = await query(
        'INSERT INTO users (username, password, email, phone, name, role_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [username, hashedPassword, email, phone, name, role_id, status]
      )
      
      res.json({ success: true, message: '用户创建成功', data: { userId: result.insertId } })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },
  
  async getRegistrationTrend(req, res) {
    try {
      const { period = 'day', days = 30 } = req.query
      
      let dateFormat, groupBy
      switch (period) {
        case 'day':
          dateFormat = '%Y-%m-%d'
          groupBy = 'DATE_FORMAT(created_at, "%Y-%m-%d")'
          break
        case 'week':
          dateFormat = '%Y-%u'
          groupBy = 'DATE_FORMAT(created_at, "%Y-%u")'
          break
        case 'month':
          dateFormat = '%Y-%m'
          groupBy = 'DATE_FORMAT(created_at, "%Y-%m")'
          break
        default:
          dateFormat = '%Y-%m-%d'
          groupBy = 'DATE_FORMAT(created_at, "%Y-%m-%d")'
      }
      
      const trendSql = `
        SELECT 
          DATE_FORMAT(created_at, '${dateFormat}') as date,
          COUNT(*) as user_count
        FROM users 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
        GROUP BY ${groupBy}
        ORDER BY date
      `
      const trend = await query(trendSql)
      
      res.json({
        success: true,
        data: trend
      })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async getUserCount(req, res) {
    try {
      const { roleName } = req.query
      
      let sql = 'SELECT COUNT(*) as total_count FROM users'
      const params = []
      
      if (roleName) {
        sql = 'SELECT COUNT(*) as total_count FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = ?'
        params.push(roleName)
      }
      
      const result = await query(sql, params)
      res.json({
        success: true,
        data: {
          totalCount: result[0].total_count
        }
      })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  // 刷新当前用户权限
  async refreshPermissions(req, res) {
    try {
      // 从请求中获取用户信息（由权限中间件设置）
      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json({ success: false, message: '未登录或登录已过期' })
      }

      // 查询用户信息和角色
      const [user] = await query('SELECT id, username, role_id FROM users WHERE id = ?', [userId])
      if (!user) {
        return res.status(404).json({ success: false, message: '用户不存在' })
      }

      // 查询角色和权限
      let role = null
      let permissions = []
      if (user.role_id) {
        const [roleResult] = await query('SELECT name, permissions FROM roles WHERE id = ?', [user.role_id])
        if (roleResult) {
          role = roleResult
          // 处理权限格式
          if (role.name === '超级管理员') {
            permissions = ['all', ...getAllPermissionCodes()]
          } else if (Array.isArray(role.permissions)) {
            permissions = role.permissions
          } else if (typeof role.permissions === 'string') {
            try {
              permissions = JSON.parse(role.permissions)
            } catch (e) {
              permissions = role.permissions.split(',').map(p => p.trim())
            }
          } else if (typeof role.permissions === 'object') {
            permissions = role.permissions
          }
        }
      }

      res.json({
        success: true,
        message: '权限刷新成功',
        data: {
          permissions: permissions,
          role: role ? role.name : null
        }
      })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  }
}

module.exports = userController
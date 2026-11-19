const { query } = require('../db/connection')
const { ROLE_IDS, ROLE_NAMES } = require('../config/permissions')

// 站内信控制器
// 支持：1)运营人员单方面给买家发通知 2)后台角色互通站内信 3)买家查看和回复站内信

// 后台角色定义（可以互相发送消息）
const BACKEND_ROLES = [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.OPERATOR, ROLE_IDS.CUSTOMER_SERVICE, ROLE_IDS.MERCHANT]

// 所有可以访问站内信的角色（包括买家）
const MESSAGE_ACCESS_ROLES = [...BACKEND_ROLES, ROLE_IDS.BUYER]

// 角色名称到ID的映射
const roleNameToId = {
  [ROLE_NAMES.SUPER_ADMIN]: ROLE_IDS.SUPER_ADMIN,
  [ROLE_NAMES.OPERATOR]: ROLE_IDS.OPERATOR,
  [ROLE_NAMES.CUSTOMER_SERVICE]: ROLE_IDS.CUSTOMER_SERVICE,
  [ROLE_NAMES.BUYER]: ROLE_IDS.BUYER,
  [ROLE_NAMES.MERCHANT]: ROLE_IDS.MERCHANT
}

// 检查用户是否为后台角色
const isBackendRole = (roleId) => {
  return BACKEND_ROLES.includes(parseInt(roleId))
}

// 检查用户是否可以访问站内信
const canAccessMessages = (roleId) => {
  return MESSAGE_ACCESS_ROLES.includes(parseInt(roleId))
}

// 检查是否可以发送消息
const canSendMessage = (senderRole, receiverRole) => {
  // 将角色名称转换为ID
  const senderId = typeof senderRole === 'string' ? roleNameToId[senderRole] : parseInt(senderRole)
  const receiverId = parseInt(receiverRole)
  
  // 运营人员可以单方面给买家发通知
  if (senderId === ROLE_IDS.OPERATOR && receiverId === ROLE_IDS.BUYER) {
    return { canSend: true, canReply: false }
  }
  
  // 后台角色之间可以互相发送
  if (isBackendRole(senderId) && isBackendRole(receiverId)) {
    return { canSend: true, canReply: true }
  }
  
  // 商家可以给买家发消息
  if (senderId === ROLE_IDS.MERCHANT && receiverId === ROLE_IDS.BUYER) {
    return { canSend: true, canReply: false }
  }
  
  return { canSend: false, canReply: false }
}

// 发送站内信（支持群发和选择发送）
exports.sendInternalMessage = async (req, res) => {
  try {
    const { receiverId, receiver_role, subject, content, send_mode, receiver_ids } = req.body
    const senderId = req.user.id
    const senderRole = req.user.role
    // 将角色名称转换为ID
    const senderRoleId = typeof senderRole === 'string' ? roleNameToId[senderRole] : parseInt(senderRole)
    
    if (!content) {
      return res.status(400).json({ error: '消息内容不能为空' })
    }
    
    // 处理不同的发送模式
    if (senderRoleId === ROLE_IDS.OPERATOR && parseInt(receiver_role) === ROLE_IDS.BUYER) {
      // 运营人员给买家发送
      if (send_mode === 'broadcast') {
        // 群发模式：发给所有买家
        return await sendBroadcastToBuyers(req, res)
      } else if (send_mode === 'select' && receiver_ids && receiver_ids.length > 0) {
        // 选择发送模式：发给指定的买家
        return await sendToSelectedBuyers(req, res)
      } else {
        // 默认单个发送
        return await sendSingleMessage(req, res)
      }
    } else {
      // 其他角色之间的发送
      return await sendSingleMessage(req, res)
    }
  } catch (error) {
    console.error('发送站内信失败:', error)
    res.status(500).json({ error: '发送站内信失败' })
  }
}

// 发送消息（支持单个或多个接收者）
const sendSingleMessage = async (req, res) => {
  const { receiverId, receiver_ids, receiver_role, subject, content, send_mode } = req.body
  const senderId = req.user.id
  const senderRole = req.user.role
  const senderRoleId = typeof senderRole === 'string' ? roleNameToId[senderRole] : parseInt(senderRole)
  const receiverRoleId = parseInt(receiver_role)
  
  // 验证发送权限
  const { canSend, canReply } = canSendMessage(senderRole, receiver_role)
  if (!canSend) {
    return res.status(403).json({ error: '无权向该角色发送消息' })
  }
  
  // 确定接收者列表
  let targetUserIds = []
  if (send_mode === 'broadcast') {
    // 群发模式：获取所有该角色的用户
    const allUsers = await query(
      'SELECT id FROM users WHERE role_id = ? AND status = 1',
      [receiverRoleId]
    )
    targetUserIds = allUsers.map(u => u.id)
  } else if (receiver_ids && Array.isArray(receiver_ids) && receiver_ids.length > 0) {
    // 多选模式
    targetUserIds = receiver_ids
  } else if (receiverId) {
    // 单选模式（兼容旧接口）
    targetUserIds = [receiverId]
  } else {
    return res.status(400).json({ error: '请指定接收者' })
  }
  
  if (targetUserIds.length === 0) {
    return res.status(404).json({ error: '没有找到有效的接收者' })
  }
  
  // 验证接收者是否存在
  const placeholders = targetUserIds.map(() => '?').join(',')
  const users = await query(
    `SELECT id, username FROM users WHERE id IN (${placeholders}) AND role_id = ? AND status = 1`,
    [...targetUserIds, receiverRoleId]
  )
  
  if (users.length === 0) {
    return res.status(404).json({ error: '接收者不存在' })
  }
  
  // 生成群发ID（如果是群发）
  const broadcastId = send_mode === 'broadcast' 
    ? 'broadcast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    : null
  
  let successCount = 0
  let errorCount = 0
  
  // 为每个接收者创建消息
  for (const user of users) {
    try {
      const result = await query(
        `INSERT INTO internal_messages 
         (sender_id, sender_role, receiver_id, receiver_role, subject, content, can_reply, is_broadcast, broadcast_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          senderId, 
          senderRoleId, 
          user.id, 
          receiverRoleId, 
          subject || '', 
          content, 
          canReply ? 1 : 0,
          send_mode === 'broadcast' ? 1 : 0,
          broadcastId
        ]
      )
      
      // 创建通知
      await query(
        `INSERT INTO message_notifications 
         (user_id, user_role, message_id, title, content, notification_type) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          user.id, 
          receiverRoleId, 
          result.insertId,
          '新站内信',
          subject ? `新消息：${subject}` : '您收到一条新消息',
          'new_message'
        ]
      )
      
      successCount++
    } catch (error) {
      console.error(`给用户 ${user.id} 发送消息失败:`, error)
      errorCount++
    }
  }
  
  res.status(201).json({
    success: true,
    message: `发送完成，成功发送给 ${successCount} 个用户，失败 ${errorCount} 个`,
    data: { 
      totalTargets: targetUserIds.length,
      successCount,
      errorCount,
      broadcastId
    }
  })
}

// 群发给所有买家
const sendBroadcastToBuyers = async (req, res) => {
  const { subject, content } = req.body
  const senderId = req.user.id
  const senderRole = req.user.role
  const senderRoleId = typeof senderRole === 'string' ? roleNameToId[senderRole] : parseInt(senderRole)
  
  // 生成群发ID
  const broadcastId = 'broadcast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  
  // 获取所有买家用户
  const buyers = await query(
    'SELECT id FROM users WHERE role = ? AND status = 1',
    [ROLE_IDS.BUYER]
  )
  
  if (buyers.length === 0) {
    return res.status(404).json({ error: '没有找到买家用户' })
  }
  
  let successCount = 0
  let errorCount = 0
  
  // 为每个买家创建消息
  for (const buyer of buyers) {
    try {
      await query(
        `INSERT INTO internal_messages 
         (sender_id, sender_role, receiver_id, receiver_role, subject, content, can_reply, is_broadcast, broadcast_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [senderId, senderRoleId, buyer.id, ROLE_IDS.BUYER, subject || '', content, 0, 1, broadcastId]
      )
      
      successCount++
    } catch (error) {
      console.error(`给买家 ${buyer.id} 发送消息失败:`, error)
      errorCount++
    }
  }
  
  res.status(201).json({
    success: true,
    message: `群发完成，成功发送给 ${successCount} 个买家，失败 ${errorCount} 个`,
    data: { 
      broadcastId,
      totalBuyers: buyers.length,
      successCount,
      errorCount 
    }
  })
}

// 发送给选定的买家
const sendToSelectedBuyers = async (req, res) => {
  const { subject, content, receiver_ids } = req.body
  const senderId = req.user.id
  const senderRole = req.user.role
  const senderRoleId = typeof senderRole === 'string' ? roleNameToId[senderRole] : parseInt(senderRole)
  
  if (!receiver_ids || !Array.isArray(receiver_ids) || receiver_ids.length === 0) {
    return res.status(400).json({ error: '请选择要发送的买家' })
  }
  
  // 验证买家是否存在
  const placeholders = receiver_ids.map(() => '?').join(',')
  const buyers = await query(
    `SELECT id FROM users WHERE id IN (${placeholders}) AND role = ? AND status = 1`,
    [...receiver_ids, ROLE_IDS.BUYER]
  )
  
  if (buyers.length === 0) {
    return res.status(404).json({ error: '没有找到有效的买家用户' })
  }
  
  let successCount = 0
  let errorCount = 0
  
  // 为每个选定的买家创建消息
  for (const buyer of buyers) {
    try {
      await query(
        `INSERT INTO internal_messages 
         (sender_id, sender_role, receiver_id, receiver_role, subject, content, can_reply) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [senderId, senderRoleId, buyer.id, ROLE_IDS.BUYER, subject || '', content, 0]
      )
      
      successCount++
    } catch (error) {
      console.error(`给买家 ${buyer.id} 发送消息失败:`, error)
      errorCount++
    }
  }
  
  res.status(201).json({
    success: true,
    message: `发送完成，成功发送给 ${successCount} 个买家，失败 ${errorCount} 个`,
    data: { 
      totalSelected: receiver_ids.length,
      successCount,
      errorCount 
    }
  })
}

// 获取我的站内信列表
exports.getMyMessages = async (req, res) => {
  try {
    const userId = req.user.id
    const userRole = req.user.role
    const { page = 1, pageSize = 20, type = 'all' } = req.query
    
    // 将角色名称转换为ID
    const userRoleId = typeof userRole === 'string' ? roleNameToId[userRole] : parseInt(userRole)
    
    // 构建查询条件
    let whereClause = 'receiver_id = ? AND receiver_role = ?'
    let queryParams = [userId, userRoleId]
    
    // 添加消息类型筛选
    if (type === 'unread') {
      whereClause += ' AND is_read = 0'
    } else if (type === 'important') {
      whereClause += ' AND is_important = 1'
    }
    
    // 计算分页
    const pageNum = parseInt(page)
    const size = parseInt(pageSize)
    const offset = (pageNum - 1) * size
    
    // 获取消息列表
    const messages = await query(
      `SELECT * FROM internal_messages 
       WHERE ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...queryParams, size, offset]
    )
    
    // 获取总消息数
    const countResult = await query(
      `SELECT COUNT(*) AS total FROM internal_messages WHERE ${whereClause}`,
      queryParams
    )
    
    const total = countResult[0] ? countResult[0].total : 0
    
    res.status(200).json({
      success: true,
      data: {
        messages: messages,
        total,
        page: pageNum,
        pageSize: size,
        totalPages: Math.ceil(total / size)
      }
    })
  } catch (error) {
    console.error('获取站内信列表失败:', error)
    res.status(500).json({ error: '获取站内信列表失败' })
  }
}

// 获取消息详情（支持所有有权限的角色）
exports.getMessageDetail = async (req, res) => {
  try {
    const userId = req.user.id
    const userRole = req.user.role
    const messageId = req.params.id
    
    // 将角色名称转换为ID
    const userRoleId = typeof userRole === 'string' ? roleNameToId[userRole] : parseInt(userRole)
    
    // 验证用户是否可以访问站内信
    if (!canAccessMessages(userRoleId)) {
      return res.status(403).json({ error: '无权访问站内信' })
    }
    
    // 获取消息详情
    const messages = await query(
      'SELECT * FROM internal_messages WHERE id = ?',
      [messageId]
    )
    
    if (messages.length === 0) {
      return res.status(404).json({ error: '消息不存在' })
    }
    
    const message = messages[0]
    
    // 验证用户是否有权限查看此消息
    const isSender = message.sender_id === userId && message.sender_role === userRoleId
    const isReceiver = message.receiver_id === userId && message.receiver_role === userRoleId
    
    if (!isSender && !isReceiver) {
      return res.status(403).json({ error: '无权查看此消息' })
    }
    
    // 如果是接收者且未读，标记为已读
    if (isReceiver && !message.is_read) {
      await query(
        'UPDATE internal_messages SET is_read = 1 WHERE id = ?',
        [messageId]
      )
      message.is_read = 1
    }
    
    res.status(200).json({
      success: true,
      data: message
    })
  } catch (error) {
    console.error('获取消息详情失败:', error)
    res.status(500).json({ error: '获取消息详情失败' })
  }
}

// 标记消息为已读（支持所有有权限的角色）
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id
    const userRole = req.user.role
    const messageId = req.params.id
    
    // 将角色名称转换为ID
    const userRoleId = typeof userRole === 'string' ? roleNameToId[userRole] : parseInt(userRole)
    
    // 验证用户是否可以访问站内信
    if (!canAccessMessages(userRoleId)) {
      return res.status(403).json({ error: '无权操作站内信' })
    }
    
    // 验证消息是否存在且用户是接收者
    const messages = await query(
      'SELECT * FROM internal_messages WHERE id = ? AND receiver_id = ? AND receiver_role = ?',
      [messageId, userId, userRoleId]
    )
    
    if (messages.length === 0) {
      return res.status(404).json({ error: '消息不存在或无权操作' })
    }
    
    // 标记为已读
    const result = await query(
      'UPDATE internal_messages SET is_read = 1 WHERE id = ?',
      [messageId]
    )
    
    res.status(200).json({
      success: true,
      message: '消息已标记为已读'
    })
  } catch (error) {
    console.error('标记消息为已读失败:', error)
    res.status(500).json({ error: '标记消息为已读失败' })
  }
}

// 标记消息为重要（后台角色和买家均可操作）
exports.markAsImportant = async (req, res) => {
  try {
    const userId = req.user.id
    const userRole = req.user.role
    const messageId = req.params.id
    
    // 将角色名称转换为ID
    const userRoleId = typeof userRole === 'string' ? roleNameToId[userRole] : parseInt(userRole)
    
    // 验证用户是否为后台角色或买家
    if (!isBackendRole(userRoleId) && userRoleId !== ROLE_IDS.BUYER) {
      return res.status(403).json({ error: '无权操作站内信' })
    }
    
    // 验证消息是否存在且用户是接收者
    const messages = await query(
      'SELECT * FROM internal_messages WHERE id = ? AND receiver_id = ? AND receiver_role = ?',
      [messageId, userId, userRoleId]
    )
    
    if (messages.length === 0) {
      return res.status(404).json({ error: '消息不存在或无权操作' })
    }
    
    // 切换重要状态
    const message = messages[0]
    const newImportantStatus = message.is_important ? 0 : 1
    
    await query(
      'UPDATE internal_messages SET is_important = ? WHERE id = ?',
      [newImportantStatus, messageId]
    )
    
    res.status(200).json({
      success: true,
      message: `消息已${newImportantStatus ? '标记为重要' : '取消重要标记'}`,
      data: { is_important: newImportantStatus }
    })
  } catch (error) {
    console.error('标记消息为重要失败:', error)
    res.status(500).json({ error: '标记消息为重要失败' })
  }
}

// 删除消息（支持所有有权限的角色）
exports.deleteMessage = async (req, res) => {
  try {
    const userId = req.user.id
    const userRole = req.user.role
    const messageId = req.params.id
    
    // 将角色名称转换为ID
    const userRoleId = typeof userRole === 'string' ? roleNameToId[userRole] : parseInt(userRole)
    
    // 验证用户是否可以访问站内信
    if (!canAccessMessages(userRoleId)) {
      return res.status(403).json({ error: '无权删除站内信' })
    }
    
    // 验证消息是否存在且用户是发送者或接收者
    const messages = await query(
      'SELECT * FROM internal_messages WHERE id = ?',
      [messageId]
    )
    
    if (messages.length === 0) {
      return res.status(404).json({ error: '消息不存在' })
    }
    
    const message = messages[0]
    const isSender = message.sender_id === userId && message.sender_role === userRoleId
    const isReceiver = message.receiver_id === userId && message.receiver_role === userRoleId
    
    if (!isSender && !isReceiver) {
      return res.status(403).json({ error: '无权删除此消息' })
    }
    
    // 删除消息
    await query('DELETE FROM internal_messages WHERE id = ?', [messageId])
    
    res.status(200).json({
      success: true,
      message: '消息删除成功'
    })
  } catch (error) {
    console.error('删除消息失败:', error)
    res.status(500).json({ error: '删除消息失败' })
  }
}

// 获取未读消息数
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id
    const userRole = req.user.role
    
    // 将角色名称转换为ID
    const userRoleId = typeof userRole === 'string' ? roleNameToId[userRole] : parseInt(userRole)
    
    // 获取未读消息数
    const results = await query(
      'SELECT COUNT(*) AS count FROM internal_messages WHERE receiver_id = ? AND receiver_role = ? AND is_read = 0',
      [userId, userRoleId]
    )
    
    const count = results[0] ? results[0].count : 0
    
    res.status(200).json({
      success: true,
      data: { unreadCount: count }
    })
  } catch (error) {
    console.error('获取未读消息数失败:', error)
    res.status(500).json({ error: '获取未读消息数失败' })
  }
}

// 获取买家列表（仅限运营人员）
exports.getBuyersList = async (req, res) => {
  try {
    const userRole = req.user.role
    const { page = 1, pageSize = 20, keyword = '' } = req.query
    
    // 验证用户是否为超级管理员或运营人员
    if (userRole !== 1 && userRole !== 2) {
      return res.status(403).json({ error: '只有超级管理员和运营人员可以查看买家列表' })
    }
    
    // 构建查询条件
    let whereClause = 'role = 4 AND status = 1'
    let queryParams = []
    
    if (keyword.trim()) {
      whereClause += ' AND (username LIKE ? OR phone LIKE ?)'
      queryParams.push(`%${keyword}%`, `%${keyword}%`)
    }
    
    // 计算分页
    const pageNum = parseInt(page)
    const size = parseInt(pageSize)
    const offset = (pageNum - 1) * size
    
    // 获取买家列表
    const buyers = await query(
      `SELECT id, username, phone, email, created_at 
       FROM users 
       WHERE ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...queryParams, size, offset]
    )
    
    // 获取总买家数
    const countResult = await query(
      `SELECT COUNT(*) AS total FROM users WHERE ${whereClause}`,
      queryParams
    )
    
    const total = countResult[0] ? countResult[0].total : 0
    
    res.status(200).json({
      success: true,
      data: {
        buyers: buyers,
        total,
        page: pageNum,
        pageSize: size,
        totalPages: Math.ceil(total / size)
      }
    })
  } catch (error) {
    console.error('获取买家列表失败:', error)
    res.status(500).json({ error: '获取买家列表失败' })
  }
}

// 获取最近消息（用于右上角图标）
exports.getRecentMessages = async (req, res) => {
  try {
    const userId = req.user.id
    const userRole = req.user.role
    const { limit = 5 } = req.query
    
    // 将角色名称转换为ID
    const userRoleId = typeof userRole === 'string' ? roleNameToId[userRole] : parseInt(userRole)
    
    // 获取最近消息
    const messages = await query(
      `SELECT im.*, u.username as sender_name
       FROM internal_messages im
       LEFT JOIN users u ON im.sender_id = u.id
       WHERE (im.receiver_id = ? AND im.receiver_role = ?)
       ORDER BY im.created_at DESC 
       LIMIT ?`,
      [userId, userRoleId, parseInt(limit)]
    )
    
    res.status(200).json({
      success: true,
      data: { messages: messages }
    })
  } catch (error) {
    console.error('获取最近消息失败:', error)
    res.status(500).json({ error: '获取最近消息失败' })
  }
}

// 根据角色获取用户列表（用于层级选择）
exports.getUsersByRole = async (req, res) => {
  try {
    const senderRole = req.user.role
    const { role } = req.query
    
    if (!role) {
      return res.status(400).json({ error: '请指定角色ID' })
    }
    
    const targetRole = parseInt(role)
    const senderRoleId = typeof senderRole === 'string' ? roleNameToId[senderRole] : parseInt(senderRole)
    
    // 验证发送权限
    const { canSend } = canSendMessage(senderRole, targetRole)
    if (!canSend) {
      return res.status(403).json({ error: '无权向该角色发送消息' })
    }
    
    // 获取该角色的所有用户
    const users = await query(
      'SELECT id, username, phone, email, status FROM users WHERE role_id = ? AND status = 1 ORDER BY created_at DESC',
      [targetRole]
    )
    
    res.status(200).json({
      success: true,
      data: {
        users: users,
        total: users.length,
        role: targetRole
      }
    })
  } catch (error) {
    console.error('获取用户列表失败:', error)
    res.status(500).json({ error: '获取用户列表失败' })
  }
}
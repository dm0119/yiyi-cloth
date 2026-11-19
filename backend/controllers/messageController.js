const { query } = require('../db/connection')

// 发送消息
exports.sendMessage = async (req, res) => {
  try {
    const { senderId, senderRole, content, type = 'text' } = req.body
    const conversationId = req.params.id
    
    if (!conversationId || !senderId || !senderRole || !content) {
      return res.status(400).json({ error: '会话ID、发送者ID、发送者角色和消息内容不能为空' })
    }
    
    // 检查会话是否存在
    const conversations = await query(
      'SELECT id, status FROM conversations WHERE id = ?',
      [conversationId]
    )
    const conversation = conversations[0]
    
    if (!conversation) {
      return res.status(404).json({ error: '会话不存在' })
    }
    
    // 如果会话已关闭，自动重新开启
    if (conversation.status === 'closed') {
      await query(
        'UPDATE conversations SET status = ? WHERE id = ?',
        ['active', conversationId]
      )
    }
    
    // 插入消息
    const result = await query(
      'INSERT INTO messages (conversation_id, sender_id, sender_role, content, type) VALUES (?, ?, ?, ?, ?)',
      [conversationId, senderId, senderRole, content, type]
    )
    
    // 更新会话的更新时间
    await query(
      'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [conversationId]
    )
    
    // 返回完整的消息信息
    const messages = await query(
      'SELECT * FROM messages WHERE id = ?',
      [result.insertId]
    )
    const message = messages[0]
    
    res.status(201).json(message)
  } catch (error) {
    console.error('发送消息失败:', error)
    res.status(500).json({ error: '发送消息失败' })
  }
}

// 获取消息历史
exports.getMessageHistory = async (req, res) => {
  try {
    const { page = 1, pageSize = 50 } = req.query
    const conversationId = req.params.id
    
    if (!conversationId) {
      return res.status(400).json({ error: '会话ID不能为空' })
    }
    
    // 确保所有参数都是有效的整数
    const convId = parseInt(conversationId, 10)
    const pageNum = parseInt(page, 10)
    const size = parseInt(pageSize, 10)
    
    // 验证参数有效性
    if (isNaN(convId) || isNaN(pageNum) || isNaN(size)) {
      return res.status(400).json({ error: '无效的参数类型' })
    }
    
    // 检查会话是否存在（不限制状态，允许查看已关闭会话的消息历史）
    const conversations = await query(
      'SELECT id, status FROM conversations WHERE id = ?',
      [convId]
    )
    
    const conversation = conversations[0]
    if (!conversation) {
      return res.status(404).json({ error: '会话不存在' })
    }
    
    // 计算偏移量
    const offset = (pageNum - 1) * size
    
    // 获取消息列表
    const messages = await query(
      `SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT ${parseInt(size)} OFFSET ${parseInt(offset)}`,
      [convId]
    )
    
    // 更新消息状态为已读
    const { userId, role } = req.query
    if (userId && role) {
      await query(
        'UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_role != ?',
        [convId, role]
      )
    }
    
    // 获取总消息数
    const countResult = await query(
      'SELECT COUNT(*) AS total FROM messages WHERE conversation_id = ?',
      [convId]
    )
    
    // 确保countResult存在
    const countData = countResult[0]
    const total = countData ? countData.total : 0
    
    res.status(200).json({
      messages: messages,
      total,
      page: pageNum,
      pageSize: size,
      totalPages: Math.ceil(total / size)
    })
  } catch (error) {
    console.error('获取消息历史失败:', error)
    res.status(500).json({ error: '获取消息历史失败' })
  }
}

// 获取未读消息数
exports.getUnreadMessagesCount = async (req, res) => {
  try {
    const { userId, role } = req.query
    const conversationId = req.params.id
    
    if (!conversationId || !userId || !role) {
      return res.status(400).json({ error: '会话ID、用户ID和角色不能为空' })
    }
   // 获取未读消息数
    const results = await query(
      `SELECT COUNT(*) AS count 
       FROM messages 
       WHERE conversation_id = ? AND sender_role != ? AND is_read = 0`,
      [conversationId, role]
    )
    const result = results[0]
    
    res.status(200).json({ count: result.count })
  } catch (error) {
    console.error('获取未读消息数失败:', error)
    res.status(500).json({ error: '获取未读消息数失败' })
  }
}

// 标记消息为已读
exports.markAsRead = async (req, res) => {
  try {
    const { userId, role } = req.body
    const conversationId = req.params.id
    
    if (!conversationId || !userId || !role) {
      return res.status(400).json({ error: '会话ID、用户ID和角色不能为空' })
    }
    
    const result = await query(
      `UPDATE messages 
       SET is_read = 1 
       WHERE conversation_id = ? AND sender_role != ?`,
      [conversationId, role]
    )
    
    res.status(200).json({ message: `已标记 ${result.affectedRows} 条消息为已读` })
  } catch (error) {
    console.error('标记消息为已读失败:', error)
    res.status(500).json({ error: '标记消息为已读失败' })
  }
}

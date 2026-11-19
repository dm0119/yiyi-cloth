const { query } = require('../db/connection')

// 创建会话
exports.createConversation = async (req, res) => {
  try {
    const { buyerId, csId } = req.body
    
    if (!buyerId || !csId) {
      return res.status(400).json({ error: '买家ID和客服ID不能为空' })
    }
    
    // 检查买家和客服是否存在
    const buyers = await query('SELECT id FROM users WHERE id = ?', [buyerId])
    const css = await query('SELECT id FROM users WHERE id = ?', [csId])
    
    if (!buyers || buyers.length === 0 || !css || css.length === 0) {
      return res.status(404).json({ error: '买家或客服不存在' })
    }
    
    // 检查是否已存在活跃会话
    const existing = await query(
      'SELECT id FROM conversations WHERE buyer_id = ? AND cs_id = ? AND status = ?',
      [buyerId, csId, 'active']
    )
    
    if (existing && existing.length > 0) {
      return res.status(200).json({ id: existing[0].id, message: '会话已存在' })
    }
    
    // 创建新会话
    const result = await query(
      'INSERT INTO conversations (buyer_id, cs_id) VALUES (?, ?)',
      [buyerId, csId]
    )
    
    res.status(201).json({ id: result.insertId, message: '会话创建成功' })
  } catch (error) {
    console.error('创建会话失败:', error)
    res.status(500).json({ error: '创建会话失败' })
  }
}

// 获取会话列表
exports.getConversations = async (req, res) => {
  try {
    const { userId, role, status } = req.query
    
    if (!userId || !role) {
      return res.status(400).json({ error: '用户ID和角色不能为空' })
    }
    
    let sql = ''
    let params = []
    
    if (role === '客服人员' || role === '超级管理员') {
      // 客服和超级管理员查询所有会话
      sql = `SELECT c.*, u.name AS buyer_name, cs.name AS cs_name 
            FROM conversations c 
            LEFT JOIN users u ON c.buyer_id = u.id 
            LEFT JOIN users cs ON c.cs_id = cs.id 
            WHERE c.deleted_at IS NULL`
      params = []
    } else if (role === '买家') {
      // 买家查询自己的会话
      sql = `SELECT c.*, u.name AS cs_name 
            FROM conversations c 
            LEFT JOIN users u ON c.cs_id = u.id 
            WHERE c.buyer_id = ? AND c.deleted_at IS NULL`
      params = [userId]
    } else {
      return res.status(403).json({ error: '角色不合法' })
    }
    
    // 添加状态筛选
    if (status) {
      sql += ' AND c.status = ?'
      params.push(status)
    }
    
    sql += ' ORDER BY c.updated_at DESC'
    
    const conversations = await query(sql, params)
    res.status(200).json({ data: conversations })
  } catch (error) {
    console.error('获取会话列表失败:', error)
    res.status(500).json({ error: '获取会话列表失败' })
  }
}

// 获取会话详情
exports.getConversationDetail = async (req, res) => {
  try {
    const { id } = req.params
    
    if (!id) {
      return res.status(400).json({ error: '会话ID不能为空' })
    }
    
    const conversation = await query(
      `SELECT c.*, u1.name AS buyer_name, u2.name AS cs_name 
       FROM conversations c 
       LEFT JOIN users u1 ON c.buyer_id = u1.id 
       LEFT JOIN users u2 ON c.cs_id = u2.id 
       WHERE c.id = ?`,
      [id]
    )
    
    if (!conversation || conversation.length === 0) {
      return res.status(404).json({ error: '会话不存在' })
    }
    
    res.status(200).json(conversation)
  } catch (error) {
    console.error('获取会话详情失败:', error)
    res.status(500).json({ error: '获取会话详情失败' })
  }
}

// 关闭/开启会话
exports.closeConversation = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    
    if (!id) {
      return res.status(400).json({ error: '会话ID不能为空' })
    }
    
    // 如果没有提供status，默认关闭
    const newStatus = status || 'closed'
    
    const result = await query(
      'UPDATE conversations SET status = ? WHERE id = ?',
      [newStatus, id]
    )
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '会话不存在' })
    }
    
    const message = newStatus === 'active' ? '会话已重新开启' : '会话已关闭'
    res.status(200).json({ message, status: newStatus })
  } catch (error) {
    console.error('更新会话状态失败:', error)
    res.status(500).json({ error: '更新会话状态失败' })
  }
}

// 删除会话（软删除）
exports.deleteConversation = async (req, res) => {
  try {
    const { id } = req.params
    const user = req.user
    
    if (!id) {
      return res.status(400).json({ error: '会话ID不能为空' })
    }
    
    // 权限检查：只有管理员可以删除会话
    if (user.role !== '超级管理员') {
      return res.status(403).json({ error: '只有管理员可以删除会话' })
    }
    
    // 检查会话是否存在
    const conversations = await query(
      'SELECT id FROM conversations WHERE id = ? AND deleted_at IS NULL',
      [id]
    )
    const conversation = conversations[0]
    
    if (!conversation) {
      return res.status(404).json({ error: '会话不存在或已被删除' })
    }
    
    // 软删除会话
    await query(
      'UPDATE conversations SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    )
    
    res.status(200).json({ message: '会话已删除' })
  } catch (error) {
    console.error('删除会话失败:', error)
    res.status(500).json({ error: '删除会话失败' })
  }
}

// 获取未处理的会话数
exports.getUnreadConversationsCount = async (req, res) => {
  try {
    const { csId } = req.query
    
    if (!csId) {
      return res.status(400).json({ error: '客服ID不能为空' })
    }
    
    const result = await query(
      `SELECT COUNT(*) AS count 
       FROM conversations c 
       WHERE c.cs_id = ? AND c.status = ? 
       AND EXISTS (SELECT 1 FROM messages m WHERE m.conversation_id = c.id AND m.is_read = 0 AND m.sender_role = ?)`,
      [csId, 'active', 'buyer']
    )
    
    res.status(200).json({ count: result[0].count })
  } catch (error) {
    console.error('获取未读会话数失败:', error)
    res.status(500).json({ error: '获取未读会话数失败' })
  }
}

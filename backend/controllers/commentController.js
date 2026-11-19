const { executeDirect } = require('../db/connection');

// 获取评论列表
exports.list = async (req, res) => {
  try {
    const { discussion_id } = req.params;
    
    const comments = await executeDirect(`
      SELECT c.*, u.name as user_name 
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.discussion_id = ?
      ORDER BY c.created_at ASC
    `, [discussion_id]);
    
    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取评论列表失败',
      error: error.message
    });
  }
};

// 创建评论
exports.create = async (req, res) => {
  try {
    const { discussion_id } = req.params;
    const { content, image } = req.body;
    const user_id = req.user.id;
    
    // 检查讨论是否存在
    const discussions = await executeDirect('SELECT * FROM discussions WHERE id = ?', [discussion_id]);
    if (discussions.length === 0) {
      return res.status(404).json({
        success: false,
        message: '讨论不存在'
      });
    }
    
    // 创建评论
    const result = await executeDirect(
      'INSERT INTO comments (discussion_id, user_id, content, image) VALUES (?, ?, ?, ?)',
      [discussion_id, user_id, content, image]
    );
    
    // 更新讨论的评论数
    await executeDirect(
      'UPDATE discussions SET comment_count = comment_count + 1 WHERE id = ?',
      [discussion_id]
    );
    
    res.json({
      success: true,
      message: '评论创建成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('创建评论失败:', error);
    res.status(500).json({
      success: false,
      message: '创建评论失败',
      error: error.message
    });
  }
};

// 删除评论
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查评论是否存在
    const comments = await executeDirect('SELECT * FROM comments WHERE id = ?', [id]);
    if (comments.length === 0) {
      return res.status(404).json({
        success: false,
        message: '评论不存在'
      });
    }
    
    const comment = comments[0];
    
    // 检查权限（评论创建者、管理员或有 discussion:delete 权限的人可以删除）
    const isOwner = comment.user_id === req.user.id;
    const hasDeletePermission = req.user.permissions && req.user.permissions.includes('discussion:delete');
    const isAdmin = req.user.permissions && req.user.permissions.includes('all');
    
    if (!isOwner && !hasDeletePermission && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: '无权限删除此评论'
      });
    }
    
    // 删除评论
    await executeDirect('DELETE FROM comments WHERE id = ?', [id]);
    
    // 更新讨论的评论数
    await executeDirect(
      'UPDATE discussions SET comment_count = comment_count - 1 WHERE id = ?',
      [comment.discussion_id]
    );
    
    res.json({
      success: true,
      message: '评论删除成功'
    });
  } catch (error) {
    console.error('删除评论失败:', error);
    res.status(500).json({
      success: false,
      message: '删除评论失败',
      error: error.message
    });
  }
};
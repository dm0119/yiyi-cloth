const { executeDirect } = require('../db/connection');

// 获取举报列表
exports.list = async (req, res) => {
  try {
    const reports = await executeDirect(`
      SELECT r.*, u.name as user_name, d.title as discussion_title 
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN discussions d ON r.discussion_id = d.id
      ORDER BY r.created_at DESC
    `);
    
    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取举报列表失败',
      error: error.message
    });
  }
};

// 创建举报
exports.create = async (req, res) => {
  try {
    const { discussion_id, reason } = req.body;
    const user_id = req.user.id;
    
    // 检查讨论是否存在
    const discussions = await executeDirect('SELECT * FROM discussions WHERE id = ?', [discussion_id]);
    if (discussions.length === 0) {
      return res.status(404).json({
        success: false,
        message: '讨论不存在'
      });
    }
    
    // 创建举报
    const result = await executeDirect(
      'INSERT INTO reports (user_id, discussion_id, reason) VALUES (?, ?, ?)',
      [user_id, discussion_id, reason]
    );
    
    res.json({
      success: true,
      message: '举报成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('创建举报失败:', error);
    res.status(500).json({
      success: false,
      message: '举报失败',
      error: error.message
    });
  }
};

// 更新举报状态
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // 检查举报是否存在
    const reports = await executeDirect('SELECT * FROM reports WHERE id = ?', [id]);
    if (reports.length === 0) {
      return res.status(404).json({
        success: false,
        message: '举报不存在'
      });
    }
    
    // 更新举报状态
    await executeDirect(
      'UPDATE reports SET status = ? WHERE id = ?',
      [status, id]
    );
    
    res.json({
      success: true,
      message: '举报状态更新成功'
    });
  } catch (error) {
    console.error('更新举报状态失败:', error);
    res.status(500).json({
      success: false,
      message: '更新举报状态失败',
      error: error.message
    });
  }
};

// 删除举报
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查举报是否存在
    const reports = await executeDirect('SELECT * FROM reports WHERE id = ?', [id]);
    if (reports.length === 0) {
      return res.status(404).json({
        success: false,
        message: '举报不存在'
      });
    }
    
    // 删除举报
    await executeDirect('DELETE FROM reports WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: '举报删除成功'
    });
  } catch (error) {
    console.error('删除举报失败:', error);
    res.status(500).json({
      success: false,
      message: '删除举报失败',
      error: error.message
    });
  }
};
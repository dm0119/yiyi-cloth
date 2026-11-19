const { executeDirect } = require('../db/connection');

// 获取社区列表
exports.list = async (req, res) => {
  try {
    const { keyword } = req.query;
    const params = [];
    let query = `
      SELECT d.*, u.name as user_name 
      FROM discussions d
      LEFT JOIN users u ON d.user_id = u.id
    `;
    
    if (keyword) {
      query += ` WHERE d.title LIKE ?`;
      params.push(`%${keyword}%`);
    }
    
    query += ` ORDER BY d.is_pinned DESC, d.created_at DESC`;
    
    const discussions = await executeDirect(query, params);
    
    // 为每个社区内容加载关联数据
    for (const discussion of discussions) {
      const discussion_id = discussion.id;
      
      // 获取关联的商品
      const products = await executeDirect(`
        SELECT p.id, p.name, p.price, p.image 
        FROM discussion_products dp
        LEFT JOIN products p ON dp.product_id = p.id
        WHERE dp.discussion_id = ?
      `, [discussion_id]);
      
      // 转换价格为数字类型
      for (const product of products) {
        product.price = parseFloat(product.price) || 0;
      }
      
      // 获取社区内容图片
      const images = await executeDirect(
        'SELECT image_url FROM discussion_images WHERE discussion_id = ?',
        [discussion_id]
      );
      
      // 获取评论
      const comments = await executeDirect(`
        SELECT c.*, u.name as user_name 
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.discussion_id = ?
        ORDER BY c.created_at ASC
      `, [discussion_id]);
      
      discussion.products = products;
      discussion.images = images.map(img => img.image_url);
      discussion.comments = comments;
    }
    
    res.json({
      success: true,
      data: discussions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取社区列表失败',
      error: error.message
    });
  }
};

// 创建社区内容
exports.create = async (req, res) => {
  try {
    const { title, content, product_ids, images } = req.body;
    const user_id = req.user.id;
    
    // 创建社区内容
    const result = await executeDirect(
      'INSERT INTO discussions (user_id, title, content) VALUES (?, ?, ?)',
      [user_id, title, content]
    );
    
    const discussion_id = result.insertId;
    
    // 处理商品关联
    if (product_ids && product_ids.length > 0) {
      for (const product_id of product_ids) {
        await executeDirect(
          'INSERT INTO discussion_products (discussion_id, product_id) VALUES (?, ?)',
          [discussion_id, product_id]
        );
      }
    }
    
    // 处理图片
    if (images && images.length > 0) {
      for (const image_url of images) {
        await executeDirect(
          'INSERT INTO discussion_images (discussion_id, image_url) VALUES (?, ?)',
          [discussion_id, image_url]
        );
      }
    }
    
    res.json({
      success: true,
      message: '社区内容创建成功',
      data: { id: discussion_id }
    });
  } catch (error) {
    console.error('创建社区内容失败:', error);
    res.status(500).json({
      success: false,
      message: '创建社区内容失败',
      error: error.message
    });
  }
};

// 获取社区内容详情
exports.detail = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 增加浏览量
    await executeDirect('UPDATE discussions SET view_count = view_count + 1 WHERE id = ?', [id]);
    
    // 获取社区内容详情
    const discussions = await executeDirect(`
      SELECT d.*, u.name as user_name 
      FROM discussions d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.id = ?
    `, [id]);
    
    if (discussions.length === 0) {
      return res.status(404).json({
        success: false,
        message: '社区内容不存在'
      });
    }
    
    const discussion = discussions[0];
    
    // 获取关联的商品
    const products = await executeDirect(`
      SELECT p.id, p.name, p.price, p.image 
      FROM discussion_products dp
      LEFT JOIN products p ON dp.product_id = p.id
      WHERE dp.discussion_id = ?
    `, [id]);
    
    // 转换价格为数字类型
    for (const product of products) {
      product.price = parseFloat(product.price) || 0;
    }
    
    // 获取社区内容图片
    const images = await executeDirect(
      'SELECT image_url FROM discussion_images WHERE discussion_id = ?',
      [id]
    );
    
    // 获取评论
    const comments = await executeDirect(`
      SELECT c.*, u.name as user_name 
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.discussion_id = ?
      ORDER BY c.created_at ASC
    `, [id]);
    
    discussion.products = products;
    discussion.images = images.map(img => img.image_url);
    discussion.comments = comments;
    
    res.json({
      success: true,
      data: discussion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取社区内容详情失败',
      error: error.message
    });
  }
};

// 删除社区内容
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查社区内容是否存在
    const discussions = await executeDirect('SELECT * FROM discussions WHERE id = ?', [id]);
    if (discussions.length === 0) {
      return res.status(404).json({
        success: false,
        message: '社区内容不存在'
      });
    }
    
    // 检查权限（只有社区内容创建者或管理员可以删除）
    const discussion = discussions[0];
    if (discussion.user_id !== req.user.id && req.user.role_id !== 1) {
      return res.status(403).json({
        success: false,
        message: '无权限删除此社区内容'
      });
    }
    
    // 删除社区内容（级联删除相关的评论、商品关联和图片）
    await executeDirect('DELETE FROM discussions WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: '社区内容删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除社区内容失败',
      error: error.message
    });
  }
};

// 置顶社区内容
exports.pinDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查权限（需要有 discussion:manage 权限）
    if (!req.user.permissions || !req.user.permissions.includes('discussion:manage')) {
      return res.status(403).json({
        success: false,
        message: '无权限置顶社区内容'
      });
    }
    
    // 检查社区内容是否存在
    const discussions = await executeDirect('SELECT * FROM discussions WHERE id = ?', [id]);
    if (discussions.length === 0) {
      return res.status(404).json({
        success: false,
        message: '社区内容不存在'
      });
    }
    
    // 检查当前置顶数量
    const pinnedCount = await executeDirect('SELECT COUNT(*) as count FROM discussions WHERE is_pinned = 1');
    const currentPinned = pinnedCount[0].count;
    
    // 检查是否已达到置顶数量限制
    if (currentPinned >= 5) {
      return res.status(400).json({
        success: false,
        message: '置顶社区内容数量已达上限（最多 5 个）'
      });
    }
    
    // 更新置顶状态
    await executeDirect('UPDATE discussions SET is_pinned = 1 WHERE id = ?', [id]);
    res.json({
      success: true,
      message: '社区内容置顶成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '置顶社区内容失败',
      error: error.message
    });
  }
};

// 取消置顶社区内容
exports.unpinDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查权限（需要有 discussion:manage 权限）
    if (!req.user.permissions || !req.user.permissions.includes('discussion:manage')) {
      return res.status(403).json({
        success: false,
        message: '无权限取消置顶社区内容'
      });
    }
    
    // 检查社区内容是否存在
    const discussions = await executeDirect('SELECT * FROM discussions WHERE id = ?', [id]);
    if (discussions.length === 0) {
      return res.status(404).json({
        success: false,
        message: '社区内容不存在'
      });
    }
    
    // 更新置顶状态
    await executeDirect('UPDATE discussions SET is_pinned = 0 WHERE id = ?', [id]);
    res.json({
      success: true,
      message: '取消置顶成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '取消置顶失败',
      error: error.message
    });
  }
};


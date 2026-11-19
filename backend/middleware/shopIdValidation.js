
/**
 * Shop ID 验证中间件
 * 确保商家只能访问自己的数据
 */
function createShopIdValidation() {
  return function(req, res, next) {
    try {
      const user = req.user;
      if (!user) {
        return next({ status: 401, message: '用户未登录' });
      }
      
      // 如果是管理员，跳过shop_id验证
      const isAdmin = user.role === '超级管理员' || (user.permissions && user.permissions.includes('order:manage'));
      if (isAdmin) {
        return next();
      }
      
      // 非管理员必须有shop_id
      if (!user.shopId) {
        return next({ status: 403, message: '用户没有关联的店铺，无权操作' });
      }
      
      // 验证请求中的shop_id是否匹配用户shop_id
      if (req.body.shop_id && req.body.shop_id !== user.shopId) {
        return next({ status: 403, message: '无权操作其他店铺的数据' });
      }
      
      // 如果请求路径包含:shopId，验证是否匹配
      if (req.params.shopId && req.params.shopId !== user.shopId.toString()) {
        return next({ status: 403, message: '无权访问其他店铺的数据' });
      }
      
      next();
    } catch (error) {
      next({ status: 500, message: '权限验证失败: ' + error.message });
    }
  };
}

module.exports = { createShopIdValidation };

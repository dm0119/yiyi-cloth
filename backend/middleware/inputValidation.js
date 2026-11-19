
/**
 * 输入验证中间件
 * 自动验证所有控制器方法的输入参数
 */
function createInputValidation() {
  return function(req, res, next) {
    try {
      // 参数非空验证
      const hasBodyParams = req.body && Object.keys(req.body).length > 0;
      const hasQueryParams = req.query && Object.keys(req.query).length > 0;
      const hasParams = req.params && Object.keys(req.params).length > 0;
      
      if (!hasBodyParams && !hasQueryParams && !hasParams) {
        return next({ status: 400, message: '请求参数不能为空' });
      }
      
      // 数值字段验证
      const numericFields = ['id', 'price', 'stock', 'quantity', 'total_amount', 'discount_amount', 'actual_amount', 'shop_id', 'merchant_id'];
      for (const field of numericFields) {
        if (req.body[field] !== undefined) {
          const value = Number(req.body[field]);
          if (isNaN(value)) {
            return next({ status: 400, message: `${field} 必须是有效的数字` });
          }
          if (value < 0 && ['price', 'stock', 'quantity', 'total_amount', 'actual_amount'].includes(field)) {
            return next({ status: 400, message: `${field} 不能为负数` });
          }
        }
      }
      
      // 字符串字段验证
      const stringFields = ['name', 'title', 'description', 'logistics_company', 'tracking_number', 'reason'];
      for (const field of stringFields) {
        if (req.body[field] && typeof req.body[field] !== 'string') {
          return next({ status: 400, message: `${field} 必须是字符串` });
        }
      }
      
      // 数组字段验证
      if (req.body.ids && !Array.isArray(req.body.ids)) {
        return next({ status: 400, message: 'ids 必须是数组' });
      }
      
      // 状态字段验证
      if (req.body.status !== undefined) {
        const status = Number(req.body.status);
        if (isNaN(status) || status < 0 || status > 10) {
          return next({ status: 400, message: 'status 必须是有效的状态值' });
        }
      }
      
      next();
    } catch (error) {
      next({ status: 400, message: '输入验证失败: ' + error.message });
    }
  };
}

module.exports = { createInputValidation };

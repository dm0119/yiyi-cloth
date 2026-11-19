/**
 * 输入验证工具
 * 提供通用的输入验证函数
 */

const { createValidationError } = require('./errorHandler');

class InputValidator {
  /**
   * 验证非负数
   * @param {*} value - 要验证的值
   * @param {String} fieldName - 字段名称
   * @returns {Boolean} 是否有效
   */
  static validatePositiveNumber(value, fieldName) {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`${fieldName} 必须是有效的数字`);
    }
    if (value < 0) {
      throw new Error(`${fieldName} 不能为负数`);
    }
    
    // 特殊字段的额外验证
    if (fieldName === '库存' && value > 999999) {
      throw new Error(`${fieldName} 值过大，不能超过 999,999`);
    }
    
    if (fieldName === '价格' && value > 9999999.99) {
      throw new Error(`${fieldName} 值过大，不能超过 9,999,999.99`);
    }
    
    return true;
  }

  /**
   * 验证手机号格式
   * @param {String} phone - 手机号
   * @returns {Boolean} 是否有效
   */
  static validatePhone(phone) {
    if (typeof phone !== 'string') {
      throw new Error('手机号必须是字符串');
    }
    
    const regex = /^1[3-9]\d{9}$/;
    if (!regex.test(phone)) {
      throw new Error('手机号格式不正确');
    }
    
    return true;
  }

  /**
   * 验证邮箱格式
   * @param {String} email - 邮箱
   * @returns {Boolean} 是否有效
   */
  static validateEmail(email) {
    if (typeof email !== 'string') {
      throw new Error('邮箱必须是字符串');
    }
    
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      throw new Error('邮箱格式不正确');
    }
    
    if (email.length > 100) {
      throw new Error('邮箱长度不能超过100个字符');
    }
    
    return true;
  }

  /**
   * 验证字符串长度
   * @param {String} str - 字符串
   * @param {String} fieldName - 字段名称
   * @param {Number} maxLength - 最大长度
   * @param {Number} minLength - 最小长度（可选）
   * @returns {Boolean} 是否有效
   */
  static validateStringLength(str, fieldName, maxLength, minLength = 1) {
    if (typeof str !== 'string') {
      throw new Error(`${fieldName} 必须是字符串`);
    }
    
    if (str.length < minLength) {
      throw new Error(`${fieldName} 长度不能少于 ${minLength} 个字符`);
    }
    
    if (str.length > maxLength) {
      throw new Error(`${fieldName} 长度不能超过 ${maxLength} 个字符`);
    }
    
    return true;
  }

  /**
   * 验证ID有效性
   * @param {*} id - ID值
   * @param {String} fieldName - 字段名称
   * @returns {Boolean} 是否有效
   */
  static validateId(id, fieldName = 'ID') {
    if (id === undefined || id === null) {
      throw new Error(`${fieldName} 不能为空`);
    }
    
    const numId = Number(id);
    if (isNaN(numId)) {
      throw new Error(`${fieldName} 必须是有效的数字`);
    }
    
    if (numId <= 0) {
      throw new Error(`${fieldName} 必须大于0`);
    }
    
    if (!Number.isInteger(numId)) {
      throw new Error(`${fieldName} 必须是整数`);
    }
    
    if (numId > 2147483647) {
      throw new Error(`${fieldName} 值过大`);
    }
    
    return true;
  }

  /**
   * 验证数组
   * @param {*} arr - 数组值
   * @param {String} fieldName - 字段名称
   * @param {Function} itemValidator - 数组项验证函数（可选）
   * @returns {Boolean} 是否有效
   */
  static validateArray(arr, fieldName, itemValidator = null) {
    if (!Array.isArray(arr)) {
      throw new Error(`${fieldName} 必须是数组`);
    }
    
    if (arr.length === 0) {
      throw new Error(`${fieldName} 不能为空数组`);
    }
    
    if (itemValidator) {
      for (let i = 0; i < arr.length; i++) {
        try {
          itemValidator(arr[i], `${fieldName}[${i}]`);
        } catch (error) {
          throw new Error(`${fieldName} 第 ${i + 1} 项无效: ${error.message}`);
        }
      }
    }
    
    return true;
  }

  /**
   * 验证状态值
   * @param {*} status - 状态值
   * @param {Array} allowedStatuses - 允许的状态值数组
   * @returns {Boolean} 是否有效
   */
  static validateStatus(status, allowedStatuses) {
    const numStatus = Number(status);
    if (isNaN(numStatus)) {
      throw new Error('状态必须是有效的数字');
    }
    
    if (!Number.isInteger(numStatus)) {
      throw new Error('状态必须是整数');
    }
    
    if (!allowedStatuses.includes(numStatus)) {
      throw new Error(`状态值无效，允许的值: ${allowedStatuses.join(', ')}`);
    }
    
    return true;
  }

  /**
   * 验证必填字段
   * @param {Object} data - 数据对象
   * @param {Array} requiredFields - 必填字段数组
   * @returns {Array} 缺失的字段
   */
  static validateRequiredFields(data, requiredFields) {
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        missingFields.push(field);
      }
    }
    
    return missingFields;
  }

  /**
   * 创建验证中间件
   * @param {Object} schema - 验证模式
   * @returns {Function} Express中间件
   */
  static createValidationMiddleware(schema) {
    return (req, res, next) => {
      try {
        const errors = [];
        
        // 验证body参数
        if (schema.body) {
          const bodyErrors = this.validateObject(req.body, schema.body, 'body');
          errors.push(...bodyErrors);
        }
        
        // 验证query参数
        if (schema.query) {
          const queryErrors = this.validateObject(req.query, schema.query, 'query');
          errors.push(...queryErrors);
        }
        
        // 验证params参数
        if (schema.params) {
          const paramsErrors = this.validateObject(req.params, schema.params, 'params');
          errors.push(...paramsErrors);
        }
        
        if (errors.length > 0) {
          return next(createValidationError('输入验证失败', { errors }));
        }
        
        next();
      } catch (error) {
        next(createValidationError('验证器配置错误', { error: error.message }));
      }
    };
  }

  /**
   * 验证对象
   * @param {Object} obj - 要验证的对象
   * @param {Object} rules - 验证规则
   * @param {String} prefix - 错误信息前缀
   * @returns {Array} 错误列表
   */
  static validateObject(obj, rules, prefix = '') {
    const errors = [];
    
    for (const [field, rule] of Object.entries(rules)) {
      const value = obj[field];
      const fieldPath = prefix ? `${prefix}.${field}` : field;
      
      // 检查必填字段
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${fieldPath} 是必填字段`);
        continue;
      }
      
      // 如果字段不存在且不是必填的，跳过验证
      if (value === undefined || value === null) {
        continue;
      }
      
      // 类型验证
      if (rule.type) {
        if (rule.type === 'string' && typeof value !== 'string') {
          errors.push(`${fieldPath} 必须是字符串`);
          continue;
        }
        
        if (rule.type === 'number') {
          const numValue = Number(value);
          if (isNaN(numValue)) {
            errors.push(`${fieldPath} 必须是有效的数字`);
            continue;
          }
          
          // 验证最小值
          if (rule.min !== undefined && numValue < rule.min) {
            errors.push(`${fieldPath} 不能小于 ${rule.min}`);
          }
          
          // 验证最大值
          if (rule.max !== undefined && numValue > rule.max) {
            errors.push(`${fieldPath} 不能大于 ${rule.max}`);
          }
          
          // 验证整数
          if (rule.integer && !Number.isInteger(numValue)) {
            errors.push(`${fieldPath} 必须是整数`);
          }
          
          // 验证正数
          if (rule.positive && numValue <= 0) {
            errors.push(`${fieldPath} 必须是正数`);
          }
        }
        
        if (rule.type === 'array' && !Array.isArray(value)) {
          errors.push(`${fieldPath} 必须是数组`);
          continue;
        }
      }
      
      // 自定义验证函数
      if (rule.validate && typeof rule.validate === 'function') {
        try {
          rule.validate(value);
        } catch (error) {
          errors.push(`${fieldPath} ${error.message}`);
        }
      }
      
      // 正则表达式验证
      if (rule.pattern && typeof value === 'string') {
        const regex = new RegExp(rule.pattern);
        if (!regex.test(value)) {
          errors.push(`${fieldPath} 格式不正确`);
        }
      }
      
      // 长度验证
      if (rule.length && typeof value === 'string') {
        if (value.length > rule.length) {
          errors.push(`${fieldPath} 长度不能超过 ${rule.length} 个字符`);
        }
      }
      
      // 枚举验证
      if (rule.enum && Array.isArray(rule.enum)) {
        if (!rule.enum.includes(value)) {
          errors.push(`${fieldPath} 必须是以下值之一: ${rule.enum.join(', ')}`);
        }
      }
    }
    
    return errors;
  }
}

// 常用的验证模式
InputValidator.SCHEMAS = {
  // 商品创建/更新验证模式
  PRODUCT: {
    body: {
      name: { type: 'string', required: true, length: 200 },
      price: { type: 'number', required: true, positive: true, max: 9999999.99 },
      stock: { type: 'number', required: true, positive: true, max: 999999 },
      description: { type: 'string', length: 2000 },
      status: { type: 'number', integer: true, min: 0, max: 2 }
    }
  },
  
  // 订单创建验证模式
  ORDER: {
    body: {
      customer_name: { type: 'string', required: true, length: 50 },
      phone: { 
        type: 'string', 
        required: true, 
        pattern: '^1[3-9]\\d{9}$',
        validate: (value) => InputValidator.validatePhone(value)
      },
      address: { type: 'string', required: true, length: 200 },
      items: { 
        type: 'array', 
        required: true,
        validate: (value) => InputValidator.validateArray(value, 'items', (item) => {
          if (!item.product_name) throw new Error('商品名称不能为空');
          if (typeof item.price !== 'number' || item.price <= 0) throw new Error('价格必须为正数');
          if (typeof item.quantity !== 'number' || item.quantity <= 0) throw new Error('数量必须为正数');
        })
      }
    }
  },
  
  // 地址验证模式
  ADDRESS: {
    body: {
      name: { type: 'string', required: true, length: 50 },
      phone: { 
        type: 'string', 
        required: true, 
        pattern: '^1[3-9]\\d{9}$',
        validate: (value) => InputValidator.validatePhone(value)
      },
      address: { type: 'string', required: true, length: 200 },
      province: { type: 'string', length: 20 },
      city: { type: 'string', length: 20 },
      district: { type: 'string', length: 20 }
    }
  },
  
  // 用户注册验证模式
  USER_REGISTER: {
    body: {
      username: { type: 'string', required: true, length: 50 },
      email: { 
        type: 'string', 
        required: true, 
        validate: (value) => InputValidator.validateEmail(value)
      },
      phone: { 
        type: 'string', 
        pattern: '^1[3-9]\\d{9}$',
        validate: (value) => InputValidator.validatePhone(value)
      },
      password: { type: 'string', required: true, length: { min: 6, max: 50 } }
    }
  }
};

module.exports = InputValidator;
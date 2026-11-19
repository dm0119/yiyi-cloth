// 自定义错误类
class AppError extends Error {
  constructor(message, statusCode, code = 'UNKNOWN_ERROR', details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  // 确保错误对象有必要的属性
  const error = {
    message: err.message || '服务器内部错误',
    statusCode: err.statusCode || 500,
    code: err.code || 'UNKNOWN_ERROR',
    details: err.details || {}
  };
  
  // 记录错误日志
  console.error('Error:', {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    error: error
  });
  
  // 开发环境下可以返回详细的错误信息
  if (process.env.NODE_ENV === 'development') {
    return res.status(error.statusCode).json({
      success: false,
      ...error,
      stack: err.stack
    });
  }
  
  // 生产环境下只返回必要的错误信息
  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
    code: error.code,
    details: error.details
  });
};

// 错误类型常量
const ERROR_TYPES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  DATABASE_ERROR: 'DATABASE_ERROR',
  BUSINESS_ERROR: 'BUSINESS_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
};

// 错误创建辅助函数
const createError = (message, statusCode, code, details) => {
  return new AppError(message, statusCode, code, details);
};

// 特定错误创建函数
const createValidationError = (message, details = {}) => {
  return new AppError(message, 400, ERROR_TYPES.VALIDATION_ERROR, details);
};

const createNotFoundError = (message, details = {}) => {
  return new AppError(message, 404, ERROR_TYPES.NOT_FOUND, details);
};

const createUnauthorizedError = (message, details = {}) => {
  return new AppError(message, 401, ERROR_TYPES.UNAUTHORIZED, details);
};

const createForbiddenError = (message, details = {}) => {
  return new AppError(message, 403, ERROR_TYPES.FORBIDDEN, details);
};

const createBusinessError = (message, details = {}) => {
  return new AppError(message, 400, ERROR_TYPES.BUSINESS_ERROR, details);
};

const createInternalError = (message, details = {}) => {
  return new AppError(message, 500, ERROR_TYPES.INTERNAL_ERROR, details);
};

module.exports = {
  AppError,
  errorHandler,
  ERROR_TYPES,
  createError,
  createValidationError,
  createNotFoundError,
  createUnauthorizedError,
  createForbiddenError,
  createBusinessError,
  createInternalError
};

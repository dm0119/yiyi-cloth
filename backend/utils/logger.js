/**
 * 日志工具
 * 使用 winston 进行结构化日志记录
 * 
 * 使用方式：
 * const { logger, requestLogger } = require('../utils/logger')
 * logger.info('消息', { key: 'value' })
 * logger.error('错误', { error: err.message })
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// 确保日志目录存在
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 分类日志目录
const categoryLogs = {
  error: path.join(logDir, 'error.log'),
  warn: path.join(logDir, 'warn.log'),
  info: path.join(logDir, 'info.log'),
  debug: path.join(logDir, 'debug.log'),
  business: path.join(logDir, 'business.log'),
  access: path.join(logDir, 'access.log'),
  security: path.join(logDir, 'security.log')
}

// 确保分类日志目录存在
Object.values(categoryLogs).forEach(dir => {
  const dirPath = path.dirname(dir)
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
})

// 定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// 定义控制台日志格式（更易读）
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

// 获取日志级别
const getLogLevel = () => {
  if (process.env.LOG_LEVEL) return process.env.LOG_LEVEL
  if (process.env.NODE_ENV === 'production') return 'info'
  return 'debug'
}

// 创建主日志记录器
const logger = winston.createLogger({
  level: getLogLevel(),
  format: logFormat,
  defaultMeta: { 
    service: 'backend-api',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // 错误日志文件
    new winston.transports.File({
      filename: categoryLogs.error,
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10
    }),
    // 警告日志文件
    new winston.transports.File({
      filename: categoryLogs.warn,
      level: 'warn',
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5
    }),
    // 所有日志文件
    new winston.transports.File({
      filename: categoryLogs.info,
      level: 'info',
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5
    }),
    // 控制台输出
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
    })
  ]
});

// 添加便捷的日志方法
logger.logLogin = (username, success, ip, userId = null) => {
  const level = success ? 'info' : 'warn'
  logger.log(level, `用户登录${success ? '成功' : '失败'}: ${username}`, {
    event: 'LOGIN',
    username,
    success,
    ip,
    userId
  })
}

logger.logLogout = (username, ip, userId = null) => {
  logger.info(`用户登出: ${username}`, {
    event: 'LOGOUT',
    username,
    ip,
    userId
  })
}

logger.logPermission = (username, permission, allowed, userId = null) => {
  const level = allowed ? 'info' : 'warn'
  logger.log(level, `权限验证${allowed ? '通过' : '拒绝'}: ${username} - ${permission}`, {
    event: 'PERMISSION_CHECK',
    username,
    permission,
    allowed,
    userId
  })
}

logger.logSecurity = (event, details) => {
  logger.warn(`安全事件: ${event}`, {
    event: 'SECURITY',
    ...details
  })
}

logger.logApi = (method, path, statusCode, duration, ip = '') => {
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info'
  logger.log(level, `API请求: ${method} ${path}`, {
    event: 'API_REQUEST',
    method,
    path,
    statusCode,
    duration,
    ip
  })
}

// 请求日志中间件
const requestLogger = (req, res, next) => {
  const start = Date.now()
  const { method, url, ip } = req
  const requestId = req.headers['x-request-id'] || generateRequestId()
  
  // 在请求对象上添加 requestId
  req.requestId = requestId
  
  // 监听响应完成事件
  res.on('finish', () => {
    const duration = Date.now() - start
    const { statusCode } = res
    
    logger.logApi(method, url, statusCode, `${duration}ms`, ip)
  })
  
  next()
}

// 生成请求ID
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 导出日志记录器和中间件
module.exports = {
  logger,
  requestLogger
}

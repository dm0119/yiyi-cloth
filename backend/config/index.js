module.exports = {
  database: {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'web',
    port: 3306,
    charset: 'utf8mb4'
  },
  server: {
    port: 3000
  },
  jwtSecret: 'bigsize_ecommerce_jwt_secret_key_2026_secure_token_signing',
  
  // Redis 配置
  redis: {
    enabled: true,
    host: '127.0.0.1',
    port: 6379,
    password: '',
    db: 0,
    keyPrefix: 'backend:'
  },
  
  // 缓存配置
  cache: {
    // 权限缓存配置
    permission: {
      enabled: true,
      ttl: 300,           // 5分钟
      maxSize: 1000       // 最大缓存条目数
    },
    // 数据缓存配置
    data: {
      enabled: true,
      ttl: 60,            // 1分钟
      maxSize: 500
    }
  },
  
  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    businessLogEnabled: true,
    requestLogEnabled: true
  }
}

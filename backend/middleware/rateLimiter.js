/**
 * 简单的基于内存的请求频率限制器
 */

class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 15 * 60 * 1000 // 15分钟
    this.max = options.max || 100 // 最大请求数
    this.message = options.message || '请求过于频繁，请稍后再试'
    this.requestMap = new Map()
    
    // 定期清理过期记录
    setInterval(() => {
      const now = Date.now()
      for (const [key, data] of this.requestMap.entries()) {
        if (now - data.timestamp > this.windowMs) {
          this.requestMap.delete(key)
        }
      }
    }, 60 * 1000) // 每分钟清理一次
  }
  
  middleware() {
    return (req, res, next) => {
      const key = this._getKey(req)
      const now = Date.now()
      const data = this.requestMap.get(key)
      
      if (!data || now - data.timestamp > this.windowMs) {
        // 新的窗口或窗口已过期
        this.requestMap.set(key, {
          count: 1,
          timestamp: now
        })
        next()
      } else {
        // 检查是否超过限制
        if (data.count >= this.max) {
          const resetTime = Math.ceil((data.timestamp + this.windowMs - now) / 1000)
          return res.status(429).json({
            success: false,
            message: this.message,
            retryAfter: resetTime
          })
        }
        
        // 增加计数
        data.count++
        next()
      }
    }
  }
  
  _getKey(req) {
    // 优先使用 IP，其次使用用户 ID
    const ip = req.ip || req.connection.remoteAddress || 'unknown'
    const userId = req.user ? req.user.id : 'anonymous'
    return `${ip}:${req.path}:${userId}`
  }
  
  // 清除指定 key 的计数
  clear(req) {
    const key = this._getKey(req)
    this.requestMap.delete(key)
  }
}

// 创建预设的限流器实例
const merchantApplyLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 小时
  max: 5, // 每小时最多申请 5 次（开发环境放宽限制）
  message: '提交申请过于频繁，请 1 小时后再试'
})

const generalLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100,
  message: '请求过于频繁，请稍后再试'
})

module.exports = {
  RateLimiter,
  merchantApplyLimiter,
  generalLimiter
}

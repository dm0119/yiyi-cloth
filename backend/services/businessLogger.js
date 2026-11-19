/**
 * 业务日志服务
 * 记录关键业务操作：登录、权限变更、订单操作等
 * 
 * 使用方式：
 * const { businessLogger } = require('../services/businessLogger')
 * businessLogger.logLogin(userId, username, true, ip)
 */

const { logger } = require('../utils/logger')
const { query } = require('../db/connection')

class BusinessLogger {
  constructor() {
    this.logQueue = []
    this.batchSize = 10
    this.flushInterval = 5000 // 5秒批量写入
    this.startBatchFlush()
  }

  /**
   * 启动批量写入定时器
   */
  startBatchFlush() {
    setInterval(() => {
      this.flushLogs()
    }, this.flushInterval)
  }

  /**
   * 刷新日志队列到数据库
   */
  async flushLogs() {
    if (this.logQueue.length === 0) return
    
    const logsToWrite = this.logQueue.splice(0, this.batchSize)
    
    try {
      for (const log of logsToWrite) {
        await this.writeLogToDb(log)
      }
    } catch (error) {
      logger.error('批量写入业务日志失败', { error: error.message, count: logsToWrite.length })
    }
  }

  /**
   * 写入日志到数据库
   */
  async writeLogToDb(log) {
    try {
      await query(
        `INSERT INTO business_logs (user_id, username, action, resource, details, ip, user_agent, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [log.userId, log.username, log.action, log.resource, JSON.stringify(log.details), log.ip, log.userAgent]
      )
    } catch (error) {
      // 如果表不存在，静默失败（使用文件日志）
      if (error.code !== 'ER_NO_SUCH_TABLE') {
        logger.error('写入业务日志到数据库失败', { error: error.message, log })
      }
    }
  }

  /**
   * 添加日志到队列
   */
  addLog(logEntry) {
    this.logQueue.push(logEntry)
    
    // 超过批量大小时立即写入
    if (this.logQueue.length >= this.batchSize) {
      this.flushLogs()
    }
  }

  /**
   * 记录登录日志
   * @param {number} userId - 用户ID
   * @param {string} username - 用户名
   * @param {boolean} success - 是否成功
   * @param {string} ip - IP地址
   * @param {string} reason - 失败原因（可选）
   */
  logLogin(userId, username, success, ip, reason = '') {
    const logEntry = {
      userId: userId || null,
      username: username || '未知',
      action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
      resource: 'auth',
      details: { reason: reason || null },
      ip: ip || 'unknown',
      userAgent: ''
    }

    // 同时记录到文件日志
    if (success) {
      logger.info(`用户登录成功: ${username}`, { userId, ip })
    } else {
      logger.warn(`用户登录失败: ${username}`, { userId, ip, reason })
    }

    this.addLog(logEntry)
  }

  /**
   * 记录登出日志
   * @param {number} userId - 用户ID
   * @param {string} username - 用户名
   * @param {string} ip - IP地址
   */
  logLogout(userId, username, ip) {
    const logEntry = {
      userId,
      username,
      action: 'LOGOUT',
      resource: 'auth',
      details: {},
      ip: ip || 'unknown',
      userAgent: ''
    }

    logger.info(`用户登出: ${username}`, { userId, ip })
    this.addLog(logEntry)
  }

  /**
   * 记录权限变更日志
   * @param {number} operatorId - 操作者ID
   * @param {string} operatorName - 操作者名称
   * @param {number} roleId - 被操作的角色ID
   * @param {string} roleName - 角色名称
   * @param {Object} changes - 变更内容 { added: [], removed: [] }
   */
  logPermissionChange(operatorId, operatorName, roleId, roleName, changes) {
    const logEntry = {
      userId: operatorId,
      username: operatorName,
      action: 'PERMISSION_CHANGE',
      resource: 'role',
      details: { roleId, roleName, changes },
      ip: '',
      userAgent: ''
    }

    logger.info(`权限变更: ${operatorName} 修改了角色 ${roleName} 的权限`, {
      operatorId, roleId, added: changes.added, removed: changes.removed
    })

    this.addLog(logEntry)
  }

  /**
   * 记录角色创建日志
   */
  logRoleCreate(operatorId, operatorName, roleId, roleName) {
    const logEntry = {
      userId: operatorId,
      username: operatorName,
      action: 'ROLE_CREATE',
      resource: 'role',
      details: { roleId, roleName },
      ip: '',
      userAgent: ''
    }

    logger.info(`创建角色: ${operatorName} 创建了角色 ${roleName}`, { operatorId, roleId })
    this.addLog(logEntry)
  }

  /**
   * 记录角色删除日志
   */
  logRoleDelete(operatorId, operatorName, roleId, roleName) {
    const logEntry = {
      userId: operatorId,
      username: operatorName,
      action: 'ROLE_DELETE',
      resource: 'role',
      details: { roleId, roleName },
      ip: '',
      userAgent: ''
    }

    logger.warn(`删除角色: ${operatorName} 删除了角色 ${roleName}`, { operatorId, roleId })
    this.addLog(logEntry)
  }

  /**
   * 记录用户权限验证日志
   * @param {number} userId - 用户ID
   * @param {string} requiredPermission - 需要的权限
   * @param {boolean} allowed - 是否允许
   */
  logPermissionCheck(userId, username, requiredPermission, allowed) {
    const logEntry = {
      userId,
      username: username || '未知',
      action: allowed ? 'PERMISSION_GRANTED' : 'PERMISSION_DENIED',
      resource: 'permission',
      details: { requiredPermission },
      ip: '',
      userAgent: ''
    }

    if (!allowed) {
      logger.warn(`权限验证失败: ${username} 缺少权限 ${requiredPermission}`, { userId, requiredPermission })
    }

    this.addLog(logEntry)
  }

  /**
   * 记录订单操作日志
   * @param {number} userId - 操作者ID
   * @param {string} username - 操作者名称
   * @param {string} action - 操作类型
   * @param {number} orderId - 订单ID
   * @param {Object} details - 详细信息
   */
  logOrderOperation(userId, username, action, orderId, details = {}) {
    const logEntry = {
      userId,
      username,
      action: `ORDER_${action}`,
      resource: 'order',
      details: { orderId, ...details },
      ip: '',
      userAgent: ''
    }

    logger.info(`订单操作: ${username} ${action} 订单 #${orderId}`, { userId, orderId, action })
    this.addLog(logEntry)
  }

  /**
   * 记录商家审核日志
   * @param {number} operatorId - 审核者ID
   * @param {string} operatorName - 审核者名称
   * @param {number} merchantId - 商家ID
   * @param {string} merchantName - 商家名称
   * @param {string} result - 审核结果 approve/reject
   * @param {string} reason - 原因
   */
  logMerchantReview(operatorId, operatorName, merchantId, merchantName, result, reason = '') {
    const logEntry = {
      userId: operatorId,
      username: operatorName,
      action: `MERCHANT_${result.toUpperCase()}`,
      resource: 'merchant',
      details: { merchantId, merchantName, reason },
      ip: '',
      userAgent: ''
    }

    logger.info(`商家审核: ${operatorName} ${result === 'approve' ? '通过' : '拒绝'} 商家 ${merchantName}`, {
      operatorId, merchantId, result, reason
    })

    this.addLog(logEntry)
  }

  /**
   * 记录敏感操作日志（如删除大量数据）
   */
  logSensitiveAction(userId, username, action, resource, details = {}) {
    const logEntry = {
      userId,
      username,
      action: `SENSITIVE_${action}`,
      resource,
      details,
      ip: '',
      userAgent: ''
    }

    logger.warn(`敏感操作: ${username} 执行了 ${action}`, { userId, action, resource, details })
    this.addLog(logEntry)
  }
}

// 导出单例
const businessLogger = new BusinessLogger()

module.exports = {
  businessLogger
}

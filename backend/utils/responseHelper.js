/**
 * 统一 API 响应格式化工具
 * 
 * 解决的问题：
 * - 各控制器返回格式不一致
 * - 有的返回数组，有的返回对象
 * - 有的有 success 字段，有的没有
 * 
 * 使用方式：
 * const response = require('../utils/responseHelper')
 * 
 * // 成功响应
 * response.success(res, data, '查询成功')
 * response.success(res, null, '删除成功')
 * 
 * // 错误响应
 * response.error(res, '参数错误', 400)
 * response.error(res, '未找到', 404, 'NOT_FOUND')
 * 
 * // 分页响应
 * response.paginated(res, items, total, page, pageSize)
 */

class ResponseHelper {
  /**
   * 成功响应
   * @param {Object} res - Express 响应对象
   * @param {*} data - 返回数据（可选）
   * @param {string} message - 成功消息
   * @param {number} statusCode - HTTP 状态码
   */
  success(res, data = null, message = '操作成功', statusCode = 200) {
    const response = {
      success: true,
      message
    }
    
    if (data !== null && data !== undefined) {
      response.data = data
    }
    
    return res.status(statusCode).json(response)
  }

  /**
   * 成功响应（返回列表数据）
   * @param {Object} res - Express 响应对象
   * @param {Array} list - 列表数据
   * @param {string} message - 成功消息
   */
  list(res, list = [], message = '查询成功') {
    return res.status(200).json({
      success: true,
      message,
      data: list,
      count: Array.isArray(list) ? list.length : 0
    })
  }

  /**
   * 成功响应（返回单个对象）
   * @param {Object} res - Express 响应对象
   * @param {Object} item - 单个对象
   * @param {string} message - 成功消息
   */
  item(res, item = null, message = '查询成功') {
    if (!item) {
      return this.notFound(res, '资源不存在')
    }
    return res.status(200).json({
      success: true,
      message,
      data: item
    })
  }

  /**
   * 分页响应
   * @param {Object} res - Express 响应对象
   * @param {Array} data - 当前页数据
   * @param {number} total - 总记录数
   * @param {number} page - 当前页码
   * @param {number} pageSize - 每页大小
   * @param {string} message - 成功消息
   */
  paginated(res, data = [], total = 0, page = 1, pageSize = 20, message = '查询成功') {
    return res.status(200).json({
      success: true,
      message,
      data,
      meta: {
        total: parseInt(total),
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(total / pageSize)
      }
    })
  }

  /**
   * 创建成功响应
   * @param {Object} res - Express 响应对象
   * @param {Object} createdItem - 创建的项目（包含 id）
   * @param {string} message - 成功消息
   */
  created(res, createdItem, message = '创建成功') {
    return res.status(201).json({
      success: true,
      message,
      data: createdItem
    })
  }

  /**
   * 更新成功响应
   * @param {Object} res - Express 响应对象
   * @param {Object} updatedItem - 更新后的项目
   * @param {string} message - 成功消息
   */
  updated(res, updatedItem = null, message = '更新成功') {
    const response = {
      success: true,
      message
    }
    if (updatedItem) {
      response.data = updatedItem
    }
    return res.status(200).json(response)
  }

  /**
   * 删除成功响应
   * @param {Object} res - Express 响应对象
   * @param {number} count - 删除的数量
   * @param {string} message - 成功消息
   */
  deleted(res, count = 1, message = '删除成功') {
    return res.status(200).json({
      success: true,
      message,
      data: { deleted: count }
    })
  }

  // ========== 错误响应 ==========

  /**
   * 错误响应
   * @param {Object} res - Express 响应对象
   * @param {string} message - 错误消息
   * @param {number} statusCode - HTTP 状态码
   * @param {string} code - 错误码
   * @param {Object} details - 详细信息
   */
  error(res, message = '操作失败', statusCode = 500, code = 'ERROR', details = null) {
    const response = {
      success: false,
      message,
      code
    }
    
    if (details) {
      response.details = details
    }
    
    return res.status(statusCode).json(response)
  }

  /**
   * 参数错误
   */
  badRequest(res, message = '参数错误', details = null) {
    return this.error(res, message, 400, 'BAD_REQUEST', details)
  }

  /**
   * 未授权
   */
  unauthorized(res, message = '未授权', details = null) {
    return this.error(res, message, 401, 'UNAUTHORIZED', details)
  }

  /**
   * 禁止访问
   */
  forbidden(res, message = '禁止访问', details = null) {
    return this.error(res, message, 403, 'FORBIDDEN', details)
  }

  /**
   * 未找到
   */
  notFound(res, message = '资源不存在', details = null) {
    return this.error(res, message, 404, 'NOT_FOUND', details)
  }

  /**
   * 服务器内部错误
   */
  serverError(res, message = '服务器内部错误', details = null) {
    return this.error(res, message, 500, 'INTERNAL_ERROR', details)
  }

  // ========== 业务特定响应 ==========

  /**
   * 登录成功响应
   */
  loginSuccess(res, token, user, permissions) {
    return res.status(200).json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user,
        permissions
      }
    })
  }

  /**
   * 注册成功响应
   */
  registerSuccess(res, user, token, message = '注册成功') {
    return res.status(201).json({
      success: true,
      message,
      data: { user, token }
    })
  }

  /**
   * 操作成功（带影响行数）
   */
  affected(res, affectedRows, message = '操作成功') {
    return res.status(200).json({
      success: true,
      message,
      data: { affectedRows }
    })
  }
}

// 导出单例
const response = new ResponseHelper()

module.exports = response

const { query, withTransaction } = require('../db/connection')
const { createValidationError, createNotFoundError, createBusinessError, createInternalError } = require('../utils/errorHandler')

const paymentController = {
  // 模拟支付（支付宝/微信）
  async simulatePay(req, res, next) {
    try {
      const { user_id, order_id, amount, payment_method } = req.body
      
      // 参数验证
      if (!user_id || isNaN(parseInt(user_id))) {
        return next(createValidationError('无效的用户ID', { user_id }))
      }
      
      if (!order_id || isNaN(parseInt(order_id))) {
        return next(createValidationError('无效的订单ID', { order_id }))
      }
      
      if (!amount || isNaN(amount) || amount <= 0) {
        return next(createValidationError('支付金额必须大于0', { amount }))
      }
      
      if (!payment_method || !['alipay', 'wechat'].includes(payment_method)) {
        return next(createValidationError('无效的支付方式', { payment_method }))
      }
      
      const result = await withTransaction(async (connection) => {
        // 检查订单状态和归属
        const orderSql = 'SELECT * FROM orders WHERE id = ? AND status = 1 AND user_id = ?'
        const [orders] = await connection.execute(orderSql, [order_id, user_id])
        
        if (orders.length === 0) {
          throw new Error('订单不存在、状态错误或不属于当前用户')
        }
        
        const order = orders[0]
        
        // 验证支付金额是否匹配（使用容差比较避免浮点数精度问题）
        const tolerance = 0.01 // 1分钱的容差
        if (Math.abs(parseFloat(amount) - parseFloat(order.total_amount)) > tolerance) {
          throw new Error('支付金额与订单金额不匹配')
        }
        
        // 检查是否已经支付过（支付幂等性检查）
        const paymentCheckSql = 'SELECT * FROM payments WHERE order_id = ?'
        const [payments] = await connection.execute(paymentCheckSql, [order_id])
        if (payments.length > 0) {
          throw new Error('该订单已经支付过')
        }
        
        // 模拟支付处理
        console.log(`${payment_method}支付验证中...`)
        
        // 模拟支付处理
        const paymentResult = await simulatePayment(payment_method, amount)
        
        if (!paymentResult.success) {
          throw new Error(paymentResult.message || '支付失败，请稍后重试')
        }
        
        // 记录支付信息
        const insertPaymentSql = 'INSERT INTO payments (order_id, user_id, amount, payment_method, transaction_id, payment_time) VALUES (?, ?, ?, ?, ?, ?)'
        await connection.execute(insertPaymentSql, [order_id, user_id, amount, payment_method, paymentResult.data.transaction_id, paymentResult.data.payment_time])
        
        // 更新订单状态为已支付
        const updateOrderSql = 'UPDATE orders SET status = 2, payment_method = ? WHERE id = ?'
        await connection.execute(updateOrderSql, [payment_method, order_id])
        
        // 创建交易记录
        const insertTransactionSql = `
          INSERT INTO transaction_records 
          (user_id, order_id, order_no, type, amount, payment_method, status, description, transaction_time)
          VALUES (?, ?, ?, 'payment', ?, ?, 'success', ?, ?)
        `
        await connection.execute(insertTransactionSql, [
          user_id,
          order_id,
          order.order_no,
          amount,
          payment_method,
          `订单 ${order.order_no} 支付成功`,
          paymentResult.data.payment_time
        ])
        
        return {
          order_id,
          amount,
          payment_method,
          payment_time: paymentResult.data.payment_time,
          transaction_id: paymentResult.data.transaction_id
        }
      })
      
      res.json({ success: true, message: '支付成功', data: result })
    } catch (error) {
      if (error.message === '订单不存在、状态错误或不属于当前用户') {
        return next(createBusinessError('订单不存在、状态错误或不属于当前用户', { error: error.message }))
      }
      if (error.message === '支付金额与订单金额不匹配') {
        return next(createBusinessError('支付金额与订单金额不匹配', { error: error.message }))
      }
      if (error.message === '该订单已经支付过') {
        return next(createBusinessError('该订单已经支付过', { error: error.message }))
      }
      next(createInternalError('支付失败', { error: error.message }))
    }
  }
}

// 模拟支付处理
async function simulatePayment(paymentMethod, amount) {
  // 模拟支付处理延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 模拟10%的支付失败率（已关闭，直接返回成功）
  // if (Math.random() < 0.1) {
  //   return { 
  //     success: false, 
  //     message: '支付失败，请稍后重试'
  //   };
  // }
  
  // 模拟支付成功
  const transactionId = generateTransactionId()
  
  return { 
    success: true, 
    data: {
      transaction_id: transactionId,
      payment_time: new Date()
    }
  }
}

// 生成交易流水号
function generateTransactionId() {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substr(2, 8).toUpperCase()
  return `${timestamp.substr(-8)}${random}`
}

module.exports = paymentController
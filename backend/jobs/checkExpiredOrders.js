/**
 * 订单过期定时任务
 * 每 5 分钟检查一次过期订单（超过 15 分钟未支付的订单）
 */

const { withTransaction } = require('../db/connection')
const { query } = require('../db/connection')

async function checkExpiredOrders() {
  try {
    console.log('开始检查过期订单...')
    
    // 查询所有待支付且过期的订单
    const expiredOrders = await query(
      `SELECT id, order_no, user_id FROM orders 
       WHERE status = 1 
       AND expires_at < NOW()
       AND expires_at IS NOT NULL`
    )
    
    if (expiredOrders.length === 0) {
      console.log('没有过期订单需要处理')
      return
    }
    
    console.log(`发现 ${expiredOrders.length} 个过期订单，开始处理...`)
    
    // 处理每个过期订单
    for (const order of expiredOrders) {
      try {
        await withTransaction(async (connection) => {
          // 1. 更新订单状态为已取消（状态 6）
          await connection.query(
            'UPDATE orders SET status = 6, updated_at = NOW(), expires_at = NOW() WHERE id = ?',
            [order.id]
          )
          
          // 2. 恢复库存
          const [orderItems] = await connection.query(
            'SELECT product_id, quantity, size, color FROM order_items WHERE order_id = ?',
            [order.id]
          )
          
          for (const item of orderItems) {
            // 恢复商品总库存
            if (item.product_id) {
              await connection.query(
                'UPDATE products SET stock = stock + ? WHERE id = ?',
                [item.quantity, item.product_id]
              )
              
              // 恢复商品规格库存
              if (item.size && item.color) {
                await connection.query(
                  'UPDATE product_skus SET stock = stock + ? WHERE product_id = ? AND color = ? AND size = ?',
                  [item.quantity, item.product_id, item.color, item.size]
                )
              }
            }
          }
          
          // 3. 恢复优惠券（保留 order_id 和 used_at 作为历史记录，仅恢复状态为未使用）
          await connection.query(
            `UPDATE user_coupons 
             SET status = 'unused' 
             WHERE order_id = ? AND status = 'used'`,
            [order.id]
          )
          
          console.log(`订单 ${order.order_no} (ID: ${order.id}) 已取消，库存已恢复，优惠券已恢复`)
        })
      } catch (error) {
        console.error(`处理订单 ${order.order_no} 失败:`, error.message)
      }
    }
    
    console.log('过期订单处理完成')
  } catch (error) {
    console.error('检查过期订单时出错:', error)
  }
}

// 导出函数
module.exports = { checkExpiredOrders }

// 如果直接运行此文件，启动定时任务
if (require.main === module) {
  // 每5分钟执行一次
  const CHECK_INTERVAL = 5 * 60 * 1000
  
  console.log('订单过期定时任务已启动，每5分钟检查一次...')
  
  // 立即执行一次
  checkExpiredOrders()
  
  // 定时执行
  setInterval(checkExpiredOrders, CHECK_INTERVAL)
}

/**
 * 订单过期定时任务入口
 * 在主应用中启动此任务
 */

const { checkExpiredOrders } = require('./checkExpiredOrders')

// 启动订单过期检查任务
function startExpiredOrderChecker() {
  console.log('订单过期检查任务已启动，每5分钟执行一次...')
  
  // 立即执行一次
  checkExpiredOrders()
  
  // 每5分钟执行一次
  setInterval(checkExpiredOrders, 5 * 60 * 1000)
}

module.exports = { startExpiredOrderChecker }

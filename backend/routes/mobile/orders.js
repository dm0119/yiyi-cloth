const express = require('express')
const router = express.Router()
const orderController = require('../../controllers/orderController')
const { authenticateToken } = require('../../utils/authMiddleware')

// 移动端订单接口 - 需要用户认证，但不需要后台权限
// 所有路由都需要认证中间件
router.use(authenticateToken)

// 创建订单
router.post('/', orderController.create)

// 获取用户自己的订单列表
router.get('/', orderController.getUserOrders)

// 合并支付
router.post('/merge-pay', orderController.mergePay)

// 获取用户的交易记录（必须在 /:id 之前）
router.get('/transactions', orderController.getTransactionRecords)

// 获取订单详情
router.get('/:id', orderController.getById)

// 获取可评价订单
router.get('/:id/reviewable', orderController.getReviewable)

// 买家确认收货
router.post('/:id/confirm-receipt', orderController.confirmReceipt)

// 更新订单状态
router.put('/:id/status', orderController.updateStatus)

// ============ 售后相关路由 ============
const afterSaleController = require('../../controllers/afterSaleController')

// 买家申请售后
router.post('/:id/after-sale', afterSaleController.apply)

// 买家取消售后申请
router.post('/:id/after-sale/cancel', afterSaleController.cancel)

// 买家填写退货物流
router.post('/:id/after-sale/return-logistics', afterSaleController.fillReturnLogistics)

module.exports = router

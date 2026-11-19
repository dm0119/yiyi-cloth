const express = require('express')
const router = express.Router()
const orderController = require('../controllers/orderController')
const afterSaleController = require('../controllers/afterSaleController')
const { permissionMiddleware } = require('../utils/permissionMiddleware')

// 批量操作路由（必须放在参数路由之前）
// router.post('/batch-delete', permissionMiddleware('order:delete'), orderController.batchDelete)
// router.post('/admin/clear-all', permissionMiddleware('order:delete'), orderController.clearAllData)

// 基础路由
router.post('/', permissionMiddleware('order:create'), orderController.create)
router.get('/', permissionMiddleware('order:view'), orderController.getList)
// router.get('/stats', permissionMiddleware('statistics:view'), orderController.getStats)
// router.get('/status-distribution', permissionMiddleware('statistics:view'), orderController.getStatusDistribution)
// router.get('/trend', permissionMiddleware('statistics:view'), orderController.getOrderTrend)
// router.get('/size-distribution', permissionMiddleware('statistics:view'), orderController.getSizeDistribution)



// 评价相关API
router.get('/:id/reviewable', permissionMiddleware('review:view'), orderController.getReviewable)

// 物流信息更新路由
// router.put('/:id/logistics', permissionMiddleware('order:edit'), orderController.updateLogistics)

// 参数路由放在最后
router.get('/:id', permissionMiddleware('order:detail'), orderController.getById)
router.put('/:id/status', permissionMiddleware('order:edit'), orderController.updateStatus)

// 订单操作专用路由
// 特殊处理：商家发货使用 order:ship 权限，其他订单操作使用 order:edit 权限
router.post('/:id/ship', permissionMiddleware('order:ship'), orderController.ship)
router.post('/:id/set-awaiting-receipt', permissionMiddleware('order:edit'), orderController.setAwaitingReceipt)
router.post('/:id/confirm-receipt', permissionMiddleware('order:edit'), orderController.confirmReceipt)
router.post('/:id/cancel', permissionMiddleware('order:edit'), orderController.cancel)

// 售后操作路由（商家/管理员）
router.post('/:id/after-sale/approve', permissionMiddleware('order:edit'), afterSaleController.approve)
router.post('/:id/after-sale/reject', permissionMiddleware('order:edit'), afterSaleController.reject)
router.post('/:id/after-sale/confirm-received', permissionMiddleware('order:edit'), afterSaleController.confirmReceived)
router.post('/:id/after-sale/confirm-refund', permissionMiddleware('order:edit'), afterSaleController.confirmRefund)
router.post('/:id/after-sale/reship', permissionMiddleware('order:ship'), afterSaleController.reship)

module.exports = router

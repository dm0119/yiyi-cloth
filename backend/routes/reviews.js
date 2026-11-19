const express = require('express')
const router = express.Router()
const reviewController = require('../controllers/reviewController')
const { permissionMiddleware } = require('../utils/permissionMiddleware')

// 批量操作路由（必须放在参数路由之前）
router.post('/batch-delete', permissionMiddleware('review:delete'), reviewController.batchDelete)

// 获取商品评价汇总列表
router.get('/products/summary', permissionMiddleware('review:view'), reviewController.getProductSummary)

// 获取商品评价统计
router.get('/stats/product/:product_id', permissionMiddleware('statistics:view'), reviewController.getStatsByProduct)

// 批量更新商品评价状态
router.put('/product/:product_id/status', permissionMiddleware('review:edit'), reviewController.batchUpdateStatusByProduct)

// 创建评价
router.post('/', permissionMiddleware('review:create'), reviewController.create)

// 获取所有评价列表（独立于商品，用于后台管理）- 必须放在参数路由之前
router.get('/all', permissionMiddleware('review:view'), reviewController.getAllReviews)

// 根据商品 ID 获取评价列表
router.get('/product/:product_id', permissionMiddleware('review:view'), reviewController.getByProduct)

// 根据订单 ID 获取评价
router.get('/order/:order_id', permissionMiddleware('review:view'), reviewController.getByOrder)

// 获取所有评价（用于后台管理，兼容旧接口）
router.get('/', permissionMiddleware('review:view'), reviewController.getAll)

// 参数路由放在最后
router.put('/:id/status', permissionMiddleware('review:audit'), reviewController.updateStatus)
router.delete('/:id', permissionMiddleware('review:delete'), reviewController.delete)
router.post('/:id/reply', permissionMiddleware('review:edit'), reviewController.reply)
router.get('/:id/reply', permissionMiddleware('review:view'), reviewController.getReply)

module.exports = router

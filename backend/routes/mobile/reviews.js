const express = require('express')
const router = express.Router()
const reviewController = require('../../controllers/reviewController')
const { authenticateToken } = require('../../utils/authMiddleware')

// 移动端评论接口
// 获取评论的接口不需要认证，公开的
router.get('/product/:product_id', reviewController.getByProduct)
router.get('/order/:order_id', reviewController.getByOrder)
router.get('/stats/product/:product_id', reviewController.getStatsByProduct)

// 创建评价需要认证
router.post('/', authenticateToken, reviewController.create)

module.exports = router

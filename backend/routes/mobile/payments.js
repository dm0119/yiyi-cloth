const express = require('express')
const router = express.Router()
const paymentController = require('../../controllers/paymentController')
const { authenticateToken } = require('../../utils/authMiddleware')

// 模拟支付（支付宝/微信）- 需要认证
router.post('/simulate', authenticateToken, paymentController.simulatePay)

module.exports = router

const express = require('express')
const router = express.Router()
const payPasswordController = require('../../controllers/payPasswordController')
const { authenticateToken } = require('../../utils/authMiddleware')

// 所有接口都需要认证
router.use(authenticateToken)

// 获取支付密码状态
router.get('/status', payPasswordController.getPayPasswordStatus)

// 设置/修改支付密码
router.post('/set', payPasswordController.setPayPassword)

// 验证支付密码（用于支付流程）
router.post('/verify', payPasswordController.verifyPayPassword)

// 验证支付密码（用于支付流程）- 兼容旧版本
router.post('/verify-password', payPasswordController.verifyForPayment)

module.exports = router

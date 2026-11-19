const express = require('express')
const router = express.Router()
const payPasswordController = require('../../controllers/payPasswordController')
const { authenticateToken } = require('../../utils/authMiddleware')

// 所有路由都需要登录
router.use(authenticateToken)

// 设置支付密码
router.post('/set', payPasswordController.setPayPassword)

// 验证支付密码
router.post('/verify', payPasswordController.verifyPayPassword)

// 获取支付密码状态
router.get('/status', payPasswordController.getPayPasswordStatus)

module.exports = router

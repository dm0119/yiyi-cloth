/**
 * 实名认证路由
 * 买家自动审批，无需管理员审核
 */

const express = require('express')
const router = express.Router()
const realNameController = require('../controllers/realNameController')
const { authenticateToken } = require('../middleware/auth')

// 提交实名认证
router.post('/apply', authenticateToken, realNameController.apply)

// 获取实名状态
router.get('/status', authenticateToken, realNameController.getStatus)

// 获取实名详情
router.get('/my', authenticateToken, realNameController.getMyInfo)

module.exports = router

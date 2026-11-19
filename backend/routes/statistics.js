const express = require('express')
const router = express.Router()
const statisticsController = require('../controllers/statisticsController')
const { authenticateToken, checkPermission } = require('../utils/authMiddleware')

// 获取综合统计数据
router.get('/', authenticateToken, checkPermission('statistics:view'), statisticsController.getOverview)

// 获取订单状态分布
router.get('/status-distribution', authenticateToken, checkPermission('statistics:view'), statisticsController.getStatusDistribution)

// 获取订单趋势
router.get('/trend', authenticateToken, checkPermission('statistics:view'), statisticsController.getOrderTrend)

// 获取尺码分布
router.get('/size-distribution', authenticateToken, checkPermission('statistics:view'), statisticsController.getSizeDistribution)

// 获取退货原因分布
router.get('/return-reason-distribution', authenticateToken, checkPermission('statistics:view'), statisticsController.getReturnReasonDistribution)

module.exports = router
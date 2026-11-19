const express = require('express')
const router = express.Router()
const historyController = require('../controllers/historyController')
const { authenticateToken } = require('../utils/authMiddleware')

// 所有浏览记录相关接口都需要认证
router.use(authenticateToken)

// 创建浏览记录
router.post('/', historyController.create)

// 获取用户的浏览记录
router.get('/user/:user_id', historyController.getByUser)

// 删除浏览记录
router.delete('/:id', historyController.delete)

// 清空用户的浏览记录
router.post('/clear', historyController.clear)

// 同步浏览记录
router.post('/sync', historyController.sync)

module.exports = router
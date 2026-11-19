const express = require('express')
const router = express.Router()
const internalMessageController = require('../controllers/internalMessageController')
const { authenticateToken } = require('../utils/authMiddleware')

// 所有路由都需要认证
router.use(authenticateToken)

// 发送站内信
router.post('/send', internalMessageController.sendInternalMessage)

// 获取我的站内信列表
router.get('/list', internalMessageController.getMyMessages)

// 获取消息详情
router.get('/:id', internalMessageController.getMessageDetail)

// 标记消息为已读
router.put('/:id/read', internalMessageController.markAsRead)

// 标记消息为重要
router.put('/:id/important', internalMessageController.markAsImportant)

// 删除消息
router.delete('/:id', internalMessageController.deleteMessage)

// 获取未读消息数
router.get('/unread/count', internalMessageController.getUnreadCount)

// 获取买家列表（仅运营人员）
router.get('/buyers/list', internalMessageController.getBuyersList)

// 根据角色获取用户列表（用于层级选择）
router.get('/users/by-role', internalMessageController.getUsersByRole)

// 获取最近消息（用于右上角图标）
router.get('/recent', internalMessageController.getRecentMessages)

module.exports = router
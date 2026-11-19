const express = require('express')
const router = express.Router()
const conversationController = require('../../controllers/conversationController')
const messageController = require('../../controllers/messageController')
const { authenticateToken } = require('../../utils/authMiddleware')

// 移动端会话接口 - 需要用户认证，但不需要后台权限
router.use(authenticateToken)

// 获取用户自己的会话列表
router.get('/', conversationController.getConversations)

// 获取会话详情
router.get('/:id', conversationController.getConversationDetail)

// 发送消息
router.post('/:id/messages', messageController.sendMessage)

// 获取消息历史
router.get('/:id/messages', messageController.getConversationMessages)

// 关闭会话
router.put('/:id/close', conversationController.closeConversation)

module.exports = router

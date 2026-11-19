const express = require('express')
const router = express.Router()
const { authenticateToken } = require('../utils/authMiddleware')
const conversationController = require('../controllers/conversationController')
const messageController = require('../controllers/messageController')
const { permissionMiddleware } = require('../utils/permissionMiddleware')

// 会话相关路由
// 创建会话不需要认证，方便用户联系客服
router.post('/', conversationController.createConversation)
// 其他会话接口需要认证
router.get('/', authenticateToken, permissionMiddleware('conversation:view'), conversationController.getConversations)
router.get('/:id', authenticateToken, permissionMiddleware('conversation:view'), conversationController.getConversationDetail)
router.put('/:id/close', authenticateToken, permissionMiddleware('conversation:close'), conversationController.closeConversation)
router.delete('/:id', authenticateToken, permissionMiddleware('conversation:delete'), conversationController.deleteConversation)
router.get('/count/unread', authenticateToken, permissionMiddleware('conversation:view'), conversationController.getUnreadConversationsCount)

// 消息相关路由
// 发送消息和获取消息历史不需要认证，方便用户使用
router.post('/:id/messages', messageController.sendMessage)
router.get('/:id/messages', messageController.getMessageHistory)
// 其他消息接口需要认证
router.get('/:id/messages/count/unread', authenticateToken, permissionMiddleware('conversation:view'), messageController.getUnreadMessagesCount)
router.put('/:id/messages/read', authenticateToken, permissionMiddleware('conversation:chat'), messageController.markAsRead)

module.exports = router

const express = require('express');
const router = express.Router();
const discussionController = require('../controllers/discussionController');
const commentController = require('../controllers/commentController');
const { authenticateToken } = require('../utils/authMiddleware');
const { permissionMiddleware } = require('../utils/permissionMiddleware');

// 讨论相关路由
router.get('/', permissionMiddleware('discussion:view'), discussionController.list);
router.post('/', authenticateToken, permissionMiddleware('discussion:create'), discussionController.create);
router.get('/:id', permissionMiddleware('discussion:view'), discussionController.detail);
router.delete('/:id', authenticateToken, permissionMiddleware('discussion:delete'), discussionController.delete);
router.put('/:id/pin', authenticateToken, permissionMiddleware('discussion:manage'), discussionController.pinDiscussion);
router.put('/:id/unpin', authenticateToken, permissionMiddleware('discussion:manage'), discussionController.unpinDiscussion);

// 评论相关路由
router.get('/:discussion_id/comments', permissionMiddleware('discussion:view'), commentController.list);
router.post('/:discussion_id/comments', authenticateToken, permissionMiddleware('discussion:comment'), commentController.create);
router.delete('/comments/:id', authenticateToken, permissionMiddleware('discussion:delete'), commentController.delete);

module.exports = router;

const express = require('express');
const router = express.Router();
const discussionController = require('../../controllers/discussionController');
const commentController = require('../../controllers/commentController');
const { authenticateToken } = require('../../utils/authMiddleware');

// 移动端讨论接口
// 查看讨论不需要认证，公开的
router.get('/', discussionController.list);
router.get('/:id', discussionController.detail);

// 创建、删除、评论需要认证（用户认证，不是后台权限）
router.post('/', authenticateToken, discussionController.create);
router.delete('/:id', authenticateToken, discussionController.delete);

// 评论相关
router.get('/:discussion_id/comments', commentController.list);
router.post('/:discussion_id/comments', authenticateToken, commentController.create);
router.delete('/comments/:id', authenticateToken, commentController.delete);

module.exports = router;

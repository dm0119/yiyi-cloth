const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../utils/authMiddleware');

// 举报相关路由
router.get('/', authenticateToken, reportController.list);
router.post('/', authenticateToken, reportController.create);
router.put('/:id/status', authenticateToken, reportController.updateStatus);
router.delete('/:id', authenticateToken, reportController.delete);

module.exports = router;
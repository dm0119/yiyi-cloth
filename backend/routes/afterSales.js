const express = require('express')
const router = express.Router()
const afterSaleController = require('../controllers/afterSaleController')
const { permissionMiddleware } = require('../utils/permissionMiddleware')

// 售后列表（商家/管理员）
router.get('/', permissionMiddleware('order:view'), afterSaleController.getList)

// 售后详情（商家/管理员）
router.get('/:id', permissionMiddleware('order:view'), afterSaleController.getById)

module.exports = router

const express = require('express')
const router = express.Router()
const afterSaleController = require('../../controllers/afterSaleController')

// 买家的售后记录列表
router.get('/', afterSaleController.getUserAfterSales)

// 售后详情（买家）
router.get('/:id', afterSaleController.getById)

module.exports = router

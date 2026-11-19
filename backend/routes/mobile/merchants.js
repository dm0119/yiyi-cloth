const express = require('express')
const router = express.Router()
const merchantController = require('../../controllers/merchantController')
const { authenticateToken } = require('../../utils/authMiddleware')

// 搜索店铺（移动端）
router.get('/search', merchantController.searchShops)

// 获取商家店铺信息（移动端）
router.get('/:shopId', merchantController.getShopInfoForMobile)

// 获取商家商品列表（移动端）
router.get('/:shopId/products', merchantController.getShopProductsForMobile)

// 获取商家商品分类（移动端）
router.get('/:shopId/categories', merchantController.getShopCategories)

// 获取商家订单列表（商家后台）
router.get('/backend/orders', authenticateToken, merchantController.getShopOrders)

module.exports = router

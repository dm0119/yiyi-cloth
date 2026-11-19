const express = require('express')
const router = express.Router()
const merchantController = require('../controllers/merchantController')
const { authenticateToken } = require('../utils/authMiddleware')
const { permissionMiddleware } = require('../utils/permissionMiddleware')

// 获取品牌店铺列表 - 需要 admin 权限
router.get('/', authenticateToken, permissionMiddleware('shop:view'), merchantController.getBrandShops)

// 添加品牌店铺 - 需要 admin 权限
router.post('/', authenticateToken, permissionMiddleware('shop:edit'), merchantController.addBrandShop)

// 移除品牌店铺 - 需要 admin 权限
router.delete('/:shopId', authenticateToken, permissionMiddleware('shop:edit'), merchantController.removeBrandShop)

module.exports = router

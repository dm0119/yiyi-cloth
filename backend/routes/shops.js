const express = require('express')
const router = express.Router()
const merchantController = require('../controllers/merchantController')
const { authenticateToken } = require('../utils/authMiddleware')

// 获取所有店铺列表（需要超级管理员权限）
// router.get('/', authenticateToken, merchantController.getAllShops)

// 获取店铺详情
// router.get('/:shopId', authenticateToken, merchantController.getShopDetail)

// 更新店铺信息
// router.put('/:shopId', authenticateToken, merchantController.updateShopInfo)

// 删除店铺
// router.delete('/:shopId', authenticateToken, merchantController.deleteShop)

module.exports = router
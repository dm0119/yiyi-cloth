const express = require('express')
const router = express.Router()
const cartController = require('../../controllers/cartController')
const { authenticateToken } = require('../../utils/authMiddleware')

// 移动端购物车接口 - 需要用户认证
router.use(authenticateToken)

// 获取购物车列表
router.get('/', cartController.getList)

// 添加商品到购物车
router.post('/', cartController.add)

// 更新购物车商品数量
router.put('/:id', cartController.update)

// 删除购物车商品
router.delete('/:id', cartController.delete)

// 清空购物车
router.delete('/', cartController.clear)

// 批量删除购物车商品
router.post('/batch-delete', cartController.batchDelete)

module.exports = router

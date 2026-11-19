const express = require('express')
const router = express.Router()
const productController = require('../../controllers/productController')
const hotProductController = require('../../controllers/hotProductController')
const newProductController = require('../../controllers/newProductController')

// 移动端商品接口 - 不需要后台权限检查
// 固定路径必须在动态路径 (/:id) 之前定义

// 热销商品（手动管理）
router.get('/hot-products', hotProductController.getForMobile)

// 新品商品（手动管理）
router.get('/new-products', newProductController.getForMobile)

// 获取商品列表
router.get('/', productController.getList)

// 搜索商品
router.get('/search', productController.search)

// 获取分类下的商品
router.get('/category/:category_id', productController.getByCategory)

// 获取商品 SKU 列表
router.get('/:id/skus', productController.getSkus)

// 获取商品详情 (放在最后，避免拦截其他路由)
router.get('/:id', productController.getById)

module.exports = router

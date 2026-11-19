const express = require('express')
const router = express.Router()
const productController = require('../controllers/productController')
const { permissionMiddleware } = require('../utils/permissionMiddleware')

router.use((req, res, next) => {
  console.log('产品路由被调用，URL:', req.url, 'method:', req.method)
  next()
})

// 获取商品列表 - 需要 product:view 权限
router.get('/', permissionMiddleware('product:view'), productController.getList)

// 获取所有商品 - 需要 product:view 权限
router.get('/all', permissionMiddleware('product:view'), productController.getAll)

// 获取销售统计 - 需要 statistics:view 权限
router.get('/sales-stats', permissionMiddleware('statistics:view'), productController.getSalesStats)

// 获取分类下的商品 - 需要 product:view 权限
router.get('/category/:category_id', permissionMiddleware('product:view'), productController.getByCategory)

// 搜索商品 - 需要 product:view 权限
router.get('/search', permissionMiddleware('product:view'), productController.search)

// 标签相关路由
router.get('/tags/system', productController.getSystemTags)
router.get('/tags/popular', productController.getPopularTags)
router.get('/tag/:tag', productController.getByTag)

// 获取商品详情 - 需要 product:detail 权限
router.get('/:id', permissionMiddleware('product:detail'), productController.getById)

// SKU 相关路由
router.get('/:id/skus', permissionMiddleware('product:view'), productController.getSkus)
router.post('/:id/skus', permissionMiddleware('product:create'), productController.createSku)
router.put('/:id/skus/batch', permissionMiddleware('product:edit'), productController.batchUpdateSkus)
router.put('/skus/:id', permissionMiddleware('product:edit'), productController.updateSku)
router.delete('/skus/:id', permissionMiddleware('product:delete'), productController.deleteSku)

// 创建商品 - 需要 product:create 权限
router.post('/', permissionMiddleware('product:create'), productController.create)

// 更新商品 - 需要 product:edit 权限
router.put('/:id', permissionMiddleware('product:edit'), productController.update)

// 删除商品 - 需要 product:delete 权限
router.delete('/:id', permissionMiddleware('product:delete'), productController.delete)

// 批量删除商品 - 需要 product:delete 权限
router.post('/batch-delete', permissionMiddleware('product:delete'), productController.batchDelete)

// 移动端热门商品
router.get('/hot-products', productController.getHotProducts)

// 移动端新品
router.get('/new-products', productController.getNewProducts)

module.exports = router

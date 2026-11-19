const express = require('express')
const router = express.Router()
const zoneController = require('../controllers/zoneController')
const { permissionMiddleware } = require('../utils/permissionMiddleware')

router.use((req, res, next) => {
  console.log('专区路由被调用，URL:', req.url, 'method:', req.method)
  next()
})

// 获取专区列表 - 需要 zone:view 权限
router.get('/', permissionMiddleware('zone:view'), zoneController.getList)

// 获取所有专区 - 需要 zone:view 权限
router.get('/all', permissionMiddleware('zone:view'), zoneController.getAll)

// 获取专区详情 - 需要 zone:view 权限
router.get('/:id', permissionMiddleware('zone:view'), zoneController.getById)

// 获取专区商品 - 需要 zone:view 权限
router.get('/:id/products', permissionMiddleware('zone:view'), zoneController.getZoneProducts)

// 创建专区 - 需要 zone:manage 权限
router.post('/', permissionMiddleware('zone:manage'), zoneController.create)

// 更新专区 - 需要 zone:manage 权限
router.put('/:id', permissionMiddleware('zone:manage'), zoneController.update)

// 删除专区 - 需要 zone:manage 权限
router.delete('/:id', permissionMiddleware('zone:manage'), zoneController.delete)

// 添加商品到专区 - 需要 zone:manage 权限
router.post('/add-product', permissionMiddleware('zone:manage'), zoneController.addProductToZone)

// 从专区移除商品 - 需要 zone:manage 权限
router.post('/remove-product', permissionMiddleware('zone:manage'), zoneController.removeProductFromZone)

module.exports = router

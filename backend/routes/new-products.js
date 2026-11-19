const express = require('express')
const router = express.Router()
const newProductController = require('../controllers/newProductController')
const { permissionMiddleware } = require('../utils/permissionMiddleware')

router.get('/', permissionMiddleware('new_product:view'), newProductController.getList)
router.get('/available', permissionMiddleware('new_product:view'), newProductController.getAvailableProducts)
router.get('/mobile', newProductController.getForMobile)
router.post('/', permissionMiddleware('new_product:manage'), newProductController.add)
router.put('/:id/sort', permissionMiddleware('new_product:manage'), newProductController.updateSortOrder)
router.delete('/:id', permissionMiddleware('new_product:manage'), newProductController.remove)

module.exports = router

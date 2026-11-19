const express = require('express')
const router = express.Router()
const hotProductController = require('../controllers/hotProductController')
const { permissionMiddleware } = require('../utils/permissionMiddleware')

router.get('/', permissionMiddleware('hot_product:view'), hotProductController.getList)
router.get('/available', permissionMiddleware('hot_product:view'), hotProductController.getAvailableProducts)
router.get('/mobile', hotProductController.getForMobile)
router.post('/', permissionMiddleware('hot_product:manage'), hotProductController.add)
router.put('/:id/sort', permissionMiddleware('hot_product:manage'), hotProductController.updateSortOrder)
router.delete('/:id', permissionMiddleware('hot_product:manage'), hotProductController.remove)

module.exports = router

const express = require('express')
const router = express.Router()
const zoneController = require('../../controllers/zoneController')

router.use((req, res, next) => {
  console.log('移动端专区路由被调用，URL:', req.url, 'method:', req.method)
  next()
})

router.get('/', zoneController.getList)
router.get('/:id', zoneController.getById)
router.get('/:id/products', zoneController.getZoneProducts)

module.exports = router
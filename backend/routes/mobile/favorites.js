const express = require('express')
const router = express.Router()
const favoritesController = require('../../controllers/favoritesController')
const { authenticateToken } = require('../../utils/authMiddleware')

// 所有收藏接口都需要认证
router.use(authenticateToken)

router.use((req, res, next) => {
  console.log('收藏路由被调用，URL:', req.url, 'method:', req.method)
  next()
})

router.get('/', favoritesController.getList)
router.post('/', favoritesController.add)
router.get('/check/:productId', favoritesController.check)
router.delete('/:productId', favoritesController.remove)

module.exports = router

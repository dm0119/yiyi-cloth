const express = require('express')
const router = express.Router()
const shopFollowController = require('../../controllers/shopFollowController')
const { authenticateToken } = require('../../utils/authMiddleware')

// 所有店铺关注接口都需要认证
router.use(authenticateToken)

router.get('/', shopFollowController.getList)
router.post('/', shopFollowController.add)
router.get('/check/:shopId', shopFollowController.check)
router.delete('/:shopId', shopFollowController.remove)

module.exports = router

const express = require('express')
const router = express.Router()
const couponController = require('../controllers/couponController')
const { authenticateToken } = require('../utils/authMiddleware')
const { permissionMiddleware } = require('../utils/permissionMiddleware')

// 用户端 API（需要认证但无需权限控制）
router.get('/available', authenticateToken, couponController.getAvailableCoupons)
router.post('/receive', authenticateToken, couponController.receiveCoupon)
router.get('/user', authenticateToken, couponController.getUserCoupons)
router.get('/check-product', authenticateToken, couponController.checkProductCoupons)
router.post('/recommend', authenticateToken, couponController.recommendBestCoupon)
router.post('/use', authenticateToken, couponController.useCoupon)
router.get('/:id/products', authenticateToken, couponController.getCouponProducts)

// 后台管理 API（需要权限控制）
router.post('/', authenticateToken, permissionMiddleware('coupon:create'), couponController.createCoupon)
router.get('/', authenticateToken, permissionMiddleware('coupon:view'), couponController.getAllCoupons)
router.get('/:id', authenticateToken, permissionMiddleware('coupon:detail'), couponController.getCouponById)
router.put('/:id', authenticateToken, permissionMiddleware('coupon:edit'), couponController.updateCoupon)
router.delete('/:id', authenticateToken, permissionMiddleware('coupon:delete'), couponController.deleteCoupon)

module.exports = router

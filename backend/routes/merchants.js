const express = require('express')
const router = express.Router()
const merchantController = require('../controllers/merchantController')
const { authenticateToken, checkPermission } = require('../utils/authMiddleware')

// 申请入驻（不需要登录）
router.post('/apply', merchantController.apply)

// 获取入驻申请状态（需要登录）
router.get('/status', authenticateToken, merchantController.getStatus)

// 获取待审核的入驻申请列表（需要超级管理员权限）
router.get('/pending', authenticateToken, checkPermission('merchant:review'), merchantController.getPendingList)

// 获取已审核的入驻申请列表（需要超级管理员权限）
router.get('/reviewed', authenticateToken, checkPermission('merchant:review'), merchantController.getReviewedList)

// 审核入驻申请（需要超级管理员权限）
router.post('/review', authenticateToken, checkPermission('merchant:review'), merchantController.reviewApplication)

// 获取所有店铺列表（管理员）
router.get('/shops', authenticateToken, checkPermission('merchant:review'), merchantController.getAllShops)

// 获取未品牌化的店铺列表（用于品牌管理）
router.get('/non-brand-shops', authenticateToken, checkPermission('merchant:review'), merchantController.getNonBrandShops)

// 获取品牌列表（按品牌分组）
router.get('/brands', merchantController.getBrands)

// 根据品牌名称获取店铺列表（移动端）
router.get('/brand-shops', merchantController.getBrandShopsByName)

// 获取店铺详情（管理员）
router.get('/shops/:shopId', authenticateToken, checkPermission('merchant:review'), merchantController.getShopDetail)

// 更新店铺信息（管理员）
router.put('/shops/:shopId', authenticateToken, checkPermission('merchant:review'), merchantController.updateShopInfo)

// 删除店铺（管理员）
router.delete('/shops/:shopId', authenticateToken, checkPermission('merchant:review'), merchantController.deleteShop)

// 获取店铺信息（需要登录）
router.get('/shop', authenticateToken, merchantController.getShop)

// 更新店铺信息（需要登录）
router.put('/shop', authenticateToken, merchantController.updateShop)

// 获取商家订单列表（需要登录）
router.get('/orders', authenticateToken, merchantController.getShopOrders)

// 获取订单详情（需要登录）
router.get('/orders/:orderId', authenticateToken, merchantController.getOrderDetail)

// 更新订单状态（需要登录）
router.put('/orders/:orderId/status', authenticateToken, merchantController.updateOrderStatus)

// 获取商家商品列表（需要登录）
router.get('/shops/:shopId/products', authenticateToken, merchantController.getShopProducts)

// 获取商家评价列表（需要登录）
router.get('/reviews', authenticateToken, merchantController.getShopReviews);

// 获取退货原因统计（需要登录）
router.get('/stats/return-reasons', authenticateToken, merchantController.getReturnReasons);

// 获取尺码分布统计（需要登录）
router.get('/stats/size-distribution', authenticateToken, merchantController.getSizeDistribution);

// 获取公告列表（不需要登录，用于登录页展示）
router.get('/announcements', merchantController.getAnnouncements);

module.exports = router
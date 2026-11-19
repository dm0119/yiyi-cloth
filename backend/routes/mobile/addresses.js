const express = require('express')
const router = express.Router()
const addressController = require('../../controllers/addressController')
const { authenticateToken } = require('../../utils/authMiddleware')

// 所有地址接口都需要认证
router.use(authenticateToken)

// 获取地址列表
router.get('/', addressController.getAddresses)

// 获取单个地址详情
router.get('/:id', addressController.getAddress)

// 新增地址
router.post('/', addressController.createAddress)

// 编辑地址
router.put('/:id', addressController.updateAddress)

// 删除地址
router.delete('/:id', addressController.deleteAddress)

// 设置默认地址
router.put('/:id/default', addressController.setDefaultAddress)

module.exports = router
const express = require('express')
const router = express.Router()
const categoryController = require('../../controllers/categoryController')

// 移动端分类接口 - 不需要后台权限检查
router.get('/', categoryController.getList)
router.get('/tree', categoryController.getTree)
router.get('/children/:parentId', categoryController.getChildren)
router.get('/:id', categoryController.getById)
router.post('/', categoryController.create)
router.put('/:id', categoryController.update)
router.delete('/:id', categoryController.delete)

module.exports = router

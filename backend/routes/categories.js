const express = require('express')
const router = express.Router()
const categoryController = require('../controllers/categoryController')
const { permissionMiddleware } = require('../utils/permissionMiddleware')

router.get('/', permissionMiddleware('category:view'), categoryController.getList)
router.get('/tree', permissionMiddleware('category:view'), categoryController.getTree)
router.get('/children/:parentId', permissionMiddleware('category:view'), categoryController.getChildren)
router.post('/', permissionMiddleware('category:create'), categoryController.create)

// 测试路由
router.delete('/test/:id', async (req, res) => {
  try {
    const { id } = req.params
    res.json({ success: true, message: '测试删除成功', id: id })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// 参数路由放在最后
router.get('/:id', permissionMiddleware('category:view'), categoryController.getById)
router.put('/:id', permissionMiddleware('category:edit'), categoryController.update)
router.delete('/:id', permissionMiddleware('category:delete'), categoryController.delete)

module.exports = router

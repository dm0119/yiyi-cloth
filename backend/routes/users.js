const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const { permissionMiddleware } = require('../utils/permissionMiddleware')
const { authenticateToken } = require('../utils/authMiddleware')

router.use((req, res, next) => {
  console.log('用户路由被调用，URL:', req.url, 'method:', req.method)
  next()
})

// 获取用户列表 - 需要 user:view 权限
router.get('/', permissionMiddleware('user:view'), userController.getUserList)

// 获取用户注册趋势 - 需要 statistics:view 权限
router.get('/registration-trend', permissionMiddleware('statistics:view'), userController.getRegistrationTrend)

// 获取用户总数 - 需要 user:view 权限
router.get('/count', permissionMiddleware('user:view'), userController.getUserCount)

// 创建用户 - 需要 user:create 权限
router.post('/', permissionMiddleware('user:create'), userController.create)

// 测试DELETE路由
router.delete('/test-delete', (req, res) => {
  res.json({ success: true, message: 'DELETE路由测试成功' })
})

// 参数路由放在最后
// 获取用户信息 - 需要 user:detail 权限
router.get('/:userId', permissionMiddleware('user:detail'), userController.getUserInfo)

// 更新用户信息 - 需要 user:edit 权限
router.put('/:userId', permissionMiddleware('user:edit'), userController.updateUserInfo)

// 修改密码 - 需要 user:edit 权限
router.put('/:userId/password', permissionMiddleware('user:edit'), userController.changePassword)

// 删除用户 - 需要 user:delete 权限
router.delete('/:userId', permissionMiddleware('user:delete'), userController.deleteUser)

// 更新用户状态 - 需要 user:freeze 权限
router.put('/:userId/status', permissionMiddleware('user:freeze'), userController.updateStatus)

// 刷新当前用户权限（不需要特定权限，只需登录）
router.get('/info/permissions', authenticateToken, userController.refreshPermissions)

module.exports = router

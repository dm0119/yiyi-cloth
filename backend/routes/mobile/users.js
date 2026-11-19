const express = require('express')
const router = express.Router()
const userController = require('../../controllers/userController')
const { authenticateToken } = require('../../utils/authMiddleware')

router.use((req, res, next) => {
  console.log('移动端用户路由被调用，URL:', req.url, 'method:', req.method)
  next()
})

// 测试路由
router.get('/test', (req, res) => {
  res.json({ success: true, message: '测试路由工作正常' })
})

// 用户注册（无需认证）
router.post('/register', userController.register)

// 用户登录（无需认证）
router.post('/login', userController.login)

// 获取用户信息（需要认证）
router.get('/:userId', authenticateToken, userController.getUserInfo)

// 更新用户信息（需要认证）
router.put('/:userId', authenticateToken, userController.updateUserInfo)

// 修改密码（需要认证）
router.put('/:userId/password', authenticateToken, userController.changePassword)

// 忘记密码：验证用户名和姓名（无需认证）
router.post('/verify-info', userController.verifyUserInfo)

// 忘记密码：重置密码（无需认证）
router.put('/:userId/reset-password', userController.resetPassword)

module.exports = router
const express = require('express')
const router = express.Router()
const roleController = require('../controllers/roleController')
const { permissionMiddleware } = require('../utils/permissionMiddleware')
const { superAdminOnly } = require('../middleware/superAdminMiddleware')

router.use((req, res, next) => {
  console.log('角色路由被调用，URL:', req.url, 'method:', req.method)
  next()
})

// 获取权限树（不需要特殊权限）
router.get('/permission-tree', roleController.getPermissionTree)

// 获取角色默认权限（不需要特殊权限）
router.get('/default-permissions/:roleCode', roleController.getDefaultPermissions)

// P1: 分配权限（必须由超级管理员执行）
router.put('/:roleId/permissions',
  permissionMiddleware('role:edit'),
  superAdminOnly,
  roleController.assignPermissions
)

// P2: 获取审计日志（需要审计查看权限）
router.get('/audit-logs',
  permissionMiddleware('role:view'),
  roleController.getAuditLogs
)

// 获取角色列表（需要 role:view 权限）
router.get('/', permissionMiddleware('role:view'), roleController.getRoleList)

// 获取角色信息（需要 role:view 权限）
router.get('/:roleId', permissionMiddleware('role:view'), roleController.getRoleInfo)

// 创建角色（需要 role:create 权限）
router.post('/', permissionMiddleware('role:create'), roleController.createRole)

// 更新角色（需要 role:edit 权限）
router.put('/:roleId', permissionMiddleware('role:edit'), roleController.updateRole)

// 删除角色（需要 role:delete 权限）
router.delete('/:roleId', permissionMiddleware('role:delete'), roleController.deleteRole)

module.exports = router

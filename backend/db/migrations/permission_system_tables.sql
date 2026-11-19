-- 权限管理系统数据库表设计
-- 按角色分配权限，菜单与功能点分离

-- 1. 菜单表：存储左侧导航栏的父级菜单及子菜单
CREATE TABLE IF NOT EXISTS `menus` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `parent_id` INT UNSIGNED DEFAULT 0 COMMENT '父菜单ID，0表示顶级菜单',
  `name` VARCHAR(50) NOT NULL COMMENT '菜单名称',
  `path` VARCHAR(100) DEFAULT '' COMMENT '菜单路径',
  `icon` VARCHAR(50) DEFAULT '' COMMENT '菜单图标',
  `sort` INT UNSIGNED DEFAULT 0 COMMENT '排序号',
  `status` TINYINT UNSIGNED DEFAULT 1 COMMENT '状态：0禁用 1启用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_parent_id (`parent_id`),
  INDEX idx_sort (`sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜单表';

-- 2. 功能点表：存储每个菜单下可控制的"操作权限"
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `menu_id` INT UNSIGNED NOT NULL COMMENT '关联的菜单ID',
  `code` VARCHAR(100) NOT NULL UNIQUE COMMENT '权限代码，如 product:view',
  `name` VARCHAR(50) NOT NULL COMMENT '权限名称，如 查看商品',
  `description` VARCHAR(200) DEFAULT '' COMMENT '权限描述',
  `type` ENUM('button', 'api', 'menu') DEFAULT 'button' COMMENT '权限类型',
  `sort` INT UNSIGNED DEFAULT 0 COMMENT '排序号',
  `status` TINYINT UNSIGNED DEFAULT 1 COMMENT '状态：0禁用 1启用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_menu_id (`menu_id`),
  INDEX idx_code (`code`),
  UNIQUE INDEX idx_code_unique (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='功能点表';

-- 3. 角色表：已有 roles 表，添加新字段
-- ALTER TABLE `roles` ADD COLUMN `menu_ids` JSON DEFAULT NULL COMMENT '角色拥有的菜单ID列表' AFTER `permissions`;

-- 4. 角色权限关联表：记录角色与功能点的关联（一个角色可拥有多个功能点）
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `role_id` INT UNSIGNED NOT NULL COMMENT '角色ID',
  `permission_id` INT UNSIGNED NOT NULL COMMENT '功能点ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_role_permission (`role_id`, `permission_id`),
  INDEX idx_role_id (`role_id`),
  INDEX idx_permission_id (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色权限关联表';

-- 初始化菜单数据
INSERT INTO `menus` (`id`, `parent_id`, `name`, `path`, `icon`, `sort`, `status`) VALUES
(1, 0, '控制台', '/', 'DataAnalysis', 1, 1),
(2, 0, '商品中心', '', 'Goods', 2, 1),
(3, 2, '商品管理', '/products', '', 1, 1),
(4, 2, '分类管理', '/categories', '', 2, 1),
(5, 2, '热门推荐', '/hot-products', '', 3, 1),
(6, 2, '新品推荐', '/new-products', '', 4, 1),
(7, 0, '订单中心', '', 'ShoppingCart', 3, 1),
(8, 7, '订单管理', '/orders', '', 1, 1),
(9, 7, '优惠券管理', '/coupons', '', 2, 1),
(10, 7, '评价管理', '/reviews', '', 3, 1),
(11, 0, '用户中心', '', 'User', 4, 1),
(12, 11, '用户管理', '/users', '', 1, 1),
(13, 11, '角色管理', '/roles', '', 2, 1),
(14, 11, '商家管理', '/merchant-applications', '', 3, 1),
(15, 0, '店铺管理', '/shops', 'Shop', 5, 1),
(16, 0, '社区中心', '', 'ChatRound', 6, 1),
(17, 16, '社区管理', '/discussions', '', 1, 1),
(18, 16, '专区管理', '/zones', '', 2, 1),
(19, 0, '客服中心', '', 'ChatDotRound', 7, 1),
(20, 19, '会话管理', '/conversations', '', 1, 1),
(21, 0, '数据统计', '', 'TrendCharts', 8, 1);

-- 初始化功能点数据
INSERT INTO `permissions` (`menu_id`, `code`, `name`, `description`, `type`, `sort`, `status`) VALUES
-- 控制台
(1, 'dashboard:view', '查看控制台', '查看数据概览', 'button', 1, 1),
-- 商品管理
(3, 'product:view', '查看商品', '查看商品列表', 'button', 1, 1),
(3, 'product:create', '新增商品', '创建新商品', 'button', 2, 1),
(3, 'product:edit', '编辑商品', '编辑商品信息', 'button', 3, 1),
(3, 'product:delete', '删除商品', '删除商品', 'button', 4, 1),
(3, 'product:status', '上架/下架', '商品上架下架操作', 'button', 5, 1),
-- 分类管理
(4, 'category:view', '查看分类', '查看分类列表', 'button', 1, 1),
(4, 'category:create', '新增分类', '创建新分类', 'button', 2, 1),
(4, 'category:edit', '编辑分类', '编辑分类信息', 'button', 3, 1),
(4, 'category:delete', '删除分类', '删除分类', 'button', 4, 1),
-- 热门推荐
(5, 'hot_product:view', '查看推荐', '查看热门推荐', 'button', 1, 1),
(5, 'hot_product:manage', '管理推荐', '管理热门推荐', 'button', 2, 1),
-- 新品推荐
(6, 'new_product:view', '查看新品', '查看新品推荐', 'button', 1, 1),
(6, 'new_product:manage', '管理新品', '管理新品推荐', 'button', 2, 1),
-- 订单管理
(8, 'order:view', '查看订单', '查看订单列表', 'button', 1, 1),
(8, 'order:detail', '订单详情', '查看订单详情', 'button', 2, 1),
(8, 'order:edit', '编辑订单', '编辑订单信息', 'button', 3, 1),
(8, 'order:ship', '订单发货', '订单发货操作', 'button', 4, 1),
(8, 'order:refund', '订单退款', '订单退款操作', 'button', 5, 1),
(8, 'order:close', '关闭订单', '关闭订单', 'button', 6, 1),
(8, 'order:logistics', '物流管理', '物流信息管理', 'button', 7, 1),
-- 优惠券管理
(9, 'coupon:view', '查看优惠券', '查看优惠券列表', 'button', 1, 1),
(9, 'coupon:create', '新增优惠券', '创建新优惠券', 'button', 2, 1),
(9, 'coupon:edit', '编辑优惠券', '编辑优惠券信息', 'button', 3, 1),
(9, 'coupon:delete', '删除优惠券', '删除优惠券', 'button', 4, 1),
(9, 'coupon:issue', '发放优惠券', '发放优惠券给用户', 'button', 5, 1),
-- 评价管理
(10, 'review:view', '查看评价', '查看评价列表', 'button', 1, 1),
(10, 'review:audit', '评价审核', '审核评价', 'button', 2, 1),
(10, 'review:delete', '删除评价', '删除评价', 'button', 3, 1),
-- 用户管理
(12, 'user:view', '查看用户', '查看用户列表', 'button', 1, 1),
(12, 'user:detail', '用户详情', '查看用户详情', 'button', 2, 1),
(12, 'user:edit', '编辑用户', '编辑用户信息', 'button', 3, 1),
(12, 'user:freeze', '冻结/解冻', '冻结或解冻用户', 'button', 4, 1),
(12, 'user:delete', '删除用户', '删除用户', 'button', 5, 1),
-- 角色管理
(13, 'role:view', '查看角色', '查看角色列表', 'button', 1, 1),
(13, 'role:create', '新增角色', '创建新角色', 'button', 2, 1),
(13, 'role:edit', '编辑角色', '编辑角色信息', 'button', 3, 1),
(13, 'role:delete', '删除角色', '删除角色', 'button', 4, 1),
-- 商家管理
(14, 'merchant:view', '查看商家', '查看商家列表', 'button', 1, 1),
(14, 'merchant:review', '审核商家', '审核商家入驻申请', 'button', 2, 1),
(14, 'merchant:edit', '编辑商家', '编辑商家信息', 'button', 3, 1),
(14, 'merchant:delete', '删除商家', '删除商家', 'button', 4, 1),
-- 店铺管理
(15, 'shop:view', '查看店铺', '查看店铺列表', 'button', 1, 1),
(15, 'shop:edit', '编辑店铺', '编辑店铺信息', 'button', 2, 1),
-- 社区管理
(17, 'discussion:view', '查看社区', '查看社区帖子', 'button', 1, 1),
(17, 'discussion:audit', '帖子审核', '审核帖子', 'button', 2, 1),
(17, 'discussion:delete', '删除帖子', '删除帖子', 'button', 3, 1),
-- 专区管理
(18, 'zone:view', '查看专区', '查看专区列表', 'button', 1, 1),
(18, 'zone:manage', '管理专区', '管理专区', 'button', 2, 1),
-- 会话管理
(20, 'conversation:view', '查看会话', '查看会话列表', 'button', 1, 1),
(20, 'conversation:chat', '在线沟通', '在线与用户沟通', 'button', 2, 1),
(20, 'conversation:history', '会话记录', '查看会话历史记录', 'button', 3, 1),
-- 数据统计
(21, 'statistics:view', '查看统计', '查看数据统计', 'button', 1, 1),
(21, 'statistics:export', '数据导出', '导出统计数据', 'button', 2, 1);

-- 为超级管理员角色分配所有权限（role_id = 1）
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 1, id FROM permissions WHERE status = 1;

-- 为运营人员角色分配部分权限（role_id = 3）
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 3, id FROM permissions WHERE code IN (
  'dashboard:view',
  'product:view', 'product:create', 'product:edit', 'product:status',
  'category:view', 'category:create', 'category:edit',
  'hot_product:view', 'hot_product:manage',
  'new_product:view', 'new_product:manage',
  'order:view', 'order:detail', 'order:edit', 'order:ship', 'order:refund', 'order:close', 'order:logistics',
  'coupon:view', 'coupon:create', 'coupon:edit', 'coupon:delete', 'coupon:issue',
  'review:view', 'review:audit', 'review:delete',
  'discussion:view', 'discussion:audit', 'discussion:delete',
  'zone:view', 'zone:manage',
  'statistics:view', 'statistics:export'
);

-- 为客服人员角色分配部分权限（role_id = 4）
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 4, id FROM permissions WHERE code IN (
  'dashboard:view',
  'conversation:view', 'conversation:chat', 'conversation:history',
  'product:view', 'category:view', 'hot_product:view', 'new_product:view',
  'order:view', 'order:detail',
  'coupon:view',
  'review:view',
  'user:view', 'user:detail',
  'discussion:view', 'zone:view',
  'statistics:view'
);
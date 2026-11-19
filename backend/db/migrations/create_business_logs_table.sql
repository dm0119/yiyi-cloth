-- 业务日志表
-- 用于记录关键业务操作日志

CREATE TABLE IF NOT EXISTS `business_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED DEFAULT NULL COMMENT '操作用户ID',
  `username` VARCHAR(50) DEFAULT '' COMMENT '操作用户名',
  `action` VARCHAR(50) NOT NULL COMMENT '操作类型：LOGIN_SUCCESS/LOGIN_FAILED/PERMISSION_CHANGE/ORDER_SHIP等',
  `resource` VARCHAR(50) DEFAULT '' COMMENT '资源类型：auth/role/order/merchant等',
  `details` JSON DEFAULT NULL COMMENT '操作详情，JSON格式',
  `ip` VARCHAR(45) DEFAULT '' COMMENT 'IP地址，支持IPv6',
  `user_agent` VARCHAR(500) DEFAULT '' COMMENT '用户代理字符串',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (`user_id`),
  INDEX idx_action (`action`),
  INDEX idx_resource (`resource`),
  INDEX idx_created_at (`created_at`),
  INDEX idx_username (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='业务操作日志表';

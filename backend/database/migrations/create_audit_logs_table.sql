-- 审计日志表
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL COMMENT '操作人ID',
  username VARCHAR(50) NOT NULL COMMENT '操作人用户名',
  action VARCHAR(50) NOT NULL COMMENT '操作类型: update_permissions, update_role, delete_role, create_role',
  target_type VARCHAR(20) NOT NULL COMMENT '目标类型: role, user',
  target_id INT NOT NULL COMMENT '目标ID',
  old_value TEXT COMMENT '修改前的值 (JSON)',
  new_value TEXT COMMENT '修改后的值 (JSON)',
  ip_address VARCHAR(45) COMMENT '操作IP地址',
  user_agent VARCHAR(255) COMMENT '浏览器信息',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  INDEX idx_user_id (user_id),
  INDEX idx_target (target_type, target_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审计日志表';

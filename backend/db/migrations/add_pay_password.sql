-- 添加支付密码相关字段到用户表
-- 执行时间：2026-04-14

-- 1. 添加支付密码字段（加密存储）
ALTER TABLE users ADD COLUMN pay_password VARCHAR(64) DEFAULT NULL COMMENT '支付密码(加密存储，SHA256)';

-- 2. 添加支付密码状态字段（0-未设置 1-已设置）
ALTER TABLE users ADD COLUMN pay_password_status TINYINT DEFAULT 0 COMMENT '支付密码状态 0-未设置 1-已设置';

-- 3. 添加密码连续错误次数（用于安全锁定）
ALTER TABLE users ADD COLUMN pay_password_error_count TINYINT DEFAULT 0 COMMENT '支付密码连续错误次数';

-- 4. 添加密码锁定截止时间（用于临时锁定）
ALTER TABLE users ADD COLUMN pay_password_locked_until DATETIME DEFAULT NULL COMMENT '支付密码锁定截止时间';

-- 创建索引提高查询效率
CREATE INDEX idx_pay_password_status ON users(pay_password_status);

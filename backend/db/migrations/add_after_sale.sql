-- 售后功能数据库迁移
-- 执行时间：2026-04-17

-- 1. 为 order_returns 表添加售后类型、凭证图片、换货规格、退款金额、处理人、店铺等字段
ALTER TABLE order_returns 
  ADD COLUMN type ENUM('refund','return_refund','exchange') NOT NULL DEFAULT 'refund' COMMENT '售后类型：refund-急速退款，return_refund-退货退款，exchange-换货' AFTER user_id,
  ADD COLUMN images JSON NULL COMMENT '凭证图片，JSON格式存储图片URL数组' AFTER description,
  ADD COLUMN new_color VARCHAR(50) NULL COMMENT '换货-新颜色' AFTER return_tracking_number,
  ADD COLUMN new_size VARCHAR(50) NULL COMMENT '换货-新尺码' AFTER new_color,
  ADD COLUMN refund_amount DECIMAL(10,2) NULL COMMENT '退款金额' AFTER new_size,
  ADD COLUMN admin_id INT NULL COMMENT '处理人ID' AFTER refund_amount,
  ADD COLUMN processed_at DATETIME NULL COMMENT '处理时间' AFTER admin_id,
  ADD COLUMN shop_id INT NULL COMMENT '店铺ID' AFTER processed_at;

-- 2. 为 orders 表添加售后关联字段
ALTER TABLE orders 
  ADD COLUMN after_sale_type ENUM('refund','return_refund','exchange') NULL COMMENT '当前售后类型' AFTER payment_method,
  ADD COLUMN after_sale_id INT NULL COMMENT '关联售后记录ID' AFTER after_sale_type;

-- 3. 更新 order_returns 表的 status 字段注释
ALTER TABLE order_returns 
  MODIFY COLUMN status TINYINT DEFAULT 1 COMMENT '1-待处理 2-已同意(待填写退货物流) 3-退货中 4-待退款 5-已完成 6-已拒绝';

-- 4. 为 orders 表添加 completed_at 字段（如果不存在）
-- 注意：这个字段可能已经通过其他方式添加，如果报错请忽略
ALTER TABLE orders ADD COLUMN completed_at DATETIME NULL COMMENT '完成时间' AFTER shipped_at;

-- 5. 为新字段添加索引
ALTER TABLE order_returns ADD INDEX idx_type (type);
ALTER TABLE order_returns ADD INDEX idx_shop_id (shop_id);
ALTER TABLE orders ADD INDEX idx_after_sale_id (after_sale_id);

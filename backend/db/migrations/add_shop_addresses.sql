-- 为 shops 表添加退货地址和发货地址字段
-- 执行时间：2026-05-25

ALTER TABLE shops 
ADD COLUMN return_address VARCHAR(500) COMMENT '退货地址' AFTER contact_email,
ADD COLUMN shipping_address VARCHAR(500) COMMENT '发货地址' AFTER return_address;

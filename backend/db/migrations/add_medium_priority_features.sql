-- 中优先级功能 - 数据库迁移
-- 创建时间：2026-03-31
-- 说明：添加合并支付表、销量冗余字段和触发器

-- ========================================
-- 1. 创建合并支付表
-- ========================================
CREATE TABLE IF NOT EXISTS merge_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pay_no VARCHAR(50) NOT NULL UNIQUE COMMENT '合并支付单号',
  user_id INT NOT NULL COMMENT '用户 ID',
  total_amount DECIMAL(10, 2) NOT NULL COMMENT '总金额',
  status ENUM('pending', 'paid', 'cancelled', 'refunded') DEFAULT 'pending' COMMENT '支付状态',
  order_ids JSON NOT NULL COMMENT '子订单 ID 列表',
  paid_at DATETIME DEFAULT NULL COMMENT '支付时间',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_pay_no (pay_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='合并支付表';

-- ========================================
-- 2. 为 orders 表添加合并支付关联字段
-- ========================================
ALTER TABLE orders 
ADD COLUMN merge_payment_id INT NULL COMMENT '合并支付单 ID',
ADD INDEX idx_merge_payment_id (merge_payment_id);

-- ========================================
-- 3. 为 products 表添加销量冗余字段
-- ========================================
ALTER TABLE products 
ADD COLUMN sales_count_virtual INT DEFAULT 0 COMMENT '虚拟销量（用于排序）',
ADD COLUMN sales_count_real INT DEFAULT 0 COMMENT '实际销量（已完成订单）',
ADD INDEX idx_sales_virtual (sales_count_virtual);

-- ========================================
-- 4. 初始化现有商品的销量数据
-- ========================================
UPDATE products p
SET sales_count_real = (
  SELECT COALESCE(SUM(oi.quantity), 0)
  FROM order_items oi
  INNER JOIN orders o ON oi.order_id = o.id
  WHERE oi.product_id = p.id 
    AND o.status IN ('completed', 'delivered', 'paid', 'shipped')
),
sales_count_virtual = (
  SELECT COALESCE(SUM(oi.quantity), 0)
  FROM order_items oi
  INNER JOIN orders o ON oi.order_id = o.id
  WHERE oi.product_id = p.id 
    AND o.status IN ('completed', 'delivered', 'paid', 'shipped')
);

-- ========================================
-- 5. 创建销量自动更新触发器
-- ========================================
DELIMITER $$

-- 插入订单商品时更新销量
CREATE TRIGGER trg_update_sales_after_order_insert
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
  DECLARE order_status VARCHAR(20);
  SELECT status INTO order_status FROM orders WHERE id = NEW.order_id LIMIT 1;
  
  IF order_status IN ('completed', 'delivered', 'paid', 'shipped') THEN
    UPDATE products 
    SET sales_count_real = sales_count_real + NEW.quantity,
        sales_count_virtual = sales_count_virtual + NEW.quantity
    WHERE id = NEW.product_id;
  END IF;
END$$

-- 订单状态变更时更新销量
CREATE TRIGGER trg_update_sales_after_order_status_change
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
  -- 订单从有效状态变为无效状态，扣减销量
  IF OLD.status IN ('completed', 'delivered', 'paid', 'shipped') 
     AND NEW.status IN ('cancelled', 'refunded') THEN
    UPDATE products p
    INNER JOIN order_items oi ON p.id = oi.product_id
    SET p.sales_count_real = p.sales_count_real - oi.quantity,
        p.sales_count_virtual = p.sales_count_virtual - oi.quantity
    WHERE oi.order_id = NEW.id;
  END IF;
  
  -- 订单从无效状态变为有效状态，恢复销量
  IF OLD.status IN ('cancelled', 'refunded')
     AND NEW.status IN ('completed', 'delivered', 'paid', 'shipped') THEN
    UPDATE products p
    INNER JOIN order_items oi ON p.id = oi.product_id
    SET p.sales_count_real = p.sales_count_real + oi.quantity,
        p.sales_count_virtual = p.sales_count_virtual + oi.quantity
    WHERE oi.order_id = NEW.id;
  END IF;
END$$

-- 删除订单商品时更新销量
CREATE TRIGGER trg_update_sales_after_order_item_delete
AFTER DELETE ON order_items
FOR EACH ROW
BEGIN
  DECLARE order_status VARCHAR(20);
  SELECT status INTO order_status FROM orders WHERE id = OLD.order_id LIMIT 1;
  
  IF order_status IN ('completed', 'delivered', 'paid', 'shipped') THEN
    UPDATE products 
    SET sales_count_real = sales_count_real - OLD.quantity,
        sales_count_virtual = sales_count_virtual - OLD.quantity
    WHERE id = OLD.product_id;
  END IF;
END$$

DELIMITER ;

-- ========================================
-- 6. 添加 shops 表的默认头像字段（可选）
-- ========================================
ALTER TABLE shops 
ADD COLUMN avatar_color_index INT DEFAULT 0 COMMENT '默认头像颜色索引';

-- ========================================
-- 迁移完成
-- ========================================

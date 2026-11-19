-- 高优先级问题修复 - 数据库迁移
-- 创建时间：2026-03-31
-- 说明：添加必要索引优化查询性能

-- 1. 为 shops 表的 status 字段添加索引，优化店铺状态查询
CREATE INDEX IF NOT EXISTS idx_shops_status ON shops(status);

-- 2. 为 products 表的 shop_id 添加索引，优化关联查询
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products(shop_id);

-- 3. 为 orders 表的 status 字段添加索引，优化订单状态查询
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- 4. 为 orders 表的 shop_id 添加索引，优化商家订单查询
CREATE INDEX IF NOT EXISTS idx_orders_shop_id ON orders(shop_id);

-- 5. 为 order_items 表的 order_id 添加索引，优化订单商品查询
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 6. 为 order_items 表的 product_id 添加索引，优化商品销量统计
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- 迁移完成

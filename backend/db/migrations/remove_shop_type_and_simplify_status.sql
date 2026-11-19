-- 删除 shops 表中的 type 字段
-- 执行时间：2026-04-15

USE yiyi_shop;

-- 1. 删除 shops 表的 type 字段
ALTER TABLE shops DROP COLUMN IF EXISTS type;

-- 2. 修改 shops 表的 status 字段，只保留 active 和 inactive 两个状态
ALTER TABLE shops MODIFY COLUMN status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '店铺状态：active-启用，inactive-禁用';

-- 3. 更新现有店铺状态（将 pending/suspended/closed 转为 inactive）
UPDATE shops SET status = 'inactive' WHERE status IN ('pending', 'suspended', 'closed');

-- 4. 验证修改结果
DESCRIBE shops;

SELECT ' shops 表结构修改完成！' AS message;

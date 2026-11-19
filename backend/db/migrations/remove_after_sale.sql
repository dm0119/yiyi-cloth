-- 删除售后相关数据库表和字段

-- 1. 删除 return_requests 表
DROP TABLE IF EXISTS return_requests;

-- 2. 删除 orders 表中的 after_sale_status 字段（如果存在）
SET @dbname = DATABASE();
SET @tablename = 'orders';
SET @columnname = 'after_sale_status';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  CONCAT('ALTER TABLE ', @tablename, ' DROP COLUMN ', @columnname),
  'SELECT ''Column already does not exist'''
));
PREPARE altertable FROM @preparedStatement;
EXECUTE altertable;
DEALLOCATE PREPARE altertable;

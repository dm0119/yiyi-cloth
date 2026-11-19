-- 店铺关注（收藏）表
CREATE TABLE IF NOT EXISTS shop_follows (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL COMMENT '用户ID',
  shop_id INT NOT NULL COMMENT '店铺ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '关注时间',
  UNIQUE KEY unique_user_shop (user_id, shop_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_shop_id (shop_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='店铺关注表';

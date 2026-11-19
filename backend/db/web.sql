/*
 Navicat Premium Dump SQL

 Source Server         : web
 Source Server Type    : MySQL
 Source Server Version : 80044 (8.0.44)
 Source Host           : localhost:3306
 Source Schema         : web

 Target Server Type    : MySQL
 Target Server Version : 80044 (8.0.44)
 File Encoding         : 65001

 Date: 22/05/2026 07:03:01
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for addresses
-- ----------------------------
DROP TABLE IF EXISTS `addresses`;
CREATE TABLE `addresses`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '用户ID',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '收货人姓名',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '手机号',
  `province` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '省份',
  `city` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '城市',
  `district` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '区县',
  `detail` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '详细地址',
  `is_default` tinyint(1) NULL DEFAULT 0 COMMENT '是否默认地址',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 21 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of addresses
-- ----------------------------
INSERT INTO `addresses` VALUES (2, 1, '????', '13800138000', '', '', '', '??????????', 1, '2026-03-14 22:33:35', '2026-03-14 22:33:35');
INSERT INTO `addresses` VALUES (3, 22, '钱多多', '15246150570', '', '', '', '大庆', 0, '2026-03-15 07:28:27', '2026-03-21 14:35:30');
INSERT INTO `addresses` VALUES (4, 22, '钱多多', '15246150570', '黑龙江省', '哈尔滨市', '南岗区', '黑龙江省哈尔滨市南岗区哈尔滨学院', 1, '2026-03-15 07:31:46', '2026-03-25 23:18:39');
INSERT INTO `addresses` VALUES (5, 45, '张白白', '15246350570', '', '', '', '哈尔滨学院', 1, '2026-03-18 08:58:24', '2026-03-18 08:58:24');
INSERT INTO `addresses` VALUES (6, 22, '钱多多', '15246150570', '黑龙江省', '大庆市', '萨尔图区', '黑龙江省大庆市萨尔图区大庆', 0, '2026-03-21 14:35:30', '2026-03-22 08:52:18');
INSERT INTO `addresses` VALUES (7, 22, '钱多多', '15246150570', '黑龙江省', '大庆市', '龙凤区', '黑龙江省大庆市龙凤区向阳小区1号楼2单元201', 0, '2026-03-21 14:46:51', '2026-03-25 23:18:39');
INSERT INTO `addresses` VALUES (8, 22, '钱多多', '15246150570', '黑龙江省', '哈尔滨市', '南岗区', '黑龙江省哈尔滨市南岗区黑龙江省哈尔滨市南岗区哈尔滨学院', 0, '2026-03-21 14:47:52', '2026-03-22 08:52:59');
INSERT INTO `addresses` VALUES (10, 47, '赵奕然', '15646897978', '黑龙江省', '哈尔滨市', '南岗区', '黑龙江省哈尔滨市南岗区新阳小区13栋2单元201', 1, '2026-03-27 16:51:21', '2026-03-27 16:51:21');
INSERT INTO `addresses` VALUES (11, 49, '林百思', '16455889586', '黑龙江省', '哈尔滨市', '南岗区', '黑龙江省哈尔滨市南岗区哈尔滨学院', 1, '2026-03-27 19:21:45', '2026-03-27 19:21:45');
INSERT INTO `addresses` VALUES (12, 48, '秦月来', '13566897858', '黑龙江省', '哈尔滨市', '南岗区', '黑龙江省哈尔滨市南岗区哈尔滨学院', 1, '2026-03-27 19:38:30', '2026-03-27 19:38:30');
INSERT INTO `addresses` VALUES (13, 68, '李雨桐', '15246151515', '黑龙江省', '哈尔滨市', '南岗区', '黑龙江省哈尔滨市南岗区哈尔滨学院', 0, '2026-04-15 08:58:47', '2026-04-15 08:58:47');
INSERT INTO `addresses` VALUES (14, 72, '张海明', '15246156365', '黑龙江省', '哈尔滨市', '道里区', '黑龙江省哈尔滨市道里区哈尔滨学院', 1, '2026-04-15 14:56:57', '2026-04-15 14:56:57');
INSERT INTO `addresses` VALUES (15, 74, '张云海', '15246956565', '黑龙江省', '哈尔滨市', '道里区', '黑龙江省哈尔滨市道里区哈尔滨学院', 1, '2026-04-15 15:17:04', '2026-04-15 15:17:04');
INSERT INTO `addresses` VALUES (16, 78, '王珍珍', '15246777775', '黑龙江省', '哈尔滨市', '南岗区', '黑龙江省哈尔滨市南岗区哈尔滨学院', 1, '2026-04-19 18:31:29', '2026-04-19 18:31:29');
INSERT INTO `addresses` VALUES (17, 78, '王珍珍', '15246151517', '黑龙江省', '哈尔滨市', '道里区', '黑龙江省哈尔滨市道里区哈尔滨学院', 0, '2026-04-20 14:00:35', '2026-04-20 14:00:35');
INSERT INTO `addresses` VALUES (18, 78, '王珍珍', '15246151517', '黑龙江省', '哈尔滨市', '道里区', '黑龙江省哈尔滨市道里区道里菜市场', 0, '2026-04-20 14:01:07', '2026-04-20 14:01:07');
INSERT INTO `addresses` VALUES (19, 78, '王珍珍', '15246151517', '黑龙江省', '大庆市', '龙凤区', '黑龙江省大庆市龙凤区龙凤街道向阳小区10栋1单元101', 0, '2026-04-20 14:02:12', '2026-04-20 14:02:12');
INSERT INTO `addresses` VALUES (20, 78, '王珍珍', '15246151517', '黑龙江省', '大庆市', '萨尔图区', '黑龙江省大庆市萨尔图区百货大楼', 0, '2026-04-20 14:03:15', '2026-04-20 14:03:15');

-- ----------------------------
-- Table structure for audit_logs
-- ----------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '操作人ID',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '操作人用户名',
  `action` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '操作类型: update_permissions, update_role, delete_role, create_role',
  `target_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '目标类型: role, user',
  `target_id` int NOT NULL COMMENT '目标ID',
  `old_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '修改前的值 (JSON)',
  `new_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '修改后的值 (JSON)',
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '操作IP地址',
  `user_agent` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '浏览器信息',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_target`(`target_type` ASC, `target_id` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 16 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '审计日志表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of audit_logs
-- ----------------------------
INSERT INTO `audit_logs` VALUES (1, 1, 'admin', 'update_permissions', 'role', 2, '[\"dashboard:view\",\"product:view\",\"product:create\",\"product:edit\",\"product:status\",\"category:view\",\"category:create\",\"category:edit\",\"hot_product:view\",\"hot_product:manage\",\"new_product:view\",\"new_product:manage\",\"order:view\",\"order:detail\",\"order:edit\",\"order:ship\",\"order:refund\",\"order:close\",\"order:logistics\",\"coupon:view\",\"coupon:create\",\"coupon:edit\",\"coupon:delete\",\"coupon:issue\",\"review:view\",\"review:audit\",\"review:delete\",\"discussion:view\",\"discussion:audit\",\"discussion:delete\",\"zone:view\",\"zone:manage\",\"statistics:view\",\"statistics:export\"]', '[\"dashboard:view\",\"product:view\",\"order:view\"]', '127.0.0.1', NULL, '2026-04-01 13:33:02');
INSERT INTO `audit_logs` VALUES (2, 1, 'admin', 'update_permissions', 'role', 2, '[\"dashboard:view\",\"product:view\",\"order:view\"]', '[\"dashboard:view\",\"category:view\",\"category:create\",\"category:edit\",\"hot_product:view\",\"hot_product:manage\",\"new_product:view\",\"new_product:manage\",\"order:view\",\"order:detail\",\"order:edit\",\"order:ship\",\"order:refund\",\"order:close\",\"order:logistics\",\"coupon:view\",\"coupon:create\",\"coupon:edit\",\"coupon:delete\",\"coupon:issue\",\"review:view\",\"review:audit\",\"review:delete\",\"discussion:view\",\"discussion:audit\",\"discussion:delete\",\"zone:view\",\"zone:manage\",\"statistics:view\",\"statistics:export\"]', '127.0.0.1', NULL, '2026-04-01 13:35:26');
INSERT INTO `audit_logs` VALUES (3, 1, 'admin', 'update_permissions', 'role', 6, '[\"dashboard:view\",\"product:view\",\"product:create\",\"product:edit\",\"product:delete\",\"product:status\",\"category:view\",\"order:view\",\"order:detail\",\"order:ship\",\"order:close\",\"coupon:view\",\"coupon:create\",\"coupon:edit\",\"review:view\",\"statistics:view\",\"hot_product:view\",\"new_product:view\",\"new_product:manage\",\"shop:view\"]', '[\"product:view\",\"product:create\",\"product:edit\",\"product:delete\",\"product:status\",\"category:view\",\"order:view\",\"order:detail\",\"order:ship\",\"order:close\",\"coupon:view\",\"coupon:create\",\"coupon:edit\",\"review:view\",\"statistics:view\",\"hot_product:view\",\"new_product:view\",\"new_product:manage\",\"shop:view\"]', '127.0.0.1', NULL, '2026-04-01 13:38:39');
INSERT INTO `audit_logs` VALUES (4, 1, 'admin', 'update_permissions', 'role', 6, '[\"product:view\",\"product:create\",\"product:edit\",\"product:delete\",\"product:status\",\"category:view\",\"order:view\",\"order:detail\",\"order:ship\",\"order:close\",\"coupon:view\",\"coupon:create\",\"coupon:edit\",\"review:view\",\"statistics:view\",\"hot_product:view\",\"new_product:view\",\"new_product:manage\",\"shop:view\",\"hot_product:manage\",\"category:manage\",\"order:manage\",\"review:manage\",\"coupon:manage\",\"shop:manage\",\"dashboard:view\"]', '[\"product:view\",\"product:create\",\"product:edit\",\"product:delete\",\"product:status\",\"category:view\",\"order:view\",\"order:detail\",\"order:ship\",\"order:close\",\"coupon:view\",\"coupon:create\",\"coupon:edit\",\"review:view\",\"statistics:view\",\"new_product:view\",\"new_product:manage\",\"shop:view\",\"dashboard:view\"]', '127.0.0.1', NULL, '2026-04-06 19:22:23');
INSERT INTO `audit_logs` VALUES (5, 1, 'admin', 'update_role', 'role', 5, '{\"name\":\"买家\",\"description\":\"店铺运营者，负责商品管理和店铺运营\"}', '{\"name\":\"买家\",\"description\":\"移动端买家\"}', '127.0.0.1', NULL, '2026-04-11 21:58:03');
INSERT INTO `audit_logs` VALUES (6, 1, 'admin', 'update_role', 'role', 6, '{\"name\":\"商家\",\"description\":null}', '{\"name\":\"商家\",\"description\":\"管理店铺\"}', '127.0.0.1', NULL, '2026-04-11 21:58:22');
INSERT INTO `audit_logs` VALUES (7, 1, 'admin', 'update_permissions', 'role', 2, '[\"dashboard:view\",\"product:view\",\"product:create\",\"product:edit\",\"product:status\",\"product:manage\",\"category:view\",\"category:create\",\"category:edit\",\"category:delete\",\"category:manage\",\"order:view\",\"order:detail\",\"order:edit\",\"order:ship\",\"order:refund\",\"order:close\",\"order:manage\",\"coupon:view\",\"coupon:create\",\"coupon:edit\",\"coupon:delete\",\"coupon:manage\",\"review:view\",\"review:audit\",\"review:manage\",\"statistics:view\"]', '[\"dashboard:view\",\"product:view\",\"product:create\",\"product:edit\",\"product:status\",\"category:view\",\"category:create\",\"category:edit\",\"category:delete\",\"order:view\",\"order:detail\",\"order:edit\",\"order:ship\",\"order:refund\",\"order:close\",\"coupon:view\",\"coupon:create\",\"coupon:edit\",\"coupon:delete\",\"review:view\",\"review:audit\",\"discussion:view\",\"discussion:audit\",\"discussion:delete\",\"zone:view\",\"zone:manage\",\"statistics:view\"]', '127.0.0.1', NULL, '2026-04-20 18:41:15');
INSERT INTO `audit_logs` VALUES (8, 1, 'admin', 'update_permissions', 'role', 2, '[\"dashboard:view\",\"product:view\",\"product:create\",\"product:edit\",\"product:status\",\"category:view\",\"category:create\",\"category:edit\",\"category:delete\",\"order:view\",\"order:detail\",\"order:edit\",\"order:ship\",\"order:refund\",\"order:close\",\"coupon:view\",\"coupon:create\",\"coupon:edit\",\"coupon:delete\",\"review:view\",\"review:audit\",\"discussion:view\",\"discussion:audit\",\"discussion:delete\",\"zone:view\",\"zone:manage\",\"statistics:view\"]', '[\"dashboard:view\",\"product:view\",\"product:create\",\"product:edit\",\"product:status\",\"category:view\",\"category:create\",\"category:edit\",\"category:delete\",\"hot_product:view\",\"hot_product:manage\",\"new_product:view\",\"new_product:manage\",\"order:view\",\"order:detail\",\"order:edit\",\"order:ship\",\"order:refund\",\"order:close\",\"coupon:view\",\"coupon:create\",\"coupon:edit\",\"coupon:delete\",\"review:view\",\"review:audit\",\"discussion:view\",\"discussion:audit\",\"discussion:delete\",\"zone:view\",\"zone:manage\",\"statistics:view\"]', '127.0.0.1', NULL, '2026-04-20 18:43:10');
INSERT INTO `audit_logs` VALUES (9, 1, 'admin', 'update_permissions', 'role', 6, '[\"dashboard:view\",\"product:view\",\"product:create\",\"product:edit\",\"product:status\",\"category:view\",\"order:view\",\"order:detail\",\"order:ship\",\"order:close\",\"coupon:view\",\"coupon:create\",\"coupon:edit\",\"review:view\",\"statistics:view\",\"message:view\"]', '[\"dashboard:view\",\"product:view\",\"product:create\",\"product:edit\",\"product:delete\",\"product:status\",\"category:view\",\"order:view\",\"order:detail\",\"order:ship\",\"order:refund\",\"order:close\",\"order:logistics\",\"coupon:view\",\"coupon:create\",\"coupon:edit\",\"coupon:delete\",\"review:view\",\"review:delete\",\"statistics:view\"]', '127.0.0.1', NULL, '2026-05-14 13:40:34');
INSERT INTO `audit_logs` VALUES (10, 1, 'admin', 'update_permissions', 'role', 6, '[\"dashboard:view\",\"product:view\",\"product:create\",\"product:edit\",\"product:delete\",\"product:status\",\"category:view\",\"order:view\",\"order:detail\",\"order:ship\",\"order:refund\",\"order:close\",\"order:logistics\",\"coupon:view\",\"coupon:create\",\"coupon:edit\",\"coupon:delete\",\"review:view\",\"review:delete\",\"statistics:view\"]', '[\"dashboard:view\",\"product:view\",\"product:create\",\"product:edit\",\"product:delete\",\"product:status\",\"category:view\",\"order:view\",\"order:detail\",\"order:ship\",\"order:refund\",\"order:close\",\"order:logistics\",\"coupon:view\",\"coupon:create\",\"coupon:edit\",\"coupon:delete\",\"review:view\",\"review:delete\",\"shop:view\",\"shop:edit\",\"statistics:view\"]', '127.0.0.1', NULL, '2026-05-14 13:44:57');
INSERT INTO `audit_logs` VALUES (11, 1, 'admin', 'update_permissions', 'role', 6, '[\"dashboard:view\",\"product:view\",\"product:create\",\"product:edit\",\"product:delete\",\"product:status\",\"category:view\",\"order:view\",\"order:detail\",\"order:ship\",\"order:refund\",\"order:close\",\"order:logistics\",\"coupon:view\",\"coupon:create\",\"coupon:edit\",\"coupon:delete\",\"review:view\",\"review:delete\",\"shop:view\",\"shop:edit\",\"statistics:view\"]', '[\"dashboard:view\",\"product:view\",\"product:create\",\"product:edit\",\"product:delete\",\"product:status\",\"category:view\",\"order:view\",\"order:detail\",\"order:edit\",\"order:ship\",\"order:refund\",\"order:close\",\"order:logistics\",\"coupon:view\",\"coupon:create\",\"coupon:edit\",\"coupon:delete\",\"review:view\",\"review:delete\",\"shop:view\",\"shop:edit\",\"statistics:view\"]', '127.0.0.1', NULL, '2026-05-16 19:18:10');
INSERT INTO `audit_logs` VALUES (12, 1, 'admin', 'update_permissions', 'role', 2, '[\"dashboard:view\",\"product:view\",\"product:create\",\"product:edit\",\"product:status\",\"product:manage\",\"category:view\",\"category:create\",\"category:edit\",\"category:delete\",\"category:manage\",\"order:view\",\"order:detail\",\"order:edit\",\"order:ship\",\"order:refund\",\"order:close\",\"order:manage\",\"coupon:view\",\"coupon:create\",\"coupon:edit\",\"coupon:delete\",\"coupon:manage\",\"review:view\",\"review:audit\",\"review:manage\",\"statistics:view\"]', '[\"dashboard:view\",\"product:view\",\"product:create\",\"product:edit\",\"product:status\",\"category:view\",\"category:create\",\"category:edit\",\"category:delete\",\"hot_product:view\",\"hot_product:manage\",\"new_product:view\",\"new_product:manage\",\"order:view\",\"order:detail\",\"order:edit\",\"order:ship\",\"order:refund\",\"order:close\",\"coupon:view\",\"coupon:create\",\"coupon:edit\",\"coupon:delete\",\"review:view\",\"review:audit\",\"statistics:view\"]', '127.0.0.1', NULL, '2026-05-19 15:09:14');
INSERT INTO `audit_logs` VALUES (13, 1, 'admin', 'update_permissions', 'role', 2, '[\"dashboard:view\",\"product:view\",\"product:create\",\"product:edit\",\"product:status\",\"product:manage\",\"category:view\",\"category:create\",\"category:edit\",\"category:delete\",\"category:manage\",\"order:view\",\"order:detail\",\"order:edit\",\"order:ship\",\"order:refund\",\"order:close\",\"order:manage\",\"coupon:view\",\"coupon:create\",\"coupon:edit\",\"coupon:delete\",\"coupon:manage\",\"review:view\",\"review:audit\",\"review:manage\",\"statistics:view\"]', '[\"dashboard:view\",\"product:view\",\"product:create\",\"product:edit\",\"product:status\",\"category:view\",\"category:create\",\"category:edit\",\"category:delete\",\"hot_product:view\",\"hot_product:manage\",\"new_product:view\",\"new_product:manage\",\"order:view\",\"order:detail\",\"order:edit\",\"order:ship\",\"order:refund\",\"order:close\",\"coupon:view\",\"coupon:create\",\"coupon:edit\",\"coupon:delete\",\"review:view\",\"review:audit\",\"statistics:view\"]', '127.0.0.1', NULL, '2026-05-20 06:45:55');
INSERT INTO `audit_logs` VALUES (14, 1, 'admin', 'update_permissions', 'role', 2, '[\"dashboard:view\",\"product:view\",\"product:create\",\"product:edit\",\"product:status\",\"product:manage\",\"category:view\",\"category:create\",\"category:edit\",\"category:delete\",\"category:manage\",\"order:view\",\"order:detail\",\"order:edit\",\"order:ship\",\"order:refund\",\"order:close\",\"order:manage\",\"coupon:view\",\"coupon:create\",\"coupon:edit\",\"coupon:delete\",\"coupon:manage\",\"review:view\",\"review:audit\",\"review:manage\",\"statistics:view\"]', '[\"dashboard:view\",\"product:view\",\"product:create\",\"product:edit\",\"product:status\",\"category:view\",\"category:create\",\"category:edit\",\"category:delete\",\"hot_product:view\",\"hot_product:manage\",\"new_product:view\",\"new_product:manage\",\"order:view\",\"order:detail\",\"order:edit\",\"order:ship\",\"order:refund\",\"order:close\",\"coupon:view\",\"coupon:create\",\"coupon:edit\",\"coupon:delete\",\"review:view\",\"review:audit\",\"statistics:view\"]', '127.0.0.1', NULL, '2026-05-20 08:20:21');
INSERT INTO `audit_logs` VALUES (15, 1, 'admin', 'update_permissions', 'role', 2, '[\"dashboard:view\",\"product:view\",\"product:create\",\"product:edit\",\"product:status\",\"category:view\",\"category:create\",\"category:edit\",\"category:delete\",\"hot_product:view\",\"hot_product:manage\",\"new_product:view\",\"new_product:manage\",\"order:view\",\"order:detail\",\"order:edit\",\"order:ship\",\"order:refund\",\"order:close\",\"coupon:view\",\"coupon:create\",\"coupon:edit\",\"coupon:delete\",\"review:view\",\"review:audit\",\"statistics:view\"]', '[\"dashboard:view\",\"product:view\",\"product:create\",\"product:edit\",\"product:status\",\"category:view\",\"category:create\",\"category:edit\",\"category:delete\",\"hot_product:view\",\"hot_product:manage\",\"new_product:view\",\"new_product:manage\",\"order:view\",\"order:detail\",\"order:edit\",\"order:ship\",\"order:refund\",\"order:close\",\"coupon:view\",\"coupon:create\",\"coupon:edit\",\"coupon:delete\",\"coupon:issue\",\"review:view\",\"review:audit\",\"discussion:view\",\"discussion:audit\",\"discussion:delete\",\"zone:view\",\"zone:manage\",\"statistics:view\"]', '127.0.0.1', NULL, '2026-05-20 08:29:53');

-- ----------------------------
-- Table structure for browse_history
-- ----------------------------
DROP TABLE IF EXISTS `browse_history`;
CREATE TABLE `browse_history`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '用户ID',
  `product_id` int NOT NULL COMMENT '商品ID',
  `product_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '商品名称',
  `price` decimal(10, 2) NOT NULL COMMENT '商品价格',
  `image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '商品图片',
  `viewed_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '浏览时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_product_id`(`product_id` ASC) USING BTREE,
  INDEX `idx_viewed_at`(`viewed_at` ASC) USING BTREE,
  CONSTRAINT `browse_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of browse_history
-- ----------------------------

-- ----------------------------
-- Table structure for cart_items
-- ----------------------------
DROP TABLE IF EXISTS `cart_items`;
CREATE TABLE `cart_items`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '购物车项ID',
  `user_id` int NOT NULL COMMENT '用户ID',
  `product_id` int NOT NULL COMMENT '商品ID',
  `quantity` int NOT NULL DEFAULT 1 COMMENT '数量',
  `size` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '尺码',
  `color` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '颜色',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_user_product_spec`(`user_id` ASC, `product_id` ASC, `size` ASC, `color` ASC) USING BTREE COMMENT '用户+商品+规格唯一索引',
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_product_id`(`product_id` ASC) USING BTREE,
  CONSTRAINT `fk_cart_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '购物车表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cart_items
-- ----------------------------

-- ----------------------------
-- Table structure for categories
-- ----------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int NULL DEFAULT 0,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `parent_id` int NULL DEFAULT NULL,
  `level` tinyint NULL DEFAULT 1,
  `path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_parent_id`(`parent_id` ASC) USING BTREE,
  INDEX `idx_level`(`level` ASC) USING BTREE,
  INDEX `idx_parent_sort`(`parent_id` ASC, `sort_order` ASC) USING BTREE,
  CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 330 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of categories
-- ----------------------------
INSERT INTO `categories` VALUES (62, '大码女装', 1, '2026-03-02 10:28:13', NULL, 1, '');
INSERT INTO `categories` VALUES (63, '大码男装', 2, '2026-03-02 10:33:02', NULL, 1, '');
INSERT INTO `categories` VALUES (64, '内衣家居', 3, '2026-03-02 10:33:19', NULL, 1, '');
INSERT INTO `categories` VALUES (65, '运动户外', 4, '2026-03-02 10:33:30', NULL, 1, '');
INSERT INTO `categories` VALUES (67, '连衣裙', 1, '2026-03-02 10:39:20', 62, 1, '');
INSERT INTO `categories` VALUES (68, '复古连衣裙', 1, '2026-03-02 10:39:49', 67, 1, '');
INSERT INTO `categories` VALUES (69, '上衣', 2, '2026-03-02 10:53:21', 62, 1, '');
INSERT INTO `categories` VALUES (70, '裤装', 3, '2026-03-02 10:53:52', 62, 1, '');
INSERT INTO `categories` VALUES (71, '裙装', 4, '2026-03-02 10:55:05', 62, 1, '');
INSERT INTO `categories` VALUES (72, '外套', 5, '2026-03-02 10:55:23', 62, 1, '');
INSERT INTO `categories` VALUES (73, '套装', 6, '2026-03-02 10:55:33', 62, 1, '');
INSERT INTO `categories` VALUES (75, '衬衫', 7, '2026-03-02 10:55:55', 62, 1, '');
INSERT INTO `categories` VALUES (76, 'T恤', 1, '2026-03-02 10:56:15', 63, 1, '');
INSERT INTO `categories` VALUES (77, '衬衫', 2, '2026-03-02 10:56:24', 63, 1, '');
INSERT INTO `categories` VALUES (78, '裤装', 3, '2026-03-02 10:56:32', 64, 1, '');
INSERT INTO `categories` VALUES (79, '裤装', 3, '2026-03-02 10:56:49', 63, 1, '');
INSERT INTO `categories` VALUES (80, '外套', 4, '2026-03-02 10:56:57', 63, 1, '');
INSERT INTO `categories` VALUES (81, '夹克', 5, '2026-03-02 10:57:10', 63, 1, '');
INSERT INTO `categories` VALUES (82, '运动服', 6, '2026-03-02 10:58:11', 63, 1, '');
INSERT INTO `categories` VALUES (83, '休闲装', 7, '2026-03-02 10:58:25', 63, 1, '');
INSERT INTO `categories` VALUES (84, '正装', 8, '2026-03-02 10:59:07', 63, 1, '');
INSERT INTO `categories` VALUES (85, '文胸', 1, '2026-03-02 11:00:06', 64, 1, '');
INSERT INTO `categories` VALUES (86, '内裤', 2, '2026-03-02 11:00:22', 64, 1, '');
INSERT INTO `categories` VALUES (87, '睡衣', 3, '2026-03-02 11:00:31', 64, 1, '');
INSERT INTO `categories` VALUES (88, '家居服', 4, '2026-03-02 11:00:40', 64, 1, '');
INSERT INTO `categories` VALUES (89, '保暖内衣', 5, '2026-03-02 11:00:51', 64, 1, '');
INSERT INTO `categories` VALUES (90, '袜子', 6, '2026-03-02 11:01:22', 64, 1, '');
INSERT INTO `categories` VALUES (91, '泳衣', 7, '2026-03-02 11:01:35', 64, 1, '');
INSERT INTO `categories` VALUES (92, '运动T恤', 1, '2026-03-02 11:02:13', 65, 1, '');
INSERT INTO `categories` VALUES (93, '运动裤', 2, '2026-03-02 11:02:42', 65, 1, '');
INSERT INTO `categories` VALUES (94, '运动外套', 3, '2026-03-02 11:02:53', 65, 1, '');
INSERT INTO `categories` VALUES (96, '极简连衣裙', 3, '2026-03-02 11:15:07', 67, 1, '');
INSERT INTO `categories` VALUES (97, '圆领T恤', 1, '2026-03-02 11:15:07', 76, 1, '');
INSERT INTO `categories` VALUES (98, '哺乳文胸', 2, '2026-03-02 11:15:07', 85, 1, '');
INSERT INTO `categories` VALUES (99, '运动裤', 2, '2026-03-02 11:15:07', 92, 1, '');
INSERT INTO `categories` VALUES (114, '碎花连衣裙', 5, '2026-03-02 18:38:01', 67, 1, '');
INSERT INTO `categories` VALUES (115, '纯色连衣裙', 7, '2026-03-02 18:40:20', 67, 1, '');
INSERT INTO `categories` VALUES (116, '雪纺连衣裙', 8, '2026-03-02 18:40:35', 67, 1, '');
INSERT INTO `categories` VALUES (117, '针织连衣裙', 10, '2026-03-02 18:40:54', 67, 1, '');
INSERT INTO `categories` VALUES (118, 'T恤', 1, '2026-03-02 18:41:18', 69, 1, '');
INSERT INTO `categories` VALUES (119, '卫衣', 2, '2026-03-02 18:42:29', 69, 1, '');
INSERT INTO `categories` VALUES (120, '毛衣', 3, '2026-03-02 18:42:40', 69, 1, '');
INSERT INTO `categories` VALUES (121, '背心', 4, '2026-03-02 18:42:57', 69, 1, '');
INSERT INTO `categories` VALUES (122, '牛仔裤', 1, '2026-03-02 18:43:14', 70, 1, '');
INSERT INTO `categories` VALUES (123, '休闲裤', 2, '2026-03-02 18:43:24', 70, 1, '');
INSERT INTO `categories` VALUES (124, '西裤', 3, '2026-03-02 18:43:31', 70, 1, '');
INSERT INTO `categories` VALUES (125, '半身裙', 1, '2026-03-02 18:48:23', 71, 1, '');
INSERT INTO `categories` VALUES (126, 'A字裙', 2, '2026-03-02 18:48:36', 71, 1, '');
INSERT INTO `categories` VALUES (127, '百褶裙', 3, '2026-03-02 18:49:03', 71, 1, '');
INSERT INTO `categories` VALUES (128, '羽绒服', 1, '2026-03-02 18:49:28', 72, 1, '');
INSERT INTO `categories` VALUES (129, '棉服', 2, '2026-03-02 18:49:37', 72, 1, '');
INSERT INTO `categories` VALUES (130, '毛呢外套', 3, '2026-03-02 18:49:46', 72, 1, '');
INSERT INTO `categories` VALUES (131, '皮草外套', 4, '2026-03-02 18:50:26', 72, 1, '');
INSERT INTO `categories` VALUES (132, '牛仔外套', 5, '2026-03-02 18:50:36', 72, 1, '');
INSERT INTO `categories` VALUES (133, '职业套装', 1, '2026-03-02 18:50:49', 73, 1, '');
INSERT INTO `categories` VALUES (134, '休闲套装', 2, '2026-03-02 18:50:59', 73, 1, '');
INSERT INTO `categories` VALUES (135, '运动套装', 3, '2026-03-02 18:51:14', 73, 1, '');
INSERT INTO `categories` VALUES (136, '睡衣套装', 4, '2026-03-02 18:51:35', 73, 1, '');
INSERT INTO `categories` VALUES (137, '长袖衬衫', 1, '2026-03-02 18:52:42', 75, 1, '');
INSERT INTO `categories` VALUES (138, '短袖衬衫', 2, '2026-03-02 18:52:52', 75, 1, '');
INSERT INTO `categories` VALUES (139, '雪纺衬衫', 3, '2026-03-02 18:53:04', 75, 1, '');
INSERT INTO `categories` VALUES (140, '纯棉衬衫', 4, '2026-03-02 18:53:19', 75, 1, '');
INSERT INTO `categories` VALUES (141, '格子衬衫', 6, '2026-03-02 18:53:36', 75, 1, '');
INSERT INTO `categories` VALUES (142, '条纹衬衫', 5, '2026-03-02 18:54:14', 75, 1, '');
INSERT INTO `categories` VALUES (143, 'v领T恤', 2, '2026-03-02 19:39:54', 76, 1, '');
INSERT INTO `categories` VALUES (165, '鞋类', 5, '2026-03-08 20:05:00', NULL, 1, '');
INSERT INTO `categories` VALUES (166, '棉鞋', 1, '2026-03-08 20:05:29', 165, 1, '');
INSERT INTO `categories` VALUES (169, '长袖连衣裙', 2, '2026-03-21 17:50:06', 67, 1, '');
INSERT INTO `categories` VALUES (170, '短袖连衣裙', 4, '2026-03-21 17:50:06', 67, 1, '');
INSERT INTO `categories` VALUES (171, '印花连衣裙', 6, '2026-03-21 17:50:06', 67, 1, '');
INSERT INTO `categories` VALUES (172, '蕾丝连衣裙', 9, '2026-03-21 17:50:06', 67, 1, '');
INSERT INTO `categories` VALUES (173, '针织衫', 5, '2026-03-21 17:50:06', 69, 1, '');
INSERT INTO `categories` VALUES (174, '运动裤', 4, '2026-03-21 17:50:06', 70, 1, '');
INSERT INTO `categories` VALUES (175, '打底裤', 5, '2026-03-21 17:50:06', 70, 1, '');
INSERT INTO `categories` VALUES (176, '包臀裙', 4, '2026-03-21 17:50:06', 71, 1, '');
INSERT INTO `categories` VALUES (177, '一步裙', 5, '2026-03-21 17:50:06', 71, 1, '');
INSERT INTO `categories` VALUES (178, '两件套', 5, '2026-03-21 17:50:06', 73, 1, '');
INSERT INTO `categories` VALUES (179, '印花T恤', 3, '2026-03-21 17:50:06', 76, 1, '');
INSERT INTO `categories` VALUES (180, '纯色T恤', 4, '2026-03-21 17:50:06', 76, 1, '');
INSERT INTO `categories` VALUES (181, '长袖T恤', 5, '2026-03-21 17:50:06', 76, 1, '');
INSERT INTO `categories` VALUES (182, '长袖衬衫', 1, '2026-03-21 17:50:06', 77, 1, '');
INSERT INTO `categories` VALUES (183, '短袖衬衫', 2, '2026-03-21 17:50:06', 77, 1, '');
INSERT INTO `categories` VALUES (184, '商务衬衫', 3, '2026-03-21 17:50:06', 77, 1, '');
INSERT INTO `categories` VALUES (185, '休闲衬衫', 4, '2026-03-21 17:50:06', 77, 1, '');
INSERT INTO `categories` VALUES (186, '印花衬衫', 5, '2026-03-21 17:50:06', 77, 1, '');
INSERT INTO `categories` VALUES (187, '牛仔裤', 1, '2026-03-21 17:50:06', 79, 1, '');
INSERT INTO `categories` VALUES (188, '休闲裤', 2, '2026-03-21 17:50:06', 79, 1, '');
INSERT INTO `categories` VALUES (189, '西裤', 3, '2026-03-21 17:50:06', 79, 1, '');
INSERT INTO `categories` VALUES (190, '运动裤', 4, '2026-03-21 17:50:06', 79, 1, '');
INSERT INTO `categories` VALUES (191, '工装裤', 5, '2026-03-21 17:50:06', 79, 1, '');
INSERT INTO `categories` VALUES (192, '羽绒服', 1, '2026-03-21 17:50:06', 80, 1, '');
INSERT INTO `categories` VALUES (193, '棉服', 2, '2026-03-21 17:50:07', 80, 1, '');
INSERT INTO `categories` VALUES (194, '毛呢外套', 3, '2026-03-21 17:50:07', 80, 1, '');
INSERT INTO `categories` VALUES (195, '休闲外套', 4, '2026-03-21 17:50:07', 80, 1, '');
INSERT INTO `categories` VALUES (196, '商务外套', 5, '2026-03-21 17:50:07', 80, 1, '');
INSERT INTO `categories` VALUES (197, '牛仔夹克', 1, '2026-03-21 17:50:07', 81, 1, '');
INSERT INTO `categories` VALUES (198, '皮夹克', 2, '2026-03-21 17:50:07', 81, 1, '');
INSERT INTO `categories` VALUES (199, '休闲夹克', 3, '2026-03-21 17:50:07', 81, 1, '');
INSERT INTO `categories` VALUES (200, '运动夹克', 4, '2026-03-21 17:50:07', 81, 1, '');
INSERT INTO `categories` VALUES (201, '防风夹克', 5, '2026-03-21 17:50:07', 81, 1, '');
INSERT INTO `categories` VALUES (202, '运动T恤', 1, '2026-03-21 17:50:07', 82, 1, '');
INSERT INTO `categories` VALUES (203, '运动裤', 2, '2026-03-21 17:50:07', 82, 1, '');
INSERT INTO `categories` VALUES (204, '运动外套', 3, '2026-03-21 17:50:07', 82, 1, '');
INSERT INTO `categories` VALUES (205, '运动套装', 4, '2026-03-21 17:50:07', 82, 1, '');
INSERT INTO `categories` VALUES (206, '跑步服', 5, '2026-03-21 17:50:07', 82, 1, '');
INSERT INTO `categories` VALUES (207, '休闲T恤', 1, '2026-03-21 17:50:07', 83, 1, '');
INSERT INTO `categories` VALUES (208, '休闲裤', 2, '2026-03-21 17:50:07', 83, 1, '');
INSERT INTO `categories` VALUES (209, '休闲外套', 3, '2026-03-21 17:50:07', 83, 1, '');
INSERT INTO `categories` VALUES (210, '休闲套装', 4, '2026-03-21 17:50:07', 83, 1, '');
INSERT INTO `categories` VALUES (211, '卫衣', 5, '2026-03-21 17:50:07', 83, 1, '');
INSERT INTO `categories` VALUES (212, '西装', 1, '2026-03-21 17:50:07', 84, 1, '');
INSERT INTO `categories` VALUES (213, '西裤', 2, '2026-03-21 17:50:07', 84, 1, '');
INSERT INTO `categories` VALUES (214, '衬衫', 3, '2026-03-21 17:50:07', 84, 1, '');
INSERT INTO `categories` VALUES (216, '正装套装', 5, '2026-03-21 17:50:07', 84, 1, '');
INSERT INTO `categories` VALUES (217, '全罩杯文胸', 1, '2026-03-21 17:50:07', 85, 1, '');
INSERT INTO `categories` VALUES (218, '半罩杯文胸', 3, '2026-03-21 17:50:07', 85, 1, '');
INSERT INTO `categories` VALUES (219, '无钢圈文胸', 4, '2026-03-21 17:50:07', 85, 1, '');
INSERT INTO `categories` VALUES (220, '运动文胸', 5, '2026-03-21 17:50:07', 85, 1, '');
INSERT INTO `categories` VALUES (221, '调整型文胸', 6, '2026-03-21 17:50:07', 85, 1, '');
INSERT INTO `categories` VALUES (222, '三角裤', 1, '2026-03-21 17:50:07', 86, 1, '');
INSERT INTO `categories` VALUES (223, '平角裤', 2, '2026-03-21 17:50:07', 86, 1, '');
INSERT INTO `categories` VALUES (224, '丁字裤', 3, '2026-03-21 17:50:07', 86, 1, '');
INSERT INTO `categories` VALUES (225, '生理裤', 4, '2026-03-21 17:50:07', 86, 1, '');
INSERT INTO `categories` VALUES (226, '情趣内裤', 5, '2026-03-21 17:50:07', 86, 1, '');
INSERT INTO `categories` VALUES (227, '家居裤', 1, '2026-03-21 17:50:07', 78, 1, '');
INSERT INTO `categories` VALUES (228, '睡裤', 2, '2026-03-21 17:50:07', 78, 1, '');
INSERT INTO `categories` VALUES (229, '保暖裤', 3, '2026-03-21 17:50:07', 78, 1, '');
INSERT INTO `categories` VALUES (230, '打底裤', 4, '2026-03-21 17:50:07', 78, 1, '');
INSERT INTO `categories` VALUES (231, '休闲裤', 5, '2026-03-21 17:50:07', 78, 1, '');
INSERT INTO `categories` VALUES (232, '长袖睡衣', 1, '2026-03-21 17:50:07', 87, 1, '');
INSERT INTO `categories` VALUES (233, '短袖睡衣', 2, '2026-03-21 17:50:07', 87, 1, '');
INSERT INTO `categories` VALUES (234, '睡裙', 3, '2026-03-21 17:50:07', 87, 1, '');
INSERT INTO `categories` VALUES (235, '睡衣套装', 4, '2026-03-21 17:50:07', 87, 1, '');
INSERT INTO `categories` VALUES (236, '丝绸睡衣', 5, '2026-03-21 17:50:07', 87, 1, '');
INSERT INTO `categories` VALUES (237, '春秋家居服', 1, '2026-03-21 17:50:07', 88, 1, '');
INSERT INTO `categories` VALUES (238, '夏季家居服', 2, '2026-03-21 17:50:07', 88, 1, '');
INSERT INTO `categories` VALUES (239, '家居套装', 3, '2026-03-21 17:50:07', 88, 1, '');
INSERT INTO `categories` VALUES (240, '家居裙', 4, '2026-03-21 17:50:07', 88, 1, '');
INSERT INTO `categories` VALUES (241, '冬季家居服', 5, '2026-03-21 17:50:07', 88, 1, '');
INSERT INTO `categories` VALUES (242, '保暖套装', 1, '2026-03-21 17:50:07', 89, 1, '');
INSERT INTO `categories` VALUES (243, '保暖上衣', 2, '2026-03-21 17:50:07', 89, 1, '');
INSERT INTO `categories` VALUES (244, '保暖裤', 3, '2026-03-21 17:50:07', 89, 1, '');
INSERT INTO `categories` VALUES (245, '加绒内衣', 4, '2026-03-21 17:50:07', 89, 1, '');
INSERT INTO `categories` VALUES (246, '羊毛内衣', 5, '2026-03-21 17:50:07', 89, 1, '');
INSERT INTO `categories` VALUES (247, '棉袜', 1, '2026-03-21 17:50:07', 90, 1, '');
INSERT INTO `categories` VALUES (248, '丝袜', 2, '2026-03-21 17:50:07', 90, 1, '');
INSERT INTO `categories` VALUES (249, '长筒袜', 3, '2026-03-21 17:50:07', 90, 1, '');
INSERT INTO `categories` VALUES (250, '短袜', 4, '2026-03-21 17:50:07', 90, 1, '');
INSERT INTO `categories` VALUES (251, '运动袜', 5, '2026-03-21 17:50:07', 90, 1, '');
INSERT INTO `categories` VALUES (252, '连体泳衣', 1, '2026-03-21 17:50:07', 91, 1, '');
INSERT INTO `categories` VALUES (253, '分体泳衣', 2, '2026-03-21 17:50:07', 91, 1, '');
INSERT INTO `categories` VALUES (254, '比基尼', 3, '2026-03-21 17:50:07', 91, 1, '');
INSERT INTO `categories` VALUES (255, '泳衣套装', 4, '2026-03-21 17:50:07', 91, 1, '');
INSERT INTO `categories` VALUES (256, '沙滩装', 5, '2026-03-21 17:50:07', 91, 1, '');
INSERT INTO `categories` VALUES (257, '短袖运动T恤', 1, '2026-03-21 17:50:07', 92, 1, '');
INSERT INTO `categories` VALUES (258, '长袖运动T恤', 3, '2026-03-21 17:50:07', 92, 1, '');
INSERT INTO `categories` VALUES (259, '速干T恤', 4, '2026-03-21 17:50:07', 92, 1, '');
INSERT INTO `categories` VALUES (260, '压缩T恤', 5, '2026-03-21 17:50:07', 92, 1, '');
INSERT INTO `categories` VALUES (261, '印花运动T恤', 6, '2026-03-21 17:50:07', 92, 1, '');
INSERT INTO `categories` VALUES (262, '运动长裤', 1, '2026-03-21 17:50:07', 93, 1, '');
INSERT INTO `categories` VALUES (263, '运动短裤', 2, '2026-03-21 17:50:07', 93, 1, '');
INSERT INTO `categories` VALUES (264, '速干裤', 3, '2026-03-21 17:50:07', 93, 1, '');
INSERT INTO `categories` VALUES (265, '压缩裤', 4, '2026-03-21 17:50:07', 93, 1, '');
INSERT INTO `categories` VALUES (266, '健身裤', 5, '2026-03-21 17:50:07', 93, 1, '');
INSERT INTO `categories` VALUES (267, '骑行外套', 1, '2026-03-21 17:50:07', 94, 1, '');
INSERT INTO `categories` VALUES (268, '徒步外套', 2, '2026-03-21 17:50:07', 94, 1, '');
INSERT INTO `categories` VALUES (269, '健身外套', 3, '2026-03-21 17:50:07', 94, 1, '');
INSERT INTO `categories` VALUES (271, '户外外套', 4, '2026-03-21 17:50:07', 94, 1, '');
INSERT INTO `categories` VALUES (272, '跑步鞋', 1, '2026-03-21 17:50:07', 285, 1, '');
INSERT INTO `categories` VALUES (273, '篮球鞋', 2, '2026-03-21 17:50:07', 285, 1, '');
INSERT INTO `categories` VALUES (274, '足球鞋', 3, '2026-03-21 17:50:07', 285, 1, '');
INSERT INTO `categories` VALUES (275, '网球鞋', 4, '2026-03-21 17:50:07', 285, 1, '');
INSERT INTO `categories` VALUES (276, '羽毛球鞋', 5, '2026-03-21 17:50:07', 285, 1, '');
INSERT INTO `categories` VALUES (277, '棉靴', 1, '2026-03-21 17:50:07', 166, 1, '');
INSERT INTO `categories` VALUES (278, '棉拖鞋', 2, '2026-03-21 17:50:07', 166, 1, '');
INSERT INTO `categories` VALUES (279, '保暖棉鞋', 3, '2026-03-21 17:50:07', 166, 1, '');
INSERT INTO `categories` VALUES (280, '防滑棉鞋', 4, '2026-03-21 17:50:07', 166, 1, '');
INSERT INTO `categories` VALUES (281, '时尚棉鞋', 5, '2026-03-21 17:50:07', 166, 1, '');
INSERT INTO `categories` VALUES (285, '运动鞋', 2, '2026-03-21 18:16:04', 165, 1, '');
INSERT INTO `categories` VALUES (286, '跑步鞋', 1, '2026-03-21 18:16:04', 285, 1, '');
INSERT INTO `categories` VALUES (287, '篮球鞋', 2, '2026-03-21 18:16:04', 285, 1, '');
INSERT INTO `categories` VALUES (288, '足球鞋', 3, '2026-03-21 18:16:04', 285, 1, '');
INSERT INTO `categories` VALUES (289, '网球鞋', 4, '2026-03-21 18:16:04', 285, 1, '');
INSERT INTO `categories` VALUES (290, '羽毛球鞋', 5, '2026-03-21 18:16:04', 285, 1, '');
INSERT INTO `categories` VALUES (291, '乒乓球鞋', 6, '2026-03-21 18:16:04', 285, 1, '');
INSERT INTO `categories` VALUES (292, '休闲鞋', 3, '2026-03-21 18:16:04', 165, 1, '');
INSERT INTO `categories` VALUES (293, '板鞋', 1, '2026-03-21 18:16:04', 292, 1, '');
INSERT INTO `categories` VALUES (294, '帆布鞋', 2, '2026-03-21 18:16:04', 292, 1, '');
INSERT INTO `categories` VALUES (295, '懒人鞋', 3, '2026-03-21 18:16:04', 292, 1, '');
INSERT INTO `categories` VALUES (296, '豆豆鞋', 4, '2026-03-21 18:16:04', 292, 1, '');
INSERT INTO `categories` VALUES (297, '乐福鞋', 5, '2026-03-21 18:16:04', 292, 1, '');
INSERT INTO `categories` VALUES (298, '正装鞋', 4, '2026-03-21 18:16:04', 165, 1, '');
INSERT INTO `categories` VALUES (299, '牛津鞋', 1, '2026-03-21 18:16:04', 298, 1, '');
INSERT INTO `categories` VALUES (300, '德比鞋', 2, '2026-03-21 18:16:04', 298, 1, '');
INSERT INTO `categories` VALUES (301, '孟克鞋', 3, '2026-03-21 18:16:04', 298, 1, '');
INSERT INTO `categories` VALUES (303, '正装皮鞋', 4, '2026-03-21 18:16:04', 298, 1, '');
INSERT INTO `categories` VALUES (304, '靴子', 5, '2026-03-21 18:16:04', 165, 1, '');
INSERT INTO `categories` VALUES (305, '短靴', 1, '2026-03-21 18:16:04', 304, 1, '');
INSERT INTO `categories` VALUES (306, '长靴', 2, '2026-03-21 18:16:04', 304, 1, '');
INSERT INTO `categories` VALUES (307, '马丁靴', 3, '2026-03-21 18:16:04', 304, 1, '');
INSERT INTO `categories` VALUES (308, '切尔西靴', 4, '2026-03-21 18:16:04', 304, 1, '');
INSERT INTO `categories` VALUES (309, '雪地靴', 5, '2026-03-21 18:16:04', 304, 1, '');
INSERT INTO `categories` VALUES (310, '凉鞋', 6, '2026-03-21 18:16:04', 165, 1, '');
INSERT INTO `categories` VALUES (311, '沙滩凉鞋', 1, '2026-03-21 18:16:04', 310, 1, '');
INSERT INTO `categories` VALUES (312, '罗马凉鞋', 2, '2026-03-21 18:16:04', 310, 1, '');
INSERT INTO `categories` VALUES (313, '拖鞋', 3, '2026-03-21 18:16:04', 310, 1, '');
INSERT INTO `categories` VALUES (314, '洞洞鞋', 4, '2026-03-21 18:16:04', 310, 1, '');
INSERT INTO `categories` VALUES (315, '凉拖', 5, '2026-03-21 18:16:04', 310, 1, '');
INSERT INTO `categories` VALUES (316, '训练鞋', 7, '2026-03-23 22:22:00', 285, 3, '');
INSERT INTO `categories` VALUES (317, '滑板鞋', 8, '2026-03-23 22:22:00', 285, 3, '');
INSERT INTO `categories` VALUES (318, '一脚蹬', 6, '2026-03-23 22:22:01', 292, 3, '');
INSERT INTO `categories` VALUES (319, '布洛克鞋', 4, '2026-03-23 22:22:01', 298, 3, '');
INSERT INTO `categories` VALUES (320, '工装靴', 6, '2026-03-23 22:22:01', 304, 3, '');
INSERT INTO `categories` VALUES (321, '人字拖', 5, '2026-03-23 22:22:01', 310, 3, '');
INSERT INTO `categories` VALUES (322, '拖鞋', 7, '2026-03-23 22:22:01', 165, 2, '');
INSERT INTO `categories` VALUES (323, '居家拖鞋', 1, '2026-03-23 22:22:01', 322, 3, '');
INSERT INTO `categories` VALUES (324, '浴室拖鞋', 2, '2026-03-23 22:22:01', 322, 3, '');
INSERT INTO `categories` VALUES (325, '凉拖鞋', 3, '2026-03-23 22:22:01', 322, 3, '');
INSERT INTO `categories` VALUES (326, '棉拖鞋', 4, '2026-03-23 22:22:01', 322, 3, '');

-- ----------------------------
-- Table structure for comments
-- ----------------------------
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `discussion_id` int NOT NULL,
  `user_id` int NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `discussion_id`(`discussion_id` ASC) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`discussion_id`) REFERENCES `discussions` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of comments
-- ----------------------------
INSERT INTO `comments` VALUES (8, 7, 47, '说的太对了', '', '2026-03-27 18:14:53', '2026-03-27 18:14:53');
INSERT INTO `comments` VALUES (9, 8, 48, '我也是这么认为的', '', '2026-03-27 19:49:19', '2026-03-27 19:49:19');
INSERT INTO `comments` VALUES (10, 9, 68, '这件衣服我也买了，真的超级好看', 'http://localhost:3000/uploads/review-1776437777641-657381.webp', '2026-04-17 22:56:34', '2026-04-17 22:56:34');

-- ----------------------------
-- Table structure for conversations
-- ----------------------------
DROP TABLE IF EXISTS `conversations`;
CREATE TABLE `conversations`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `buyer_id` int NOT NULL,
  `cs_id` int NOT NULL,
  `status` enum('active','closed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'active',
  `deleted_at` datetime NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `buyer_id`(`buyer_id` ASC) USING BTREE,
  INDEX `cs_id`(`cs_id` ASC) USING BTREE,
  CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `conversations_ibfk_2` FOREIGN KEY (`cs_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 12 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of conversations
-- ----------------------------
INSERT INTO `conversations` VALUES (4, 22, 37, 'active', NULL, '2026-03-15 07:33:15', '2026-05-12 13:48:33');
INSERT INTO `conversations` VALUES (5, 44, 37, 'closed', NULL, '2026-03-17 18:06:13', '2026-03-23 21:50:46');
INSERT INTO `conversations` VALUES (6, 47, 37, 'active', NULL, '2026-03-27 16:50:12', '2026-03-27 18:26:08');
INSERT INTO `conversations` VALUES (7, 48, 37, 'active', NULL, '2026-03-27 19:46:17', '2026-04-14 19:34:07');
INSERT INTO `conversations` VALUES (8, 67, 37, 'active', NULL, '2026-04-15 08:46:14', '2026-04-15 08:46:16');
INSERT INTO `conversations` VALUES (9, 70, 37, 'active', NULL, '2026-04-15 13:31:21', '2026-04-15 13:31:21');
INSERT INTO `conversations` VALUES (10, 74, 37, 'active', NULL, '2026-04-15 15:15:58', '2026-04-15 15:16:05');
INSERT INTO `conversations` VALUES (11, 68, 37, 'active', NULL, '2026-04-18 07:46:50', '2026-04-18 10:04:01');

-- ----------------------------
-- Table structure for coupon_categories
-- ----------------------------
DROP TABLE IF EXISTS `coupon_categories`;
CREATE TABLE `coupon_categories`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `coupon_id` int NOT NULL COMMENT '优惠券ID',
  `category_id` int NOT NULL COMMENT '分类ID',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_coupon_category`(`coupon_id` ASC, `category_id` ASC) USING BTREE,
  INDEX `category_id`(`category_id` ASC) USING BTREE,
  CONSTRAINT `coupon_categories_ibfk_1` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `coupon_categories_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of coupon_categories
-- ----------------------------

-- ----------------------------
-- Table structure for coupon_products
-- ----------------------------
DROP TABLE IF EXISTS `coupon_products`;
CREATE TABLE `coupon_products`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `coupon_id` int NOT NULL COMMENT '优惠券ID',
  `product_id` int NOT NULL COMMENT '商品ID',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_coupon_product`(`coupon_id` ASC, `product_id` ASC) USING BTREE,
  INDEX `product_id`(`product_id` ASC) USING BTREE,
  CONSTRAINT `coupon_products_ibfk_1` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `coupon_products_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of coupon_products
-- ----------------------------

-- ----------------------------
-- Table structure for coupons
-- ----------------------------
DROP TABLE IF EXISTS `coupons`;
CREATE TABLE `coupons`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '优惠券名称',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '优惠券描述',
  `type` enum('fixed_amount','percentage','threshold','free_shipping') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '优惠券类型',
  `value` decimal(10, 2) NULL DEFAULT NULL COMMENT '优惠券面额/折扣率',
  `min_amount` decimal(10, 2) NULL DEFAULT NULL COMMENT '使用门槛金额',
  `scope` enum('all','specific_product','specific_category','shop_all') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '使用范围',
  `total_quantity` int NOT NULL COMMENT '总发行量',
  `used_quantity` int NULL DEFAULT 0 COMMENT '已使用数量',
  `status` tinyint NULL DEFAULT 1 COMMENT '状态 1-启用 0-禁用',
  `valid_from` datetime NULL DEFAULT NULL COMMENT '有效期开始时间',
  `valid_to` datetime NULL DEFAULT NULL COMMENT '有效期结束时间',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `shop_id` int NULL DEFAULT NULL COMMENT '店铺ID，null表示平台优惠券',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_shop_id`(`shop_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 31 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of coupons
-- ----------------------------
INSERT INTO `coupons` VALUES (15, '618 狂欢券', '618 年中大促全场通用券', 'fixed_amount', 50.00, 299.00, 'all', 10000, 0, 1, '2026-06-01 00:00:00', '2026-06-20 23:59:59', '2026-04-06 10:29:52', '2026-04-06 10:29:52', NULL);
INSERT INTO `coupons` VALUES (16, '双十一购物节', '双十一全场满减券', 'fixed_amount', 100.00, 500.00, 'all', 20000, 0, 1, '2026-11-01 00:00:00', '2026-11-11 23:59:59', '2026-04-06 10:29:52', '2026-04-06 10:29:52', NULL);
INSERT INTO `coupons` VALUES (18, '618 狂欢券', '618 年中大促全场通用券', 'fixed_amount', 50.00, 299.00, 'all', 10000, 0, 1, '2026-06-01 00:00:00', '2026-06-20 23:59:59', '2026-04-06 10:30:34', '2026-04-06 10:30:34', NULL);
INSERT INTO `coupons` VALUES (19, '双十一购物节', '双十一全场满减券', 'fixed_amount', 100.00, 500.00, 'all', 20000, 0, 1, '2026-11-01 00:00:00', '2026-11-11 23:59:59', '2026-04-06 10:30:34', '2026-04-06 10:30:34', NULL);
INSERT INTO `coupons` VALUES (23, '测试优惠券', '测试用优惠券，有效期到明天', 'fixed_amount', 10.00, 50.00, 'shop_all', 100, 0, 1, '2026-04-11 00:00:00', '2026-04-12 00:00:00', '2026-04-11 22:32:09', '2026-04-11 22:32:09', 1);
INSERT INTO `coupons` VALUES (25, '周一特价', '特价', 'percentage', 5.00, 20.00, 'shop_all', 20, 0, 1, '2026-04-02 00:00:00', '2026-04-30 00:00:00', '2026-04-13 10:48:09', '2026-04-13 10:48:09', 3);
INSERT INTO `coupons` VALUES (28, '店铺周年庆', '全场特价甩卖', 'fixed_amount', 50.00, 100.00, 'shop_all', 100, 0, 1, '2026-04-04 00:00:00', '2026-04-30 00:00:00', '2026-04-13 21:39:09', '2026-04-13 21:39:09', 3);
INSERT INTO `coupons` VALUES (29, '通用优惠券', '通用', 'fixed_amount', 15.00, 80.00, 'shop_all', 100, 0, 1, '2026-04-04 00:00:00', '2026-04-29 00:00:00', '2026-04-15 10:41:41', '2026-04-15 10:41:41', 3);
INSERT INTO `coupons` VALUES (30, '真美丽超级优惠券', '优惠', 'fixed_amount', 20.00, 80.00, 'shop_all', 100, 0, 1, '2026-04-01 00:00:00', '2026-04-30 00:00:00', '2026-04-15 11:38:33', '2026-04-15 11:38:33', 1);

-- ----------------------------
-- Table structure for discussion_images
-- ----------------------------
DROP TABLE IF EXISTS `discussion_images`;
CREATE TABLE `discussion_images`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `discussion_id` int NOT NULL,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `discussion_id`(`discussion_id` ASC) USING BTREE,
  CONSTRAINT `discussion_images_ibfk_1` FOREIGN KEY (`discussion_id`) REFERENCES `discussions` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of discussion_images
-- ----------------------------
INSERT INTO `discussion_images` VALUES (4, 9, 'http://localhost:3000/uploads/review-1776437747735-787205960.webp', '2026-04-17 22:55:53');
INSERT INTO `discussion_images` VALUES (5, 10, 'http://localhost:3000/uploads/review-1776477279683-918150463.webp', '2026-04-18 09:57:34');

-- ----------------------------
-- Table structure for discussion_products
-- ----------------------------
DROP TABLE IF EXISTS `discussion_products`;
CREATE TABLE `discussion_products`  (
  `discussion_id` int NOT NULL,
  `product_id` int NOT NULL,
  PRIMARY KEY (`discussion_id`, `product_id`) USING BTREE,
  INDEX `product_id`(`product_id` ASC) USING BTREE,
  CONSTRAINT `discussion_products_ibfk_1` FOREIGN KEY (`discussion_id`) REFERENCES `discussions` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `discussion_products_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of discussion_products
-- ----------------------------
INSERT INTO `discussion_products` VALUES (9, 37);
INSERT INTO `discussion_products` VALUES (10, 38);
INSERT INTO `discussion_products` VALUES (10, 39);

-- ----------------------------
-- Table structure for discussions
-- ----------------------------
DROP TABLE IF EXISTS `discussions`;
CREATE TABLE `discussions`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `view_count` int NULL DEFAULT 0,
  `comment_count` int NULL DEFAULT 0,
  `sort_order` int NULL DEFAULT 0 COMMENT '排序',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_pinned` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `discussions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of discussions
-- ----------------------------
INSERT INTO `discussions` VALUES (5, 22, '今天是星期二', '今天遇到一件心仪的裙子，很开心', 1, 0, 0, '2026-03-27 18:07:35', '2026-04-06 20:02:07', 1);
INSERT INTO `discussions` VALUES (6, 22, '关于“等我瘦下来”的谎言', '我们好像总在说：“等我瘦下来，我就去海边”、“等我瘦下来，我就穿这条裙子”。\n但亲爱的，生命不是一场需要“变瘦”才能开始的预演。\n今年的夏天，我不想再等了。我穿着这件吊带裙，没有遮遮掩掩，没有尴尬。\n风吹过我的手臂和肚子的那一刻，我突然觉得，这就是自由的感觉。\n体重只是你与地球引', 1, 0, 0, '2026-03-27 18:11:25', '2026-03-27 19:05:10', 0);
INSERT INTO `discussions` VALUES (7, 22, '身体 Neutrality（身体中立）', '有时候我们不一定非要“爱”身体的每一个部分，那是很高的要求。\n可以试试“身体中立”。\n我不必每天夸赞我的大腿很细，我只需要感谢它支撑我走了很远的路，让我看到了好看的风景。\n不必勉强自己时刻自信，只要停止对自己的伤害。从今天起，试着和身体做朋友，而不是敌人。', 3, 1, 0, '2026-03-27 18:11:43', '2026-04-06 19:38:22', 0);
INSERT INTO `discussions` VALUES (8, 47, '不是“遮肉”，是“展示风格”', '经常听到有人说：“这件衣服显瘦吗？”\n我想换个问法：“这件衣服让我看起来酷吗？优雅吗？有气场吗？”\n我们穿衣服是为了取悦自己，不是为了在视觉上“消失”。大码穿搭的核心不是遮住哪里，而是找到身体曲线的韵律。\n分享一个近期很爱的穿搭公式：高腰+垂坠感面料+亮眼的配饰。', 4, 1, 0, '2026-03-27 18:12:21', '2026-04-22 16:01:18', 1);
INSERT INTO `discussions` VALUES (9, 68, '今天到了一条超级漂亮的裙子，迫不及待来和大家分享！', '姐妹们！今天必须要来开个贴好好说说我这条新裙子！！📣\n\n下午快递一到我就冲下楼去拿，拆开的那一刻真的被惊艳到了——比商品图还好看是怎么回事？！实物颜色特别正，是那种很温柔的奶杏色，带一点淡淡的珠光感，但不是廉价的反光，就是阳光下会有一层很细腻的光泽，像贝壳内壁那种感觉✨\n\n面料', 2, 1, 0, '2026-04-17 22:55:53', '2026-04-17 22:56:34', 0);
INSERT INTO `discussions` VALUES (10, 68, '谁懂啊！这件衣服的快乐我get到了！🥹 物所值了', '家人们谁懂啊！在网上冲浪🏄‍♀️这么久，终于买到一件让我想疯狂晒单的衣服了！\n\n📝 关于尺码：\n本人160/110，属于上半身有肉那种。一开始担心穿不上，跟着详情页推荐入了M，结果刚刚好！不勒肉也不松垮，简直是我的量身定做。\n\n✨ 关于质感：\n说实话，下单的时候看到价格还有点', 0, 0, 0, '2026-04-18 09:57:34', '2026-04-18 09:57:34', 0);

-- ----------------------------
-- Table structure for favorites
-- ----------------------------
DROP TABLE IF EXISTS `favorites`;
CREATE TABLE `favorites`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '用户ID',
  `product_id` int NOT NULL COMMENT '商品ID',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_user_product`(`user_id` ASC, `product_id` ASC) USING BTREE,
  INDEX `product_id`(`product_id` ASC) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE,
  CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of favorites
-- ----------------------------

-- ----------------------------
-- Table structure for hot_products
-- ----------------------------
DROP TABLE IF EXISTS `hot_products`;
CREATE TABLE `hot_products`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL COMMENT '商品ID',
  `sort_order` int NULL DEFAULT 0 COMMENT '排序，数字越小越靠前',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_product`(`product_id` ASC) USING BTREE,
  CONSTRAINT `hot_products_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 25 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of hot_products
-- ----------------------------
INSERT INTO `hot_products` VALUES (16, 32, 0, '2026-04-06 19:58:24', '2026-04-06 19:58:24');
INSERT INTO `hot_products` VALUES (20, 31, 1, '2026-04-20 19:57:46', '2026-04-20 19:57:46');
INSERT INTO `hot_products` VALUES (23, 35, 3, '2026-05-20 08:21:00', '2026-05-20 08:21:00');
INSERT INTO `hot_products` VALUES (24, 33, 3, '2026-05-20 08:21:09', '2026-05-20 08:21:09');

-- ----------------------------
-- Table structure for internal_messages
-- ----------------------------
DROP TABLE IF EXISTS `internal_messages`;
CREATE TABLE `internal_messages`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sender_id` bigint NOT NULL COMMENT '发送者ID',
  `sender_role` int NOT NULL COMMENT '发送者角色ID',
  `receiver_id` bigint NOT NULL COMMENT '接收者ID',
  `receiver_role` int NOT NULL COMMENT '接收者角色ID',
  `subject` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '消息主题',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '消息内容',
  `message_type` enum('text','notification','system','broadcast') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'text' COMMENT '消息类型',
  `is_read` tinyint(1) NULL DEFAULT 0 COMMENT '是否已读',
  `is_important` tinyint(1) NULL DEFAULT 0 COMMENT '是否重要',
  `can_reply` tinyint(1) NULL DEFAULT 1 COMMENT '是否可以回复（0：单向通知，1：双向沟通）',
  `is_broadcast` tinyint(1) NULL DEFAULT 0 COMMENT '是否为群发消息',
  `broadcast_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '群发消息ID（同一批群发消息使用相同ID）',
  `parent_id` bigint NULL DEFAULT NULL COMMENT '父消息ID（用于回复）',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_sender`(`sender_id` ASC, `sender_role` ASC) USING BTREE,
  INDEX `idx_receiver`(`receiver_id` ASC, `receiver_role` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE,
  INDEX `idx_is_read`(`is_read` ASC) USING BTREE,
  INDEX `idx_can_reply`(`can_reply` ASC) USING BTREE,
  INDEX `idx_is_broadcast`(`is_broadcast` ASC) USING BTREE,
  INDEX `idx_broadcast_id`(`broadcast_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '站内信表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of internal_messages
-- ----------------------------
INSERT INTO `internal_messages` VALUES (1, 1, 1, 55, 6, '11111111111111', '11111111111111111', 'text', 1, 1, 1, 0, NULL, NULL, '2026-05-10 19:00:16', '2026-05-10 19:32:07');
INSERT INTO `internal_messages` VALUES (2, 1, 1, 56, 6, '11111111111111', '11111111111111111', 'text', 0, 0, 1, 0, NULL, NULL, '2026-05-10 19:00:16', '2026-05-10 19:00:16');
INSERT INTO `internal_messages` VALUES (3, 55, 6, 1, 1, '回复', '母亲节将至，店铺将进行特惠活动！！！', 'text', 1, 0, 1, 0, NULL, NULL, '2026-05-10 19:34:19', '2026-05-10 19:34:48');
INSERT INTO `internal_messages` VALUES (4, 1, 1, 35, 2, '母亲节特惠活动', '母亲节将至，超级特惠！！', 'text', 1, 0, 1, 0, NULL, NULL, '2026-05-10 19:35:27', '2026-05-10 20:47:55');
INSERT INTO `internal_messages` VALUES (6, 35, 2, 68, 5, '2222222222222', '111111111111', 'text', 1, 1, 0, 0, NULL, NULL, '2026-05-10 20:48:35', '2026-05-10 20:49:18');

-- ----------------------------
-- Table structure for logistics
-- ----------------------------
DROP TABLE IF EXISTS `logistics`;
CREATE TABLE `logistics`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `company` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '物流公司',
  `tracking_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '物流单号',
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '物流状态',
  `location` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '当前位置',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '物流描述',
  `courier_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '快递员姓名',
  `courier_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '快递员电话',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `address` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '详细地址',
  `current_address` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '当前地址/网点名称',
  `estimated_arrival` datetime NULL DEFAULT NULL COMMENT '预计到达时间',
  `is_completed` tinyint NULL DEFAULT 0 COMMENT '是否完成：0-否 1-是',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `order_id`(`order_id` ASC) USING BTREE,
  CONSTRAINT `logistics_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 103 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of logistics
-- ----------------------------

-- ----------------------------
-- Table structure for menus
-- ----------------------------
DROP TABLE IF EXISTS `menus`;
CREATE TABLE `menus`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `parent_id` int UNSIGNED NULL DEFAULT 0 COMMENT '父菜单ID，0表示顶级菜单',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '菜单名称',
  `path` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '菜单路径',
  `icon` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '菜单图标',
  `sort` int UNSIGNED NULL DEFAULT 0 COMMENT '排序号',
  `status` tinyint UNSIGNED NULL DEFAULT 1 COMMENT '状态：0禁用 1启用',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_parent_id`(`parent_id` ASC) USING BTREE,
  INDEX `idx_sort`(`sort` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 22 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '菜单表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of menus
-- ----------------------------
INSERT INTO `menus` VALUES (1, 0, '控制台', '/', 'DataAnalysis', 1, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `menus` VALUES (2, 0, '商品中心', '', 'Goods', 2, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `menus` VALUES (3, 2, '商品管理', '/products', '', 1, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `menus` VALUES (4, 2, '分类管理', '/categories', '', 2, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `menus` VALUES (5, 2, '热门推荐', '/hot-products', '', 3, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `menus` VALUES (6, 2, '新品推荐', '/new-products', '', 4, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `menus` VALUES (7, 0, '订单中心', '', 'ShoppingCart', 3, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `menus` VALUES (8, 7, '订单管理', '/orders', '', 1, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `menus` VALUES (9, 7, '优惠券管理', '/coupons', '', 2, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `menus` VALUES (10, 7, '评价管理', '/reviews', '', 3, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `menus` VALUES (11, 0, '用户中心', '', 'User', 4, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `menus` VALUES (12, 11, '用户管理', '/users', '', 1, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `menus` VALUES (13, 11, '角色管理', '/roles', '', 2, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `menus` VALUES (14, 11, '商家管理', '/merchant-applications', '', 3, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `menus` VALUES (15, 0, '店铺管理', '/shops', 'Shop', 5, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `menus` VALUES (16, 0, '社区中心', '', 'ChatRound', 6, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `menus` VALUES (17, 16, '社区管理', '/discussions', '', 1, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `menus` VALUES (18, 16, '专区管理', '/zones', '', 2, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `menus` VALUES (19, 0, '客服中心', '', 'ChatDotRound', 7, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `menus` VALUES (20, 19, '会话管理', '/conversations', '', 1, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `menus` VALUES (21, 0, '数据统计', '', 'TrendCharts', 8, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');

-- ----------------------------
-- Table structure for merchant_applications
-- ----------------------------
DROP TABLE IF EXISTS `merchant_applications`;
CREATE TABLE `merchant_applications`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NULL DEFAULT NULL COMMENT '用户ID，null表示未登录用户',
  `shop_data` json NOT NULL COMMENT '店铺申请数据',
  `status` enum('pending','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'pending' COMMENT '审核状态',
  `review_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '审核意见',
  `reviewed_by` int NULL DEFAULT NULL COMMENT '审核人ID',
  `reviewed_at` datetime NULL DEFAULT NULL COMMENT '审核时间',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `license_image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '店铺资格证图片URL',
  `id_card_front` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '法人身份证正面图片URL',
  `id_card_back` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '法人身份证反面图片URL',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 21 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of merchant_applications
-- ----------------------------
INSERT INTO `merchant_applications` VALUES (1, NULL, '{\"name\": \"店铺-123456\", \"license_no\": \"91110108MA009X123456\", \"legal_person\": \"店铺经营者\", \"contact_phone\": \"13800138000\"}', 'rejected', '名字不对', 1, '2026-03-29 17:29:10', '2026-03-29 11:01:19', '2026-04-07 10:55:49', NULL, NULL, NULL);
INSERT INTO `merchant_applications` VALUES (2, NULL, '{\"name\": \"超越大码服装店\", \"license_no\": \"91440106GP57APDOHS\", \"description\": \"美，从不被尺码定义；风格，只为自信加冕。\\n这里是超越大码服饰——我们超越的不仅是尺码的界限，更是世俗对美的偏见。\\n谁说大码不能穿出超模气场？我们精选高弹力面料与立体剪裁，只为让每一寸身形都能舒展自如，让每一个你都能穿出惊艳。在超越，大码不是妥协，而是另一种惊艳的开始。\", \"legal_person\": \"金明\", \"contact_email\": \"13245688859@163.com\", \"contact_phone\": 13245688859}', 'rejected', '名字不对', 1, '2026-03-29 17:24:09', '2026-03-29 12:01:45', '2026-04-07 10:54:59', NULL, NULL, NULL);
INSERT INTO `merchant_applications` VALUES (3, NULL, '{\"name\": \"超越大码服饰店\", \"license_no\": \"91440106MEY42MNCSH\", \"description\": \"美，从不被尺码定义；风格，只为自信加冕。\\n这里是超越大码服饰——我们超越的不仅是尺码的界限，更是世俗对美的偏见。\\n谁说大码不能穿出超模气场？我们精选高弹力面料与立体剪裁，只为让每一寸身形都能舒展自如，让每一个你都能穿出惊艳。在超越，大码不是妥协，而是另一种惊艳的开始。\", \"legal_person\": \"金明\", \"contact_email\": \"13245665878@163.com\", \"contact_phone\": 13245665878}', 'approved', '通过', 1, '2026-03-29 17:42:20', '2026-03-29 17:41:42', '2026-04-07 10:54:59', NULL, NULL, NULL);
INSERT INTO `merchant_applications` VALUES (4, 55, '{\"name\": \"甄时尚大码服装店\", \"password\": \"***REDACTED***\", \"license_no\": \"9111010812L4YYMUNP\", \"description\": \"衣服宽一点，心就宽一点。宽心衣橱不想让你“遮肉”，只想让你“舒心”。我们精选宽松但不松垮的版型，藏肉的同时更藏住焦虑。你的衣橱，该让每一天都轻松。\", \"legal_person\": \"甄美丽\", \"contact_email\": \"13245668585@qq.com\", \"contact_phone\": 13245668585}', 'rejected', '拒绝', 1, '2026-04-06 21:24:37', '2026-03-29 22:00:24', '2026-04-07 10:54:59', NULL, NULL, NULL);
INSERT INTO `merchant_applications` VALUES (5, 56, '{\"name\": \"宽心衣橱\", \"password\": \"***REDACTED***\", \"license_no\": \"914401061EDMT42KL9\", \"description\": \"衣服宽一点，心就宽一点。我们不劝你“遮肉”，只想让你舒心。精选宽松但不松垮的版型，藏肉的同时更藏住焦虑。你的衣橱，该让每一天都轻松。\", \"legal_person\": \"甄心大\", \"contact_email\": \"1524658787@qq.com\", \"contact_phone\": 15246889895}', 'approved', '通过', 1, '2026-03-30 14:44:36', '2026-03-30 14:44:07', '2026-04-07 10:54:59', NULL, NULL, NULL);
INSERT INTO `merchant_applications` VALUES (6, 57, '{\"name\": \"云朵大码\", \"password\": \"***REDACTED***\", \"license_no\": \"91440106W6E0M75NXU\", \"description\": \"像云朵一样柔软，像拥抱一样安心。专注亲肤、无压的面料，让你穿上的瞬间就放松下来。不勒肉、不闷汗，大码的舒适感，从一件“云朵衣”开始。\", \"legal_person\": \"甄云朵\", \"contact_email\": \"13245668989@qq.com\", \"contact_phone\": 13245668989}', 'approved', '同意', 1, '2026-03-30 16:42:56', '2026-03-30 16:42:34', '2026-04-07 10:54:59', NULL, NULL, NULL);
INSERT INTO `merchant_applications` VALUES (7, 59, '{\"name\": \"大码潮搭社\", \"license_no\": \"91330108D5QBQAZ4KF\", \"description\": \"集合当下流行元素，专为大码人群设计\", \"legal_person\": \"贾潮流\", \"contact_email\": \"13245669595\", \"contact_phone\": \"13245669595\"}', 'rejected', '拒绝', 1, '2026-04-07 10:11:52', '2026-04-06 21:47:19', '2026-04-07 10:54:59', NULL, NULL, NULL);
INSERT INTO `merchant_applications` VALUES (8, 60, '{\"name\": \"锦韵大码服饰\", \"license_no\": \"91110108SSGC0XP4L4\", \"description\": \"中式改良、简约大气大码女装，适合日常、聚会、走亲访友\", \"legal_person\": \"夏好看\", \"contact_email\": \"15645898596@163.com\", \"contact_phone\": \"15645898596\"}', 'rejected', '拒绝', 1, '2026-04-07 10:11:56', '2026-04-06 21:47:19', '2026-04-07 10:54:59', NULL, NULL, NULL);
INSERT INTO `merchant_applications` VALUES (9, 58, '{\"name\": \"测试店铺456\", \"license_no\": \"123456789\", \"legal_person\": \"测试用户\", \"contact_phone\": \"13800138002\"}', 'rejected', NULL, 1, '2026-04-06 21:47:19', '2026-04-06 21:47:19', '2026-04-07 10:54:59', NULL, NULL, NULL);
INSERT INTO `merchant_applications` VALUES (10, NULL, '{\"name\": \"雅致大码妈妈装\", \"password\": \"123456\", \"username\": \"赵优雅\", \"license_no\": \"91110108C56NP6G9TO\", \"description\": \"适合中年大码女性的气质女装，端庄大方，舒适耐穿，显年轻显气质。\", \"legal_person\": \"赵优雅\", \"contact_email\": \"13245661212@163.com\", \"contact_phone\": 13245661212}', 'approved', '同意', 1, '2026-04-07 13:51:02', '2026-04-07 13:50:37', '2026-04-07 13:51:02', NULL, NULL, NULL);
INSERT INTO `merchant_applications` VALUES (11, NULL, '{\"name\": \"大码潮搭社\", \"password\": \"123456\", \"username\": \"甄时髦\", \"license_no\": \"91310115FNAB92K0L9\", \"description\": \"集合当下流行元素，专为大码人群设计，显瘦又时髦\", \"legal_person\": \"甄时髦\", \"contact_email\": \"13245661313@163.com\", \"contact_phone\": 13245661313}', 'approved', '同意', 1, '2026-04-11 20:33:00', '2026-04-07 13:52:14', '2026-04-11 20:33:00', NULL, NULL, NULL);
INSERT INTO `merchant_applications` VALUES (12, NULL, '{\"name\": \"锦韵大码服饰\", \"password\": \"123456\", \"username\": \"胡一帆\", \"license_no\": \"913301086CLBR4AGCZ\", \"description\": \"中式改良、简约大气大码女装，适合日常、聚会、走亲访友\", \"legal_person\": \"胡一帆\", \"contact_email\": \"13245661414@163.com\", \"contact_phone\": 13245661414}', 'approved', '同意', 1, '2026-04-11 20:32:49', '2026-04-07 14:01:11', '2026-04-11 20:32:49', NULL, NULL, NULL);
INSERT INTO `merchant_applications` VALUES (13, NULL, '{\"name\": \"拓途大码\", \"password\": \"123456\", \"username\": \"刘三三\", \"license_no\": \"91310115KISGF1QUHA\", \"description\": \"聚焦 “大码人士的日常穿搭”。涵盖商务通勤与休闲运动两大场景，用料扎实抗皱，版型包容不勒肉。\", \"legal_person\": \"刘三三\", \"contact_email\": \"15246857575@163.com\", \"contact_phone\": 15246857575}', 'pending', NULL, NULL, NULL, '2026-04-14 15:26:12', '2026-04-14 15:26:12', NULL, NULL, NULL);
INSERT INTO `merchant_applications` VALUES (14, NULL, '{\"name\": \"宅享家居集合\", \"password\": \"123456\", \"username\": \"方宅宅\", \"license_no\": \"91440106D18MHCEHNA\", \"description\": \"打造 “家里的温柔乡”。精选宽松家居服、毛绒拖鞋与舒适抱枕，风格温馨治愈。面料软糯透气，适合居家休憩与慵懒宅家，给生活一份温暖的拥抱。\", \"legal_person\": \"方宅宅\", \"contact_email\": \"13465859595@163.com\", \"contact_phone\": 13465859595}', 'approved', '同意', 1, '2026-04-14 16:47:30', '2026-04-14 15:30:45', '2026-04-14 16:47:30', NULL, NULL, NULL);
INSERT INTO `merchant_applications` VALUES (15, NULL, '{\"name\": \"轻跃运动馆\", \"password\": \"123456\", \"username\": \"赵月月\", \"license_no\": \"91310115HOKH1MB1TQ\", \"description\": \"主打 “轻量运动风”。涵盖跑步、瑜伽、健身三大系列服饰，面料速干排汗，剪裁灵活不臃肿。无论身材如何，都能在运动中保持轻盈与活力，享受流汗的快乐。\", \"legal_person\": \"赵月月\", \"contact_email\": \"15246152525@163.com\", \"contact_phone\": 15246152525}', 'approved', '通过', 1, '2026-04-15 11:37:07', '2026-04-14 22:48:17', '2026-04-15 11:37:07', 'http://localhost:3000/uploads/discussion_1776177999688-255866083.png', 'http://localhost:3000/uploads/discussion_1776178021262-448484903.png', 'http://localhost:3000/uploads/discussion_1776178058774-466539772.png');
INSERT INTO `merchant_applications` VALUES (16, NULL, '{\"name\": \"信赖服装\", \"password\": \"123456\", \"username\": \"辛一苦\", \"license_no\": \"91110108TCADEIPF8X\", \"description\": 1111111, \"legal_person\": \"辛一苦\", \"contact_email\": \"15246152525@163.com\", \"contact_phone\": 15246152525}', 'approved', '', 1, '2026-04-17 22:39:15', '2026-04-15 11:35:42', '2026-04-17 22:39:15', 'http://localhost:3000/uploads/discussion_1776224134122-465590326.webp', 'http://localhost:3000/uploads/discussion_1776224138101-306154593.webp', 'http://localhost:3000/uploads/discussion_1776224141438-89736365.webp');
INSERT INTO `merchant_applications` VALUES (17, NULL, '{\"name\": \"宽适鞋坊\", \"password\": \"123456\", \"username\": \"赵英俊\", \"license_no\": \"91440305LYLROL2HUA\", \"description\": \"专门适配宽脚与大码人群的鞋店。提供版型宽松的帆布鞋、乐福鞋与老爹鞋，鞋头包容不挤脚，皮质柔软透气。颜值与脚感并存，让穿鞋不再是一种折磨。\", \"legal_person\": \"赵英俊\", \"contact_email\": \"15246253525@163.com\", \"contact_phone\": 15246253525}', 'approved', '', 1, '2026-04-15 21:59:11', '2026-04-15 13:33:18', '2026-04-15 21:59:11', 'http://localhost:3000/uploads/discussion_1776230916486-7221914.webp', 'http://localhost:3000/uploads/discussion_1776230950808-41635749.webp', 'http://localhost:3000/uploads/discussion_1776231102749-621216128.webp');
INSERT INTO `merchant_applications` VALUES (18, NULL, '{\"name\": \"依依大码服装\", \"password\": \"123456\", \"username\": \"赵明白\", \"license_no\": \"913101155EWVDZW9QD\", \"description\": 11111111111, \"legal_person\": \"赵明白\", \"contact_email\": \"15246152589@163.com\", \"contact_phone\": 15246152589}', 'approved', '通过', 1, '2026-04-15 15:13:04', '2026-04-15 15:12:30', '2026-04-15 15:13:04', 'http://localhost:3000/uploads/discussion_1776237139897-590839351.webp', 'http://localhost:3000/uploads/discussion_1776237144188-800402426.webp', 'http://localhost:3000/uploads/discussion_1776237148885-758488607.webp');
INSERT INTO `merchant_applications` VALUES (19, NULL, '{\"name\": \"牧洋人\", \"password\": \"123456\", \"username\": \"陈丽丽\", \"license_no\": \"91110108A1D495RIH5\", \"description\": 11111111111, \"legal_person\": \"陈丽丽\", \"contact_email\": \"15246663636@163.com\", \"contact_phone\": 15246663636}', 'pending', NULL, NULL, NULL, '2026-04-17 22:45:07', '2026-04-17 22:45:07', 'http://localhost:3000/uploads/discussion_1776436898426-255288691.webp', 'http://localhost:3000/uploads/discussion_1776436929331-198492670.webp', 'http://localhost:3000/uploads/discussion_1776436958062-447683216.webp');
INSERT INTO `merchant_applications` VALUES (20, NULL, '{\"name\": \"success\", \"password\": \"123456\", \"username\": \"甄成功\", \"license_no\": \"91440106NIM2XI0UKI\", \"description\": 1111111111111111, \"legal_person\": \"甄成功\", \"contact_email\": \"15245245454@163.com\", \"contact_phone\": 15245245454}', 'pending', NULL, NULL, NULL, '2026-04-17 22:48:35', '2026-04-17 22:48:35', 'http://localhost:3000/uploads/discussion_1776437170961-968101825.webp', 'http://localhost:3000/uploads/discussion_1776437198157-323819261.webp', 'http://localhost:3000/uploads/discussion_1776437243470-290183745.webp');

-- ----------------------------
-- Table structure for merge_payments
-- ----------------------------
DROP TABLE IF EXISTS `merge_payments`;
CREATE TABLE `merge_payments`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_ids` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '合并的订单ID列表(JSON数组)',
  `total_amount` decimal(10, 2) NOT NULL COMMENT '合并支付总金额',
  `payment_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '支付方式',
  `payment_time` datetime NULL DEFAULT NULL COMMENT '支付时间',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'pending' COMMENT '支付状态: pending/paid/failed',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of merge_payments
-- ----------------------------

-- ----------------------------
-- Table structure for message_notifications
-- ----------------------------
DROP TABLE IF EXISTS `message_notifications`;
CREATE TABLE `message_notifications`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `user_role` int NOT NULL COMMENT '用户角色',
  `message_id` bigint NULL DEFAULT NULL COMMENT '消息ID',
  `notification_type` enum('new_message','system_alert','important') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'new_message' COMMENT '通知类型',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '通知标题',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '通知内容',
  `is_read` tinyint(1) NULL DEFAULT 0 COMMENT '是否已读',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user`(`user_id` ASC, `user_role` ASC) USING BTREE,
  INDEX `idx_is_read`(`is_read` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '消息通知表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of message_notifications
-- ----------------------------
INSERT INTO `message_notifications` VALUES (1, 55, 6, 1, 'new_message', '新站内信', '新消息：11111111111111', 0, '2026-05-10 19:00:16');
INSERT INTO `message_notifications` VALUES (2, 56, 6, 2, 'new_message', '新站内信', '新消息：11111111111111', 0, '2026-05-10 19:00:16');
INSERT INTO `message_notifications` VALUES (3, 1, 1, 3, 'new_message', '新站内信', '新消息：回复', 0, '2026-05-10 19:34:19');
INSERT INTO `message_notifications` VALUES (4, 35, 2, 4, 'new_message', '新站内信', '新消息：母亲节特惠活动', 0, '2026-05-10 19:35:27');
INSERT INTO `message_notifications` VALUES (5, 68, 5, 5, 'new_message', '新站内信', '新消息：11111111111', 0, '2026-05-10 20:18:46');
INSERT INTO `message_notifications` VALUES (6, 68, 5, 6, 'new_message', '新站内信', '新消息：2222222222222', 0, '2026-05-10 20:48:35');

-- ----------------------------
-- Table structure for messages
-- ----------------------------
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `sender_role` enum('buyer','customer_service') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('text') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'text',
  `is_read` tinyint(1) NULL DEFAULT 0,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `conversation_id`(`conversation_id` ASC) USING BTREE,
  INDEX `sender_id`(`sender_id` ASC) USING BTREE,
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 39 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of messages
-- ----------------------------
INSERT INTO `messages` VALUES (10, 4, 22, 'buyer', '【订单】订单 #47 - ORD202603155069', 'text', 1, '2026-03-15 07:49:12');
INSERT INTO `messages` VALUES (11, 4, 22, 'buyer', '【商品】女士面包靴 - ¥120', 'text', 1, '2026-03-15 07:57:24');
INSERT INTO `messages` VALUES (12, 4, 22, 'buyer', '【商品】女士面包靴 - ¥120', 'text', 1, '2026-03-15 07:58:50');
INSERT INTO `messages` VALUES (13, 4, 22, 'buyer', '【商品】超流行女士风衣 - ¥188', 'text', 1, '2026-03-15 08:51:05');
INSERT INTO `messages` VALUES (14, 4, 22, 'buyer', '【商品】超流行女士风衣 - ¥188', 'text', 1, '2026-03-15 08:52:57');
INSERT INTO `messages` VALUES (15, 4, 22, 'buyer', '【商品】超流行女士风衣 - ¥188', 'text', 1, '2026-03-15 08:53:23');
INSERT INTO `messages` VALUES (16, 4, 22, 'buyer', '请问白色的鞋还有货吗\n\n【商品】女士面包靴 - ¥120', 'text', 1, '2026-03-17 17:25:37');
INSERT INTO `messages` VALUES (17, 4, 1, 'customer_service', '有的，亲\n每个码数都有货', 'text', 0, '2026-03-17 17:26:15');
INSERT INTO `messages` VALUES (18, 4, 22, 'buyer', '还有货吗\n\n【商品】女士面包靴 - ¥120', 'text', 1, '2026-03-21 14:20:45');
INSERT INTO `messages` VALUES (19, 4, 22, 'buyer', '你好', 'text', 1, '2026-03-27 13:41:12');
INSERT INTO `messages` VALUES (20, 4, 37, 'customer_service', '在的', 'text', 0, '2026-03-27 14:06:05');
INSERT INTO `messages` VALUES (21, 6, 47, 'buyer', '【商品】印花图案 T 恤 - ¥39', 'text', 1, '2026-03-27 18:26:08');
INSERT INTO `messages` VALUES (22, 7, 48, 'buyer', '我想咨询这个商品\n\n【商品】印花图案 T 恤 - ¥39', 'text', 1, '2026-03-27 19:48:06');
INSERT INTO `messages` VALUES (23, 7, 1, 'customer_service', '这件衣服', 'text', 0, '2026-03-27 19:48:39');
INSERT INTO `messages` VALUES (24, 7, 48, 'buyer', '【商品】田园风碎花连衣裙 - ¥600', 'text', 1, '2026-03-28 15:15:34');
INSERT INTO `messages` VALUES (25, 7, 48, 'buyer', '【商品】春秋长袖针织连衣裙 - ¥99', 'text', 1, '2026-04-01 11:36:13');
INSERT INTO `messages` VALUES (26, 7, 48, 'buyer', '【商品】春秋长袖针织连衣裙 - ¥99', 'text', 1, '2026-04-09 20:47:25');
INSERT INTO `messages` VALUES (27, 7, 48, 'buyer', '【商品】春秋长袖针织连衣裙 - ¥99', 'text', 1, '2026-04-09 20:47:37');
INSERT INTO `messages` VALUES (28, 7, 48, 'buyer', '【商品】春秋长袖针织连衣裙 - ¥99', 'text', 1, '2026-04-14 19:34:06');
INSERT INTO `messages` VALUES (29, 8, 67, 'buyer', '【商品】V领T恤 - ¥80', 'text', 1, '2026-04-15 08:46:16');
INSERT INTO `messages` VALUES (30, 10, 74, 'buyer', '11111\n\n【商品】法式复古长款连衣裙 - ¥1888', 'text', 1, '2026-04-15 15:16:05');
INSERT INTO `messages` VALUES (31, 11, 68, 'buyer', '你好客服，我想问下这个衣服怎么样啊\n\n【商品】春秋长袖针织连衣裙 - ¥99', 'text', 1, '2026-04-18 09:59:20');
INSERT INTO `messages` VALUES (32, 11, 68, 'buyer', '会显白吗', 'text', 1, '2026-04-18 09:59:34');
INSERT INTO `messages` VALUES (33, 11, 37, 'customer_service', '这件衣服的质量肯定是没得说，采用纯棉吸汗面料，颜色很显白', 'text', 0, '2026-04-18 10:02:34');
INSERT INTO `messages` VALUES (34, 11, 37, 'customer_service', '要下一单试试看吗', 'text', 0, '2026-04-18 10:02:44');
INSERT INTO `messages` VALUES (35, 11, 68, 'buyer', '挺好的，我看评论也不错，评分也挺高的', 'text', 1, '2026-04-18 10:03:09');
INSERT INTO `messages` VALUES (36, 11, 68, 'buyer', '我家在黑龙江大概什么时候能到呢', 'text', 1, '2026-04-18 10:03:26');
INSERT INTO `messages` VALUES (37, 11, 37, 'customer_service', '好的亲，省内2-3天，省外5-7天，快递随机发', 'text', 0, '2026-04-18 10:04:01');
INSERT INTO `messages` VALUES (38, 4, 37, 'customer_service', '11', 'text', 0, '2026-05-12 13:48:33');

-- ----------------------------
-- Table structure for new_products
-- ----------------------------
DROP TABLE IF EXISTS `new_products`;
CREATE TABLE `new_products`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL COMMENT '商品ID',
  `sort_order` int NULL DEFAULT 0 COMMENT '排序，数字越小越靠前',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_product`(`product_id` ASC) USING BTREE,
  CONSTRAINT `new_products_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of new_products
-- ----------------------------
INSERT INTO `new_products` VALUES (8, 39, 0, '2026-04-20 19:03:03', '2026-04-20 19:03:03');
INSERT INTO `new_products` VALUES (9, 33, 1, '2026-04-20 19:03:08', '2026-04-20 19:03:08');
INSERT INTO `new_products` VALUES (10, 38, 2, '2026-04-20 19:03:14', '2026-04-20 19:03:14');

-- ----------------------------
-- Table structure for operation_logs
-- ----------------------------
DROP TABLE IF EXISTS `operation_logs`;
CREATE TABLE `operation_logs`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '操作用户ID',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '操作用户名',
  `role_id` int NOT NULL COMMENT '操作用户角色ID',
  `role_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '操作用户角色名称',
  `operation_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '操作类型',
  `operation_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '操作内容',
  `ip_address` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '操作IP地址',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of operation_logs
-- ----------------------------
INSERT INTO `operation_logs` VALUES (1, 1, 'admin', 1, '超级管理员', '登录', '用户 admin 成功登录后台管理系统', '::1', '2026-01-13 09:14:29');
INSERT INTO `operation_logs` VALUES (2, 1, 'admin', 1, '超级管理员', '登录', '用户 admin 成功登录后台管理系统', '::1', '2026-01-13 09:33:07');
INSERT INTO `operation_logs` VALUES (3, 1, 'admin', 1, '超级管理员', '登录', '用户 admin 成功登录后台管理系统', '::1', '2026-01-13 09:37:09');
INSERT INTO `operation_logs` VALUES (4, 1, 'admin', 1, '超级管理员', '登录', '用户 admin 成功登录后台管理系统', '::1', '2026-01-13 10:39:05');
INSERT INTO `operation_logs` VALUES (5, 1, 'admin', 1, '超级管理员', '登录', '用户 admin 成功登录后台管理系统', '::1', '2026-01-13 13:37:59');
INSERT INTO `operation_logs` VALUES (6, 1, 'admin', 1, '超级管理员', '登录', '用户 admin 成功登录后台管理系统', '::1', '2026-01-13 13:42:10');
INSERT INTO `operation_logs` VALUES (7, 1, 'admin', 1, '超级管理员', '登录', '用户 admin 成功登录后台管理系统', '::1', '2026-01-13 13:46:33');
INSERT INTO `operation_logs` VALUES (8, 1, 'admin', 1, '超级管理员', '登录', '用户 admin 成功登录后台管理系统', '::1', '2026-01-13 13:58:00');

-- ----------------------------
-- Table structure for order_items
-- ----------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '商品图片路径',
  `price` decimal(10, 2) NOT NULL,
  `quantity` int NOT NULL,
  `size` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `color` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `discount_amount` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '商品优惠金额',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `order_id`(`order_id` ASC) USING BTREE,
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 125 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of order_items
-- ----------------------------
INSERT INTO `order_items` VALUES (70, 88, 32, '春秋长袖针织连衣裙', NULL, 99.00, 1, '6XL', '灰色', '2026-04-01 14:41:23', 0.00);
INSERT INTO `order_items` VALUES (71, 89, 32, '春秋长袖针织连衣裙', NULL, 99.00, 1, '6XL', '灰色', '2026-04-01 14:45:15', 0.00);
INSERT INTO `order_items` VALUES (72, 90, 31, '法式复古长款连衣裙', NULL, 1888.00, 1, '6XL', '墨绿色', '2026-04-05 21:34:52', 0.00);
INSERT INTO `order_items` VALUES (73, 91, 31, '法式复古长款连衣裙', NULL, 1888.00, 1, '6XL', '墨绿色', '2026-04-05 21:59:52', 0.00);
INSERT INTO `order_items` VALUES (74, 92, 32, '春秋长袖针织连衣裙', NULL, 99.00, 1, '6XL', '灰色', '2026-04-05 22:02:45', 0.00);
INSERT INTO `order_items` VALUES (75, 93, 32, '春秋长袖针织连衣裙', NULL, 99.00, 1, '6XL', '灰色', '2026-04-05 22:08:33', 0.00);
INSERT INTO `order_items` VALUES (76, 94, 32, '春秋长袖针织连衣裙', NULL, 99.00, 1, '6XL', '灰色', '2026-04-09 20:48:32', 0.00);
INSERT INTO `order_items` VALUES (77, 95, 32, '春秋长袖针织连衣裙', NULL, 99.00, 1, '6XL', '灰色', '2026-04-09 20:58:57', 0.00);
INSERT INTO `order_items` VALUES (78, 96, 32, '春秋长袖针织连衣裙', NULL, 99.00, 1, '6XL', '灰色', '2026-04-09 21:00:44', 0.00);
INSERT INTO `order_items` VALUES (79, 98, 32, '春秋长袖针织连衣裙', NULL, 99.00, 1, '6XL', '灰色', '2026-04-13 16:17:55', 0.00);
INSERT INTO `order_items` VALUES (80, 99, 32, '春秋长袖针织连衣裙', NULL, 99.00, 1, '6XL', '灰色', '2026-04-13 21:05:07', 0.00);
INSERT INTO `order_items` VALUES (81, 100, 31, '法式复古长款连衣裙', NULL, 1888.00, 1, '7XL', '藏蓝色', '2026-04-14 19:38:54', 0.00);
INSERT INTO `order_items` VALUES (82, 101, 35, '几何印花衬衫', NULL, 120.00, 1, '3XL', '灰色', '2026-04-15 09:31:53', 0.00);
INSERT INTO `order_items` VALUES (83, 102, 31, '法式复古长款连衣裙', NULL, 1888.00, 1, '6XL', '墨绿色', '2026-04-15 09:31:53', 50.00);
INSERT INTO `order_items` VALUES (84, 103, 36, 'V领T恤', NULL, 80.00, 1, '4XL', '白色', '2026-04-15 10:18:06', 0.00);
INSERT INTO `order_items` VALUES (85, 104, 31, '法式复古长款连衣裙', NULL, 1888.00, 1, '6XL', '墨绿色', '2026-04-15 10:18:06', 50.00);
INSERT INTO `order_items` VALUES (86, 105, 35, '几何印花衬衫', NULL, 120.00, 1, '3XL', '灰色', '2026-04-15 10:26:44', 15.00);
INSERT INTO `order_items` VALUES (87, 106, 31, '法式复古长款连衣裙', NULL, 1888.00, 1, '6XL', '墨绿色', '2026-04-15 10:26:44', 15.00);
INSERT INTO `order_items` VALUES (88, 107, 33, '纯棉基础款T恤', NULL, 100.00, 1, '5XL', '藏蓝色', '2026-04-15 11:39:08', 20.00);
INSERT INTO `order_items` VALUES (89, 108, 33, '纯棉基础款T恤', NULL, 100.00, 1, '5XL', '藏蓝色', '2026-04-15 11:41:43', 0.00);
INSERT INTO `order_items` VALUES (90, 109, 31, '法式复古长款连衣裙', NULL, 1888.00, 1, '6XL', '墨绿色', '2026-04-15 11:41:43', 15.00);
INSERT INTO `order_items` VALUES (91, 110, 35, '几何印花衬衫', NULL, 120.00, 1, '3XL', '灰色', '2026-04-15 14:57:55', 0.00);
INSERT INTO `order_items` VALUES (92, 111, 31, '法式复古长款连衣裙', NULL, 1888.00, 1, '6XL', '墨绿色', '2026-04-15 14:57:55', 50.00);
INSERT INTO `order_items` VALUES (93, 112, 31, '法式复古长款连衣裙', NULL, 1888.00, 1, '6XL', '墨绿色', '2026-04-15 15:17:15', 50.00);
INSERT INTO `order_items` VALUES (94, 114, 31, '法式复古长款连衣裙', NULL, 1888.00, 1, '6XL', '藏蓝色', '2026-04-16 14:46:19', 0.00);
INSERT INTO `order_items` VALUES (95, 115, 31, '法式复古长款连衣裙', NULL, 1888.00, 1, '6XL', '藏蓝色', '2026-04-16 14:47:09', 0.00);
INSERT INTO `order_items` VALUES (96, 116, 31, '法式复古长款连衣裙', NULL, 1888.00, 1, '6XL', '藏蓝色', '2026-04-16 14:47:38', 0.00);
INSERT INTO `order_items` VALUES (97, 117, 31, '法式复古长款连衣裙', NULL, 1888.00, 1, '6XL', '藏蓝色', '2026-04-16 14:48:11', 0.00);
INSERT INTO `order_items` VALUES (98, 118, 31, '法式复古长款连衣裙', NULL, 1888.00, 1, '6XL', '藏蓝色', '2026-04-16 14:49:47', 0.00);
INSERT INTO `order_items` VALUES (99, 119, 31, '法式复古长款连衣裙', NULL, 1888.00, 1, '6XL', '藏蓝色', '2026-04-16 14:56:09', 0.00);
INSERT INTO `order_items` VALUES (100, 120, 31, '法式复古长款连衣裙', NULL, 1888.00, 1, '6XL', '藏蓝色', '2026-04-16 18:31:18', 0.00);
INSERT INTO `order_items` VALUES (101, 121, 31, '法式复古长款连衣裙', NULL, 1888.00, 1, '6XL', '墨绿色', '2026-04-17 19:35:06', 50.00);
INSERT INTO `order_items` VALUES (102, 122, 32, '春秋长袖针织连衣裙', NULL, 99.00, 1, '6XL', '灰色', '2026-04-17 20:17:17', 0.00);
INSERT INTO `order_items` VALUES (103, 123, 32, '春秋长袖针织连衣裙', NULL, 99.00, 1, '6XL', '灰色', '2026-04-18 09:05:50', 0.00);
INSERT INTO `order_items` VALUES (104, 124, 32, '春秋长袖针织连衣裙', NULL, 99.00, 1, '6XL', '灰色', '2026-04-18 19:52:24', 0.00);
INSERT INTO `order_items` VALUES (105, 125, 32, '春秋长袖针织连衣裙', NULL, 99.00, 1, '6XL', '灰色', '2026-04-18 20:13:58', 0.00);
INSERT INTO `order_items` VALUES (106, 126, 32, '春秋长袖针织连衣裙', NULL, 99.00, 1, '6XL', '灰色', '2026-04-18 20:16:57', 0.00);
INSERT INTO `order_items` VALUES (107, 127, 32, '春秋长袖针织连衣裙', NULL, 99.00, 1, '6XL', '灰色', '2026-04-18 20:24:06', 0.00);
INSERT INTO `order_items` VALUES (108, 128, 32, '春秋长袖针织连衣裙', NULL, 99.00, 1, '6XL', '灰色', '2026-04-18 20:30:34', 4.95);
INSERT INTO `order_items` VALUES (109, 129, 32, '春秋长袖针织连衣裙', NULL, 99.00, 1, '6XL', '灰色', '2026-04-18 21:14:09', 4.95);
INSERT INTO `order_items` VALUES (110, 130, 38, '商务长袖衬衫连衣裙', NULL, 800.00, 1, '5XL', '棕色', '2026-04-18 21:15:20', 0.00);
INSERT INTO `order_items` VALUES (111, 131, 32, '春秋长袖针织连衣裙', NULL, 99.00, 1, '7XL', '灰色', '2026-04-18 21:19:34', 4.95);
INSERT INTO `order_items` VALUES (112, 132, 32, '春秋长袖针织连衣裙', NULL, 99.00, 1, '7XL', '灰色', '2026-04-18 21:22:05', 4.95);
INSERT INTO `order_items` VALUES (113, 133, 32, '春秋长袖针织连衣裙', NULL, 99.00, 1, '7XL', '灰色', '2026-04-18 21:22:59', 4.95);
INSERT INTO `order_items` VALUES (114, 134, 32, '春秋长袖针织连衣裙', NULL, 99.00, 1, '6XL', '灰色', '2026-04-20 15:03:18', 0.00);
INSERT INTO `order_items` VALUES (115, 135, 31, '法式复古长款连衣裙', NULL, 1888.00, 1, '6XL', '墨绿色', '2026-04-20 15:03:28', 0.00);
INSERT INTO `order_items` VALUES (116, 136, 31, '法式复古长款连衣裙', NULL, 1888.00, 1, '6XL', '墨绿色', '2026-04-20 15:03:43', 15.00);
INSERT INTO `order_items` VALUES (117, 137, 31, '法式复古长款连衣裙', NULL, 1888.00, 1, '6XL', '墨绿色', '2026-05-12 11:34:45', 0.00);
INSERT INTO `order_items` VALUES (118, 138, 31, '法式复古长款连衣裙', NULL, 1888.00, 1, '6XL', '墨绿色', '2026-05-12 11:34:56', 0.00);
INSERT INTO `order_items` VALUES (119, 139, 31, '法式复古长款连衣裙', NULL, 1888.00, 1, '6XL', '墨绿色', '2026-05-12 11:35:43', 0.00);
INSERT INTO `order_items` VALUES (120, 143, 31, '法式复古长款连衣裙', NULL, 1888.00, 1, '7XL', '墨绿色', '2026-05-16 18:21:41', 0.00);
INSERT INTO `order_items` VALUES (121, 144, 32, '春秋长袖针织连衣裙', NULL, 99.00, 1, '6XL', '黑色', '2026-05-16 18:24:15', 0.00);
INSERT INTO `order_items` VALUES (122, 145, 31, '法式复古长款连衣裙', NULL, 1888.00, 2, '7XL', '藏蓝色', '2026-05-16 18:24:51', 0.00);
INSERT INTO `order_items` VALUES (123, 146, 31, '法式复古长款连衣裙', NULL, 1888.00, 1, '7XL', '墨绿色', '2026-05-16 19:03:27', 0.00);
INSERT INTO `order_items` VALUES (124, 147, 31, '法式复古长款连衣裙', NULL, 1888.00, 1, '6XL', '墨绿色', '2026-05-20 18:00:59', 0.00);

-- ----------------------------
-- Table structure for order_returns
-- ----------------------------
DROP TABLE IF EXISTS `order_returns`;
CREATE TABLE `order_returns`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL COMMENT '订单ID',
  `user_id` int NOT NULL COMMENT '用户ID',
  `type` enum('refund','return_refund','exchange') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'refund' COMMENT '售后类型',
  `reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '退货原因',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '退货说明',
  `images` json NULL COMMENT '凭证图片',
  `status` tinyint NULL DEFAULT 1 COMMENT '1-待处理 2-已同意(待填写退货物流) 3-退货中 4-待退款 5-已完成 6-已拒绝',
  `return_logistics_company` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '退货物流公司',
  `return_tracking_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '退货物流单号',
  `new_color` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '换货-新颜色',
  `new_size` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '换货-新尺码',
  `refund_amount` decimal(10, 2) NULL DEFAULT NULL COMMENT '退款金额',
  `admin_id` int NULL DEFAULT NULL COMMENT '处理人ID',
  `processed_at` datetime NULL DEFAULT NULL COMMENT '处理时间',
  `shop_id` int NULL DEFAULT NULL COMMENT '店铺ID',
  `reject_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '拒绝原因',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `reship_logistics_company` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '重新发货物流公司',
  `reship_tracking_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '重新发货物流单号',
  `reshipped_at` datetime NULL DEFAULT NULL COMMENT '重新发货时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_order_id`(`order_id` ASC) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_type`(`type` ASC) USING BTREE,
  INDEX `idx_shop_id`(`shop_id` ASC) USING BTREE,
  CONSTRAINT `order_returns_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `order_returns_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 20 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of order_returns
-- ----------------------------
INSERT INTO `order_returns` VALUES (9, 108, 68, 'exchange', '其他原因', NULL, '[]', 5, '顺丰速运', 'SF64200801784460', '黑色', '7XL', 0.00, 55, '2026-04-17 18:06:19', 1, NULL, '2026-04-17 13:14:06', '2026-05-18 19:51:32', '圆通速递', 'YT64203792621974', '2026-04-17 18:06:19');
INSERT INTO `order_returns` VALUES (10, 124, 72, 'refund', '其他原因', NULL, '[]', 5, NULL, NULL, NULL, NULL, 99.00, NULL, '2026-04-18 19:56:33', 3, NULL, '2026-04-18 19:56:33', '2026-04-18 19:56:33', NULL, NULL, NULL);
INSERT INTO `order_returns` VALUES (11, 128, 72, 'refund', '不想要了', NULL, '[]', 5, NULL, NULL, NULL, NULL, 94.05, NULL, '2026-04-18 20:31:07', 3, NULL, '2026-04-18 20:31:07', '2026-04-18 20:31:07', NULL, NULL, NULL);
INSERT INTO `order_returns` VALUES (12, 129, 72, 'refund', '其他原因', NULL, '[]', 5, NULL, NULL, NULL, NULL, 94.05, NULL, '2026-04-18 21:14:21', 3, NULL, '2026-04-18 21:14:21', '2026-04-18 21:14:21', NULL, NULL, NULL);
INSERT INTO `order_returns` VALUES (13, 130, 72, 'return_refund', '不想要了', NULL, '[]', 5, '顺丰速运', 'SF65182217868554', NULL, NULL, 800.00, 57, '2026-04-18 21:17:30', 3, NULL, '2026-04-18 21:16:33', '2026-04-18 21:17:30', NULL, NULL, NULL);
INSERT INTO `order_returns` VALUES (14, 131, 72, 'return_refund', '不想要了', NULL, '[]', 5, '申通快递', 'ST65184805883010', NULL, NULL, 94.05, 57, '2026-04-18 21:21:40', 3, NULL, '2026-04-18 21:20:54', '2026-05-18 19:28:03', NULL, NULL, NULL);
INSERT INTO `order_returns` VALUES (15, 132, 72, 'refund', '不想要了', NULL, '[]', 5, NULL, NULL, NULL, NULL, 94.05, NULL, '2026-04-18 21:22:21', 3, NULL, '2026-04-18 21:22:21', '2026-04-18 21:22:21', NULL, NULL, NULL);
INSERT INTO `order_returns` VALUES (16, 133, 72, 'exchange', '发错货/漏发', NULL, '[]', 5, '顺丰速运', 'SF65186860928754', '黑色', '7XL', 0.00, 57, '2026-04-18 21:25:03', 3, NULL, '2026-04-18 21:24:04', '2026-05-18 19:51:32', '中通快递', 'ZT65187035927594', '2026-04-18 21:25:03');
INSERT INTO `order_returns` VALUES (17, 143, 68, 'return_refund', '其他原因', NULL, '[]', 2, NULL, NULL, NULL, NULL, 1888.00, 57, '2026-05-16 19:18:49', 3, NULL, '2026-05-16 19:02:23', '2026-05-16 19:18:49', NULL, NULL, NULL);
INSERT INTO `order_returns` VALUES (18, 146, 68, 'return_refund', '商品与描述不符', NULL, '[]', 2, NULL, NULL, NULL, NULL, 1888.00, 35, '2026-05-20 06:18:23', 3, NULL, '2026-05-16 19:19:29', '2026-05-20 06:18:23', NULL, NULL, NULL);
INSERT INTO `order_returns` VALUES (19, 145, 68, 'exchange', '', NULL, '[]', 5, '顺丰速运', 'SF89312272098043', '墨绿色', '7XL', 0.00, 57, '2026-05-16 19:34:03', 3, NULL, '2026-05-16 19:26:08', '2026-05-18 19:51:32', '韵达速递', 'YD89312432469106', '2026-05-16 19:34:03');

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `customer_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `address` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `total_amount` decimal(10, 2) NOT NULL,
  `status` tinyint NULL DEFAULT 1 COMMENT '订单状态：1-待支付 2-待发货 3-已发货 4-待收货 5-已完成 6-已取消 7-待退货审核 8-退货中 9-退货已收到 10-已退款 11-退货拒绝',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `logistics_company` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '物流公司',
  `tracking_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '物流单号',
  `shipped_at` datetime NULL DEFAULT NULL COMMENT '发货时间',
  `expires_at` datetime NULL DEFAULT NULL COMMENT '订单过期时间',
  `original_amount` decimal(10, 2) NOT NULL DEFAULT 0.00,
  `refund_amount` decimal(10, 2) NULL DEFAULT NULL COMMENT '退款金额',
  `refund_status` tinyint NULL DEFAULT NULL COMMENT '退款状态',
  `return_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '退货原因',
  `return_logistics_company` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '退货物流公司',
  `return_tracking_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '退货物流单号',
  `return_shipped_at` datetime NULL DEFAULT NULL COMMENT '退货发货时间',
  `return_received_at` datetime NULL DEFAULT NULL COMMENT '退货收货时间',
  `refund_processed_at` datetime NULL DEFAULT NULL COMMENT '退款处理时间',
  `shop_id` int NULL DEFAULT NULL COMMENT '店铺ID，null表示平台订单',
  `payment_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '支付方式',
  `after_sale_type` enum('refund','return_refund','exchange') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '当前售后类型',
  `after_sale_id` int NULL DEFAULT NULL COMMENT '关联售后记录ID',
  `completed_at` datetime NULL DEFAULT NULL COMMENT '订单完成时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `order_no`(`order_no` ASC) USING BTREE,
  INDEX `fk_orders_user`(`user_id` ASC) USING BTREE,
  INDEX `idx_shop_id`(`shop_id` ASC) USING BTREE,
  INDEX `idx_orders_shop_id`(`shop_id` ASC) USING BTREE,
  INDEX `idx_after_sale_id`(`after_sale_id` ASC) USING BTREE,
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_orders_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 148 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of orders
-- ----------------------------
INSERT INTO `orders` VALUES (88, '20260401144123718340', 48, '秦月来', '13566897858', '黑龙江省哈尔滨市南岗区哈尔滨学院', 99.00, 2, '2026-04-01 14:41:23', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-01 14:56:23', 99.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, NULL, NULL, NULL, NULL);
INSERT INTO `orders` VALUES (89, '20260401144514375967', 48, '秦月来', '13566897858', '黑龙江省哈尔滨市南岗区哈尔滨学院', 99.00, 5, '2026-04-01 14:45:14', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-01 15:00:15', 99.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, NULL, NULL, NULL, '2026-04-05 20:39:27');
INSERT INTO `orders` VALUES (90, '20260405213452724816', 48, '秦月来', '13566897858', '黑龙江省哈尔滨市南岗区哈尔滨学院', 1888.00, 8, '2026-04-05 21:34:52', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-05 21:49:52', 1888.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'wechat', NULL, NULL, NULL);
INSERT INTO `orders` VALUES (91, '20260405215952496177', 48, '秦月来', '13566897858', '黑龙江省哈尔滨市南岗区哈尔滨学院', 1888.00, 8, '2026-04-05 21:59:52', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-05 22:14:52', 1888.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'alipay', NULL, NULL, NULL);
INSERT INTO `orders` VALUES (92, '20260405220245306440', 48, '秦月来', '13566897858', '黑龙江省哈尔滨市南岗区哈尔滨学院', 99.00, 4, '2026-04-05 22:02:45', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-05 22:17:46', 99.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'alipay', NULL, NULL, NULL);
INSERT INTO `orders` VALUES (93, '20260405220833043669', 48, '秦月来', '13566897858', '黑龙江省哈尔滨市南岗区哈尔滨学院', 99.00, 8, '2026-04-05 22:08:33', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-05 22:23:34', 99.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'alipay', NULL, NULL, NULL);
INSERT INTO `orders` VALUES (94, '20260409204832299027', 48, '秦月来', '13566897858', '黑龙江省哈尔滨市南岗区哈尔滨学院', 99.00, 3, '2026-04-09 20:48:32', '2026-05-18 19:28:03', '圆通速递', 'YT414814102918', '2026-05-14 14:52:01', '2026-04-09 21:03:32', 99.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'wechat', NULL, NULL, NULL);
INSERT INTO `orders` VALUES (95, '20260409205857364126', 48, '秦月来', '13566897858', '黑龙江省哈尔滨市南岗区哈尔滨学院', 99.00, 2, '2026-04-09 20:58:57', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-09 21:13:58', 99.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'alipay', NULL, NULL, NULL);
INSERT INTO `orders` VALUES (96, '20260409210044923549', 48, '秦月来', '13566897858', '黑龙江省哈尔滨市南岗区哈尔滨学院', 99.00, 2, '2026-04-09 21:00:44', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-09 21:15:44', 99.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'alipay', NULL, NULL, NULL);
INSERT INTO `orders` VALUES (97, '20260411181700525370', 1, NULL, NULL, NULL, 100.00, 5, '2026-04-11 18:17:00', '2026-05-16 19:10:40', NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `orders` VALUES (98, '20260413161755856201', 48, '秦月来', '13566897858', '黑龙江省哈尔滨市南岗区哈尔滨学院', 94.05, 2, '2026-04-13 16:17:55', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-13 16:32:55', 99.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'alipay', NULL, NULL, NULL);
INSERT INTO `orders` VALUES (99, '20260413210507704899', 48, '秦月来', '13566897858', '黑龙江省哈尔滨市南岗区哈尔滨学院', 88.00, 2, '2026-04-13 21:05:07', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-13 21:20:07', 99.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'alipay', NULL, NULL, NULL);
INSERT INTO `orders` VALUES (100, '20260414193854955889', 48, '秦月来', '13566897858', '黑龙江省哈尔滨市南岗区哈尔滨学院', 1873.00, 2, '2026-04-14 19:38:54', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-14 19:53:55', 1888.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'wechat', NULL, NULL, NULL);
INSERT INTO `orders` VALUES (101, '20260415093153664751', 68, '李雨桐', '15246151515', '黑龙江省哈尔滨市南岗区哈尔滨学院', 120.00, 6, '2026-04-15 09:31:53', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-15 09:49:22', 120.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, NULL, NULL, NULL, NULL);
INSERT INTO `orders` VALUES (102, '20260415093153456087', 68, '李雨桐', '15246151515', '黑龙江省哈尔滨市南岗区哈尔滨学院', 1838.00, 6, '2026-04-15 09:31:53', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-15 09:49:22', 1888.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, NULL, NULL, NULL, NULL);
INSERT INTO `orders` VALUES (103, '20260415101806286181', 68, '李雨桐', '15246151515', '黑龙江省哈尔滨市南岗区哈尔滨学院', 80.00, 2, '2026-04-15 10:18:06', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-15 10:33:06', 80.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 'alipay', NULL, NULL, NULL);
INSERT INTO `orders` VALUES (104, '20260415101806062647', 68, '李雨桐', '15246151515', '黑龙江省哈尔滨市南岗区哈尔滨学院', 1838.00, 6, '2026-04-15 10:18:06', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-15 10:35:42', 1888.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, NULL, NULL, NULL, NULL);
INSERT INTO `orders` VALUES (105, '20260415102644454690', 68, '李雨桐', '15246151515', '黑龙江省哈尔滨市南岗区哈尔滨学院', 105.00, 6, '2026-04-15 10:26:44', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-15 10:45:42', 120.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, NULL, NULL, NULL, NULL);
INSERT INTO `orders` VALUES (106, '20260415102644085512', 68, '李雨桐', '15246151515', '黑龙江省哈尔滨市南岗区哈尔滨学院', 1873.00, 6, '2026-04-15 10:26:44', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-15 10:45:42', 1888.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, NULL, NULL, NULL, NULL);
INSERT INTO `orders` VALUES (107, '20260415113908063489', 68, '李雨桐', '15246151515', '黑龙江省哈尔滨市南岗区哈尔滨学院', 80.00, 5, '2026-04-15 11:39:08', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-15 11:54:08', 100.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'alipay', NULL, NULL, '2026-04-15 12:29:32');
INSERT INTO `orders` VALUES (108, '20260415114143060912', 68, '李雨桐', '15246151515', '黑龙江省哈尔滨市南岗区哈尔滨学院', 100.00, 5, '2026-04-15 11:41:43', '2026-05-18 19:28:03', '圆通速递', 'YT64203792621974', '2026-04-17 18:06:19', '2026-04-15 11:56:43', 100.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'alipay', NULL, NULL, '2026-04-17 18:06:26');
INSERT INTO `orders` VALUES (109, '20260415114143114090', 68, '李雨桐', '15246151515', '黑龙江省哈尔滨市南岗区哈尔滨学院', 1873.00, 2, '2026-04-15 11:41:43', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-15 11:56:43', 1888.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'alipay', NULL, NULL, NULL);
INSERT INTO `orders` VALUES (110, '20260415145755387716', 72, '张海明', '15246156365', '黑龙江省哈尔滨市道里区哈尔滨学院', 120.00, 2, '2026-04-15 14:57:55', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-15 15:12:55', 120.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 'wechat', NULL, NULL, NULL);
INSERT INTO `orders` VALUES (111, '20260415145755596312', 72, '张海明', '15246156365', '黑龙江省哈尔滨市道里区哈尔滨学院', 1838.00, 3, '2026-04-15 14:57:55', '2026-05-16 19:10:40', '顺丰速运', 'SF031470489283', '2026-04-16 09:32:27', '2026-04-15 15:12:55', 1888.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'wechat', NULL, NULL, NULL);
INSERT INTO `orders` VALUES (112, '20260415151715818410', 74, '张云海', '15246956565', '黑龙江省哈尔滨市道里区哈尔滨学院', 1838.00, 5, '2026-04-15 15:17:15', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-15 15:32:16', 1888.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'alipay', NULL, NULL, '2026-04-15 15:18:44');
INSERT INTO `orders` VALUES (114, '20260416144619303115', 76, '测试用户', '13800138001', '{\"name\":\"测试用户\",\"phone\":\"13800138001\",\"address\":\"测试地址\"}', 1888.00, 6, '2026-04-16 14:46:19', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-16 15:01:31', 1888.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, NULL, NULL, NULL, NULL);
INSERT INTO `orders` VALUES (115, '20260416144709060348', 76, '测试用户', '13800138001', '{\"name\":\"测试用户\",\"phone\":\"13800138001\",\"address\":\"测试地址\"}', 1888.00, 6, '2026-04-16 14:47:09', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-16 15:06:31', 1888.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, NULL, NULL, NULL, NULL);
INSERT INTO `orders` VALUES (116, '20260416144738392393', 76, '测试用户', '13800138001', '{\"name\":\"测试用户\",\"phone\":\"13800138001\",\"address\":\"测试地址\"}', 1888.00, 6, '2026-04-16 14:47:38', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-16 15:06:31', 1888.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, NULL, NULL, NULL, NULL);
INSERT INTO `orders` VALUES (117, '20260416144811780923', 76, '测试用户', '13800138001', '{\"name\":\"测试用户\",\"phone\":\"13800138001\",\"address\":\"测试地址\"}', 1888.00, 2, '2026-04-16 14:48:11', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-16 15:03:11', 1888.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, NULL, NULL, NULL, NULL);
INSERT INTO `orders` VALUES (118, '20260416144947727437', 76, '测试用户', '13800138001', '{\"name\":\"测试用户\",\"phone\":\"13800138001\",\"address\":\"测试地址\"}', 1888.00, 3, '2026-04-16 14:49:47', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-16 15:04:48', 1888.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, NULL, NULL, NULL, NULL);
INSERT INTO `orders` VALUES (119, '20260416145609294417', 76, '测试用户', '13800138001', '{\"name\":\"测试用户\",\"phone\":\"13800138001\",\"address\":\"测试地址\"}', 1888.00, 3, '2026-04-16 14:56:09', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-16 15:11:10', 1888.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, NULL, NULL, NULL, NULL);
INSERT INTO `orders` VALUES (120, '20260416183118289773', 76, '测试用户', '13800138001', '{\"name\":\"测试用户\",\"phone\":\"13800138001\",\"address\":\"测试地址\"}', 1888.00, 3, '2026-04-16 18:31:18', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-16 18:46:19', 1888.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, NULL, NULL, NULL, NULL);
INSERT INTO `orders` VALUES (121, '20260417193506565615', 68, '李雨桐', '15246151515', '黑龙江省哈尔滨市南岗区哈尔滨学院', 1838.00, 5, '2026-04-17 19:35:06', '2026-05-16 19:10:40', '中通快递', 'ZT257325131903', '2026-04-17 19:35:33', '2026-04-17 19:50:06', 1888.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'alipay', NULL, NULL, '2026-04-17 19:35:48');
INSERT INTO `orders` VALUES (122, '20260417201717958757', 68, '李雨桐', '15246151515', '黑龙江省哈尔滨市南岗区哈尔滨学院', 99.00, 2, '2026-04-17 20:17:17', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-17 20:32:18', 99.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'alipay', NULL, NULL, NULL);
INSERT INTO `orders` VALUES (123, '20260418090550096942', 68, '李雨桐', '15246151515', '黑龙江省哈尔滨市南岗区哈尔滨学院', 99.00, 2, '2026-04-18 09:05:50', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-18 09:20:50', 99.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'alipay', NULL, NULL, NULL);
INSERT INTO `orders` VALUES (124, '20260418195224608438', 72, '张海明', '15246156365', '黑龙江省哈尔滨市道里区哈尔滨学院', 99.00, 10, '2026-04-18 19:52:24', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-18 20:07:25', 99.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'alipay', 'refund', 10, NULL);
INSERT INTO `orders` VALUES (125, '20260418201358751364', 72, '张海明', '15246156365', '黑龙江省哈尔滨市道里区哈尔滨学院', 99.00, 2, '2026-04-18 20:13:58', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-18 20:28:59', 99.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'alipay', NULL, NULL, NULL);
INSERT INTO `orders` VALUES (126, '20260418201657931507', 72, '张海明', '15246156365', '黑龙江省哈尔滨市道里区哈尔滨学院', 99.00, 2, '2026-04-18 20:16:57', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-18 20:31:57', 99.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'alipay', NULL, NULL, NULL);
INSERT INTO `orders` VALUES (127, '20260418202406403443', 72, '张海明', '15246156365', '黑龙江省哈尔滨市道里区哈尔滨学院', 99.00, 2, '2026-04-18 20:24:06', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-18 20:39:06', 99.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'alipay', NULL, NULL, NULL);
INSERT INTO `orders` VALUES (128, '20260418203034222693', 72, '张海明', '15246156365', '黑龙江省哈尔滨市道里区哈尔滨学院', 94.05, 10, '2026-04-18 20:30:34', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-18 20:45:34', 99.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'alipay', 'refund', 11, NULL);
INSERT INTO `orders` VALUES (129, '20260418211409903137', 72, '张海明', '15246156365', '黑龙江省哈尔滨市道里区哈尔滨学院', 94.05, 10, '2026-04-18 21:14:09', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-18 21:29:09', 99.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'alipay', 'refund', 12, NULL);
INSERT INTO `orders` VALUES (130, '20260418211520847607', 72, '张海明', '15246156365', '黑龙江省哈尔滨市道里区哈尔滨学院', 800.00, 10, '2026-04-18 21:15:20', '2026-05-16 19:10:40', '申通快递', 'ST181567318175', '2026-04-18 21:15:57', '2026-04-18 21:30:21', 800.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'wechat', 'return_refund', 13, '2026-04-18 21:16:18');
INSERT INTO `orders` VALUES (131, '20260418211934528625', 72, '张海明', '15246156365', '黑龙江省哈尔滨市道里区哈尔滨学院', 94.05, 10, '2026-04-18 21:19:34', '2026-05-16 19:10:40', '申通快递', 'ST184153105685', '2026-04-18 21:20:15', '2026-04-18 21:34:34', 99.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'wechat', 'return_refund', 14, '2026-04-18 21:20:36');
INSERT INTO `orders` VALUES (132, '20260418212205100305', 72, '张海明', '15246156365', '黑龙江省哈尔滨市道里区哈尔滨学院', 94.05, 10, '2026-04-18 21:22:05', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-18 21:37:05', 99.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'wechat', 'refund', 15, NULL);
INSERT INTO `orders` VALUES (133, '20260418212259915650', 72, '张海明', '15246156365', '黑龙江省哈尔滨市道里区哈尔滨学院', 94.05, 5, '2026-04-18 21:22:59', '2026-05-18 19:28:03', '中通快递', 'ZT65187035927594', '2026-04-18 21:25:03', '2026-04-18 21:37:59', 99.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'wechat', NULL, NULL, '2026-04-18 21:25:17');
INSERT INTO `orders` VALUES (134, '20260420150318277337', 72, '张海明', '15246156365', '黑龙江省哈尔滨市道里区哈尔滨学院', 99.00, 6, '2026-04-20 15:03:18', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-20 15:19:11', 99.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, NULL, NULL, NULL, NULL);
INSERT INTO `orders` VALUES (135, '20260420150328639736', 72, '张海明', '15246156365', '黑龙江省哈尔滨市道里区哈尔滨学院', 1888.00, 6, '2026-04-20 15:03:28', '2026-05-16 19:10:40', NULL, NULL, NULL, '2026-04-20 15:19:11', 1888.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, NULL, NULL, NULL, NULL);
INSERT INTO `orders` VALUES (136, '20260420150343366668', 72, '张海明', '15246156365', '黑龙江省哈尔滨市道里区哈尔滨学院', 1873.00, 5, '2026-04-20 15:03:43', '2026-05-16 19:10:40', '顺丰速运', 'SF754786769607', '2026-04-20 16:57:59', '2026-04-20 15:18:43', 1888.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'wechat', NULL, NULL, '2026-04-20 19:03:42');
INSERT INTO `orders` VALUES (137, '20260512113445228734', 68, '李雨桐', '15246151515', '黑龙江省哈尔滨市南岗区哈尔滨学院', 1888.00, 6, '2026-05-12 11:34:45', '2026-05-12 11:54:20', NULL, NULL, NULL, '2026-05-12 11:54:20', 1888.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, NULL, NULL, NULL, NULL);
INSERT INTO `orders` VALUES (138, '20260512113456225409', 68, '李雨桐', '15246151515', '黑龙江省哈尔滨市南岗区哈尔滨学院', 1888.00, 6, '2026-05-12 11:34:56', '2026-05-12 11:54:20', NULL, NULL, NULL, '2026-05-12 11:54:20', 1888.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, NULL, NULL, NULL, NULL);
INSERT INTO `orders` VALUES (139, '20260512113543734692', 68, '李雨桐', '15246151515', '黑龙江省哈尔滨市南岗区哈尔滨学院', 1888.00, 6, '2026-05-12 11:35:43', '2026-05-12 11:54:20', NULL, NULL, NULL, '2026-05-12 11:54:20', 1888.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, NULL, NULL, NULL, NULL);
INSERT INTO `orders` VALUES (143, '20260516182140215008', 68, '李雨桐', '15246151515', '黑龙江省哈尔滨市南岗区哈尔滨学院', 1888.00, 7, '2026-05-16 18:21:41', '2026-05-18 19:28:03', '圆通速递', 'YT280867308714', '2026-05-16 18:41:27', '2026-05-16 18:36:41', 1888.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'wechat', 'return_refund', 17, NULL);
INSERT INTO `orders` VALUES (144, '20260516182415552188', 68, '李雨桐', '15246151515', '黑龙江省哈尔滨市南岗区哈尔滨学院', 99.00, 5, '2026-05-16 18:24:15', '2026-05-16 18:42:11', '顺丰速运', 'SF281029567505', '2026-05-16 18:41:43', '2026-05-16 18:39:15', 99.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'alipay', NULL, NULL, '2026-05-16 18:42:11');
INSERT INTO `orders` VALUES (145, '20260516182451095359', 68, '李雨桐', '15246151515', '黑龙江省哈尔滨市南岗区哈尔滨学院', 3776.00, 5, '2026-05-16 18:24:51', '2026-05-18 19:28:03', '韵达速递', 'YD89312432469106', '2026-05-16 19:34:03', '2026-05-16 18:39:52', 3776.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'alipay', NULL, NULL, '2026-05-16 19:34:16');
INSERT INTO `orders` VALUES (146, '20260516190327894960', 68, '李雨桐', '15246151515', '黑龙江省哈尔滨市南岗区哈尔滨学院', 1888.00, 7, '2026-05-16 19:03:27', '2026-05-16 19:19:29', '京东物流', 'JD294273497361', '2026-05-16 19:03:47', '2026-05-16 19:18:28', 1888.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'alipay', 'return_refund', 18, NULL);
INSERT INTO `orders` VALUES (147, '20260520180059542255', 68, '李雨桐', '15246151515', '黑龙江省哈尔滨市南岗区哈尔滨学院', 1888.00, 3, '2026-05-20 18:00:59', '2026-05-20 19:32:02', '顺丰速运', 'SF767133703276', '2026-05-20 19:32:02', '2026-05-20 18:15:59', 1888.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'alipay', NULL, NULL, NULL);

-- ----------------------------
-- Table structure for payments
-- ----------------------------
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL COMMENT '订单ID',
  `user_id` int NOT NULL COMMENT '用户ID',
  `amount` decimal(10, 2) NOT NULL COMMENT '支付金额',
  `payment_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '支付方式',
  `transaction_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '交易流水号',
  `payment_time` datetime NOT NULL COMMENT '支付时间',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_transaction_id`(`transaction_id` ASC) USING BTREE,
  INDEX `idx_order_id`(`order_id` ASC) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 37 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of payments
-- ----------------------------
INSERT INTO `payments` VALUES (1, 90, 48, 1888.00, 'wechat', '96093233ZJJVU5WE', '2026-04-05 21:34:53', '2026-04-05 21:34:53');
INSERT INTO `payments` VALUES (2, 91, 48, 1888.00, 'alipay', '97593712KPRZTU73', '2026-04-05 21:59:54', '2026-04-05 21:59:53');
INSERT INTO `payments` VALUES (3, 92, 48, 99.00, 'alipay', '97766806KTZ4OXVJ', '2026-04-05 22:02:47', '2026-04-05 22:02:46');
INSERT INTO `payments` VALUES (4, 93, 48, 99.00, 'alipay', '98114740T8NS0UJD', '2026-04-05 22:08:35', '2026-04-05 22:08:34');
INSERT INTO `payments` VALUES (5, 94, 48, 99.00, 'wechat', '3891335977UD38LE', '2026-04-09 20:48:33', '2026-04-09 20:48:33');
INSERT INTO `payments` VALUES (6, 95, 48, 99.00, 'alipay', '39539134FHK6PR74', '2026-04-09 20:58:59', '2026-04-09 20:58:59');
INSERT INTO `payments` VALUES (7, 96, 48, 99.00, 'alipay', '39645531ZIFEB5LN', '2026-04-09 21:00:46', '2026-04-09 21:00:45');
INSERT INTO `payments` VALUES (8, 98, 48, 94.05, 'alipay', '68276323UEDC4VX0', '2026-04-13 16:17:56', '2026-04-13 16:17:56');
INSERT INTO `payments` VALUES (9, 99, 48, 88.00, 'alipay', '85508476DAFNOTY9', '2026-04-13 21:05:08', '2026-04-13 21:05:08');
INSERT INTO `payments` VALUES (10, 100, 48, 1873.00, 'wechat', '66735858YN2CNMU1', '2026-04-14 19:38:56', '2026-04-14 19:38:55');
INSERT INTO `payments` VALUES (11, 103, 68, 80.00, 'alipay', '19610277GRFXVYN4', '2026-04-15 10:20:10', '2026-04-15 10:20:10');
INSERT INTO `payments` VALUES (12, 107, 68, 80.00, 'alipay', '24352657JCQBG67T', '2026-04-15 11:39:13', '2026-04-15 11:39:12');
INSERT INTO `payments` VALUES (13, 108, 68, 100.00, 'alipay', '24691930C7AQCYJ6', '2026-04-15 11:44:52', '2026-04-15 11:44:51');
INSERT INTO `payments` VALUES (14, 109, 68, 1873.00, 'alipay', '24715565CKJAOKDS', '2026-04-15 11:45:16', '2026-04-15 11:45:15');
INSERT INTO `payments` VALUES (15, 110, 72, 120.00, 'wechat', '36290812NK3P5OSA', '2026-04-15 14:58:11', '2026-04-15 14:58:10');
INSERT INTO `payments` VALUES (16, 111, 72, 1838.00, 'wechat', '36306673NT3LPL1O', '2026-04-15 14:58:27', '2026-04-15 14:58:26');
INSERT INTO `payments` VALUES (17, 112, 74, 1838.00, 'alipay', '37440866H7FV9171', '2026-04-15 15:17:21', '2026-04-15 15:17:20');
INSERT INTO `payments` VALUES (18, 121, 68, 1838.00, 'alipay', '25710545N1QSGFO3', '2026-04-17 19:35:11', '2026-04-17 19:35:10');
INSERT INTO `payments` VALUES (19, 122, 68, 99.00, 'alipay', '28296906CTEL91NO', '2026-04-17 20:18:17', '2026-04-17 20:18:16');
INSERT INTO `payments` VALUES (20, 123, 68, 99.00, 'alipay', '74359567PBW5GMWF', '2026-04-18 09:06:00', '2026-04-18 09:05:59');
INSERT INTO `payments` VALUES (21, 124, 72, 99.00, 'alipay', '13149460N3JXFD28', '2026-04-18 19:52:29', '2026-04-18 19:52:29');
INSERT INTO `payments` VALUES (22, 125, 72, 99.00, 'alipay', '14442819KWL9PUQ7', '2026-04-18 20:14:03', '2026-04-18 20:14:02');
INSERT INTO `payments` VALUES (23, 126, 72, 99.00, 'alipay', '14621209TCFUC7IG', '2026-04-18 20:17:01', '2026-04-18 20:17:01');
INSERT INTO `payments` VALUES (24, 127, 72, 99.00, 'alipay', '150510527EN9W6V6', '2026-04-18 20:24:11', '2026-04-18 20:24:11');
INSERT INTO `payments` VALUES (25, 128, 72, 94.05, 'alipay', '154383176BEW9JTD', '2026-04-18 20:30:38', '2026-04-18 20:30:38');
INSERT INTO `payments` VALUES (26, 129, 72, 94.05, 'alipay', '1805303965CMPNAY', '2026-04-18 21:14:13', '2026-04-18 21:14:13');
INSERT INTO `payments` VALUES (27, 130, 72, 800.00, 'wechat', '18124900GNSIM7F9', '2026-04-18 21:15:25', '2026-04-18 21:15:24');
INSERT INTO `payments` VALUES (28, 131, 72, 94.05, 'wechat', '18378371JJS15LZ7', '2026-04-18 21:19:38', '2026-04-18 21:19:38');
INSERT INTO `payments` VALUES (29, 132, 72, 94.05, 'wechat', '1852904245JSWIIW', '2026-04-18 21:22:09', '2026-04-18 21:22:09');
INSERT INTO `payments` VALUES (30, 133, 72, 94.05, 'wechat', '18583480YQSBIOD2', '2026-04-18 21:23:03', '2026-04-18 21:23:03');
INSERT INTO `payments` VALUES (31, 136, 72, 1873.00, 'wechat', '68630257T71RPKFZ', '2026-04-20 15:03:50', '2026-04-20 15:03:50');
INSERT INTO `payments` VALUES (32, 143, 68, 1888.00, 'wechat', '26905258N8YWSMHV', '2026-05-16 18:21:45', '2026-05-16 18:21:45');
INSERT INTO `payments` VALUES (33, 144, 68, 99.00, 'alipay', '27059609U4UU5X08', '2026-05-16 18:24:20', '2026-05-16 18:24:19');
INSERT INTO `payments` VALUES (34, 145, 68, 3776.00, 'alipay', '270957794CX9QRUI', '2026-05-16 18:24:56', '2026-05-16 18:24:55');
INSERT INTO `payments` VALUES (35, 146, 68, 1888.00, 'alipay', '29411791J5YX9AAI', '2026-05-16 19:03:32', '2026-05-16 19:03:31');
INSERT INTO `payments` VALUES (36, 147, 68, 1888.00, 'alipay', '71269011T56ZYWRS', '2026-05-20 18:01:09', '2026-05-20 18:01:09');

-- ----------------------------
-- Table structure for permissions
-- ----------------------------
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `menu_id` int UNSIGNED NOT NULL COMMENT '关联的菜单ID',
  `code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '权限代码，如 product:view',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '权限名称，如 查看商品',
  `description` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '权限描述',
  `type` enum('button','api','menu') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'button' COMMENT '权限类型',
  `sort` int UNSIGNED NULL DEFAULT 0 COMMENT '排序号',
  `status` tinyint UNSIGNED NULL DEFAULT 1 COMMENT '状态：0禁用 1启用',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE,
  UNIQUE INDEX `idx_code_unique`(`code` ASC) USING BTREE,
  INDEX `idx_menu_id`(`menu_id` ASC) USING BTREE,
  INDEX `idx_code`(`code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 55 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '功能点表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of permissions
-- ----------------------------
INSERT INTO `permissions` VALUES (1, 1, 'dashboard:view', '查看控制台', '查看数据概览', 'button', 1, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (2, 3, 'product:view', '查看商品', '查看商品列表', 'button', 1, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (3, 3, 'product:create', '新增商品', '创建新商品', 'button', 2, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (4, 3, 'product:edit', '编辑商品', '编辑商品信息', 'button', 3, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (5, 3, 'product:delete', '删除商品', '删除商品', 'button', 4, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (6, 3, 'product:status', '上架/下架', '商品上架下架操作', 'button', 5, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (7, 4, 'category:view', '查看分类', '查看分类列表', 'button', 1, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (8, 4, 'category:create', '新增分类', '创建新分类', 'button', 2, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (9, 4, 'category:edit', '编辑分类', '编辑分类信息', 'button', 3, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (10, 4, 'category:delete', '删除分类', '删除分类', 'button', 4, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (11, 5, 'hot_product:view', '查看推荐', '查看热门推荐', 'button', 1, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (12, 5, 'hot_product:manage', '管理推荐', '管理热门推荐', 'button', 2, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (13, 6, 'new_product:view', '查看新品', '查看新品推荐', 'button', 1, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (14, 6, 'new_product:manage', '管理新品', '管理新品推荐', 'button', 2, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (15, 8, 'order:view', '查看订单', '查看订单列表', 'button', 1, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (16, 8, 'order:detail', '订单详情', '查看订单详情', 'button', 2, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (17, 8, 'order:edit', '编辑订单', '编辑订单信息', 'button', 3, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (18, 8, 'order:ship', '订单发货', '订单发货操作', 'button', 4, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (19, 8, 'order:refund', '订单退款', '订单退款操作', 'button', 5, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (20, 8, 'order:close', '关闭订单', '关闭订单', 'button', 6, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (21, 8, 'order:logistics', '物流管理', '物流信息管理', 'button', 7, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (22, 9, 'coupon:view', '查看优惠券', '查看优惠券列表', 'button', 1, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (23, 9, 'coupon:create', '新增优惠券', '创建新优惠券', 'button', 2, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (24, 9, 'coupon:edit', '编辑优惠券', '编辑优惠券信息', 'button', 3, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (25, 9, 'coupon:delete', '删除优惠券', '删除优惠券', 'button', 4, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (26, 9, 'coupon:issue', '发放优惠券', '发放优惠券给用户', 'button', 5, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (27, 10, 'review:view', '查看评价', '查看评价列表', 'button', 1, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (28, 10, 'review:audit', '评价审核', '审核评价', 'button', 2, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (29, 10, 'review:delete', '删除评价', '删除评价', 'button', 3, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (30, 12, 'user:view', '查看用户', '查看用户列表', 'button', 1, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (31, 12, 'user:detail', '用户详情', '查看用户详情', 'button', 2, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (32, 12, 'user:edit', '编辑用户', '编辑用户信息', 'button', 3, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (33, 12, 'user:freeze', '冻结/解冻', '冻结或解冻用户', 'button', 4, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (34, 12, 'user:delete', '删除用户', '删除用户', 'button', 5, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (35, 13, 'role:view', '查看角色', '查看角色列表', 'button', 1, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (36, 13, 'role:create', '新增角色', '创建新角色', 'button', 2, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (37, 13, 'role:edit', '编辑角色', '编辑角色信息', 'button', 3, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (38, 13, 'role:delete', '删除角色', '删除角色', 'button', 4, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (39, 14, 'merchant:view', '查看商家', '查看商家列表', 'button', 1, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (40, 14, 'merchant:review', '审核商家', '审核商家入驻申请', 'button', 2, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (41, 14, 'merchant:edit', '编辑商家', '编辑商家信息', 'button', 3, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (42, 14, 'merchant:delete', '删除商家', '删除商家', 'button', 4, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (43, 15, 'shop:view', '查看店铺', '查看店铺列表', 'button', 1, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (44, 15, 'shop:edit', '编辑店铺', '编辑店铺信息', 'button', 2, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (45, 17, 'discussion:view', '查看社区', '查看社区帖子', 'button', 1, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (46, 17, 'discussion:audit', '帖子审核', '审核帖子', 'button', 2, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (47, 17, 'discussion:delete', '删除帖子', '删除帖子', 'button', 3, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (48, 18, 'zone:view', '查看专区', '查看专区列表', 'button', 1, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (49, 18, 'zone:manage', '管理专区', '管理专区', 'button', 2, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (50, 20, 'conversation:view', '查看会话', '查看会话列表', 'button', 1, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (51, 20, 'conversation:chat', '在线沟通', '在线与用户沟通', 'button', 2, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (52, 20, 'conversation:history', '会话记录', '查看会话历史记录', 'button', 3, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (53, 21, 'statistics:view', '查看统计', '查看数据统计', 'button', 1, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');
INSERT INTO `permissions` VALUES (54, 21, 'statistics:export', '数据导出', '导出统计数据', 'button', 2, 1, '2026-03-31 21:37:55', '2026-03-31 21:37:55');

-- ----------------------------
-- Table structure for product_categories
-- ----------------------------
DROP TABLE IF EXISTS `product_categories`;
CREATE TABLE `product_categories`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `category_id` int NOT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_product_category`(`product_id` ASC, `category_id` ASC) USING BTREE,
  INDEX `category_id`(`category_id` ASC) USING BTREE,
  CONSTRAINT `product_categories_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `product_categories_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 102 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of product_categories
-- ----------------------------
INSERT INTO `product_categories` VALUES (84, 32, 169, '2026-04-14 20:59:42');
INSERT INTO `product_categories` VALUES (85, 33, 118, '2026-04-14 21:00:40');
INSERT INTO `product_categories` VALUES (86, 34, 182, '2026-04-15 08:16:32');
INSERT INTO `product_categories` VALUES (87, 35, 186, '2026-04-15 08:35:24');
INSERT INTO `product_categories` VALUES (88, 36, 183, '2026-04-15 08:42:33');
INSERT INTO `product_categories` VALUES (90, 37, 115, '2026-04-17 22:37:24');
INSERT INTO `product_categories` VALUES (96, 38, 169, '2026-05-14 14:29:39');
INSERT INTO `product_categories` VALUES (98, 39, 116, '2026-05-19 11:48:29');
INSERT INTO `product_categories` VALUES (100, 31, 68, '2026-05-20 18:08:40');
INSERT INTO `product_categories` VALUES (101, 42, 116, '2026-05-20 19:02:11');

-- ----------------------------
-- Table structure for product_skus
-- ----------------------------
DROP TABLE IF EXISTS `product_skus`;
CREATE TABLE `product_skus`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL COMMENT '商品 ID',
  `color` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '颜色',
  `size` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '尺码',
  `stock` int NULL DEFAULT 0 COMMENT '库存数量',
  `sku_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'SKU 编码（可选）',
  `status` tinyint NULL DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'SKU图片URL',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_sku`(`product_id` ASC, `color` ASC, `size` ASC) USING BTREE,
  INDEX `idx_product_id`(`product_id` ASC) USING BTREE,
  INDEX `idx_color`(`color` ASC) USING BTREE,
  INDEX `idx_size`(`size` ASC) USING BTREE,
  CONSTRAINT `product_skus_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 391 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '商品 SKU 库存表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of product_skus
-- ----------------------------
INSERT INTO `product_skus` VALUES (327, 31, '藏蓝色', '7XL', 47, NULL, 1, 'http://localhost:3000/uploads/product_1774879676892-837075160.png', '2026-03-30 22:08:12', '2026-05-16 18:24:51');
INSERT INTO `product_skus` VALUES (328, 31, '藏蓝色', '6XL', 3, NULL, 1, 'http://localhost:3000/uploads/product_1774879676892-837075160.png', '2026-03-30 22:08:12', '2026-05-20 18:08:40');
INSERT INTO `product_skus` VALUES (329, 31, '酒红色', '7XL', 50, NULL, 1, 'http://localhost:3000/uploads/product_1774879680109-398430218.png', '2026-03-30 22:08:12', '2026-03-30 22:08:12');
INSERT INTO `product_skus` VALUES (330, 31, '酒红色', '6XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1774879680109-398430218.png', '2026-03-30 22:08:12', '2026-03-30 22:08:12');
INSERT INTO `product_skus` VALUES (331, 31, '墨绿色', '7XL', 48, NULL, 1, 'http://localhost:3000/uploads/product_1774879672536-355350690.png', '2026-03-30 22:08:12', '2026-05-16 19:03:27');
INSERT INTO `product_skus` VALUES (332, 31, '墨绿色', '6XL', 0, NULL, 1, 'http://localhost:3000/uploads/product_1774879672536-355350690.png', '2026-03-30 22:08:12', '2026-05-20 18:07:46');
INSERT INTO `product_skus` VALUES (333, 32, '灰色', '6XL', 8, NULL, 1, 'http://localhost:3000/uploads/product_1774883857942-49149229.png', '2026-03-30 23:17:48', '2026-04-20 15:19:11');
INSERT INTO `product_skus` VALUES (334, 32, '灰色', '7XL', 9, NULL, 1, 'http://localhost:3000/uploads/product_1774883857942-49149229.png', '2026-03-30 23:17:48', '2026-04-18 21:22:59');
INSERT INTO `product_skus` VALUES (335, 32, '黑色', '6XL', 49, NULL, 1, 'http://localhost:3000/uploads/product_1774883861565-213929185.png', '2026-03-30 23:17:48', '2026-05-16 18:24:15');
INSERT INTO `product_skus` VALUES (336, 32, '黑色', '7XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1774883861565-213929185.png', '2026-03-30 23:17:48', '2026-03-30 23:17:48');
INSERT INTO `product_skus` VALUES (337, 33, '黑色', '5XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1775961258591-66980188.png', '2026-04-12 10:42:04', '2026-04-12 10:42:04');
INSERT INTO `product_skus` VALUES (338, 33, '黑色', '6XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1775961258591-66980188.png', '2026-04-12 10:42:04', '2026-04-12 10:42:04');
INSERT INTO `product_skus` VALUES (339, 33, '黑色', '7XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1775961258591-66980188.png', '2026-04-12 10:42:04', '2026-04-12 10:42:04');
INSERT INTO `product_skus` VALUES (340, 33, '藏蓝色', '5XL', 8, NULL, 1, 'http://localhost:3000/uploads/product_1775961196695-481311889.png', '2026-04-12 10:42:04', '2026-04-15 11:41:43');
INSERT INTO `product_skus` VALUES (341, 33, '藏蓝色', '6XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1775961196695-481311889.png', '2026-04-12 10:42:04', '2026-04-12 10:42:04');
INSERT INTO `product_skus` VALUES (342, 33, '藏蓝色', '7XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1775961196695-481311889.png', '2026-04-12 10:42:04', '2026-04-12 10:42:04');
INSERT INTO `product_skus` VALUES (343, 34, '黑色', '5XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776212164580-421358206.png', '2026-04-15 08:16:32', '2026-04-15 08:16:32');
INSERT INTO `product_skus` VALUES (344, 34, '黑色', '6XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776212164580-421358206.png', '2026-04-15 08:16:32', '2026-04-15 08:16:32');
INSERT INTO `product_skus` VALUES (345, 34, '黑色', '7XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776212164580-421358206.png', '2026-04-15 08:16:32', '2026-04-15 08:16:32');
INSERT INTO `product_skus` VALUES (346, 34, '白色', '5XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776212140513-928246206.png', '2026-04-15 08:16:32', '2026-04-15 08:16:32');
INSERT INTO `product_skus` VALUES (347, 34, '白色', '6XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776212140513-928246206.png', '2026-04-15 08:16:32', '2026-04-15 08:16:32');
INSERT INTO `product_skus` VALUES (348, 34, '白色', '7XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776212140513-928246206.png', '2026-04-15 08:16:32', '2026-04-15 08:16:32');
INSERT INTO `product_skus` VALUES (349, 35, '黑色', '3XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776213260129-82509964.webp', '2026-04-15 08:35:24', '2026-04-15 08:35:24');
INSERT INTO `product_skus` VALUES (350, 35, '黑色', '4XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776213260129-82509964.webp', '2026-04-15 08:35:24', '2026-04-15 08:35:24');
INSERT INTO `product_skus` VALUES (351, 35, '黑色', '5XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776213260129-82509964.webp', '2026-04-15 08:35:24', '2026-04-15 08:35:24');
INSERT INTO `product_skus` VALUES (352, 35, '白色', '3XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776213238586-333099702.webp', '2026-04-15 08:35:24', '2026-04-15 08:35:24');
INSERT INTO `product_skus` VALUES (353, 35, '白色', '4XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776213238586-333099702.webp', '2026-04-15 08:35:24', '2026-04-15 08:35:24');
INSERT INTO `product_skus` VALUES (354, 35, '白色', '5XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776213238586-333099702.webp', '2026-04-15 08:35:24', '2026-04-15 08:35:24');
INSERT INTO `product_skus` VALUES (355, 35, '灰色', '3XL', 9, NULL, 1, 'http://localhost:3000/uploads/product_1776213203439-998023870.webp', '2026-04-15 08:35:24', '2026-04-15 14:57:55');
INSERT INTO `product_skus` VALUES (356, 35, '灰色', '4XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776213203439-998023870.webp', '2026-04-15 08:35:24', '2026-04-15 08:35:24');
INSERT INTO `product_skus` VALUES (357, 35, '灰色', '5XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776213203439-998023870.webp', '2026-04-15 08:35:24', '2026-04-15 08:35:24');
INSERT INTO `product_skus` VALUES (358, 36, '白色', '4XL', 9, NULL, 1, 'http://localhost:3000/uploads/product_1776213668195-703343970.webp', '2026-04-15 08:42:33', '2026-04-15 10:18:06');
INSERT INTO `product_skus` VALUES (359, 36, '白色', '5XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776213668195-703343970.webp', '2026-04-15 08:42:33', '2026-04-15 08:42:33');
INSERT INTO `product_skus` VALUES (360, 36, '白色', '6XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776213668195-703343970.webp', '2026-04-15 08:42:33', '2026-04-15 08:42:33');
INSERT INTO `product_skus` VALUES (361, 36, '粉色', '4XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776213588022-32937319.webp', '2026-04-15 08:42:33', '2026-04-15 08:42:33');
INSERT INTO `product_skus` VALUES (362, 36, '粉色', '5XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776213588022-32937319.webp', '2026-04-15 08:42:33', '2026-04-15 08:42:33');
INSERT INTO `product_skus` VALUES (363, 36, '粉色', '6XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776213588022-32937319.webp', '2026-04-15 08:42:33', '2026-04-15 08:42:33');
INSERT INTO `product_skus` VALUES (364, 36, '黑色', '4XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776213711892-202969107.webp', '2026-04-15 08:42:33', '2026-04-15 08:42:33');
INSERT INTO `product_skus` VALUES (365, 36, '黑色', '5XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776213711892-202969107.webp', '2026-04-15 08:42:33', '2026-04-15 08:42:33');
INSERT INTO `product_skus` VALUES (366, 36, '黑色', '6XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776213711892-202969107.webp', '2026-04-15 08:42:33', '2026-04-15 08:42:33');
INSERT INTO `product_skus` VALUES (367, 37, '白色', '4XL', 10, NULL, 0, 'http://localhost:3000/uploads/product_1776436265406-752296013.webp', '2026-04-17 22:33:56', '2026-04-18 09:07:52');
INSERT INTO `product_skus` VALUES (368, 37, '白色', '5XL', 10, NULL, 0, 'http://localhost:3000/uploads/product_1776436265406-752296013.webp', '2026-04-17 22:33:56', '2026-04-18 09:07:52');
INSERT INTO `product_skus` VALUES (369, 38, '棕色', '5XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776474713935-645783652.webp', '2026-04-18 09:12:27', '2026-04-18 21:17:30');
INSERT INTO `product_skus` VALUES (370, 38, '棕色', '6XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776474713935-645783652.webp', '2026-04-18 09:12:27', '2026-04-18 09:12:27');
INSERT INTO `product_skus` VALUES (371, 38, '棕色', '7XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776474713935-645783652.webp', '2026-04-18 09:12:27', '2026-04-18 09:12:27');
INSERT INTO `product_skus` VALUES (372, 38, '黑色', '5XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776474745493-160410283.webp', '2026-04-18 09:12:27', '2026-04-18 09:12:27');
INSERT INTO `product_skus` VALUES (373, 38, '黑色', '6XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776474745493-160410283.webp', '2026-04-18 09:12:27', '2026-04-18 09:12:27');
INSERT INTO `product_skus` VALUES (374, 38, '黑色', '7XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776474745493-160410283.webp', '2026-04-18 09:12:27', '2026-04-18 09:12:27');
INSERT INTO `product_skus` VALUES (375, 39, '紫色', '3XL', 0, NULL, 1, 'http://localhost:3000/uploads/product_1776474819012-813045677.webp', '2026-04-18 09:13:46', '2026-05-14 12:41:56');
INSERT INTO `product_skus` VALUES (376, 39, '紫色', '4XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776474819012-813045677.webp', '2026-04-18 09:13:46', '2026-04-18 09:13:46');
INSERT INTO `product_skus` VALUES (377, 39, '紫色', '5XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776474819012-813045677.webp', '2026-04-18 09:13:46', '2026-04-18 09:13:46');
INSERT INTO `product_skus` VALUES (378, 39, '紫色', '6XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776474819012-813045677.webp', '2026-04-18 09:13:46', '2026-04-18 09:13:46');
INSERT INTO `product_skus` VALUES (379, 39, '紫色', '7XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776474819012-813045677.webp', '2026-04-18 09:13:46', '2026-04-18 09:13:46');
INSERT INTO `product_skus` VALUES (380, 39, '蓝色', '3XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776474823622-299416511.webp', '2026-04-18 09:13:46', '2026-04-18 09:13:46');
INSERT INTO `product_skus` VALUES (381, 39, '蓝色', '4XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776474823622-299416511.webp', '2026-04-18 09:13:46', '2026-04-18 09:13:46');
INSERT INTO `product_skus` VALUES (382, 39, '蓝色', '5XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776474823622-299416511.webp', '2026-04-18 09:13:46', '2026-04-18 09:13:46');
INSERT INTO `product_skus` VALUES (383, 39, '蓝色', '6XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776474823622-299416511.webp', '2026-04-18 09:13:46', '2026-04-18 09:13:46');
INSERT INTO `product_skus` VALUES (384, 39, '蓝色', '7XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1776474823622-299416511.webp', '2026-04-18 09:13:46', '2026-04-18 09:13:46');
INSERT INTO `product_skus` VALUES (385, 42, '黑色', '4XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1779273517345-53672434.webp', '2026-05-20 19:02:11', '2026-05-20 19:02:11');
INSERT INTO `product_skus` VALUES (386, 42, '黑色', '5XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1779273517345-53672434.webp', '2026-05-20 19:02:11', '2026-05-20 19:02:11');
INSERT INTO `product_skus` VALUES (387, 42, '黑色', '6XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1779273517345-53672434.webp', '2026-05-20 19:02:11', '2026-05-20 19:02:11');
INSERT INTO `product_skus` VALUES (388, 42, '白色', '4XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1779273508248-757071557.webp', '2026-05-20 19:02:11', '2026-05-20 19:02:11');
INSERT INTO `product_skus` VALUES (389, 42, '白色', '5XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1779273508248-757071557.webp', '2026-05-20 19:02:11', '2026-05-20 19:02:11');
INSERT INTO `product_skus` VALUES (390, 42, '白色', '6XL', 10, NULL, 1, 'http://localhost:3000/uploads/product_1779273508248-757071557.webp', '2026-05-20 19:02:11', '2026-05-20 19:02:11');

-- ----------------------------
-- Table structure for products
-- ----------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10, 2) NOT NULL,
  `image` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `stock` int NULL DEFAULT 0,
  `sizes` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `colors` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `size_chart` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `size_recommendations` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '尺码推荐建议',
  `fit_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `category_id` int NULL DEFAULT NULL,
  `status` tinyint NULL DEFAULT 1,
  `deleted` tinyint NULL DEFAULT 0 COMMENT '是否已删除：0=未删除，1=已删除',
  `deleted_at` datetime NULL DEFAULT NULL COMMENT '删除时间',
  `show_size_chart` tinyint(1) NULL DEFAULT 1 COMMENT '是否显示尺码对照表',
  `show_fit_guide` tinyint(1) NULL DEFAULT 1 COMMENT '是否显示版型说明',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `images` json NULL COMMENT '商品多图',
  `shop_id` int NULL DEFAULT NULL COMMENT '店铺ID，null表示平台商品',
  `tags` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '商品标签（JSON 格式）',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_products_deleted`(`deleted` ASC) USING BTREE,
  INDEX `idx_shop_id`(`shop_id` ASC) USING BTREE,
  INDEX `idx_products_shop_id`(`shop_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 43 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of products
-- ----------------------------
INSERT INTO `products` VALUES (31, '法式复古长款连衣裙', 1888.00, 'http://localhost:3000/uploads/product_1774879618213-93651556.png', '复古风格连衣裙，在古堡中开茶话会的必选项~', 158, '7XL, 6XL', '藏蓝色,酒红色,墨绿色', NULL, NULL, 'regular', NULL, 1, 0, NULL, 1, 1, '2026-03-30 22:08:12', '2026-05-20 18:08:40', '[\"http://localhost:3000/uploads/product_1774879618213-93651556.png\", \"http://localhost:3000/uploads/product_1774879621284-933038749.png\"]', 3, '[]');
INSERT INTO `products` VALUES (32, '春秋长袖针织连衣裙', 99.00, 'http://localhost:3000/uploads/product_1774883842815-160123860.png', '连衣裙', 76, '6XL, 7XL', '灰色, 黑色', NULL, NULL, 'regular', NULL, 1, 0, NULL, 1, 1, '2026-03-30 23:17:48', '2026-05-16 18:24:15', '[\"http://localhost:3000/uploads/product_1774883842815-160123860.png\"]', 3, '[\"修身\",\"遮胯\",\"显高\",\"高弹力\",\"透气\"]');
INSERT INTO `products` VALUES (33, '纯棉基础款T恤', 100.00, 'http://localhost:3000/uploads/product_1775960884056-892330654.png', '纯棉T恤', 58, '5XL, 6XL, 7XL', '黑色,藏蓝色', NULL, '建议......', 'regular', NULL, 1, 0, NULL, 1, 1, '2026-04-12 10:42:04', '2026-04-15 11:41:43', '[\"http://localhost:3000/uploads/product_1775960884056-892330654.png\"]', 1, NULL);
INSERT INTO `products` VALUES (34, '长袖衬衫', 50.00, 'http://localhost:3000/uploads/product_1776211837106-211061665.png', '衬衫', 60, '5XL, 6XL, 7XL', '黑色, 白色', NULL, '正常', 'regular', NULL, 1, 0, NULL, 1, 1, '2026-04-15 08:16:32', '2026-04-15 08:16:32', '[\"http://localhost:3000/uploads/product_1776212043815-336094264.png\"]', 2, '[\"修身\",\"百搭\",\"透气\",\"通勤\",\"简约\",\"四季通用\"]');
INSERT INTO `products` VALUES (35, '几何印花衬衫', 120.00, 'http://localhost:3000/uploads/product_1776213081351-602455724.webp', '印花衬衫', 89, '3XL, 4XL, 5XL', '黑色, 白色, 灰色', NULL, '正常', 'regular', NULL, 1, 0, NULL, 1, 1, '2026-04-15 08:35:24', '2026-04-15 14:57:55', '[\"http://localhost:3000/uploads/product_1776213114446-515623310.webp\", \"http://localhost:3000/uploads/product_1776213164933-472324297.webp\"]', 2, '[\"宽松\",\"遮肚子\",\"苹果型\",\"高弹力\",\"V 领\",\"通勤\",\"春季\"]');
INSERT INTO `products` VALUES (36, 'V领T恤', 80.00, 'http://localhost:3000/uploads/product_1776213378243-175687483.webp', 'v领衬衫', 89, '4XL, 5XL, 6XL', '白色, 粉色, 黑色', NULL, '正常', 'regular', NULL, 1, 0, NULL, 1, 1, '2026-04-15 08:42:33', '2026-04-15 10:18:06', '[\"http://localhost:3000/uploads/product_1776213407226-175630818.webp\", \"http://localhost:3000/uploads/product_1776213530386-398980665.webp\"]', 2, '[\"修身\",\"大码通用\",\"V 领\",\"休闲\",\"夏季\",\"春季\"]');
INSERT INTO `products` VALUES (37, '简约纯色短袖A字连衣裙', 150.00, 'http://localhost:3000/uploads/product_1776436594033-251305253.webp', '简约纯色短袖A字连衣裙', 20, '4XL, 5XL', '白色', NULL, '正常', 'regular', NULL, 1, 1, '2026-04-18 09:07:52', 1, 1, '2026-04-17 22:33:56', '2026-04-18 09:07:52', '[]', 3, NULL);
INSERT INTO `products` VALUES (38, '商务长袖衬衫连衣裙', 800.00, 'http://localhost:3000/uploads/product_1776474686346-463803645.webp', '用一条连衣裙，穿出雷厉风行又不失优雅的专业气场。\n这条衬衫连衣裙，是专为现代职场女性设计的「高效单品」—— 一件搞定全身穿搭，省去搭配烦恼，却丝毫不失考究。', 60, '5XL, 6XL, 7XL', '棕色, 黑色', NULL, NULL, 'regular', NULL, 0, 0, NULL, 1, 1, '2026-04-18 09:12:27', '2026-05-14 14:29:39', '[\"http://localhost:3000/uploads/product_1776474686346-463803645.webp\"]', 3, '[]');
INSERT INTO `products` VALUES (39, '飘逸雪纺长裙', 600.00, 'http://localhost:3000/uploads/product_1776474785402-125821889.webp', '', 90, '3XL, 4XL, 5XL, 6XL, 7XL', '紫色, 蓝色', NULL, '2xl适合180cm，50kg左右消费者', 'slim', NULL, 1, 0, NULL, 1, 1, '2026-04-18 09:13:46', '2026-05-19 11:48:29', '[\"http://localhost:3000/uploads/product_1776474785402-125821889.webp\"]', 3, '[]');
INSERT INTO `products` VALUES (40, '韩式风格长裙', 188.00, '', '把韩系温柔的「氛围感」穿在身上，就是这条长裙存在的意义。\n裙身采用高支棉与天丝混纺的轻盈面料，触感软糯微凉，自带流畅垂坠感，走起路来裙摆如云朵般缓缓散开。\n小A字版型对身材的包容度极高，配合腰间细腻的本布系带，轻轻一挽就能勾勒出纤细腰线，同时藏起小肚腩和胯宽。\n领口用了经典的衬衫翻领设计，但弧度被调得更圆润，既能延长颈部线条，又保留了一丝慵懒的书卷气。', 0, '', '', NULL, NULL, 'regular', NULL, 1, 1, '2026-05-14 13:40:56', 1, 1, '2026-05-14 13:30:24', '2026-05-14 13:40:56', '[]', 3, '[]');
INSERT INTO `products` VALUES (41, '韩式温柔风长裙', 120.00, '', '把韩系温柔的「氛围感」穿在身上，就是这条长裙存在的意义。\n裙身采用高支棉与天丝混纺的轻盈面料，触感软糯微凉，自带流畅垂坠感，走起路来裙摆如云朵般缓缓散开。\n小A字版型对身材的包容度极高，配合腰间细腻的本布系带，轻轻一挽就能勾勒出纤细腰线，同时藏起小肚腩和胯宽。\n领口用了经典的衬衫翻领设计，但弧度被调得更圆润，既能延长颈部线条，又保留了一丝慵懒的书卷气。', 0, '', '', NULL, NULL, 'slim', NULL, 1, 1, '2026-05-14 13:51:36', 1, 1, '2026-05-14 13:51:34', '2026-05-14 13:51:36', '[]', 3, '[]');
INSERT INTO `products` VALUES (42, '欧洲流行连衣裙', 299.00, 'http://localhost:3000/uploads/product_1779273532009-112307169.webp', '欧洲2026年超流行连衣裙', 60, '4XL, 5XL, 6XL', '黑色, 白色', NULL, '3XL：适合身高 180-185cm，体重 70-75kg\n\n4XL：适合身高 185-190cm，体重 75-80kg\n\n5XL：适合身高 190-195cm，体重 80-85kg\n\n6XL：适合身高 195-200cm，体重 85-90kg\n\n7XL：适合身高 200-205cm，体重 90-95kg', 'loose', NULL, 1, 0, NULL, 1, 1, '2026-05-20 19:02:11', '2026-05-20 19:02:11', '[\"http://localhost:3000/uploads/product_1779273535192-31385314.webp\"]', 3, '[]');

-- ----------------------------
-- Table structure for reports
-- ----------------------------
DROP TABLE IF EXISTS `reports`;
CREATE TABLE `reports`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `discussion_id` int NOT NULL,
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint NULL DEFAULT 0 COMMENT '0-待审核 1-已处理 2-驳回',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  INDEX `discussion_id`(`discussion_id` ASC) USING BTREE,
  CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`discussion_id`) REFERENCES `discussions` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of reports
-- ----------------------------
INSERT INTO `reports` VALUES (9, 47, 6, '不好，吵到我了', 0, '2026-03-27 19:05:24', '2026-03-27 19:05:24');
INSERT INTO `reports` VALUES (10, 48, 8, '举报', 0, '2026-03-27 19:49:34', '2026-03-27 19:49:34');

-- ----------------------------
-- Table structure for return_attachments
-- ----------------------------
DROP TABLE IF EXISTS `return_attachments`;
CREATE TABLE `return_attachments`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `return_id` int NOT NULL COMMENT '退货记录ID',
  `file_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '图片路径',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_return_id`(`return_id` ASC) USING BTREE,
  CONSTRAINT `return_attachments_ibfk_1` FOREIGN KEY (`return_id`) REFERENCES `order_returns` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of return_attachments
-- ----------------------------

-- ----------------------------
-- Table structure for return_requests
-- ----------------------------
DROP TABLE IF EXISTS `return_requests`;
CREATE TABLE `return_requests`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL COMMENT '订单ID',
  `user_id` int NOT NULL COMMENT '买家用户ID',
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '退货原因',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '退货详细说明',
  `images` json NULL COMMENT '退货图片，JSON格式存储图片URL数组',
  `status` enum('pending','approved','rejected','returning','received','refunded') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'pending' COMMENT '退货状态',
  `admin_id` int NULL DEFAULT NULL COMMENT '处理管理员ID',
  `admin_note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '管理员备注',
  `logistics_company` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '退货物流公司',
  `logistics_no` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '退货物流单号',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_order_id`(`order_id` ASC) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  CONSTRAINT `return_requests_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `return_requests_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of return_requests
-- ----------------------------

-- ----------------------------
-- Table structure for review_replies
-- ----------------------------
DROP TABLE IF EXISTS `review_replies`;
CREATE TABLE `review_replies`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `review_id` int NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `review_id`(`review_id` ASC) USING BTREE,
  CONSTRAINT `review_replies_ibfk_1` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of review_replies
-- ----------------------------

-- ----------------------------
-- Table structure for reviews
-- ----------------------------
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '商品名称（冗余字段）',
  `product_snapshot` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '商品快照信息（JSON 格式）',
  `product_deleted` tinyint NULL DEFAULT 0 COMMENT '商品是否已删除：0=未删除，1=已删除',
  `order_item_id` int NULL DEFAULT NULL,
  `user_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户名',
  `rating` tinyint NOT NULL COMMENT '评分 1-5星',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '评价内容',
  `reply` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '商家回复',
  `images` json NULL COMMENT '评价图片，JSON格式存储图片URL数组',
  `status` tinyint NULL DEFAULT 1 COMMENT '状态 1-正常 0-隐藏',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `order_id`(`order_id` ASC) USING BTREE,
  INDEX `product_id`(`product_id` ASC) USING BTREE,
  INDEX `order_item_id`(`order_item_id` ASC) USING BTREE,
  INDEX `idx_reviews_product_deleted`(`product_deleted` ASC) USING BTREE,
  INDEX `idx_reviews_status_deleted`(`status` ASC, `product_deleted` ASC) USING BTREE,
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 18 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of reviews
-- ----------------------------
INSERT INTO `reviews` VALUES (13, 89, 32, NULL, NULL, 0, 71, '秦月来', 5, '', NULL, '[\"http://localhost:3000/uploads/review-1775394027793-708057027.png\"]', 1, '2026-04-05 21:00:59', '2026-04-05 21:00:59');
INSERT INTO `reviews` VALUES (14, 107, 33, NULL, NULL, 0, 88, '李雨桐', 5, '很好', NULL, '[\"http://localhost:3000/uploads/review-1776227744737-8257709.webp\"]', 1, '2026-04-15 12:36:07', '2026-04-15 12:36:07');
INSERT INTO `reviews` VALUES (15, 112, 31, NULL, NULL, 0, 93, '张云海', 5, '很好', NULL, '[\"http://localhost:3000/uploads/review-1776237534199-4833963.webp\"]', 1, '2026-04-15 15:19:23', '2026-04-15 15:19:23');
INSERT INTO `reviews` VALUES (16, 121, 31, NULL, NULL, 0, 101, '李雨桐', 5, '很合适', NULL, '[\"http://localhost:3000/uploads/review-1776425757053-790391699.webp\"]', 1, '2026-04-17 19:35:58', '2026-04-17 19:35:58');
INSERT INTO `reviews` VALUES (17, 133, 32, NULL, NULL, 0, 113, '张海明', 5, '很好', NULL, NULL, 1, '2026-04-18 21:25:24', '2026-04-18 21:25:24');

-- ----------------------------
-- Table structure for role_permissions
-- ----------------------------
DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `role_id` int UNSIGNED NOT NULL COMMENT '角色ID',
  `permission_id` int UNSIGNED NOT NULL COMMENT '功能点ID',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_role_permission`(`role_id` ASC, `permission_id` ASC) USING BTREE,
  INDEX `idx_role_id`(`role_id` ASC) USING BTREE,
  INDEX `idx_permission_id`(`permission_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 144 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '角色权限关联表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of role_permissions
-- ----------------------------
INSERT INTO `role_permissions` VALUES (1, 1, 1, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (2, 1, 2, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (3, 1, 3, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (4, 1, 4, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (5, 1, 5, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (6, 1, 6, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (7, 1, 7, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (8, 1, 8, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (9, 1, 9, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (10, 1, 10, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (11, 1, 11, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (12, 1, 12, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (13, 1, 13, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (14, 1, 14, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (15, 1, 15, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (16, 1, 16, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (17, 1, 17, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (18, 1, 18, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (19, 1, 19, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (20, 1, 20, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (21, 1, 21, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (22, 1, 22, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (23, 1, 23, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (24, 1, 24, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (25, 1, 25, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (26, 1, 26, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (27, 1, 27, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (28, 1, 28, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (29, 1, 29, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (30, 1, 30, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (31, 1, 31, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (32, 1, 32, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (33, 1, 33, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (34, 1, 34, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (35, 1, 35, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (36, 1, 36, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (37, 1, 37, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (38, 1, 38, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (39, 1, 39, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (40, 1, 40, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (41, 1, 41, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (42, 1, 42, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (43, 1, 43, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (44, 1, 44, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (45, 1, 45, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (46, 1, 46, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (47, 1, 47, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (48, 1, 48, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (49, 1, 49, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (50, 1, 50, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (51, 1, 51, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (52, 1, 52, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (53, 1, 53, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (54, 1, 54, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (64, 3, 8, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (65, 3, 9, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (66, 3, 7, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (67, 3, 23, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (68, 3, 25, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (69, 3, 24, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (70, 3, 26, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (71, 3, 22, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (72, 3, 1, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (73, 3, 46, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (74, 3, 47, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (75, 3, 45, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (76, 3, 12, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (77, 3, 11, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (78, 3, 14, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (79, 3, 13, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (80, 3, 20, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (81, 3, 16, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (82, 3, 17, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (83, 3, 21, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (84, 3, 19, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (85, 3, 18, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (86, 3, 15, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (87, 3, 3, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (88, 3, 4, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (89, 3, 6, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (90, 3, 2, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (91, 3, 28, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (92, 3, 29, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (93, 3, 27, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (94, 3, 54, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (95, 3, 53, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (96, 3, 49, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (97, 3, 48, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (127, 4, 7, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (128, 4, 51, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (129, 4, 52, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (130, 4, 50, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (131, 4, 22, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (132, 4, 1, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (133, 4, 45, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (134, 4, 11, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (135, 4, 13, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (136, 4, 16, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (137, 4, 15, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (138, 4, 2, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (139, 4, 27, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (140, 4, 53, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (141, 4, 31, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (142, 4, 30, '2026-03-31 21:37:55');
INSERT INTO `role_permissions` VALUES (143, 4, 48, '2026-03-31 21:37:55');

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色名称',
  `description` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '角色描述',
  `permissions` json NULL COMMENT '权限列表，JSON格式存储',
  `menus` json NULL COMMENT '菜单导航列表，JSON格式存储',
  `status` tinyint NULL DEFAULT 1 COMMENT '状态 1-启用 0-禁用',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `name`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of roles
-- ----------------------------
INSERT INTO `roles` VALUES (1, '超级管理员', '拥有系统所有权限', '[\"*\"]', '[\"/\", \"/products\", \"/categories\", \"/orders\", \"/reviews\", \"/roles\"]', 1, '2026-01-08 16:57:19', '2026-04-17 15:54:47');
INSERT INTO `roles` VALUES (2, '运营人员', '负责商品、订单、内容运营', '[\"dashboard:view\", \"product:view\", \"product:create\", \"product:edit\", \"product:status\", \"product:manage\", \"category:view\", \"category:create\", \"category:edit\", \"category:delete\", \"category:manage\", \"order:view\", \"order:detail\", \"order:edit\", \"order:ship\", \"order:refund\", \"order:close\", \"order:manage\", \"coupon:view\", \"coupon:create\", \"coupon:edit\", \"coupon:delete\", \"coupon:manage\", \"review:view\", \"review:audit\", \"review:manage\", \"statistics:view\"]', '[\"/\", \"/products\", \"/categories\", \"/orders\", \"/reviews\"]', 1, '2026-01-08 16:57:19', '2026-05-20 14:31:23');
INSERT INTO `roles` VALUES (3, '客服人员', '处理用户咨询、投诉、售后', '[\"dashboard:view\", \"conversation:view\", \"conversation:chat\", \"conversation:history\", \"conversation:manage\", \"conversation:close\", \"product:view\", \"category:view\", \"order:view\", \"order:detail\", \"review:view\", \"user:view\", \"user:detail\", \"statistics:view\"]', '[\"/orders\", \"/reviews\"]', 1, '2026-01-08 16:57:19', '2026-05-10 19:55:40');
INSERT INTO `roles` VALUES (5, '买家', '店铺运营者，负责商品管理和店铺运营', '[\"dashboard:view\", \"product:view\", \"product:create\", \"product:edit\", \"product:status\", \"category:view\", \"order:view\", \"order:detail\", \"order:ship\", \"order:close\", \"coupon:view\", \"coupon:create\", \"coupon:edit\", \"review:view\", \"statistics:view\"]', NULL, 1, '2026-01-09 11:00:27', '2026-05-21 21:28:17');
INSERT INTO `roles` VALUES (6, '商家', '商家用户，可以管理商品和订单', '[\"dashboard:view\", \"product:view\", \"product:create\", \"product:edit\", \"product:delete\", \"product:status\", \"category:view\", \"order:view\", \"order:detail\", \"order:edit\", \"order:ship\", \"order:refund\", \"order:close\", \"order:logistics\", \"coupon:view\", \"coupon:create\", \"coupon:edit\", \"coupon:delete\", \"review:view\", \"review:delete\", \"shop:view\", \"shop:edit\", \"statistics:view\"]', NULL, 1, '2026-03-29 10:00:48', '2026-05-16 19:18:10');

-- ----------------------------
-- Table structure for shop_follows
-- ----------------------------
DROP TABLE IF EXISTS `shop_follows`;
CREATE TABLE `shop_follows`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '用户ID',
  `shop_id` int NOT NULL COMMENT '店铺ID',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '关注时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_user_shop`(`user_id` ASC, `shop_id` ASC) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_shop_id`(`shop_id` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE,
  CONSTRAINT `shop_follows_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `shop_follows_ibfk_2` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '店铺关注表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of shop_follows
-- ----------------------------
INSERT INTO `shop_follows` VALUES (1, 48, 3, '2026-04-01 11:26:38');

-- ----------------------------
-- Table structure for shops
-- ----------------------------
DROP TABLE IF EXISTS `shops`;
CREATE TABLE `shops`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '商家用户ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '店铺名称',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '店铺描述',
  `license_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '营业执照号',
  `legal_person` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '法人姓名',
  `contact_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '联系电话',
  `contact_email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '联系邮箱',
  `logo_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '店铺logo',
  `banner_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '店铺横幅',
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'active' COMMENT '店铺状态：active-启用，inactive-禁用',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_brand` tinyint NULL DEFAULT 0 COMMENT '是否品牌店铺 0-否 1-是',
  `brand_certified_at` datetime NULL DEFAULT NULL COMMENT '品牌认证时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_is_brand`(`is_brand` ASC) USING BTREE,
  CONSTRAINT `shops_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 16 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of shops
-- ----------------------------
INSERT INTO `shops` VALUES (1, 55, '甄时尚大码服装店', '衣服宽一点，心就宽一点。宽心衣橱不想让你“遮肉”，只想让你“舒心”。我们精选宽松但不松垮的版型，藏肉的同时更藏住焦虑。你的衣橱，该让每一天都轻松。', '9111010812L4YYMUNP', '甄美丽', '13245668585', '13245668585@qq.com', NULL, NULL, 'active', '2026-03-29 22:19:56', '2026-04-15 11:36:23', 1, '2026-04-15 11:36:23');
INSERT INTO `shops` VALUES (2, 56, '宽心衣橱', '衣服宽一点，心就宽一点。我们不劝你“遮肉”，只想让你舒心。精选宽松但不松垮的版型，藏肉的同时更藏住焦虑。你的衣橱，该让每一天都轻松。', '914401061EDMT42KL9', '甄心大', '15246889895', '1524658787@qq.com', NULL, NULL, 'active', '2026-03-30 14:44:36', '2026-04-15 11:36:28', 0, NULL);
INSERT INTO `shops` VALUES (3, 57, '云朵大码', '像云朵一样柔软，像拥抱一样安心。专注亲肤、无压的面料，让你穿上的瞬间就放松下来。不勒肉、不闷汗，大码的舒适感，从一件“云朵衣”开始。', '91440106W6E0M75NXU', '甄云朵', '13245668989', '13245668989@qq.com', NULL, NULL, 'active', '2026-03-30 16:42:56', '2026-05-14 14:57:38', 1, '2026-04-14 16:48:55');
INSERT INTO `shops` VALUES (8, 62, '雅致大码妈妈装', '适合中年大码女性的气质女装，端庄大方，舒适耐穿，显年轻显气质。', '91110108C56NP6G9TO', '赵优雅', '13245661212', '13245661212@163.com', NULL, NULL, 'active', '2026-04-07 13:51:03', '2026-04-07 13:51:03', 0, NULL);
INSERT INTO `shops` VALUES (9, 63, '锦韵大码服饰', '中式改良、简约大气大码女装，适合日常、聚会、走亲访友', '913301086CLBR4AGCZ', '胡一帆', '13245661414', '13245661414@163.com', NULL, NULL, 'active', '2026-04-11 20:32:49', '2026-04-12 19:38:04', 0, NULL);
INSERT INTO `shops` VALUES (10, 64, '大码潮搭社', '集合当下流行元素，专为大码人群设计，显瘦又时髦', '91310115FNAB92K0L9', '甄时髦', '13245661313', '13245661313@163.com', NULL, NULL, 'active', '2026-04-11 20:33:00', '2026-04-12 19:38:05', 0, NULL);
INSERT INTO `shops` VALUES (11, 65, '宅享家居集合', '打造 “家里的温柔乡”。精选宽松家居服、毛绒拖鞋与舒适抱枕，风格温馨治愈。面料软糯透气，适合居家休憩与慵懒宅家，给生活一份温暖的拥抱。', '91440106D18MHCEHNA', '方宅宅', '13465859595', '13465859595@163.com', NULL, NULL, 'active', '2026-04-14 16:47:31', '2026-04-14 16:48:56', 1, '2026-04-14 16:48:56');
INSERT INTO `shops` VALUES (12, 69, '轻跃运动馆', '主打 “轻量运动风”。涵盖跑步、瑜伽、健身三大系列服饰，面料速干排汗，剪裁灵活不臃肿。无论身材如何，都能在运动中保持轻盈与活力，享受流汗的快乐。', '91310115HOKH1MB1TQ', '赵月月', '15246152525', '15246152525@163.com', NULL, NULL, 'active', '2026-04-15 11:37:07', '2026-05-20 08:14:49', 1, '2026-05-20 08:14:49');
INSERT INTO `shops` VALUES (13, 73, '依依大码服装', '11111111111', '913101155EWVDZW9QD', '赵明白', '15246152589', '15246152589@163.com', NULL, NULL, 'active', '2026-04-15 15:13:04', '2026-05-20 08:14:49', 1, '2026-05-20 08:14:49');
INSERT INTO `shops` VALUES (14, 75, '宽适鞋坊', '专门适配宽脚与大码人群的鞋店。提供版型宽松的帆布鞋、乐福鞋与老爹鞋，鞋头包容不挤脚，皮质柔软透气。颜值与脚感并存，让穿鞋不再是一种折磨。', '91440305LYLROL2HUA', '赵英俊', '15246253525', '15246253525@163.com', NULL, NULL, 'active', '2026-04-15 21:59:11', '2026-05-20 08:14:49', 1, '2026-05-20 08:14:49');
INSERT INTO `shops` VALUES (15, 77, '信赖服装', '1111111', '91110108TCADEIPF8X', '辛一苦', '15246152525', '15246152525@163.com', NULL, NULL, 'active', '2026-04-17 22:39:15', '2026-04-17 22:39:15', 0, NULL);

-- ----------------------------
-- Table structure for transaction_records
-- ----------------------------
DROP TABLE IF EXISTS `transaction_records`;
CREATE TABLE `transaction_records`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '用户 ID',
  `order_id` int NULL DEFAULT NULL COMMENT '关联订单 ID',
  `order_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '订单号',
  `type` enum('payment','refund') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '交易类型：payment-支付，refund-退款',
  `amount` decimal(10, 2) NOT NULL COMMENT '交易金额',
  `payment_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '支付方式',
  `status` enum('success','pending','failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'success' COMMENT '交易状态',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '交易描述',
  `transaction_time` datetime NULL DEFAULT NULL COMMENT '交易时间',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_order_id`(`order_id` ASC) USING BTREE,
  INDEX `idx_type`(`type` ASC) USING BTREE,
  INDEX `idx_transaction_time`(`transaction_time` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 46 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of transaction_records
-- ----------------------------
INSERT INTO `transaction_records` VALUES (1, 48, 90, '1775396092015467947', 'payment', 1888.00, 'wechat', 'success', '订单 1775396092015467947 支付成功', '2026-04-05 21:34:53', '2026-04-05 21:34:53');
INSERT INTO `transaction_records` VALUES (2, 48, 90, '1775396092015467947', 'refund', 1888.00, 'wallet', 'success', '订单退款', '2026-04-05 21:53:10', '2026-04-05 21:53:10');
INSERT INTO `transaction_records` VALUES (3, 48, 91, '1775397592492552226', 'payment', 1888.00, 'alipay', 'success', '订单 1775397592492552226 支付成功', '2026-04-05 21:59:54', '2026-04-05 21:59:53');
INSERT INTO `transaction_records` VALUES (4, 48, 91, '1775397592492552226', 'refund', 1888.00, 'original', 'success', '订单退款（待发货状态）', '2026-04-05 22:02:12', '2026-04-05 22:02:12');
INSERT INTO `transaction_records` VALUES (5, 48, 92, '1775397765593186741', 'payment', 99.00, 'alipay', 'success', '订单 1775397765593186741 支付成功', '2026-04-05 22:02:47', '2026-04-05 22:02:46');
INSERT INTO `transaction_records` VALUES (6, 48, 93, '1775398113532760049', 'payment', 99.00, 'alipay', 'success', '订单 1775398113532760049 支付成功', '2026-04-05 22:08:35', '2026-04-05 22:08:34');
INSERT INTO `transaction_records` VALUES (7, 48, 93, '1775398113532760049', 'refund', 99.00, 'original', 'success', '订单退款（待发货状态）', '2026-04-05 22:18:54', '2026-04-05 22:18:54');
INSERT INTO `transaction_records` VALUES (8, 48, 94, '1775738912154491377', 'payment', 99.00, 'wechat', 'success', '订单 1775738912154491377 支付成功', '2026-04-09 20:48:33', '2026-04-09 20:48:33');
INSERT INTO `transaction_records` VALUES (9, 48, 95, '1775739537919803878', 'payment', 99.00, 'alipay', 'success', '订单 1775739537919803878 支付成功', '2026-04-09 20:58:59', '2026-04-09 20:58:59');
INSERT INTO `transaction_records` VALUES (10, 48, 96, '1775739644324407159', 'payment', 99.00, 'alipay', 'success', '订单 1775739644324407159 支付成功', '2026-04-09 21:00:46', '2026-04-09 21:00:45');
INSERT INTO `transaction_records` VALUES (11, 48, 98, '1776068275102363391', 'payment', 94.05, 'alipay', 'success', '订单 1776068275102363391 支付成功', '2026-04-13 16:17:56', '2026-04-13 16:17:56');
INSERT INTO `transaction_records` VALUES (12, 48, 99, '1776085507271660958', 'payment', 88.00, 'alipay', 'success', '订单 1776085507271660958 支付成功', '2026-04-13 21:05:08', '2026-04-13 21:05:08');
INSERT INTO `transaction_records` VALUES (13, 48, 100, '1776166734643850371', 'payment', 1873.00, 'wechat', 'success', '订单 1776166734643850371 支付成功', '2026-04-14 19:38:56', '2026-04-14 19:38:55');
INSERT INTO `transaction_records` VALUES (14, 68, 103, '1776219486303201006', 'payment', 80.00, 'alipay', 'success', '订单 1776219486303201006 支付成功', '2026-04-15 10:20:10', '2026-04-15 10:20:10');
INSERT INTO `transaction_records` VALUES (15, 68, 107, '1776224348161538184', 'payment', 80.00, 'alipay', 'success', '订单 1776224348161538184 支付成功', '2026-04-15 11:39:13', '2026-04-15 11:39:12');
INSERT INTO `transaction_records` VALUES (16, 68, 108, '1776224503382519696', 'payment', 100.00, 'alipay', 'success', '订单 1776224503382519696 支付成功', '2026-04-15 11:44:52', '2026-04-15 11:44:51');
INSERT INTO `transaction_records` VALUES (17, 68, 109, '1776224503405950653', 'payment', 1873.00, 'alipay', 'success', '订单 1776224503405950653 支付成功', '2026-04-15 11:45:16', '2026-04-15 11:45:15');
INSERT INTO `transaction_records` VALUES (18, 72, 110, '1776236275033711252', 'payment', 120.00, 'wechat', 'success', '订单 1776236275033711252 支付成功', '2026-04-15 14:58:11', '2026-04-15 14:58:10');
INSERT INTO `transaction_records` VALUES (19, 72, 111, '1776236275081367659', 'payment', 1838.00, 'wechat', 'success', '订单 1776236275081367659 支付成功', '2026-04-15 14:58:27', '2026-04-15 14:58:26');
INSERT INTO `transaction_records` VALUES (20, 74, 112, '1776237435972264200', 'payment', 1838.00, 'alipay', 'success', '订单 1776237435972264200 支付成功', '2026-04-15 15:17:21', '2026-04-15 15:17:20');
INSERT INTO `transaction_records` VALUES (21, 68, 121, '1776425706483283081', 'payment', 1838.00, 'alipay', 'success', '订单 1776425706483283081 支付成功', '2026-04-17 19:35:11', '2026-04-17 19:35:10');
INSERT INTO `transaction_records` VALUES (22, 68, 122, '1776428237785577471', 'payment', 99.00, 'alipay', 'success', '订单 1776428237785577471 支付成功', '2026-04-17 20:18:17', '2026-04-17 20:18:16');
INSERT INTO `transaction_records` VALUES (23, 68, 123, '1776474350297265843', 'payment', 99.00, 'alipay', 'success', '订单 1776474350297265843 支付成功', '2026-04-18 09:06:00', '2026-04-18 09:05:59');
INSERT INTO `transaction_records` VALUES (24, 72, 124, '1776513144500829941', 'payment', 99.00, 'alipay', 'success', '订单 1776513144500829941 支付成功', '2026-04-18 19:52:29', '2026-04-18 19:52:29');
INSERT INTO `transaction_records` VALUES (25, 72, 124, '1776513144500829941', 'refund', 99.00, 'alipay', 'success', '订单1776513144500829941急速退款（支付宝）', '2026-04-18 19:56:33', '2026-04-18 19:56:33');
INSERT INTO `transaction_records` VALUES (26, 72, 125, '1776514438879862715', 'payment', 99.00, 'alipay', 'success', '订单 1776514438879862715 支付成功', '2026-04-18 20:14:03', '2026-04-18 20:14:02');
INSERT INTO `transaction_records` VALUES (27, 72, 126, '1776514617259787781', 'payment', 99.00, 'alipay', 'success', '订单 1776514617259787781 支付成功', '2026-04-18 20:17:01', '2026-04-18 20:17:01');
INSERT INTO `transaction_records` VALUES (28, 72, 127, '1776515046448256243', 'payment', 99.00, 'alipay', 'success', '订单 1776515046448256243 支付成功', '2026-04-18 20:24:11', '2026-04-18 20:24:11');
INSERT INTO `transaction_records` VALUES (29, 72, 128, '1776515434367147742', 'payment', 94.05, 'alipay', 'success', '订单 1776515434367147742 支付成功', '2026-04-18 20:30:38', '2026-04-18 20:30:38');
INSERT INTO `transaction_records` VALUES (30, 72, 128, '1776515434367147742', 'refund', 94.05, 'alipay', 'success', '订单1776515434367147742急速退款（支付宝）', '2026-04-18 20:31:07', '2026-04-18 20:31:07');
INSERT INTO `transaction_records` VALUES (31, 72, 129, '1776518049107521100', 'payment', 94.05, 'alipay', 'success', '订单 1776518049107521100 支付成功', '2026-04-18 21:14:13', '2026-04-18 21:14:13');
INSERT INTO `transaction_records` VALUES (32, 72, 129, '1776518049107521100', 'refund', 94.05, 'alipay', 'success', '订单1776518049107521100急速退款（支付宝）', '2026-04-18 21:14:21', '2026-04-18 21:14:21');
INSERT INTO `transaction_records` VALUES (33, 72, 130, '1776518120602214082', 'payment', 800.00, 'wechat', 'success', '订单 1776518120602214082 支付成功', '2026-04-18 21:15:25', '2026-04-18 21:15:24');
INSERT INTO `transaction_records` VALUES (34, 72, 130, '1776518120602214082', 'refund', 800.00, NULL, 'success', '订单1776518120602214082退款', '2026-04-18 21:17:30', '2026-04-18 21:17:30');
INSERT INTO `transaction_records` VALUES (35, 72, 131, '1776518374158881246', 'payment', 94.05, 'wechat', 'success', '订单 1776518374158881246 支付成功', '2026-04-18 21:19:38', '2026-04-18 21:19:38');
INSERT INTO `transaction_records` VALUES (36, 72, 131, '1776518374158881246', 'refund', 94.05, NULL, 'success', '订单1776518374158881246退款', '2026-04-18 21:21:40', '2026-04-18 21:21:40');
INSERT INTO `transaction_records` VALUES (37, 72, 132, '1776518525017080227', 'payment', 94.05, 'wechat', 'success', '订单 1776518525017080227 支付成功', '2026-04-18 21:22:09', '2026-04-18 21:22:09');
INSERT INTO `transaction_records` VALUES (38, 72, 132, '1776518525017080227', 'refund', 94.05, 'wechat', 'success', '订单1776518525017080227急速退款（微信支付）', '2026-04-18 21:22:21', '2026-04-18 21:22:21');
INSERT INTO `transaction_records` VALUES (39, 72, 133, '1776518579437876457', 'payment', 94.05, 'wechat', 'success', '订单 1776518579437876457 支付成功', '2026-04-18 21:23:03', '2026-04-18 21:23:03');
INSERT INTO `transaction_records` VALUES (40, 72, 136, '1776668623346656603', 'payment', 1873.00, 'wechat', 'success', '订单 1776668623346656603 支付成功', '2026-04-20 15:03:50', '2026-04-20 15:03:50');
INSERT INTO `transaction_records` VALUES (41, 68, 143, '20260516182140215008', 'payment', 1888.00, 'wechat', 'success', '订单 20260516182140215008 支付成功', '2026-05-16 18:21:45', '2026-05-16 18:21:45');
INSERT INTO `transaction_records` VALUES (42, 68, 144, '20260516182415552188', 'payment', 99.00, 'alipay', 'success', '订单 20260516182415552188 支付成功', '2026-05-16 18:24:20', '2026-05-16 18:24:19');
INSERT INTO `transaction_records` VALUES (43, 68, 145, '20260516182451095359', 'payment', 3776.00, 'alipay', 'success', '订单 20260516182451095359 支付成功', '2026-05-16 18:24:56', '2026-05-16 18:24:55');
INSERT INTO `transaction_records` VALUES (44, 68, 146, '20260516190327894960', 'payment', 1888.00, 'alipay', 'success', '订单 20260516190327894960 支付成功', '2026-05-16 19:03:32', '2026-05-16 19:03:31');
INSERT INTO `transaction_records` VALUES (45, 68, 147, '20260520180059542255', 'payment', 1888.00, 'alipay', 'success', '订单 20260520180059542255 支付成功', '2026-05-20 18:01:09', '2026-05-20 18:01:09');

-- ----------------------------
-- Table structure for user_coupons
-- ----------------------------
DROP TABLE IF EXISTS `user_coupons`;
CREATE TABLE `user_coupons`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '用户ID',
  `coupon_id` int NOT NULL COMMENT '优惠券ID',
  `status` enum('unused','used','expired') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'unused' COMMENT '状态',
  `used_at` datetime NULL DEFAULT NULL COMMENT '使用时间',
  `order_id` int NULL DEFAULT NULL COMMENT '关联订单ID',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '领取时间',
  `obtained_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '获得时间',
  `valid_from` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '有效期开始时间',
  `valid_to` datetime NULL DEFAULT NULL COMMENT '有效期结束时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  INDEX `coupon_id`(`coupon_id` ASC) USING BTREE,
  CONSTRAINT `user_coupons_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `user_coupons_ibfk_2` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 34 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_coupons
-- ----------------------------
INSERT INTO `user_coupons` VALUES (21, 48, 25, 'used', '2026-04-13 16:17:55', 98, '2026-04-13 11:09:09', '2026-04-15 09:56:50', '2026-04-15 09:56:50', NULL);
INSERT INTO `user_coupons` VALUES (23, 68, 28, 'used', '2026-04-17 19:35:06', 121, '2026-04-15 08:58:03', '2026-04-15 09:56:50', '2026-04-15 09:56:50', NULL);
INSERT INTO `user_coupons` VALUES (24, 68, 25, 'expired', NULL, NULL, '2026-04-15 09:57:35', '2026-04-15 09:57:35', '2026-04-02 00:00:00', '2026-04-30 00:00:00');
INSERT INTO `user_coupons` VALUES (26, 68, 30, 'used', '2026-04-15 11:39:08', 107, '2026-04-15 11:38:41', '2026-04-15 11:38:41', '2026-04-01 00:00:00', '2026-04-30 00:00:00');
INSERT INTO `user_coupons` VALUES (27, 68, 29, 'used', '2026-04-15 11:41:43', 109, '2026-04-15 11:41:19', '2026-04-15 11:41:19', '2026-04-04 00:00:00', '2026-04-29 00:00:00');
INSERT INTO `user_coupons` VALUES (28, 72, 28, 'used', '2026-04-15 14:57:55', 111, '2026-04-15 14:57:14', '2026-04-15 14:57:14', '2026-04-04 00:00:00', '2026-04-30 00:00:00');
INSERT INTO `user_coupons` VALUES (29, 74, 28, 'used', '2026-04-15 15:17:15', 112, '2026-04-15 15:15:40', '2026-04-15 15:15:40', '2026-04-04 00:00:00', '2026-04-30 00:00:00');
INSERT INTO `user_coupons` VALUES (30, 72, 25, 'used', '2026-04-18 21:22:59', 133, '2026-04-18 20:30:27', '2026-04-18 20:30:27', '2026-04-02 00:00:00', '2026-04-30 00:00:00');
INSERT INTO `user_coupons` VALUES (31, 78, 29, 'unused', NULL, NULL, '2026-04-20 13:59:03', '2026-04-20 13:59:03', '2026-04-04 00:00:00', '2026-04-29 00:00:00');
INSERT INTO `user_coupons` VALUES (32, 78, 25, 'unused', NULL, NULL, '2026-04-20 14:58:37', '2026-04-20 14:58:37', '2026-04-02 00:00:00', '2026-04-30 00:00:00');
INSERT INTO `user_coupons` VALUES (33, 72, 29, 'used', '2026-04-20 15:03:43', 136, '2026-04-20 15:03:37', '2026-04-20 15:03:37', '2026-04-04 00:00:00', '2026-04-29 00:00:00');

-- ----------------------------
-- Table structure for user_verifications
-- ----------------------------
DROP TABLE IF EXISTS `user_verifications`;
CREATE TABLE `user_verifications`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `real_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '真实姓名',
  `id_card` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '身份证号',
  `status` enum('pending','verified','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'pending' COMMENT '认证状态',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_user`(`user_id` ASC) USING BTREE,
  CONSTRAINT `user_verifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_verifications
-- ----------------------------

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户名',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码',
  `role_id` int NULL DEFAULT NULL COMMENT '角色ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '真实姓名',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '手机号',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '邮箱',
  `status` tinyint NULL DEFAULT 1 COMMENT '状态 1-启用 0-禁用',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `roles` json NULL COMMENT '用户角色数组',
  `id_card_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '身份证号(加密存储)',
  `real_name_status` enum('none','pending','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'none' COMMENT '实名认证状态 none-未认证 pending-待审核 approved-已认证 rejected-已拒绝',
  `real_name_reviewed_at` datetime NULL DEFAULT NULL COMMENT '实名认证审核时间',
  `real_name_reviewed_by` int NULL DEFAULT NULL COMMENT '实名认证审核人ID',
  `pay_password` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '支付密码(加密存储，SHA256)',
  `pay_password_status` tinyint NULL DEFAULT 0 COMMENT '支付密码状态 0-未设置 1-已设置',
  `pay_password_error_count` tinyint NULL DEFAULT 0 COMMENT '支付密码连续错误次数',
  `pay_password_locked_until` datetime NULL DEFAULT NULL COMMENT '支付密码锁定截止时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE,
  INDEX `role_id`(`role_id` ASC) USING BTREE,
  INDEX `idx_pay_password_status`(`pay_password_status` ASC) USING BTREE,
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 79 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'admin', '$2b$10$1zszjYJnbR.DofCug8HXQO/44O3T3tffSNbcnLIE8VF.cNCHIE.n.', 1, '超级管理员', '15246150580', 'admin@123.com', 1, '2026-01-08 17:08:30', '2026-03-30 10:54:40', '[\"buyer\"]', NULL, 'none', NULL, NULL, 0, 0, NULL);
INSERT INTO `users` VALUES (22, '钱多多', '$2b$10$mjn7IpUhazmm53CRXlo62OsU6bGLsH/zSieUduLV5nFZVzwDcNdkG', 5, '钱多多', '15246150570', 'qianduoduo@qq.com', 1, '2026-01-09 13:52:23', '2026-03-29 09:58:03', '[\"buyer\"]', NULL, 'none', NULL, NULL, 0, 0, NULL);
INSERT INTO `users` VALUES (23, 'abc', '$2b$10$M8jWHACO.YKcNEPMwbTRB.8bCrpySD6xsF2oF0HTkrJXQuAnArqhq', 5, 'abc', '16845961235', 'abcabcabc@123.com', 1, '2026-01-09 13:56:15', '2026-03-29 09:58:03', '[\"buyer\"]', NULL, 'none', NULL, NULL, 0, 0, NULL);
INSERT INTO `users` VALUES (35, '运营人员', '$2b$10$D/ZNBOqUq5UOJKjxGLng2uvjFzAS3eYTwbRmLXJvjHL4A2Y8gU83e', 2, '运营', '15246150530', 'yunying@123.com', 1, '2026-01-13 08:42:39', '2026-03-29 09:58:03', '[\"buyer\"]', NULL, 'none', NULL, NULL, 0, 0, NULL);
INSERT INTO `users` VALUES (37, '客服人员', '$2b$10$KSZI5BvpB7cjOp/OUU2LuuoDtUmRPTi/7X7d5CqIvXZR1fAPoOrwy', 3, '客服', '15246150550', 'kefu@qq.com', 1, '2026-01-13 08:45:02', '2026-03-29 09:58:03', '[\"buyer\"]', NULL, 'none', NULL, NULL, 0, 0, NULL);
INSERT INTO `users` VALUES (44, '张明明', '$2b$10$UJ9Sap/gyFmNcO4P896cM.CkPhCH.1QDb6qUvtrCJUqV9kzX2wRAa', 5, '张明明', '15246250570', NULL, 1, '2026-03-17 18:05:09', '2026-03-29 09:58:03', '[\"buyer\"]', NULL, 'none', NULL, NULL, 0, 0, NULL);
INSERT INTO `users` VALUES (45, '张白白', '$2b$10$6TusynCo4TyZv5EPjhTUGurMtTxn4sjvCmIMmolYZFMsIVj0.pUXO', 5, '张白白', '15246350570', NULL, 1, '2026-03-17 18:34:36', '2026-03-29 09:58:03', '[\"buyer\"]', NULL, 'none', NULL, NULL, 0, 0, NULL);
INSERT INTO `users` VALUES (46, '金明', '$2b$10$W/cJ4FSlXKA5cEzi1SxMq.IS3HbQpymKdjfB8/8IFsQODffB0Ck4G', 5, '金明', '13256898866', NULL, 1, '2026-03-26 16:56:24', '2026-03-29 09:58:03', '[\"buyer\"]', NULL, 'none', NULL, NULL, 0, 0, NULL);
INSERT INTO `users` VALUES (47, '赵奕然', '$2b$10$ih.LtNES7gUrG4h6rwc4Q.pYRQSSLDW2df58FDwLji3sKApxihfGm', 5, '赵依然', '16588945876', NULL, 1, '2026-03-26 16:57:33', '2026-03-29 09:58:03', '[\"buyer\"]', NULL, 'none', NULL, NULL, 0, 0, NULL);
INSERT INTO `users` VALUES (48, '秦月来', '$2b$10$LUOTZGVuLaWpbV2K.WN9MOmVBENm3xcrl.6VNsQVBDcNDYElxnQ1m', 5, '秦月', '15648985522', NULL, 1, '2026-03-26 16:58:08', '2026-04-15 14:55:10', '[\"buyer\"]', NULL, 'none', NULL, NULL, 0, 0, NULL);
INSERT INTO `users` VALUES (49, '林百思', '$2b$10$cX.tC0NLkbkTKDpRNz0gduWSEFZHtjlD.HBmjrlNmSnXD1hxxKdJC', 5, '林百思', '15246887982', NULL, 1, '2026-03-26 16:59:09', '2026-03-29 09:58:03', '[\"buyer\"]', NULL, 'none', NULL, NULL, 0, 0, NULL);
INSERT INTO `users` VALUES (50, 'operator', '$2b$10$mNy3fi6M86UsebVhcYEMkOeUAL10v4ucq1sKeYLyOjcrAqHITcFwO', 2, '运营人员', '13800000050', NULL, 1, '2026-03-26 22:27:07', '2026-04-11 20:36:03', '[\"buyer\"]', NULL, 'none', NULL, NULL, 0, 0, NULL);
INSERT INTO `users` VALUES (51, 'customer', '$2b$10$lyuctMEtZ6JaAMMI1OGXs.5UeLY3GUx3uSfgSB42jVGHsIUFzbqk2', 3, '客服人员', '13800000051', NULL, 1, '2026-03-26 22:27:07', '2026-04-11 20:36:03', '[\"buyer\"]', NULL, 'none', NULL, NULL, 0, 0, NULL);
INSERT INTO `users` VALUES (55, '甄美丽', '$2b$10$q5wp3pMLgLEL/0pAtrwHuub6FVxUY3ZdylYKtszviwYgPwUu1YnIa', 6, '甄美丽', '13245668585', '13245668585@qq.com', 1, '2026-03-29 22:19:56', '2026-04-05 17:34:58', NULL, NULL, 'none', NULL, NULL, 0, 0, NULL);
INSERT INTO `users` VALUES (56, '甄心大', '$2b$10$q5wp3pMLgLEL/0pAtrwHuub6FVxUY3ZdylYKtszviwYgPwUu1YnIa', 6, '甄心大', '15246889895', '1524658787@qq.com', 1, '2026-03-30 14:44:36', '2026-04-05 17:34:58', NULL, NULL, 'none', NULL, NULL, 0, 0, NULL);
INSERT INTO `users` VALUES (57, '甄云朵', '$2b$10$q5wp3pMLgLEL/0pAtrwHuub6FVxUY3ZdylYKtszviwYgPwUu1YnIa', 6, '甄云朵', '13245668989', '13245668989@qq.com', 1, '2026-03-30 16:42:56', '2026-04-05 17:34:58', NULL, NULL, 'none', NULL, NULL, 0, 0, NULL);
INSERT INTO `users` VALUES (59, '贾潮流', '$2b$10$leVIo09dojX9Za7sFt6uOe01cSwLMu9wki7rPvH4SdnwmkjqtKWSi', 6, '贾潮流', '13800000059', NULL, 1, '2026-04-06 21:20:00', '2026-04-11 20:36:03', NULL, NULL, 'none', NULL, NULL, 0, 0, NULL);
INSERT INTO `users` VALUES (60, '夏好看', '$2b$10$9qxB6ftKGC.Tvmbubt/G8eyfQbxz43sm/TZbjgKJbYvCbqYeIzF7G', 6, '夏好看', '13800000060', NULL, 1, '2026-04-06 21:21:15', '2026-04-11 20:36:03', NULL, NULL, 'none', NULL, NULL, 0, 0, NULL);
INSERT INTO `users` VALUES (61, '甄舒适', '$2b$10$FS.N3pcTphBT/h6B7VfE4eeudjgtfM6O3ugwpXaBiMyxGAECGm.sy', 6, '甄舒适', '13800000061', NULL, 1, '2026-04-07 09:54:40', '2026-04-11 20:36:03', NULL, NULL, 'none', NULL, NULL, 0, 0, NULL);
INSERT INTO `users` VALUES (62, '赵优雅', '$2b$10$zhNvizt.rQwlvQIlmqUCUOA2TqvtzxPJtJHLct1qypqN29zXkF/9K', 6, '赵优雅', '13800000062', NULL, 1, '2026-04-07 13:51:03', '2026-04-11 20:36:03', NULL, NULL, 'none', NULL, NULL, 0, 0, NULL);
INSERT INTO `users` VALUES (63, '胡一帆', '$2b$10$a9LnJiy/mjBNx.J00lffAe9DOcJu1ycwK8AmWZHuMKepIYPnCQBtu', 6, '胡一帆', '13800000063', NULL, 1, '2026-04-11 20:32:49', '2026-04-11 20:36:03', NULL, NULL, 'none', NULL, NULL, 0, 0, NULL);
INSERT INTO `users` VALUES (64, '甄时髦', '$2b$10$BsuhhfCXQx90UuK8iF0boudVkNjVxKXxITw2cuLJ7aDCIbV/yDNni', 6, '甄时髦', '13800000064', NULL, 1, '2026-04-11 20:33:00', '2026-04-11 20:36:03', NULL, NULL, 'none', NULL, NULL, 0, 0, NULL);
INSERT INTO `users` VALUES (65, '方宅宅', '$2b$10$sKjW5fAF4uPErNLBG7f8I.2R993OljCm9r921zFWnh5/LAQWinuX6', 6, '方宅宅', '13465859595', NULL, 1, '2026-04-14 16:47:30', '2026-04-14 16:47:30', NULL, NULL, 'none', NULL, NULL, 0, 0, NULL);
INSERT INTO `users` VALUES (67, '赵海海', '$2b$10$DQhJ12oquR5/j67Au4fPTOogcHUmWAP/ujABoyxgdTlj1d6/Eh7dm', 5, '赵海海', '15246363636', NULL, 1, '2026-04-15 07:30:02', '2026-04-15 07:45:22', NULL, '7638f07e6096e9b034136e496ff78383b2c08b05ddc5bd8266973141bbeac477', 'approved', '2026-04-15 07:45:23', NULL, 0, 0, NULL);
INSERT INTO `users` VALUES (68, '李雨桐', '$2b$10$NOkEmUEc1nQ1zWpA60U9qeOyaVTJT9RWIA/K7EbvNCvI/MAaFMzXm', 5, '李雨桐', '15246151515', NULL, 1, '2026-04-15 08:56:31', '2026-05-16 18:21:44', NULL, 'f2fa4a97f86bc1f8ba704112d0a4b056077e41887bc0e0bcd30f933c5747f964', 'approved', '2026-04-15 08:57:02', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 1, 0, NULL);
INSERT INTO `users` VALUES (69, '赵月月', '$2b$10$bOoqrD21hO8cgIGpLR6.oODiUHIyc11ZO4qkc2XjLTJ8.s21YU2Ou', 6, '赵月月', '15246152525', NULL, 1, '2026-04-15 11:37:07', '2026-04-15 11:37:07', NULL, NULL, 'none', NULL, NULL, 0, 0, NULL);
INSERT INTO `users` VALUES (70, '赵美丽', '$2b$10$2axyekVFX1i/IjGlZmK5u.MqyOcA0H6ktTdp41RC3p2cobgXXV.cK', 5, '赵美丽', '15246651515', NULL, 1, '2026-04-15 13:29:48', '2026-04-15 13:31:15', NULL, '2ad071443d0016e85124a84d4ecf8e49d968aca38b6a12396fc1d2e4811c062a', 'approved', '2026-04-15 13:31:15', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 1, 0, NULL);
INSERT INTO `users` VALUES (71, '张晓明', '$2b$10$l6oQvJQ.U5Iiq6CNhawzPOtDKcfv/wKWlmzeR7qH3m.PU076Te3D2', 5, '张晓明', '15246152515', NULL, 1, '2026-04-15 14:45:08', '2026-04-15 14:45:08', NULL, NULL, 'none', NULL, '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 1, 0, NULL);
INSERT INTO `users` VALUES (72, '张海明', '$2b$10$2SQ5sVEa3ZzmyCjxVOwkpOOTbM1a4sCeFIxuirIWHyMJqK8oSn7dq', 5, '张海明', '15246256365', NULL, 1, '2026-04-15 14:52:03', '2026-04-15 14:57:42', NULL, 'b44ec4a6ac05340eab931e7a42c1de96c87e3f6d96caf8c988b81f1567e1c0d0', 'approved', '2026-04-15 14:57:42', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 1, 0, NULL);
INSERT INTO `users` VALUES (73, '赵明白', '$2b$10$nDf3P9aa4whX5xx1Fo8OA.y8JluQ97q76PdxZ4Jv0YoD/MBedouI6', 6, '赵明白', '15246152589', NULL, 1, '2026-04-15 15:13:04', '2026-04-15 15:13:04', NULL, NULL, 'none', NULL, NULL, 0, 0, NULL);
INSERT INTO `users` VALUES (74, '张云海', '$2b$10$XxZNWSZ72wR.6WhRTXfp0.ab0qHf1HM2yjynZLr5gtYZuBhXBGS.S', 5, '张云海', '15246365656', NULL, 1, '2026-04-15 15:14:28', '2026-04-15 15:15:20', NULL, '113fc71ecbc1b94f07cb9143e8ce655a79fb8a44723e49cb5592c1b66c173781', 'approved', '2026-04-15 15:15:20', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 1, 0, NULL);
INSERT INTO `users` VALUES (75, '赵英俊', '$2b$10$MSJTrZc2wQar6mr3/u0qv.OtNwBQQZmyt1g97G8dsRrei54qmD2mK', 6, '赵英俊', '15246253525', NULL, 1, '2026-04-15 21:59:11', '2026-04-15 21:59:11', NULL, NULL, 'none', NULL, NULL, 0, 0, NULL);
INSERT INTO `users` VALUES (76, 'testuser', '$2b$10$7hMKxihtVYAsqtKxDydDtO.RgXAKxw7JJEX2YmDB91Qvr7.F53WOS', 5, '测试用户', '13800138001', NULL, 1, '2026-04-16 14:34:16', '2026-04-16 14:42:31', NULL, 'c95d430eef51fe4a42c3aefe6c6e392a0f6c4d42b6b55fe8242f8d3beb0e7a03', 'approved', '2026-04-16 14:42:32', NULL, 0, 0, NULL);
INSERT INTO `users` VALUES (77, '辛一苦', '$2b$10$MnU93fC5JjaipKh8YC/VwuYwFDcswrmerEBboVPYjjpRTVhS0rItC', 6, '辛一苦', '15246152525', NULL, 1, '2026-04-17 22:39:15', '2026-04-17 22:39:15', NULL, NULL, 'none', NULL, NULL, 0, 0, NULL);
INSERT INTO `users` VALUES (78, '王珍珍', '$2b$10$PSdrQ29rJgWSc/XAMnPZiupU4K6ZaISPQC05ZtEeMGYhCUI.rKG1C', 5, '王珍珍', '15246777775', NULL, 1, '2026-04-19 18:30:44', '2026-04-19 18:30:44', NULL, NULL, 'none', NULL, '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 1, 0, NULL);

-- ----------------------------
-- Table structure for zone_products
-- ----------------------------
DROP TABLE IF EXISTS `zone_products`;
CREATE TABLE `zone_products`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `zone_id` int NOT NULL COMMENT '专区ID',
  `product_id` int NOT NULL COMMENT '商品ID',
  `sort_order` int NULL DEFAULT 0 COMMENT '排序',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_zone_product`(`zone_id` ASC, `product_id` ASC) USING BTREE,
  INDEX `product_id`(`product_id` ASC) USING BTREE,
  CONSTRAINT `zone_products_ibfk_1` FOREIGN KEY (`zone_id`) REFERENCES `zones` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `zone_products_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of zone_products
-- ----------------------------
INSERT INTO `zone_products` VALUES (4, 5, 39, 0, '2026-05-20 09:08:40', '2026-05-20 09:08:40');
INSERT INTO `zone_products` VALUES (5, 5, 36, 0, '2026-05-20 09:08:40', '2026-05-20 09:08:40');
INSERT INTO `zone_products` VALUES (6, 6, 35, 0, '2026-05-20 09:17:37', '2026-05-20 09:17:37');
INSERT INTO `zone_products` VALUES (7, 6, 34, 0, '2026-05-20 09:17:37', '2026-05-20 09:17:37');
INSERT INTO `zone_products` VALUES (8, 6, 33, 0, '2026-05-20 09:17:37', '2026-05-20 09:17:37');

-- ----------------------------
-- Table structure for zones
-- ----------------------------
DROP TABLE IF EXISTS `zones`;
CREATE TABLE `zones`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '专区名称',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '专区描述',
  `cover_image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '封面图片',
  `sort_order` int NULL DEFAULT 0 COMMENT '排序',
  `status` tinyint NULL DEFAULT 1 COMMENT '状态 1-启用 0-禁用',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of zones
-- ----------------------------
INSERT INTO `zones` VALUES (5, '大码换季清仓', '好物低价甩卖，断码捡漏，舒适显瘦穿搭超划算。', 'http://localhost:3000/uploads/product_1779238308501-386351481.webp', 1, 1, '2026-05-20 08:51:51', '2026-05-20 08:51:51');
INSERT INTO `zones` VALUES (6, '假日专场', '休闲通勤百搭版型，限时优惠', 'http://localhost:3000/uploads/product_1779239850024-628858692.webp', 2, 1, '2026-05-20 09:17:32', '2026-05-20 09:17:32');
INSERT INTO `zones` VALUES (7, '轻氧穿搭专场', '舒适亲肤版型，简约耐看不过时，男女休闲通勤装，日常穿搭首选。', 'http://localhost:3000/uploads/product_1779240145465-867001259.webp', 3, 1, '2026-05-20 09:22:29', '2026-05-20 09:22:29');

SET FOREIGN_KEY_CHECKS = 1;

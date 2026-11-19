-- 站内信系统数据库迁移
-- 支持：1)运营人员单方面给买家发通知 2)后台角色互通站内信

-- 创建站内信表
CREATE TABLE IF NOT EXISTS internal_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id BIGINT NOT NULL COMMENT '发送者ID',
    sender_role INT NOT NULL COMMENT '发送者角色ID',
    receiver_id BIGINT NOT NULL COMMENT '接收者ID',
    receiver_role INT NOT NULL COMMENT '接收者角色ID',
    subject VARCHAR(255) COMMENT '消息主题',
    content TEXT NOT NULL COMMENT '消息内容',
    message_type ENUM('text', 'notification', 'system', 'broadcast') DEFAULT 'text' COMMENT '消息类型',
    is_read TINYINT(1) DEFAULT 0 COMMENT '是否已读',
    is_important TINYINT(1) DEFAULT 0 COMMENT '是否重要',
    can_reply TINYINT(1) DEFAULT 1 COMMENT '是否可以回复（0：单向通知，1：双向沟通）',
    is_broadcast TINYINT(1) DEFAULT 0 COMMENT '是否为群发消息',
    broadcast_id VARCHAR(100) COMMENT '群发消息ID（同一批群发消息使用相同ID）',
    parent_id BIGINT DEFAULT NULL COMMENT '父消息ID（用于回复）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sender (sender_id, sender_role),
    INDEX idx_receiver (receiver_id, receiver_role),
    INDEX idx_created_at (created_at),
    INDEX idx_is_read (is_read),
    INDEX idx_can_reply (can_reply),
    INDEX idx_is_broadcast (is_broadcast),
    INDEX idx_broadcast_id (broadcast_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='站内信表';

-- 创建消息通知表
CREATE TABLE IF NOT EXISTS message_notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    user_role INT NOT NULL COMMENT '用户角色',
    message_id BIGINT COMMENT '消息ID',
    notification_type ENUM('new_message', 'system_alert', 'important') DEFAULT 'new_message' COMMENT '通知类型',
    title VARCHAR(255) COMMENT '通知标题',
    content TEXT COMMENT '通知内容',
    is_read TINYINT(1) DEFAULT 0 COMMENT '是否已读',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id, user_role),
    INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息通知表';
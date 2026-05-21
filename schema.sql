CREATE DATABASE IF NOT EXISTS notifyhub;
USE notifyhub;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Email Logs Table
CREATE TABLE IF NOT EXISTS email_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(50) NOT NULL, -- PENDING, SENT, FAILED
    sent_at TIMESTAMP NULL,
    error_message TEXT NULL,
    template_id BIGINT,
    user_id BIGINT,
    FOREIGN KEY (template_id) REFERENCES email_templates(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Scheduled Emails Table
CREATE TABLE IF NOT EXISTS scheduled_emails (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(50) NOT NULL, -- PENDING, SENT, FAILED
    scheduled_time TIMESTAMP NOT NULL,
    sent_at TIMESTAMP NULL,
    template_id BIGINT,
    user_id BIGINT,
    FOREIGN KEY (template_id) REFERENCES email_templates(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- SEED SAMPLE DATA
-- Default password for both users is 'password123'
-- BCrypt hashed: $2a$10$D3xT2YlJ1V825B3mQn32Fe82vQ1e.3Z/3M6h8P8jFfC8uO1nZ6zRy
-- --------------------------------------------------------

INSERT INTO users (id, name, email, password, role)
VALUES 
(1, 'Alex Admin', 'admin@notifyhub.com', '$2a$10$D3xT2YlJ1V825B3mQn32Fe82vQ1e.3Z/3M6h8P8jFfC8uO1nZ6zRy', 'ADMIN'),
(2, 'Yash Operator', 'operator@notifyhub.com', '$2a$10$D3xT2YlJ1V825B3mQn32Fe82vQ1e.3Z/3M6h8P8jFfC8uO1nZ6zRy', 'OPERATOR')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO email_templates (id, name, subject, body, created_at, user_id)
VALUES 
(1, 'Invoice Ready Notification', 'Your invoice {{invoiceId}} is ready', 'Hello {{name}},\n\nYour invoice {{invoiceId}} for ${{amount}} is available for review.\n\nPlease log into the dashboard to make your payment.\n\nBest regards,\nFinance Team', NOW(), 1),
(2, 'Welcome Onboarding', 'Welcome to NotifyHub, {{name}}!', 'Hello {{name}},\n\nWelcome to NotifyHub, the premier email automation platform.\n\nWe have initialized your sandboxed environment and it is ready to use.\n\nBest regards,\nNotifyHub Team', NOW(), 1)
ON DUPLICATE KEY UPDATE id=id;

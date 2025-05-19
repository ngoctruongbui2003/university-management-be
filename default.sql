CREATE TABLE permission (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE role_permission (
    role_id INT,
    permission_id INT,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES role(id),
    FOREIGN KEY (permission_id) REFERENCES permission(id)
);

CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    role_id INT NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    isDeleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES role(id)
);

-- Insert permissions
INSERT INTO permission (name) VALUES
('create:permission'),
('read:permission'),
('update:permission'),
('delete:permission'),
('create:role'),
('read:role'),
('update:role'),
('delete:role'),
('create:user'),
('read:user'),
('update:user'),
('delete:user');

-- Insert roles
INSERT INTO role (name) VALUES
('Admin'),
('Quản trị viên'),
('Quản lý đào tạo');

-- Gán permission cho Admin và Quản trị viên (hết tất cả)
INSERT INTO role_permission (role_id, permission_id)
SELECT r.id, p.id
FROM role r, permission p
WHERE r.name IN ('Admin', 'Quản trị viên');

-- Gán permission cho Quản lý đào tạo (chỉ quyền read)
INSERT INTO role_permission (role_id, permission_id)
SELECT r.id, p.id
FROM role r, permission p
WHERE r.name = 'Quản lý đào tạo'
AND p.name LIKE 'read:%';

-- Tạo user admin
INSERT INTO user (
    username,
    password,
    full_name,
    email,
    role_id,
    isActive,
    isDeleted,
    created_at,
    updated_at
) VALUES (
    'admin',
    '$2b$10$zKdWUh4OJ9w.Xe3A8h9fIOZrAz4dRVbmqXS9QNT.zZVTcEzhFsoIi', -- admin123
    'Admin là tôi',
    'admin_kt@gmail.com',
    1,
    true,
    false,
    NOW(),
    NOW()
);

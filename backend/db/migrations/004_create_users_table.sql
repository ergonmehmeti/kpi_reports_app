-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'basic' CHECK (role IN ('admin', 'basic')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Insert default admin user (password: admin123)
-- Password hash generated with bcryptjs: bcrypt.hashSync('admin123', 10)
INSERT INTO users (username, password_hash, role) 
VALUES ('admin', '$2b$10$yFsndzpykkp8P3NdsPrxseeM7v4euTpw.P2D1t5Kc3QccrPQQWhFO', 'admin')
ON CONFLICT (username) DO NOTHING;

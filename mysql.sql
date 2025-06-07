-- Create database and tables
DROP DATABASE IF EXISTS myapp;
CREATE DATABASE myapp;
USE myapp;

-- users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'clerk', 'customer') NOT NULL DEFAULT 'customer',
  balance DECIMAL(10,2) NOT NULL DEFAULT 5000.00,
  bank_id BIGINT UNSIGNED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- transactions table to track money transfers
CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  recipient_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- foreign keys reference users table
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
);

DELIMITER //

CREATE TRIGGER before_insert_users
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    -- Generate 11-digit unique bank_id
    REPEAT
        SET NEW.bank_id = FLOOR(10000000000 + RAND() * 89999999999);
    UNTIL NOT EXISTS (SELECT 1 FROM users WHERE bank_id = NEW.bank_id)
    END REPEAT;
END;
//

DELIMITER ;

INSERT INTO users (username, email, password,role) VALUES
('admin', 'admin@example.com', '1234', 'admin'),
('clerk', 'clerk@example.com', '1234', 'clerk'),
('customer', 'customer@example.com', '1234', 'customer');

SELECT id, username, balance FROM users WHERE username = 'Rana';
select * from users;
select * from transactions;

describe users;
describe transactions;

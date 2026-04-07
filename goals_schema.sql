USE duitflow;

CREATE TABLE IF NOT EXISTS goals (
  id INT auto_increment primary key,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(255),
  target_amount DECIMAL(15,2) NOT NULL,
  saved_amount DECIMAL(15,2) DEFAULT 0,
  icon VARCHAR(100),
  is_priority BOOLEAN DEFAULT false,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

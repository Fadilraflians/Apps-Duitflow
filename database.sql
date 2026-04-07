CREATE DATABASE IF NOT EXISTS duitflow;
USE duitflow;

CREATE TABLE IF NOT EXISTS transactions (
  id INT auto_increment primary key,
  title VARCHAR(255) NOT NULL,
  time DATETIME NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  icon VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  negative BOOLEAN NOT NULL
);

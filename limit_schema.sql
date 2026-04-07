USE duitflow;

ALTER TABLE users
ADD COLUMN monthly_limit DECIMAL(15,2) DEFAULT 0;

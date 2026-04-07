USE duitflow;  
CREATE TABLE IF NOT EXISTS `user_wallets` (
  `user_id` int NOT NULL,
  `bca_balance` decimal(15,2) DEFAULT '0.00',
  `cash_balance` decimal(15,2) DEFAULT '0.00',
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_wallet_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET @dbname = 'duitflow';
SET @tablename = 'transactions';
SET @columnname = 'account_type';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT 1',
  'ALTER TABLE `transactions` ADD COLUMN `account_type` VARCHAR(50) DEFAULT ''bca'';'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Backfill transactions account_type if it contains cash in title
UPDATE transactions SET account_type = 'cash' WHERE title LIKE '%cash%';

-- Regenerate user_wallets balances
INSERT INTO user_wallets (user_id, bca_balance, cash_balance)
SELECT 
  id, 
  0, 
  0 
FROM users
ON DUPLICATE KEY UPDATE bca_balance=0, cash_balance=0;

-- Update BCA Balance
UPDATE user_wallets w
JOIN (
  SELECT user_id, SUM(CASE WHEN negative = 1 THEN -amount ELSE amount END) as tbl
  FROM transactions 
  WHERE account_type = 'bca'
  GROUP BY user_id
) t ON w.user_id = t.user_id
SET w.bca_balance = t.tbl;

-- Update Cash Balance
UPDATE user_wallets w
JOIN (
  SELECT user_id, SUM(CASE WHEN negative = 1 THEN -amount ELSE amount END) as tcl
  FROM transactions 
  WHERE account_type = 'cash'
  GROUP BY user_id
) t ON w.user_id = t.user_id
SET w.cash_balance = t.tcl;

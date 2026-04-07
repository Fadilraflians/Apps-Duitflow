import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'duitflow',
  port: parseInt(process.env.DB_PORT) || 3306,
  ssl: process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud') ? {
    rejectUnauthorized: false
  } : undefined
};

// --- AUTH ROUTES ---

app.post('/api/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const connection = await mysql.createConnection(dbConfig);
    
    const [existing] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      await connection.end();
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await connection.execute(
      'INSERT INTO users (full_name, email, password, monthly_limit) VALUES (?, ?, ?, 0)',
      [fullName, email, hashedPassword]
    );

    await connection.execute(
      'INSERT INTO user_wallets (user_id, bca_balance, cash_balance) VALUES (?, 0, 0)',
      [result.insertId]
    );
    
    await connection.end();
    res.json({
      id: result.insertId,
      full_name: fullName,
      email,
      monthly_limit: 0,
      bca_balance: 0,
      cash_balance: 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const connection = await mysql.createConnection(dbConfig);
    
    const [users] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      await connection.end();
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = users[0];
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      await connection.end();
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const [walletRows] = await connection.execute(
      'SELECT bca_balance, cash_balance FROM user_wallets WHERE user_id = ? LIMIT 1',
      [user.id]
    );
    const wallet = walletRows[0] || { bca_balance: 0, cash_balance: 0 };

    await connection.end();
    res.json({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      monthly_limit: parseFloat(user.monthly_limit || 0),
      bca_balance: parseFloat(wallet.bca_balance || 0),
      cash_balance: parseFloat(wallet.cash_balance || 0)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during login', details: String(error) });
  }
});

app.put('/api/users/:id/limit', async (req, res) => {
  try {
    const userId = req.params.id;
    const { monthly_limit } = req.body;
    
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'UPDATE users SET monthly_limit = ? WHERE id = ?',
      [monthly_limit, userId]
    );
    
    await connection.end();
    res.json({ success: true, monthly_limit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error while updating limit' });
  }
});

// --- WALLET ROUTES ---

app.get('/api/wallets', async (req, res) => {
  try {
    const userId = req.query.user_id;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT bca_balance, cash_balance FROM user_wallets WHERE user_id = ? LIMIT 1',
      [userId]
    );
    await connection.end();

    const wallet = rows[0] || { bca_balance: 0, cash_balance: 0 };
    res.json({
      bca_balance: parseFloat(wallet.bca_balance || 0),
      cash_balance: parseFloat(wallet.cash_balance || 0)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error while loading wallets' });
  }
});

app.put('/api/wallets', async (req, res) => {
  try {
    const { user_id, bca_balance, cash_balance } = req.body;
    if (!user_id) return res.status(400).json({ error: 'User ID is required' });

    const safeBca = Math.max(parseFloat(bca_balance || 0), 0);
    const safeCash = Math.max(parseFloat(cash_balance || 0), 0);

    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      `INSERT INTO user_wallets (user_id, bca_balance, cash_balance)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE bca_balance = VALUES(bca_balance), cash_balance = VALUES(cash_balance)`,
      [user_id, safeBca, safeCash]
    );
    await connection.end();

    res.json({ success: true, bca_balance: safeBca, cash_balance: safeCash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error while updating wallets' });
  }
});

// --- TRANSACTION ROUTES ---

app.get('/api/transactions', async (req, res) => {
  try {
    const userId = req.query.user_id;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY time DESC, id DESC',
      [userId]
    );
    
    const formattedRows = rows.map(r => ({
      ...r,
      negative: r.negative === 1,
      account_type: String(r.account_type || '').trim().toLowerCase() === 'cash' ? 'cash' : 'bca'
    }));
    
    await connection.end();
    res.json(formattedRows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/transactions', async (req, res) => {
  let connection;
  try {
    const { user_id, title, time, amount, icon, category, negative, account_type } = req.body;
    if (!user_id) return res.status(400).json({ error: 'User ID is required' });
    const parsedAmount = parseFloat(amount || 0);
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    const account = String(account_type || '').trim().toLowerCase() === 'cash' ? 'cash' : 'bca';

    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();
    const mysqlTime = new Date(time).toISOString().slice(0, 19).replace('T', ' ');

    const [result] = await connection.execute(
      'INSERT INTO transactions (user_id, title, time, amount, icon, category, negative, account_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, title, mysqlTime, parsedAmount, icon, category, negative ? 1 : 0, account]
    );

    const [walletRows] = await connection.execute(
      'SELECT bca_balance, cash_balance FROM user_wallets WHERE user_id = ? LIMIT 1',
      [user_id]
    );

    if (walletRows.length === 0) {
      await connection.execute(
        'INSERT INTO user_wallets (user_id, bca_balance, cash_balance) VALUES (?, 0, 0)',
        [user_id]
      );
      walletRows.push({ bca_balance: 0, cash_balance: 0 });
    }

    const wallet = walletRows[0];
    const currentAccountBalance = parseFloat(
      account === 'cash' ? wallet.cash_balance : wallet.bca_balance
    );
    const nextBalance = negative ? currentAccountBalance - parsedAmount : currentAccountBalance + parsedAmount;

    if (nextBalance < 0) {
      await connection.rollback();
      await connection.end();
      return res.status(400).json({
        error: `Saldo ${account.toUpperCase()} tidak cukup untuk transaksi ini`
      });
    }

    if (account === 'cash') {
      await connection.execute(
        'UPDATE user_wallets SET cash_balance = ? WHERE user_id = ?',
        [nextBalance, user_id]
      );
    } else {
      await connection.execute(
        'UPDATE user_wallets SET bca_balance = ? WHERE user_id = ?',
        [nextBalance, user_id]
      );
    }

    await connection.commit();
    await connection.end();
    connection = null;
    res.json({
      id: result.insertId,
      user_id,
      title,
      time,
      amount: parsedAmount,
      icon,
      category,
      negative,
      account_type: account
    });
  } catch (error) {
    console.error(error);
    if (connection) {
      try {
      await connection.rollback();
      await connection.end();
      } catch (rollbackErr) {
        // ignore rollback failure
      }
    }
    res.status(500).json({ error: 'Database error' });
  }
});

// --- GOALS ROUTES ---

app.get('/api/goals', async (req, res) => {
  try {
    const userId = req.query.user_id;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM goals WHERE user_id = ? ORDER BY is_priority DESC, created_at DESC', [userId]);
    
    const formattedRows = rows.map(r => ({
      ...r,
      is_priority: r.is_priority === 1,
      target_amount: parseFloat(r.target_amount),
      saved_amount: parseFloat(r.saved_amount)
    }));
    
    await connection.end();
    res.json(formattedRows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/goals', async (req, res) => {
  try {
    const { user_id, title, description, target_amount, icon, is_priority } = req.body;
    if (!user_id) return res.status(400).json({ error: 'User ID is required' });

    const connection = await mysql.createConnection(dbConfig);
    
    if (is_priority) {
      await connection.execute('UPDATE goals SET is_priority = 0 WHERE user_id = ?', [user_id]);
    }

    const [result] = await connection.execute(
      'INSERT INTO goals (user_id, title, description, target_amount, saved_amount, icon, is_priority) VALUES (?, ?, ?, ?, 0, ?, ?)',
      [user_id, title, description, target_amount, icon, is_priority ? 1 : 0]
    );
    
    await connection.end();
    res.json({ id: result.insertId, user_id, title, description, target_amount, saved_amount: 0, icon, is_priority });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/goals/:id', async (req, res) => {
  let connection;
  try {
    const goalId = req.params.id;
    const { add_amount, user_id } = req.body;
    const parsedAmount = parseFloat(add_amount || 0);
    if (!user_id) return res.status(400).json({ error: 'User ID is required' });
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    const [goalRows] = await connection.execute(
      'SELECT id, user_id, saved_amount, target_amount FROM goals WHERE id = ? LIMIT 1',
      [goalId]
    );
    if (goalRows.length === 0) {
      await connection.rollback();
      await connection.end();
      connection = null;
      return res.status(404).json({ error: 'Goal not found' });
    }
    const goal = goalRows[0];
    if (parseInt(goal.user_id, 10) !== parseInt(user_id, 10)) {
      await connection.rollback();
      await connection.end();
      connection = null;
      return res.status(403).json({ error: 'Goal does not belong to this user' });
    }

    const [walletRows] = await connection.execute(
      'SELECT bca_balance, cash_balance FROM user_wallets WHERE user_id = ? LIMIT 1',
      [user_id]
    );
    const wallet = walletRows[0] || { bca_balance: 0, cash_balance: 0 };
    const bcaBalance = parseFloat(wallet.bca_balance || 0);
    const cashBalance = parseFloat(wallet.cash_balance || 0);
    const totalBalance = bcaBalance + cashBalance;

    if (parsedAmount > totalBalance) {
      await connection.rollback();
      await connection.end();
      connection = null;
      return res.status(400).json({ error: 'Saldo tidak cukup untuk add funds' });
    }

    // Deduct from BCA first, then cash for any remainder.
    const bcaDeduction = Math.min(bcaBalance, parsedAmount);
    const remaining = parsedAmount - bcaDeduction;
    const cashDeduction = Math.min(cashBalance, remaining);
    const nextBca = bcaBalance - bcaDeduction;
    const nextCash = cashBalance - cashDeduction;

    await connection.execute(
      'UPDATE user_wallets SET bca_balance = ?, cash_balance = ? WHERE user_id = ?',
      [nextBca, nextCash, user_id]
    );
    await connection.execute(
      'UPDATE goals SET saved_amount = saved_amount + ? WHERE id = ?',
      [parsedAmount, goalId]
    );

    const [updatedGoalRows] = await connection.execute(
      'SELECT * FROM goals WHERE id = ? LIMIT 1',
      [goalId]
    );

    await connection.commit();
    await connection.end();
    connection = null;

    const updatedGoal = updatedGoalRows[0] || {};
    res.json({
      success: true,
      goalId,
      goal: {
        ...updatedGoal,
        is_priority: updatedGoal.is_priority === 1,
        target_amount: parseFloat(updatedGoal.target_amount || 0),
        saved_amount: parseFloat(updatedGoal.saved_amount || 0)
      },
      wallet: {
        bca_balance: parseFloat(nextBca || 0),
        cash_balance: parseFloat(nextCash || 0)
      }
    });
  } catch (error) {
    console.error(error);
    if (connection) {
      try {
        await connection.rollback();
        await connection.end();
      } catch (rollbackErr) {
        // ignore rollback failure
      }
    }
    res.status(500).json({ error: 'Database error' });
  }
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;

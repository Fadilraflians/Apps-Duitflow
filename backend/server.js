import express from 'express';
import pg from 'pg';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const { Pool } = pg;
const databaseUrl = process.env.DATABASE_URL;
const dbHost = process.env.DB_HOST || '';
const dbCaCert = process.env.DB_CA_CERT?.replace(/\\n/g, '\n');
const isRemoteDatabase = databaseUrl
  ? !['localhost', '127.0.0.1'].includes(new URL(databaseUrl).hostname)
  : Boolean(dbHost && !['localhost', '127.0.0.1'].includes(dbHost));
let connectionString = databaseUrl;
let ssl;
if (isRemoteDatabase && databaseUrl) {
  const parsedUrl = new URL(databaseUrl);
  if (dbCaCert) {
    parsedUrl.searchParams.delete('sslmode');
    parsedUrl.searchParams.delete('uselibpqcompat');
    ssl = { rejectUnauthorized: true, ca: dbCaCert };
  } else {
    // Aiven's sslmode=require encrypts traffic; libpq compatibility keeps
    // node-postgres from interpreting it as certificate verification.
    parsedUrl.searchParams.set('sslmode', 'require');
    parsedUrl.searchParams.set('uselibpqcompat', 'true');
  }
  connectionString = parsedUrl.toString();
} else if (isRemoteDatabase) {
  ssl = { rejectUnauthorized: Boolean(dbCaCert), ...(dbCaCert ? { ca: dbCaCert } : {}) };
}
const pool = new Pool({
  ...(connectionString ? { connectionString } : {
    host: dbHost || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'defaultdb',
    port: Number(process.env.DB_PORT || 5432)
  }),
  ...(ssl ? { ssl } : {}),
  max: Number(process.env.DB_POOL_MAX || 5),
  connectionTimeoutMillis: 10000
});

// Preserve the existing route code's execute/transaction interface while using
// PostgreSQL placeholders and RETURNING for generated IDs.
const getConnection = async () => {
  const client = await pool.connect();
  return {
    execute: async (sql, values = []) => {
      let parameterIndex = 0;
      let query = sql.replace(/\?/g, () => `$${++parameterIndex}`);
      if (/^\s*INSERT\s+INTO/i.test(query) && !/\bRETURNING\b/i.test(query)) {
        query += ' RETURNING id';
      }
      if (/\bON\s+DUPLICATE\s+KEY\s+UPDATE\b/i.test(query)) {
        query = query.replace(/\s+ON\s+DUPLICATE\s+KEY\s+UPDATE\s+/i,
          ' ON CONFLICT (user_id) DO UPDATE SET ')
          .replace(/VALUES\((\w+)\)/gi, 'EXCLUDED.$1');
      }
      const result = await client.query(query, values);
      return [/^\s*INSERT\s+INTO/i.test(sql) ? { insertId: result.rows[0]?.id } : result.rows,
        result.rows];
    },
    beginTransaction: () => client.query('BEGIN'),
    commit: () => client.query('COMMIT'),
    rollback: () => client.query('ROLLBACK'),
    end: async () => client.release()
  };
};

let schemaReady;
const ensureSchema = () => {
  if (!schemaReady) {
    schemaReady = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          full_name VARCHAR(150),
          email VARCHAR(150) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          monthly_limit NUMERIC(15,2) DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS user_wallets (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
          bca_balance NUMERIC(15,2) DEFAULT 0,
          cash_balance NUMERIC(15,2) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS transactions (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          time TIMESTAMP NOT NULL,
          amount NUMERIC(15,2) NOT NULL,
          icon VARCHAR(100) NOT NULL,
          category VARCHAR(100) NOT NULL,
          negative BOOLEAN NOT NULL,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          account_type VARCHAR(50) DEFAULT 'bca'
        );
        CREATE TABLE IF NOT EXISTS goals (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description VARCHAR(255),
          target_amount NUMERIC(15,2) NOT NULL,
          saved_amount NUMERIC(15,2) DEFAULT 0,
          icon VARCHAR(100),
          is_priority BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    })().catch((error) => { schemaReady = null; throw error; });
  }
  return schemaReady;
};
app.use(async (_req, res, next) => {
  try { await ensureSchema(); next(); }
  catch (error) {
    console.error('Database initialization failed:', error.message);
    res.status(503).json({ error: 'Database is unavailable or schema setup failed' });
  }
});

// --- AUTH ROUTES ---

app.post('/api/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const connection = await getConnection();
    
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
    const connection = await getConnection();
    
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
    
    const connection = await getConnection();
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

    const connection = await getConnection();
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

    const connection = await getConnection();
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

    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY time DESC, id DESC',
      [userId]
    );
    
    const formattedRows = rows.map(r => ({
      ...r,
      negative: Boolean(r.negative),
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

    connection = await getConnection();
    await connection.beginTransaction();
    const transactionTime = new Date(time).toISOString();

    const [result] = await connection.execute(
      'INSERT INTO transactions (user_id, title, time, amount, icon, category, negative, account_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, title, transactionTime, parsedAmount, icon, category, Boolean(negative), account]
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

    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM goals WHERE user_id = ? ORDER BY is_priority DESC, created_at DESC', [userId]);
    
    const formattedRows = rows.map(r => ({
      ...r,
      is_priority: Boolean(r.is_priority),
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

    const connection = await getConnection();
    
    if (is_priority) {
      await connection.execute('UPDATE goals SET is_priority = FALSE WHERE user_id = ?', [user_id]);
    }

    const [result] = await connection.execute(
      'INSERT INTO goals (user_id, title, description, target_amount, saved_amount, icon, is_priority) VALUES (?, ?, ?, ?, 0, ?, ?)',
      [user_id, title, description, target_amount, icon, Boolean(is_priority)]
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

    connection = await getConnection();
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
        is_priority: Boolean(updatedGoal.is_priority),
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

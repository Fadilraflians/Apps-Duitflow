import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dump = fs.readFileSync(path.join(root, 'database_dump.sql'), 'utf8');
const { Pool } = pg;
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required');

const parsedUrl = new URL(databaseUrl);
if (!['localhost', '127.0.0.1'].includes(parsedUrl.hostname)) {
  parsedUrl.searchParams.set('sslmode', parsedUrl.searchParams.get('sslmode') || 'require');
  parsedUrl.searchParams.set('uselibpqcompat', 'true');
}
const pool = new Pool({ connectionString: parsedUrl.toString() });

function readInsertRows(table) {
  const prefix = `INSERT INTO \`${table}\` VALUES`;
  const start = dump.indexOf(prefix);
  if (start < 0) return [];

  const rows = [];
  let i = start + prefix.length;
  while (i < dump.length) {
    while (/\s|,/.test(dump[i] || '') && i < dump.length) i++;
    if (dump[i] !== '(') break;
    i++;
    const row = [];

    while (i < dump.length) {
      while (/\s/.test(dump[i] || '') && i < dump.length) i++;
      if (dump[i] === "'") {
        i++;
        let value = '';
        while (i < dump.length) {
          const char = dump[i++];
          if (char === '\\') {
            const escaped = dump[i++];
            const escapes = { 0: '\0', b: '\b', n: '\n', r: '\r', t: '\t', Z: '\x1a' };
            value += escapes[escaped] ?? escaped;
          } else if (char === "'" && dump[i] === "'") {
            value += "'";
            i++;
          } else if (char === "'") {
            break;
          } else {
            value += char;
          }
        }
        row.push(value);
      } else {
        const valueStart = i;
        while (i < dump.length && dump[i] !== ',' && dump[i] !== ')') i++;
        const value = dump.slice(valueStart, i).trim();
        row.push(value.toUpperCase() === 'NULL' ? null : value);
      }

      while (/\s/.test(dump[i] || '') && i < dump.length) i++;
      if (dump[i] === ',') {
        i++;
        continue;
      }
      if (dump[i] === ')') {
        i++;
        break;
      }
      throw new Error(`Could not parse ${table} data from MySQL dump`);
    }
    rows.push(row);
  }
  return rows;
}

const sourceRows = {
  users: readInsertRows('users'),
  user_wallets: readInsertRows('user_wallets'),
  transactions: readInsertRows('transactions'),
  goals: readInsertRows('goals')
};
const client = await pool.connect();
try {
  await client.query('BEGIN');
  for (const row of sourceRows.users) {
    await client.query(
      `INSERT INTO users (id, full_name, email, password, created_at, monthly_limit)
       VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
      [Number(row[0]), row[1], row[2], row[3], row[4], row[5]]
    );
  }
  for (const row of sourceRows.user_wallets) {
    await client.query(
      `INSERT INTO user_wallets (user_id, bca_balance, cash_balance)
       VALUES ($1, $2, $3) ON CONFLICT (user_id) DO NOTHING`,
      [Number(row[0]), row[1], row[2]]
    );
  }
  for (const row of sourceRows.transactions) {
    await client.query(
      `INSERT INTO transactions (id, title, time, amount, icon, category, negative, user_id, account_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
      [Number(row[0]), row[1], row[2], row[3], row[4], row[5], row[6] === '1',
        row[7] === 'NULL' ? null : Number(row[7]), row[8]]
    );
  }
  for (const row of sourceRows.goals) {
    await client.query(
      `INSERT INTO goals (id, user_id, title, description, target_amount, saved_amount, icon, is_priority, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
      [Number(row[0]), Number(row[1]), row[2], row[3], row[4], row[5], row[6],
        row[7] === '1', row[8]]
    );
  }

  for (const table of ['users', 'transactions', 'goals']) {
    await client.query(
      `SELECT setval(pg_get_serial_sequence('${table}', 'id'),
       COALESCE((SELECT MAX(id) FROM ${table}), 1), EXISTS (SELECT 1 FROM ${table}))`
    );
  }
  await client.query('COMMIT');
  console.log(`Imported rows: ${Object.entries(sourceRows).map(([table, rows]) => `${table}=${rows.length}`).join(', ')}`);
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
  await pool.end();
}

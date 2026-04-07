import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [wallet, setWallet] = useState({ bca_balance: 0, cash_balance: 0 });
  const { user } = useContext(AuthContext);

  const getApiBase = () => import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;
  const ACCOUNT_OVERRIDE_KEY = 'duitflow_account_type_overrides_v1';
  const readAccountOverrides = () => {
    try {
      const raw = localStorage.getItem(ACCOUNT_OVERRIDE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  };
  const writeAccountOverrides = (value) => {
    try {
      localStorage.setItem(ACCOUNT_OVERRIDE_KEY, JSON.stringify(value));
    } catch (e) {
      // ignore localStorage write errors
    }
  };
  const normalizeAccountType = (value) => {
    const normalized = String(value || '').trim().toLowerCase();
    if (normalized === 'cash') return 'cash';
    if (normalized === 'bca') return 'bca';
    return '';
  };

  useEffect(() => {
    const loadFinanceData = async () => {
      if (!user) {
        setTransactions([]);
        setWallet({ bca_balance: 0, cash_balance: 0 });
        return;
      }
      try {
        const [txResponse, walletResponse] = await Promise.all([
          fetch(`${getApiBase()}/transactions?user_id=${user.id}`),
          fetch(`${getApiBase()}/wallets?user_id=${user.id}`)
        ]);

        if (txResponse.ok) {
          const data = await txResponse.json();
          const overrides = readAccountOverrides();
          const nextOverrides = { ...overrides };
          const resFormatted = data.map((tx) => {
            const fromServer = normalizeAccountType(tx.account_type);
            const fromOverride = normalizeAccountType(overrides[String(tx.id)]);
            const accountType = fromServer || fromOverride || 'bca';

            if (accountType) {
              nextOverrides[String(tx.id)] = accountType;
            }

            return {
              ...tx,
              amount: parseFloat(tx.amount),
              account_type: accountType
            };
          });
          writeAccountOverrides(nextOverrides);
          setTransactions(resFormatted);
        }

        if (walletResponse.ok) {
          const walletData = await walletResponse.json();
          setWallet({
            bca_balance: parseFloat(walletData.bca_balance || 0),
            cash_balance: parseFloat(walletData.cash_balance || 0)
          });
        }
      } catch (err) {
        console.error('Failed to load finance data from DB:', err);
      }
    };
    loadFinanceData();

    const handleRefreshFinance = () => {
      loadFinanceData();
    };
    window.addEventListener('finance:refresh', handleRefreshFinance);
    return () => {
      window.removeEventListener('finance:refresh', handleRefreshFinance);
    };
  }, [user]);

  const addTransaction = async (newTx) => {
    if (!user) return { ok: false, error: 'User not found' };
    try {
      const txWithUser = { ...newTx, user_id: user.id };
      const response = await fetch(`${getApiBase()}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txWithUser)
      });

      if (response.ok) {
        const savedTx = await response.json();
        savedTx.amount = parseFloat(savedTx.amount);
        savedTx.account_type =
          normalizeAccountType(savedTx.account_type) ||
          normalizeAccountType(txWithUser.account_type) ||
          'bca';
        const overrides = readAccountOverrides();
        overrides[String(savedTx.id)] = savedTx.account_type;
        writeAccountOverrides(overrides);
        setTransactions((prev) => [savedTx, ...prev]);

        const walletResponse = await fetch(`${getApiBase()}/wallets?user_id=${user.id}`);
        if (walletResponse.ok) {
          const walletData = await walletResponse.json();
          setWallet({
            bca_balance: parseFloat(walletData.bca_balance || 0),
            cash_balance: parseFloat(walletData.cash_balance || 0)
          });
        }

        return { ok: true };
      }

      const errorData = await response.json().catch(() => ({}));
      return { ok: false, error: errorData.error || 'Failed to save transaction' };
    } catch (err) {
      console.error('Failed to save transaction to DB:', err);
      return { ok: false, error: 'Network error' };
    }
  };

  const updateWallet = async ({ bca_balance, cash_balance }) => {
    if (!user) return { ok: false, error: 'User not found' };
    try {
      const response = await fetch(`${getApiBase()}/wallets`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, bca_balance, cash_balance })
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        return { ok: false, error: errData.error || 'Failed to update wallet' };
      }
      const data = await response.json();
      setWallet({
        bca_balance: parseFloat(data.bca_balance || 0),
        cash_balance: parseFloat(data.cash_balance || 0)
      });
      return { ok: true };
    } catch (err) {
      console.error('Failed to update wallet in DB:', err);
      return { ok: false, error: 'Network error' };
    }
  };

  const walletBalance = parseFloat(wallet.bca_balance || 0) + parseFloat(wallet.cash_balance || 0);
  const txDerivedBalance = transactions.reduce(
    (acc, curr) => (curr.negative ? acc - curr.amount : acc + curr.amount),
    0
  );
  // Fallback to transaction-derived balance when wallet API is unavailable/empty.
  const currentBalance = walletBalance !== 0 || transactions.length === 0 ? walletBalance : txDerivedBalance;
  const monthlyIncome = transactions
    .filter((tx) => !tx.negative)
    .reduce((acc, curr) => acc + curr.amount, 0);
  const monthlySpend = transactions
    .filter((tx) => tx.negative)
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        setTransactions,
        addTransaction,
        currentBalance,
        monthlyIncome,
        monthlySpend,
        wallet,
        updateWallet
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

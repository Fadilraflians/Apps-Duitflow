import { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { localMonthKey } from '../utils/dates';

export const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [wallet, setWallet] = useState({ bca_balance: 0, cash_balance: 0 });
  const [accounts, setAccounts] = useState([]);
  const { user } = useContext(AuthContext);

  const [showBalance, setShowBalanceState] = useState(() => {
    try {
      const saved = localStorage.getItem('duitflow_showBalance');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const setShowBalance = (val) => {
    setShowBalanceState(val);
    try {
      localStorage.setItem('duitflow_showBalance', JSON.stringify(val));
    } catch {}
  };

  const getApiBase = () => import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`);
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
        setAccounts([]);
        return;
      }
      try {
        const [txResponse, walletResponse] = await Promise.all([
          fetch(`${getApiBase()}/transactions?user_id=${user.id}`),
          fetch(`${getApiBase()}/wallets?user_id=${user.id}`)
        ]);

        if (txResponse.ok) {
          const data = await txResponse.json();
          const resFormatted = data.map((tx) => {
            const legacyType = normalizeAccountType(tx.account_type) || 'bca';

            return {
              ...tx,
              amount: parseFloat(tx.amount),
              account_type: tx.account_type || legacyType,
              account_name: tx.account_name || (legacyType === 'cash' ? 'Cash' : 'Bank BCA')
            };
          });
          setTransactions(resFormatted);
        }

        if (walletResponse.ok) {
          const walletData = await walletResponse.json();
          setWallet({
            bca_balance: parseFloat(walletData.bca_balance || 0),
            cash_balance: parseFloat(walletData.cash_balance || 0)
          });
          setAccounts(Array.isArray(walletData.accounts)
            ? walletData.accounts.map((account) => ({ ...account, balance: parseFloat(account.balance || 0) }))
            : []);
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
        savedTx.account_type = savedTx.account_type || txWithUser.account_type || 'bank';
        savedTx.account_name = savedTx.account_name || txWithUser.account_name || 'Akun';
        setTransactions((prev) => prev.some((tx) => String(tx.id) === String(savedTx.id))
          ? prev
          : [savedTx, ...prev]);

        const walletResponse = await fetch(`${getApiBase()}/wallets?user_id=${user.id}`);
        if (walletResponse.ok) {
          const walletData = await walletResponse.json();
          setWallet({
            bca_balance: parseFloat(walletData.bca_balance || 0),
            cash_balance: parseFloat(walletData.cash_balance || 0)
          });
          setAccounts(Array.isArray(walletData.accounts)
            ? walletData.accounts.map((account) => ({ ...account, balance: parseFloat(account.balance || 0) }))
            : []);
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

  const addAccount = async ({ name, account_type, initial_balance }) => {
    if (!user) return { ok: false, error: 'User not found' };
    try {
      const response = await fetch(`${getApiBase()}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, name, account_type, initial_balance })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return { ok: false, error: data.error || 'Gagal menambah akun' };
      setAccounts((previous) => [...previous, { ...data, balance: parseFloat(data.balance || 0) }]);
      return { ok: true, account: data };
    } catch (err) {
      console.error('Failed to create account:', err);
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
      if (Array.isArray(data.accounts)) {
        setAccounts(data.accounts.map((account) => ({ ...account, balance: parseFloat(account.balance || 0) })));
      }
      return { ok: true };
    } catch (err) {
      console.error('Failed to update wallet in DB:', err);
      return { ok: false, error: 'Network error' };
    }
  };

  const walletBalance = accounts.length
    ? accounts.reduce((sum, account) => sum + parseFloat(account.balance || 0), 0)
    : parseFloat(wallet.bca_balance || 0) + parseFloat(wallet.cash_balance || 0);
  const txDerivedBalance = transactions.reduce(
    (acc, curr) => (curr.negative ? acc - curr.amount : acc + curr.amount),
    0
  );
  // Fallback to transaction-derived balance when wallet API is unavailable/empty.
  const currentBalance = walletBalance !== 0 || transactions.length === 0 ? walletBalance : txDerivedBalance;
  const currentMonth = localMonthKey(new Date());
  const currentMonthTransactions = transactions.filter((tx) => localMonthKey(tx.time) === currentMonth);
  const monthlyIncome = currentMonthTransactions
    .filter((tx) => !tx.negative)
    .reduce((acc, curr) => acc + curr.amount, 0);
  const monthlySpend = currentMonthTransactions
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
        accounts,
        addAccount,
        updateWallet,
        showBalance,
        setShowBalance
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

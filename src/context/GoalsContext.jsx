import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const GoalsContext = createContext();

export const GoalsProvider = ({ children }) => {
  const [goals, setGoals] = useState([]);
  const { user } = useContext(AuthContext);

  const getApiBase = () => import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`);
  const getApiUrl = () => `${getApiBase()}/goals`;

  useEffect(() => {
    const fetchGoals = async () => {
      if (!user) {
        setGoals([]);
        return;
      }
      try {
        const response = await fetch(`${getApiUrl()}?user_id=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setGoals(data);
        }
      } catch (err) {
        console.error("Failed to load goals", err);
      }
    };
    fetchGoals();
  }, [user]);

  const addGoal = async (newGoal) => {
    if (!user) return;
    try {
      const goalWithUser = { ...newGoal, user_id: user.id };
      const response = await fetch(getApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalWithUser)
      });
      if (response.ok) {
        const savedGoal = await response.json();
        // Determine correct placement: priority goes to top
        if (savedGoal.is_priority) {
          setGoals(prev => {
            const unsetPriority = prev.map(g => ({...g, is_priority: false}));
            return [savedGoal, ...unsetPriority];
          });
        } else {
          setGoals(prev => [...prev, savedGoal]);
        }
      }
    } catch (err) {
      console.error("Failed to save goal", err);
    }
  };

  const addFundsToGoal = async (goalId, amount) => {
    try {
      const parsedAmount = parseFloat(amount || 0);
      if (!parsedAmount || parsedAmount <= 0) {
        return { ok: false, error: 'Amount must be greater than 0' };
      }
      if (user?.id) {
        const walletRes = await fetch(`${getApiBase()}/wallets?user_id=${user.id}`);
        if (walletRes.ok) {
          const walletData = await walletRes.json();
          const bca = parseFloat(walletData.bca_balance || 0);
          const cash = parseFloat(walletData.cash_balance || 0);
          if (parsedAmount > bca + cash) {
            return { ok: false, error: 'Saldo tidak cukup untuk add funds' };
          }
        }
      }

      const response = await fetch(`${getApiUrl()}/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ add_amount: parsedAmount, user_id: user?.id })
      });
      if (response.ok) {
        const data = await response.json();
        const nextGoal = data.goal;
        setGoals(prev =>
          prev.map(g =>
            g.id === goalId
              ? {
                  ...g,
                  ...nextGoal,
                  saved_amount: parseFloat(nextGoal?.saved_amount ?? g.saved_amount),
                  target_amount: parseFloat(nextGoal?.target_amount ?? g.target_amount)
                }
              : g
          )
        );

        // Fallback for older backend response that may not deduct wallets yet.
        if (!data.wallet && user?.id) {
          const walletRes = await fetch(`${getApiBase()}/wallets?user_id=${user.id}`);
          if (walletRes.ok) {
            const walletData = await walletRes.json();
            const bca = parseFloat(walletData.bca_balance || 0);
            const cash = parseFloat(walletData.cash_balance || 0);
            const total = bca + cash;

            if (parsedAmount > total) {
              return { ok: false, error: 'Saldo tidak cukup untuk add funds' };
            }

            const bcaDeduction = Math.min(bca, parsedAmount);
            const cashDeduction = parsedAmount - bcaDeduction;
            const nextBca = Math.max(0, bca - bcaDeduction);
            const nextCash = Math.max(0, cash - cashDeduction);

            await fetch(`${getApiBase()}/wallets`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: user.id,
                bca_balance: nextBca,
                cash_balance: nextCash
              })
            });
          }
        }

        window.dispatchEvent(new Event('finance:refresh'));
        return { ok: true };
      }
      const errData = await response.json().catch(() => ({}));
      return { ok: false, error: errData.error || 'Failed to add funds' };
    } catch (err) {
      console.error("Failed to add funds", err);
      return { ok: false, error: 'Network error' };
    }
  };

  const deleteGoal = async (goalId) => {
    try {
      if (user?.id) {
        const response = await fetch(`${getApiUrl()}/${goalId}?user_id=${user.id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setGoals(prev => prev.filter(g => g.id !== goalId));
          return { ok: true };
        }
      }
      return { ok: false, error: 'Failed to delete goal' };
    } catch (err) {
      console.error("Failed to delete goal", err);
      return { ok: false, error: 'Network error' };
    }
  };

  return (
    <GoalsContext.Provider value={{ goals, addGoal, addFundsToGoal, deleteGoal }}>
      {children}
    </GoalsContext.Provider>
  );
};

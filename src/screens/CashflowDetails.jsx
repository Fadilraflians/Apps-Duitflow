import React, { useContext, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNavBar from '../components/BottomNavBar';
import { FinanceContext } from '../context/FinanceContext';

export default function CashflowDetails() {
  const { type } = useParams();
  const navigate = useNavigate();
  const { transactions } = useContext(FinanceContext);
  const mode = type === 'spend' ? 'spend' : 'income';

  const formatIDR = (value) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);

  const filtered = useMemo(
    () =>
      [...transactions]
        .filter((tx) => (mode === 'spend' ? tx.negative : !tx.negative))
        .sort((a, b) => new Date(b.time) - new Date(a.time)),
    [transactions, mode]
  );

  return (
    <div className="bg-[#f5f7f9] dark:bg-slate-950 min-h-screen pb-28 text-[#2c2f31] dark:text-slate-100">
      <header className="w-full top-0 sticky z-50 bg-[#f5f7f9]/90 dark:bg-slate-950/90 backdrop-blur border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between px-6 py-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-[#006a2d]"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back
        </button>
        <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-sm tracking-[0.18em] text-[#006a2d] dark:text-[#6bff8f]">
          DETAIL {mode.toUpperCase()}
        </h1>
        <span className="w-6" />
      </header>

      <main className="px-6 max-w-3xl mx-auto mt-4">
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/70 dark:border-slate-800 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
          <div className="space-y-2 max-h-[68vh] overflow-y-auto pr-1">
            {filtered.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                <div>
                  <p className="text-sm font-semibold">{tx.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {tx.category} • {new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' }).format(new Date(tx.time))}
                  </p>
                </div>
                <p className={`text-sm font-bold ${mode === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {mode === 'income' ? '+' : '-'}
                  {formatIDR(tx.amount)}
                </p>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-6">
                Tidak ada transaksi {mode}.
              </p>
            )}
          </div>
        </section>
      </main>

      <BottomNavBar />
    </div>
  );
}


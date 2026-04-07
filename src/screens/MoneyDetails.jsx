import React, { useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/BottomNavBar';
import { FinanceContext } from '../context/FinanceContext';

export default function MoneyDetails() {
  const navigate = useNavigate();
  const { wallet, transactions } = useContext(FinanceContext);

  const formatIDR = (value) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);

  const { bcaAmount, cashAmount, totalAmount } = useMemo(() => {
    const walletBca = parseFloat(wallet?.bca_balance || 0);
    const walletCash = parseFloat(wallet?.cash_balance || 0);
    const walletTotal = walletBca + walletCash;

    if (walletTotal <= 0 && transactions.length > 0) {
      let txBca = 0;
      let txCash = 0;
      transactions.forEach((tx) => {
        const account = String(tx?.account_type || '').trim().toLowerCase() === 'cash' ? 'cash' : 'bca';
        const delta = tx.negative ? -tx.amount : tx.amount;
        if (account === 'cash') txCash += delta;
        else txBca += delta;
      });

      return {
        bcaAmount: Math.round(Math.max(0, txBca)),
        cashAmount: Math.round(Math.max(0, txCash)),
        totalAmount: Math.round(Math.max(0, txBca + txCash))
      };
    }

    return {
      bcaAmount: Math.round(Math.max(0, walletBca)),
      cashAmount: Math.round(Math.max(0, walletCash)),
      totalAmount: Math.round(Math.max(0, walletTotal))
    };
  }, [wallet, transactions]);

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
          DETAIL UANG SAYA
        </h1>
        <span className="w-6" />
      </header>

      <main className="px-6 mt-5 max-w-2xl mx-auto space-y-4">
        <section className="bg-gradient-to-r from-[#0b8f4a] to-[#065f46] text-white rounded-2xl p-6 shadow-[0_12px_32px_rgba(6,95,70,0.25)]">
          <p className="text-[11px] uppercase tracking-widest font-bold text-emerald-100">Total Uang Saya</p>
          <h2 className="text-3xl font-extrabold tracking-tight mt-2">{formatIDR(Math.max(totalAmount, 0))}</h2>
          <p className="text-xs text-emerald-100 mt-1">Ringkasan dana yang bisa dipakai saat ini.</p>
        </section>

        <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/70 dark:border-slate-800 shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                <span className="material-symbols-outlined">account_balance</span>
              </div>
              <div>
                <p className="font-bold text-sm">Bank BCA</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tabungan utama</p>
              </div>
            </div>
            <p className="w-44 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-right font-bold">
              {formatIDR(bcaAmount)}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div>
                <p className="font-bold text-sm">Cash</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Uang tunai</p>
              </div>
            </div>
            <p className="w-44 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-right font-bold">
              {formatIDR(cashAmount)}
            </p>
          </div>
        </section>
      </main>

      <BottomNavBar />
    </div>
  );
}


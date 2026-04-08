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
        {/* Hero Balance Banner */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0c5931] via-[#0b8f4a] to-[#0fd26c] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-white rounded-3xl p-8 shadow-[0_16px_40px_rgba(11,143,74,0.3)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)] group">
          {/* Decorative Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 w-full h-full bg-emerald-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-emerald-200/80 text-sm">account_balance_wallet</span>
              <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-emerald-100/90 dark:text-slate-400">Total Uang Saya</p>
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tighter drop-shadow-md mb-2">
              {formatIDR(Math.max(totalAmount, 0))}
            </h2>
            <div className="inline-flex items-center gap-2 bg-black/10 dark:bg-black/20 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-full mt-2">
               <span className="material-symbols-outlined text-emerald-200 text-xs">info</span>
               <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-50 dark:text-slate-300">Ringkasan dana yang bisa dipakai</p>
            </div>
          </div>
        </section>

        {/* Detailed Accounts List */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-none space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0b8f4a] to-emerald-300 opacity-50"></div>
          <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-slate-800 dark:text-slate-200 mb-2">Rincian Akun</h3>
          
          <div className="group flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700/50 gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined">account_balance</span>
              </div>
              <div>
                <p className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-slate-900 dark:text-slate-100">Bank BCA</p>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md mt-1 inline-block">Tabungan utama</p>
              </div>
            </div>
            <div className="w-full sm:w-auto relative">
              <p className="w-full sm:w-48 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-right font-['Plus_Jakarta_Sans'] font-bold text-slate-900 dark:text-slate-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-colors group-hover:border-blue-200 dark:group-hover:border-blue-800">
                {formatIDR(bcaAmount)}
              </p>
            </div>
          </div>
          
          <div className="w-full h-px bg-slate-100 dark:bg-slate-800/60"></div>

          <div className="group flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700/50 gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-950/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div>
                <p className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-slate-900 dark:text-slate-100">Cash</p>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md mt-1 inline-block">Uang tunai</p>
              </div>
            </div>
            <div className="w-full sm:w-auto relative">
              <p className="w-full sm:w-48 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-right font-['Plus_Jakarta_Sans'] font-bold text-slate-900 dark:text-slate-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-colors group-hover:border-amber-200 dark:group-hover:border-amber-800">
                {formatIDR(cashAmount)}
              </p>
            </div>
          </div>
        </section>
      </main>

      <BottomNavBar />
    </div>
  );
}


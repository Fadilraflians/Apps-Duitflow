import React, { useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FinanceContext } from '../context/FinanceContext';
import BottomNavBar from '../components/BottomNavBar';

export default function Transactions() {
  const { transactions } = useContext(FinanceContext);
  const [activeChart, setActiveChart] = useState('income');
  const navigate = useNavigate();
  const accountLabel = (tx) =>
    String(tx.account_type || '').trim().toLowerCase() === 'cash' ? 'Cash' : 'Bank BCA';

  const formatIDR = (value) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  // Build monthly income + spend series for current month and 2 months before
  const monthlySeries = useMemo(() => {
    const monthMap = new Map();

    transactions.forEach((tx) => {
      const d = new Date(tx.time);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
      const prev = monthMap.get(key) || { key, label, income: 0, spend: 0 };
      if (tx.negative) prev.spend += tx.amount;
      else prev.income += tx.amount;
      monthMap.set(key, prev);
    });

    const result = [];
    const now = new Date();
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(now.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
      const row = monthMap.get(key) || { income: 0, spend: 0 };
      result.push({ key, label, income: row.income || 0, spend: row.spend || 0 });
    }

    return result;
  }, [transactions]);

  const maxMonthly = Math.max(
    ...monthlySeries.map((m) => Math.max(m.income, m.spend)),
    0
  );
  const chartPad = { left: 8, right: 6 };
  const xAt = (idx, total) => {
    if (total <= 1) return 50;
    return chartPad.left + (idx / (total - 1)) * (100 - chartPad.left - chartPad.right);
  };

  const sortedTx = [...transactions].sort(
    (a, b) => {
      const byTime = new Date(b.time).getTime() - new Date(a.time).getTime();
      if (byTime !== 0) return byTime;
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    }
  );

  const [filterDate, setFilterDate] = useState('');
  const filteredTx = useMemo(() => {
    if (!filterDate) return sortedTx;
    return sortedTx.filter(tx => {
      const d = new Date(tx.time);
      const tzOffset = d.getTimezoneOffset() * 60000;
      const localISOTime = new Date(d - tzOffset).toISOString().slice(0, 10);
      return localISOTime === filterDate;
    });
  }, [sortedTx, filterDate]);

  return (
    <div className="bg-[#f5f7f9] dark:bg-slate-950 min-h-screen pb-24 text-[#2c2f31] dark:text-slate-100">
      <header className="w-full top-0 sticky z-50 bg-[#f5f7f9] dark:bg-slate-950 flex items-center justify-between px-6 py-4 border-b border-slate-200/60 dark:border-slate-800">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-[#006a2d]"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back
        </button>
        <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-sm tracking-[0.2em] text-[#006a2d] dark:text-[#6bff8f]">
          TRANSACTIONS
        </h1>
        <span className="w-6" />
      </header>

      <main className="px-6 max-w-3xl mx-auto mt-4 space-y-6">
        {/* Monthly Chart */}
        {/* Monthly Chart */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)] dark:border dark:border-slate-800">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mb-6">
            <button 
              onClick={() => setActiveChart('income')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${activeChart === 'income' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Uang Masuk
            </button>
            <button 
              onClick={() => setActiveChart('spend')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${activeChart === 'spend' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Uang Keluar
            </button>
          </div>

          {activeChart === 'income' ? (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <div className="mb-4">
                <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-base">Grafik Uang Masuk Bulanan</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Total uang masuk 3 bulan terakhir.</p>
              </div>
              <div className="relative h-40 mt-4 max-w-full overflow-hidden">
                <svg className="absolute inset-0 w-full h-full overflow-visible">
                  <line x1="8%" y1="85%" x2="94%" y2="85%" stroke="rgba(148,163,184,0.28)" strokeWidth="1" />
                  {monthlySeries.map((m, idx) => {
                    if (idx === 0) return null;
                    const prev = monthlySeries[idx - 1];
                    const x1 = xAt(idx - 1, monthlySeries.length);
                    const x2 = xAt(idx, monthlySeries.length);
                    const yScale = Math.max(...monthlySeries.map(x=>x.income)) || 1;
                    const y1 = 85 - (prev.income / yScale) * 60;
                    const y2 = 85 - (m.income / yScale) * 60;
                    return (
                      <line key={`income-${m.key}`} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke="#10b981" strokeWidth="2.25" strokeLinecap="round" />
                    );
                  })}
                  {monthlySeries.map((m, idx) => {
                    const x = xAt(idx, monthlySeries.length);
                    const yScale = Math.max(...monthlySeries.map(x=>x.income)) || 1;
                    const yIncome = 85 - (m.income / yScale) * 60;
                    const displayIncome = m.income >= 1000000 ? (m.income / 1000000).toFixed(1).replace('.0', '') + 'M' : (m.income >= 1000 ? (m.income / 1000).toFixed(0) + 'k' : (m.income > 0 ? m.income.toString() : ''));
                    return (
                      <g key={`minc-dot-${m.key}`}>
                        {displayIncome && <text x={`${x}%`} y={`${yIncome - 8}%`} textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="bold" className="dark:fill-emerald-400 select-none pointer-events-none drop-shadow-sm">{displayIncome}</text>}
                        <circle cx={`${x}%`} cy={`${yIncome}%`} r="3.5" fill="#10b981" stroke="#ecfdf5" strokeWidth="1.5"><title>{`${m.label} Income: ${formatIDR(m.income)}`}</title></circle>
                      </g>
                    );
                  })}
                </svg>
                <div className="absolute inset-x-0 bottom-0 flex justify-between text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                  {monthlySeries.map((m) => <span key={`mil-${m.key}`}>{m.label}</span>)}
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <div className="mb-4">
                <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-base">Grafik Uang Keluar Bulanan</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Total pengeluaran 3 bulan terakhir.</p>
              </div>
              <div className="relative h-40 mt-4 max-w-full overflow-hidden">
                <svg className="absolute inset-0 w-full h-full overflow-visible">
                  <line x1="8%" y1="85%" x2="94%" y2="85%" stroke="rgba(148,163,184,0.28)" strokeWidth="1" />
                  {monthlySeries.map((m, idx) => {
                    if (idx === 0) return null;
                    const prev = monthlySeries[idx - 1];
                    const x1 = xAt(idx - 1, monthlySeries.length);
                    const x2 = xAt(idx, monthlySeries.length);
                    const yScale = Math.max(...monthlySeries.map(x=>x.spend)) || 1;
                    const y1 = 85 - (prev.spend / yScale) * 60;
                    const y2 = 85 - (m.spend / yScale) * 60;
                    return (
                      <line key={`spend-${m.key}`} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke="#f43f5e" strokeWidth="2.25" strokeLinecap="round" />
                    );
                  })}
                  {monthlySeries.map((m, idx) => {
                    const x = xAt(idx, monthlySeries.length);
                    const yScale = Math.max(...monthlySeries.map(x=>x.spend)) || 1;
                    const ySpend = 85 - (m.spend / yScale) * 60;
                    const displaySpend = m.spend >= 1000000 ? (m.spend / 1000000).toFixed(1).replace('.0', '') + 'M' : (m.spend >= 1000 ? (m.spend / 1000).toFixed(0) + 'k' : (m.spend > 0 ? m.spend.toString() : ''));
                    return (
                      <g key={`msp-dot-${m.key}`}>
                        {displaySpend && <text x={`${x}%`} y={`${ySpend - 8}%`} textAnchor="middle" fill="#f43f5e" fontSize="9" fontWeight="bold" className="dark:fill-rose-400 select-none pointer-events-none drop-shadow-sm">{displaySpend}</text>}
                        <circle cx={`${x}%`} cy={`${ySpend}%`} r="3.5" fill="#f43f5e" stroke="#fff1f2" strokeWidth="1.5"><title>{`${m.label} Spend: ${formatIDR(m.spend)}`}</title></circle>
                      </g>
                    );
                  })}
                </svg>
                <div className="absolute inset-x-0 bottom-0 flex justify-between text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                  {monthlySeries.map((m) => <span key={`msl-${m.key}`}>{m.label}</span>)}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Transactions Table/List */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)] dark:border dark:border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-base">Semua Transaksi</h2>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {filterDate && (
                <button
                  type="button"
                  onClick={() => setFilterDate('')}
                  className="text-[10px] uppercase font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Clear
                </button>
              )}
              <input 
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 flex-1 sm:flex-none text-slate-600 dark:text-slate-300"
              />
            </div>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
            {filteredTx.length} items found
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTx.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      tx.negative
                        ? 'bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400'
                        : 'bg-emerald-100 dark:bg-emerald-950/50 text-[#006a2d] dark:text-[#6bff8f]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{tx.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{tx.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {tx.category} •{' '}
                      {new Intl.DateTimeFormat('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: '2-digit'
                      }).format(new Date(tx.time))}
                    </p>
                    <span
                      className={`inline-flex mt-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                        accountLabel(tx) === 'Cash'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                      }`}
                    >
                      {accountLabel(tx)}
                    </span>
                  </div>
                </div>
                <div
                  className={`text-sm font-bold ${
                    tx.negative ? 'text-slate-800 dark:text-slate-200' : 'text-emerald-600'
                  }`}
                >
                  {tx.negative ? '-' : '+'}
                  {formatIDR(tx.amount)}
                </div>
              </div>
            ))}

            {filteredTx.length === 0 && (
              <div className="text-center py-10 text-sm text-slate-500 dark:text-slate-400">
                {filterDate ? 'Tidak ada transaksi pada tanggal ini.' : 'Belum ada transaksi yang tercatat.'}
              </div>
            )}
          </div>
        </section>
      </main>

      <BottomNavBar />
    </div>
  );
}


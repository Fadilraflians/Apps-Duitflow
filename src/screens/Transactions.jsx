import React, { useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FinanceContext } from '../context/FinanceContext';
import BottomNavBar from '../components/BottomNavBar';

export default function Transactions() {
  const { transactions } = useContext(FinanceContext);
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
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)] dark:border dark:border-slate-800">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-base">Grafik Pengeluaran Bulanan</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Perbandingan uang masuk dan spend 3 bulan terakhir (termasuk bulan ini).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-bold mb-2">
            <span className="inline-flex items-center gap-1 text-emerald-600"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Income</span>
            <span className="inline-flex items-center gap-1 text-rose-600"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" />Spend</span>
          </div>
          <div className="relative h-40 mt-4">
            <svg className="absolute inset-0 w-full h-full">
              <line
                x1="8%"
                y1="85%"
                x2="94%"
                y2="85%"
                stroke="rgba(148,163,184,0.28)"
                strokeWidth="1"
              />
              {monthlySeries.map((m, idx) => {
                if (idx === 0) return null;
                const prev = monthlySeries[idx - 1];
                const x1 = xAt(idx - 1, monthlySeries.length);
                const x2 = xAt(idx, monthlySeries.length);
                const yScale = maxMonthly || 1;
                const y1 = 100 - (prev.income / yScale) * 75;
                const y2 = 100 - (m.income / yScale) * 75;
                return (
                  <polyline
                    key={`income-${m.key}`}
                    points={`${x1} ${y1}, ${x2} ${y2}`}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                  />
                );
              })}
              {monthlySeries.map((m, idx) => {
                if (idx === 0) return null;
                const prev = monthlySeries[idx - 1];
                const x1 = xAt(idx - 1, monthlySeries.length);
                const x2 = xAt(idx, monthlySeries.length);
                const yScale = maxMonthly || 1;
                const y1 = 100 - (prev.spend / yScale) * 75;
                const y2 = 100 - (m.spend / yScale) * 75;
                return (
                  <polyline
                    key={`spend-${m.key}`}
                    points={`${x1} ${y1}, ${x2} ${y2}`}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                  />
                );
              })}
              {monthlySeries.map((m, idx) => {
                const x = xAt(idx, monthlySeries.length);
                const yScale = maxMonthly || 1;
                const yIncome = 100 - (m.income / yScale) * 75;
                const ySpend = 100 - (m.spend / yScale) * 75;
                return (
                  <g key={`m-dot-${m.key}`}>
                    <circle
                      cx={`${x}%`}
                      cy={`${yIncome}%`}
                      r="4"
                      fill={idx === monthlySeries.length - 1 ? '#059669' : '#10b981'}
                      stroke="#ecfdf5"
                      strokeWidth="1.5"
                    >
                      <title>{`${m.label} Income: ${formatIDR(m.income)}`}</title>
                    </circle>
                    <circle
                      cx={`${x}%`}
                      cy={`${ySpend}%`}
                      r="4"
                      fill="#f43f5e"
                      stroke="#fff1f2"
                      strokeWidth="1.5"
                    >
                      <title>{`${m.label} Spend: ${formatIDR(m.spend)}`}</title>
                    </circle>
                  </g>
                );
              })}
            </svg>
            <div className="absolute inset-x-0 bottom-0 flex justify-between text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
              {monthlySeries.map((m) => (
                <span key={`m-label-${m.key}`}>{m.label}</span>
              ))}
            </div>
          </div>
          <p className="text-[11px] mt-3 text-slate-500 dark:text-slate-400">
            {maxMonthly > 0
              ? 'Hijau = uang masuk, merah = uang keluar (spend).'
              : 'Belum ada data pencatatan transaksi.'}
          </p>
        </section>

        {/* Transactions Table/List */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)] dark:border dark:border-slate-800">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-base">Semua Transaksi</h2>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {sortedTx.length} items
            </span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {sortedTx.map((tx) => (
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

            {sortedTx.length === 0 && (
              <div className="text-center py-10 text-sm text-slate-500 dark:text-slate-400">
                Belum ada transaksi yang tercatat.
              </div>
            )}
          </div>
        </section>
      </main>

      <BottomNavBar />
    </div>
  );
}


import React, { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BottomNavBar from '../components/BottomNavBar';
import { FinanceContext } from '../context/FinanceContext';
import { AuthContext } from '../context/AuthContext';

export default function Analytics() {
  const { transactions, monthlySpend, currentBalance } = useContext(FinanceContext);
  const { user } = useContext(AuthContext);
  const firstName = user?.full_name?.split(' ')?.[0] || user?.email?.split('@')?.[0] || 'Guest';
  const [selectedCategory, setSelectedCategory] = useState(null);
  const formatCompactIDR = (value) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value || 0);
  const formatIDR = (value) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  const currentMonthLabel = new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const calculateCategoryDistribution = () => {
    const expenses = transactions.filter(tx => tx.negative);
    const categoryTotals = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

    const getColors = (cat) => {
      switch(cat) {
        case 'Food': return { colorName: 'primary', hex: '#006a2d', icon: 'restaurant' };
        case 'Transport': return { colorName: 'tertiary', hex: '#006575', icon: 'directions_car' };
        case 'Shopping': return { colorName: 'secondary', hex: '#006946', icon: 'shopping_cart' };
         case 'Leisure': return { colorName: 'primary-container', hex: '#6bff8f', icon: 'theater_comedy' };
         case 'Bills': return { colorName: 'error', hex: '#b31b25', icon: 'bolt' };
        default: return { colorName: 'surface-container-highest', hex: '#d9dde0', icon: 'category' };
      }
    };

    const categories = Object.keys(categoryTotals).map(cat => {
      const percentage = monthlySpend > 0 ? (categoryTotals[cat] / monthlySpend) * 100 : 0;
      return { 
        name: cat, 
        amount: categoryTotals[cat], 
        percentStr: `${Math.round(percentage)}%`,
        percentage,
        ...getColors(cat)
      };
    }).sort((a, b) => b.amount - a.amount);

    return categories;
  };

  const categories = useMemo(() => calculateCategoryDistribution(), [transactions, monthlySpend]);

  const circleLength = 502;
  let currentOffset = 0;
  
  const generateChartSegments = () => {
    return categories.map((cat) => {
      const segLength = (cat.percentage / 100) * circleLength;
      const segment = (
        <circle 
          key={cat.name}
          className={`text-${cat.colorName}`} 
          cx="96" cy="96" 
          fill="transparent" 
          r="80" 
          stroke={cat.hex} 
          strokeDasharray={`${segLength} ${circleLength - segLength}`} 
          strokeDashoffset={-currentOffset} 
          strokeWidth="20">
        </circle>
      );
      currentOffset += segLength;
      return segment;
    });
  };

  // Build income/spend time-series for 7 consecutive days ending at latest transaction date
  const cashflowSeries = useMemo(() => {
    const dailyMap = new Map();
    let latestDate = transactions.length > 0 ? new Date(transactions[0].time) : new Date();

    transactions.forEach((tx) => {
      const d = new Date(tx.time);
      if (d > latestDate) latestDate = d;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
      const label = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      const prev = dailyMap.get(key) || { key, label, income: 0, spend: 0 };
      if (tx.negative) {
        prev.spend += tx.amount;
      } else {
        prev.income += tx.amount;
      }
      dailyMap.set(key, prev);
    });

    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(latestDate);
      d.setDate(latestDate.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
      const row = dailyMap.get(key) || { income: 0, spend: 0 };
      result.push({
        key,
        label: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        income: row.income || 0,
        spend: row.spend || 0
      });
    }

    return result;
  }, [transactions]);

  const maxDaily = Math.max(
    0,
    ...cashflowSeries.map((d) => Math.max(d.income, d.spend))
  );
  const dailyRangeLabel =
    cashflowSeries[0]?.label === cashflowSeries[cashflowSeries.length - 1]?.label
      ? cashflowSeries[0]?.label
      : `${cashflowSeries[0]?.label} - ${cashflowSeries[cashflowSeries.length - 1]?.label}`;

  const categoryTransactions = useMemo(() => {
    if (!selectedCategory) return [];
    return [...transactions]
      .filter((tx) => tx.negative && tx.category === selectedCategory)
      .sort((a, b) => new Date(b.time) - new Date(a.time));
  }, [transactions, selectedCategory]);
  const chartPad = { left: 6, right: 6 };
  const xAt = (idx, total) => {
    if (total <= 1) return 50;
    return chartPad.left + (idx / (total - 1)) * (100 - chartPad.left - chartPad.right);
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32">
      <header className="w-full top-0 sticky z-50 bg-[#f5f7f9] dark:bg-slate-950 flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-container flex items-center justify-center">
            <img alt="User profile avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCISr3xVrhcxN-TIZ_oVcpBC9j0tYqm2vpjBo_jNJhvbKpqRW7tWsa1TQtoz7jhvrOD_5WvZGg4i_FN9xIdSi4TH7qIc2lOdjCREvMuHpkLQfkamPNHShxlD0_kDQgevrF5MrdH2OFXoQ8qsvlQBLl9gJSBkgLLlSS6vn67CZVahLpR6WNi41pyqNGkmBHRMoEsmHmBo-Ubqo8Pf5HxC9RjSOa9Nhs8wZtq06YNzgZLZCfAb31kePv4UBQLYwj2Z8qyzXasaRDatzQ5" />
          </div>
          <span className="text-2xl font-bold text-[#006a2d] dark:text-[#6bff8f] tracking-tight">{firstName}</span>
        </div>
        <button className="material-symbols-outlined text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-full p-2 transition-transform active:scale-95">
          notifications
        </button>
      </header>

      <main className="px-6 max-w-4xl mx-auto space-y-8 mt-4">
        <section className="space-y-1">
          <span className="font-label text-[0.6875rem] font-bold uppercase tracking-widest text-on-surface-variant">Your spending narrative</span>
          <h1 className="text-4xl font-extrabold text-on-surface tracking-tight">Monthly Analytics</h1>
        </section>

        <section className="bg-gradient-to-r from-[#0b8f4a] to-[#065f46] text-white rounded-2xl p-5 shadow-[0_12px_32px_rgba(6,95,70,0.25)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-widest font-bold text-emerald-100">Jumlah Uang Saya</p>
              <h2 className="text-3xl font-extrabold tracking-tight mt-2">{formatIDR(Math.abs(currentBalance))}</h2>
              <p className="text-xs text-emerald-100 mt-1">
                {currentBalance < 0 ? 'Saldo saat ini minus' : 'Saldo saat ini positif'}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
          </div>
          <Link
            to="/money-details"
            className="mt-4 inline-flex items-center gap-1 bg-white/20 hover:bg-white/25 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors"
          >
            Lihat Detail Uang Saya
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </Link>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 bg-surface-container-lowest rounded-xl p-8 shadow-[0_8px_24px_rgba(0,0,0,0.04)] relative overflow-hidden">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-lg font-bold">Expense Distribution</h2>
                <p className="text-sm text-on-surface-variant">Periode: {currentMonthLabel}</p>
              </div>
              <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">High Growth</span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="relative w-56 h-56 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-surface-container" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeWidth="20"></circle>
                  {generateChartSegments()}
                </svg>
                <div className="absolute w-[9.5rem] h-[9.5rem] rounded-full bg-surface-container-lowest shadow-[0_8px_20px_rgba(0,0,0,0.08)] border border-surface-container/60 flex flex-col items-center justify-center text-center px-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Total Spend</span>
                  <span className="text-2xl leading-tight font-extrabold tracking-tight text-on-surface">
                    {formatCompactIDR(monthlySpend)}
                  </span>
                  <span className="text-[11px] text-on-surface-variant mt-1">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(monthlySpend)}
                  </span>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                {categories.map(item => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-${item.colorName}`} style={{backgroundColor: item.hex}}></div>
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold">{item.percentStr}</span>
                  </div>
                ))}
                {categories.length === 0 && (
                   <p className="text-sm text-on-surface-variant">No expenses recorded yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-5 bg-surface-container-low rounded-xl p-8 flex flex-col">
            <div className="mb-4">
              <h2 className="text-lg font-bold">Grafik Uang Masuk &amp; Keluar</h2>
              <p className="text-sm text-on-surface-variant">7 tanggal pencatatan terakhir ({dailyRangeLabel})</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-bold mb-2">
              <span className="inline-flex items-center gap-1 text-emerald-600"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Income</span>
              <span className="inline-flex items-center gap-1 text-rose-600"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" />Spend</span>
            </div>
            <div className="relative h-40 mt-4">
              <svg className="absolute inset-0 w-full h-full">
                {/* grid line */}
                <line
                  x1="0"
                  y1="85%"
                  x2="100%"
                  y2="85%"
                  stroke="rgba(148,163,184,0.3)"
                  strokeWidth="1"
                />
                {cashflowSeries.map((day, idx) => {
                  if (idx === 0) return null;
                  const prev = cashflowSeries[idx - 1];
                  const x1 = xAt(idx - 1, cashflowSeries.length);
                  const x2 = xAt(idx, cashflowSeries.length);
                  const yScale = maxDaily || 1;
                  const y1 = 85 - (prev.income / yScale) * 70;
                  const y2 = 85 - (day.income / yScale) * 70;
                  return (
                    <polyline
                      // eslint-disable-next-line react/no-array-index-key
                      key={`income-line-${idx}`}
                      points={`${x1} ${y1}, ${x2} ${y2}`}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.25"
                      strokeLinecap="round"
                    />
                  );
                })}
                {cashflowSeries.map((day, idx) => {
                  if (idx === 0) return null;
                  const prev = cashflowSeries[idx - 1];
                  const x1 = xAt(idx - 1, cashflowSeries.length);
                  const x2 = xAt(idx, cashflowSeries.length);
                  const yScale = maxDaily || 1;
                  const y1 = 85 - (prev.spend / yScale) * 70;
                  const y2 = 85 - (day.spend / yScale) * 70;
                  return (
                    <polyline
                      // eslint-disable-next-line react/no-array-index-key
                      key={`spend-line-${idx}`}
                      points={`${x1} ${y1}, ${x2} ${y2}`}
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="2.25"
                      strokeLinecap="round"
                    />
                  );
                })}
                {cashflowSeries.map((day, idx) => {
                  const x = xAt(idx, cashflowSeries.length);
                  const yScale = maxDaily || 1;
                  const yIncome = 85 - (day.income / yScale) * 70;
                  const ySpend = 85 - (day.spend / yScale) * 70;

                  const formatCompactLine = (val) => {
                    if (!val || val <= 0) return '';
                    if (val >= 1000000) return (val / 1000000).toFixed(1).replace('.0', '') + 'M';
                    if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
                    return val.toString();
                  };

                  const displayIncome = formatCompactLine(day.income);
                  const displaySpend = formatCompactLine(day.spend);

                  return (
                    <g
                      // eslint-disable-next-line react/no-array-index-key
                      key={`dot-${idx}`}
                    >
                      {displayIncome && (
                        <text
                          x={`${x}%`}
                          y={`${yIncome - 8}%`}
                          textAnchor="middle"
                          fill="#10b981"
                          fontSize="9"
                          fontWeight="bold"
                          className="dark:fill-emerald-400 select-none pointer-events-none drop-shadow-sm"
                        >
                          {displayIncome}
                        </text>
                      )}
                      {displaySpend && (
                        <text
                          x={`${x}%`}
                          y={`${ySpend - 8}%`}
                          textAnchor="middle"
                          fill="#f43f5e"
                          fontSize="9"
                          fontWeight="bold"
                          className="dark:fill-rose-400 select-none pointer-events-none drop-shadow-sm"
                        >
                          {displaySpend}
                        </text>
                      )}
                      <circle
                        cx={`${x}%`}
                        cy={`${yIncome}%`}
                        r="3.25"
                        fill="#10b981"
                        stroke="#ecfdf5"
                        strokeWidth="1.5"
                      >
                        <title>{`${day.label} Income: ${formatIDR(day.income)}`}</title>
                      </circle>
                      <circle
                        cx={`${x}%`}
                        cy={`${ySpend}%`}
                        r="3.25"
                        fill="#f43f5e"
                        stroke="#fff1f2"
                        strokeWidth="1.5"
                      >
                        <title>{`${day.label} Spend: ${formatIDR(day.spend)}`}</title>
                      </circle>
                    </g>
                  );
                })}
              </svg>
              <div className="absolute inset-x-0 bottom-0 flex justify-between text-[10px] font-bold uppercase text-on-surface-variant">
                {cashflowSeries.map((d) => (
                  <span key={d.key}>{d.label}</span>
                ))}
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <Link
                to="/cashflow-details/income"
                className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 text-center"
              >
                Detail Income
              </Link>
              <Link
                to="/cashflow-details/spend"
                className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 text-center"
              >
                Detail Spend
              </Link>
            </div>
          </div>

          <div className="md:col-span-12 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Top Categories</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(cat => (
                <button
                  type="button"
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`bg-surface-container-lowest p-5 rounded-xl flex items-center gap-4 transition-all hover:translate-y-[-2px] hover:shadow-lg text-left ${
                    selectedCategory === cat.name ? 'ring-2 ring-primary/40' : ''
                  }`}
                >
                  <div className={`w-12 h-12 rounded-md flex items-center justify-center`} style={{backgroundColor: cat.hex + '20', color: cat.hex}}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{cat.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-on-surface">{cat.name}</span>
                      <span className="text-xs font-bold text-on-surface-variant">{cat.percentStr}</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: cat.percentStr, backgroundColor: cat.hex }}></div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {selectedCategory && (
              <div className="bg-surface-container-lowest dark:bg-slate-900 rounded-xl p-4 border border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold">Transaksi kategori: {selectedCategory}</h3>
                  <button
                    type="button"
                    className="text-xs font-bold text-slate-500 hover:opacity-80"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Tutup
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {categoryTransactions.slice(0, 20).map((tx) => (
                    <div key={`cat-${tx.id}`} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                      <div>
                        <p className="text-sm font-semibold">{tx.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' }).format(new Date(tx.time))}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-rose-600">-{formatIDR(tx.amount)}</p>
                    </div>
                  ))}
                  {categoryTransactions.length === 0 && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">
                      Belum ada transaksi pada kategori ini.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-12 bg-primary text-on-primary p-8 rounded-xl flex flex-col md:flex-row items-center gap-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
            <div className="flex-1 space-y-4 relative z-10">
              <h3 className="text-3xl font-extrabold leading-tight">
                Lihat pola pengeluaranmu bulan ini.
              </h3>
              <p className="text-on-primary/80 font-body max-w-md">
                Gunakan detail kategori di atas untuk melihat pos mana yang paling besar menyedot uangmu.
                Kurangi sedikit saja dari kategori terbesar, efeknya ke tabungan bakal terasa.
              </p>
              <Link
                to="/cashflow-details/spend"
                className="inline-block bg-primary-container text-on-primary-container font-bold px-6 py-3 rounded-full hover:opacity-90 transition-all"
              >
                Fokuskan Spend
              </Link>
            </div>
            <div className="w-full md:w-1/3 aspect-[4/3] rounded-xl overflow-hidden bg-surface-container relative z-10">
              <img alt="Growth chart" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZx3zevViDNoXBdqawV5r3BCSb2puxmk3ZLI4EKkUeMq0YxsnTrzhlO0UvK0aqqrqn6Azci5RSj0wk0LUyDD75CrHlq-4rP98W1B2xN4euIZ1QU290ruYUnekanMEHZjEYqvPnee3XDSh9iabLDL7pCvjgsouS5E33wE8UpHa0QOZ9mVhfAcacU7hCBgD3-JILWD1Q1GvbgU95EpOhqIEZ4KrLS07VkBUpQNBO8XSF0kDqEXvzPtTRE58xK3FdLNE5dPcwEFIxuUMj" />
            </div>
          </div>
        </div>
      </main>

      <BottomNavBar />
    </div>
  );
}

import React, { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BottomNavBar from '../components/BottomNavBar';
import { FinanceContext } from '../context/FinanceContext';
import { AuthContext } from '../context/AuthContext';

export default function Analytics() {
  const { transactions, monthlySpend, currentBalance, showBalance, setShowBalance } = useContext(FinanceContext);
  const { user } = useContext(AuthContext);
  const firstName = user?.full_name?.split(' ')?.[0] || user?.email?.split('@')?.[0] || 'Guest';
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeChart, setActiveChart] = useState('income');
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

  const currentYYYYMM = new Date().toISOString().slice(0, 7);
  const [distributionMonth, setDistributionMonth] = useState(currentYYYYMM);

  const availableMonths = useMemo(() => {
    const mSet = new Set();
    transactions.forEach(tx => {
      const d = new Date(tx.time);
      const tzOffset = d.getTimezoneOffset() * 60000;
      mSet.add(new Date(d - tzOffset).toISOString().slice(0, 7));
    });
    const arr = Array.from(mSet).sort((a,b) => b.localeCompare(a));
    if (!arr.includes(currentYYYYMM)) arr.unshift(currentYYYYMM);
    return arr;
  }, [transactions, currentYYYYMM]);

  const { categories, totalSpendForMonth } = useMemo(() => {
    const expenses = transactions.filter(tx => {
      if (!tx.negative) return false;
      const d = new Date(tx.time);
      const tzOffset = d.getTimezoneOffset() * 60000;
      const txMonth = new Date(d - tzOffset).toISOString().slice(0, 7);
      return txMonth === distributionMonth;
    });

    const totalSpend = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    const categoryTotals = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

    const getColors = (cat) => {
      switch(cat) {
        case 'Food': return { colorName: 'emerald-600', hex: '#059669', icon: 'restaurant' };
        case 'Transport': return { colorName: 'teal-600', hex: '#0d9488', icon: 'directions_car' };
        case 'Shopping': return { colorName: 'emerald-500', hex: '#10b981', icon: 'shopping_cart' };
         case 'Leisure': return { colorName: 'teal-400', hex: '#2dd4bf', icon: 'theater_comedy' };
         case 'Bills': return { colorName: 'rose-500', hex: '#f43f5e', icon: 'bolt' };
        default: return { colorName: 'slate-300', hex: '#cbd5e1', icon: 'category' };
      }
    };

    const catsArr = Object.keys(categoryTotals).map(cat => {
      const percentage = totalSpend > 0 ? (categoryTotals[cat] / totalSpend) * 100 : 0;
      return { 
        name: cat, 
        amount: categoryTotals[cat], 
        percentStr: `${Math.round(percentage)}%`,
        percentage,
        ...getColors(cat)
      };
    }).sort((a, b) => b.amount - a.amount);

    return { categories: catsArr, totalSpendForMonth: totalSpend };
  }, [transactions, distributionMonth]);

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
  const maxDailyIncome = Math.max(0, ...cashflowSeries.map(d => d.income));
  const maxDailySpend = Math.max(0, ...cashflowSeries.map(d => d.spend));
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

        <section className="relative overflow-hidden bg-gradient-to-br from-[#0c5931] via-[#0b8f4a] to-[#0fd26c] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-[0_16px_40px_rgba(11,143,74,0.3)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)] group transform hover:scale-[1.01] transition-all duration-300">
          {/* Abstract glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-white/15 transition-all duration-500 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 w-full h-full bg-emerald-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-100/90 dark:text-slate-400">Jumlah Uang Saya</p>
                <button onClick={() => setShowBalance(!showBalance)} className="text-emerald-100/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full w-5 h-5 flex items-center justify-center backdrop-blur shadow-sm">
                  <span className="material-symbols-outlined text-[12px]">{showBalance ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>
              <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tighter drop-shadow-md">
                {showBalance ? formatIDR(Math.abs(currentBalance)) : 'Rp •••••••'}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full ${currentBalance < 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-100'} ring-1 ring-inset ${currentBalance < 0 ? 'ring-rose-500/30' : 'ring-emerald-500/30'}`}>
                  <span className="material-symbols-outlined text-[10px]">{currentBalance < 0 ? 'arrow_downward' : 'arrow_upward'}</span>
                </span>
                <p className="text-[11px] font-medium text-emerald-50 dark:text-slate-300 opacity-90">
                  {currentBalance < 0 ? 'Saldo saat ini minus' : 'Saldo saat ini positif'}
                </p>
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner transform group-hover:rotate-6 transition-transform duration-300">
              <span className="material-symbols-outlined text-3xl text-white opacity-90 drop-shadow-sm">account_balance_wallet</span>
            </div>
          </div>
          
          <div className="relative z-10 mt-6 pt-5 border-t border-white/15 flex items-center justify-between">
            <p className="text-xs text-white/80 font-medium tracking-wide">Pantau perputaran uangmu.</p>
            <Link
              to="/money-details"
              className="inline-flex items-center gap-1.5 bg-white text-emerald-800 dark:bg-emerald-400 dark:text-slate-900 px-5 py-2.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-900/20"
            >
              Lihat Detail
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-200/60 dark:border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 dark:bg-emerald-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60 pointer-events-none"></div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-10 relative z-10">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold font-headline mb-2 text-slate-800 dark:text-slate-100">Expense Distribution</h2>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-emerald-600 dark:text-emerald-400">calendar_month</span>
                  <select 
                    value={distributionMonth} 
                    onChange={(e) => setDistributionMonth(e.target.value)}
                    className="bg-slate-100/70 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-lg px-2 py-1 outline-none transition-colors appearance-none cursor-pointer border border-emerald-100 dark:border-emerald-900/50"
                  >
                    {availableMonths.map(m => {
                      const [year, month] = m.split('-');
                      const theDate = new Date(year, parseInt(month) - 1);
                      return <option key={m} value={m}>{new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(theDate)}</option>;
                    })}
                  </select>
                </div>
              </div>
              <span className="bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-sm border border-emerald-200/50 dark:border-emerald-800/50 inline-flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Tracker</span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-10 relative z-10">
              <div className="relative w-56 h-56 flex items-center justify-center filter drop-shadow-md">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-slate-100 dark:text-slate-800" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeWidth="20"></circle>
                  {generateChartSegments()}
                </svg>
                <div className="absolute w-[9.5rem] h-[9.5rem] rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center px-3 z-10">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Total Spend</span>
                  <span className="text-[1.35rem] leading-tight font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
                    {formatCompactIDR(totalSpendForMonth)}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalSpendForMonth)}
                  </span>
                </div>
              </div>

              <div className="space-y-4 flex-1 w-full bg-slate-50/50 dark:bg-slate-950/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                {categories.map(item => (
                  <div key={item.name} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-inner relative transition-transform group-hover:scale-110" style={{backgroundColor: item.hex + '15'}}>
                        <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.hex}}></div>
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{item.name}</span>
                    </div>
                    <span className="text-sm font-extrabold tracking-tight text-slate-800 dark:text-slate-200">{item.percentStr}</span>
                  </div>
                ))}
                {categories.length === 0 && (
                   <p className="text-xs font-bold uppercase tracking-widest text-slate-400 text-center py-4">No expenses recorded.</p>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-5 bg-surface-container-low rounded-xl p-8 flex flex-col">
            <div className="flex bg-surface-container-highest p-1 rounded-lg mb-6">
              <button 
                onClick={() => setActiveChart('income')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${activeChart === 'income' ? 'bg-surface text-emerald-600 shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Uang Masuk
              </button>
              <button 
                onClick={() => setActiveChart('spend')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${activeChart === 'spend' ? 'bg-surface text-rose-600 shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Uang Keluar
              </button>
            </div>
            
            {activeChart === 'income' ? (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <div className="mb-4">
                  <h2 className="text-lg font-bold">Grafik Uang Masuk</h2>
                  <p className="text-sm text-on-surface-variant">7 hari terakhir ({dailyRangeLabel})</p>
                </div>
                <div className="relative h-40 mt-4">
                  <svg className="absolute inset-0 w-full h-full">
                    <line x1="0" y1="85%" x2="100%" y2="85%" stroke="rgba(148,163,184,0.3)" strokeWidth="1" />
                    {cashflowSeries.map((day, idx) => {
                      if (idx === 0) return null;
                      const prev = cashflowSeries[idx - 1];
                      const x1 = xAt(idx - 1, cashflowSeries.length);
                      const x2 = xAt(idx, cashflowSeries.length);
                      const yScale = maxDailyIncome || 1;
                      const y1 = 85 - (prev.income / yScale) * 70;
                      const y2 = 85 - (day.income / yScale) * 70;
                      return (
                        <line key={`incoline-${idx}`} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke="#10b981" strokeWidth="2.25" strokeLinecap="round" />
                      );
                    })}
                    {cashflowSeries.map((day, idx) => {
                      const x = xAt(idx, cashflowSeries.length);
                      const yScale = maxDailyIncome || 1;
                      const yIncome = 85 - (day.income / yScale) * 70;
                      const displayIncome = day.income >= 1000000 ? (day.income / 1000000).toFixed(1).replace('.0', '') + 'M' : (day.income >= 1000 ? (day.income / 1000).toFixed(0) + 'k' : (day.income > 0 ? day.income.toString() : ''));
                      return (
                        <g key={`incodot-${idx}`}>
                          {displayIncome && <text x={`${x}%`} y={`${yIncome - 8}%`} textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="bold" className="dark:fill-emerald-400 select-none pointer-events-none drop-shadow-sm">{displayIncome}</text>}
                          <circle cx={`${x}%`} cy={`${yIncome}%`} r="3.25" fill="#10b981" stroke="#ecfdf5" strokeWidth="1.5"><title>{`${day.label} Income: ${formatIDR(day.income)}`}</title></circle>
                        </g>
                      );
                    })}
                  </svg>
                  <div className="absolute inset-x-0 bottom-0 flex justify-between text-[10px] font-bold uppercase text-on-surface-variant">
                    {cashflowSeries.map((d) => <span key={`inl-${d.key}`}>{d.label}</span>)}
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Link to="/cashflow-details/income" className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Detail Income</Link>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <div className="mb-4">
                  <h2 className="text-lg font-bold">Grafik Uang Keluar</h2>
                  <p className="text-sm text-on-surface-variant">7 hari terakhir ({dailyRangeLabel})</p>
                </div>
                <div className="relative h-40 mt-4">
                  <svg className="absolute inset-0 w-full h-full">
                    <line x1="0" y1="85%" x2="100%" y2="85%" stroke="rgba(148,163,184,0.3)" strokeWidth="1" />
                    {cashflowSeries.map((day, idx) => {
                      if (idx === 0) return null;
                      const prev = cashflowSeries[idx - 1];
                      const x1 = xAt(idx - 1, cashflowSeries.length);
                      const x2 = xAt(idx, cashflowSeries.length);
                      const yScale = maxDailySpend || 1;
                      const y1 = 85 - (prev.spend / yScale) * 70;
                      const y2 = 85 - (day.spend / yScale) * 70;
                      return (
                        <line key={`spline-${idx}`} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke="#f43f5e" strokeWidth="2.25" strokeLinecap="round" />
                      );
                    })}
                    {cashflowSeries.map((day, idx) => {
                      const x = xAt(idx, cashflowSeries.length);
                      const yScale = maxDailySpend || 1;
                      const ySpend = 85 - (day.spend / yScale) * 70;
                      const displaySpend = day.spend >= 1000000 ? (day.spend / 1000000).toFixed(1).replace('.0', '') + 'M' : (day.spend >= 1000 ? (day.spend / 1000).toFixed(0) + 'k' : (day.spend > 0 ? day.spend.toString() : ''));
                      return (
                        <g key={`spdot-${idx}`}>
                          {displaySpend && <text x={`${x}%`} y={`${ySpend - 8}%`} textAnchor="middle" fill="#f43f5e" fontSize="9" fontWeight="bold" className="dark:fill-rose-400 select-none pointer-events-none drop-shadow-sm">{displaySpend}</text>}
                          <circle cx={`${x}%`} cy={`${ySpend}%`} r="3.25" fill="#f43f5e" stroke="#fff1f2" strokeWidth="1.5"><title>{`${day.label} Spend: ${formatIDR(day.spend)}`}</title></circle>
                        </g>
                      );
                    })}
                  </svg>
                  <div className="absolute inset-x-0 bottom-0 flex justify-between text-[10px] font-bold uppercase text-on-surface-variant">
                    {cashflowSeries.map((d) => <span key={`spl-${d.key}`}>{d.label}</span>)}
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Link to="/cashflow-details/spend" className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">Detail Spend</Link>
                </div>
              </div>
            )}
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

import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import BottomNavBar from '../components/BottomNavBar';
import { FinanceContext } from '../context/FinanceContext';
import { GoalsContext } from '../context/GoalsContext';
import { AuthContext } from '../context/AuthContext';

export default function HomeDashboard() {
  const { transactions, currentBalance, monthlySpend, monthlyIncome } = useContext(FinanceContext);
  const { goals } = useContext(GoalsContext);
  const { user, updateUserLimit } = useContext(AuthContext);
  const accountLabel = (tx) =>
    String(tx.account_type || '').trim().toLowerCase() === 'cash' ? 'Cash' : 'Bank BCA';

  const formatIDR = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [newLimitAmt, setNewLimitAmt] = useState('');

  const handleUpdateLimit = (e) => {
    e.preventDefault();
    if (newLimitAmt && !isNaN(newLimitAmt)) {
      updateUserLimit(newLimitAmt);
      setIsLimitModalOpen(false);
      setNewLimitAmt('');
    }
  };

  const dailySpend = transactions
    .filter(tx => tx.negative && new Date(tx.time).toDateString() === new Date().toDateString())
    .reduce((acc, tx) => acc + tx.amount, 0);

  // Determine budget warnings
  const monthlyLimit = user?.monthly_limit || 0;
  const spendPctRaw = monthlyLimit > 0 ? (monthlySpend / monthlyLimit) * 100 : 0;
  const spendPct = Math.min(spendPctRaw, 100).toFixed(0);
  
  let barColorClass = "bg-[#006a2d] dark:bg-[#6bff8f]"; // default Green/Primary
  let warningMessage = null;

  if (spendPctRaw >= 100) {
    barColorClass = "bg-error";
    warningMessage = "CRITICAL: You have exceeded your monthly budget!";
  } else if (spendPctRaw >= 80) {
    barColorClass = "bg-yellow-500 dark:bg-yellow-400";
    warningMessage = "WARNING: You are nearing your monthly limit!";
  }

  const priorityGoal = goals.find(g => g.is_priority) || goals[0];
  const goalPct = priorityGoal && priorityGoal.target_amount > 0 ? Math.min((priorityGoal.saved_amount / priorityGoal.target_amount) * 100, 100).toFixed(0) : 0;

  // Absolute format for Balance to strip "-" 
  const absBalance = Math.abs(currentBalance);
  const isBalanceNegative = currentBalance < 0;
  
  // Spend series for 7 consecutive days ending at latest recorded date
  const weeklySpendSeries = React.useMemo(() => {
    const dailyMap = new Map();
    const spendTx = transactions.filter((tx) => tx.negative);
    let latestDate = spendTx.length > 0 ? new Date(spendTx[0].time) : new Date();

    spendTx.forEach((tx) => {
      const d = new Date(tx.time);
      if (d > latestDate) latestDate = d;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
      const prev = dailyMap.get(key) || 0;
      dailyMap.set(key, prev + tx.amount);
    });

    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(latestDate);
      d.setDate(latestDate.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
      result.push({
        key,
        label: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        total: dailyMap.get(key) || 0
      });
    }

    return result;
  }, [transactions]);

  const weeklyMax = Math.max(...weeklySpendSeries.map((d) => d.total), 0);
  const spendRangeLabel =
    weeklySpendSeries[0]?.label === weeklySpendSeries[weeklySpendSeries.length - 1]?.label
      ? weeklySpendSeries[0]?.label
      : `${weeklySpendSeries[0]?.label} - ${weeklySpendSeries[weeklySpendSeries.length - 1]?.label}`;
  const savingsPct =
    monthlyIncome > 0 ? Math.round(((monthlyIncome - monthlySpend) / monthlyIncome) * 100) : 0;
  const chartPad = { left: 6, right: 6 };
  const xAt = (idx, total) => {
    if (total <= 1) return 50;
    return chartPad.left + (idx / (total - 1)) * (100 - chartPad.left - chartPad.right);
  };
  const recentTransactions = [...transactions]
    .sort((a, b) => {
      const byTime = new Date(b.time).getTime() - new Date(a.time).getTime();
      if (byTime !== 0) return byTime;
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    })
    .slice(0, 5);

  return (
    <div className="bg-[#f5f7f9] dark:bg-slate-950 font-['Manrope'] text-[#2c2f31] dark:text-slate-200 min-h-screen pb-24 transition-colors">
      
      {/* Top App Bar */}
      <div className="flex justify-between items-center p-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#6bff8f] dark:bg-[#004a1d] rounded-full overflow-hidden flex items-center justify-center cursor-pointer shadow-sm">
             <span className="material-symbols-outlined text-[#004a1d] dark:text-[#6bff8f]">person</span>
          </div>
          <div>
            <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-xl leading-none tracking-tight">Hi, {user ? user.full_name?.split(' ')[0] : 'Guest'}</h1>
            <p className="text-[#595c5e] dark:text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Ready to flow?</p>
          </div>
        </div>
        <button className="material-symbols-outlined text-[#595c5e] dark:text-slate-400 hover:text-[#006a2d] transition-colors p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">notifications</button>
      </div>

      <main className="px-6 space-y-6 mt-4 max-w-lg mx-auto">
        
        {/* Warning Banner */}
        {monthlyLimit > 0 && warningMessage && (
          <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${spendPctRaw >= 100 ? 'bg-error text-on-error shadow-error/20' : 'bg-yellow-500 text-slate-900 shadow-yellow-500/20'} shadow-lg`}>
            <span className="material-symbols-outlined">warning</span>
            {warningMessage}
          </div>
        )}

        {/* Balance Section */}
        <div className="mt-4 mb-6">
          <div className="bg-gradient-to-br from-[#0c5931] via-[#0b8f4a] to-[#0fd26c] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-[0_16px_40px_rgba(11,143,74,0.3)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

            <p className="font-['Plus_Jakarta_Sans'] font-bold text-[10px] uppercase tracking-[0.2em] text-emerald-100 dark:text-slate-400 mb-2 relative z-10 drop-shadow-sm">Current Balance</p>
            <div className="flex items-center gap-3 relative z-10">
              <h2 className={`font-['Plus_Jakarta_Sans'] font-extrabold text-4xl lg:text-5xl tracking-tighter drop-shadow-md ${isBalanceNegative ? 'text-rose-300' : 'text-white'}`}>
                {formatIDR(absBalance)}
              </h2>
              {!isBalanceNegative && (
                <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-sm font-bold text-xs px-2.5 py-1 rounded-full mb-1">
                  {savingsPct >= 0 ? '+' : ''}{savingsPct}%
                </span>
              )}
            </div>

            <div className="mt-8 flex items-center justify-between relative z-10">
              <Link to="/money-details" className="bg-white/15 hover:bg-white/25 active:bg-white/30 transition-colors backdrop-blur-md border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest inline-flex items-center gap-1 shadow-sm">
                Lihat Detail <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
              <div className="flex gap-2">
                 <Link to="/add" className="w-10 h-10 rounded-full bg-white text-emerald-700 dark:bg-slate-800 dark:text-emerald-400 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg">
                   <span className="material-symbols-outlined text-lg">add</span>
                 </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Spending Card (Dynamic with Limit logic) */}
          <div className="bg-[#73fbbc] dark:bg-[#004a1d] rounded-2xl p-5 flex flex-col justify-between aspect-square group shadow-[0_8px_24px_rgba(115,251,188,0.2)] dark:shadow-none hover:shadow-[0_12px_32px_rgba(115,251,188,0.3)] transition-all">
            <div>
              <span className="text-[#004a1d] dark:text-[#6bff8f]/70 text-[9px] font-bold uppercase tracking-widest">Today's Spending</span>
              <p className="font-['Plus_Jakarta_Sans'] text-[#004a1d] dark:text-[#6bff8f] font-extrabold text-xl mt-1 tracking-tight">
                {formatIDR(dailySpend)}
              </p>
            </div>
            
            <div className="mt-4">
              <div className="w-full h-2 bg-[#006a2d]/20 dark:bg-black/30 rounded-full overflow-hidden mb-2">
                <div className={`h-full rounded-full transition-all duration-1000 ${barColorClass}`} style={{ width: `${spendPct}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-[9px] text-[#004a1d] dark:text-[#6bff8f]/80 font-bold uppercase tracking-wider">
                <span>{spendPct}% of limit</span>
                <button onClick={() => setIsLimitModalOpen(true)} className="hover:underline flex items-center gap-1 group-hover:text-white transition-colors">
                  {monthlyLimit > 0 ? `${formatIDR(monthlyLimit)} limit` : 'Set Limit'}
                  <span className="material-symbols-outlined text-[10px]">edit</span>
                </button>
              </div>
            </div>
          </div>

          {/* Goal Priority Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 flex flex-col justify-between aspect-square shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all dark:border dark:border-slate-800">
            <div className="flex justify-between items-start">
              <div className="text-[#006575] dark:text-[#00dcfe]">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>radar</span>
              </div>
              <span className="text-[#006575] dark:text-[#00dcfe] text-[9px] font-bold uppercase tracking-widest">Active Goal</span>
            </div>
            <div className="mt-2">
              <p className="font-['Plus_Jakarta_Sans'] font-bold text-sm tracking-tight text-[#2c2f31] dark:text-slate-200">{priorityGoal ? priorityGoal.title : 'No Goal'}</p>
              <p className="text-[#595c5e] dark:text-slate-400 text-xs">{goalPct}% completed</p>
            </div>
            {/* Micro Interaction Avatars */}
            <div className="flex -space-x-2 mt-2">
              <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold">G</div>
              <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-[#6bff8f] flex items-center justify-center text-[8px] font-bold font-['Manrope'] text-[#004a1d]">+{priorityGoal ? '1' : '0'}</div>
            </div>
          </div>
        </div>

        {/* Recent Activity List */}
        <section>
          <div className="flex justify-between items-center mb-4 px-1 mt-6">
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl tracking-tight text-[#2c2f31] dark:text-slate-200">Recent Activity</h3>
            <Link
              to="/transactions"
              className="text-[#006a2d] dark:text-[#6bff8f] text-xs font-bold uppercase tracking-widest cursor-pointer hover:opacity-70 transition-opacity"
            >
              View All
            </Link>
          </div>

          {/* Weekly Mini Chart */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-[1rem] shadow-[0_4px_12px_rgba(0,0,0,0.02)] dark:border dark:border-slate-800 mb-4">
            <div className="flex justify-between items-center mb-3">
              <p className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#2c2f31] dark:text-slate-200">Spend Trend</p>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#595c5e] dark:text-slate-400">
                {spendRangeLabel}
              </span>
            </div>
            <div className="relative h-28 mt-4 mb-2">
              <svg className="absolute inset-0 w-full h-full overflow-visible">
                <line x1="6%" y1="85%" x2="94%" y2="85%" stroke="rgba(148,163,184,0.28)" strokeWidth="1" />
                {weeklySpendSeries.map((day, idx) => {
                  if (idx === 0) return null;
                  const prev = weeklySpendSeries[idx - 1];
                  const x1 = xAt(idx - 1, weeklySpendSeries.length);
                  const x2 = xAt(idx, weeklySpendSeries.length);
                  const yScale = weeklyMax || 1;
                  const y1 = 85 - (prev.total / yScale) * 60;
                  const y2 = 85 - (day.total / yScale) * 60;
                  return (
                    <line
                      key={day.key}
                      x1={`${x1}%`}
                      y1={`${y1}%`}
                      x2={`${x2}%`}
                      y2={`${y2}%`}
                      stroke="#06a750"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  );
                })}
                {weeklySpendSeries.map((day, idx) => {
                  const x = xAt(idx, weeklySpendSeries.length);
                  const yScale = weeklyMax || 1;
                  const y = 85 - (day.total / yScale) * 60;
                  const isActive = idx === weeklySpendSeries.length - 1;
                  
                  // Hitung tampilan nominal ringkas (contoh: 1,5M; 500k)
                  let displayAmt = '';
                  if (day.total > 0) {
                    if (day.total >= 1000000) {
                      displayAmt = (day.total / 1000000).toFixed(1).replace('.0', '') + 'M';
                    } else if (day.total >= 1000) {
                      displayAmt = (day.total / 1000).toFixed(0) + 'k';
                    } else {
                      displayAmt = day.total.toString();
                    }
                  }

                  return (
                    <g key={`weekly-dot-${day.key}`}>
                      {displayAmt && (
                        <text
                          x={`${x}%`}
                          y={`${y - 8}%`}
                          textAnchor="middle"
                          fill={isActive ? "#006a2d" : "#595c5e"}
                          fontSize={isActive ? "10" : "9"}
                          fontWeight="bold"
                          className="dark:fill-slate-300 select-none pointer-events-none drop-shadow-sm"
                        >
                          {displayAmt}
                        </text>
                      )}
                      <circle
                        cx={`${x}%`}
                        cy={`${y}%`}
                        r="3.5"
                        fill={isActive ? '#059669' : '#10b981'}
                        stroke="#ecfdf5"
                        strokeWidth="1.5"
                      >
                        <title>{`${day.label}: ${formatIDR(day.total)}`}</title>
                      </circle>
                    </g>
                  );
                })}
              </svg>
              <div className="absolute inset-x-0 bottom-0 flex justify-between text-[8px] font-bold text-[#595c5e] dark:text-slate-400">
                {weeklySpendSeries.map((d) => (
                  <span key={`label-${d.key}`}>{d.label}</span>
                ))}
              </div>
            </div>
            <p className="text-[11px] mt-3 text-[#595c5e] dark:text-slate-400">
              {weeklyMax > 0
                ? 'Grafik ini menampilkan 7 tanggal pencatatan pengeluaran terakhir.'
                : 'Belum ada data pencatatan pengeluaran.'}
            </p>
          </div>

            <div className="mt-4 space-y-3">
            {recentTransactions.map(tx => (
              <Link to="/transactions" key={tx.id} className="block bg-white dark:bg-slate-900 p-4 rounded-2xl flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.05)] transition-all dark:border dark:border-slate-800 group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform ${tx.negative ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'}`}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{tx.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">{tx.title}</h4>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium block mt-0.5">{tx.category} • {new Intl.DateTimeFormat('en-GB', {day: 'numeric', month: 'short'}).format(new Date(tx.time))}</span>
                    <div className="mt-1.5">
                      <span
                        className={`inline-flex text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md ${
                          accountLabel(tx) === 'Cash'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}
                      >
                        {accountLabel(tx)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`font-['Plus_Jakarta_Sans'] font-extrabold text-[15px] tracking-tight ${tx.negative ? 'text-slate-800 dark:text-slate-200' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {tx.negative ? '-' : '+'}{formatIDR(tx.amount)}
                </div>
              </Link>
            ))}
            
            {recentTransactions.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 text-4xl mb-2">receipt_long</span>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">No recent transactions</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <BottomNavBar />

      {/* Set Limit Modal */}
      {isLimitModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest w-full max-w-sm rounded-[2rem] p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
             <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold font-headline text-on-surface">Set Monthly Limit</h2>
              <button onClick={() => setIsLimitModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-variant transition-colors text-on-surface-variant">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <p className="text-sm font-body text-on-surface-variant mb-6">Enter the maximum amount of money you plan to spend this month to activate the budget warning system.</p>
            
            <form onSubmit={handleUpdateLimit} className="space-y-4">
              <div>
                <label className="block text-center text-xs font-bold uppercase tracking-widest text-outline font-label mb-4">Monthly Goal (Rp)</label>
                <input 
                  autoFocus
                  required 
                  value={newLimitAmt} 
                  onChange={e=>setNewLimitAmt(e.target.value)} 
                  type="number" 
                  placeholder={monthlyLimit > 0 ? monthlyLimit.toString() : "5000000"} 
                  className="w-full bg-transparent border-b-2 border-surface-container-high focus:border-primary text-center text-4xl font-extrabold text-on-surface font-headline focus:outline-none py-2 transition-colors placeholder:text-surface-container-highest" 
                />
              </div>

              <div className="flex gap-2 justify-center pb-4">
                {[1000000, 3000000, 5000000].map(amt => (
                  <button 
                    key={amt} 
                    type="button" 
                    onClick={() => setNewLimitAmt(amt.toString())}
                    className="px-3 py-1.5 bg-surface-container-low hover:bg-primary-container/50 text-on-surface-variant text-xs font-bold rounded-lg transition-colors border border-surface-container"
                  >
                    {amt/1000000}M
                  </button>
                ))}
              </div>

              <button type="submit" className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[0.98] transition-transform active:scale-95">
                Save Limit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

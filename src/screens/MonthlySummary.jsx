import { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FinanceContext } from '../context/FinanceContext';
import BottomNavBar from '../components/BottomNavBar';
import { localMonthKey } from '../utils/dates';

const formatIDR = (value) => new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0
}).format(value || 0);

const monthLabel = (key) => {
  const [year, month] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1));
};

export default function MonthlySummary() {
  const { transactions } = useContext(FinanceContext);
  const currentMonth = localMonthKey(new Date());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const months = useMemo(() => {
    const monthKeys = new Set(transactions.map((tx) => localMonthKey(tx.time)).filter(Boolean));
    for (let offset = 0; offset < 12; offset += 1) {
      monthKeys.add(localMonthKey(new Date(new Date().getFullYear(), new Date().getMonth() - offset, 1)));
    }
    return [...monthKeys].sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  const monthTransactions = useMemo(() => transactions
    .filter((tx) => localMonthKey(tx.time) === selectedMonth)
    .sort((a, b) => new Date(b.time) - new Date(a.time)), [transactions, selectedMonth]);
  const incomeTransactions = monthTransactions.filter((tx) => !tx.negative);
  const expenseTransactions = monthTransactions.filter((tx) => tx.negative);

  const summary = useMemo(() => monthTransactions.reduce((totals, tx) => {
    const amount = Number(tx.amount) || 0;
    if (tx.negative) {
      totals.expense += amount;
      const category = tx.category || 'Lainnya';
      totals.categories.set(category, (totals.categories.get(category) || 0) + amount);
    } else {
      totals.income += amount;
    }
    return totals;
  }, { income: 0, expense: 0, categories: new Map() }), [monthTransactions]);

  const net = summary.income - summary.expense;
  const categoryTotals = [...summary.categories.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className="min-h-screen bg-[#090f12] pb-32 text-slate-100">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#10191d]/90 px-5 py-4 backdrop-blur-xl sm:px-8">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">Laporan keuangan</p>
          <h1 className="mt-1 text-xl font-extrabold tracking-tight text-slate-800 dark:text-white">Ringkasan Bulanan</h1>
        </div>
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
          <span className="material-symbols-outlined text-lg text-emerald-700 dark:text-emerald-300">calendar_month</span>
          <select aria-label="Pilih bulan laporan" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} className="max-w-36 bg-transparent text-xs font-bold text-slate-700 outline-none dark:text-slate-100 sm:max-w-none sm:text-sm">
            {months.map((month) => <option key={month} value={month}>{monthLabel(month)}</option>)}
          </select>
        </label>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-9">
        <section className="overflow-hidden rounded-[2rem] border border-emerald-200/10 bg-gradient-to-br from-[#12372b] via-[#145641] to-[#1b7552] p-6 text-white shadow-[0_24px_70px_rgba(0,0,0,0.24)] sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100/75">Arus kas · {monthLabel(selectedMonth)}</p>
          <p className="mt-3 text-sm font-medium text-emerald-50/80">Selisih pemasukan dan pengeluaran</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{formatIDR(net)}</p>
          <p className="mt-2 text-xs text-emerald-50/75">{monthTransactions.length} transaksi tercatat pada bulan ini</p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-3xl border border-emerald-200/20 bg-white p-5 shadow-sm dark:border-emerald-900/50 dark:bg-slate-900 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"><span className="material-symbols-outlined">south_west</span></span>
              <div><p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Total pemasukan</p><p className="mt-1 text-xl font-extrabold text-emerald-700 dark:text-emerald-300 sm:text-2xl">{formatIDR(summary.income)}</p></div>
            </div>
          </article>
          <article className="rounded-3xl border border-rose-200/20 bg-white p-5 shadow-sm dark:border-rose-900/50 dark:bg-slate-900 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"><span className="material-symbols-outlined">north_east</span></span>
              <div><p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Total pengeluaran</p><p className="mt-1 text-xl font-extrabold text-rose-700 dark:text-rose-300 sm:text-2xl">{formatIDR(summary.expense)}</p></div>
            </div>
          </article>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div><h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">Rincian pengeluaran</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Dikelompokkan berdasarkan kategori</p></div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{categoryTotals.length} kategori</span>
          </div>
          {categoryTotals.length ? <div className="space-y-4">
            {categoryTotals.map(([category, amount]) => {
              const percent = summary.expense > 0 ? (amount / summary.expense) * 100 : 0;
              return <div key={category}>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm"><span className="font-semibold text-slate-700 dark:text-slate-200">{category}</span><span className="font-bold text-slate-800 dark:text-slate-100">{formatIDR(amount)}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-emerald-600 dark:bg-emerald-400" style={{ width: `${percent}%` }} /></div>
              </div>;
            })}
          </div> : <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">Belum ada pengeluaran untuk {monthLabel(selectedMonth)}.</p>}
        </section>

        {[
          { title: 'Uang masuk', type: 'income', items: incomeTransactions },
          { title: 'Uang keluar', type: 'spend', items: expenseTransactions }
        ].map(({ title, type, items }) => <section key={type} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div><h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{title} bulan ini</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{items.length} transaksi · {monthLabel(selectedMonth)}</p></div>
            <Link to={`/cashflow-details/${type}?month=${selectedMonth}`} className={`shrink-0 rounded-full px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider ${type === 'income' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'}`}>Lihat semua</Link>
          </div>
          {items.length ? <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.slice(0, 5).map((tx) => <article key={tx.id} className="flex items-center justify-between gap-4 py-4 first:pt-1 last:pb-1">
              <div className="flex min-w-0 items-center gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tx.negative ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'}`}><span className="material-symbols-outlined">{tx.icon || (tx.negative ? 'north_east' : 'south_west')}</span></span>
                <div className="min-w-0"><p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{tx.title}</p><p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{tx.category} · {tx.account_name || 'Akun'} · {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date(tx.time))}</p></div>
              </div>
              <p className={`shrink-0 text-sm font-extrabold ${tx.negative ? 'text-rose-700 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'}`}>{tx.negative ? '−' : '+'}{formatIDR(tx.amount)}</p>
            </article>)}
          </div> : <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">Belum ada transaksi {title.toLowerCase()} untuk {monthLabel(selectedMonth)}.</p>}
        </section>)}
      </main>
      <BottomNavBar />
    </div>
  );
}

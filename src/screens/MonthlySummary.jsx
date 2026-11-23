import { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { Card, EmptyState, Icon, SectionHeader, TxRow } from '../components/ui';
import { FinanceContext } from '../context/FinanceContext';
import { localMonthKey } from '../utils/dates';
import { categoryMeta, formatIDR, monthLabel } from '../utils/format';

export default function MonthlySummary() {
  const { transactions } = useContext(FinanceContext);
  const currentMonth = localMonthKey(new Date());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const months = useMemo(() => {
    const keys = new Set(transactions.map((tx) => localMonthKey(tx.time)).filter(Boolean));
    const now = new Date();
    for (let offset = 0; offset < 12; offset += 1) keys.add(localMonthKey(new Date(now.getFullYear(), now.getMonth() - offset, 1)));
    return [...keys].sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  const idx = months.indexOf(selectedMonth);
  const prevMonth = months[idx + 1];
  const nextMonth = idx > 0 ? months[idx - 1] : null;

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
    <AppShell title="Ringkasan bulanan" subtitle="Laporan arus kas per bulan." back>
      <div className="space-y-5">
        {/* Month stepper */}
        <div className="flex items-center gap-2 animate-fade-up">
          <button type="button" disabled={!prevMonth} onClick={() => setSelectedMonth(prevMonth)} className="icon-btn border border-line disabled:opacity-30" aria-label="Bulan sebelumnya">
            <Icon name="chevron_left" />
          </button>
          <select aria-label="Pilih bulan laporan" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
            className="field flex-1 cursor-pointer appearance-none text-center font-semibold">
            {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
          <button type="button" disabled={!nextMonth} onClick={() => setSelectedMonth(nextMonth)} className="icon-btn border border-line disabled:opacity-30" aria-label="Bulan berikutnya">
            <Icon name="chevron_right" />
          </button>
        </div>

        <section className="lux-card p-6 animate-fade-up sm:p-8">
          <div className="relative z-10">
            <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#F2EFE8]/60">Selisih · {monthLabel(selectedMonth)}</p>
            <p className={`num mt-3 text-4xl font-semibold sm:text-5xl ${net < 0 ? 'text-[#F5A3A3]' : ''}`}>{net < 0 ? '−' : '+'}{formatIDR(Math.abs(net))}</p>
            <p className="mt-2 text-[13px] text-[#F2EFE8]/55">{monthTransactions.length} transaksi tercatat</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
                <p className="flex items-center gap-1.5 text-[12px] text-[#F2EFE8]/60"><Icon name="south_west" className="text-[16px] text-[#7FE0B4]" />Pemasukan</p>
                <p className="num mt-1 truncate text-lg font-semibold">{formatIDR(summary.income)}</p>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
                <p className="flex items-center gap-1.5 text-[12px] text-[#F2EFE8]/60"><Icon name="north_east" className="text-[16px] text-[#F5A3A3]" />Pengeluaran</p>
                <p className="num mt-1 truncate text-lg font-semibold">{formatIDR(summary.expense)}</p>
              </div>
            </div>
          </div>
        </section>

        <Card className="card-pad animate-fade-up">
          <SectionHeader title="Rincian pengeluaran" subtitle={`${categoryTotals.length} kategori`} />
          {categoryTotals.length ? (
            <div className="space-y-4">
              {categoryTotals.map(([category, amount]) => {
                const meta = categoryMeta(category);
                const percent = summary.expense > 0 ? (amount / summary.expense) * 100 : 0;
                return (
                  <div key={category}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-[14px]">
                      <span className="flex items-center gap-2 font-medium text-ink">
                        <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: meta.color }} />{meta.label}
                        <span className="num text-[12px] font-normal text-ink-3">{Math.round(percent)}%</span>
                      </span>
                      <span className="num font-semibold text-ink">{formatIDR(amount)}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-ink/10">
                      <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${percent}%`, background: meta.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <EmptyState icon="donut_large" title="Belum ada pengeluaran" text={`Tidak ada pengeluaran pada ${monthLabel(selectedMonth)}.`} />}
        </Card>

        <div className="grid gap-5 lg:grid-cols-2">
          {[
            { title: 'Uang masuk', type: 'income', items: incomeTransactions },
            { title: 'Uang keluar', type: 'spend', items: expenseTransactions },
          ].map(({ title, type, items }) => (
            <Card key={type} className="card-pad animate-fade-up">
              <SectionHeader
                title={title}
                subtitle={`${items.length} transaksi`}
                action={items.length > 0 && (
                  <Link to={`/cashflow-details/${type}?month=${selectedMonth}`} className="btn-quiet py-2 text-[13px]">
                    Semua<Icon name="chevron_right" className="text-[18px]" />
                  </Link>
                )}
              />
              {items.length ? (
                <div className="-mx-2 divide-y divide-line/70">
                  {items.slice(0, 5).map((tx) => <TxRow key={tx.id} tx={tx} />)}
                </div>
              ) : <EmptyState icon={type === 'income' ? 'south_west' : 'north_east'} title={`Belum ada ${title.toLowerCase()}`} />}
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

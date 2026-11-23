import { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { Donut, PairedBars } from '../components/charts';
import { Card, EmptyState, Icon, SectionHeader, TxRow } from '../components/ui';
import { FinanceContext } from '../context/FinanceContext';
import { localMonthKey } from '../utils/dates';
import { categoryMeta, formatCompactIDR, formatIDR, monthLabel, sortByNewest } from '../utils/format';

export default function Analytics() {
  const { transactions } = useContext(FinanceContext);
  const currentMonth = localMonthKey(new Date());
  const [month, setMonth] = useState(currentMonth);
  const [activeCat, setActiveCat] = useState(null);
  const [selectedCat, setSelectedCat] = useState(null);

  const availableMonths = useMemo(() => {
    const set = new Set(transactions.map((tx) => localMonthKey(tx.time)).filter(Boolean));
    set.add(currentMonth);
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [transactions, currentMonth]);

  const { segments, totalSpend, totalIncome } = useMemo(() => {
    const inMonth = transactions.filter((tx) => localMonthKey(tx.time) === month);
    const expenses = inMonth.filter((tx) => tx.negative);
    const totals = expenses.reduce((acc, tx) => { acc[tx.category] = (acc[tx.category] || 0) + tx.amount; return acc; }, {});
    const total = expenses.reduce((s, tx) => s + tx.amount, 0);
    return {
      totalSpend: total,
      totalIncome: inMonth.filter((tx) => !tx.negative).reduce((s, tx) => s + tx.amount, 0),
      segments: Object.entries(totals)
        .map(([name, amount]) => ({ name, amount, ...categoryMeta(name), pct: total ? (amount / total) * 100 : 0 }))
        .sort((a, b) => b.amount - a.amount),
    };
  }, [transactions, month]);

  const trend = useMemo(() => {
    const map = new Map();
    transactions.forEach((tx) => {
      const key = localMonthKey(tx.time);
      if (!key) return;
      const row = map.get(key) || { income: 0, spend: 0 };
      if (tx.negative) row.spend += tx.amount; else row.income += tx.amount;
      map.set(key, row);
    });
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = localMonthKey(d);
      return {
        key,
        label: d.toLocaleDateString('id-ID', { month: 'short' }),
        fullLabel: monthLabel(key),
        income: map.get(key)?.income || 0,
        spend: map.get(key)?.spend || 0,
      };
    });
  }, [transactions]);

  const catTransactions = useMemo(() => {
    if (!selectedCat) return [];
    return sortByNewest(transactions.filter((tx) => tx.negative && tx.category === selectedCat && localMonthKey(tx.time) === month));
  }, [transactions, selectedCat, month]);

  const net = totalIncome - totalSpend;
  const savingRate = totalIncome > 0 ? Math.round((net / totalIncome) * 100) : null;
  const top = segments[0];
  const highlighted = segments.find((s) => s.name === activeCat);

  return (
    <AppShell
      title="Analitik"
      subtitle="Pahami ke mana uangmu pergi."
      wide
      actions={
        <label className="relative hidden sm:block">
          <Icon name="calendar_month" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-ink-3" />
          <select value={month} onChange={(e) => { setMonth(e.target.value); setSelectedCat(null); }} aria-label="Pilih bulan"
            className="field !w-auto cursor-pointer appearance-none !py-2 pl-9 pr-8 !text-[13px]">
            {availableMonths.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
        </label>
      }
    >
      {/* Mobile month picker */}
      <label className="relative mb-5 block sm:hidden">
        <Icon name="calendar_month" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-ink-3" />
        <select value={month} onChange={(e) => { setMonth(e.target.value); setSelectedCat(null); }} aria-label="Pilih bulan"
          className="field cursor-pointer appearance-none pl-11">
          {availableMonths.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
        </select>
      </label>

      {/* KPI row */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4 animate-fade-up">
        {[
          { label: 'Pemasukan', value: formatIDR(totalIncome), icon: 'south_west', color: 'text-pos' },
          { label: 'Pengeluaran', value: formatIDR(totalSpend), icon: 'north_east', color: 'text-neg' },
          { label: 'Selisih', value: `${net < 0 ? '−' : ''}${formatIDR(Math.abs(net))}`, icon: 'balance', color: 'text-gold' },
          { label: 'Rasio tabungan', value: savingRate === null ? '—' : `${savingRate}%`, icon: 'savings', color: 'text-gold' },
        ].map((k) => (
          <Card key={k.label} className="p-4 sm:p-5">
            <p className="flex items-center gap-1.5 text-[12px] text-ink-3"><Icon name={k.icon} className={`text-[16px] ${k.color}`} />{k.label}</p>
            <p className="num mt-1.5 truncate text-lg font-semibold text-ink sm:text-xl">{k.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Distribution */}
        <Card className="card-pad lg:col-span-3 animate-fade-up">
          <SectionHeader title="Sebaran pengeluaran" subtitle={monthLabel(month)} />
          {segments.length ? (
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <Donut
                segments={segments}
                total={totalSpend}
                active={activeCat}
                onActive={setActiveCat}
                center={
                  <>
                    <span className="text-[11px] text-ink-3">{highlighted ? highlighted.label : 'Total keluar'}</span>
                    <span className="num mt-0.5 text-xl font-semibold text-ink">{formatCompactIDR(highlighted ? highlighted.amount : totalSpend)}</span>
                    <span className="num mt-0.5 text-[11px] text-ink-3">{highlighted ? `${Math.round(highlighted.pct)}%` : `${segments.length} kategori`}</span>
                  </>
                }
              />
              <ul className="w-full flex-1 space-y-1">
                {segments.map((s) => (
                  <li key={s.name}>
                    <button type="button"
                      onMouseEnter={() => setActiveCat(s.name)} onMouseLeave={() => setActiveCat(null)}
                      onClick={() => setSelectedCat(selectedCat === s.name ? null : s.name)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${selectedCat === s.name ? 'bg-surface-2' : 'hover:bg-surface-2/60'}`}>
                      <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: s.color }} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-medium text-ink">{s.label}</span>
                        <span className="mt-1 block h-1 overflow-hidden rounded-full bg-ink/10">
                          <span className="block h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
                        </span>
                      </span>
                      <span className="text-right">
                        <span className="num block text-[13px] font-semibold text-ink">{formatCompactIDR(s.amount)}</span>
                        <span className="num block text-[11px] text-ink-3">{Math.round(s.pct)}%</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <EmptyState icon="donut_large" title="Belum ada pengeluaran" text={`Tidak ada pengeluaran tercatat pada ${monthLabel(month)}.`} />
          )}

          {selectedCat && (
            <div className="mt-5 rounded-2xl border border-line p-3 animate-fade-up">
              <div className="flex items-center justify-between px-2 py-1">
                <p className="text-[13px] font-semibold text-ink">{categoryMeta(selectedCat).label} · {catTransactions.length} transaksi</p>
                <button type="button" onClick={() => setSelectedCat(null)} className="icon-btn h-8 w-8" aria-label="Tutup"><Icon name="close" className="text-[18px]" /></button>
              </div>
              <div className="max-h-72 divide-y divide-line/70 overflow-y-auto">
                {catTransactions.slice(0, 30).map((tx) => <TxRow key={tx.id} tx={tx} />)}
              </div>
            </div>
          )}
        </Card>

        <div className="space-y-5 lg:col-span-2">
          {/* Trend */}
          <Card className="card-pad animate-fade-up">
            <SectionHeader title="Tren 6 bulan" subtitle="Pemasukan vs pengeluaran" />
            <PairedBars data={trend} ariaLabel="Perbandingan pemasukan dan pengeluaran enam bulan terakhir" />
          </Card>

          {/* Insight */}
          <section className="lux-card p-6 animate-fade-up">
            <div className="relative z-10">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D6B97B]/15 text-[#D6B97B]">
                <Icon name="tips_and_updates" />
              </span>
              <p className="mt-4 font-display text-[26px] leading-tight">
                {top ? <>Pos terbesarmu: <em className="text-[#D6B97B]">{top.label}</em></> : 'Mulai catat untuk melihat insight.'}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-[#F2EFE8]/65">
                {top
                  ? `${Math.round(top.pct)}% dari pengeluaran ${monthLabel(month, { month: 'long' })} (${formatIDR(top.amount)}). Memangkas 10% saja dari pos ini menghemat ${formatIDR(top.amount * 0.1)}.`
                  : 'Setelah ada transaksi, kami tunjukkan kategori yang paling banyak menyerap uangmu.'}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link to={`/monthly-summary`} className="btn bg-[#D6B97B] px-4 py-2.5 text-[13px] text-[#14110a]">Ringkasan bulanan</Link>
                <Link to={`/cashflow-details/spend?month=${month}`} className="btn bg-white/[0.08] px-4 py-2.5 text-[13px] text-[#F2EFE8] hover:bg-white/15">Semua pengeluaran</Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

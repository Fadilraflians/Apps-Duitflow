import { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { Card, EmptyState, Icon, Segmented, TxRow } from '../components/ui';
import { FinanceContext } from '../context/FinanceContext';
import { localDateKey } from '../utils/dates';
import { accountLabel, categoryMeta, formatDate, formatIDR, sortByNewest } from '../utils/format';

const dayHeading = (key) => {
  const today = localDateKey(new Date());
  const y = new Date(); y.setDate(y.getDate() - 1);
  if (key === today) return 'Hari ini';
  if (key === localDateKey(y)) return 'Kemarin';
  return formatDate(`${key}T12:00:00`, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

export default function Transactions() {
  const { transactions } = useContext(FinanceContext);
  const [type, setType] = useState('all');
  const [query, setQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortByNewest(transactions).filter((tx) => {
      if (type === 'income' && tx.negative) return false;
      if (type === 'spend' && !tx.negative) return false;
      if (filterDate && localDateKey(tx.time) !== filterDate) return false;
      if (q) {
        const hay = `${tx.title} ${tx.category} ${categoryMeta(tx.category).label} ${accountLabel(tx)}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, type, query, filterDate]);

  const groups = useMemo(() => {
    const map = new Map();
    filtered.forEach((tx) => {
      const key = localDateKey(tx.time) || 'unknown';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(tx);
    });
    return [...map.entries()];
  }, [filtered]);

  const totals = filtered.reduce((t, tx) => {
    if (tx.negative) t.out += tx.amount; else t.in += tx.amount;
    return t;
  }, { in: 0, out: 0 });

  const hasFilter = query || filterDate || type !== 'all';

  return (
    <AppShell title="Transaksi" subtitle="Semua catatan pemasukan dan pengeluaranmu.">
      {/* Filters */}
      <div className="mb-5 space-y-3 animate-fade-up">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-ink-3" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari judul, kategori, atau akun"
              className="field pl-11" aria-label="Cari transaksi" />
          </label>
          <div className="relative sm:w-48">
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="field" aria-label="Filter tanggal" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <Segmented
            value={type}
            onChange={setType}
            options={[
              { value: 'all', label: 'Semua' },
              { value: 'income', label: 'Masuk', dot: 'rgb(var(--c-pos))' },
              { value: 'spend', label: 'Keluar', dot: 'rgb(var(--c-neg))' },
            ]}
          />
          {hasFilter && (
            <button type="button" onClick={() => { setQuery(''); setFilterDate(''); setType('all'); }} className="btn-quiet py-2 text-[13px]">
              <Icon name="restart_alt" className="text-[18px]" />Reset
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-5 grid grid-cols-2 gap-3 animate-fade-up">
        <Card className="p-4">
          <p className="flex items-center gap-1.5 text-[12px] text-ink-3"><Icon name="south_west" className="text-[16px] text-pos" />Masuk</p>
          <p className="num mt-1 truncate text-lg font-semibold text-ink">{formatIDR(totals.in)}</p>
        </Card>
        <Card className="p-4">
          <p className="flex items-center gap-1.5 text-[12px] text-ink-3"><Icon name="north_east" className="text-[16px] text-neg" />Keluar</p>
          <p className="num mt-1 truncate text-lg font-semibold text-ink">{formatIDR(totals.out)}</p>
        </Card>
      </div>

      {/* List */}
      {groups.length ? (
        <div className="space-y-4">
          {groups.map(([key, items]) => {
            const net = items.reduce((s, tx) => s + (tx.negative ? -tx.amount : tx.amount), 0);
            return (
              <Card key={key} className="px-3 py-2 sm:px-4">
                <div className="flex items-center justify-between px-2 pb-1 pt-3">
                  <p className="text-[13px] font-semibold text-ink-2">{key === 'unknown' ? 'Tanpa tanggal' : dayHeading(key)}</p>
                  <p className={`num text-[12px] font-semibold ${net >= 0 ? 'text-pos' : 'text-ink-3'}`}>{net >= 0 ? '+' : '−'}{formatIDR(Math.abs(net))}</p>
                </div>
                <div className="divide-y divide-line/70">
                  {items.map((tx) => <TxRow key={tx.id} tx={tx} />)}
                </div>
              </Card>
            );
          })}
          <p className="pt-2 text-center text-[12px] text-ink-3">{filtered.length} transaksi ditampilkan</p>
        </div>
      ) : (
        <Card className="card-pad">
          <EmptyState
            icon={hasFilter ? 'search_off' : 'receipt_long'}
            title={hasFilter ? 'Tidak ada yang cocok' : 'Belum ada transaksi'}
            text={hasFilter ? 'Coba ubah kata kunci, tanggal, atau jenis transaksi.' : 'Transaksi yang kamu catat akan muncul di sini.'}
            action={!hasFilter && <Link to="/add" className="btn-primary"><Icon name="add" />Catat transaksi</Link>}
          />
        </Card>
      )}
    </AppShell>
  );
}

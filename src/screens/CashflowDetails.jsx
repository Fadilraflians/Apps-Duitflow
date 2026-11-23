import { useContext, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { Card, EmptyState, TxRow } from '../components/ui';
import { FinanceContext } from '../context/FinanceContext';
import { localMonthKey } from '../utils/dates';
import { formatIDR, monthLabel } from '../utils/format';

export default function CashflowDetails() {
  const { type } = useParams();
  const [searchParams] = useSearchParams();
  const month = searchParams.get('month');
  const { transactions } = useContext(FinanceContext);
  const mode = type === 'spend' ? 'spend' : 'income';

  const filtered = useMemo(
    () => [...transactions]
      .filter((tx) => (mode === 'spend' ? tx.negative : !tx.negative) && (!month || localMonthKey(tx.time) === month))
      .sort((a, b) => new Date(b.time) - new Date(a.time)),
    [transactions, mode, month]
  );
  const total = filtered.reduce((s, tx) => s + tx.amount, 0);
  const title = mode === 'income' ? 'Semua pemasukan' : 'Semua pengeluaran';

  return (
    <AppShell title={title} subtitle={month ? monthLabel(month) : 'Seluruh periode'} back>
      <Card className="card-pad mb-5 flex items-center justify-between animate-fade-up">
        <div>
          <p className="text-[13px] text-ink-3">Total{month ? ` · ${monthLabel(month)}` : ''}</p>
          <p className={`num mt-1 text-2xl font-semibold ${mode === 'income' ? 'text-pos' : 'text-ink'}`}>{formatIDR(total)}</p>
        </div>
        <p className="text-[13px] text-ink-3">{filtered.length} transaksi</p>
      </Card>
      <Card className="px-3 py-2 animate-fade-up sm:px-4">
        {filtered.length ? (
          <div className="divide-y divide-line/70">
            {filtered.map((tx) => <TxRow key={tx.id} tx={tx} />)}
          </div>
        ) : (
          <div className="p-3"><EmptyState icon="receipt_long" title={`Belum ada ${mode === 'income' ? 'pemasukan' : 'pengeluaran'}`} /></div>
        )}
      </Card>
    </AppShell>
  );
}

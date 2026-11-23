import { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { Bars } from '../components/charts';
import { Alert, Card, EmptyState, Icon, Modal, ProgressBar, QuickAmounts, SectionHeader, TxRow } from '../components/ui';
import AmountInput, { parseAmount } from '../components/AmountInput';
import { FinanceContext } from '../context/FinanceContext';
import { GoalsContext } from '../context/GoalsContext';
import { AuthContext } from '../context/AuthContext';
import { getLastDays, localDateKey } from '../utils/dates';
import { firstNameOf, formatDate, formatIDR, greeting, sortByNewest } from '../utils/format';

export default function HomeDashboard() {
  const { transactions, currentBalance, monthlySpend, monthlyIncome, showBalance, setShowBalance } = useContext(FinanceContext);
  const { goals } = useContext(GoalsContext);
  const { user, updateUserLimit } = useContext(AuthContext);

  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [newLimitAmt, setNewLimitAmt] = useState('');

  const handleUpdateLimit = (e) => {
    e.preventDefault();
    if (newLimitAmt && parseAmount(newLimitAmt) > 0) {
      updateUserLimit(parseAmount(newLimitAmt));
      setIsLimitModalOpen(false);
      setNewLimitAmt('');
    }
  };

  const todayKey = localDateKey(new Date());
  const dailySpend = transactions
    .filter((tx) => tx.negative && localDateKey(tx.time) === todayKey)
    .reduce((acc, tx) => acc + tx.amount, 0);

  const monthlyLimit = Number(user?.monthly_limit) || 0;
  const spendPct = monthlyLimit > 0 ? (monthlySpend / monthlyLimit) * 100 : 0;
  const budgetTone = spendPct >= 100 ? 'neg' : spendPct >= 80 ? 'warn' : 'gold';
  const remaining = Math.max(monthlyLimit - monthlySpend, 0);

  const priorityGoal = goals.find((g) => g.is_priority) || goals[0];
  const goalPct = priorityGoal && priorityGoal.target_amount > 0
    ? Math.min((priorityGoal.saved_amount / priorityGoal.target_amount) * 100, 100)
    : 0;

  const weekly = useMemo(() => {
    const dailyMap = new Map();
    transactions.filter((tx) => tx.negative).forEach((tx) => {
      const key = localDateKey(tx.time);
      if (key) dailyMap.set(key, (dailyMap.get(key) || 0) + Number(tx.amount || 0));
    });
    return getLastDays(7).map(({ key, date }) => ({
      key,
      label: date.toLocaleDateString('id-ID', { weekday: 'short' }),
      fullLabel: date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' }),
      total: dailyMap.get(key) || 0,
    }));
  }, [transactions, todayKey]);
  const weeklyTotal = weekly.reduce((s, d) => s + d.total, 0);

  const recent = sortByNewest(transactions).slice(0, 5);
  const hidden = 'Rp ••••••';

  return (
    <AppShell
      title={`${greeting()}, ${firstNameOf(user)}`}
      subtitle={formatDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      wide
    >
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* Hero balance card */}
          <section className="lux-card animate-fade-up p-6 sm:p-8">
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#F2EFE8]/60">Total saldo</p>
                <button type="button" onClick={() => setShowBalance(!showBalance)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.08] text-[#F2EFE8]/80 transition hover:bg-white/15"
                  aria-label={showBalance ? 'Sembunyikan saldo' : 'Tampilkan saldo'}>
                  <Icon name={showBalance ? 'visibility' : 'visibility_off'} className="text-[18px]" />
                </button>
              </div>
              <p className={`num mt-3 text-[40px] font-semibold leading-none sm:text-[52px] ${currentBalance < 0 ? 'text-[#F5A3A3]' : ''}`}>
                {showBalance ? `${currentBalance < 0 ? '−' : ''}${formatIDR(Math.abs(currentBalance))}` : hidden}
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3">
                {[
                  { label: 'Masuk bulan ini', value: monthlyIncome, icon: 'south_west', color: 'text-[#7FE0B4]' },
                  { label: 'Keluar bulan ini', value: monthlySpend, icon: 'north_east', color: 'text-[#F5A3A3]' },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-3.5 sm:p-4">
                    <p className="flex items-center gap-1.5 text-[11.5px] text-[#F2EFE8]/60">
                      <Icon name={s.icon} className={`text-[16px] ${s.color}`} />{s.label}
                    </p>
                    <p className="num mt-1.5 truncate text-[15px] font-semibold sm:text-lg">{showBalance ? formatIDR(s.value) : hidden}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 sm:flex">
                <Link to="/add" className="btn flex-col gap-1 text-[12px] sm:flex-row sm:gap-2 sm:text-sm bg-[#D6B97B] px-3 py-2.5 text-[#14110a] hover:brightness-105 sm:px-4">
                  <Icon name="add" className="text-[18px]" />Catat
                </Link>
                <Link to="/money-details" className="btn flex-col gap-1 text-[12px] sm:flex-row sm:gap-2 sm:text-sm bg-white/[0.08] px-3 py-2.5 sm:px-4 text-[#F2EFE8] hover:bg-white/15">
                  <Icon name="account_balance_wallet" className="text-[18px]" />Akun
                </Link>
                <Link to="/monthly-summary" className="btn flex-col gap-1 text-[12px] sm:flex-row sm:gap-2 sm:text-sm bg-white/[0.08] px-3 py-2.5 sm:px-4 text-[#F2EFE8] hover:bg-white/15">
                  <Icon name="calendar_month" className="text-[18px]" />Ringkasan
                </Link>
              </div>
            </div>
          </section>

          {/* Weekly spend */}
          <Card className="card-pad animate-fade-up">
            <SectionHeader
              title="Pengeluaran 7 hari"
              subtitle={weeklyTotal > 0 ? `Total ${formatIDR(weeklyTotal)}` : 'Belum ada pengeluaran minggu ini'}
              action={<Link to="/analytics" className="btn-quiet py-2 text-[13px]">Analitik<Icon name="chevron_right" className="text-[18px]" /></Link>}
            />
            <div className="pt-4">
              <Bars data={weekly} ariaLabel="Grafik pengeluaran harian tujuh hari terakhir" />
            </div>
          </Card>

          {/* Recent */}
          <Card className="card-pad animate-fade-up">
            <SectionHeader
              title="Transaksi terbaru"
              action={recent.length > 0 && <Link to="/transactions" className="btn-quiet py-2 text-[13px]">Lihat semua<Icon name="chevron_right" className="text-[18px]" /></Link>}
            />
            {recent.length ? (
              <div className="-mx-2 divide-y divide-line/70">
                {recent.map((tx) => <TxRow key={tx.id} tx={tx} to="/transactions" />)}
              </div>
            ) : (
              <EmptyState icon="receipt_long" title="Belum ada transaksi"
                text="Catat pemasukan atau pengeluaran pertamamu untuk mulai melihat arus kas."
                action={<Link to="/add" className="btn-primary"><Icon name="add" />Catat sekarang</Link>} />
            )}
          </Card>
        </div>

        <div className="space-y-5">
          {/* Monthly budget */}
          <Card className="card-pad animate-fade-up">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Anggaran bulan ini</p>
                {monthlyLimit > 0 ? (
                  <p className="num mt-2 text-2xl font-semibold text-ink">{formatIDR(remaining)}</p>
                ) : (
                  <p className="mt-2 text-[15px] font-semibold text-ink">Belum diatur</p>
                )}
                <p className="mt-0.5 text-[13px] text-ink-3">
                  {monthlyLimit > 0 ? `tersisa dari ${formatIDR(monthlyLimit)}` : 'Atur batas agar pengeluaran terkendali.'}
                </p>
              </div>
              <button type="button" onClick={() => setIsLimitModalOpen(true)} className="btn-ghost px-3.5 py-2 text-[13px]">
                {monthlyLimit > 0 ? 'Ubah' : 'Atur'}
              </button>
            </div>
            {monthlyLimit > 0 && (
              <>
                <ProgressBar value={spendPct} tone={budgetTone} className="mt-5" />
                <div className="mt-2 flex justify-between text-[12px] text-ink-3">
                  <span className="num">Terpakai {Math.round(spendPct)}%</span>
                  <span className="num">{formatIDR(monthlySpend)}</span>
                </div>
                {spendPct >= 80 && (
                  <div className="mt-4">
                    <Alert tone={spendPct >= 100 ? 'neg' : 'warn'}>
                      {spendPct >= 100 ? 'Pengeluaran sudah melewati batas bulanan.' : 'Pengeluaran mendekati batas bulanan.'}
                    </Alert>
                  </div>
                )}
              </>
            )}
          </Card>

          {/* Today */}
          <Card className="card-pad flex items-center gap-4 animate-fade-up">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold/15 text-gold">
              <Icon name="today" />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] text-ink-3">Pengeluaran hari ini</p>
              <p className="num mt-0.5 text-xl font-semibold text-ink">{formatIDR(dailySpend)}</p>
            </div>
          </Card>

          {/* Priority goal */}
          <Card as={Link} to="/goals" className="card-pad group block animate-fade-up transition hover:border-gold/40">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Tujuan utama</p>
              <Icon name="arrow_outward" className="text-[18px] text-ink-3 transition group-hover:text-gold" />
            </div>
            {priorityGoal ? (
              <>
                <p className="mt-3 truncate text-[16px] font-semibold text-ink">{priorityGoal.title}</p>
                <div className="mt-1 flex items-baseline justify-between text-[13px] text-ink-3">
                  <span className="num">{formatIDR(priorityGoal.saved_amount)}</span>
                  <span className="num">dari {formatIDR(priorityGoal.target_amount)}</span>
                </div>
                <ProgressBar value={goalPct} className="mt-3" />
                <p className="num mt-2 text-[12px] font-semibold text-gold">{Math.round(goalPct)}% tercapai</p>
              </>
            ) : (
              <p className="mt-3 text-[14px] text-ink-2">Buat tujuan tabungan pertamamu →</p>
            )}
          </Card>
        </div>
      </div>

      <Modal open={isLimitModalOpen} onClose={() => setIsLimitModalOpen(false)} title="Batas bulanan" subtitle="Kami akan mengingatkan saat mendekati batas." icon="tune">
        <form onSubmit={handleUpdateLimit} className="space-y-6">
          <div className="rounded-3xl bg-surface-2/60 px-4 py-6 text-center">
            <p className="eyebrow">Batas pengeluaran (Rp)</p>
            <AmountInput autoFocus required value={newLimitAmt} onChange={setNewLimitAmt}
              placeholder={monthlyLimit > 0 ? new Intl.NumberFormat('id-ID').format(monthlyLimit) : '5.000.000'}
              className="num mt-2 w-full border-0 bg-transparent p-0 text-center text-4xl font-semibold text-ink outline-none placeholder:text-ink-3/50" />
          </div>
          <QuickAmounts amounts={[1000000, 3000000, 5000000, 10000000]} onPick={setNewLimitAmt} />
          <button type="submit" className="btn-primary w-full py-3.5">Simpan batas</button>
        </form>
      </Modal>
    </AppShell>
  );
}

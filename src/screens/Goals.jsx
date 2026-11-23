import { useContext, useState } from 'react';
import AppShell from '../components/AppShell';
import { Alert, Card, EmptyState, Icon, Modal, ProgressBar, QuickAmounts, SectionHeader } from '../components/ui';
import AmountInput, { parseAmount } from '../components/AmountInput';
import { GoalsContext } from '../context/GoalsContext';
import { formatIDR } from '../utils/format';

const GOAL_ICONS = ['flag', 'flight', 'directions_car', 'home', 'school', 'laptop_mac', 'favorite', 'savings', 'beach_access', 'phone_iphone', 'diamond', 'celebration'];
const getSafeIcon = (iconName) => (/^[a-z_]+$/.test(iconName || '') ? iconName : 'flag');
const pctOf = (g) => (g.target_amount > 0 ? Math.min((g.saved_amount / g.target_amount) * 100, 100) : 0);

export default function Goals() {
  const { goals, addGoal, addFundsToGoal, deleteGoal } = useContext(GoalsContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [activeFundGoal, setActiveFundGoal] = useState(null);
  const [fundAmount, setFundAmount] = useState('');
  const [fundError, setFundError] = useState('');
  const [funding, setFunding] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [icon, setIcon] = useState('flag');
  const [isPriority, setIsPriority] = useState(false);

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!title || !targetAmount) return;
    addGoal({ title, description, target_amount: parseAmount(targetAmount), icon, is_priority: isPriority });
    setTitle(''); setDescription(''); setTargetAmount(''); setIcon('flag'); setIsPriority(false);
    setIsModalOpen(false);
  };

  const handleAddFundsSubmit = (e) => {
    e.preventDefault();
    if (!activeFundGoal || funding) return;
    const parsed = parseAmount(fundAmount);
    if (!parsed || Number.isNaN(parsed) || parsed <= 0) {
      setFundError('Masukkan nominal yang valid.');
      return;
    }
    setFundError('');
    setFunding(true);
    addFundsToGoal(activeFundGoal.id, parsed).then((result) => {
      setFunding(false);
      if (result?.ok) {
        setFundAmount('');
        setActiveFundGoal(null);
        return;
      }
      setFundError(result?.error || 'Gagal menambah dana.');
    });
  };

  const openFundModal = (goal) => { setActiveFundGoal(goal); setFundAmount(''); setFundError(''); };

  const priorityGoal = goals.find((g) => g.is_priority);
  const secondaryGoals = goals.filter((g) => !g.is_priority);
  const totalSaved = goals.reduce((s, g) => s + Number(g.saved_amount || 0), 0);
  const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount || 0), 0);

  const newGoalButton = (
    <button type="button" onClick={() => setIsModalOpen(true)} className="btn-primary py-2.5">
      <Icon name="add" />Tujuan baru
    </button>
  );

  return (
    <AppShell title="Tujuan" subtitle="Wujudkan rencana besar, sedikit demi sedikit.">
      {goals.length > 0 && (
        <div className="mb-5 flex items-center justify-between gap-4 animate-fade-up">
          <div>
            <p className="text-[13px] text-ink-3">Total terkumpul</p>
            <p className="num text-lg font-semibold text-ink">{formatIDR(totalSaved)} <span className="text-[13px] font-normal text-ink-3">/ {formatIDR(totalTarget)}</span></p>
          </div>
          {newGoalButton}
        </div>
      )}

      {priorityGoal && (
        <section className="lux-card mb-6 p-6 animate-fade-up sm:p-8">
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#D6B97B]/15 text-[#D6B97B]">
                  <Icon name={getSafeIcon(priorityGoal.icon)} fill />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D6B97B]">Prioritas</p>
                  <h2 className="truncate text-xl font-semibold sm:text-2xl">{priorityGoal.title}</h2>
                </div>
              </div>
              <button type="button" onClick={() => setConfirmDelete(priorityGoal)} aria-label="Hapus tujuan"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#F2EFE8]/50 transition hover:bg-white/10 hover:text-[#F5A3A3]">
                <Icon name="delete" className="text-[19px]" />
              </button>
            </div>
            {priorityGoal.description && <p className="mt-3 text-[14px] text-[#F2EFE8]/60">{priorityGoal.description}</p>}

            <div className="mt-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-[12px] text-[#F2EFE8]/55">Terkumpul</p>
                <p className="num mt-1 text-3xl font-semibold sm:text-4xl">{formatIDR(priorityGoal.saved_amount)}</p>
              </div>
              <p className="num font-display text-5xl leading-none text-[#D6B97B]">{Math.round(pctOf(priorityGoal))}%</p>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[#D6B97B] transition-[width] duration-700" style={{ width: `${pctOf(priorityGoal)}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-[12px] text-[#F2EFE8]/55">
              <span className="num">Sisa {formatIDR(Math.max(priorityGoal.target_amount - priorityGoal.saved_amount, 0))}</span>
              <span className="num">Target {formatIDR(priorityGoal.target_amount)}</span>
            </div>

            <button type="button" onClick={() => openFundModal(priorityGoal)} className="btn mt-6 w-full bg-[#D6B97B] text-[#14110a] hover:brightness-105 sm:w-auto">
              <Icon name="savings" />Tambah dana
            </button>
          </div>
        </section>
      )}

      {goals.length === 0 ? (
        <Card className="card-pad animate-fade-up">
          <EmptyState icon="flag" title="Belum ada tujuan"
            text="Liburan, gadget baru, atau dana darurat — buat tujuan dan pantau progresnya di sini."
            action={newGoalButton} />
        </Card>
      ) : secondaryGoals.length > 0 && (
        <section className="animate-fade-up">
          <SectionHeader title={priorityGoal ? 'Tujuan lainnya' : 'Tujuanmu'} subtitle={`${secondaryGoals.length} tujuan`} />
          <div className="grid gap-4 sm:grid-cols-2">
            {secondaryGoals.map((g) => {
              const pct = pctOf(g);
              return (
                <Card key={g.id} className="card-pad flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold/15 text-gold">
                      <Icon name={getSafeIcon(g.icon)} />
                    </span>
                    <button type="button" onClick={() => setConfirmDelete(g)} className="icon-btn -mr-2 -mt-1 h-9 w-9 hover:text-neg" aria-label="Hapus tujuan">
                      <Icon name="delete" className="text-[19px]" />
                    </button>
                  </div>
                  <h3 className="mt-4 truncate text-[16px] font-semibold text-ink">{g.title}</h3>
                  {g.description && <p className="mt-0.5 line-clamp-2 text-[13px] text-ink-3">{g.description}</p>}
                  <div className="mt-auto pt-5">
                    <div className="mb-2 flex items-baseline justify-between text-[13px]">
                      <span className="num font-semibold text-ink">{formatIDR(g.saved_amount)}</span>
                      <span className="num text-ink-3">{Math.round(pct)}% · {formatIDR(g.target_amount)}</span>
                    </div>
                    <ProgressBar value={pct} />
                    <button type="button" onClick={() => openFundModal(g)} className="btn-ghost mt-4 w-full py-2.5">
                      <Icon name="add" className="text-[18px]" />Tambah dana
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* New goal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tujuan baru" subtitle="Beri nama dan target yang ingin dicapai." icon="flag">
        <form onSubmit={handleAddGoal} className="space-y-4">
          <label className="block">
            <span className="label">Nama tujuan</span>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Liburan ke Bali" className="field" />
          </label>
          <label className="block">
            <span className="label">Deskripsi <span className="font-normal text-ink-3">(opsional)</span></span>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Contoh: Akhir tahun bersama keluarga" className="field" />
          </label>
          <label className="block">
            <span className="label">Target (Rp)</span>
            <AmountInput required value={targetAmount} onChange={setTargetAmount} placeholder="25.000.000" className="field num" />
          </label>
          <div>
            <span className="label">Ikon</span>
            <div className="grid grid-cols-6 gap-2">
              {GOAL_ICONS.map((name) => (
                <button key={name} type="button" onClick={() => setIcon(name)} aria-pressed={icon === name} aria-label={name}
                  className={`flex aspect-square items-center justify-center rounded-xl border transition ${icon === name ? 'border-gold/60 bg-gold/15 text-gold' : 'border-line text-ink-2 hover:text-ink'}`}>
                  <Icon name={name} fill={icon === name} />
                </button>
              ))}
            </div>
          </div>
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3">
            <span>
              <span className="block text-[14px] font-semibold text-ink">Jadikan prioritas</span>
              <span className="block text-[12px] text-ink-3">Ditampilkan paling atas dan di beranda.</span>
            </span>
            <input type="checkbox" checked={isPriority} onChange={(e) => setIsPriority(e.target.checked)} className="peer sr-only" />
            <span className="relative h-6 w-11 shrink-0 rounded-full bg-line transition after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:bg-gold peer-checked:after:translate-x-5" />
          </label>
          <button type="submit" className="btn-primary w-full py-3.5">Simpan tujuan</button>
        </form>
      </Modal>

      {/* Add funds */}
      <Modal open={!!activeFundGoal} onClose={() => setActiveFundGoal(null)} title="Tambah dana" subtitle={activeFundGoal?.title} icon={getSafeIcon(activeFundGoal?.icon)}>
        <form onSubmit={handleAddFundsSubmit} className="space-y-5">
          <div className="rounded-3xl bg-surface-2/60 px-4 py-6 text-center">
            <p className="eyebrow">Jumlah (Rp)</p>
            <AmountInput autoFocus required value={fundAmount} onChange={setFundAmount} placeholder="0"
              className="num mt-2 w-full border-0 bg-transparent p-0 text-center text-4xl font-semibold text-ink outline-none placeholder:text-ink-3/50" />
            <p className="mt-2 text-[12px] text-ink-3">Dana diambil dari saldo akunmu.</p>
          </div>
          {fundError && <Alert>{fundError}</Alert>}
          <QuickAmounts amounts={[100000, 500000, 1000000]} onPick={setFundAmount} prefix="+" />
          <button type="submit" disabled={funding} className="btn-gold w-full py-3.5">
            {funding ? <><Icon name="progress_activity" className="animate-spin" />Memproses…</> : <><Icon name="savings" />Konfirmasi</>}
          </button>
        </form>
      </Modal>

      {/* Confirm delete */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Hapus tujuan?" subtitle={confirmDelete?.title} icon="delete">
        <p className="text-[14px] text-ink-2">Tujuan ini akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.</p>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setConfirmDelete(null)} className="btn-ghost">Batal</button>
          <button type="button" onClick={() => { deleteGoal(confirmDelete.id); setConfirmDelete(null); }} className="btn bg-neg text-white hover:brightness-110">Hapus</button>
        </div>
      </Modal>
    </AppShell>
  );
}

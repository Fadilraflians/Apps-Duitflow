import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { Card, Icon, Modal, QuickAmounts } from '../components/ui';
import AmountInput, { parseAmount } from '../components/AmountInput';
import { AuthContext } from '../context/AuthContext';
import { FinanceContext } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';
import { formatIDR, initialsOf } from '../utils/format';

function Toggle({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-gold' : 'bg-line'}`}>
      <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );
}

function Row({ icon, title, hint, right, to, onClick }) {
  const inner = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink-2"><Icon name={icon} /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-semibold text-ink">{title}</span>
        {hint && <span className="block truncate text-[12px] text-ink-3">{hint}</span>}
      </span>
      {right ?? <Icon name="chevron_right" className="text-ink-3" />}
    </>
  );
  const cls = 'flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition hover:bg-surface-2/60';
  if (to) return <Link to={to} className={cls}>{inner}</Link>;
  if (onClick) return <button type="button" onClick={onClick} className={cls}>{inner}</button>;
  return <div className={cls}>{inner}</div>;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateUserLimit } = useContext(AuthContext);
  const { accounts, showBalance, setShowBalance } = useContext(FinanceContext);
  const { theme, toggleTheme } = useTheme();
  const [limitOpen, setLimitOpen] = useState(false);
  const [limitAmt, setLimitAmt] = useState('');

  const displayName = user?.full_name?.trim() || user?.fullName?.trim() || user?.name?.trim() || user?.email?.split('@')?.[0] || 'Tamu';
  const monthlyLimit = Number(user?.monthly_limit) || 0;

  const handleLogout = () => { logout(); navigate('/'); };
  const saveLimit = (e) => {
    e.preventDefault();
    if (parseAmount(limitAmt) > 0) { updateUserLimit(parseAmount(limitAmt)); setLimitOpen(false); setLimitAmt(''); }
  };

  return (
    <AppShell title="Profil" subtitle="Atur akun dan preferensi aplikasi.">
      <div className="mx-auto max-w-2xl space-y-5">
        <section className="lux-card flex items-center gap-4 p-6 animate-fade-up">
          <span className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#D6B97B]/15 text-xl font-semibold text-[#D6B97B] ring-1 ring-[#D6B97B]/30">
            {initialsOf(user)}
          </span>
          <div className="relative z-10 min-w-0">
            <p className="truncate font-display text-[28px] leading-tight">{displayName}</p>
            <p className="truncate text-[13px] text-[#F2EFE8]/60">{user?.email || 'Belum masuk'}</p>
          </div>
        </section>

        {!user && (
          <Card className="card-pad flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[14px] text-ink-2">Masuk untuk menyimpan data keuanganmu dengan aman.</p>
            <Link to="/login" className="btn-primary">Masuk</Link>
          </Card>
        )}

        <div>
          <p className="eyebrow mb-2 px-1">Keuangan</p>
          <Card className="divide-y divide-line/70 overflow-hidden">
            <Row icon="account_balance_wallet" title="Akun & saldo" hint={`${accounts.length} akun terhubung`} to="/money-details" />
            <Row icon="tune" title="Batas pengeluaran bulanan" hint={monthlyLimit ? formatIDR(monthlyLimit) : 'Belum diatur'} onClick={() => setLimitOpen(true)} />
            <Row icon="calendar_month" title="Ringkasan bulanan" hint="Laporan pemasukan & pengeluaran" to="/monthly-summary" />
          </Card>
        </div>

        <div>
          <p className="eyebrow mb-2 px-1">Tampilan</p>
          <Card className="divide-y divide-line/70 overflow-hidden">
            <Row icon={theme === 'dark' ? 'dark_mode' : 'light_mode'} title="Mode gelap" hint={theme === 'dark' ? 'Aktif' : 'Nonaktif'}
              right={<Toggle checked={theme === 'dark'} onChange={toggleTheme} label="Mode gelap" />} />
            <Row icon={showBalance ? 'visibility' : 'visibility_off'} title="Tampilkan saldo" hint="Sembunyikan nominal saat di tempat umum"
              right={<Toggle checked={showBalance} onChange={() => setShowBalance(!showBalance)} label="Tampilkan saldo" />} />
          </Card>
        </div>

        {user && (
          <button type="button" onClick={handleLogout} className="btn w-full border border-line bg-surface py-3.5 text-neg hover:bg-neg/10">
            <Icon name="logout" />Keluar
          </button>
        )}
        <p className="pb-4 text-center text-[12px] text-ink-3">DuitFlow · Kelola uang dengan tenang</p>
      </div>

      <Modal open={limitOpen} onClose={() => setLimitOpen(false)} title="Batas bulanan" subtitle="Kami akan mengingatkan saat mendekati batas." icon="tune">
        <form onSubmit={saveLimit} className="space-y-6">
          <div className="rounded-3xl bg-surface-2/60 px-4 py-6 text-center">
            <p className="eyebrow">Batas pengeluaran (Rp)</p>
            <AmountInput autoFocus required value={limitAmt} onChange={setLimitAmt}
              placeholder={monthlyLimit ? new Intl.NumberFormat('id-ID').format(monthlyLimit) : '5.000.000'}
              className="num mt-2 w-full border-0 bg-transparent p-0 text-center text-4xl font-semibold text-ink outline-none placeholder:text-ink-3/50" />
          </div>
          <QuickAmounts amounts={[1000000, 3000000, 5000000, 10000000]} onPick={setLimitAmt} />
          <button type="submit" className="btn-primary w-full py-3.5">Simpan batas</button>
        </form>
      </Modal>
    </AppShell>
  );
}

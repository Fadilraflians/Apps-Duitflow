import { useContext, useState } from 'react';
import AppShell from '../components/AppShell';
import { Alert, Card, EmptyState, Icon, Modal } from '../components/ui';
import AmountInput, { parseAmount } from '../components/AmountInput';
import { FinanceContext } from '../context/FinanceContext';
import { accountMeta, formatIDR } from '../utils/format';

const TYPES = [
  { value: 'bank', label: 'Bank', icon: 'account_balance' },
  { value: 'cash', label: 'Tunai', icon: 'payments' },
  { value: 'ewallet', label: 'E-wallet', icon: 'account_balance_wallet' },
];

const ACCOUNT_COLORS = ['#D6B97B', '#3987e5', '#199e70', '#d55181', '#9085e9', '#d95926'];

export default function MoneyDetails() {
  const { accounts, currentBalance, addAccount, showBalance } = useContext(FinanceContext);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState('bank');
  const [initialBalance, setInitialBalance] = useState('0');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddAccount = async (event) => {
    event.preventDefault();
    if (saving) return;
    setError('');
    setSaving(true);
    const result = await addAccount({ name, account_type: accountType, initial_balance: parseAmount(initialBalance) });
    setSaving(false);
    if (!result?.ok) {
      setError(result?.error || 'Akun belum berhasil ditambahkan.');
      return;
    }
    setName(''); setInitialBalance('0'); setAccountType('bank');
    setShowForm(false);
  };

  const close = () => { setShowForm(false); setError(''); };
  const total = accounts.reduce((s, a) => s + Math.max(Number(a.balance) || 0, 0), 0);
  const hidden = 'Rp ••••••';

  return (
    <AppShell title="Akun & saldo" subtitle="Bank, uang tunai, dan dompet digital dalam satu tempat." back>
      <div className="mx-auto max-w-2xl space-y-5">
        <section className="lux-card p-6 animate-fade-up sm:p-8">
          <div className="relative z-10">
            <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#F2EFE8]/60">Total saldo</p>
            <p className="num mt-3 text-4xl font-semibold sm:text-5xl">{showBalance ? formatIDR(currentBalance) : hidden}</p>
            <p className="mt-2 text-[13px] text-[#F2EFE8]/55">Tersebar di {accounts.length} akun</p>
            {accounts.length > 1 && total > 0 && (
              <div className="mt-6 flex h-1.5 gap-[2px] overflow-hidden rounded-full">
                {accounts.map((a, i) => (a.balance > 0 && (
                  <span key={a.id} className="h-full" title={`${a.name}: ${formatIDR(a.balance)}`}
                    style={{ width: `${(a.balance / total) * 100}%`, background: ACCOUNT_COLORS[i % ACCOUNT_COLORS.length] }} />
                )))}
              </div>
            )}
          </div>
        </section>

        <Card className="card-pad animate-fade-up">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 className="text-[17px] font-semibold text-ink">Akun saya</h2>
            <button type="button" onClick={() => setShowForm(true)} className="btn-primary py-2.5">
              <Icon name="add" className="text-[18px]" />Tambah akun
            </button>
          </div>
          {accounts.length ? (
            <div className="-mx-2 divide-y divide-line/70">
              {accounts.map((account, i) => {
                const meta = accountMeta(account.account_type);
                return (
                  <article key={account.id} className="flex items-center gap-3.5 px-2 py-3.5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-ink-2"><Icon name={meta.icon} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 truncate text-[14px] font-semibold text-ink">
                        {accounts.length > 1 && <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: ACCOUNT_COLORS[i % ACCOUNT_COLORS.length] }} />}
                        {account.name}
                      </p>
                      <p className="text-[12px] text-ink-3">{meta.label}</p>
                    </div>
                    <p className={`num text-right text-[14px] font-semibold ${account.balance < 0 ? 'text-neg' : 'text-ink'}`}>
                      {showBalance ? formatIDR(account.balance) : hidden}
                    </p>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState icon="account_balance_wallet" title="Belum ada akun" text="Tambahkan rekening bank, uang tunai, atau dompet digital untuk mulai mencatat." />
          )}
        </Card>
      </div>

      <Modal open={showForm} onClose={close} title="Akun baru" subtitle="Saldo awal membuat total langsung sesuai." icon="account_balance">
        <form onSubmit={handleAddAccount} className="space-y-4">
          {error && <Alert>{error}</Alert>}
          <div>
            <span className="label">Jenis akun</span>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map((t) => (
                <button key={t.value} type="button" onClick={() => setAccountType(t.value)} aria-pressed={accountType === t.value}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-[12px] font-semibold transition ${accountType === t.value ? 'border-gold/60 bg-gold/10 text-ink' : 'border-line text-ink-2 hover:text-ink'}`}>
                  <Icon name={t.icon} fill={accountType === t.value} className={accountType === t.value ? 'text-gold' : ''} />{t.label}
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="label">Nama akun</span>
            <input autoFocus className="field" placeholder={accountType === 'cash' ? 'Contoh: Dompet' : accountType === 'ewallet' ? 'Contoh: GoPay' : 'Contoh: Bank Mandiri'}
              value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required />
          </label>
          <label className="block">
            <span className="label">Saldo awal (Rp)</span>
            <AmountInput className="field num" value={initialBalance} onChange={setInitialBalance} required />
          </label>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button type="button" onClick={close} className="btn-ghost">Batal</button>
            <button disabled={saving} type="submit" className="btn-primary">{saving ? 'Menyimpan…' : 'Simpan akun'}</button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

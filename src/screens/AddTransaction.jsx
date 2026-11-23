import { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { Alert, Card, DateField, EmptyState, Icon } from '../components/ui';
import AmountInput, { parseAmount } from '../components/AmountInput';
import { FinanceContext } from '../context/FinanceContext';
import { accountMeta, CATEGORIES, formatIDR } from '../utils/format';

const EXPENSE_CATEGORIES = ['Food', 'Shopping', 'Transport', 'Bills', 'Leisure'];
const INCOME = { name: 'Income', icon: CATEGORIES.Income.icon };

const newRequestId = () => globalThis.crypto?.randomUUID?.()
  || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function AddTransaction() {
  const navigate = useNavigate();
  const { addTransaction, accounts } = useContext(FinanceContext);
  const [kind, setKind] = useState('spend');
  const [amount, setAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Food');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const submitting = useRef(false);
  const requestId = useRef(newRequestId());

  useEffect(() => {
    if (!selectedAccountId && accounts.length) setSelectedAccountId(String(accounts[0].id));
  }, [accounts, selectedAccountId]);

  const selectedAccount = accounts.find((account) => String(account.id) === selectedAccountId);
  const isIncome = kind === 'income';
  const category = isIncome ? INCOME : { name: expenseCategory, icon: CATEGORIES[expenseCategory].icon };

  const handleSave = async (event) => {
    event.preventDefault();
    if (submitting.current) return;
    const parsedAmount = parseAmount(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Masukkan jumlah yang lebih besar dari 0.');
      return;
    }
    if (!selectedAccount) {
      setError('Pilih akun untuk transaksi ini.');
      return;
    }

    submitting.current = true;
    setIsSaving(true);
    setError('');
    const result = await addTransaction({
      title: note.trim() || CATEGORIES[category.name].label,
      time: new Date(`${date}T12:00:00`).toISOString(),
      amount: parsedAmount,
      icon: category.icon,
      category: category.name,
      negative: !isIncome,
      account_id: selectedAccount.id,
      account_type: selectedAccount.account_type,
      account_name: selectedAccount.name,
      request_id: requestId.current
    });

    if (result?.ok) {
      navigate('/home', { replace: true });
      return;
    }

    setError(result?.error || 'Transaksi belum berhasil disimpan. Coba lagi.');
    submitting.current = false;
    setIsSaving(false);
  };

  return (
    <AppShell title="Catat transaksi" subtitle="Cukup isi jumlah, pilih kategori dan akun, lalu simpan." back>
      <form onSubmit={handleSave} className="mx-auto max-w-2xl space-y-5 animate-fade-up">
        {/* Amount */}
        <section className="lux-card p-6 sm:p-8">
          <div className="relative z-10">
            <div className="flex justify-center">
              <div className="inline-flex rounded-2xl bg-white/[0.07] p-1">
                {[
                  { v: 'spend', l: 'Pengeluaran', i: 'north_east' },
                  { v: 'income', l: 'Pemasukan', i: 'south_west' },
                ].map((o) => (
                  <button key={o.v} type="button" onClick={() => setKind(o.v)} aria-pressed={kind === o.v}
                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-semibold transition ${
                      kind === o.v ? 'bg-[#F2EFE8] text-[#0f1513]' : 'text-[#F2EFE8]/60 hover:text-[#F2EFE8]'
                    }`}>
                    <Icon name={o.i} className="text-[16px]" />{o.l}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-8 flex items-baseline justify-center gap-2">
              <span className="text-xl font-medium text-[#F2EFE8]/50">Rp</span>
              <AmountInput
                aria-label="Jumlah transaksi"
                autoFocus
                className="num min-w-0 max-w-full border-0 bg-transparent p-0 text-left text-5xl font-semibold text-[#F2EFE8] outline-none placeholder:text-[#F2EFE8]/25 sm:text-6xl"
                placeholder="0"
                style={{ width: `${Math.max(amount.length, 1) + 0.6}ch` }}
                value={amount}
                onChange={setAmount}
                required
              />
            </div>
            <p className="mt-3 text-center text-[13px] text-[#F2EFE8]/55">
              {isIncome ? 'Menambah saldo akun yang dipilih' : 'Mengurangi saldo akun yang dipilih'}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {[10000, 50000, 100000, 500000].map((amt) => (
                <button key={amt} type="button" onClick={() => setAmount(String(amt))}
                  className="rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-xs font-semibold text-[#F2EFE8]/75 transition hover:border-[#D6B97B]/50 hover:text-[#F2EFE8]">
                  {amt >= 1_000_000 ? `${amt / 1_000_000} jt` : `${amt / 1_000} rb`}
                </button>
              ))}
            </div>
          </div>
        </section>

        {error && <Alert>{error}</Alert>}

        {/* Category */}
        {!isIncome && (
          <Card className="card-pad">
            <p className="label">Kategori</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {EXPENSE_CATEGORIES.map((name) => {
                const meta = CATEGORIES[name];
                const active = expenseCategory === name;
                return (
                  <button key={name} type="button" onClick={() => setExpenseCategory(name)} aria-pressed={active}
                    className={`flex flex-col items-center gap-2 rounded-2xl border px-2 py-3.5 text-[12px] font-semibold transition ${
                      active ? 'border-gold/60 bg-gold/10 text-ink' : 'border-line text-ink-2 hover:border-ink/20 hover:text-ink'
                    }`}>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ color: meta.color, background: `color-mix(in srgb, ${meta.color} 14%, transparent)` }}>
                      <Icon name={meta.icon} fill={active} />
                    </span>
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {/* Account */}
        <Card className="card-pad">
          <div className="mb-3 flex items-center justify-between">
            <p className="label !mb-0">{isIncome ? 'Masuk ke akun' : 'Dibayar dari akun'}</p>
            <Link to="/money-details" className="text-[12px] font-semibold text-gold hover:underline">+ Tambah akun</Link>
          </div>
          {accounts.length ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {accounts.map((account) => {
                const active = String(account.id) === selectedAccountId;
                const meta = accountMeta(account.account_type);
                return (
                  <button key={account.id} type="button" onClick={() => setSelectedAccountId(String(account.id))} aria-pressed={active}
                    className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${active ? 'border-gold/60 bg-gold/10' : 'border-line hover:border-ink/20'}`}>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink-2">
                      <Icon name={meta.icon} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold text-ink">{account.name}</span>
                      <span className="num block text-[12px] text-ink-3">{formatIDR(account.balance)}</span>
                    </span>
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${active ? 'border-gold bg-gold' : 'border-line'}`}>
                      {active && <Icon name="check" className="text-[14px] text-[#14110a]" />}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <EmptyState icon="account_balance_wallet" title="Belum ada akun" text="Buat akun dulu (bank, tunai, atau dompet digital)."
              action={<Link to="/money-details" className="btn-primary">Buat akun pertama</Link>} />
          )}
        </Card>

        {/* Details */}
        <Card className="card-pad grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="label">Tanggal</span>
            <DateField value={date} onChange={setDate} required aria-label="Tanggal transaksi" />
          </label>
          <label className="block">
            <span className="label">Catatan <span className="font-normal text-ink-3">(opsional)</span></span>
            <input className="field" placeholder={isIncome ? 'Contoh: Gaji bulanan' : 'Contoh: Makan siang'} value={note} onChange={(event) => setNote(event.target.value)} />
          </label>
        </Card>

        <button disabled={isSaving || !accounts.length} type="submit" className="btn-primary w-full py-4 text-[15px]">
          {isSaving
            ? <><Icon name="progress_activity" className="animate-spin" />Menyimpan…</>
            : <><Icon name="check" />Simpan {isIncome ? 'pemasukan' : 'pengeluaran'}</>}
        </button>
      </form>
    </AppShell>
  );
}

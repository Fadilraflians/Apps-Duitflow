import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/BottomNavBar';
import { FinanceContext } from '../context/FinanceContext';
import AmountInput, { parseAmount } from '../components/AmountInput';

const formatIDR = (value) => new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0
}).format(value || 0);

const accountIcons = { bank: 'account_balance', cash: 'payments', ewallet: 'account_balance_wallet' };

export default function MoneyDetails() {
  const navigate = useNavigate();
  const { accounts, currentBalance, addAccount } = useContext(FinanceContext);
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
    const result = await addAccount({
      name,
      account_type: accountType,
      initial_balance: parseAmount(initialBalance)
    });
    setSaving(false);
    if (!result?.ok) {
      setError(result?.error || 'Akun belum berhasil ditambahkan.');
      return;
    }
    setName('');
    setInitialBalance('0');
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/70 bg-white/90 px-5 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:px-8">
        <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-emerald-700 dark:hover:bg-slate-900">
          <span className="material-symbols-outlined">arrow_back</span> Kembali
        </button>
        <h1 className="text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-300 sm:text-sm">Akun & Saldo</h1>
        <span className="w-20" />
      </header>

      <main className="mx-auto max-w-3xl space-y-5 px-4 pt-6 sm:px-6 sm:pt-9">
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-500 p-6 text-white shadow-xl shadow-emerald-900/15 sm:p-9">
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-emerald-100">
              <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
              <p className="text-xs font-bold uppercase tracking-[0.2em]">Total saldo</p>
            </div>
            <p className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{formatIDR(currentBalance)}</p>
            <p className="mt-2 text-sm text-emerald-50/80">Tersebar di {accounts.length} akun</p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold">Akun saya</h2>
              <p className="mt-1 text-sm text-slate-500">Bank, uang tunai, dan dompet digital.</p>
            </div>
            <button type="button" onClick={() => { setShowForm((value) => !value); setError(''); }} className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-md shadow-emerald-900/10 transition hover:bg-emerald-800">
              <span className="material-symbols-outlined text-lg">add</span><span className="hidden sm:inline">Tambah akun</span>
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleAddAccount} className="mb-5 space-y-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20 sm:p-5">
              <div>
                <h3 className="font-bold">Akun baru</h3>
                <p className="mt-1 text-xs text-slate-500">Masukkan saldo awal agar total saldo langsung sesuai.</p>
              </div>
              {error && <div role="alert" className="rounded-xl bg-rose-100 px-3 py-2 text-sm font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">{error}</div>}
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-bold text-slate-500">
                  NAMA AKUN
                  <input autoFocus className="mt-2 block w-full rounded-xl border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 focus:border-emerald-500 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="Contoh: Bank Mandiri" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} required />
                </label>
                <label className="text-xs font-bold text-slate-500">
                  JENIS AKUN
                  <select className="mt-2 block w-full rounded-xl border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 focus:border-emerald-500 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" value={accountType} onChange={(event) => setAccountType(event.target.value)}>
                    <option value="bank">Rekening bank</option>
                    <option value="cash">Uang tunai</option>
                    <option value="ewallet">Dompet digital</option>
                  </select>
                </label>
              </div>
              <label className="block text-xs font-bold text-slate-500">
                SALDO AWAL (RP)
                  <AmountInput className="mt-2 block w-full rounded-xl border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 focus:border-emerald-500 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" value={initialBalance} onChange={setInitialBalance} required />
              </label>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => { setShowForm(false); setError(''); }} className="rounded-xl px-4 py-3 text-sm font-bold text-slate-500 hover:bg-white dark:hover:bg-slate-900">Batal</button>
                <button disabled={saving} type="submit" className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:opacity-60">{saving ? 'Menyimpan…' : 'Simpan akun'}</button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {accounts.map((account) => (
              <article key={account.id} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40 dark:border-slate-800 dark:bg-slate-950/50 dark:hover:border-emerald-900">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${account.account_type === 'cash' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' : account.account_type === 'ewallet' ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'}`}>
                  <span className="material-symbols-outlined">{accountIcons[account.account_type] || accountIcons.bank}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{account.name}</p>
                  <p className="mt-1 text-xs capitalize text-slate-500">{account.account_type === 'ewallet' ? 'Dompet digital' : account.account_type === 'cash' ? 'Uang tunai' : 'Rekening bank'}</p>
                </div>
                <p className="text-right text-sm font-extrabold sm:text-base">{formatIDR(account.balance)}</p>
              </article>
            ))}
            {!accounts.length && <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">Akun sedang dimuat atau belum tersedia.</p>}
          </div>
        </section>
      </main>
      <BottomNavBar />
    </div>
  );
}

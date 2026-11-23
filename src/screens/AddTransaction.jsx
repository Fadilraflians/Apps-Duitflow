import { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FinanceContext } from '../context/FinanceContext';
import AmountInput, { parseAmount } from '../components/AmountInput';

const categories = [
  { name: 'Food', icon: 'restaurant' },
  { name: 'Shopping', icon: 'shopping_bag' },
  { name: 'Transport', icon: 'directions_car' },
  { name: 'Bills', icon: 'receipt_long' },
  { name: 'Leisure', icon: 'movie' },
  { name: 'Income', icon: 'payments' }
];

const formatIDR = (value) => new Intl.NumberFormat('id-ID').format(value || 0);
const newRequestId = () => globalThis.crypto?.randomUUID?.()
  || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function AddTransaction() {
  const navigate = useNavigate();
  const { addTransaction, accounts } = useContext(FinanceContext);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]);
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
  const isIncome = category.name === 'Income';

  const handleSave = async (event) => {
    event.preventDefault();
    if (submitting.current) return;
    const parsedAmount = parseAmount(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Masukkan jumlah yang lebih besar dari 0.');
      return;
    }
    if (!selectedAccount) {
      setError('Pilih akun tujuan transaksi.');
      return;
    }

    submitting.current = true;
    setIsSaving(true);
    setError('');
    const result = await addTransaction({
      title: note.trim() || category.name,
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
    <div className="min-h-screen bg-[#090f12] px-4 pb-10 pt-5 text-slate-100 sm:px-6 sm:pt-8">
      <main className="mx-auto max-w-2xl">
        <header className="mb-6 flex items-center justify-between">
          <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-emerald-700 dark:hover:bg-slate-900">
            <span className="material-symbols-outlined">arrow_back</span> Kembali
          </button>
          <Link to="/money-details" className="text-sm font-bold text-emerald-700 hover:underline dark:text-emerald-400">Kelola akun</Link>
        </header>

        <form onSubmit={handleSave} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900">
          <div className={`border-b border-white/10 px-6 pb-8 pt-7 text-white sm:px-9 ${isIncome ? 'bg-gradient-to-br from-[#12372b] via-[#145641] to-[#1b7552]' : 'bg-gradient-to-br from-[#10171b] via-[#142027] to-[#172c28]'}`}>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70">Transaksi baru</p>
            <div className="mt-6 flex items-end gap-3">
              <span className="pb-2 text-lg font-semibold text-white/70">Rp</span>
              <AmountInput
                aria-label="Jumlah transaksi"
                className="w-full min-w-0 border-0 bg-transparent p-0 text-4xl font-extrabold tracking-tight text-white placeholder:text-white/35 focus:ring-0 sm:text-5xl"
                placeholder="0"
                value={amount}
                onChange={setAmount}
                required
              />
            </div>
            <p className="mt-2 text-sm text-white/70">{isIncome ? 'Pemasukan akan menambah saldo akun.' : 'Pengeluaran akan mengurangi saldo akun.'}</p>
          </div>

          <div className="space-y-7 p-5 sm:p-9">
            {error && <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{error}</div>}

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">Kategori</h2>
                <span className="text-xs text-slate-400">Pilih satu</span>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {categories.map((item) => {
                  const active = category.name === item.name;
                  return (
                    <button key={item.name} type="button" onClick={() => setCategory(item)} aria-pressed={active}
                      className={`flex flex-col items-center gap-2 rounded-2xl border px-2 py-3 text-xs font-semibold transition ${active ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300' : 'border-slate-200 bg-white text-slate-500 hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'}`}>
                      <span className="material-symbols-outlined">{item.icon}</span>
                      {item.name === 'Income' ? 'Pemasukan' : item.name}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">{isIncome ? 'Masuk ke akun' : 'Bayar dari akun'}</h2>
                <Link to="/money-details" className="text-xs font-bold text-emerald-700 dark:text-emerald-400">+ Tambah akun</Link>
              </div>
              {accounts.length ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {accounts.map((account) => {
                    const active = String(account.id) === selectedAccountId;
                    return (
                      <button key={account.id} type="button" onClick={() => setSelectedAccountId(String(account.id))} aria-pressed={active}
                        className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${active ? 'border-emerald-600 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/40' : 'border-slate-200 hover:border-emerald-300 dark:border-slate-700'}`}>
                        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${account.account_type === 'cash' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' : account.account_type === 'ewallet' ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'}`}>
                          <span className="material-symbols-outlined">{account.account_type === 'cash' ? 'payments' : account.account_type === 'ewallet' ? 'account_balance_wallet' : 'account_balance'}</span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-slate-800 dark:text-slate-100">{account.name}</span>
                          <span className="block text-xs text-slate-500">Saldo Rp {formatIDR(account.balance)}</span>
                        </span>
                        {active && <span className="material-symbols-outlined text-emerald-700 dark:text-emerald-400">check_circle</span>}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-center dark:border-slate-700">
                  <p className="text-sm text-slate-500">Belum ada akun untuk transaksi.</p>
                  <Link to="/money-details" className="mt-2 inline-block text-sm font-bold text-emerald-700 dark:text-emerald-400">Buat akun pertama</Link>
                </div>
              )}
            </section>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-bold text-slate-500">
                TANGGAL
                <input className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 focus:border-emerald-500 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
              </label>
              <label className="block text-xs font-bold text-slate-500">
                CATATAN
                <input className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 placeholder:font-normal focus:border-emerald-500 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" placeholder="Contoh: Gaji bulanan" value={note} onChange={(event) => setNote(event.target.value)} />
              </label>
            </div>

            <button disabled={isSaving || !accounts.length} type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-4 font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60">
              {isSaving ? <><span className="material-symbols-outlined animate-spin">progress_activity</span> Menyimpan…</> : <>Simpan {isIncome ? 'Pemasukan' : 'Transaksi'}<span className="material-symbols-outlined">arrow_forward</span></>}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

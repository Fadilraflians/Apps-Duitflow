import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FinanceContext } from '../context/FinanceContext';
import { AuthContext } from '../context/AuthContext';

export default function AddTransaction() {
  const navigate = useNavigate();
  const { addTransaction, currentBalance, monthlyIncome, monthlySpend } = useContext(FinanceContext);
  const { user } = useContext(AuthContext);
  const firstName = user?.full_name?.split(' ')?.[0] || user?.email?.split('@')?.[0] || 'Guest';

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState({ name: 'Food', icon: 'restaurant' });
  const [accountType, setAccountType] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const categories = [
    { name: 'Food', icon: 'restaurant' },
    { name: 'Shopping', icon: 'shopping_cart' },
    { name: 'Transport', icon: 'directions_car' },
    { name: 'Leisure', icon: 'theater_comedy' },
    { name: 'Bills', icon: 'bolt' },
    { name: 'Income', icon: 'payments' }
  ];

  const handleClose = () => {
    navigate(-1);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!amount) return;
    setError('');
    if (!accountType) {
      setError('Pilih sumber dana terlebih dahulu (Bank BCA / Cash)');
      return;
    }
    
    // Add transaction logic
    const isIncome = category.name === 'Income';
    const normalizedAccountType = accountType === 'cash' ? 'cash' : 'bca';

    const newTx = {
      id: Date.now(),
      title: note || category.name,
      time: new Date(date).toISOString(),
      amount: parseFloat(amount),
      icon: category.icon,
      category: category.name,
      negative: !isIncome,
      account_type: normalizedAccountType
    };

    addTransaction(newTx).then((result) => {
      if (result?.ok) {
        navigate('/home');
      } else {
        setError(result?.error || 'Gagal menyimpan transaksi');
      }
    });
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen overflow-hidden">
      {/* Background Dashboard (Dimmed) */}
      <div className="fixed inset-0 z-0 brightness-[0.4] grayscale-[0.2] overflow-hidden bg-surface">
        <header className="w-full top-0 sticky bg-[#f5f7f9] dark:bg-slate-950 flex justify-between items-center px-6 py-4 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8FnDV5LgDPW8z0pjm6Qt8l0sZMKRyXAbvolEMcc6cxA2riikRSPcfJAAqWygJ5olGP8836HCmT4HkQtyYeDCmFxSzXOoGpWnSzHFRuYgMoFRUkbA8CYD3PKw-yv5NVq3YivKXb5TyCu66y3ksYEFNM6M-f1-H_2S2BFpV6KY9dFfrnfQV9n4JjIxc43mZXLc41rZZk5eSGUzeft6IFf_Iahj2g1YXliFFjCiWu2cz1Cz4_hJ825WIi1cv0ANjQBGsrWZBXF9kaXXq" alt="Profile" />
            </div>
            <span className="text-2xl font-bold text-[#006a2d] dark:text-[#6bff8f] tracking-tight">{firstName}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-500 hover:bg-slate-200/50 rounded-full">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </header>

        <main className="px-6 py-8 space-y-8 pointer-events-none">
          <section className="space-y-1">
            <p className="font-label text-[0.6875rem] font-bold uppercase tracking-widest text-on-surface-variant">Available Wealth</p>
            <h1 className="text-[2.2rem] sm:text-[3rem] font-headline font-extrabold tracking-tight leading-none text-primary">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(currentBalance)}</h1>
          </section>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest p-6 rounded-xl space-y-3">
              <span className="material-symbols-outlined text-primary text-3xl">trending_up</span>
              <div>
                <p className="font-label text-[0.6875rem] font-bold uppercase tracking-widest text-on-surface-variant">Monthly Income</p>
                <p className="text-xl font-headline font-bold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(monthlyIncome)}</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl space-y-3">
              <span className="material-symbols-outlined text-error text-3xl">trending_down</span>
              <div>
                <p className="font-label text-[0.6875rem] font-bold uppercase tracking-widest text-on-surface-variant">Monthly Spend</p>
                <p className="text-xl font-headline font-bold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(monthlySpend)}</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Sheet Modal */}
      <div className="fixed inset-0 z-10 flex flex-col justify-end pointer-events-none">
        
        <div className="w-full flex justify-center mb-2 pointer-events-auto cursor-pointer" onClick={handleClose}>
          <div className="w-12 h-1.5 bg-white/40 rounded-full"></div>
        </div>

        <div className="bg-surface-bright rounded-t-[2.5rem] p-8 pb-12 w-full max-h-[795px] overflow-y-auto shadow-[0_-12px_40px_rgba(0,0,0,0.15)] relative pointer-events-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-headline font-bold tracking-tight">New Transaction</h2>
            <button onClick={handleClose} type="button" className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface">close</span>
            </button>
          </div>

          <form className="space-y-8" onSubmit={handleSave}>
            {error && (
              <div className="p-3 bg-error-container text-on-error-container rounded-xl text-sm font-bold text-center">
                {error}
              </div>
            )}
            <div className="text-center space-y-2">
              <p className="font-label text-[0.6875rem] font-bold uppercase tracking-widest text-on-surface-variant">Enter Amount</p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-2xl font-headline font-bold text-on-surface-variant">Rp</span>
                <input 
                  className="text-[4rem] font-headline font-extrabold tracking-tight bg-transparent border-none text-center focus:ring-0 w-full text-primary" 
                  placeholder="0.00" 
                  type="number" 
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <p className="font-label text-[0.6875rem] font-bold uppercase tracking-widest text-on-surface-variant px-1">Select Category</p>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-8 px-8">
                {categories.map(cat => (
                  <button 
                    key={cat.name} 
                    onClick={() => setCategory(cat)}
                    className="flex-shrink-0 flex flex-col items-center gap-2 group outline-none" 
                    type="button"
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${category.name === cat.name ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}>
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: category.name === cat.name ? "'FILL' 1" : "" }}>{cat.icon}</span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${category.name === cat.name ? 'text-primary' : 'text-on-surface-variant'}`}>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <label className="absolute left-4 top-3 font-label text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant">Sumber Dana</label>
                <select
                  className="w-full pt-8 pb-3 px-4 bg-surface-container-low border-none rounded-xl font-bold focus:bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 transition-all"
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                >
                  <option value="" disabled>Pilih sumber dana</option>
                  <option value="bca">Bank BCA</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div className="relative">
                <label className="absolute left-4 top-3 font-label text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant">Transaction Date</label>
                <input 
                  className="w-full pt-8 pb-3 px-4 bg-surface-container-low border-none rounded-xl font-bold focus:bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 transition-all" 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="relative">
                <label className="absolute left-4 top-3 font-label text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant">Add a Note</label>
                <input 
                  className="w-full pt-8 pb-3 px-4 bg-surface-container-low border-none rounded-xl font-bold focus:bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 transition-all" 
                  placeholder="What was this for?" 
                  type="text" 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            <button className="w-full py-5 rounded-full bg-gradient-to-br from-primary to-primary-dim text-on-primary font-bold text-lg shadow-xl shadow-primary/20 active:scale-95 transition-transform" type="submit">
              Save Transaction
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

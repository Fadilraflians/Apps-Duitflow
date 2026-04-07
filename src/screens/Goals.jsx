import React, { useContext, useState } from 'react';
import BottomNavBar from '../components/BottomNavBar';
import { GoalsContext } from '../context/GoalsContext';
import { AuthContext } from '../context/AuthContext';

export default function Goals() {
  const { goals, addGoal, addFundsToGoal } = useContext(GoalsContext);
  const { user } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const firstName = user?.full_name?.split(' ')?.[0] || user?.email?.split('@')?.[0] || 'Guest';
  
  // Add Funds Modal State
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [activeFundGoal, setActiveFundGoal] = useState(null);
  const [fundAmount, setFundAmount] = useState('');
  const [fundError, setFundError] = useState('');
  
  // Create Goal Modal State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [icon, setIcon] = useState('flag');
  const [isPriority, setIsPriority] = useState(false);

  const formatIDR = (value) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };
  const getSafeIcon = (iconName) => (/^[a-z_]+$/.test(iconName || '') ? iconName : 'flag');

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!title || !targetAmount) return;
    
    addGoal({
      title,
      description,
      target_amount: parseFloat(targetAmount),
      icon,
      is_priority: isPriority
    });
    
    setTitle('');
    setDescription('');
    setTargetAmount('');
    setIcon('flag');
    setIsPriority(false);
    setIsModalOpen(false);
  };

  const handleAddFundsSubmit = (e) => {
    e.preventDefault();
    if (!activeFundGoal) return;
    const parsedFundAmount = parseFloat(String(fundAmount).replace(/[^\d]/g, ''));
    if (!parsedFundAmount || isNaN(parsedFundAmount) || parsedFundAmount <= 0) {
      setFundError('Masukkan nominal yang valid');
      return;
    }
    setFundError('');
    addFundsToGoal(activeFundGoal.id, parsedFundAmount).then((result) => {
      if (result?.ok) {
        setIsFundModalOpen(false);
        setFundAmount('');
        setActiveFundGoal(null);
        return;
      }
      setFundError(result?.error || 'Gagal menambah dana');
    });
  };

  const openFundModal = (goal) => {
    setActiveFundGoal(goal);
    setFundAmount('');
    setFundError('');
    setIsFundModalOpen(true);
  };

  const priorityGoal = goals.find(g => g.is_priority);
  const secondaryGoals = goals.filter(g => !g.is_priority);

  return (
    <div className="bg-gradient-to-b from-[#f7faf8] via-white to-[#eef5f1] dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 selection:bg-primary-container selection:text-on-primary-container min-h-screen text-on-surface pb-32">
      {/* Top App Bar */}
      <header className="w-full top-0 sticky z-50 backdrop-blur bg-white/85 dark:bg-slate-950/85 border-b border-slate-200/60 dark:border-slate-800 flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center overflow-hidden">
            <span className="material-symbols-outlined text-emerald-700 dark:text-emerald-200">person</span>
          </div>
          <div>
            <span className="text-lg font-headline font-bold text-[#006a2d] dark:text-[#6bff8f] tracking-tight">{firstName}</span>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Goals</p>
          </div>
        </div>
        <button className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-200/50 rounded-full transition-transform active:scale-95">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>
      
      <main className="px-4 sm:px-6 pb-32 pt-3 sm:pt-4 max-w-2xl mx-auto">
        <div className="mb-6 sm:mb-8 mt-2 sm:mt-4 bg-white/90 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
          <span className="font-label text-[0.6875rem] font-bold uppercase tracking-widest text-primary mb-2 block">Goal Planner</span>
          <h1 className="font-headline text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface leading-tight">Bangun target finansialmu dengan lebih terarah.</h1>
          <p className="text-sm text-on-surface-variant mt-2">Pantau progres, prioritaskan mimpi, dan tambahkan dana kapan saja.</p>
        </div>

        {/* Priority Goal */}
        {priorityGoal && (
          <section className="mb-8 sm:mb-12 relative">
            <div className="bg-white/95 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-4 sm:p-8 shadow-[0_10px_28px_rgba(0,0,0,0.06)] relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-[#6bff8f] to-[#00dcfe] opacity-10 rounded-full blur-3xl"></div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-8 relative z-10">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-tertiary/10 text-tertiary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Active Priority</span>
                  </div>
                  <h2 className="font-headline text-xl sm:text-2xl font-bold text-on-surface mb-1">{priorityGoal.title}</h2>
                  <p className="font-body text-sm text-on-surface-variant mb-6">{priorityGoal.description}</p>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="font-label text-[10px] font-bold uppercase tracking-widest text-outline mb-1 block">Saved so far</span>
                        <span className="font-headline text-2xl sm:text-3xl font-extrabold text-primary">{formatIDR(priorityGoal.saved_amount)}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-label text-[10px] font-bold uppercase tracking-widest text-outline mb-1 block">Target</span>
                        <span className="font-headline text-base sm:text-lg font-bold text-on-surface">{formatIDR(priorityGoal.target_amount)}</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${Math.min((priorityGoal.saved_amount / priorityGoal.target_amount) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Circular Visualization */}
                <div className="flex flex-col items-center justify-center gap-4 self-center">
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle className="text-surface-container" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
                      <circle cx="64" cy="64" fill="transparent" r="58" stroke="url(#gradient)" 
                        strokeDasharray="364.4" 
                        strokeDashoffset={364.4 - (Math.min((priorityGoal.saved_amount / priorityGoal.target_amount), 1) * 364.4)} 
                        strokeLinecap="round" strokeWidth="8"></circle>
                      <defs>
                        <linearGradient id="gradient" x1="0%" x2="100%" y1="0%" y2="100%">
                          <stop offset="0%" stopColor="#006a2d"></stop>
                          <stop offset="100%" stopColor="#6bff8f"></stop>
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-headline text-lg sm:text-xl font-extrabold text-on-surface">{Math.round((priorityGoal.saved_amount / priorityGoal.target_amount) * 100)}%</span>
                      <span className="font-label text-[8px] font-bold uppercase tracking-tighter text-outline">Progress</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-surface-container flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary-container/20 flex items-center justify-center text-primary overflow-hidden">
                    <span className="material-symbols-outlined text-xl leading-none">{getSafeIcon(priorityGoal.icon)}</span>
                  </div>
                  <div>
                    <span className="font-label text-[10px] font-bold uppercase tracking-widest text-outline block">Active</span>
                    <span className="font-body text-sm font-bold text-on-surface">Saving Mode</span>
                  </div>
                </div>
                <button 
                  onClick={() => openFundModal(priorityGoal)}
                  className="bg-primary text-on-primary px-4 sm:px-6 py-2.5 rounded-full font-label text-[11px] sm:text-xs font-bold tracking-widest uppercase hover:bg-primary-dim transition-colors shadow-lg shadow-primary/20 whitespace-nowrap"
                >
                  Add Funds
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Other Goals Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline text-xl font-bold text-on-surface">Secondary Aspirations</h3>
            <span className="text-outline-variant font-label text-xs font-bold uppercase tracking-widest">{secondaryGoals.length} Goals</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {secondaryGoals.map(g => {
              const progressStr = `${Math.round((g.saved_amount / g.target_amount) * 100)}%`;
              return (
              <div key={g.id} className="bg-white/90 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-4 sm:p-5 hover:shadow-lg transition-all group relative">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-md bg-surface-container-lowest flex items-center justify-center shadow-sm overflow-hidden">
                    <span className="material-symbols-outlined text-tertiary text-[22px] leading-none">{getSafeIcon(g.icon)}</span>
                  </div>
                  <span className="font-headline text-sm font-bold text-primary">{progressStr}</span>
                </div>
                <h4 className="font-headline text-base sm:text-lg font-bold text-on-surface mb-1">{g.title}</h4>
                <p className="font-body text-xs text-on-surface-variant mb-4 min-h-[2.5rem]">{g.description}</p>
                
                <div className="flex justify-between items-end">
                  <div>
                    <span className="font-label text-[9px] font-bold uppercase tracking-widest text-outline block mb-0.5">Saved</span>
                    <span className="font-body text-sm font-bold text-on-surface">{formatIDR(g.saved_amount)}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-label text-[9px] font-bold uppercase tracking-widest text-outline block mb-0.5">Goal</span>
                    <span className="font-body text-sm font-bold text-on-surface-variant">{formatIDR(g.target_amount)}</span>
                  </div>
                </div>
                <div className="mt-4 h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary rounded-full" style={{ width: progressStr }}></div>
                </div>
                
                <button 
                  onClick={() => openFundModal(g)}
                  className="w-full mt-4 bg-tertiary/10 text-tertiary py-2.5 rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-widest hover:bg-tertiary/20 transition-colors"
                >
                  Add Funds
                </button>
              </div>
            )})}
          </div>

          <button onClick={() => setIsModalOpen(true)} className="w-full mt-5 sm:mt-6 py-5 sm:py-6 border-2 border-dashed border-outline-variant/30 bg-white/70 dark:bg-slate-900/40 rounded-2xl flex flex-col items-center justify-center group hover:border-primary/50 transition-all">
            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-outline group-hover:bg-primary-container group-hover:text-primary transition-colors mb-2">
              <span className="material-symbols-outlined">add</span>
            </div>
            <span className="font-label text-xs font-bold uppercase tracking-widest text-outline-variant group-hover:text-primary">Create New Aspiration</span>
          </button>
        </section>
      </main>

      <BottomNavBar />

      {/* Add Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold font-headline text-on-surface">New Goal</h2>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-variant transition-colors text-on-surface-variant">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-outline font-label mb-1 ml-1">Title</label>
                <input required value={title} onChange={e=>setTitle(e.target.value)} type="text" placeholder="e.g. New MacBook Pro" className="w-full bg-surface-container rounded-xl px-4 py-3 font-body text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-outline font-label mb-1 ml-1">Description (Optional)</label>
                <input value={description} onChange={e=>setDescription(e.target.value)} type="text" placeholder="e.g. M3 Max Setup" className="w-full bg-surface-container rounded-xl px-4 py-3 font-body text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-outline font-label mb-1 ml-1">Target Amount (Rp)</label>
                <input required value={targetAmount} onChange={e=>setTargetAmount(e.target.value)} type="number" placeholder="25000000" className="w-full bg-surface-container rounded-xl px-4 py-3 font-body text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-outline font-label mb-1 ml-1">Icon Name</label>
                  <input value={icon} onChange={e=>setIcon(e.target.value)} type="text" placeholder="flight, directions_car..." className="w-full bg-surface-container rounded-xl px-4 py-3 font-body text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="flex items-center gap-2 mt-5">
                  <input type="checkbox" id="priority" checked={isPriority} onChange={e=>setIsPriority(e.target.checked)} className="w-5 h-5 rounded-md border-none bg-surface-container text-primary focus:ring-primary/20" />
                  <label htmlFor="priority" className="text-sm font-bold text-on-surface-variant font-label">Set Priority</label>
                </div>
              </div>
              
              <button type="submit" className="w-full mt-4 py-4 bg-primary text-on-primary rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[0.98] transition-transform active:scale-95">
                Save Goal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Funds Modal */}
      {isFundModalOpen && activeFundGoal && (
        <div className="fixed inset-0 z-[100] overflow-x-hidden flex items-end sm:items-center justify-center px-3 sm:px-4 pb-3 sm:pb-0 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[1.6rem] sm:rounded-[2rem] p-5 sm:p-8 shadow-2xl relative isolate animate-in fade-in slide-in-from-bottom-4 duration-300 max-h-[88vh] overflow-y-auto overflow-x-hidden">
            <div className="absolute -top-8 -right-8 w-28 h-28 bg-primary-container/20 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center shadow-inner overflow-hidden">
                   <span className="material-symbols-outlined text-primary text-2xl leading-none">
                    {getSafeIcon(activeFundGoal.icon)}
                   </span>
                </div>
                <div className="min-w-0">
                   <h2 className="text-lg font-bold font-headline text-on-surface leading-tight">Add Funds</h2>
                   <p className="text-xs font-label text-outline truncate">{activeFundGoal.title}</p>
                </div>
              </div>
              <button onClick={() => setIsFundModalOpen(false)} className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-variant transition-colors text-on-surface-variant">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleAddFundsSubmit} className="space-y-5 sm:space-y-6">
              <div>
                <label className="block text-center text-[11px] sm:text-xs font-bold uppercase tracking-widest text-outline font-label mb-3 sm:mb-4">Amount to add (Rp)</label>
                <input 
                  autoFocus
                  required 
                  value={fundAmount} 
                  onChange={e=>setFundAmount(e.target.value.replace(/[^\d]/g, ''))} 
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="0" 
                  className="w-full bg-transparent border-b-2 border-surface-container-high focus:border-primary text-center text-4xl sm:text-5xl font-extrabold text-on-surface font-headline focus:outline-none py-2 transition-colors placeholder:text-surface-container-highest" 
                />
                {fundError && (
                  <p className="mt-2 text-center text-xs font-semibold text-rose-600 dark:text-rose-400">
                    {fundError}
                  </p>
                )}
              </div>
              
              <div className="flex gap-2 justify-center pb-2 sm:pb-4 flex-wrap">
                {[100000, 500000, 1000000].map(amt => (
                  <button 
                    key={amt} 
                    type="button" 
                    onClick={() => setFundAmount(amt.toString())}
                    className="px-3 py-1.5 bg-surface-container-low hover:bg-primary-container/50 text-on-surface-variant text-xs font-bold rounded-lg transition-colors border border-surface-container"
                  >
                    +{amt/1000}k
                  </button>
                ))}
              </div>

              <button type="submit" className="w-full py-4 bg-gradient-to-r from-primary to-primary-dim text-on-primary rounded-xl font-bold shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:scale-[0.98] transition-all active:scale-95 flex items-center justify-center gap-2 text-base sm:text-lg">
                <span className="material-symbols-outlined text-xl">savings</span>
                Confirm Deposit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

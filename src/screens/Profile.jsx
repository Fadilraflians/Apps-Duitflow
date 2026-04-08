import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/BottomNavBar';
import { AuthContext } from '../context/AuthContext';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = React.useContext(AuthContext);
  const displayName =
    user?.full_name?.trim() ||
    user?.fullName?.trim() ||
    user?.name?.trim() ||
    user?.username?.trim() ||
    user?.email?.split('@')?.[0] ||
    'Guest User';
  const firstName = displayName.split(' ')[0];
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="bg-gradient-to-b from-[#f7faf8] via-white to-[#f2f6f3] text-on-surface min-h-screen pb-32 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      {/* TopAppBar */}
      <header className="w-full top-0 sticky z-50 backdrop-blur bg-white/85 dark:bg-slate-950/80 border-b border-slate-200/60 dark:border-slate-800 flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 flex items-center justify-center font-bold text-sm">
            {initials || 'GU'}
          </div>
          <div>
            <span className="text-lg font-bold text-[#006a2d] dark:text-[#6bff8f] tracking-tight">{firstName}</span>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Profile</p>
          </div>
        </div>
        <button className="material-symbols-outlined p-2 hover:bg-slate-200/70 dark:hover:bg-slate-800/60 rounded-full text-slate-500 transition-transform active:scale-95">
          notifications
        </button>
      </header>

      <main className="px-6 max-w-2xl mx-auto">
        {/* Profile Header Section */}
        <section className="mt-8 mb-10 flex flex-col items-start bg-white/90 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-sm bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 flex items-center justify-center text-3xl font-extrabold">
              {initials || 'GU'}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-primary text-on-primary p-1.5 rounded-md shadow-lg border-4 border-surface">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-1">{displayName}</h1>
          <p className="text-label-sm font-label uppercase tracking-widest text-outline text-xs">{user?.email || 'No email connected yet'}</p>
        </section>

        {/* Subscription Card  */}
        <section className="mb-8 group transform hover:scale-[1.01] transition-all duration-300">
          <div className="bg-gradient-to-br from-[#0c5931] via-[#0b8f4a] to-[#0fd26c] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between h-auto min-h-[11rem] shadow-[0_16px_40px_rgba(11,143,74,0.3)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
            {/* Decorative Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-white/20 transition-all duration-700 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 w-full h-full bg-emerald-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

            <div className="relative z-10 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur shadow-inner border border-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                    <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                  </div>
                  <h2 className="text-2xl font-extrabold font-headline drop-shadow-md tracking-tight">{firstName}&apos;s Premium</h2>
                </div>
                <p className="text-emerald-50 dark:text-slate-300 text-sm max-w-[260px] opacity-90 drop-shadow-sm mb-4">Keep your money goals on track with smarter insights and cleaner reports.</p>
              </div>
            </div>
            
            <div className="relative z-10 flex justify-between items-center mt-2 border-t border-white/15 pt-5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/10 backdrop-blur shadow-sm border border-white/10 text-white px-3 py-1.5 rounded-full flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse"></span> Active Plan</span>
              <button className="bg-white text-emerald-800 dark:bg-emerald-400 dark:text-slate-900 px-5 py-2.5 rounded-full text-[10px] sm:text-xs font-extrabold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-1.5">Manage <span className="material-symbols-outlined text-xs">arrow_forward</span></button>
            </div>
          </div>
        </section>

        {/* Bento Grid Settings Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Account Settings */}
          <section className="bg-white/90 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-outline">Account Settings</h3>
            <div className="space-y-1">
              <button className="w-full flex items-center justify-between p-3 bg-slate-50/90 dark:bg-slate-950/60 rounded-lg group hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">person_outline</span>
                  <span className="font-medium text-sm">Personal Info</span>
                </div>
                <span className="material-symbols-outlined text-outline text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-slate-50/90 dark:bg-slate-950/60 rounded-lg group hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">payments</span>
                  <span className="font-medium text-sm">Linked Banks</span>
                </div>
                <span className="material-symbols-outlined text-outline text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-slate-50/90 dark:bg-slate-950/60 rounded-lg group hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">notifications_active</span>
                  <span className="font-medium text-sm">Notifications</span>
                </div>
                <span className="material-symbols-outlined text-outline text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>
            </div>
          </section>

          {/* Security Section */}
          <section className="bg-white/90 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-outline">Security</h3>
            <div className="space-y-1">
              <button className="w-full flex items-center justify-between p-3 bg-slate-50/90 dark:bg-slate-950/60 rounded-lg group hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-tertiary text-xl">fingerprint</span>
                  <span className="font-medium text-sm">Biometric Login</span>
                </div>
                <div className="w-8 h-4 bg-primary-container rounded-full relative">
                  <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-primary rounded-full"></div>
                </div>
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-slate-50/90 dark:bg-slate-950/60 rounded-lg group hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-tertiary text-xl">shield_lock</span>
                  <span className="font-medium text-sm">2FA Security</span>
                </div>
                <span className="material-symbols-outlined text-outline text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-slate-50/90 dark:bg-slate-950/60 rounded-lg group hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-tertiary text-xl">devices</span>
                  <span className="font-medium text-sm">Device History</span>
                </div>
                <span className="material-symbols-outlined text-outline text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>
            </div>
          </section>

          {/* Help & Support */}
          <section className="bg-white/90 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 p-6 rounded-2xl space-y-4 md:col-span-2 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-outline">Help &amp; Support</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <button className="w-full flex items-center gap-4 p-4 bg-slate-50/90 dark:bg-slate-950/60 rounded-lg group hover:bg-primary/5 transition-colors text-left">
                <div className="w-10 h-10 rounded-md bg-secondary-container/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary">help_center</span>
                </div>
                <div>
                  <p className="font-bold text-sm">Help Center</p>
                  <p className="text-xs text-outline">FAQs and Documentation</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-4 p-4 bg-slate-50/90 dark:bg-slate-950/60 rounded-lg group hover:bg-primary/5 transition-colors text-left">
                <div className="w-10 h-10 rounded-md bg-tertiary-container/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary">chat_bubble</span>
                </div>
                <div>
                  <p className="font-bold text-sm">Live Support</p>
                  <p className="text-xs text-outline">Chat with our experts</p>
                </div>
              </button>
            </div>
          </section>
        </div>

        {/* Logout Action */}
        <button onClick={handleLogout} className="mt-8 mb-12 w-full p-4 rounded-full bg-white/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-error font-bold flex items-center justify-center gap-2 hover:bg-error/10 transition-colors">
          <span className="material-symbols-outlined">logout</span>
          Sign Out
        </button>
      </main>

      <BottomNavBar />
    </div>
  );
}

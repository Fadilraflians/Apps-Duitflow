import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNavBar() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="fixed bottom-3 left-1/2 z-50 flex w-[min(760px,calc(100%-16px))] -translate-x-1/2 items-center justify-around rounded-[1.6rem] border border-emerald-100/10 bg-[#10191d]/95 px-1.5 pb-[calc(env(safe-area-inset-bottom)+0.65rem)] pt-2 shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:bottom-5 sm:px-5">
      {/* Home */}
      <Link to="/home" className={`flex min-w-[44px] flex-col items-center justify-center rounded-2xl p-1.5 transition-all duration-200 sm:min-w-[58px] sm:p-2 ${path === '/home' || path === '/' ? 'bg-emerald-400/10 text-emerald-300' : 'text-slate-400 hover:text-slate-100'}`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: path === '/home' || path === '/' ? "'FILL' 1" : "" }}>home</span>
        <span className="mt-1 font-['Manrope'] text-[8px] font-bold uppercase tracking-wide sm:text-[10px] sm:tracking-widest">Home</span>
      </Link>
      
      {/* Analytics */}
      <Link to="/analytics" className={`flex min-w-[44px] flex-col items-center justify-center rounded-2xl p-1.5 transition-all duration-200 sm:min-w-[58px] sm:p-2 ${path === '/analytics' ? 'bg-emerald-400/10 text-emerald-300' : 'text-slate-400 hover:text-slate-100'}`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: path === '/analytics' ? "'FILL' 1" : "" }}>insights</span>
        <span className="mt-1 font-['Manrope'] text-[8px] font-bold uppercase tracking-wide sm:text-[10px] sm:tracking-widest">Analytics</span>
      </Link>
      
      {/* Add FAB */}
      <Link to="/add" className="flex flex-col items-center justify-center p-1.5 text-slate-400 transition hover:text-emerald-200 sm:p-2">
        <div className="-mt-7 mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-300 to-emerald-500 text-slate-950 shadow-[0_8px_28px_rgba(71,214,148,0.28)] sm:h-14 sm:w-14">
          <span className="material-symbols-outlined text-3xl">add</span>
        </div>
        <span className="font-['Manrope'] text-[8px] font-bold uppercase tracking-wide sm:text-[10px] sm:tracking-widest">Add</span>
      </Link>

      <Link to="/monthly-summary" className={`flex min-w-[44px] flex-col items-center justify-center rounded-2xl p-1.5 transition-all duration-200 sm:min-w-[58px] sm:p-2 ${path === '/monthly-summary' ? 'bg-emerald-400/10 text-emerald-300' : 'text-slate-400 hover:text-slate-100'}`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: path === '/monthly-summary' ? "'FILL' 1" : '' }}>calendar_month</span>
        <span className="mt-1 font-['Manrope'] text-[8px] font-bold uppercase tracking-wide sm:text-[10px] sm:tracking-widest">Bulanan</span>
      </Link>
      
      {/* Goals */}
      <Link to="/goals" className={`flex min-w-[44px] flex-col items-center justify-center rounded-2xl p-1.5 transition-all duration-200 sm:min-w-[58px] sm:p-2 ${path === '/goals' ? 'bg-emerald-400/10 text-emerald-300' : 'text-slate-400 hover:text-slate-100'}`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: path === '/goals' ? "'FILL' 1" : "" }}>track_changes</span>
        <span className="mt-1 font-['Manrope'] text-[8px] font-bold uppercase tracking-wide sm:text-[10px] sm:tracking-widest">Goals</span>
      </Link>
      
      {/* Profile */}
      <Link to="/profile" className={`flex min-w-[44px] flex-col items-center justify-center rounded-2xl p-1.5 transition-all duration-200 sm:min-w-[58px] sm:p-2 ${path === '/profile' ? 'bg-emerald-400/10 text-emerald-300' : 'text-slate-400 hover:text-slate-100'}`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: path === '/profile' ? "'FILL' 1" : "" }}>person</span>
        <span className="mt-1 font-['Manrope'] text-[8px] font-bold uppercase tracking-wide sm:text-[10px] sm:tracking-widest">Profile</span>
      </Link>
    </nav>
  );
}

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNavBar() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-[0_-8px_24px_rgba(0,0,0,0.06)] rounded-t-[1.5rem]">
      {/* Home */}
      <Link to="/home" className={`flex flex-col items-center justify-center p-2 transition-all duration-200 ${path === '/home' || path === '/' ? 'bg-[#6bff8f] dark:bg-[#006a2d] text-[#006a2d] dark:text-[#6bff8f] rounded-full min-w-[64px] scale-90' : 'text-slate-400 dark:text-slate-500 hover:opacity-80'}`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: path === '/home' || path === '/' ? "'FILL' 1" : "" }}>home</span>
        <span className="font-['Manrope'] text-[10px] font-bold uppercase tracking-widest mt-1">Home</span>
      </Link>
      
      {/* Analytics */}
      <Link to="/analytics" className={`flex flex-col items-center justify-center p-2 transition-all duration-200 ${path === '/analytics' ? 'bg-[#6bff8f] dark:bg-[#006a2d] text-[#006a2d] dark:text-[#6bff8f] rounded-full min-w-[64px] scale-90' : 'text-slate-400 dark:text-slate-500 hover:opacity-80'}`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: path === '/analytics' ? "'FILL' 1" : "" }}>insights</span>
        <span className="font-['Manrope'] text-[10px] font-bold uppercase tracking-widest mt-1">Analytics</span>
      </Link>
      
      {/* Add FAB */}
      <Link to="/add" className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-2 hover:opacity-80">
        <div className="bg-primary w-14 h-14 rounded-full flex items-center justify-center text-on-primary shadow-lg -mt-8 mb-1">
          <span className="material-symbols-outlined text-3xl">add</span>
        </div>
        <span className="font-['Manrope'] text-[10px] font-bold uppercase tracking-widest">Add</span>
      </Link>
      
      {/* Goals */}
      <Link to="/goals" className={`flex flex-col items-center justify-center p-2 transition-all duration-200 ${path === '/goals' ? 'bg-[#6bff8f] dark:bg-[#006a2d] text-[#006a2d] dark:text-[#6bff8f] rounded-full min-w-[64px] scale-90' : 'text-slate-400 dark:text-slate-500 hover:opacity-80'}`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: path === '/goals' ? "'FILL' 1" : "" }}>track_changes</span>
        <span className="font-['Manrope'] text-[10px] font-bold uppercase tracking-widest mt-1">Goals</span>
      </Link>
      
      {/* Profile */}
      <Link to="/profile" className={`flex flex-col items-center justify-center p-2 transition-all duration-200 ${path === '/profile' ? 'bg-[#6bff8f] dark:bg-[#006a2d] text-[#006a2d] dark:text-[#6bff8f] rounded-full min-w-[64px] scale-90' : 'text-slate-400 dark:text-slate-500 hover:opacity-80'}`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: path === '/profile' ? "'FILL' 1" : "" }}>person</span>
        <span className="font-['Manrope'] text-[10px] font-bold uppercase tracking-widest mt-1">Profile</span>
      </Link>
    </nav>
  );
}

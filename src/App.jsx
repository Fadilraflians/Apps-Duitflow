import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Onboarding from './screens/Onboarding';
import HomeDashboard from './screens/HomeDashboard';
import Analytics from './screens/Analytics';
import AddTransaction from './screens/AddTransaction';
import Goals from './screens/Goals';
import Profile from './screens/Profile';
import Login from './screens/Login';
import Register from './screens/Register';
import Transactions from './screens/Transactions';
import MoneyDetails from './screens/MoneyDetails';
import CashflowDetails from './screens/CashflowDetails';
import { useTheme } from './context/ThemeContext';

function App() {
  const { theme, toggleTheme } = useTheme();
  return (
    <>
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Aktifkan tema ${theme === 'dark' ? 'terang' : 'gelap'}`}
      title={`Tema ${theme === 'dark' ? 'terang' : 'gelap'}`}
      className="fixed right-4 top-4 z-[100] flex h-11 items-center gap-2 rounded-full border border-slate-200/70 bg-white/90 px-4 text-sm font-bold text-slate-700 shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-xl dark:border-white/10 dark:bg-[#152126]/90 dark:text-slate-100 sm:right-6 sm:top-5"
    >
      <span className="material-symbols-outlined text-lg">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
      <span>{theme === 'dark' ? 'Terang' : 'Gelap'}</span>
    </button>
    <Routes>
      <Route path="/" element={<Onboarding />} />
      <Route path="/home" element={<HomeDashboard />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/add" element={<AddTransaction />} />
      <Route path="/goals" element={<Goals />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/money-details" element={<MoneyDetails />} />
      <Route path="/cashflow-details/:type" element={<CashflowDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
    </>
  );
}

export default App;

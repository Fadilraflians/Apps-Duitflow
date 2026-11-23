import { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { firstNameOf, initialsOf } from '../utils/format';
import { Icon, Logo } from './ui';

const NAV = [
  { to: '/home', label: 'Beranda', icon: 'home' },
  { to: '/transactions', label: 'Transaksi', icon: 'receipt_long' },
  { to: '/analytics', label: 'Analitik', icon: 'insights' },
  { to: '/goals', label: 'Tujuan', icon: 'flag' },
];
const MORE = [
  { to: '/monthly-summary', label: 'Ringkasan bulanan', icon: 'calendar_month' },
  { to: '/money-details', label: 'Akun & saldo', icon: 'account_balance_wallet' },
  { to: '/profile', label: 'Profil & pengaturan', icon: 'person' },
];

export function ThemeButton({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <button type="button" onClick={toggleTheme} className={`icon-btn ${className}`}
      aria-label={`Ganti ke tema ${theme === 'dark' ? 'terang' : 'gelap'}`} title={`Tema ${theme === 'dark' ? 'terang' : 'gelap'}`}>
      <Icon name={theme === 'dark' ? 'light_mode' : 'dark_mode'} />
    </button>
  );
}

function Avatar({ user, className = '' }) {
  return (
    <span className={`flex items-center justify-center rounded-full bg-gold/15 font-semibold text-gold ring-1 ring-gold/25 ${className}`}>
      {initialsOf(user)}
    </span>
  );
}

function Sidebar() {
  const { user } = useContext(AuthContext);
  const item = ({ isActive }) =>
    `group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[14px] font-medium transition ${
      isActive ? 'bg-surface-2 text-ink' : 'text-ink-2 hover:bg-surface-2/60 hover:text-ink'
    }`;
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-surface/80 px-4 py-6 backdrop-blur-xl lg:flex">
      <Link to="/home" className="px-2"><Logo /></Link>

      <Link to="/add" className="btn-gold mt-8 w-full">
        <Icon name="add" /> Catat transaksi
      </Link>

      <nav className="mt-6 space-y-1" aria-label="Navigasi utama">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} className={item}>
            {({ isActive }) => (<><Icon name={n.icon} fill={isActive} className={isActive ? 'text-gold' : ''} />{n.label}</>)}
          </NavLink>
        ))}
      </nav>
      <p className="eyebrow mb-2 mt-7 px-3.5">Lainnya</p>
      <nav className="space-y-1">
        {MORE.map((n) => (
          <NavLink key={n.to} to={n.to} className={item}>
            {({ isActive }) => (<><Icon name={n.icon} fill={isActive} className={isActive ? 'text-gold' : ''} />{n.label}</>)}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex items-center gap-3 rounded-2xl border border-line p-3">
        <Avatar user={user} className="h-9 w-9 text-xs" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{user?.full_name || firstNameOf(user)}</p>
          <p className="truncate text-xs text-ink-3">{user?.email || 'Belum masuk'}</p>
        </div>
        <ThemeButton className="h-8 w-8" />
      </div>
    </aside>
  );
}

function BottomNav() {
  const tab = (n) => (
    <NavLink key={n.to} to={n.to}
      className={({ isActive }) => `flex flex-1 flex-col items-center gap-1 py-1.5 text-[10.5px] font-semibold transition ${isActive ? 'text-ink' : 'text-ink-3'}`}>
      {({ isActive }) => (
        <>
          <span className={`flex h-8 w-12 items-center justify-center rounded-full transition ${isActive ? 'bg-gold/15 text-gold' : ''}`}>
            <Icon name={n.icon} fill={isActive} className="text-[22px]" />
          </span>
          {n.label}
        </>
      )}
    </NavLink>
  );
  return (
    <nav aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-lg items-end px-2 pt-1.5 pb-1.5">
        {NAV.slice(0, 2).map(tab)}
        <div className="flex flex-1 justify-center">
          <Link to="/add" aria-label="Catat transaksi"
            className="-mt-7 flex h-14 w-14 items-center justify-center rounded-[20px] bg-gold text-[#14110a] shadow-[0_12px_30px_-8px_rgb(var(--c-gold)/0.7)] ring-4 ring-bg transition active:scale-95">
            <Icon name="add" className="text-[28px]" />
          </Link>
        </div>
        {NAV.slice(2).map(tab)}
      </div>
    </nav>
  );
}

/**
 * Page frame used by every signed-in screen.
 * - `title` shows as the page heading; `back` swaps the avatar for a back button on mobile.
 */
export default function AppShell({ title, subtitle, back = false, actions, children, wide = false }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] lg:pl-64">
      <Sidebar />

      <header className="sticky top-0 z-30 border-b border-transparent bg-bg/80 backdrop-blur-xl">
        <div className={`mx-auto flex h-16 items-center gap-3 px-4 sm:px-6 ${wide ? 'max-w-6xl' : 'max-w-4xl'}`}>
          {back ? (
            <button type="button" onClick={() => navigate(-1)} className="icon-btn -ml-2" aria-label="Kembali">
              <Icon name="arrow_back" />
            </button>
          ) : (
            <Link to="/home" className="lg:hidden"><Logo /></Link>
          )}
          {back && <p className="truncate text-[15px] font-semibold text-ink lg:hidden">{title}</p>}
          <div className="ml-auto flex items-center gap-1">
            {actions}
            <ThemeButton className="lg:hidden" />
            <Link to="/profile" aria-label="Profil" className="ml-1 lg:hidden">
              <Avatar user={user} className="h-9 w-9 text-xs" />
            </Link>
          </div>
        </div>
      </header>

      <main className={`mx-auto px-4 pb-32 sm:px-6 lg:pb-16 ${wide ? 'max-w-6xl' : 'max-w-4xl'}`}>
        {title && (
          <div className={`mb-6 mt-2 animate-fade-up ${back ? 'hidden lg:block' : ''}`}>
            <h1 className="font-display text-[34px] leading-none tracking-tight text-ink sm:text-[40px]">{title}</h1>
            {subtitle && <p className="mt-2 text-[14px] text-ink-2">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>

      <BottomNav />
    </div>
  );
}

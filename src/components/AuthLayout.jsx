import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeButton } from './AppShell';
import { Icon, Logo } from './ui';

export function PasswordField({ value, onChange, autoComplete = 'current-password', placeholder = '••••••••' }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Icon name="lock" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-ink-3" />
      <input className="field pl-11 pr-12" type={show ? 'text' : 'password'} required minLength={1}
        value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} />
      <button type="button" onClick={() => setShow((s) => !s)} className="icon-btn absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2"
        aria-label={show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>
        <Icon name={show ? 'visibility_off' : 'visibility'} className="text-[20px]" />
      </button>
    </div>
  );
}

export function IconField({ icon, ...props }) {
  return (
    <div className="relative">
      <Icon name={icon} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-ink-3" />
      <input className="field pl-11" {...props} />
    </div>
  );
}

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-2">
      {/* Brand panel (desktop) */}
      <aside className="lux-card m-3 hidden !rounded-[32px] p-12 lg:flex lg:flex-col">
        <div className="relative z-10 flex h-full flex-col">
          <Link to="/"><Logo size="lg" onDark /></Link>
          <div className="mt-auto max-w-md">
            <p className="font-display text-[52px] leading-[1.05]">
              Uangmu, <em className="text-[#D6B97B]">tertata</em> dengan tenang.
            </p>
            <p className="mt-5 text-[15px] leading-relaxed text-[#F2EFE8]/60">
              Catat pemasukan dan pengeluaran, pantau semua akun, dan capai tujuan finansial — dalam satu aplikasi yang sederhana.
            </p>
            <ul className="mt-10 space-y-3 text-[14px] text-[#F2EFE8]/75">
              {['Catat transaksi dalam hitungan detik', 'Semua akun & saldo dalam satu tampilan', 'Tujuan tabungan dengan progres jelas'].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D6B97B]/15 text-[#D6B97B]"><Icon name="check" className="text-[16px]" /></span>{t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      {/* Form */}
      <div className="flex flex-col px-5 py-5 sm:px-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="lg:invisible"><Logo /></Link>
          <ThemeButton />
        </div>
        <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10 animate-fade-up">
          <h1 className="font-display text-[40px] leading-none tracking-tight text-ink">{title}</h1>
          <p className="mt-3 text-[15px] text-ink-2">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-center text-[14px] text-ink-2">{footer}</div>}
        </main>
      </div>
    </div>
  );
}

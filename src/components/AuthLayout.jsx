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

/** Gold line-art piggy bank with a coin dropping in — decorative only. */
function PiggyIllustration() {
  return (
    <div className="relative aspect-[4/3] h-full max-h-[320px] w-auto max-w-full" aria-hidden="true">
      {/* soft glow behind */}
      <div className="absolute inset-[12%] rounded-full bg-[#D6B97B]/10 blur-3xl" />

      <svg viewBox="0 0 320 240" className="relative h-full w-full overflow-visible" fill="none">
        <defs>
          <linearGradient id="pig-body" x1="60" y1="80" x2="250" y2="220" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D6B97B" stopOpacity=".22" />
            <stop offset="1" stopColor="#D6B97B" stopOpacity=".04" />
          </linearGradient>
          <radialGradient id="coin" cx="0.35" cy="0.3" r="0.8">
            <stop stopColor="#F3DFAE" />
            <stop offset=".6" stopColor="#D6B97B" />
            <stop offset="1" stopColor="#9A783A" />
          </radialGradient>
        </defs>

        {/* ground shadow */}
        <ellipse cx="155" cy="222" rx="96" ry="7" fill="#000" opacity=".35" />

        {/* coin stack */}
        <g stroke="#D6B97B" strokeWidth="1.5">
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(0 ${-i * 9})`}>
              <path d="M30 214v6c0 4 10 7 22 7s22-3 22-7v-6" fill="#9A783A" fillOpacity=".55" />
              <ellipse cx="52" cy="214" rx="22" ry="7" fill="url(#coin)" />
            </g>
          ))}
        </g>

        <g stroke="#D6B97B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* legs */}
          <rect x="102" y="196" width="22" height="26" rx="8" fill="#14201b" />
          <rect x="180" y="196" width="22" height="26" rx="8" fill="#14201b" />
          {/* tail */}
          <path d="M66 146c-12-2-16 10-7 12 8 2 6-11-4-9" />
          {/* body */}
          <ellipse cx="152" cy="150" rx="88" ry="62" fill="#101a17" />
          <ellipse cx="152" cy="150" rx="88" ry="62" fill="url(#pig-body)" />
          {/* ear */}
          <path d="M196 96l12-28c2-4 7-4 9 0l8 30" fill="#14201b" />
          {/* snout */}
          <rect x="230" y="128" width="30" height="36" rx="13" fill="#14201b" />
          <circle cx="241" cy="146" r="2.6" fill="#D6B97B" stroke="none" />
          <circle cx="250" cy="146" r="2.6" fill="#D6B97B" stroke="none" />
          {/* eye */}
          <circle cx="212" cy="124" r="3.4" fill="#F2EFE8" stroke="none" />
          {/* belly highlight */}
          <path d="M96 128c8-20 30-32 56-34" opacity=".55" />
          {/* coin slot */}
          <rect x="128" y="88" width="48" height="8" rx="4" fill="#0a0f0e" />
        </g>

        {/* coin dropping into slot */}
        <g className="animate-coin-drop">
          <circle cx="152" cy="46" r="22" fill="url(#coin)" stroke="#F3DFAE" strokeWidth="1.5" />
          <circle cx="152" cy="46" r="15" stroke="#9A783A" strokeWidth="1.5" opacity=".7" />
          <text x="152" y="51" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="13" fontWeight="700" fill="#5c4720">Rp</text>
        </g>

        {/* sparkles */}
        <g fill="#D6B97B">
          <path className="animate-twinkle" d="M268 70l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" />
          <path className="animate-twinkle [animation-delay:1.2s]" d="M84 74l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
          <path className="animate-twinkle [animation-delay:.6s]" d="M290 186l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" />
        </g>
      </svg>

      {/* floating glass chips */}
      <div className="absolute -left-4 top-[18%] animate-float rounded-2xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 backdrop-blur-md">
        <p className="text-[10px] uppercase tracking-[0.14em] text-[#F2EFE8]/50">Tabungan</p>
        <p className="num text-[14px] font-semibold text-[#7FE0B4]">+12% bulan ini</p>
      </div>
      <div className="absolute -right-6 bottom-[16%] animate-float rounded-2xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 backdrop-blur-md [animation-delay:1.5s]">
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[#F2EFE8]">
          <Icon name="flag" fill className="text-[16px] text-[#D6B97B]" />Tujuan tercapai
        </p>
      </div>
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
          <div className="flex min-h-0 flex-1 items-center justify-center py-6">
            <PiggyIllustration />
          </div>
          <div className="max-w-md">
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

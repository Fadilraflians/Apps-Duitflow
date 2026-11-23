import { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ThemeButton } from '../components/AppShell';
import { Icon, Logo } from '../components/ui';
import { AuthContext } from '../context/AuthContext';

const FEATURES = [
  { icon: 'bolt', title: 'Catat dalam detik', text: 'Jumlah, kategori, akun — selesai. Tanpa formulir panjang.' },
  { icon: 'account_balance_wallet', title: 'Semua akun, satu tempat', text: 'Bank, tunai, dan dompet digital dengan saldo yang selalu sesuai.' },
  { icon: 'insights', title: 'Insight yang jelas', text: 'Lihat ke mana uangmu pergi dan pos mana yang bisa dihemat.' },
  { icon: 'flag', title: 'Tujuan yang tercapai', text: 'Tabung untuk rencana besar dan pantau progresnya.' },
];

function PreviewCard() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute -inset-10 rounded-full bg-gold/10 blur-3xl" />
      <div className="lux-card relative p-7">
        <div className="relative z-10">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#F2EFE8]/55">Total saldo</p>
          <p className="num mt-2 text-4xl font-semibold">Rp 24.850.000</p>
          <div className="mt-6 flex h-24 items-end gap-2">
            {[38, 62, 45, 80, 52, 30, 70].map((h, i) => (
              <span key={i} className={`flex-1 rounded-t-[4px] ${i === 6 ? 'bg-[#D6B97B]' : 'bg-white/15'}`} style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="mt-6 space-y-3">
            {[
              { i: 'restaurant', t: 'Makan siang', a: '−Rp 45.000' },
              { i: 'south_west', t: 'Gaji bulanan', a: '+Rp 8.500.000', pos: true },
            ].map((r) => (
              <div key={r.t} className="flex items-center gap-3 rounded-2xl bg-white/[0.05] p-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.08]"><Icon name={r.i} className="text-[18px]" /></span>
                <span className="flex-1 text-[13px]">{r.t}</span>
                <span className={`num text-[13px] font-semibold ${r.pos ? 'text-[#7FE0B4]' : ''}`}>{r.a}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] text-ink-3">Contoh tampilan</p>
    </div>
  );
}

export default function Onboarding() {
  const { user } = useContext(AuthContext);
  if (user) return <Navigate to="/home" replace />;

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-6xl flex-col px-5 sm:px-8">
      <header className="flex items-center justify-between py-6">
        <Logo />
        <div className="flex items-center gap-1">
          <ThemeButton />
          <Link to="/login" className="btn-quiet">Masuk</Link>
        </div>
      </header>

      <section className="grid flex-1 items-center gap-14 py-10 lg:grid-cols-2 lg:py-16">
        <div className="animate-fade-up">
          <span className="chip border border-gold/30 bg-gold/10 text-gold"><Icon name="auto_awesome" className="text-[14px]" />Keuangan pribadi, disederhanakan</span>
          <h1 className="mt-6 font-display text-[52px] leading-[1.02] tracking-tight text-ink sm:text-[72px]">
            Kelola uang dengan <em className="text-gold">tenang.</em>
          </h1>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-ink-2">
            DuitFlow membantu kamu mencatat setiap rupiah, memahami kebiasaan belanja, dan mencapai tujuan finansial — tanpa ribet.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to="/register" className="btn-primary px-7 py-4 text-[15px]">Mulai gratis<Icon name="arrow_forward" className="text-[18px]" /></Link>
            <Link to="/login" className="btn-ghost px-7 py-4 text-[15px]">Saya sudah punya akun</Link>
          </div>
        </div>
        <div className="animate-fade-up [animation-delay:120ms]"><PreviewCard /></div>
      </section>

      <section className="grid gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="card p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold"><Icon name={f.icon} /></span>
            <p className="mt-4 text-[15px] font-semibold text-ink">{f.title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-3">{f.text}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-line py-6 text-center text-[12px] text-ink-3">
        © {new Date().getFullYear()} DuitFlow · Dibuat untuk ketenangan finansialmu
      </footer>
    </div>
  );
}

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { accountLabel, categoryMeta, formatDate, formatIDR } from '../utils/format';

export function Icon({ name, fill = false, className = '' }) {
  return <span aria-hidden="true" className={`icon ${fill ? 'icon-fill' : ''} ${className}`}>{name}</span>;
}

export function Logo({ size = 'md', onDark = false }) {
  const box = size === 'lg' ? 'h-11 w-11 rounded-2xl' : 'h-9 w-9 rounded-xl';
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className={`${box} lux-card flex items-center justify-center !shadow-none`}>
        <svg viewBox="0 0 24 24" className="relative z-10 h-1/2 w-1/2" fill="none" stroke="#D6B97B" strokeWidth="2.2" strokeLinecap="round">
          <path d="M4 15c3-6 6 2 9-3s4-5 7-4" />
          <path d="M4 20h16" opacity=".45" />
        </svg>
      </span>
      <span className={`font-semibold tracking-tight ${onDark ? 'text-[#F2EFE8]' : 'text-ink'} ${size === 'lg' ? 'text-xl' : 'text-[17px]'}`}>
        Duit<span className={onDark ? 'text-[#D6B97B]' : 'text-gold'}>Flow</span>
      </span>
    </span>
  );
}

export function Card({ as: Tag = 'section', className = '', children, ...props }) {
  return <Tag className={`card ${className}`} {...props}>{children}</Tag>;
}

export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-[17px] font-semibold tracking-tight text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[13px] text-ink-3">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Segmented({ options, value, onChange, className = '' }) {
  return (
    <div role="tablist" className={`inline-flex rounded-2xl border border-line bg-surface-2/70 p-1 ${className}`}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-[13px] font-semibold transition ${
              active ? 'bg-surface text-ink shadow-soft' : 'text-ink-3 hover:text-ink'
            }`}
          >
            {opt.dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: opt.dot }} />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function ProgressBar({ value, tone = 'gold', className = '' }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const color = { gold: 'bg-gold', pos: 'bg-pos', neg: 'bg-neg', warn: 'bg-warn', light: 'bg-[#D6B97B]' }[tone] || 'bg-gold';
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-ink/10 ${className}`} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${color} transition-[width] duration-700 ease-out`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function EmptyState({ icon = 'inbox', title, text, action }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-10 text-center">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-ink-3">
        <Icon name={icon} />
      </span>
      <p className="text-sm font-semibold text-ink">{title}</p>
      {text && <p className="mt-1 max-w-xs text-[13px] text-ink-3">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Alert({ children, tone = 'neg' }) {
  const styles = tone === 'neg' ? 'border-neg/25 bg-neg/10 text-neg' : 'border-warn/25 bg-warn/10 text-warn';
  return (
    <div role="alert" className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-[13px] font-medium ${styles}`}>
      <Icon name={tone === 'neg' ? 'error' : 'warning'} className="mt-px text-[18px]" />
      <span>{children}</span>
    </div>
  );
}

/** Bottom sheet on phones, centered dialog on larger screens. */
export function Modal({ open, onClose, title, subtitle, icon, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Tutup" onClick={onClose} className="absolute inset-0 animate-fade-in bg-black/50 backdrop-blur-sm" />
      <div className="relative max-h-[92dvh] w-full animate-sheet-in overflow-y-auto rounded-t-[28px] border border-line bg-surface p-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] shadow-lift sm:max-w-md sm:rounded-[28px] sm:pb-6">
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-line sm:hidden" />
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {icon && (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold/15 text-gold">
                <Icon name={icon} />
              </span>
            )}
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
              {subtitle && <p className="mt-0.5 truncate text-[13px] text-ink-3">{subtitle}</p>}
            </div>
          </div>
          <button type="button" onClick={onClose} className="icon-btn -mr-2 -mt-1" aria-label="Tutup">
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

export function CategoryIcon({ category, negative = true, size = 'md' }) {
  const meta = categoryMeta(category);
  const box = size === 'sm' ? 'h-9 w-9 rounded-xl text-[18px]' : 'h-11 w-11 rounded-2xl text-[20px]';
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center ${box}`}
      style={{ color: negative ? meta.color : 'rgb(var(--c-pos))' }}
    >
      <span className="absolute inset-0 rounded-[inherit] opacity-[0.14]" style={{ background: 'currentColor' }} />
      <Icon name={negative ? meta.icon : 'south_west'} className="relative" />
    </span>
  );
}

export function TxRow({ tx, to, showAccount = true }) {
  const meta = categoryMeta(tx.category);
  const content = (
    <>
      <CategoryIcon category={tx.category} negative={tx.negative} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-ink">{tx.title || meta.label}</p>
        <p className="mt-0.5 truncate text-[12px] text-ink-3">
          {meta.label} · {formatDate(tx.time, { day: 'numeric', month: 'short' })}
          {showAccount && <> · {accountLabel(tx)}</>}
        </p>
      </div>
      <p className={`num shrink-0 text-right text-[14px] font-semibold ${tx.negative ? 'text-ink' : 'text-pos'}`}>
        {tx.negative ? '−' : '+'}{formatIDR(tx.amount).replace('Rp', 'Rp ')}
      </p>
    </>
  );
  const cls = 'flex items-center gap-3.5 rounded-2xl px-2 py-3 transition hover:bg-surface-2/70';
  return to ? <Link to={to} className={cls}>{content}</Link> : <div className={cls}>{content}</div>;
}

/**
 * Date picker that always shows a readable label. Android Chrome renders an
 * empty <input type="date"> as a blank box, so the native input sits invisibly
 * on top (still opens the system picker) while we draw the label ourselves.
 */
export function DateField({ value, onChange, placeholder = 'Pilih tanggal', clearable = false, required = false, className = '', ...props }) {
  const label = value ? formatDate(`${value}T12:00:00`, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : placeholder;
  const openPicker = (e) => { try { e.currentTarget.showPicker?.(); } catch { /* not supported */ } };
  return (
    <div className={`field relative flex items-center gap-2.5 pr-2 focus-within:border-gold/60 focus-within:ring-4 focus-within:ring-gold/15 ${className}`}>
      <Icon name="calendar_today" className="text-[18px] text-ink-3" />
      <span className={`flex-1 truncate ${value ? 'text-ink' : 'text-ink-3 font-normal'}`}>{label}</span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={openPicker}
        required={required}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        {...props}
      />
      {clearable && value ? (
        <button type="button" onClick={() => onChange('')} aria-label="Hapus tanggal"
          className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-ink">
          <Icon name="close" className="text-[16px]" />
        </button>
      ) : (
        <Icon name="expand_more" className="text-[20px] text-ink-3" />
      )}
    </div>
  );
}

export function QuickAmounts({ amounts, onPick, prefix = '' }) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {amounts.map((amt) => (
        <button key={amt} type="button" onClick={() => onPick(String(amt))}
          className="rounded-full border border-line bg-surface-2/60 px-3.5 py-1.5 text-xs font-semibold text-ink-2 transition hover:border-gold/50 hover:text-ink">
          {prefix}{amt >= 1_000_000 ? `${amt / 1_000_000} jt` : `${amt / 1_000} rb`}
        </button>
      ))}
    </div>
  );
}

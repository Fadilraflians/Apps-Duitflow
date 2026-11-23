import { useState } from 'react';
import { formatIDR, formatShort } from '../utils/format';

function Tooltip({ children, align = 'center' }) {
  const pos = align === 'left' ? 'left-0' : align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2';
  return (
    <div className={`pointer-events-none absolute bottom-full z-20 mb-2 whitespace-nowrap rounded-xl border border-line bg-surface px-3 py-2 text-xs shadow-lift ${pos}`}>
      {children}
    </div>
  );
}

const alignFor = (idx, total) => (idx === 0 ? 'left' : idx === total - 1 ? 'right' : 'center');

/** Single-series vertical bars. The last bar (today / current) is highlighted. */
export function Bars({ data, height = 150, valueKey = 'total', highlightLast = true, ariaLabel }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(...data.map((d) => d[valueKey]), 0);
  const scale = max || 1;

  return (
    <div role="img" aria-label={ariaLabel}>
      <div className="relative" style={{ height }}>
        {/* recessive gridlines */}
        {[0, 0.5, 1].map((t) => (
          <div key={t} className="absolute inset-x-0 border-t border-dashed border-line" style={{ bottom: `${t * 100}%` }} />
        ))}
        {max > 0 && <span className="num absolute -top-5 right-0 text-[10px] text-ink-3">{formatShort(max)}</span>}
        <div className="absolute inset-0 flex items-end gap-1.5 sm:gap-3">
          {data.map((d, i) => {
            const v = d[valueKey];
            const active = highlightLast && i === data.length - 1;
            const isHover = hover === i;
            return (
              <button
                key={d.key}
                type="button"
                className="relative flex h-full flex-1 items-end justify-center focus:outline-none"
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)} onBlur={() => setHover(null)}
                onClick={() => setHover(isHover ? null : i)}
                aria-label={`${d.label}: ${formatIDR(v)}`}
              >
                {isHover && (
                  <Tooltip align={alignFor(i, data.length)}>
                    <p className="text-ink-3">{d.fullLabel || d.label}</p>
                    <p className="num mt-0.5 font-semibold text-ink">{formatIDR(v)}</p>
                  </Tooltip>
                )}
                <span
                  className={`block w-full max-w-[34px] rounded-t-[4px] transition-all duration-500 ${
                    active ? 'bg-gold' : isHover ? 'bg-ink/45' : 'bg-ink/15'
                  }`}
                  style={{ height: v > 0 ? `${Math.max((v / scale) * 100, 3)}%` : '2px' }}
                />
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-2.5 flex gap-1.5 sm:gap-3">
        {data.map((d, i) => (
          <span key={d.key} className={`flex-1 text-center text-[10.5px] font-medium ${highlightLast && i === data.length - 1 ? 'text-ink' : 'text-ink-3'}`}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Income vs. expense side by side per period — one shared axis. */
export function PairedBars({ data, height = 180, ariaLabel }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(...data.flatMap((d) => [d.income, d.spend]), 0);
  const scale = max || 1;
  const h = (v) => (v > 0 ? `${Math.max((v / scale) * 100, 3)}%` : '2px');

  return (
    <div role="img" aria-label={ariaLabel}>
      <div className="mb-5 flex items-center gap-4 text-xs text-ink-2">
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-pos" />Pemasukan</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-neg" />Pengeluaran</span>
        {max > 0 && <span className="num ml-auto text-[10px] text-ink-3">maks {formatShort(max)}</span>}
      </div>
      <div className="relative" style={{ height }}>
        {[0, 0.5, 1].map((t) => (
          <div key={t} className="absolute inset-x-0 border-t border-dashed border-line" style={{ bottom: `${t * 100}%` }} />
        ))}
        <div className="absolute inset-0 flex items-end gap-2 sm:gap-4">
          {data.map((d, i) => {
            const isHover = hover === i;
            return (
              <button key={d.key} type="button"
                className={`relative flex h-full flex-1 items-end justify-center gap-[2px] rounded-lg transition focus:outline-none ${isHover ? 'bg-ink/[0.04]' : ''}`}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)} onBlur={() => setHover(null)}
                onClick={() => setHover(isHover ? null : i)}
                aria-label={`${d.fullLabel || d.label}: pemasukan ${formatIDR(d.income)}, pengeluaran ${formatIDR(d.spend)}`}>
                {isHover && (
                  <Tooltip align={alignFor(i, data.length)}>
                    <p className="mb-1 font-semibold text-ink">{d.fullLabel || d.label}</p>
                    <p className="flex items-center gap-2 text-ink-2"><span className="h-2 w-2 rounded-[2px] bg-pos" />Masuk <span className="num ml-auto pl-4 font-semibold text-ink">{formatIDR(d.income)}</span></p>
                    <p className="flex items-center gap-2 text-ink-2"><span className="h-2 w-2 rounded-[2px] bg-neg" />Keluar <span className="num ml-auto pl-4 font-semibold text-ink">{formatIDR(d.spend)}</span></p>
                  </Tooltip>
                )}
                <span className="block w-full max-w-[18px] rounded-t-[4px] bg-pos transition-all duration-500" style={{ height: h(d.income) }} />
                <span className="block w-full max-w-[18px] rounded-t-[4px] bg-neg transition-all duration-500" style={{ height: h(d.spend) }} />
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-2.5 flex gap-2 sm:gap-4">
        {data.map((d) => <span key={d.key} className="flex-1 text-center text-[10.5px] font-medium text-ink-3">{d.label}</span>)}
      </div>
    </div>
  );
}

/** Donut with 2px surface gaps between segments. `segments`: [{name,label,amount,color}] */
export function Donut({ segments, total, size = 200, stroke = 22, center, active, onActive }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const gap = segments.length > 1 ? 3 : 0;
  let offset = 0;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--c-line))" strokeWidth={stroke} />
        {total > 0 && segments.map((s) => {
          const len = (s.amount / total) * c;
          const visible = Math.max(len - gap, 0.5);
          const el = (
            <circle key={s.name} cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={s.color} strokeWidth={active === s.name ? stroke + 6 : stroke}
              strokeDasharray={`${visible} ${c - visible}`} strokeDashoffset={-offset}
              opacity={active && active !== s.name ? 0.35 : 1}
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => onActive?.(s.name)} onMouseLeave={() => onActive?.(null)}
              onClick={() => onActive?.(active === s.name ? null : s.name)}>
              <title>{`${s.label}: ${formatIDR(s.amount)}`}</title>
            </circle>
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">{center}</div>
    </div>
  );
}

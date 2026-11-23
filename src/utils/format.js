const idr = new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0
});
const idrCompact = new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', notation: 'compact', maximumFractionDigits: 1
});

export const formatIDR = (value) => idr.format(Number(value) || 0);
export const formatCompactIDR = (value) => idrCompact.format(Number(value) || 0);

/** Short axis label: 1,5 jt / 250 rb */
export const formatShort = (value) => {
  const n = Number(value) || 0;
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1).replace('.0', '').replace('.', ',')} M`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.0', '').replace('.', ',')} jt`;
  if (n >= 1_000) return `${Math.round(n / 1_000)} rb`;
  return String(n);
};

export const formatDate = (value, opts = { day: 'numeric', month: 'short', year: 'numeric' }) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('id-ID', opts).format(date);
};

export const monthLabel = (key, opts = { month: 'long', year: 'numeric' }) => {
  const [year, month] = String(key).split('-').map(Number);
  if (!year || !month) return key;
  return new Intl.DateTimeFormat('id-ID', opts).format(new Date(year, month - 1, 1));
};

/* Category values stay in English in the database; only the label is localized.
   Colors follow the category (entity), never its rank. */
export const CATEGORIES = {
  Food: { label: 'Makanan', icon: 'restaurant', color: 'var(--series-1)' },
  Shopping: { label: 'Belanja', icon: 'shopping_bag', color: 'var(--series-2)' },
  Transport: { label: 'Transportasi', icon: 'directions_car', color: 'var(--series-3)' },
  Bills: { label: 'Tagihan', icon: 'receipt_long', color: 'var(--series-4)' },
  Leisure: { label: 'Hiburan', icon: 'movie', color: 'var(--series-5)' },
  Income: { label: 'Pemasukan', icon: 'payments', color: 'var(--series-6)' },
};

export const categoryMeta = (name) =>
  CATEGORIES[name] || { label: name || 'Lainnya', icon: 'category', color: 'var(--series-other)' };

export const ACCOUNT_TYPES = {
  bank: { label: 'Rekening bank', icon: 'account_balance' },
  bca: { label: 'Rekening bank', icon: 'account_balance' },
  cash: { label: 'Uang tunai', icon: 'payments' },
  ewallet: { label: 'Dompet digital', icon: 'account_balance_wallet' },
};

export const accountMeta = (type) => ACCOUNT_TYPES[String(type || '').toLowerCase()] || ACCOUNT_TYPES.bank;

export const accountLabel = (tx) =>
  tx.account_name || (String(tx.account_type || '').trim().toLowerCase() === 'cash' ? 'Cash' : 'Bank BCA');

export const sortByNewest = (list) =>
  [...list].sort((a, b) => {
    const byTime = new Date(b.time).getTime() - new Date(a.time).getTime();
    if (byTime !== 0) return byTime;
    return (Number(b.id) || 0) - (Number(a.id) || 0);
  });

export const firstNameOf = (user) =>
  (user?.full_name || user?.fullName || user?.name || user?.email?.split('@')?.[0] || 'Tamu').trim().split(' ')[0];

export const initialsOf = (user) => {
  const name = (user?.full_name || user?.fullName || user?.name || user?.email || 'Tamu').trim();
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || 'DF';
};

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 19) return 'Selamat sore';
  return 'Selamat malam';
};

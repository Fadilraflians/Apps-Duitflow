import { useEffect, useState } from 'react';

export const parseAmount = (value) => {
  const digits = String(value ?? '').replace(/[^\d-]/g, '');
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatAmount = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export default function AmountInput({ value, onChange, className = '', ...props }) {
  const [displayValue, setDisplayValue] = useState(() => formatAmount(value));

  useEffect(() => setDisplayValue(formatAmount(value)), [value]);

  const handleChange = (event) => {
    const next = formatAmount(event.target.value);
    setDisplayValue(next);
    onChange(next);
  };

  return (
    <input
      {...props}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      className={className}
    />
  );
}

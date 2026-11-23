import { useEffect, useState } from 'react';

export const parseAmount = (value) => {
  const parsed = Number(String(value ?? '').trim().replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
};

const cleanAmount = (value) => {
  const cleaned = String(value).replace(/[^\d.,]/g, '').replace(',', '.');
  const [whole, ...fraction] = cleaned.split('.');
  return fraction.length ? `${whole}.${fraction.join('').slice(0, 3)}` : whole;
};

export default function AmountInput({ value, onChange, className = '', ...props }) {
  const [displayValue, setDisplayValue] = useState(value ?? '');

  useEffect(() => setDisplayValue(value ?? ''), [value]);

  const handleChange = (event) => {
    const next = cleanAmount(event.target.value);
    setDisplayValue(next);
    onChange(next);
  };

  const handleFocus = () => {
    const next = value === '' ? '' : String(parseAmount(value));
    setDisplayValue(next);
    onChange(next);
  };

  const handleBlur = () => {
    if (displayValue === '') return;
    const formatted = parseAmount(displayValue).toFixed(3).replace('.', ',');
    setDisplayValue(formatted);
    onChange(formatted);
  };

  return (
    <input
      {...props}
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={className}
    />
  );
}

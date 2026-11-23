export const localDateKey = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const localMonthKey = (value) => localDateKey(value).slice(0, 7);

export const getLastDays = (count, endDate = new Date()) => {
  const today = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (count - index - 1));
    return {
      date,
      key: localDateKey(date),
      label: date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
    };
  });
};

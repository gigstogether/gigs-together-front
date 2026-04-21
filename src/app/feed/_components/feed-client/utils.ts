const DEFAULT_LOCALE = 'en-US';

export const formatMonthTitle = (date: string): string => {
  return (
    new Date(date).toLocaleString(DEFAULT_LOCALE, { month: 'long' }) + ' ' + date.split('-')[0]
  );
};

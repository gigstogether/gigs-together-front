const GIG_DATE_DEFAULT_LOCALE = 'en-GB';
const GIG_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  weekday: 'short',
};

const gigDateFormatter = new Intl.DateTimeFormat(GIG_DATE_DEFAULT_LOCALE, {
  day: GIG_DATE_FORMAT.day,
  month: GIG_DATE_FORMAT.month,
  year: GIG_DATE_FORMAT.year,
  weekday: GIG_DATE_FORMAT.weekday,
});

export const formatGigDate = (dateString?: string) => {
  if (!dateString) return '';
  // Parse as local date to avoid timezone shifts (don't use new Date("YYYY-MM-DD"))
  const [y, m, day] = dateString.split('-').map(Number);
  const d = new Date(y, (m ?? 1) - 1, day ?? 1);
  return gigDateFormatter.format(d);
};

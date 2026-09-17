import { formatGigDate } from '@/lib/feed/gig-date-format';

export function formatAdminEventDate(date: string, endDate?: string): string {
  const start = formatGigDate(date);
  if (!endDate || endDate === date) return start;
  return `${start} – ${formatGigDate(endDate)}`;
}

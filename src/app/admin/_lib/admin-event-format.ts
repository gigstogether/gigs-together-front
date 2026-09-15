import { formatGigDate } from '@/lib/feed/gig-date-format';

interface AdminSuggestedBy {
  userId: string | number;
  name?: string;
  username?: string;
}

export function formatAdminEventDate(date: string, endDate?: string): string {
  const start = formatGigDate(date);
  if (!endDate || endDate === date) return start;
  return `${start} – ${formatGigDate(endDate)}`;
}

export function formatAdminSuggestedBy(
  suggestedBy: AdminSuggestedBy,
  label = 'Suggested by',
): string {
  const { name, username, userId } = suggestedBy;
  const formattedUsername = username ? `@${username}` : undefined;

  if (username && name) {
    return `${label} ${formattedUsername} (${name})`;
  }
  return `${label} ${formattedUsername ?? name ?? String(userId)}`;
}

import { toast } from '@/hooks/use-toast';
import { isTelegramInitDataExpiredError } from '@/lib/api-errors';

const FALLBACK_DESCRIPTION =
  'Your Telegram authentication data is out of date. Reload so Telegram can send fresh data.';

export const TELEGRAM_INIT_DATA_EXPIRED_TOAST_TITLE = 'Please reload the page' as const;

export interface TelegramInitDataExpiredToastContent {
  readonly title: typeof TELEGRAM_INIT_DATA_EXPIRED_TOAST_TITLE;
  readonly description: string;
}

function getTelegramInitDataExpiredDescription(e: unknown): string {
  return e instanceof Error ? e.message : FALLBACK_DESCRIPTION;
}

/**
 * When the API returns initData expiry, use this for toast title + description (and inline error text).
 */
export function getTelegramInitDataExpiredToastContent(
  e: unknown,
): TelegramInitDataExpiredToastContent | null {
  if (!isTelegramInitDataExpiredError(e)) return null;
  return {
    title: TELEGRAM_INIT_DATA_EXPIRED_TOAST_TITLE,
    description: getTelegramInitDataExpiredDescription(e),
  };
}

/** Shows the standard destructive toast. Returns true if the error was handled (expired initData). */
export function toastTelegramInitDataExpired(e: unknown): boolean {
  const content = getTelegramInitDataExpiredToastContent(e);
  if (!content) return false;
  toast({ ...content, variant: 'destructive' });
  return true;
}

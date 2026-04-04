/**
 * When `NEXT_PUBLIC_TELEGRAM_AUTH_ENABLED` is not set or not truthy, web login UI is hidden.
 * Use `true` or `1` (case-insensitive, trimmed) to enable.
 */
export function isTelegramAuthEnabled(): boolean {
  const raw = process.env.NEXT_PUBLIC_TELEGRAM_AUTH_ENABLED;
  if (raw === undefined) {
    return false;
  }
  const v = raw.trim().toLowerCase();
  return v === 'true' || v === '1';
}

/**
 * Bot username for the Login Widget when auth is enabled and `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` is set.
 */
export function getTelegramAuthBotUsername(): string | undefined {
  if (!isTelegramAuthEnabled()) {
    return undefined;
  }
  const name = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.trim();
  if (!name) {
    return undefined;
  }
  return name;
}

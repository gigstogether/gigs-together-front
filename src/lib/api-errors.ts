/** API error with optional machine-readable `code` from the backend (e.g. Telegram initData expiry). */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Backend sends this when WebApp initData `auth_date` is outside the allowed window. */
export const TELEGRAM_INIT_DATA_EXPIRED_CODE = 'TELEGRAM_INIT_DATA_EXPIRED' as const;

export function isTelegramInitDataExpiredError(e: unknown): boolean {
  return e instanceof ApiError && e.code === TELEGRAM_INIT_DATA_EXPIRED_CODE;
}

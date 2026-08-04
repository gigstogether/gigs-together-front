/**
 * Persisted Telegram user fields for UI (non-sensitive). Access JWT lives in an HttpOnly cookie.
 */
export interface TelegramStoredClientProfile {
  readonly displayLabel: string;
  readonly photoUrl?: string;
  readonly isAdmin: boolean;
}

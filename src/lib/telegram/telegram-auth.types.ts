/**
 * Client-side auth derived from persisted non-sensitive profile (localStorage key from
 * `NEXT_PUBLIC_TELEGRAM_CLIENT_PROFILE_STORAGE_KEY`, default `gt_tg_client_profile`), shared across tabs.
 */
export interface TelegramAuthState {
  readonly displayLabel: string;
  /** When present (e.g. Telegram Login Widget `photo_url`), shown as a small avatar in the UI. */
  readonly photoUrl?: string;
  readonly isAdmin: boolean;
}

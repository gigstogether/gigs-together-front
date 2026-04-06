/** Client-side session derived from the access JWT in `localStorage` (`gt_tg_access_token`), shared across tabs. */
export interface TelegramAuthSession {
  readonly displayLabel: string;
}

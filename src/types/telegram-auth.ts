/** Client-side auth derived from the access JWT in localStorage (`gt_tg_access_token`), shared across tabs. */
export interface TelegramAuthState {
  readonly displayLabel: string;
}

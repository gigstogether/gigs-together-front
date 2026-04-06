/** Client-side auth derived from the access JWT in localStorage (`gt_tg_access_token`), shared across tabs. */
export interface TelegramAuthState {
  readonly displayLabel: string;
  /** When present in the JWT (e.g. Login Widget `photo_url`), shown as a small avatar in the UI. */
  readonly photoUrl?: string;
}

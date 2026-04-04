/**
 * Payload returned by the Telegram Login Widget after successful authorization.
 * Cryptographic verification of `hash` requires the bot token on the server.
 */
export interface TelegramWidgetUser {
  readonly id: number;
  readonly first_name: string;
  readonly last_name?: string;
  readonly username?: string;
  readonly photo_url?: string;
  readonly auth_date: number;
  readonly hash: string;
}

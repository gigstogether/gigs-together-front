import type { TelegramStoredClientProfile } from '@/lib/telegram/telegram-client-profile.types';

/** Parsed JSON body from `POST v1/auth/telegram/*` exchange endpoints (JWT is HttpOnly cookie). */
export interface TelegramAuthExchangeResponse {
  readonly profile: TelegramStoredClientProfile;
}

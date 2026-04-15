import type { TelegramStoredClientProfile } from '@/types/telegram-client-profile';

/** Parsed JSON body from `POST v1/auth/telegram/*` exchange endpoints (JWT is HttpOnly cookie). */
export interface TelegramAuthExchangeResponse {
  readonly profile: TelegramStoredClientProfile;
}

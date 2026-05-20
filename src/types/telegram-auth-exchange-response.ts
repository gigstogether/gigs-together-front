import type { AuthClientProfileResponseBody } from '@/types/auth-client-profile';

/** Parsed JSON body from `POST v1/auth/telegram/*` exchange endpoints (JWT is HttpOnly cookie). */
export type TelegramAuthExchangeResponse = AuthClientProfileResponseBody;

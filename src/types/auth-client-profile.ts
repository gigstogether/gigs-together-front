/**
 * Non-sensitive session profile for UI (`GET v1/auth/me`, Telegram exchange).
 * Access JWT lives in an HttpOnly cookie.
 */
export interface AuthClientProfile {
  readonly displayLabel: string;
  readonly photoUrl?: string;
  readonly isAdmin: boolean;
}

/** Standard JSON body when only a client profile is returned (e.g. `auth/me`, refresh, Telegram exchange). */
export interface AuthClientProfileResponseBody {
  readonly profile: AuthClientProfile;
}

export interface TelegramLoginOptions {
  client_id: number;
  scope: ['profile'];
}

export interface TelegramLoginResult {
  id_token?: string;
  error?: string;
}

interface TelegramLoginSdk {
  auth: (options: TelegramLoginOptions, callback: (result: TelegramLoginResult) => void) => void;
}

declare global {
  interface Window {
    Telegram?: {
      Login?: TelegramLoginSdk;
      WebApp?: {
        initData: string;
        initDataUnsafe?: {
          start_param?: string;
          user?: {
            id: number;
          };
        };
      };
    };
  }
}

export type Event = {
  id: string;
  date: string;
  endDate?: string;
  poster?: string;
  title: string;
  venue: string;
  city: {
    code: string;
    name: string;
  };
  country: {
    iso: string;
    name: string;
  };
  ticketsUrl?: string;
  calendarUrl?: string;
  postUrl?: string;
};

export interface V1GigGetResponseBody {
  gigs: V1GigGetResponseBodyGig[];
  prevCursor?: string;
  nextCursor?: string;
}

export interface V1GigDatesGetResponseBody {
  dates: Array<string | number>;
}

export interface V1GigAroundGetResponseBody {
  before: V1GigGetResponseBodyGig[];
  after: V1GigGetResponseBodyGig[];
  prevCursor?: string;
  nextCursor?: string;
}

/** GET v1/gigs/date/:publicId — anchor date for hash / deep links */
export interface V1GigByPublicIdGetResponseBody {
  date: string | number;
}

export interface V1GigGetResponseBodyGig {
  id: string;
  title: string;
  date: string | number;
  endDate?: string | number;
  city: string;
  country: string;
  venue: string;
  ticketsUrl: string;
  posterUrl?: string;
  calendarUrl?: string;
  postUrl?: string;
}

export type LocaleIso = 'en' | 'ru' | 'es' | string;

export {};

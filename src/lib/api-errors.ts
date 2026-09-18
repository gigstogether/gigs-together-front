/** API error with optional machine-readable `code` from the backend (e.g. Telegram initData expiry). */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type ApiHttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiRequestErrorParams {
  endpointOrUrl: string;
  method: ApiHttpMethod;
  error: unknown;
}

export class ApiRequestError extends Error {
  endpointOrUrl: string;
  method: ApiHttpMethod;
  statusCode: number | undefined;

  constructor(params: ApiRequestErrorParams) {
    const { endpointOrUrl, method, error } = params;
    const statusCode = error instanceof ApiError ? error.statusCode : undefined;
    const statusPrefix = statusCode === undefined ? '' : `HTTP ${statusCode} `;
    const causeMessage =
      error instanceof Error && error.message.trim() ? error.message : 'Something went wrong';

    super(`${statusPrefix}${method} ${endpointOrUrl}: ${causeMessage}`);
    this.name = 'ApiRequestError';
    this.endpointOrUrl = endpointOrUrl;
    this.method = method;
    this.statusCode = statusCode;
  }
}

export interface ApiNetworkErrorParams {
  method: ApiHttpMethod;
  url: string;
  cause: unknown;
}

export class ApiNetworkError extends Error {
  method: ApiHttpMethod;
  url: string;
  cause: unknown;

  constructor(params: ApiNetworkErrorParams) {
    const { method, url, cause } = params;

    super(
      `No HTTP response received for ${method} ${url}. ` +
        'Check that the API is running and the URL is correct. ' +
        'If it is, inspect the browser Network or Console panels for CORS, TLS, or mixed-content errors.',
    );
    this.name = 'ApiNetworkError';
    this.method = method;
    this.url = url;
    this.cause = cause;
  }
}

/** Backend sends this when WebApp initData `auth_date` is outside the allowed window. */
export const TELEGRAM_INIT_DATA_EXPIRED_CODE = 'TELEGRAM_INIT_DATA_EXPIRED' as const;

export function isTelegramInitDataExpiredError(e: unknown): boolean {
  return e instanceof ApiError && e.code === TELEGRAM_INIT_DATA_EXPIRED_CODE;
}

export function isAbortError(e: unknown): boolean {
  return typeof e === 'object' && e !== null && 'name' in e && e.name === 'AbortError';
}

type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

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

/** Backend sends this when WebApp initData `auth_date` is outside the allowed window. */
export const TELEGRAM_INIT_DATA_EXPIRED_CODE = 'TELEGRAM_INIT_DATA_EXPIRED' as const;

export function isTelegramInitDataExpiredError(e: unknown): boolean {
  return e instanceof ApiError && e.code === TELEGRAM_INIT_DATA_EXPIRED_CODE;
}

function buildUrl(endpointOrUrl: string): string {
  // If caller already passed an absolute URL, use it as-is.
  if (/^https?:\/\//i.test(endpointOrUrl)) return endpointOrUrl;
  if (!API_BASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_APP_API_BASE_URL for direct API calls');
  }
  return `${API_BASE_URL.replace(/\/$/, '')}/${endpointOrUrl.replace(/^\//, '')}`;
}

export async function apiRequest<TResponse = unknown, TBody = unknown>(
  endpointOrUrl: string,
  method: HttpMethod,
  data?: TBody,
  init?: RequestInit,
): Promise<TResponse> {
  try {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;

    const headers = new Headers(init?.headers);
    if (isFormData) {
      // Avoid breaking multipart boundary if caller accidentally set a Content-Type
      if (headers.has('Content-Type')) headers.delete('Content-Type');
    } else {
      // Default for JSON payloads; caller can override via init.headers
      if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    }

    const body =
      method !== 'GET' && method !== 'HEAD' && data
        ? isFormData
          ? (data as unknown as FormData)
          : JSON.stringify(data)
        : undefined;

    const response = await fetch(buildUrl(endpointOrUrl), {
      ...init,
      method,
      headers,
      body,
    });

    const contentType = response.headers.get('Content-Type') || '';
    const isJson = contentType.includes('application/json');

    const result = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      if (typeof result === 'object' && result !== null && !Array.isArray(result)) {
        const r = result as Record<string, unknown>;
        const msg =
          typeof r.message === 'string' && r.message.trim() ? r.message : 'Something went wrong';
        const code = typeof r.code === 'string' ? r.code : undefined;
        throw new ApiError(msg, response.status, code);
      }
      throw new Error(typeof result === 'string' ? result : 'Something went wrong');
    }

    return result as TResponse;
  } catch (e) {
    console.error('API Error:', e);
    throw e;
  }
}

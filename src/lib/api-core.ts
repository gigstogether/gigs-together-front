import { ApiError } from '@/lib/api-errors';
import { clientEnv } from '@/env/client-env';
import { isRecord } from '@/lib/is-record';

type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

const API_BASE_URL = clientEnv.appApiBaseUrl;

export interface FetchApiJsonOptions extends Omit<RequestInit, 'credentials'> {
  /**
   * Must be set explicitly at every call site.
   * Use `include` for cookie/session requests and `omit` for public cacheable GETs.
   */
  credentials: RequestCredentials;
}

export function buildUrl(endpointOrUrl: string): string {
  if (/^https?:\/\//i.test(endpointOrUrl)) return endpointOrUrl;
  if (!API_BASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_APP_API_BASE_URL for direct API calls');
  }
  return `${API_BASE_URL.replace(/\/$/, '')}/${endpointOrUrl.replace(/^\//, '')}`;
}

function isJsonContentType(contentType: string): boolean {
  const mediaType = contentType.split(';', 1)[0]?.trim().toLowerCase();
  return mediaType === 'application/json' || mediaType?.endsWith('+json') === true;
}

function hasNoResponseBody(method: HttpMethod, response: Response): boolean {
  return method === 'HEAD' || response.status === 204 || response.status === 205;
}

export async function fetchApiJson<TResponse>(
  endpointOrUrl: string,
  method: HttpMethod,
  data: unknown | undefined,
  init: FetchApiJsonOptions,
): Promise<TResponse> {
  const { credentials, ...fetchInit } = init;
  const hasRequestBody = method !== 'GET' && method !== 'HEAD' && data !== undefined;
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;

  const headers = new Headers(fetchInit.headers);
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  if (hasRequestBody && isFormData) {
    if (headers.has('Content-Type')) headers.delete('Content-Type');
  } else if (hasRequestBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const body = hasRequestBody ? (isFormData ? data : JSON.stringify(data)) : undefined;

  const response = await fetch(buildUrl(endpointOrUrl), {
    ...fetchInit,
    method,
    headers,
    body,
    credentials,
  });

  const contentType = response.headers.get('Content-Type') ?? '';
  const result = hasNoResponseBody(method, response)
    ? undefined
    : isJsonContentType(contentType)
      ? await response.json()
      : await response.text();

  if (!response.ok) {
    if (isRecord(result)) {
      const r = result;
      const msg =
        typeof r.message === 'string' && r.message.trim() ? r.message : 'Something went wrong';
      const code = typeof r.code === 'string' ? r.code : undefined;
      throw new ApiError(msg, response.status, code);
    }
    throw new Error(typeof result === 'string' && result ? result : 'Something went wrong');
  }

  return result as TResponse;
}

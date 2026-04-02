import { apiRequest } from '@/lib/api';
import { ensureTelegramAccessToken } from '@/lib/telegram-access-token';
import { isRecord } from '@/lib/is-record';

export type PosterMode = 'upload' | 'url';

export interface PosterSelection {
  mode: PosterMode;
  file: File | null;
  url: string;
}

export interface GigUpsertPayload {
  title: string;
  date: string;
  endDate?: string;
  city: string;
  country: string;
  venue: string;
  ticketsUrl: string;
}

export interface GigDraftData {
  title: string;
  date: string;
  endDate?: string;
  city: string;
  country: string;
  venue: string;
  ticketsUrl: string;
  posterUrl?: string;
}

export interface GigFormData extends GigDraftData {
  publicId: string;
}

export interface GigLookupData {
  title?: string;
  date?: string;
  endDate?: string;
  city?: string;
  country?: string;
  venue?: string;
  ticketsUrl?: string;
  posterUrl?: string;
}

export interface UpdateGigResponse {
  publicId: string;
}

export interface GigUpsertApiParams {
  gig: GigUpsertPayload;
  poster: PosterSelection;
}

export interface FetchGigByPublicIdParams {
  publicId: string;
  signal?: AbortSignal;
}

export interface LookupGigParams {
  name: string;
  location: string;
  signal?: AbortSignal;
}

export interface UpdateGigParams extends GigUpsertApiParams {
  publicId: string;
}

interface GigLookupApiResponseBody {
  gig: unknown;
}

function asRecordOrThrow(raw: unknown): Record<string, unknown> {
  if (!isRecord(raw)) {
    throw new Error('Invalid API response: expected an object');
  }
  return raw;
}

function requireString(obj: Record<string, unknown>, key: string): string {
  const v = obj[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Invalid API response: "${key}" must be a non-empty string`);
  }
  return v;
}

function optionalString(obj: Record<string, unknown>, key: string): string | undefined {
  const v = obj[key];
  if (v === undefined || v === null || v === '') return undefined;
  if (typeof v !== 'string') {
    throw new Error(`Invalid API response: "${key}" must be a string when present`);
  }
  return v;
}

function optionalNonEmptyString(obj: Record<string, unknown>, key: string): string | undefined {
  const v = obj[key];
  if (v === undefined || v === null) return undefined;
  if (typeof v !== 'string') {
    throw new Error(`Invalid API response: "${key}" must be a string when present`);
  }
  const trimmed = v.trim();
  return trimmed ? trimmed : undefined;
}

function parseGigDraftData(raw: unknown): GigDraftData {
  const obj = asRecordOrThrow(raw);
  return {
    title: requireString(obj, 'title'),
    date: requireString(obj, 'date'),
    endDate: optionalString(obj, 'endDate'),
    city: requireString(obj, 'city'),
    country: requireString(obj, 'country'),
    venue: requireString(obj, 'venue'),
    ticketsUrl: requireString(obj, 'ticketsUrl'),
    posterUrl: optionalString(obj, 'posterUrl'),
  };
}

function parseGigFormData(raw: unknown): GigFormData {
  const obj = asRecordOrThrow(raw);
  const draft = parseGigDraftData(obj);
  return {
    publicId: requireString(obj, 'publicId'),
    ...draft,
  };
}

function parseGigLookupData(raw: unknown): GigLookupData {
  const obj = asRecordOrThrow(raw);
  return {
    title: optionalNonEmptyString(obj, 'title'),
    date: optionalNonEmptyString(obj, 'date'),
    endDate: optionalNonEmptyString(obj, 'endDate'),
    city: optionalNonEmptyString(obj, 'city'),
    country: optionalNonEmptyString(obj, 'country'),
    venue: optionalNonEmptyString(obj, 'venue'),
    ticketsUrl: optionalNonEmptyString(obj, 'ticketsUrl'),
    posterUrl: optionalNonEmptyString(obj, 'posterUrl'),
  };
}

function getPosterUrlOrUndefined(poster: PosterSelection): string | undefined {
  if (poster.mode !== 'url') return undefined;
  const trimmed = (poster.url ?? '').trim();
  if (!trimmed) return undefined;
  new URL(trimmed);
  return trimmed;
}

type SubmitGigMethod = 'POST' | 'PATCH';

interface SubmitGigParams extends GigUpsertApiParams {
  endpoint: string;
  method: SubmitGigMethod;
}

async function submitGig<TResponse = void>(params: SubmitGigParams): Promise<TResponse> {
  await ensureTelegramAccessToken();

  const gig: GigUpsertPayload = {
    title: params.gig.title,
    date: params.gig.date,
    endDate: params.gig.endDate || undefined,
    city: params.gig.city,
    country: params.gig.country,
    venue: params.gig.venue,
    ticketsUrl: params.gig.ticketsUrl,
  };

  const posterUrl = getPosterUrlOrUndefined(params.poster);

  if (params.poster.mode === 'upload' && params.poster.file) {
    const posterFile = params.poster.file;
    const fd = new FormData();
    fd.append('posterFile', posterFile);
    fd.append('gig', JSON.stringify(gig));
    return apiRequest<TResponse, FormData>(params.endpoint, params.method, fd);
  }

  if (posterUrl) {
    return apiRequest<TResponse>(params.endpoint, params.method, {
      gig: { ...gig, posterUrl },
    });
  }

  return apiRequest<TResponse>(params.endpoint, params.method, {
    gig,
  });
}

export async function fetchGigByPublicId(params: FetchGigByPublicIdParams): Promise<GigFormData> {
  const publicId = encodeURIComponent(params.publicId.trim());
  const raw = await apiRequest<unknown>(`v1/gig/${publicId}`, 'GET', undefined, {
    signal: params.signal,
  });
  return parseGigFormData(raw);
}

export async function lookupGig(params: LookupGigParams): Promise<GigLookupData> {
  const name = params.name.trim();
  const location = params.location.trim();
  if (!name) {
    throw new Error('Invalid lookup request: "name" is required');
  }
  if (!location) {
    throw new Error('Invalid lookup request: "location" is required');
  }
  await ensureTelegramAccessToken({ signal: params.signal });
  const raw = await apiRequest<GigLookupApiResponseBody>(
    'v1/gig/lookup',
    'POST',
    {
      name,
      location,
    },
    { signal: params.signal },
  );
  return parseGigLookupData(raw?.gig);
}

export async function createGig(params: GigUpsertApiParams): Promise<void> {
  await submitGig<void>({
    endpoint: 'v1/receiver/gig',
    method: 'POST',
    gig: params.gig,
    poster: params.poster,
  });
}

export async function updateGig(params: UpdateGigParams): Promise<UpdateGigResponse> {
  return submitGig<UpdateGigResponse>({
    endpoint: `v1/receiver/gig/${encodeURIComponent(params.publicId)}`,
    method: 'PATCH',
    gig: params.gig,
    poster: params.poster,
  });
}

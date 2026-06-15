import { apiRequest } from '@/lib/api';
import { gigDateToYMD } from '@/lib/feed.mapper';
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

export interface GigLookupData {
  title?: string;
  date: string;
  endDate?: string;
  city?: string;
  country?: string;
  venue?: string;
  ticketsUrl?: string;
  posterUrl?: string;
}

interface ParsedGigLookupData {
  title?: string;
  date?: string;
  endDate?: string;
  city?: string;
  country?: string;
  venue?: string;
  ticketsUrl?: string;
  posterUrl?: string;
}

export interface GigUpsertResponse {
  publicId: string;
}

export interface GigUpsertApiParams {
  gig: GigUpsertPayload;
  poster: PosterSelection;
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

export type GigApiDateFieldPath = 'gig.date' | 'gig.endDate';

function asRecordOrThrow(raw: unknown): Record<string, unknown> {
  if (!isRecord(raw)) {
    throw new Error('Invalid API response: expected an object');
  }
  return raw;
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

function parseGigLookupData(raw: unknown): ParsedGigLookupData {
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

export function normalizeGigApiDate(date: string, fieldPath: GigApiDateFieldPath): string {
  try {
    return gigDateToYMD(date);
  } catch {
    throw new Error(`Invalid API response: "${fieldPath}" must be YYYY-MM-DD (or ISO)`);
  }
}

function normalizeGigLookupData(data: ParsedGigLookupData): GigLookupData {
  if (!data.date) {
    throw new Error('Lookup did not return a date');
  }

  return {
    title: data.title,
    date: normalizeGigApiDate(data.date, 'gig.date'),
    endDate: data.endDate ? normalizeGigApiDate(data.endDate, 'gig.endDate') : undefined,
    city: data.city,
    country: data.country,
    venue: data.venue,
    ticketsUrl: data.ticketsUrl,
    posterUrl: data.posterUrl,
  };
}

/** `null` means the API found no matching future gig. */
function parseGigLookupApiResponse(raw: unknown): GigLookupData | null {
  const obj = asRecordOrThrow(raw);
  if (obj.gig === null) {
    return null;
  }
  if (obj.gig === undefined) {
    throw new Error('Invalid API response: "gig" is required (use null when there is no match)');
  }
  const parsedGigLookupData = parseGigLookupData(obj.gig);
  return normalizeGigLookupData(parsedGigLookupData);
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

export async function lookupGig(params: LookupGigParams): Promise<GigLookupData | null> {
  const name = params.name.trim();
  const location = params.location.trim();
  if (!name) {
    throw new Error('Invalid lookup request: "name" is required');
  }
  if (!location) {
    throw new Error('Invalid lookup request: "location" is required');
  }
  const raw = await apiRequest<GigLookupApiResponseBody>(
    'v1/gig/lookup',
    'POST',
    {
      name,
      location,
    },
    { signal: params.signal },
  );
  return parseGigLookupApiResponse(raw);
}

export function createGig(params: GigUpsertApiParams): Promise<GigUpsertResponse> {
  return submitGig<GigUpsertResponse>({
    endpoint: 'v1/receiver/gig',
    method: 'POST',
    gig: params.gig,
    poster: params.poster,
  });
}

export function updateGig(params: UpdateGigParams): Promise<GigUpsertResponse> {
  return submitGig<GigUpsertResponse>({
    endpoint: `v1/receiver/gig/${encodeURIComponent(params.publicId)}`,
    method: 'PATCH',
    gig: params.gig,
    poster: params.poster,
  });
}

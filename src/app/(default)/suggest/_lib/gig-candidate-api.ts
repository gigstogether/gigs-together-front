import { apiClientRequest } from '@/lib/api-session-client';

const GIG_CANDIDATES_ENDPOINT = 'v1/gig-candidates';
import { isRecord } from '@/lib/is-record';

export type GigCandidatePosterMode = 'upload' | 'url';

export interface GigCandidatePosterSelection {
  mode: GigCandidatePosterMode;
  file: File | null;
  url: string;
}

export interface GigCandidateCreatePayload {
  communityId: string;
  localityId: string;
  venueId?: string;
  title: string;
  date: string;
  endDate?: string;
  ticketsUrl?: string;
}

export interface GigCandidateCreateApiParams {
  gig: GigCandidateCreatePayload;
  poster: GigCandidatePosterSelection;
}

export interface GigCandidateCreateResponse {
  id: string;
}

function asRecordOrThrow(raw: unknown): Record<string, unknown> {
  if (!isRecord(raw)) {
    throw new Error('Invalid API response: expected an object');
  }
  return raw;
}

function parseGigCandidateCreateResponse(raw: unknown): GigCandidateCreateResponse {
  const obj = asRecordOrThrow(raw);
  const id = obj.id;
  if (typeof id !== 'string' || id.trim() === '') {
    throw new Error('Invalid API response: "id" must be a non-empty string');
  }
  return { id };
}

function getPosterUrlOrUndefined(poster: GigCandidatePosterSelection): string | undefined {
  if (poster.mode !== 'url') return undefined;
  const trimmed = (poster.url ?? '').trim();
  if (!trimmed) return undefined;
  new URL(trimmed);
  return trimmed;
}

export async function createGigCandidate(
  params: GigCandidateCreateApiParams,
): Promise<GigCandidateCreateResponse> {
  const gig: GigCandidateCreatePayload = {
    communityId: params.gig.communityId,
    localityId: params.gig.localityId,
    title: params.gig.title,
    date: params.gig.date,
  };
  if (params.gig.venueId !== undefined) {
    gig.venueId = params.gig.venueId;
  }
  if (params.gig.endDate !== undefined) {
    gig.endDate = params.gig.endDate;
  }
  if (params.gig.ticketsUrl !== undefined) {
    gig.ticketsUrl = params.gig.ticketsUrl;
  }

  const posterUrl = getPosterUrlOrUndefined(params.poster);

  let raw: unknown;
  if (params.poster.mode === 'upload' && params.poster.file) {
    const fd = new FormData();
    fd.append('posterFile', params.poster.file);
    fd.append('gig', JSON.stringify(gig));
    raw = await apiClientRequest<unknown, FormData>(GIG_CANDIDATES_ENDPOINT, 'POST', fd);
  } else if (posterUrl) {
    raw = await apiClientRequest<unknown>(GIG_CANDIDATES_ENDPOINT, 'POST', {
      gig: { ...gig, posterUrl },
    });
  } else {
    raw = await apiClientRequest<unknown>(GIG_CANDIDATES_ENDPOINT, 'POST', { gig });
  }

  return parseGigCandidateCreateResponse(raw);
}

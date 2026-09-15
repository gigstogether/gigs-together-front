import type { Route } from 'next';

import { buildAdminGigEditRoute } from '@/lib/admin-gig-paths';
import {
  ADMIN_GIG_CANDIDATE_NEW_ROUTE,
  buildAdminGigCandidateEditRoute,
} from '@/lib/admin-gig-candidate-paths';
import { SUGGEST_ROUTE } from '@/lib/suggest-paths';

const GIG_FORM_START_PARAM_PATTERN = /^[a-z0-9-]{1,64}$/;
const GIG_CANDIDATE_ID_PATTERN = /^[a-f0-9]{24}$/i;
const TELEGRAM_MINI_APP_START_ACTION_SEPARATOR = '-';

export enum TelegramMiniAppStartAction {
  EditGig = 'editGig',
  EditGigCandidate = 'editGigCandidate',
}

export interface ResolvedAdminTelegramLaunch {
  kind: 'resolved';
  route: Route;
}

export interface FailedAdminTelegramLaunch {
  kind: 'failed';
  reason: 'missingAction' | 'invalidAction';
}

export type AdminTelegramLaunchResolution = ResolvedAdminTelegramLaunch | FailedAdminTelegramLaunch;

function getTelegramMiniAppStartActionPrefix(action: TelegramMiniAppStartAction): string {
  return `${action}${TELEGRAM_MINI_APP_START_ACTION_SEPARATOR}`;
}

export function resolveAdminTelegramLaunch(
  startParam: string | undefined,
): AdminTelegramLaunchResolution {
  const trimmedStartParam = startParam?.trim();
  if (!trimmedStartParam) {
    return { kind: 'failed', reason: 'missingAction' };
  }

  const editGigCandidatePrefix = getTelegramMiniAppStartActionPrefix(
    TelegramMiniAppStartAction.EditGigCandidate,
  );
  if (trimmedStartParam.startsWith(editGigCandidatePrefix)) {
    const gigCandidateId = trimmedStartParam.slice(editGigCandidatePrefix.length);
    if (GIG_CANDIDATE_ID_PATTERN.test(gigCandidateId)) {
      return {
        kind: 'resolved',
        route: buildAdminGigCandidateEditRoute(gigCandidateId),
      };
    }

    return { kind: 'failed', reason: 'invalidAction' };
  }

  const editGigPrefix = getTelegramMiniAppStartActionPrefix(TelegramMiniAppStartAction.EditGig);
  if (trimmedStartParam.startsWith(editGigPrefix)) {
    const publicId = trimmedStartParam.slice(editGigPrefix.length);
    if (GIG_FORM_START_PARAM_PATTERN.test(publicId)) {
      return { kind: 'resolved', route: buildAdminGigEditRoute(publicId) };
    }

    return { kind: 'failed', reason: 'invalidAction' };
  }

  return { kind: 'failed', reason: 'invalidAction' };
}

export function resolveSuggestLaunchPath(isAdmin: boolean): Route {
  return isAdmin ? ADMIN_GIG_CANDIDATE_NEW_ROUTE : SUGGEST_ROUTE;
}

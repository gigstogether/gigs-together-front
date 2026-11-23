import * as z from 'zod';

import type {
  AdminGigCandidate,
  AdminGigCandidateDraft,
} from '@/app/admin/gig-candidates/_lib/admin-gig-candidate';
import { GIG_TITLE_MAX_LENGTH } from '@/lib/gig.constants';

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: 'Date must be in YYYY-MM-DD format.',
});

const optionalDate = z
  .string()
  .refine((value) => value === '' || dateSchema.safeParse(value).success, {
    message: 'Date must be in YYYY-MM-DD format.',
  });

const optionalUrl = z
  .string()
  .refine((value) => value === '' || z.string().url().safeParse(value).success, {
    message: 'Please enter a valid URL.',
  });

const optionalTitleSchema = z
  .string()
  .trim()
  .max(GIG_TITLE_MAX_LENGTH, {
    message: `Title must be at most ${GIG_TITLE_MAX_LENGTH} characters.`,
  });

const requiredTitleSchema = optionalTitleSchema.min(1, { message: 'Title is required.' });

const sharedFields = {
  communityIds: z
    .array(z.string().min(1))
    .min(1, { message: 'At least one Community is required.' }),
  countryIso: z.string(),
  localityId: z.string(),
  venueIds: z.array(z.string().min(1)),
  endDate: optionalDate,
  ticketsUrl: optionalUrl,
};

function validateDraft(
  values: {
    countryIso: string;
    localityId: string;
    venueIds: string[];
    date: string;
    endDate: string;
  },
  context: z.RefinementCtx,
): void {
  if (values.date && values.endDate && values.endDate < values.date) {
    context.addIssue({
      code: 'custom',
      path: ['endDate'],
      message: 'End Date must be on or after Date.',
    });
  }
  if (values.countryIso.length > 0 && values.localityId.length === 0) {
    context.addIssue({
      code: 'custom',
      path: ['localityId'],
      message: 'Locality is required when a Country is selected.',
    });
  }
  if (values.countryIso.length === 0 && values.localityId.length > 0) {
    context.addIssue({
      code: 'custom',
      path: ['countryIso'],
      message: 'Country is required when a Locality is selected.',
    });
  }
  if (values.localityId.length === 0 && values.venueIds.length > 0) {
    context.addIssue({
      code: 'custom',
      path: ['venueIds'],
      message: 'Locality is required when Venues are selected.',
    });
  }
}

export const gigCandidateDraftFormSchema = z
  .object({
    ...sharedFields,
    title: optionalTitleSchema,
    date: optionalDate,
  })
  .superRefine(validateDraft);

export const createGigCandidateDraftFormSchema = z
  .object({
    ...sharedFields,
    countryIso: z.string().min(1, { message: 'Country is required.' }),
    localityId: z.string().min(1, { message: 'Locality is required.' }),
    title: requiredTitleSchema,
    date: dateSchema,
  })
  .superRefine(validateDraft);

export type AdminGigCandidateDraftFormValues = z.infer<typeof gigCandidateDraftFormSchema>;

export function createDefaultGigCandidateDraftFormValues(
  communityIds: string[],
): AdminGigCandidateDraftFormValues {
  return {
    communityIds: communityIds.length === 1 ? [...communityIds] : [],
    countryIso: 'ES',
    localityId: '',
    venueIds: [],
    title: '',
    date: '',
    endDate: '',
    ticketsUrl: '',
  };
}

export function mapGigCandidateToFormValues(
  gigCandidate: AdminGigCandidate,
): AdminGigCandidateDraftFormValues {
  return {
    communityIds: [...gigCandidate.gigDraft.communityIds],
    countryIso: gigCandidate.locality?.countryIso ?? '',
    localityId: gigCandidate.locality?.id ?? '',
    venueIds: [...(gigCandidate.gigDraft.venueIds ?? [])],
    title: gigCandidate.gigDraft.title ?? '',
    date: gigCandidate.gigDraft.date ?? '',
    endDate: gigCandidate.gigDraft.endDate ?? '',
    ticketsUrl: gigCandidate.gigDraft.ticketsUrl ?? '',
  };
}

export function mapGigCandidateFormValuesToDraft(
  values: AdminGigCandidateDraftFormValues,
): AdminGigCandidateDraft {
  const gigDraft: AdminGigCandidateDraft = {
    communityIds: [...values.communityIds],
  };
  const title = values.title.trim();
  const date = values.date.trim();
  const endDate = values.endDate.trim();
  const ticketsUrl = values.ticketsUrl.trim();

  if (values.venueIds.length > 0) {
    gigDraft.venueIds = [...values.venueIds];
  }
  if (title.length > 0) {
    gigDraft.title = title;
  }
  if (date.length > 0) {
    gigDraft.date = date;
  }
  if (endDate.length > 0) {
    gigDraft.endDate = endDate;
  }
  if (ticketsUrl.length > 0) {
    gigDraft.ticketsUrl = ticketsUrl;
  }
  return gigDraft;
}

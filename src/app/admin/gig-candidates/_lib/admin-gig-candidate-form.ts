import * as z from 'zod';
import { GIG_TITLE_MAX_LENGTH } from '@/lib/gig.constants';
import type { GigFormValues } from '../../gigs/_lib/gig-form.shared';
import type { AdminGigCandidateDraft } from './admin-gig-candidate';

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

const optionalDraftFields = {
  endDate: optionalDate,
  venue: z.string(),
  ticketsUrl: optionalUrl,
};

function validateDateOrder(
  values: { date: string; endDate: string },
  context: z.RefinementCtx,
): void {
  if (values.date && values.endDate && values.endDate < values.date) {
    context.addIssue({
      code: 'custom',
      path: ['endDate'],
      message: 'End Date must be on or after Date.',
    });
  }
}

export const gigCandidateDraftFormSchema = z
  .object({
    title: optionalTitleSchema,
    date: optionalDate,
    city: z.string(),
    country: z.string(),
    ...optionalDraftFields,
  })
  .superRefine(validateDateOrder);

export const createGigCandidateDraftFormSchema = z
  .object({
    title: requiredTitleSchema,
    date: dateSchema,
    city: z.string().min(1, { message: 'City is required.' }),
    country: z.string().min(1, { message: 'Country is required.' }),
    ...optionalDraftFields,
  })
  .superRefine(validateDateOrder);

export const defaultGigCandidateDraftFormValues: GigFormValues = {
  title: '',
  date: '',
  endDate: '',
  city: 'Barcelona',
  country: 'ES',
  venue: '',
  ticketsUrl: '',
};

export function mapGigCandidateDraftToFormValues(gigDraft: AdminGigCandidateDraft): GigFormValues {
  return {
    title: gigDraft.title ?? '',
    date: gigDraft.date ?? '',
    endDate: gigDraft.endDate ?? '',
    city: gigDraft.city ?? '',
    country: gigDraft.country ?? '',
    venue: gigDraft.venue ?? '',
    ticketsUrl: gigDraft.ticketsUrl ?? '',
  };
}

export function mapGigCandidateFormValuesToDraft(values: GigFormValues): AdminGigCandidateDraft {
  const entries = Object.entries(values).flatMap(([field, value]) => {
    const trimmed = value.trim();
    return trimmed ? [[field, trimmed]] : [];
  });
  return Object.fromEntries(entries);
}

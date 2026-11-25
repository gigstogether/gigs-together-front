import * as z from 'zod';
import { GIG_TITLE_MAX_LENGTH } from '@/lib/gig.constants';
import type { CommunityDisplayOption } from '@/lib/community/community-display-option';

const yyyyMmDdSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format.',
  })
  .refine(
    (value) => {
      const date = new Date(`${value}T00:00:00.000Z`);

      return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
    },
    { message: 'Date must be a valid calendar date.' },
  );

const optionalYyyyMmDdSchema = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  yyyyMmDdSchema.optional(),
);

export const suggestGigFormSchema = z
  .object({
    communityId: z.string().min(1, { message: 'Community is required.' }),
    countryIso: z.string().min(1, { message: 'Country is required.' }),
    localityId: z.string().min(1, { message: 'Locality is required.' }),
    venueIds: z.array(z.string().min(1)).default([]),
    title: z
      .string()
      .trim()
      .min(1, { message: 'Title is required.' })
      .max(GIG_TITLE_MAX_LENGTH, {
        message: `Title must be at most ${GIG_TITLE_MAX_LENGTH} characters.`,
      }),
    date: optionalYyyyMmDdSchema,
    endDate: optionalYyyyMmDdSchema,
    ticketsUrl: z.preprocess(
      (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
      z.string().url({ message: 'Please enter a valid ticket URL.' }).optional(),
    ),
  })
  .refine((values) => values.endDate === undefined || values.date !== undefined, {
    message: 'Date is required when End Date is provided.',
    path: ['date'],
  })
  .refine(
    (values) =>
      values.endDate === undefined || values.date === undefined || values.endDate >= values.date,
    {
      message: 'End Date must be on or after Date.',
      path: ['endDate'],
    },
  );

export type SuggestGigFormValues = z.infer<typeof suggestGigFormSchema>;

export type SuggestCommunityOption = CommunityDisplayOption;

export function createDefaultSuggestGigFormValues(
  communityOptions: SuggestCommunityOption[],
): SuggestGigFormValues {
  return {
    communityId: communityOptions.length === 1 ? (communityOptions[0]?.value ?? '') : '',
    countryIso: 'ES',
    localityId: '',
    venueIds: [],
    title: '',
    date: '',
    endDate: '',
    ticketsUrl: '',
  };
}

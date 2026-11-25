import * as z from 'zod';
import { gigDateToYMD } from '@/lib/feed/feed.mapper';
import { GIG_TITLE_MAX_LENGTH } from '@/lib/gig.constants';

export const gigFormSchema = z.object({
  communityIds: z.array(z.string().min(1)).min(1, {
    message: 'Select at least one Community.',
  }),
  countryIso: z.string().length(2, { message: 'Country is required.' }),
  localityId: z.string().min(1, { message: 'Locality is required.' }),
  venueIds: z.array(z.string().min(1)).min(1, {
    message: 'Select at least one Venue.',
  }),
  title: z
    .string()
    .trim()
    .min(1, { message: 'Title is required.' })
    .max(GIG_TITLE_MAX_LENGTH, {
      message: `Title must be at most ${GIG_TITLE_MAX_LENGTH} characters.`,
    }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format.',
  }),
  endDate: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'End Date must be in YYYY-MM-DD format.',
      })
      .optional(),
  ),
  ticketsUrl: z.string().url({
    message: 'Please enter a valid ticket URL.',
  }),
});

export type GigFormValues = z.infer<typeof gigFormSchema>;

export const defaultGigFormValues: GigFormValues = {
  communityIds: [],
  countryIso: '',
  localityId: '',
  venueIds: [],
  title: '',
  date: '',
  endDate: '',
  ticketsUrl: '',
};

export function dateToYMD(date?: string | number): string | undefined {
  if (date === undefined || date === null) return undefined;

  const normalized = typeof date === 'number' ? date : date.trim();
  if (normalized === '') return undefined;

  try {
    return gigDateToYMD(normalized);
  } catch {
    return undefined;
  }
}

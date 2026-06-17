import * as z from 'zod';
import { gigDateToYMD } from '@/lib/feed.mapper';

export const gigFormSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.',
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
  city: z.string().min(1, { message: 'City is required.' }),
  country: z.string().min(1, { message: 'Country is required.' }), // ISO code
  venue: z.string().min(2, { message: 'Please enter venue.' }),
  ticketsUrl: z.string().url({
    message: 'Please enter a valid ticket URL.',
  }),
});

export type GigFormValues = z.infer<typeof gigFormSchema>;

export const defaultGigFormValues: GigFormValues = {
  title: '',
  date: '',
  endDate: '',
  city: 'Barcelona',
  country: 'ES',
  venue: '',
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

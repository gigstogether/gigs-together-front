import * as z from 'zod';

export const suggestGigFormSchema = z.object({
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
  country: z.string().min(1, { message: 'Country is required.' }),
  venue: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().min(2, { message: 'Venue must be at least 2 characters.' }).optional(),
  ),
  ticketsUrl: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().url({ message: 'Please enter a valid ticket URL.' }).optional(),
  ),
});

export type SuggestGigFormValues = z.infer<typeof suggestGigFormSchema>;

export const defaultSuggestGigFormValues: SuggestGigFormValues = {
  title: '',
  date: '',
  endDate: '',
  city: 'Barcelona',
  country: 'ES',
  venue: '',
  ticketsUrl: '',
};

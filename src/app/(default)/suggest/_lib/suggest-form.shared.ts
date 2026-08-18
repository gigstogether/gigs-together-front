import * as z from 'zod';

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

export const suggestGigFormSchema = z
  .object({
    title: z.string().min(2, {
      message: 'Title must be at least 2 characters.',
    }),
    date: yyyyMmDdSchema,
    endDate: z.preprocess(
      (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
      yyyyMmDdSchema.optional(),
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
  })
  .refine((values) => values.endDate === undefined || values.endDate >= values.date, {
    message: 'End Date must be on or after Date.',
    path: ['endDate'],
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

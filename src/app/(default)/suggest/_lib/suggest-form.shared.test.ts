import { describe, expect, it } from 'vitest';

import { suggestGigFormSchema } from './suggest-form.shared';

describe('suggestGigFormSchema', () => {
  it('should accept required title, country, city, and date with optional extras omitted', () => {
    const parsed = suggestGigFormSchema.parse({
      title: 'Band',
      country: 'ES',
      city: 'Barcelona',
      date: '2026-08-01',
      endDate: '',
      venue: '',
      ticketsUrl: '',
    });

    expect(parsed).toEqual({
      title: 'Band',
      country: 'ES',
      city: 'Barcelona',
      date: '2026-08-01',
      endDate: undefined,
      venue: undefined,
      ticketsUrl: undefined,
    });
  });

  it('should reject when date is missing', () => {
    const result = suggestGigFormSchema.safeParse({
      title: 'Band',
      country: 'ES',
      city: 'Barcelona',
      date: '',
    });

    expect(result.success).toBe(false);
  });

  it('should reject invalid optional ticketsUrl when provided', () => {
    const result = suggestGigFormSchema.safeParse({
      title: 'Band',
      country: 'ES',
      city: 'Barcelona',
      date: '2026-08-01',
      ticketsUrl: 'not-a-url',
    });

    expect(result.success).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';

import { createDefaultSuggestGigFormValues, suggestGigFormSchema } from './suggest-form.shared';

describe('suggestGigFormSchema', () => {
  const requiredFields = {
    communityId: 'community-id',
    countryIso: 'ES',
    localityId: 'locality-id',
  };

  it('should accept a one-character title', () => {
    const parsed = suggestGigFormSchema.parse({
      ...requiredFields,
      title: 'B',
      date: '2026-08-01',
    });

    expect(parsed.title).toBe('B');
  });

  it('should reject a title longer than 300 characters', () => {
    const result = suggestGigFormSchema.safeParse({
      ...requiredFields,
      title: 'A'.repeat(301),
      date: '2026-08-01',
    });

    expect(result.success).toBe(false);
  });

  it('should accept required Community, Country, Locality, and title', () => {
    const parsed = suggestGigFormSchema.parse({
      ...requiredFields,
      title: 'Band',
      date: '2026-08-01',
      endDate: '',
      venueIds: [],
      ticketsUrl: '',
    });

    expect(parsed).toEqual({
      title: 'Band',
      ...requiredFields,
      date: '2026-08-01',
      endDate: undefined,
      venueIds: [],
      ticketsUrl: undefined,
    });
  });

  it('should accept when date is missing', () => {
    const parsed = suggestGigFormSchema.parse({
      ...requiredFields,
      title: 'Band',
      date: '',
    });

    expect(parsed.date).toBeUndefined();
  });

  it('should reject when End Date is provided without Date', () => {
    const result = suggestGigFormSchema.safeParse({
      ...requiredFields,
      title: 'Band',
      date: '',
      endDate: '2026-08-02',
    });

    expect(result.success).toBe(false);
  });

  it('should reject invalid optional ticketsUrl when provided', () => {
    const result = suggestGigFormSchema.safeParse({
      ...requiredFields,
      title: 'Band',
      date: '2026-08-01',
      ticketsUrl: 'not-a-url',
    });

    expect(result.success).toBe(false);
  });

  it('should reject a date that does not exist in the calendar', () => {
    const result = suggestGigFormSchema.safeParse({
      ...requiredFields,
      title: 'Band',
      date: '2026-02-31',
    });

    expect(result.success).toBe(false);
  });

  it('should reject an end date before the start date', () => {
    const result = suggestGigFormSchema.safeParse({
      ...requiredFields,
      title: 'Band',
      date: '2026-08-10',
      endDate: '2026-08-09',
    });

    expect(result.success).toBe(false);
  });
});

describe('createDefaultSuggestGigFormValues', () => {
  it('should preselect Community when exactly one option is available', () => {
    const values = createDefaultSuggestGigFormValues([
      { value: 'community-id', label: 'Barcelona' },
    ]);

    expect(values.communityId).toBe('community-id');
  });

  it('should require an explicit Community choice when multiple options are available', () => {
    const values = createDefaultSuggestGigFormValues([
      { value: 'barcelona-id', label: 'Barcelona' },
      { value: 'madrid-id', label: 'Madrid' },
    ]);

    expect(values.communityId).toBe('');
  });
});

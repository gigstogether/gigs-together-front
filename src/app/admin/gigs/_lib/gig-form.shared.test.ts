import { dateToYMD, gigFormSchema } from '@/app/admin/gigs/_lib/gig-form.shared';
import { toLocalYMD } from '@/lib/utils';

describe('dateToYMD', () => {
  it('should return value when date is valid YYYY-MM-DD', () => {
    expect(dateToYMD('2026-04-21')).toBe('2026-04-21');
  });

  it('should return YYYY-MM-DD when date is valid ISO date-time', () => {
    expect(dateToYMD('2026-04-21T19:00:00.000Z')).toBe('2026-04-21');
  });

  it('should return local YYYY-MM-DD when date is unix seconds timestamp string', () => {
    const timestampSeconds = '1700000000';
    expect(dateToYMD(timestampSeconds)).toBe(toLocalYMD(new Date(Number(timestampSeconds) * 1000)));
  });

  it('should return undefined when date is invalid', () => {
    expect(dateToYMD('21/04/2026')).toBeUndefined();
  });

  it('should return undefined when date is empty', () => {
    expect(dateToYMD('   ')).toBeUndefined();
  });
});

describe('gigFormSchema', () => {
  const validGig = {
    title: 'Band',
    date: '2026-04-21',
    endDate: '',
    city: 'Barcelona',
    country: 'ES',
    venue: 'Venue',
    ticketsUrl: 'https://tickets.example/gig',
  };

  it('should accept a one-character title', () => {
    expect(gigFormSchema.parse({ ...validGig, title: 'B' }).title).toBe('B');
  });

  it('should reject a title longer than 300 characters', () => {
    expect(gigFormSchema.safeParse({ ...validGig, title: 'A'.repeat(301) }).success).toBe(false);
  });
});

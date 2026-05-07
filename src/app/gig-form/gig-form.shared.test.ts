import { dateToYMD } from '@/app/gig-form/gig-form.shared';
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

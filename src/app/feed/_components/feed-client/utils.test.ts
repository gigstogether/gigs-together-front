import { formatMonthTitle } from '@/app/feed/_components/feed-client/utils';

describe('formatMonthTitle', () => {
  it('should return month and year when date is valid', () => {
    const result = formatMonthTitle('2026-04-21');
    expect(result).toBe('April 2026');
  });
});

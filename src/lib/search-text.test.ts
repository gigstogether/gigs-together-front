import { toSearchKey } from '@/lib/search-text';

describe('toSearchKey', () => {
  it('should normalize case, surrounding whitespace, and diacritics', () => {
    expect(toSearchKey(' Olímpic ')).toBe('olimpic');
    expect(toSearchKey('OLIMPIC')).toBe('olimpic');
  });
});

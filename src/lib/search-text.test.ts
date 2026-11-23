import { toSearchKey } from '@/lib/search-text';

describe('toSearchKey', () => {
  it('should normalize case, surrounding whitespace, and diacritics', () => {
    expect(toSearchKey(' Olímpic ')).toBe('olimpic');
    expect(toSearchKey('OLIMPIC')).toBe('olimpic');
  });

  it('should normalize punctuation and separators', () => {
    expect(toSearchKey('L’Hospitalet')).toBe('lhospitalet');
    expect(toSearchKey("L'Hospitalet")).toBe('lhospitalet');
    expect(toSearchKey('L Hospitalet')).toBe('lhospitalet');
    expect(toSearchKey('LHospitalet')).toBe('lhospitalet');
    expect(toSearchKey('Paral·lel')).toBe('parallel');
    expect(toSearchKey('Paral-lel')).toBe('parallel');
  });
});

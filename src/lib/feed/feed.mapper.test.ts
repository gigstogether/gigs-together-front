import { gigDateToYMD } from '@/lib/feed/feed.mapper';
import { toLocalYMD } from '@/lib/utils';

describe('gigDateToYMD', () => {
  it('should return value when date is valid YYYY-MM-DD', () => {
    expect(gigDateToYMD('2026-04-21')).toBe('2026-04-21');
  });

  it('should throw when date is invalid YYYY-MM-DD', () => {
    expect(() => gigDateToYMD('2026-02-30')).toThrow('invalid calendar date');
  });

  it('should return YYYY-MM-DD when date is valid ISO date-time', () => {
    expect(gigDateToYMD('2026-04-21T19:00:00.000Z')).toBe('2026-04-21');
  });

  it('should throw when date is malformed ISO date-time', () => {
    expect(() => gigDateToYMD('2026-04-21T25:99:00.000Z')).toThrow('malformed ISO date-time');
  });

  it('should return local YYYY-MM-DD when date is unix seconds timestamp string', () => {
    const timestampSeconds = '1700000000';
    expect(gigDateToYMD(timestampSeconds)).toBe(
      toLocalYMD(new Date(Number(timestampSeconds) * 1000)),
    );
  });

  it('should return local YYYY-MM-DD when date is unix milliseconds timestamp string', () => {
    const timestampMilliseconds = '1700000000000';
    expect(gigDateToYMD(timestampMilliseconds)).toBe(
      toLocalYMD(new Date(Number(timestampMilliseconds))),
    );
  });

  it('should return local YYYY-MM-DD when date is unix seconds timestamp number', () => {
    const timestampSeconds = 1700000000;
    expect(gigDateToYMD(timestampSeconds)).toBe(toLocalYMD(new Date(timestampSeconds * 1000)));
  });

  it('should throw when date is unsupported format', () => {
    expect(() => gigDateToYMD('21/04/2026')).toThrow('expected YYYY-MM-DD');
  });

  it('should throw when date is empty', () => {
    expect(() => gigDateToYMD('   ')).toThrow('value is empty');
  });

  it('should throw when unix timestamp has unsupported precision', () => {
    expect(() => gigDateToYMD('170000000000')).toThrow('10 (seconds) or 13 (milliseconds)');
  });
});

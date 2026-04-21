import { describe, expect, it } from 'vitest';
import {
  isV1GigAroundGetResponseBody,
  isV1GigByPublicIdGetResponseBody,
  isV1GigDatesGetResponseBody,
} from '@/app/feed/_components/feed-client/utils';

describe('isV1GigDatesGetResponseBody', () => {
  it('should return true when v1/gig/dates response shape is valid', () => {
    const payload = { dates: ['2026-04-21', 42] };
    const result = isV1GigDatesGetResponseBody(payload);
    expect(result).toBe(true);
  });

  it('should return false when v1/gig/dates response shape is invalid', () => {
    const payload = { dates: [{ value: '2026-04-21' }] };
    const result = isV1GigDatesGetResponseBody(payload);
    expect(result).toBe(false);
  });
});

describe('isV1GigAroundGetResponseBody', () => {
  it('should return true when v1/gig/around response shape is valid', () => {
    const payload = {
      before: [],
      after: [],
      prevCursor: 'prev',
      nextCursor: 'next',
    };
    const result = isV1GigAroundGetResponseBody(payload);
    expect(result).toBe(true);
  });

  it('should return false when v1/gig/around response shape is invalid', () => {
    const payload = {
      before: [],
      after: {},
    };
    const result = isV1GigAroundGetResponseBody(payload);
    expect(result).toBe(false);
  });
});

describe('isV1GigByPublicIdGetResponseBody', () => {
  it('should return true when v1/gig/date/:publicId response shape is valid', () => {
    const payload = { date: '2026-04-21' };
    const result = isV1GigByPublicIdGetResponseBody(payload);
    expect(result).toBe(true);
  });

  it('should return false when v1/gig/date/:publicId response shape is invalid', () => {
    const payload = { date: 42 };
    const result = isV1GigByPublicIdGetResponseBody(payload);
    expect(result).toBe(false);
  });
});

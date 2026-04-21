import { apiRequest } from '@/lib/api';
import {
  fetchFeedAnchorYmdByPublicId,
  fetchFeedAroundWindow,
  fetchFeedAvailableDates,
  fetchFeedPage,
} from '@/app/feed/_components/feed-client/feedApi';
import { toLocalYMD } from '@/lib/utils';

vi.mock('@/lib/api', () => ({
  apiRequest: vi.fn(),
}));

describe('fetchFeedPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should request feed page with location and cursor when params are provided', async () => {
    const apiRequestMock = vi.mocked(apiRequest);
    apiRequestMock.mockResolvedValueOnce({
      gigs: [],
      prevCursor: 'prev',
      nextCursor: 'next',
    });

    const result = await fetchFeedPage({
      limit: 10,
      cursor: 'abc',
      direction: 'prev',
      country: 'es',
      city: 'barcelona',
    });

    expect(result).toEqual({
      gigs: [],
      prevCursor: 'prev',
      nextCursor: 'next',
    });
    expect(apiRequestMock).toHaveBeenCalledWith(
      'v1/gig?limit=10&cursor=abc&direction=prev&country=es&city=barcelona',
      'GET',
      undefined,
      { signal: undefined },
    );
  });
});

describe('fetchFeedAroundWindow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should request around window when anchor and limits are provided', async () => {
    const apiRequestMock = vi.mocked(apiRequest);
    apiRequestMock.mockResolvedValueOnce({
      before: [],
      after: [],
      prevCursor: 'prev',
      nextCursor: 'next',
    });

    const result = await fetchFeedAroundWindow({
      anchorYmd: '2026-04-21',
      beforeLimit: 10,
      afterLimit: 10,
      country: 'es',
      city: 'barcelona',
    });

    expect(result).toEqual({
      before: [],
      after: [],
      prevCursor: 'prev',
      nextCursor: 'next',
    });
    expect(apiRequestMock).toHaveBeenCalledWith(
      'v1/gig/around?anchor=2026-04-21&beforeLimit=10&afterLimit=10&country=es&city=barcelona',
      'GET',
      undefined,
      { signal: undefined },
    );
  });
});

describe('fetchFeedAnchorYmdByPublicId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return normalized anchor date when publicId is provided', async () => {
    const apiRequestMock = vi.mocked(apiRequest);
    apiRequestMock.mockResolvedValueOnce({ date: '2026-04-21T19:00:00.000Z' });

    const result = await fetchFeedAnchorYmdByPublicId({ publicId: 'abc/def' });

    expect(result).toBe('2026-04-21');
    expect(apiRequestMock).toHaveBeenCalledWith('v1/gig/date/abc%2Fdef', 'GET', undefined, {
      signal: undefined,
    });
  });
});

describe('fetchFeedAvailableDates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return unique sorted dates when response contains mixed raw date formats', async () => {
    const unixSeconds = 1700000000;
    const apiRequestMock = vi.mocked(apiRequest);
    apiRequestMock.mockResolvedValueOnce({
      dates: ['2026-04-21', '2026-04-21T12:00:00.000Z', unixSeconds],
    });

    const result = await fetchFeedAvailableDates({ country: 'es', city: 'barcelona' });

    expect(result).toEqual(
      Array.from(new Set(['2026-04-21', toLocalYMD(new Date(unixSeconds * 1000))])).sort(),
    );
    expect(apiRequestMock).toHaveBeenCalledWith(
      'v1/gig/dates?country=es&city=barcelona',
      'GET',
      undefined,
      { signal: undefined },
    );
  });
});

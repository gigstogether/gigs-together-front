import {
  fetchFeedAnchorYmdByPublicId,
  fetchFeedAround,
  fetchFeedAvailableDates,
  fetchFeedPage,
} from '@/app/feed/_lib/feedApi';

const { apiPublicRequestMock } = vi.hoisted(() => ({
  apiPublicRequestMock: vi.fn(),
}));

vi.mock('@/lib/api-public', () => ({
  apiPublicRequest: apiPublicRequestMock,
}));

describe('fetchFeedPage', () => {
  beforeEach(() => {
    apiPublicRequestMock.mockReset();
  });

  it('should request feed page with location and cursor when params are provided', async () => {
    apiPublicRequestMock.mockResolvedValueOnce({
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
    expect(apiPublicRequestMock).toHaveBeenCalledWith(
      'v1/gig?limit=10&cursor=abc&direction=prev&country=es&city=barcelona',
      'GET',
      undefined,
      undefined,
    );
  });

  it('should pass requestInit when requestInit is provided', async () => {
    apiPublicRequestMock.mockResolvedValueOnce({
      gigs: [],
      prevCursor: undefined,
      nextCursor: undefined,
    });

    await fetchFeedPage({
      limit: 10,
      requestInit: {
        next: {
          revalidate: 60,
        },
      },
    });

    expect(apiPublicRequestMock).toHaveBeenCalledWith('v1/gig?limit=10', 'GET', undefined, {
      next: {
        revalidate: 60,
      },
    });
  });

  it('should merge signal over requestInit when both are provided', async () => {
    const signal = new AbortController().signal;
    apiPublicRequestMock.mockResolvedValueOnce({
      gigs: [],
      prevCursor: undefined,
      nextCursor: undefined,
    });

    await fetchFeedPage({
      limit: 10,
      signal,
      requestInit: {
        next: {
          revalidate: 60,
        },
      },
    });

    expect(apiPublicRequestMock).toHaveBeenCalledWith('v1/gig?limit=10', 'GET', undefined, {
      next: {
        revalidate: 60,
      },
      signal,
    });
  });
});

describe('fetchFeedAvailableDates', () => {
  beforeEach(() => {
    apiPublicRequestMock.mockReset();
  });

  it('should request gig dates for a location when params are provided', async () => {
    apiPublicRequestMock.mockResolvedValueOnce({
      dates: ['2026-04-21', '2026-05-01'],
    });

    const result = await fetchFeedAvailableDates({
      country: 'es',
      city: 'barcelona',
    });

    expect(result).toEqual({
      dates: ['2026-04-21', '2026-05-01'],
    });
    expect(apiPublicRequestMock).toHaveBeenCalledWith(
      'v1/gig/dates?country=es&city=barcelona',
      'GET',
      undefined,
      undefined,
    );
  });
});

describe('fetchFeedAround', () => {
  beforeEach(() => {
    apiPublicRequestMock.mockReset();
  });

  it('should request around endpoint when anchor and limits are provided', async () => {
    apiPublicRequestMock.mockResolvedValueOnce({
      before: [],
      after: [],
      prevCursor: 'prev',
      nextCursor: 'next',
    });

    const result = await fetchFeedAround({
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
    expect(apiPublicRequestMock).toHaveBeenCalledWith(
      'v1/gig/around?anchor=2026-04-21&beforeLimit=10&afterLimit=10&country=es&city=barcelona',
      'GET',
      undefined,
      undefined,
    );
  });
});

describe('fetchFeedAnchorYmdByPublicId', () => {
  beforeEach(() => {
    apiPublicRequestMock.mockReset();
  });

  it('should return normalized anchor date when publicId is provided', async () => {
    apiPublicRequestMock.mockResolvedValueOnce({ date: '2026-04-21T19:00:00.000Z' });

    const result = await fetchFeedAnchorYmdByPublicId({ publicId: 'abc/def' });

    expect(result).toBe('2026-04-21');
    expect(apiPublicRequestMock).toHaveBeenCalledWith(
      'v1/gig/date/abc%2Fdef',
      'GET',
      undefined,
      undefined,
    );
  });
});

const { getFeedApiPublicRequestMock } = vi.hoisted(() => ({
  getFeedApiPublicRequestMock: vi.fn(),
}));

vi.mock('server-only', () => ({}));

vi.mock('@/lib/api', () => ({
  apiPublicRequest: getFeedApiPublicRequestMock,
}));

describe('getFeed', () => {
  beforeEach(() => {
    getFeedApiPublicRequestMock.mockReset();
    getFeedApiPublicRequestMock.mockResolvedValue({
      gigs: [],
      prevCursor: undefined,
      nextCursor: undefined,
    });
  });

  it('should fetch public feed with omit-compatible wrapper and ISR revalidate', async () => {
    const { getFeed } = await import('@/lib/feed.server');

    await getFeed({
      limit: 10,
      country: 'es',
      city: 'barcelona',
    });

    expect(getFeedApiPublicRequestMock).toHaveBeenCalledWith(
      'v1/gig?limit=10&country=es&city=barcelona',
      'GET',
      undefined,
      {
        next: {
          revalidate: 60,
        },
      },
    );
  });
});

describe('getFeedAvailableDates', () => {
  beforeEach(() => {
    getFeedApiPublicRequestMock.mockReset();
    getFeedApiPublicRequestMock.mockResolvedValue({
      dates: ['2026-04-21', '2026-05-01'],
    });
  });

  it('should fetch calendar dates with ISR revalidate and return sorted unique YMD values', async () => {
    const { getFeedAvailableDates } = await import('@/lib/feed.server');

    const result = await getFeedAvailableDates({
      country: 'es',
      city: 'barcelona',
    });

    expect(result).toEqual(['2026-04-21', '2026-05-01']);
    expect(getFeedApiPublicRequestMock).toHaveBeenCalledWith(
      'v1/gig/dates?country=es&city=barcelona',
      'GET',
      undefined,
      {
        next: {
          revalidate: 60,
        },
      },
    );
  });

  it('should normalize mixed raw date formats into sorted unique YMD values', async () => {
    const unixSeconds = 1_700_000_000;
    getFeedApiPublicRequestMock.mockResolvedValueOnce({
      dates: ['2026-04-21', '2026-04-21T12:00:00.000Z', unixSeconds],
    });

    const { getFeedAvailableDates } = await import('@/lib/feed.server');
    const { toLocalYMD } = await import('@/lib/utils');

    const result = await getFeedAvailableDates({
      country: 'es',
      city: 'barcelona',
    });

    expect(result).toEqual(
      Array.from(new Set(['2026-04-21', toLocalYMD(new Date(unixSeconds * 1000))])).sort(),
    );
  });
});

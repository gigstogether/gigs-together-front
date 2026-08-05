const { feedServerApiPublicRequestMock } = vi.hoisted(() => ({
  feedServerApiPublicRequestMock: vi.fn(),
}));

vi.mock('server-only', () => ({}));

vi.mock('@/lib/api-public', () => ({
  apiPublicRequest: feedServerApiPublicRequestMock,
}));

describe('getFeed', () => {
  beforeEach(() => {
    feedServerApiPublicRequestMock.mockReset();
    feedServerApiPublicRequestMock.mockResolvedValue({
      gigs: [],
      prevCursor: undefined,
      nextCursor: undefined,
    });
  });

  it('should pass ISR revalidate options when loading the feed', async () => {
    const { getFeed } = await import('@/app/feed/_lib/feed.server');

    await getFeed({
      limit: 10,
      country: 'es',
      city: 'barcelona',
    });

    expect(feedServerApiPublicRequestMock).toHaveBeenCalledOnce();
    expect(feedServerApiPublicRequestMock.mock.calls[0]?.[3]).toEqual({
      next: {
        revalidate: 60,
      },
    });
  });
});

describe('getAvailableGigDates', () => {
  beforeEach(() => {
    feedServerApiPublicRequestMock.mockReset();
    feedServerApiPublicRequestMock.mockResolvedValue({
      dates: ['2026-04-21', '2026-05-01'],
    });
  });

  it('should pass ISR revalidate options and return sorted unique YMD values', async () => {
    const { getAvailableGigDates } = await import('@/app/feed/_lib/feed.server');

    const result = await getAvailableGigDates({
      country: 'es',
      city: 'barcelona',
    });

    expect(result).toEqual(['2026-04-21', '2026-05-01']);
    expect(feedServerApiPublicRequestMock).toHaveBeenCalledOnce();
    expect(feedServerApiPublicRequestMock.mock.calls[0]?.[3]).toEqual({
      next: {
        revalidate: 60,
      },
    });
  });
});

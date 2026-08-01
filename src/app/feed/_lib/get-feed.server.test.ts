const { getFeedServerApiPublicRequestMock } = vi.hoisted(() => ({
  getFeedServerApiPublicRequestMock: vi.fn(),
}));

vi.mock('server-only', () => ({}));

vi.mock('@/lib/api', () => ({
  apiPublicRequest: getFeedServerApiPublicRequestMock,
}));

describe('getFeed', () => {
  beforeEach(() => {
    getFeedServerApiPublicRequestMock.mockReset();
    getFeedServerApiPublicRequestMock.mockResolvedValue({
      gigs: [],
      prevCursor: undefined,
      nextCursor: undefined,
    });
  });

  it('should fetch public feed with omit-compatible wrapper and ISR revalidate', async () => {
    const { getFeed } = await import('@/app/feed/_lib/get-feed.server');

    await getFeed({
      limit: 10,
      country: 'es',
      city: 'barcelona',
    });

    expect(getFeedServerApiPublicRequestMock).toHaveBeenCalledWith(
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

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

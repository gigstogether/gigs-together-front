const { getAvailableGigDatesApiPublicRequestMock } = vi.hoisted(() => ({
  getAvailableGigDatesApiPublicRequestMock: vi.fn(),
}));

vi.mock('server-only', () => ({}));

vi.mock('@/lib/api', () => ({
  apiPublicRequest: getAvailableGigDatesApiPublicRequestMock,
}));

describe('getAvailableGigDates', () => {
  beforeEach(() => {
    getAvailableGigDatesApiPublicRequestMock.mockReset();
    getAvailableGigDatesApiPublicRequestMock.mockResolvedValue({
      dates: ['2026-04-21', '2026-05-01'],
    });
  });

  it('should fetch calendar dates with ISR revalidate and return sorted unique YMD values', async () => {
    const { getAvailableGigDates } = await import('@/app/feed/_lib/get-available-gig-dates.server');

    const result = await getAvailableGigDates({
      country: 'es',
      city: 'barcelona',
    });

    expect(result).toEqual(['2026-04-21', '2026-05-01']);
    expect(getAvailableGigDatesApiPublicRequestMock).toHaveBeenCalledWith(
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
    getAvailableGigDatesApiPublicRequestMock.mockResolvedValueOnce({
      dates: ['2026-04-21', '2026-04-21T12:00:00.000Z', unixSeconds],
    });

    const { getAvailableGigDates } = await import('@/app/feed/_lib/get-available-gig-dates.server');
    const { toLocalYMD } = await import('@/lib/utils');

    const result = await getAvailableGigDates({
      country: 'es',
      city: 'barcelona',
    });

    expect(result).toEqual(
      Array.from(new Set(['2026-04-21', toLocalYMD(new Date(unixSeconds * 1000))])).sort(),
    );
  });
});

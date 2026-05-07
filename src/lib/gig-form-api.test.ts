import { apiRequest } from '@/lib/api';
import { lookupGig } from '@/lib/gig-form-api';

vi.mock('@/lib/api', () => ({
  apiRequest: vi.fn(),
}));

describe('lookupGig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call lookup endpoint with trimmed name and location when request is valid', async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({
      gig: null,
    });

    await lookupGig({
      name: '  Arctic Monkeys  ',
      location: '  Barcelona, ES  ',
    });

    expect(vi.mocked(apiRequest)).toHaveBeenCalledWith(
      'v1/gig/lookup',
      'POST',
      {
        name: 'Arctic Monkeys',
        location: 'Barcelona, ES',
      },
      { signal: undefined },
    );
  });

  it('should return normalized lookup dates when API returns a matching gig', async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({
      gig: {
        title: 'Arctic Monkeys',
        date: '2026-07-01T20:00:00.000Z',
        endDate: '2026-07-02T22:00:00.000Z',
        city: 'Barcelona',
        country: 'es',
        venue: 'Razzmatazz',
        ticketsUrl: 'https://tickets.example/gig',
        posterUrl: 'https://images.example/poster.png',
      },
    });

    const result = await lookupGig({
      name: 'Arctic Monkeys',
      location: 'Barcelona, ES',
    });

    expect(result).toEqual({
      title: 'Arctic Monkeys',
      date: '2026-07-01',
      endDate: '2026-07-02',
      city: 'Barcelona',
      country: 'es',
      venue: 'Razzmatazz',
      ticketsUrl: 'https://tickets.example/gig',
      posterUrl: 'https://images.example/poster.png',
    });
  });

  it('should return null when API reports no matching gig', async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({
      gig: null,
    });

    const result = await lookupGig({
      name: 'Arctic Monkeys',
      location: 'Barcelona, ES',
    });

    expect(result).toBeNull();
  });

  it('should throw when API returns a matching gig without date', async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({
      gig: {
        title: 'Arctic Monkeys',
      },
    });

    const action = lookupGig({
      name: 'Arctic Monkeys',
      location: 'Barcelona, ES',
    });

    await expect(action).rejects.toBeInstanceOf(Error);
    await expect(action).rejects.toMatchObject({
      message: 'Lookup did not return a date',
    });
  });

  it('should throw when API returns an invalid lookup date', async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({
      gig: {
        title: 'Arctic Monkeys',
        date: 'not-a-date',
      },
    });

    const action = lookupGig({
      name: 'Arctic Monkeys',
      location: 'Barcelona, ES',
    });

    await expect(action).rejects.toBeInstanceOf(Error);
    await expect(action).rejects.toMatchObject({
      message: 'Invalid API response: "gig.date" must be YYYY-MM-DD (or ISO)',
    });
  });

  it('should throw when name is blank after trimming', async () => {
    const action = lookupGig({
      name: '   ',
      location: 'Barcelona, ES',
    });

    await expect(action).rejects.toBeInstanceOf(Error);
    await expect(action).rejects.toMatchObject({
      message: 'Invalid lookup request: "name" is required',
    });
  });

  it('should throw when location is blank after trimming', async () => {
    const action = lookupGig({
      name: 'Arctic Monkeys',
      location: '   ',
    });

    await expect(action).rejects.toBeInstanceOf(Error);
    await expect(action).rejects.toMatchObject({
      message: 'Invalid lookup request: "location" is required',
    });
  });

  it('should throw when API response omits gig field', async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({});

    const action = lookupGig({
      name: 'Arctic Monkeys',
      location: 'Barcelona, ES',
    });

    await expect(action).rejects.toBeInstanceOf(Error);
    await expect(action).rejects.toMatchObject({
      message: 'Invalid API response: "gig" is required (use null when there is no match)',
    });
  });
});

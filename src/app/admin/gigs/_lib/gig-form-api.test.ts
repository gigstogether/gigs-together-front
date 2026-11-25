// @vitest-environment jsdom

import { updateGig } from '@/app/admin/gigs/_lib/gig-form-api';

const apiClientRequestMock = vi.fn();

vi.mock('@/lib/api-session-client', () => ({
  apiClientRequest: (...args: unknown[]) => apiClientRequestMock(...args),
}));

describe('updateGig', () => {
  beforeEach(() => {
    apiClientRequestMock.mockReset();
    apiClientRequestMock.mockResolvedValue({ publicId: 'radiohead-2026-06-12' });
  });

  it('should send expectedVersion with a JSON edit', async () => {
    await updateGig({
      publicId: 'radiohead-2026-06-12',
      expectedVersion: 4,
      gig: {
        communityIds: ['community-id'],
        venueIds: ['venue-id'],
        title: 'Radiohead',
        date: '2026-06-12',
        ticketsUrl: 'https://tickets.example/radiohead',
      },
      poster: { mode: 'url', file: null, url: '' },
    });

    expect(apiClientRequestMock).toHaveBeenCalledWith(
      'v1/admin/gigs/radiohead-2026-06-12',
      'PATCH',
      {
        gig: {
          communityIds: ['community-id'],
          venueIds: ['venue-id'],
          title: 'Radiohead',
          date: '2026-06-12',
          endDate: undefined,
          ticketsUrl: 'https://tickets.example/radiohead',
        },
        expectedVersion: 4,
      },
    );
  });

  it('should send expectedVersion with a multipart edit', async () => {
    const posterFile = new File(['poster'], 'poster.png', { type: 'image/png' });

    await updateGig({
      publicId: 'radiohead-2026-06-12',
      expectedVersion: 7,
      gig: {
        communityIds: ['community-id'],
        venueIds: ['venue-id'],
        title: 'Radiohead',
        date: '2026-06-12',
        ticketsUrl: 'https://tickets.example/radiohead',
      },
      poster: { mode: 'upload', file: posterFile, url: '' },
    });

    const body = apiClientRequestMock.mock.calls[0]?.[2];
    expect(body).toBeInstanceOf(FormData);
    if (!(body instanceof FormData)) {
      throw new Error('Expected multipart Gig edit body');
    }
    expect(body.get('expectedVersion')).toBe('7');
    expect(body.get('posterFile')).toBe(posterFile);
  });
});

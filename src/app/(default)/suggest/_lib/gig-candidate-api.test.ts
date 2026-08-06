import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiClientRequestMock } = vi.hoisted(() => ({
  apiClientRequestMock: vi.fn(),
}));

vi.mock('@/lib/api-session-client', () => ({
  apiClientRequest: apiClientRequestMock,
}));

import { createGigCandidate } from './gig-candidate-api';

describe('createGigCandidate', () => {
  beforeEach(() => {
    apiClientRequestMock.mockReset();
  });

  it('should POST JSON gig payload and parse id', async () => {
    apiClientRequestMock.mockResolvedValue({ id: '507f1f77bcf86cd799439099' });

    const result = await createGigCandidate({
      gig: {
        title: 'Band',
        date: '2026-08-01',
        city: 'Barcelona',
        country: 'ES',
      },
      poster: { mode: 'url', file: null, url: '' },
    });

    expect(apiClientRequestMock).toHaveBeenCalledWith('v1/gig-candidate', 'POST', {
      gig: {
        title: 'Band',
        date: '2026-08-01',
        city: 'Barcelona',
        country: 'ES',
        endDate: undefined,
        venue: undefined,
        ticketsUrl: undefined,
      },
    });
    expect(result).toEqual({ id: '507f1f77bcf86cd799439099' });
  });

  it('should POST JSON with posterUrl when url mode has a valid URL', async () => {
    apiClientRequestMock.mockResolvedValue({ id: '507f1f77bcf86cd799439099' });

    await createGigCandidate({
      gig: {
        title: 'Band',
        date: '2026-08-01',
        city: 'Barcelona',
        country: 'ES',
      },
      poster: { mode: 'url', file: null, url: 'https://cdn.example/poster.jpg' },
    });

    expect(apiClientRequestMock).toHaveBeenCalledWith('v1/gig-candidate', 'POST', {
      gig: {
        title: 'Band',
        date: '2026-08-01',
        city: 'Barcelona',
        country: 'ES',
        endDate: undefined,
        venue: undefined,
        ticketsUrl: undefined,
        posterUrl: 'https://cdn.example/poster.jpg',
      },
    });
  });

  it('should POST FormData when poster mode is upload', async () => {
    apiClientRequestMock.mockResolvedValue({ id: '507f1f77bcf86cd799439099' });
    const file = new File(['img'], 'poster.png', { type: 'image/png' });

    await createGigCandidate({
      gig: {
        title: 'Band',
        date: '2026-08-01',
        city: 'Barcelona',
        country: 'ES',
      },
      poster: { mode: 'upload', file, url: '' },
    });

    expect(apiClientRequestMock).toHaveBeenCalledWith(
      'v1/gig-candidate',
      'POST',
      expect.any(FormData),
    );
    const fd = apiClientRequestMock.mock.calls[0]?.[2];
    expect(fd).toBeInstanceOf(FormData);
    if (!(fd instanceof FormData)) {
      throw new Error('Expected FormData body');
    }
    expect(fd.get('posterFile')).toBe(file);
    expect(fd.get('gig')).toBe(
      JSON.stringify({
        title: 'Band',
        date: '2026-08-01',
        city: 'Barcelona',
        country: 'ES',
      }),
    );
  });

  it('should throw when poster URL is invalid', async () => {
    await expect(
      createGigCandidate({
        gig: {
          title: 'Band',
          date: '2026-08-01',
          city: 'Barcelona',
          country: 'ES',
        },
        poster: { mode: 'url', file: null, url: 'not-a-url' },
      }),
    ).rejects.toThrow();
    expect(apiClientRequestMock).not.toHaveBeenCalled();
  });

  it('should throw when response is not an object', async () => {
    apiClientRequestMock.mockResolvedValue('nope');

    await expect(
      createGigCandidate({
        gig: {
          title: 'Band',
          date: '2026-08-01',
          city: 'Barcelona',
          country: 'ES',
        },
        poster: { mode: 'url', file: null, url: '' },
      }),
    ).rejects.toThrow(/expected an object/);
  });

  it('should throw when response id is missing', async () => {
    apiClientRequestMock.mockResolvedValue({});

    await expect(
      createGigCandidate({
        gig: {
          title: 'Band',
          date: '2026-08-01',
          city: 'Barcelona',
          country: 'ES',
        },
        poster: { mode: 'url', file: null, url: '' },
      }),
    ).rejects.toThrow(/"id"/);
  });
});

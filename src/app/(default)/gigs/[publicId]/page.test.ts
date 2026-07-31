import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockRedirect } = vi.hoisted(() => ({
  mockRedirect: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}));

import GigPublicPage from './page';

describe('GigPublicPage', () => {
  beforeEach(() => {
    mockRedirect.mockReset();
  });

  it('should redirect to the default feed anchor when publicId is present', async () => {
    await GigPublicPage({
      params: Promise.resolve({ publicId: 'radiohead-barcelona-2026-06-12' }),
    });

    expect(mockRedirect).toHaveBeenCalledWith('/feed/es/barcelona#radiohead-barcelona-2026-06-12');
  });

  it('should redirect to the default feed route when publicId is blank', async () => {
    await GigPublicPage({
      params: Promise.resolve({ publicId: '   ' }),
    });

    expect(mockRedirect).toHaveBeenCalledWith('/feed/es/barcelona');
  });
});

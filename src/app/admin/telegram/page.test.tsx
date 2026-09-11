// @vitest-environment jsdom

import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AdminTelegramPage from './page';

const navigationMocks = vi.hoisted(() => ({
  replace: vi.fn(),
}));
const telegramMocks = vi.hoisted(() => ({
  getStartParam: vi.fn<() => string>(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: navigationMocks.replace }),
}));

vi.mock('@/lib/telegram/telegram-webapp', () => ({
  getTelegramStartParam: telegramMocks.getStartParam,
}));

describe('AdminTelegramPage', () => {
  beforeEach(() => {
    navigationMocks.replace.mockReset();
    telegramMocks.getStartParam.mockReset();
  });

  it('should route a Gig action to its admin editor', async () => {
    telegramMocks.getStartParam.mockReturnValue('editGig-radiohead-barcelona-2026-06-12');

    render(<AdminTelegramPage />);

    await waitFor(() => {
      expect(navigationMocks.replace).toHaveBeenCalledWith(
        '/admin/gigs/radiohead-barcelona-2026-06-12/edit',
      );
    });
  });

  it('should route a GigCandidate action to its admin editor', async () => {
    telegramMocks.getStartParam.mockReturnValue('editGigCandidate-507f1f77bcf86cd799439099');

    render(<AdminTelegramPage />);

    await waitFor(() => {
      expect(navigationMocks.replace).toHaveBeenCalledWith(
        '/admin/gig-candidates/507f1f77bcf86cd799439099/edit',
      );
    });
  });

  it('should route to the new GigCandidate form when an action is missing', async () => {
    telegramMocks.getStartParam.mockReturnValue('');

    render(<AdminTelegramPage />);

    await waitFor(() => {
      expect(navigationMocks.replace).toHaveBeenCalledWith('/admin/gig-candidates/new');
    });
  });
});

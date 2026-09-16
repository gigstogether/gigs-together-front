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
const toastMocks = vi.hoisted(() => ({
  toast: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: navigationMocks.replace }),
}));

vi.mock('@/lib/telegram/telegram-webapp', () => ({
  getTelegramStartParam: telegramMocks.getStartParam,
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: toastMocks.toast,
}));

describe('AdminTelegramPage', () => {
  beforeEach(() => {
    navigationMocks.replace.mockReset();
    telegramMocks.getStartParam.mockReset();
    toastMocks.toast.mockReset();
  });

  it('should route a Gig action to its admin editor', async () => {
    telegramMocks.getStartParam.mockReturnValue('editGig-radiohead-barcelona-2026-06-12');

    render(<AdminTelegramPage />);

    await waitFor(() => {
      expect(navigationMocks.replace).toHaveBeenCalledWith(
        '/admin/gigs/radiohead-barcelona-2026-06-12/edit',
      );
      expect(toastMocks.toast).not.toHaveBeenCalled();
    });
  });

  it('should route a GigCandidate action to its admin editor', async () => {
    telegramMocks.getStartParam.mockReturnValue('editGigCandidate-507f1f77bcf86cd799439099');

    render(<AdminTelegramPage />);

    await waitFor(() => {
      expect(navigationMocks.replace).toHaveBeenCalledWith(
        '/admin/gig-candidates/507f1f77bcf86cd799439099/edit',
      );
      expect(toastMocks.toast).not.toHaveBeenCalled();
    });
  });

  it('should route an open Gig action to its admin detail page', async () => {
    telegramMocks.getStartParam.mockReturnValue('openGig-radiohead-barcelona-2026-06-12');

    render(<AdminTelegramPage />);

    await waitFor(() => {
      expect(navigationMocks.replace).toHaveBeenCalledWith(
        '/admin/gigs/radiohead-barcelona-2026-06-12',
      );
      expect(toastMocks.toast).not.toHaveBeenCalled();
    });
  });

  it('should route an open GigCandidate action to its admin detail page', async () => {
    telegramMocks.getStartParam.mockReturnValue('openGigCandidate-507f1f77bcf86cd799439099');

    render(<AdminTelegramPage />);

    await waitFor(() => {
      expect(navigationMocks.replace).toHaveBeenCalledWith(
        '/admin/gig-candidates/507f1f77bcf86cd799439099',
      );
      expect(toastMocks.toast).not.toHaveBeenCalled();
    });
  });

  it('should report a missing action before routing to admin', async () => {
    telegramMocks.getStartParam.mockReturnValue('');

    render(<AdminTelegramPage />);

    await waitFor(() => {
      expect(toastMocks.toast).toHaveBeenCalledWith({
        title: 'Telegram action is missing',
        description:
          'This admin Mini App link requires an admin action. Open it from a Gig or GigCandidate admin link.',
        variant: 'destructive',
      });
      expect(navigationMocks.replace).toHaveBeenCalledWith('/admin');
    });
  });

  it('should report an invalid action before routing to admin', async () => {
    telegramMocks.getStartParam.mockReturnValue('editGig-bad/value');

    render(<AdminTelegramPage />);

    await waitFor(() => {
      expect(toastMocks.toast).toHaveBeenCalledWith({
        title: 'Invalid Telegram action',
        description:
          'This admin Mini App link contains an unsupported or malformed action. Open it from a Gig or GigCandidate admin link.',
        variant: 'destructive',
      });
      expect(navigationMocks.replace).toHaveBeenCalledWith('/admin');
    });
  });
});

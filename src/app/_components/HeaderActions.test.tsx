import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import HeaderActions from '@/app/_components/HeaderActions';

vi.mock('@/app/_components/HeaderSignInModal', () => ({
  default: () => null,
}));

vi.mock('@/env/client-env', () => ({
  clientEnv: {
    telegramUrl: undefined,
    githubUrl: undefined,
    suggestGigLink: undefined,
    telegramBotUsername: 'bot',
    isAuthEnabled: true,
  },
}));

vi.mock('@/hooks/use-telegram-auth', () => ({
  useTelegramAuth: vi.fn(),
}));

vi.mock('@/hooks/use-telegram-mini-app-env', () => ({
  useTelegramMiniAppEnv: () => 'browser' as const,
}));

import { useTelegramAuth } from '@/hooks/use-telegram-auth';

describe('HeaderActions', () => {
  beforeEach(() => {
    vi.mocked(useTelegramAuth).mockReturnValue({
      authState: null,
      isLoadingAuthState: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });
  });

  function clickFirstMenuTrigger(): void {
    fireEvent.click(screen.getAllByRole('button', { name: 'Menu' })[0]!);
  }

  it('should show Admin panel in menu below auth when user is admin', async () => {
    vi.mocked(useTelegramAuth).mockReturnValue({
      authState: { displayLabel: '@admin', isAdmin: true },
      isLoadingAuthState: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <HeaderActions
        country="es"
        city="barcelona"
      />,
    );

    clickFirstMenuTrigger();

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Admin panel' })).toHaveAttribute('href', '/admin');
      expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
    });
  });

  it('should omit Admin panel in menu when user is not admin', async () => {
    vi.mocked(useTelegramAuth).mockReturnValue({
      authState: { displayLabel: '@only', isAdmin: false },
      isLoadingAuthState: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <HeaderActions
        country="es"
        city="barcelona"
      />,
    );

    clickFirstMenuTrigger();

    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'Admin panel' })).toBeNull();
      expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
    });
  });
});

import { render, screen } from '@testing-library/react';
import HeaderAuthActions from '@/app/_components/HeaderAuthActions';

vi.mock('@/hooks/use-telegram-mini-app-env', () => ({
  useTelegramMiniAppEnv: () => 'browser' as const,
}));

vi.mock('@/env/client-env', () => ({
  clientEnv: {
    isAuthEnabled: true,
    telegramBotUsername: 'bot',
  },
}));

vi.mock('@/lib/telegram-auth', () => ({
  requestTelegramSignIn: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

vi.mock('@/hooks/use-telegram-auth', () => ({
  useTelegramAuth: vi.fn(() => ({
    authState: null,
    isLoadingAuthState: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}));

import { useTelegramAuth } from '@/hooks/use-telegram-auth';

describe('HeaderAuthActions', () => {
  it('should show loading state while auth profile is pending', () => {
    vi.mocked(useTelegramAuth).mockReturnValue({
      authState: null,
      isLoadingAuthState: true,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    render(<HeaderAuthActions />);

    expect(screen.getByLabelText('Loading account')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sign in' })).toBeNull();
  });

  it('should show Sign in for unauthenticated guests in browser', () => {
    vi.mocked(useTelegramAuth).mockReturnValue({
      authState: null,
      isLoadingAuthState: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    render(<HeaderAuthActions />);

    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });
});

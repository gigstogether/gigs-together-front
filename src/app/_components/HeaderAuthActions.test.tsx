import { render, screen } from '@testing-library/react';
import HeaderAuthActions from '@/app/_components/HeaderAuthActions';

const mockClientEnv = {
  isAuthEnabled: true,
  telegramBotUsername: 'bot',
};

vi.mock('@/hooks/use-telegram-mini-app-env', () => ({
  useTelegramMiniAppEnv: () => 'browser' as const,
}));

vi.mock('@/env/client-env', () => ({
  clientEnv: mockClientEnv,
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
  beforeEach(() => {
    mockClientEnv.isAuthEnabled = true;
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

  it('should hide Sign in when auth is disabled', () => {
    mockClientEnv.isAuthEnabled = false;
    vi.mocked(useTelegramAuth).mockReturnValue({
      authState: null,
      isLoadingAuthState: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    render(<HeaderAuthActions />);

    expect(screen.queryByRole('button', { name: 'Sign in' })).toBeNull();
  });
});

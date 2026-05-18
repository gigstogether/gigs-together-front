import { render, screen } from '@testing-library/react';
import type { UseTelegramAuthResult } from '@/hooks/use-telegram-auth';
import AdminPageClient from '@/app/admin/AdminPageClient';

const mockUseTelegramAuth = vi.fn<() => UseTelegramAuthResult>();

vi.mock('@/hooks/use-telegram-auth', () => ({
  useTelegramAuth: () => mockUseTelegramAuth(),
}));

vi.mock('@/hooks/use-telegram-mini-app-env', () => ({
  useTelegramMiniAppEnv: () => 'browser' as const,
}));

vi.mock('@/app/_components/SignInContent', () => ({
  default: () => <div data-testid="sign-in-stub" />,
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

vi.mock('@/env/client-env', () => ({
  clientEnv: {
    isAuthEnabled: true,
    telegramBotUsername: 'gigs_test_bot',
  },
}));

function authMock(partial: Partial<UseTelegramAuthResult>): UseTelegramAuthResult {
  return {
    authState: null,
    isLoadingAuthState: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    ...partial,
  };
}

describe('AdminPageClient', () => {
  beforeEach(() => {
    mockUseTelegramAuth.mockReset();
  });

  it('should show a loading state when auth bootstrap is not finished', () => {
    mockUseTelegramAuth.mockReturnValue(
      authMock({
        isLoadingAuthState: true,
      }),
    );

    render(<AdminPageClient />);

    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('should explain access restriction to guests', () => {
    mockUseTelegramAuth.mockReturnValue(
      authMock({
        authState: null,
        isLoadingAuthState: false,
      }),
    );

    render(<AdminPageClient />);

    expect(screen.getByText('Restricted area')).toBeInTheDocument();
    expect(screen.getByTestId('sign-in-stub')).toBeInTheDocument();
  });

  it('should deny access to signed-in non-admin users', () => {
    mockUseTelegramAuth.mockReturnValue(
      authMock({
        authState: { displayLabel: '@someone', isAdmin: false },
      }),
    );

    render(<AdminPageClient />);

    expect(screen.getByText('Access denied')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
  });

  it('should confirm access for admin users', () => {
    mockUseTelegramAuth.mockReturnValue(
      authMock({
        authState: { displayLabel: '@admin', isAdmin: true },
      }),
    );

    render(<AdminPageClient />);

    expect(screen.getByText('You are signed in to the admin area.')).toBeInTheDocument();
  });
});

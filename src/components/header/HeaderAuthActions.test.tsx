import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import HeaderAuthActions from '@/components/header/HeaderAuthActions';
import { toast } from '@/hooks/use-toast';

const { miniAppEnvMock } = vi.hoisted(() => ({
  miniAppEnvMock: vi.fn<() => 'browser' | 'mini' | 'unknown'>(),
}));

vi.mock('@/hooks/use-telegram-mini-app-env', () => ({
  useTelegramMiniAppEnv: miniAppEnvMock,
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

vi.mock('@/hooks/use-telegram-auth', () => ({
  useTelegramAuth: vi.fn(() => ({
    authState: null,
    isLoadingAuthState: false,
    isSigningIn: false,
    isTelegramSignInAvailable: true,
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}));

import { useTelegramAuth } from '@/hooks/use-telegram-auth';

describe('HeaderAuthActions', () => {
  beforeEach(() => {
    miniAppEnvMock.mockReset();
    miniAppEnvMock.mockReturnValue('browser');
    vi.mocked(toast).mockReset();
  });

  it('should show Sign in for unauthenticated guests in browser', () => {
    vi.mocked(useTelegramAuth).mockReturnValue({
      authState: null,
      isLoadingAuthState: false,
      isSigningIn: false,
      isTelegramSignInAvailable: true,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    render(<HeaderAuthActions />);

    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('should start direct sign-in when a Mini App guest clicks Sign in', () => {
    const signIn = vi.fn<() => Promise<void>>().mockResolvedValue();
    miniAppEnvMock.mockReturnValue('mini');
    vi.mocked(useTelegramAuth).mockReturnValue({
      authState: null,
      isLoadingAuthState: false,
      isSigningIn: false,
      isTelegramSignInAvailable: true,
      signIn,
      signOut: vi.fn(),
    });

    render(<HeaderAuthActions />);
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(signIn).toHaveBeenCalledTimes(1);
  });

  it('should ask the user to reopen the Mini App when sign-in data has expired', async () => {
    const signIn = vi
      .fn<() => Promise<void>>()
      .mockRejectedValue(
        new Error('Telegram data has expired. Close and reopen the Mini App, then try again.'),
      );
    miniAppEnvMock.mockReturnValue('mini');
    vi.mocked(useTelegramAuth).mockReturnValue({
      authState: null,
      isLoadingAuthState: false,
      isSigningIn: false,
      isTelegramSignInAvailable: true,
      signIn,
      signOut: vi.fn(),
    });

    render(<HeaderAuthActions />);
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith({
        title: 'Sign in failed',
        description: 'Telegram data has expired. Close and reopen the Mini App, then try again.',
        variant: 'destructive',
      }),
    );
  });

  it('should hide Sign in when sign-in is unavailable', () => {
    vi.mocked(useTelegramAuth).mockReturnValue({
      authState: null,
      isLoadingAuthState: false,
      isSigningIn: false,
      isTelegramSignInAvailable: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    render(<HeaderAuthActions />);

    expect(screen.queryByRole('button', { name: 'Sign in' })).toBeNull();
  });

  it('should allow an authenticated Mini App user to sign out', () => {
    const signOut = vi.fn<() => Promise<void>>().mockResolvedValue();
    miniAppEnvMock.mockReturnValue('mini');
    vi.mocked(useTelegramAuth).mockReturnValue({
      authState: { displayLabel: '@user', isAdmin: false },
      isLoadingAuthState: false,
      isSigningIn: false,
      isTelegramSignInAvailable: true,
      signIn: vi.fn(),
      signOut,
    });

    render(<HeaderAuthActions />);
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(signOut).toHaveBeenCalledTimes(1);
  });
});

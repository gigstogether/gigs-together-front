import { fireEvent, render, screen } from '@testing-library/react';
import HeaderAuthActions from '@/components/header/HeaderAuthActions';

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
});

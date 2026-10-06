import { fireEvent, render, screen } from '@testing-library/react';
import HeaderAuthActions from '@/components/header/HeaderAuthActions';

const { requestTelegramSignInMock } = vi.hoisted(() => ({
  requestTelegramSignInMock: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

vi.mock('@/lib/telegram/telegram-auth', () => ({
  requestTelegramSignIn: requestTelegramSignInMock,
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
    requestTelegramSignInMock.mockReset();
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

  it('should request the sign-in modal without authenticating when a guest clicks Sign in', () => {
    const signIn = vi.fn<() => Promise<void>>().mockResolvedValue();
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

    expect(requestTelegramSignInMock).toHaveBeenCalledTimes(1);
    expect(signIn).not.toHaveBeenCalled();
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

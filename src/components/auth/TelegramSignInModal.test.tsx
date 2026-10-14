import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import TelegramSignInModal from '@/components/auth/TelegramSignInModal';
import { toast } from '@/hooks/use-toast';

interface TelegramLoginButtonMockProps {
  onAuth: (credentials: { idToken: string }) => void | Promise<void>;
}

const { exchangeTelegramAuthFromOidcMock, miniAppEnvMock, useTelegramAuthMock } = vi.hoisted(
  () => ({
    exchangeTelegramAuthFromOidcMock: vi.fn(),
    miniAppEnvMock: vi.fn<() => 'browser' | 'mini' | 'unknown'>(),
    useTelegramAuthMock: vi.fn(),
  }),
);

vi.mock('@/env/client-env', () => ({
  clientEnv: {
    telegramOidcClientId: 123456,
  },
}));

vi.mock('@/hooks/use-telegram-auth', () => ({
  useTelegramAuth: useTelegramAuthMock,
}));

vi.mock('@/hooks/use-telegram-mini-app-env', () => ({
  useTelegramMiniAppEnv: miniAppEnvMock,
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

vi.mock('@/lib/telegram/telegram-auth', () => ({
  exchangeTelegramAuthFromOidc: exchangeTelegramAuthFromOidcMock,
}));

vi.mock('@/components/auth/TelegramLoginButton', () => ({
  default: (props: TelegramLoginButtonMockProps) => (
    <button
      type="button"
      onClick={() => {
        void props.onAuth({ idToken: 'browser-id-token' });
      }}
    >
      Log in with Telegram
    </button>
  ),
}));

describe('TelegramSignInModal', () => {
  beforeEach(() => {
    exchangeTelegramAuthFromOidcMock.mockReset();
    exchangeTelegramAuthFromOidcMock.mockResolvedValue({
      profile: { displayLabel: '@browser-user', isAdmin: false },
    });
    miniAppEnvMock.mockReset();
    miniAppEnvMock.mockReturnValue('mini');
    useTelegramAuthMock.mockReset();
    useTelegramAuthMock.mockReturnValue({
      authState: null,
      isLoadingAuthState: false,
      isSigningIn: false,
      isTelegramSignInAvailable: true,
      signIn: vi.fn<() => Promise<void>>().mockResolvedValue(),
      signOut: vi.fn(),
    });
    vi.mocked(toast).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should authenticate a Mini App user only after the modal action is clicked', async () => {
    const signIn = vi.fn<() => Promise<void>>().mockResolvedValue();
    const onOpenChange = vi.fn();
    useTelegramAuthMock.mockReturnValue({
      authState: null,
      isLoadingAuthState: false,
      isSigningIn: false,
      isTelegramSignInAvailable: true,
      signIn,
      signOut: vi.fn(),
    });
    render(
      <TelegramSignInModal
        isOpen
        onOpenChange={onOpenChange}
      />,
    );

    expect(signIn).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Log in with Telegram' }));
    await waitFor(() => expect(signIn).toHaveBeenCalledTimes(1));
    expect(exchangeTelegramAuthFromOidcMock).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith({ title: 'Signed in' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should keep the browser OIDC action inside the same modal', async () => {
    miniAppEnvMock.mockReturnValue('browser');
    const signIn = vi.fn<() => Promise<void>>().mockResolvedValue();
    const onOpenChange = vi.fn();
    useTelegramAuthMock.mockReturnValue({
      authState: null,
      isLoadingAuthState: false,
      isSigningIn: false,
      isTelegramSignInAvailable: true,
      signIn,
      signOut: vi.fn(),
    });
    render(
      <TelegramSignInModal
        isOpen
        onOpenChange={onOpenChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Log in with Telegram' }));

    await waitFor(() =>
      expect(exchangeTelegramAuthFromOidcMock).toHaveBeenCalledWith({
        idToken: 'browser-id-token',
      }),
    );
    expect(signIn).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith({
      title: 'Signed in',
      description: '@browser-user',
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should show the expired initData error from the Mini App modal action', async () => {
    const signIn = vi
      .fn<() => Promise<void>>()
      .mockRejectedValue(
        new Error('Telegram data has expired. Close and reopen the Mini App, then try again.'),
      );
    useTelegramAuthMock.mockReturnValue({
      authState: null,
      isLoadingAuthState: false,
      isSigningIn: false,
      isTelegramSignInAvailable: true,
      signIn,
      signOut: vi.fn(),
    });
    render(
      <TelegramSignInModal
        isOpen
        onOpenChange={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Log in with Telegram' }));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith({
        title: 'Sign in failed',
        description: 'Telegram data has expired. Close and reopen the Mini App, then try again.',
        variant: 'destructive',
      }),
    );
  });
});

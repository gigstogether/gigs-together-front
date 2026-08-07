import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TelegramLoginButton from '@/components/header/TelegramLoginButton';
import { toast } from '@/hooks/use-toast';

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

describe('TelegramLoginButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.head.querySelectorAll('script').forEach((script) => script.remove());
    delete window.Telegram?.Login;
  });

  it('should pass OIDC credentials when Telegram login succeeds', async () => {
    const onAuth = vi.fn();
    const auth: NonNullable<NonNullable<Window['Telegram']>['Login']>['auth'] = vi.fn(
      (_options, callback) => callback({ id_token: 'signed-id-token' }),
    );
    window.Telegram = { ...window.Telegram, Login: { auth } };

    render(
      <TelegramLoginButton
        clientId={123456}
        onAuth={onAuth}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Log in with Telegram' }));

    expect(auth).toHaveBeenCalledWith(
      { client_id: 123456, scope: ['profile'] },
      expect.any(Function),
    );
    await waitFor(() =>
      expect(onAuth).toHaveBeenCalledWith({
        idToken: 'signed-id-token',
      }),
    );
  });

  it('should show an error when Telegram rejects login', async () => {
    const auth: NonNullable<NonNullable<Window['Telegram']>['Login']>['auth'] = vi.fn(
      (_options, callback) => callback({ error: 'Access denied' }),
    );
    window.Telegram = { ...window.Telegram, Login: { auth } };

    render(
      <TelegramLoginButton
        clientId={123456}
        onAuth={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Log in with Telegram' }));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith({
        title: 'Sign in failed',
        description: 'Access denied',
        variant: 'destructive',
      }),
    );
  });
});

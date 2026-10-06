// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';

import SuggestAuthGate from '@/app/(default)/suggest/_components/SuggestAuthGate';

const { requestTelegramSignInMock, useTelegramAuthMock } = vi.hoisted(() => ({
  requestTelegramSignInMock: vi.fn(),
  useTelegramAuthMock: vi.fn(),
}));

vi.mock('@/hooks/use-telegram-auth', () => ({
  useTelegramAuth: useTelegramAuthMock,
}));

vi.mock('@/lib/telegram/telegram-auth', () => ({
  requestTelegramSignIn: requestTelegramSignInMock,
}));

describe('SuggestAuthGate', () => {
  beforeEach(() => {
    requestTelegramSignInMock.mockReset();
    useTelegramAuthMock.mockReset();
  });

  it('should center the loading state across the available route width', () => {
    useTelegramAuthMock.mockReturnValue({
      authState: null,
      isLoadingAuthState: true,
      isSigningIn: false,
      isTelegramSignInAvailable: false,
      signIn: vi.fn(),
    });

    render(
      <SuggestAuthGate>
        <div>Form</div>
      </SuggestAuthGate>,
    );

    expect(screen.getByText('Loading…').parentElement).toHaveClass('w-full', 'justify-center');
  });

  it('should keep the form hidden and request the sign-in modal when a guest clicks Sign in', () => {
    const signIn = vi.fn<() => Promise<void>>().mockResolvedValue();
    useTelegramAuthMock.mockReturnValue({
      authState: null,
      isLoadingAuthState: false,
      isSigningIn: false,
      isTelegramSignInAvailable: true,
      signIn,
    });

    render(
      <SuggestAuthGate>
        <div>Form</div>
      </SuggestAuthGate>,
    );

    expect(screen.queryByText('Form')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(requestTelegramSignInMock).toHaveBeenCalledTimes(1);
    expect(signIn).not.toHaveBeenCalled();
  });

  it('should render the form after authentication', () => {
    useTelegramAuthMock.mockReturnValue({
      authState: { displayLabel: '@user', isAdmin: false },
      isLoadingAuthState: false,
      isSigningIn: false,
      isTelegramSignInAvailable: true,
      signIn: vi.fn(),
    });

    render(
      <SuggestAuthGate>
        <div>Form</div>
      </SuggestAuthGate>,
    );

    expect(screen.getByText('Form')).toBeInTheDocument();
  });
});

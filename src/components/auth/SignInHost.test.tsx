import { act, render, screen } from '@testing-library/react';

const { subscribeTelegramSignInRequestMock } = vi.hoisted(() => ({
  subscribeTelegramSignInRequestMock: vi.fn<(listener: () => void) => () => void>(),
}));

vi.mock('@/lib/telegram/telegram-auth', () => ({
  subscribeTelegramSignInRequest: subscribeTelegramSignInRequestMock,
}));

vi.mock('@/components/auth/TelegramSignInModal', () => ({
  default: (props: { isOpen: boolean }) => (
    <div data-testid="telegram-sign-in-modal">{props.isOpen ? 'open' : 'closed'}</div>
  ),
}));

import SignInHost from '@/components/auth/SignInHost';

describe('SignInHost', () => {
  beforeEach(() => {
    subscribeTelegramSignInRequestMock.mockReset();
  });

  it('should open the global modal when sign-in is requested', () => {
    let signInRequestListener: (() => void) | undefined;
    subscribeTelegramSignInRequestMock.mockImplementation((listener) => {
      signInRequestListener = listener;
      return () => undefined;
    });

    render(<SignInHost />);

    expect(subscribeTelegramSignInRequestMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('telegram-sign-in-modal')).toHaveTextContent('closed');
    const listener = signInRequestListener;
    if (!listener) {
      throw new Error('Sign-in request listener was not registered.');
    }

    act(() => listener());

    expect(screen.getByTestId('telegram-sign-in-modal')).toHaveTextContent('open');
  });
});

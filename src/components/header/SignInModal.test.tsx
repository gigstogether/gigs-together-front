import { render, screen } from '@testing-library/react';
import SignInModal from '@/components/header/SignInModal';

vi.mock('@/components/header/SignInContent', () => ({
  default: () => <div data-testid="sign-in-content" />,
}));

describe('SignInModal', () => {
  it('should not render modal content when closed', () => {
    render(
      <SignInModal
        isOpen={false}
        onOpenChange={vi.fn()}
        telegramBotUsername="gigs_test_bot"
        onAuthenticated={vi.fn()}
      />,
    );

    expect(screen.queryByTestId('sign-in-content')).toBeNull();
    expect(screen.queryByText('Sign in')).toBeNull();
  });

  it('should render modal content when open', () => {
    render(
      <SignInModal
        isOpen
        onOpenChange={vi.fn()}
        telegramBotUsername="gigs_test_bot"
        onAuthenticated={vi.fn()}
      />,
    );

    expect(screen.getByTestId('sign-in-content')).toBeInTheDocument();
  });
});

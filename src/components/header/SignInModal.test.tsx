import { render, screen } from '@testing-library/react';
import SignInModal from '@/components/header/SignInModal';

describe('SignInModal', () => {
  it('should not render modal content when closed', () => {
    render(
      <SignInModal
        isOpen={false}
        onOpenChange={vi.fn()}
      >
        <div data-testid="sign-in-content" />
      </SignInModal>,
    );

    expect(screen.queryByTestId('sign-in-content')).toBeNull();
    expect(screen.queryByText('Sign in')).toBeNull();
  });

  it('should render modal content when open', () => {
    render(
      <SignInModal
        isOpen
        onOpenChange={vi.fn()}
      >
        <div data-testid="sign-in-content" />
      </SignInModal>,
    );

    expect(screen.getByTestId('sign-in-content')).toBeInTheDocument();
  });
});

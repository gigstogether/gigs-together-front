import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { ShareButton } from '@/components/ShareButton';

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

describe('ShareButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the copy link icon button without a visible menu option', () => {
    render(<ShareButton sharePath="/gigs/radiohead-barcelona" />);

    expect(screen.getByRole('button', { name: 'Copy link' })).toBeInTheDocument();
    expect(screen.queryByText('Copy link')).not.toBeInTheDocument();
  });

  it('should copy the share link to the clipboard when copy link is clicked', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    render(<ShareButton sharePath="/gigs/radiohead-barcelona" />);

    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        new URL('/gigs/radiohead-barcelona', window.location.origin).href,
      );
    });
  });
});

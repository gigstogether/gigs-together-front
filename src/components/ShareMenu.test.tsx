import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { ShareMenu } from '@/components/ShareMenu';

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

describe('ShareMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should open the share menu with a copy link option when the share button is clicked', () => {
    render(<ShareMenu sharePath="/gigs/radiohead-barcelona" />);

    expect(screen.queryByRole('button', { name: 'Copy link' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Share' }));

    expect(screen.getByRole('button', { name: 'Copy link' })).toBeInTheDocument();
  });

  it('should copy the share link to the clipboard when copy link is clicked', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    render(<ShareMenu sharePath="/gigs/radiohead-barcelona" />);

    fireEvent.click(screen.getByRole('button', { name: 'Share' }));
    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        new URL('/gigs/radiohead-barcelona', window.location.origin).href,
      );
    });
  });
});

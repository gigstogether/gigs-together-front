import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import CopyToClipboardButton from '@/components/CopyToClipboardButton';
import { toast } from '@/hooks/use-toast';

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

describe('CopyToClipboardButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should copy text and show success toast when clipboard write succeeds', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    render(
      <CopyToClipboardButton
        copyText="https://gigs.example/admin/gigs/abc"
        copiedToast={{ title: 'Link copied', description: 'Copied to clipboard.' }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('https://gigs.example/admin/gigs/abc');
    });
    expect(toast).toHaveBeenCalledWith({
      title: 'Link copied',
      description: 'Copied to clipboard.',
    });
  });
});

import type { ComponentType } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import CopyToClipboardButton from '@/components/CopyToClipboardButton';
import { toast } from '@/hooks/use-toast';

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

const TestIcon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }> = (props) => (
  <svg
    data-testid="custom-copy-icon"
    {...props}
  />
);

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

  it('should call onCopied when clipboard write succeeds', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const onCopied = vi.fn();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    render(
      <CopyToClipboardButton
        copyText="https://gigs.example/gigs/abc"
        onCopied={onCopied}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));

    await waitFor(() => {
      expect(onCopied).toHaveBeenCalledOnce();
    });
  });

  it('should render a label when provided', () => {
    render(
      <CopyToClipboardButton
        copyText="https://gigs.example/gigs/abc"
        label="Copy link"
        ariaLabel="Copy link"
      />,
    );

    expect(screen.getByRole('button', { name: 'Copy link' })).toHaveTextContent('Copy link');
  });

  it('should render a custom icon when provided', () => {
    render(
      <CopyToClipboardButton
        copyText="https://gigs.example/admin/gigs/abc"
        icon={TestIcon}
      />,
    );

    expect(screen.getByTestId('custom-copy-icon')).toBeInTheDocument();
  });
});

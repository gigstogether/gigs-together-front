import { fireEvent, render, screen } from '@testing-library/react';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

describe('DialogContent', () => {
  it('should request closing the dialog when the backdrop is clicked', () => {
    const onOpenChange = vi.fn();

    render(
      <Dialog
        open
        onOpenChange={onOpenChange}
      >
        <DialogContent>
          <DialogTitle>Test dialog</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should contain overflowing content inside the viewport', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Test dialog</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    const panel = document.querySelector('[data-slot="dialog-panel"]');

    expect(panel).toHaveClass('max-h-[calc(100dvh-2rem)]', 'overflow-y-auto');
    expect(screen.getByRole('button', { name: 'Close dialog' })).toHaveClass('fixed', 'inset-0');
  });
});

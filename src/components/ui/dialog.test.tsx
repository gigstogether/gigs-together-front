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
});

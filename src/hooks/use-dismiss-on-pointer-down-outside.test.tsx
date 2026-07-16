import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';

import { useDismissOnPointerDownOutside } from '@/hooks/use-dismiss-on-pointer-down-outside';

function DismissProbe() {
  const [isOpen, setIsOpen] = useState(true);
  const containerRef = useDismissOnPointerDownOutside({
    isOpen,
    onDismiss: () => setIsOpen(false),
  });

  return (
    <div>
      <div ref={containerRef}>
        <button type="button">Inside</button>
      </div>
      <button type="button">Outside</button>
      <span>{isOpen ? 'open' : 'closed'}</span>
    </div>
  );
}

describe('useDismissOnPointerDownOutside', () => {
  it('should dismiss when pointer down happens outside the container', () => {
    render(<DismissProbe />);

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Outside' }));

    expect(screen.getByText('closed')).toBeInTheDocument();
  });

  it('should keep open when pointer down happens inside the container', () => {
    render(<DismissProbe />);

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Inside' }));

    expect(screen.getByText('open')).toBeInTheDocument();
  });
});

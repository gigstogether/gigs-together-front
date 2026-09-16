// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import DateInput from '@/components/DateInput';

describe('DateInput', () => {
  it('should constrain the native date control within a fixed-height frame', () => {
    render(
      <DateInput
        aria-label="Date"
        value=""
        clearLabel="Clear Date"
        onClear={() => undefined}
        onChange={() => undefined}
      />,
    );

    const input = screen.getByLabelText('Date');
    const frame = input.closest('[data-slot="date-input-frame"]');

    expect(frame).toHaveClass('h-9', 'min-h-9', 'max-h-9', 'max-w-full', 'overflow-hidden');
    expect(input).toHaveClass('inset-0', 'max-h-full', 'w-full', 'max-w-full', 'p-0');
  });

  it('should clear a selected date', () => {
    const onClear = vi.fn();

    render(
      <DateInput
        aria-label="Date"
        value="2026-09-23"
        clearLabel="Clear Date"
        onClear={onClear}
        onChange={() => undefined}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Clear Date' }));

    expect(screen.getByLabelText('Date')).toHaveAttribute('data-has-clear-button', 'true');
    expect(onClear).toHaveBeenCalledOnce();
  });

  it('should hide the clear button when the date is empty', () => {
    render(
      <DateInput
        aria-label="Date"
        value=""
        clearLabel="Clear Date"
        onClear={() => undefined}
        onChange={() => undefined}
      />,
    );

    expect(screen.getByLabelText('Date')).toHaveAttribute('data-has-clear-button', 'false');
    expect(screen.queryByRole('button', { name: 'Clear Date' })).not.toBeInTheDocument();
  });
});

// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';

import NativeSelect from '@/components/NativeSelect';

describe('NativeSelect', () => {
  it('should position a custom arrow with space from the right edge', () => {
    render(
      <NativeSelect aria-label="Country">
        <option value="ES">Spain</option>
      </NativeSelect>,
    );

    const select = screen.getByLabelText('Country');
    const arrow = select.parentElement?.querySelector('svg');

    expect(select).toHaveClass('appearance-none', 'pr-10');
    expect(arrow).toHaveClass('right-3');
  });
});

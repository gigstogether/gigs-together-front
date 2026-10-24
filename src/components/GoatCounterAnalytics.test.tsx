import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import GoatCounterAnalytics from '@/components/GoatCounterAnalytics';

const navigationState = vi.hoisted(() => ({
  pathname: '/feed/es/barcelona',
}));

vi.mock('next/navigation', () => ({
  usePathname: () => navigationState.pathname,
}));

vi.mock('next/script', () => ({
  default: (props: {
    id: string;
    src: string;
    onLoad: () => void;
    'data-goatcounter': string;
    'data-goatcounter-settings': string;
  }) => (
    <button
      type="button"
      data-testid={props.id}
      data-src={props.src}
      data-goatcounter={props['data-goatcounter']}
      data-goatcounter-settings={props['data-goatcounter-settings']}
      onClick={props.onLoad}
    />
  ),
}));

describe('GoatCounterAnalytics', () => {
  beforeEach(() => {
    navigationState.pathname = '/feed/es/barcelona';
    delete window.goatcounter;
  });

  it('should not load GoatCounter when endpoint is missing', () => {
    render(<GoatCounterAnalytics />);

    expect(screen.queryByTestId('goatcounter-analytics')).not.toBeInTheDocument();
  });

  it('should count the initial public path after the script loads', async () => {
    const count = vi.fn();
    window.goatcounter = { count };

    render(<GoatCounterAnalytics endpoint="https://gigstogether.goatcounter.com/count" />);

    const script = screen.getByTestId('goatcounter-analytics');
    expect(script).toHaveAttribute('data-src', 'https://gc.zgo.at/count.js');
    expect(script).toHaveAttribute(
      'data-goatcounter',
      'https://gigstogether.goatcounter.com/count',
    );
    expect(script).toHaveAttribute('data-goatcounter-settings', '{"no_onload":true}');

    fireEvent.click(script);

    await waitFor(() => {
      expect(count).toHaveBeenCalledWith({ path: '/feed/es/barcelona' });
    });
  });

  it('should count client-side navigation to a different public path', async () => {
    const count = vi.fn();
    window.goatcounter = { count };
    const { rerender } = render(
      <GoatCounterAnalytics endpoint="https://gigstogether.goatcounter.com/count" />,
    );

    fireEvent.click(screen.getByTestId('goatcounter-analytics'));
    await waitFor(() => {
      expect(count).toHaveBeenCalledTimes(1);
    });

    navigationState.pathname = '/about';
    rerender(<GoatCounterAnalytics endpoint="https://gigstogether.goatcounter.com/count" />);

    await waitFor(() => {
      expect(count).toHaveBeenLastCalledWith({ path: '/about' });
    });
  });

  it('should not count admin paths', async () => {
    navigationState.pathname = '/admin/gigs';
    const count = vi.fn();
    window.goatcounter = { count };

    render(<GoatCounterAnalytics endpoint="https://gigstogether.goatcounter.com/count" />);
    fireEvent.click(screen.getByTestId('goatcounter-analytics'));

    await waitFor(() => {
      expect(count).not.toHaveBeenCalled();
    });
  });
});

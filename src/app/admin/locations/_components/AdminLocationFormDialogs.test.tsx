import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import AdminLocalityFormDialog from './localities/AdminLocalityFormDialog';
import AdminPlaceFormDialog from './places/AdminPlaceFormDialog';
import AdminRegionFormDialog from './regions/AdminRegionFormDialog';
import { stubResizeObserver } from '@/test/moderator-telegram-session-mock';

describe('AdminLocationFormDialogs', () => {
  beforeEach(() => {
    stubResizeObserver();
  });

  it('should submit a normalized region form when values are valid', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <AdminRegionFormDialog
        value={null}
        countries={[{ iso: 'ES' }]}
        isSaving={false}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByRole('option', { name: 'Spain (ES)' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Canonical name:'), {
      target: { value: '  Catalonia  ' },
    });
    fireEvent.change(screen.getByLabelText('Aliases:'), {
      target: { value: 'Catalunya, Cataluña\nCatalonha' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create region' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        id: null,
        countryIso: 'ES',
        name: 'Catalonia',
        aliases: ['Catalunya', 'Cataluña', 'Catalonha'],
      });
    });
  });

  it('should disable locality submission when the time zone is invalid', () => {
    render(
      <AdminLocalityFormDialog
        value={null}
        regions={[{ id: 'region-1', countryIso: 'ES', name: 'Catalonia', aliases: [] }]}
        isSaving={false}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Canonical name:'), {
      target: { value: 'Barcelona' },
    });
    expect(screen.getByRole('option', { name: 'Catalonia — Spain (ES)' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Time zone:'), {
      target: { value: 'Not/A_Time_Zone' },
    });

    expect(screen.getByText('Enter a valid IANA time zone.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create locality' })).toBeDisabled();
  });

  it('should expose the active state when editing a place', () => {
    render(
      <AdminPlaceFormDialog
        value={{
          id: 'place-1',
          localityId: 'locality-1',
          name: 'Razzmatazz',
          aliases: [],
          isActive: false,
        }}
        regions={[{ id: 'region-1', countryIso: 'ES', name: 'Catalonia', aliases: [] }]}
        localities={[
          {
            id: 'locality-1',
            regionId: 'region-1',
            name: 'Barcelona',
            aliases: [],
            timeZone: 'Europe/Madrid',
          },
        ]}
        isSaving={false}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole('switch', { name: 'Active:' })).not.toBeChecked();
    expect(screen.getByLabelText('Locality:')).toBeDisabled();
    expect(
      screen.getByRole('option', { name: 'Barcelona — Catalonia — Spain (ES)' }),
    ).toBeInTheDocument();
  });

  it('should show the save failure returned by the catalog operation', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Region already exists.'));

    render(
      <AdminRegionFormDialog
        value={null}
        countries={[{ iso: 'ES' }]}
        isSaving={false}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText('Canonical name:'), {
      target: { value: 'Catalonia' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create region' }));

    expect(await screen.findByText('Region already exists.')).toBeVisible();
  });
});

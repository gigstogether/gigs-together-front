import { fireEvent, render, screen } from '@testing-library/react';

import AdminLocalitiesCatalog from './localities/AdminLocalitiesCatalog';
import AdminPlacesCatalog from './places/AdminPlacesCatalog';

const locality = {
  id: 'locality-1',
  countryIso: 'ES',
  name: 'Barcelona',
  qualifier: 'Barcelona province',
  aliases: [],
  timeZone: 'Europe/Madrid',
};

const sameNameLocality = {
  ...locality,
  id: 'locality-2',
  qualifier: 'Tarragona province',
};

const place = {
  id: 'place-1',
  localityId: locality.id,
  name: 'Razzmatazz',
  aliases: ['Sala Razzmatazz'],
  isActive: false,
};

describe('AdminLocationCatalogs', () => {
  it('should delegate locality deletion with its Country context', () => {
    const onDelete = vi.fn();

    render(
      <AdminLocalitiesCatalog
        localities={[locality, sameNameLocality]}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByText('Barcelona (Barcelona province)')).toBeInTheDocument();
    expect(screen.getByText('Barcelona (Tarragona province)')).toBeInTheDocument();
    expect(screen.getAllByText(/Spain \(ES\).*Europe\/Madrid/)).toHaveLength(2);
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Delete locality Barcelona (Barcelona province)',
      }),
    );

    expect(onDelete).toHaveBeenCalledWith(locality);
  });

  it('should render Place status and delegate Place editing', () => {
    const onEdit = vi.fn();

    render(
      <AdminPlacesCatalog
        places={[place]}
        localityById={new Map([[locality.id, locality]])}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('Inactive')).toBeInTheDocument();
    expect(screen.getByText(/Barcelona \(Barcelona province\).*Spain \(ES\)/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Edit place Razzmatazz' }));

    expect(onEdit).toHaveBeenCalledWith(place);
  });
});

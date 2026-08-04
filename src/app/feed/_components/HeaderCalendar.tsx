import 'server-only';

import HeaderCalendarClient from '@/app/feed/_components/HeaderCalendarClient';
import { getAvailableGigDates } from '@/app/feed/_lib/feed.server';

export interface HeaderCalendarProps {
  readonly country: string;
  readonly city: string;
}

export default async function HeaderCalendar(props: HeaderCalendarProps) {
  const { country, city } = props;

  const availableDates = await getAvailableGigDates({ country, city });

  return <HeaderCalendarClient availableDates={availableDates} />;
}

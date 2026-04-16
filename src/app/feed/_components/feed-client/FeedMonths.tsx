'use client';

import { Fragment } from 'react';
import { GigCard } from '@/app/_components/GigCard';
import type { Event } from '@/lib/types';

export interface FeedMonthsProps {
  events: Event[];
  registerEventRef: (eventId: string, element: HTMLElement | null) => void;
}

export function FeedMonths(props: FeedMonthsProps) {
  const { events, registerEventRef } = props;

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl text-gray-600">No events found</h2>
        <p className="text-gray-500 mt-2">Check back later for upcoming events!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {events.map((event, idx) => {
        const prev = events[idx - 1];
        const isFirstOfDate = idx === 0 || prev?.date !== event.date;

        return (
          <Fragment key={event.id}>
            <div
              id={event.id}
              data-date={isFirstOfDate ? event.date : undefined}
              data-event-date={event.date}
              data-event-id={event.id}
              ref={(el) => registerEventRef(event.id, el)}
              className="gig-anchor"
            >
              <GigCard gig={event} />
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}

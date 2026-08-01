import type { Event } from '@/lib/types';
import { ShareButton } from '@/components/ShareButton';
import { LocationIcon } from '@/components/ui/location-icon';
import { Calendar, Ticket } from 'lucide-react';
import { FaTelegramPlane } from 'react-icons/fa';
import { GigPoster } from '@/components/GigPoster';
import { clientEnv } from '@/env/client-env';
import { formatGigDate } from '@/lib/gig-date-format';

interface GigCardProps {
  gig: Event;
  posterLoading?: 'eager' | 'lazy';
  posterFetchPriority?: 'high' | 'low' | 'auto';
}

interface GigDateProps {
  date: string;
  endDate?: string;
  calendarUrl?: string;
}

// TODO: separate component for dates and location
function GigDates(props: GigDateProps) {
  const datesStr = [
    formatGigDate(props.date),
    props.endDate ? formatGigDate(props.endDate) : undefined,
  ]
    .filter(Boolean)
    .join(' – ');

  const title = [datesStr, props.calendarUrl ? 'Add to Google Calendar' : undefined]
    .filter(Boolean)
    .join('\n');

  const dates = (
    <>
      <Calendar
        className="h-4 w-4 shrink-0"
        aria-hidden
      />
      <span
        className="min-w-0 flex-1 truncate"
        title={title}
      >
        {datesStr}
      </span>
    </>
  );

  if (props.calendarUrl) {
    return (
      <a
        href={props.calendarUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full min-w-0 flex-row gap-2 items-center text-gray-500 transition-colors hover:text-gray-700 dark:hover:text-violet-400"
        aria-label="Add to Google Calendar"
      >
        {dates}
      </a>
    );
  }

  return (
    <div
      className="flex w-full min-w-0 flex-row gap-2 items-center text-gray-500"
      title="Date"
    >
      {dates}
    </div>
  );
}

interface GigLocationProps {
  venue: string;
}

function GigLocation(props: GigLocationProps) {
  return (
    <>
      <LocationIcon
        className="h-4 w-4 shrink-0"
        aria-hidden
      />
      <span className="min-w-0 flex-1 truncate">{props.venue}</span>
    </>
  );
}

export function GigCard(props: GigCardProps) {
  const { gig, posterLoading, posterFetchPriority } = props;

  const location = [gig.venue, gig.city.name, gig.country.name].filter((str) => !!str).join(' ');
  const mapsHref = location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
    : undefined;
  const telegramUrl = gig.postUrl ?? clientEnv.telegramUrl;
  const sharePath = `/gigs/${encodeURIComponent(gig.id)}`;

  return (
    <div className="flex w-full flex-col bg-white rounded-lg dark:bg-gray-800 dark:border-gray-700">
      {gig.poster ? (
        <GigPoster
          key={gig.poster}
          poster={gig.poster}
          title={gig.title}
          loading={posterLoading}
          fetchPriority={posterFetchPriority}
        />
      ) : (
        <div
          className="w-full aspect-[3/4] rounded-lg bg-gray-100 dark:bg-gray-700"
          aria-hidden
        />
      )}
      <div className="py-2 pl-1">
        <div className="flex min-w-0 flex-row gap-4 items-center">
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex min-w-0 items-center gap-2">
              <p className="min-w-0 flex-1 tracking-tight font-bold dark:text-white">{gig.title}</p>
              <ShareButton sharePath={sharePath} />
            </div>
            <GigDates
              date={gig.date}
              endDate={gig.endDate}
              calendarUrl={gig.calendarUrl}
            />
            <div
              className="flex w-full min-w-0 flex-row gap-2 items-center text-gray-500"
              title="Venue"
            >
              {mapsHref ? (
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 flex-1 items-center gap-2 truncate transition-colors hover:text-gray-700 dark:hover:text-violet-400"
                  title="Open in Google Maps"
                  aria-label="Open venue in Google Maps"
                >
                  <GigLocation venue={gig.venue} />
                </a>
              ) : (
                <GigLocation venue={gig.venue} />
              )}
            </div>
          </div>
          {/*
          {Number.isFinite(gig.people) && gig.people > 0 ? (
            <p className="text-sm flex flex-row items-center gap-1">
              <FaUsers />
              {gig.people}
            </p>
          ) : null}
          */}
        </div>
        {gig.ticketsUrl || telegramUrl ? (
          <div className="flex w-full min-w-0 flex-row flex-nowrap items-center text-gray-500">
            {gig.ticketsUrl ? (
              <a
                href={gig.ticketsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 flex-row gap-2 items-center transition-colors hover:text-gray-700 dark:hover:text-violet-400"
                title="Open tickets"
              >
                <Ticket
                  className="h-4 w-4 shrink-0"
                  aria-hidden
                />
                <span className="min-w-0 truncate">Tickets</span>
              </a>
            ) : null}

            {gig.ticketsUrl && telegramUrl ? (
              <span
                className="mx-3 h-4 w-px bg-gray-300 dark:bg-gray-600"
                aria-hidden
              />
            ) : null}

            {telegramUrl ? (
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 flex-row gap-2 items-center transition-colors hover:text-gray-700 dark:hover:text-violet-400"
                title="Find company"
                aria-label="Find company"
              >
                <FaTelegramPlane
                  className="h-4 w-4 shrink-0"
                  aria-hidden
                />
                <span className="min-w-0 truncate">Find company</span>
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

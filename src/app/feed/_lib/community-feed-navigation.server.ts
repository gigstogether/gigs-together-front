import { notFound } from 'next/navigation';

export function handleMissingFeedCommunity(): never {
  // TODO: Show available active Communities to choose from when the requested Community is unavailable.
  notFound();
}

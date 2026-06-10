import type { AdminGigQueueItem } from '@/app/admin/gigs/types';
import { formatAdminGigListMeta } from '@/app/admin/gigs/admin-gig-format';
import { cn } from '@/lib/utils';

interface AdminGigQueueListProps {
  readonly gigs: readonly AdminGigQueueItem[];
  readonly selectedPublicId: string | null;
  readonly onSelect: (publicId: string) => void;
  readonly emptyMessage: string;
}

export default function AdminGigQueueList(props: AdminGigQueueListProps) {
  const { gigs, selectedPublicId, onSelect, emptyMessage } = props;

  if (gigs.length === 0) {
    return <p className="px-3 py-10 text-center text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <ul
      className="divide-y"
      role="listbox"
      aria-label="Gigs"
    >
      {gigs.map((gig) => {
        const isSelected = gig.publicId === selectedPublicId;
        return (
          <li
            key={gig.publicId}
            role="presentation"
          >
            <button
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => onSelect(gig.publicId)}
              className={cn(
                'w-full border-l-4 py-2.5 pr-3 pl-2.5 text-left text-sm transition-colors',
                isSelected
                  ? 'border-primary bg-primary/15 font-medium text-foreground shadow-sm'
                  : 'border-transparent text-foreground hover:border-muted-foreground/30 hover:bg-muted/80',
              )}
            >
              <span className="block truncate">{gig.title}</span>
              <span
                className={cn(
                  'mt-0.5 block truncate text-xs',
                  isSelected ? 'text-foreground/75' : 'text-muted-foreground',
                )}
              >
                {formatAdminGigListMeta(gig)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

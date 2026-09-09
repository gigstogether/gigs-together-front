import type { AdminGigCandidate } from '@/app/admin/gig-candidates/_lib/admin-gig-candidate';
import { formatAdminEventDate } from '@/app/admin/_lib/admin-event-format';
import { cn } from '@/lib/utils';

interface AdminGigCandidateQueueListProps {
  gigCandidates: readonly AdminGigCandidate[];
  selectedGigCandidateId: string | null;
  onSelect: (gigCandidateId: string) => void;
  emptyMessage: string;
}

export default function AdminGigCandidateQueueList(props: AdminGigCandidateQueueListProps) {
  const { gigCandidates, selectedGigCandidateId, onSelect, emptyMessage } = props;

  if (gigCandidates.length === 0) {
    return <p className="px-3 py-10 text-center text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <ul
      className="divide-y"
      role="listbox"
      aria-label="Gig candidates"
    >
      {gigCandidates.map((gigCandidate) => {
        const isSelected = gigCandidate.id === selectedGigCandidateId;
        return (
          <li
            key={gigCandidate.id}
            role="presentation"
          >
            <button
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => onSelect(gigCandidate.id)}
              className={cn(
                'w-full border-l-4 py-2.5 pr-3 pl-2.5 text-left text-sm transition-colors',
                isSelected
                  ? 'border-primary bg-primary/15 font-medium text-foreground shadow-sm'
                  : 'border-transparent text-foreground hover:border-muted-foreground/30 hover:bg-muted/80',
              )}
            >
              <span className="block truncate">
                {gigCandidate.gigDraft.title ?? 'Untitled Gig Candidate'}
              </span>
              <span
                className={cn(
                  'mt-0.5 block truncate text-xs',
                  isSelected ? 'text-foreground/75' : 'text-muted-foreground',
                )}
              >
                {gigCandidate.gigDraft.date
                  ? formatAdminEventDate(gigCandidate.gigDraft.date, gigCandidate.gigDraft.endDate)
                  : 'Date not set'}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

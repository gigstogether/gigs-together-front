import { DEFAULT_LOCALE_ISO } from '@/lib/i18n/locale.constants';
import { Pencil } from 'lucide-react';

import type { AdminCommunity } from '../_lib/admin-communities-api';
import type { CommunityNameOption } from './AdminCommunityFormDialog';
import { getCountryDisplayName } from '@/lib/i18n/country-display-name';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface AdminCommunitiesCatalogProps {
  communities: AdminCommunity[];
  nameOptions: CommunityNameOption[];
  isBusy: boolean;
  onEdit: (community: AdminCommunity) => void;
}

export default function AdminCommunitiesCatalog(props: AdminCommunitiesCatalogProps) {
  const { communities, nameOptions, isBusy, onEdit } = props;

  if (communities.length === 0)
    return <p className="p-6 text-sm text-muted-foreground">No communities found.</p>;
  const namesByKey = new Map(nameOptions.map((option) => [option.value, option.label]));

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {communities.map((community) => {
            const name = namesByKey.get(community.nameTranslationKey);
            const label = name ?? community.slug;
            return (
              <li
                key={community.id}
                className="flex items-start justify-between gap-4 p-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 font-medium">
                    {label}
                    <span className="rounded border px-2 py-0.5 text-xs font-normal text-muted-foreground">
                      {community.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="break-words text-sm text-muted-foreground">
                    {getCountryDisplayName(community.countryIso, DEFAULT_LOCALE_ISO)} · /feed/
                    {community.countryIso.toLowerCase()}/{community.slug} · {community.timeZone}
                  </p>
                  {name === undefined ? (
                    <p className="text-sm text-destructive">
                      Missing active name in the default language: {community.nameTranslationKey}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={isBusy}
                    aria-label={`Edit community ${label}`}
                    onClick={() => onEdit(community)}
                  >
                    <Pencil aria-hidden="true" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

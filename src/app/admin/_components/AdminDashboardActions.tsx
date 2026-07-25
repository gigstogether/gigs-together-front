'use client';

import { useState } from 'react';
import { Loader2, Megaphone, RefreshCw } from 'lucide-react';

import { useAdminDashboardActions } from '@/app/admin/use-admin-dashboard-actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function AdminDashboardActions() {
  const [isDigestConfirmOpen, setIsDigestConfirmOpen] = useState(false);
  const {
    isPublishingDigest,
    isRevalidatingFeed,
    isRevalidatingTranslations,
    publishDigestAsync,
    revalidateFeed,
    revalidateTranslations,
  } = useAdminDashboardActions();

  const isBusy = isPublishingDigest || isRevalidatingFeed || isRevalidatingTranslations;

  const confirmPublishDigest = async (): Promise<void> => {
    try {
      await publishDigestAsync();
      setIsDigestConfirmOpen(false);
    } catch {
      return;
    }
  };

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-medium text-muted-foreground">Actions</h2>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isBusy}
          onClick={() => {
            setIsDigestConfirmOpen(true);
          }}
        >
          {isPublishingDigest ? (
            <Loader2
              className="h-4 w-4 animate-spin"
              aria-hidden
            />
          ) : (
            <Megaphone
              className="h-4 w-4"
              aria-hidden
            />
          )}
          Publish digest
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isBusy}
          onClick={revalidateTranslations}
        >
          {isRevalidatingTranslations ? (
            <Loader2
              className="h-4 w-4 animate-spin"
              aria-hidden
            />
          ) : (
            <RefreshCw
              className="h-4 w-4"
              aria-hidden
            />
          )}
          Revalidate translations
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isBusy}
          onClick={revalidateFeed}
        >
          {isRevalidatingFeed ? (
            <Loader2
              className="h-4 w-4 animate-spin"
              aria-hidden
            />
          ) : (
            <RefreshCw
              className="h-4 w-4"
              aria-hidden
            />
          )}
          Revalidate feed
        </Button>
      </div>

      <Dialog
        open={isDigestConfirmOpen}
        onOpenChange={setIsDigestConfirmOpen}
      >
        <DialogTrigger className="hidden">Open digest publish confirm dialog</DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Publish weekly digest?</DialogTitle>
            <DialogDescription>
              This posts the digest to Telegram immediately, outside the scheduled Monday run.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPublishingDigest}
              onClick={() => {
                setIsDigestConfirmOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isPublishingDigest}
              onClick={() => {
                void confirmPublishDigest();
              }}
            >
              {isPublishingDigest ? (
                <Loader2
                  className="h-4 w-4 animate-spin"
                  aria-hidden
                />
              ) : null}
              Yes, publish now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

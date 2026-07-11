"use client";

import { useState } from "react";
import { AlertTriangle, Eye, EyeOff, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { Property } from "@/types/database";
import { BottomSheet, BottomSheetOption } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/locale-provider";

interface ListingActionsSheetProps {
  property: Property;
  isPending: boolean;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onDelete: (id: string) => void;
}

/** Mobile/tablet "•••" actions menu for a dashboard listing (View / Edit / Publish / Delete). */
export function ListingActionsSheet({
  property,
  isPending,
  onToggleStatus,
  onDelete,
}: ListingActionsSheetProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const close = () => {
    setOpen(false);
    setConfirmingDelete(false);
  };

  const isPublished = property.listing_status === "published";

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        aria-label={t.dashboard.actionsTitle}
        className="lg:hidden"
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      <BottomSheet
        open={open}
        onClose={close}
        title={confirmingDelete ? t.dashboard.delete : t.dashboard.actionsTitle}
        height="small"
        closeLabel={t.notifications.close}
        zIndex={220}
      >
        {confirmingDelete ? (
          <div className="space-y-4 pb-2">
            <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
              <p className="text-sm font-medium text-red-700">{t.dashboard.deleteConfirm}</p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setConfirmingDelete(false)}
              >
                {t.dashboard.cancel}
              </Button>
              <Button
                type="button"
                variant="danger"
                className="flex-1"
                disabled={isPending}
                onClick={() => {
                  onDelete(property.id);
                  close();
                }}
              >
                {t.dashboard.confirmDeleteButton}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-1 pb-2">
            <BottomSheetOption
              icon={<Eye className="h-[18px] w-[18px]" />}
              label={t.dashboard.view}
              href={`/properties/${property.id}`}
              onClick={close}
            />
            <BottomSheetOption
              icon={<Pencil className="h-[18px] w-[18px]" />}
              label={t.dashboard.edit}
              href={`/dashboard/${property.id}/edit`}
              onClick={close}
            />
            <BottomSheetOption
              icon={isPublished ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
              label={isPublished ? t.dashboard.unpublish : t.dashboard.publish}
              disabled={isPending}
              onClick={() => {
                onToggleStatus(property.id, property.listing_status);
                close();
              }}
            />
            <BottomSheetOption
              icon={<Trash2 className="h-[18px] w-[18px]" />}
              label={t.dashboard.delete}
              destructive
              disabled={isPending}
              onClick={() => setConfirmingDelete(true)}
            />
          </div>
        )}
      </BottomSheet>
    </>
  );
}

"use client";

import { useTransition } from "react";
import { Trash2, Eye, EyeOff, Pencil } from "lucide-react";
import type { Property } from "@/types/database";
import { deleteProperty, updateListingStatus } from "@/actions/property.actions";
import { formatPrice, getListingStatusLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/locale-provider";

interface DashboardListingsProps {
  properties: Property[];
}

export function DashboardListings({ properties }: DashboardListingsProps) {
  const { t, locale } = useTranslation();
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    if (!confirm(t.dashboard.deleteConfirm)) return;
    startTransition(async () => {
      await deleteProperty(id);
    });
  };

  const handleToggleStatus = (id: string, current: string) => {
    const next = current === "published" ? "draft" : "published";
    startTransition(async () => {
      await updateListingStatus(id, next as "draft" | "published");
    });
  };

  if (properties.length === 0) {
    return (
      <div className="rounded-2xl border border-surface-200 bg-white py-12 text-center">
        <p className="text-surface-500">{t.dashboard.noListings}</p>
        <Button href="/dashboard/new" className="mt-4">
          {t.dashboard.createFirst}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {properties.map((property) => (
        <div
          key={property.id}
          className="flex flex-col gap-4 rounded-2xl border border-surface-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-surface-900">{property.title}</h3>
              <Badge
                variant={property.listing_status === "published" ? "success" : "default"}
              >
                {getListingStatusLabel(property.listing_status, t)}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-surface-500">
              {property.city}, {property.state} &middot;{" "}
              {formatPrice(property.price, property.status, locale)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button href={`/properties/${property.id}`} variant="outline" size="sm">
              {t.dashboard.view}
            </Button>
            <Button href={`/dashboard/${property.id}/edit`} variant="outline" size="sm">
              <Pencil className="h-4 w-4" />
              {t.dashboard.edit}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => handleToggleStatus(property.id, property.listing_status)}
              aria-label={
                property.listing_status === "published"
                  ? t.dashboard.unpublish
                  : t.dashboard.publish
              }
            >
              {property.listing_status === "published" ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => handleDelete(property.id)}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              aria-label={t.dashboard.delete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

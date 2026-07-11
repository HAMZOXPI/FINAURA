"use client";

import { useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Trash2, Eye, EyeOff, Pencil } from "lucide-react";
import type { Property } from "@/types/database";
import { deleteProperty, updateListingStatus } from "@/actions/property.actions";
import {
  ListingPromoteCard,
  useDashboardBoostData,
} from "@/components/dashboard/listing-promote-card";
import { ListingActionsSheet } from "@/components/dashboard/listing-actions-sheet";
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
  const { data: boostData } = useDashboardBoostData();
  const searchParams = useSearchParams();
  const boostListing = searchParams.get("boostListing");
  const boostPosition = searchParams.get("boostPosition");
  const parsedBoostPosition = boostPosition ? Number(boostPosition) : undefined;

  const performDelete = (id: string) => {
    startTransition(async () => {
      await deleteProperty(id);
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm(t.dashboard.deleteConfirm)) return;
    performDelete(id);
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
    <div className="space-y-5">
      {properties.map((property) => (
        <article
          key={property.id}
          className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm"
        >
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
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

            <div className="hidden flex-wrap items-center gap-2 sm:shrink-0 lg:flex">
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

            <div className="sm:shrink-0">
              <ListingActionsSheet
                property={property}
                isPending={isPending}
                onToggleStatus={handleToggleStatus}
                onDelete={performDelete}
              />
            </div>
          </div>

          <div className="border-t border-surface-100 bg-surface-50/40 px-4 py-4 sm:px-5 lg:bg-transparent">
            <div className="mx-auto w-full lg:max-w-none">
              <ListingPromoteCard
                listingId={property.id}
                listingTitle={property.title}
                boostData={boostData}
                autoOpenCheckoutPosition={
                  boostListing === property.id &&
                  parsedBoostPosition &&
                  parsedBoostPosition > 0
                    ? parsedBoostPosition
                    : undefined
                }
              />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

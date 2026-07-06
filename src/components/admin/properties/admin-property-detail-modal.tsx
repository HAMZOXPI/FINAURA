"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, MapPin, Star, X } from "lucide-react";
import type { AdminPropertyRow } from "@/services/admin-property.service";
import { getAdminRejectionReason } from "@/lib/admin/property-status";
import { AdminPropertyStatusBadge } from "@/components/admin/properties/admin-property-status-badge";
import { Button } from "@/components/ui/button";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { formatDate, formatPrice, getInitials } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface AdminPropertyDetailModalProps {
  property: AdminPropertyRow;
  onClose: () => void;
}

export function AdminPropertyDetailModal({ property, onClose }: AdminPropertyDetailModalProps) {
  const { t, locale } = useTranslation();
  const rejectionReason = getAdminRejectionReason(property.features);
  const cover = property.images[0] || PLACEHOLDER_IMAGE;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-surface-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-surface-900">{t.admin.properties.detailTitle}</h2>
            <p className="mt-1 text-sm text-surface-500">{property.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-surface-500 hover:bg-surface-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-4">
              <div className="relative aspect-video overflow-hidden rounded-xl bg-surface-100">
                <Image src={cover} alt={property.title} fill className="object-cover" />
              </div>
              {property.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {property.images.slice(0, 4).map((image, index) => (
                    <div
                      key={image + index}
                      className="relative aspect-square overflow-hidden rounded-lg bg-surface-100"
                    >
                      <Image src={image} alt="" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
              <div>
                <h3 className="text-sm font-semibold text-surface-900">
                  {t.admin.properties.fieldDescription}
                </h3>
                <p className="mt-2 whitespace-pre-wrap text-sm text-surface-600">
                  {property.description || "—"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <AdminPropertyStatusBadge status={property.admin_status} />
                {property.is_featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200 ring-inset">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {t.admin.properties.featured}
                  </span>
                )}
              </div>

              <div className="rounded-xl border border-surface-200 p-4">
                <p className="text-2xl font-bold text-brand-700">{formatPrice(property.price, locale)}</p>
                <p className="mt-1 text-sm text-surface-500">
                  {property.bedrooms} bd · {property.bathrooms} ba · {property.area_sqft} m²
                </p>
              </div>

              <dl className="grid gap-3 text-sm">
                <div>
                  <dt className="font-medium text-surface-500">{t.admin.properties.colCity}</dt>
                  <dd className="mt-1 flex items-center gap-1 text-surface-900">
                    <MapPin className="h-4 w-4 text-brand-600" />
                    {property.city}, {property.state}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-surface-500">{t.admin.properties.fieldAddress}</dt>
                  <dd className="mt-1 text-surface-900">{property.address}</dd>
                </div>
                <div>
                  <dt className="font-medium text-surface-500">ID</dt>
                  <dd className="mt-1 break-all font-mono text-xs text-surface-700">{property.id}</dd>
                </div>
                <div>
                  <dt className="font-medium text-surface-500">{t.admin.properties.colViews}</dt>
                  <dd className="mt-1 text-surface-900">{property.favorite_count}</dd>
                </div>
                <div>
                  <dt className="font-medium text-surface-500">{t.admin.properties.colDate}</dt>
                  <dd className="mt-1 text-surface-900">{formatDate(property.created_at, locale)}</dd>
                </div>
              </dl>

              {property.owner && (
                <div className="rounded-xl border border-surface-200 p-4">
                  <p className="text-sm font-semibold text-surface-900">{t.admin.properties.colSeller}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
                      {property.owner.avatar_url ? (
                        <Image
                          src={property.owner.avatar_url}
                          alt=""
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        getInitials(property.owner.full_name || property.owner.email)
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-surface-900">
                        {property.owner.full_name || "—"}
                      </p>
                      <p className="text-sm text-surface-500">{property.owner.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {rejectionReason && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  <p className="font-semibold">{t.admin.properties.rejectionReason}</p>
                  <p className="mt-1">{rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-surface-200 px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            {t.admin.properties.close}
          </Button>
          <Link href={`/properties/${property.id}`} target="_blank">
            <Button type="button" variant="outline">
              <ExternalLink className="h-4 w-4" />
              {t.admin.properties.viewPublic}
            </Button>
          </Link>
          <Link href={`/admin/properties/${property.id}/edit`}>
            <Button type="button">{t.admin.properties.edit}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

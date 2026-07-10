"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, MapPin, Upload, X } from "lucide-react";
import type { Property } from "@/types/database";
import {
  createProperty,
  updateProperty,
  uploadPropertyImages,
} from "@/actions/property.actions";
import { adminUpdateProperty } from "@/actions/admin-property.actions";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  MOROCCAN_CITIES,
  PROPERTY_TYPE_VALUES,
  PROPERTY_STATUS_VALUES,
  LISTING_STATUS_VALUES,
  FEATURE_KEYS,
  DEFAULT_MAP_LAT,
  DEFAULT_MAP_LNG,
  DEFAULT_COUNTRY,
  type FeatureKey,
} from "@/lib/constants";
import {
  cn,
  getPropertyTypeLabel,
  getPropertyStatusLabel,
  getListingStatusLabel,
} from "@/lib/utils";
import { withoutAdminMarkers } from "@/lib/admin/property-status";
import { useTranslation } from "@/i18n/locale-provider";

interface PropertyFormProps {
  property?: Property;
  mode: "create" | "edit";
  adminEdit?: boolean;
  returnTo?: string;
}

type FormToast = { type: "success" | "info"; message: string } | null;

export function PropertyForm({
  property,
  mode,
  adminEdit = false,
  returnTo,
}: PropertyFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const [toast, setToast] = useState<FormToast>(null);
  const [images, setImages] = useState<string[]>(property?.images ?? []);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    withoutAdminMarkers(property?.features ?? [])
  );
  const [latitude, setLatitude] = useState(
    property?.latitude?.toString() ?? String(DEFAULT_MAP_LAT)
  );
  const [longitude, setLongitude] = useState(
    property?.longitude?.toString() ?? String(DEFAULT_MAP_LNG)
  );
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [isFeatured, setIsFeatured] = useState(property?.is_featured ?? false);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setIsUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));

    const result = await uploadPropertyImages(formData);
    setIsUploading(false);
    e.target.value = "";

    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.urls) {
      setImages((prev) => [...prev, ...result.urls!]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    setImages((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const handleSubmit = (formData: FormData) => {
    setError("");
    setToast(null);
    formData.set("features", selectedFeatures.join(","));
    formData.set("images", JSON.stringify(images));
    formData.set("latitude", latitude);
    formData.set("longitude", longitude);
    formData.set("country", DEFAULT_COUNTRY);
    formData.set("is_featured", isFeatured ? "true" : "false");

    startTransition(async () => {
      if (adminEdit && property) {
        const result = await adminUpdateProperty(property.id, formData);
        if (result?.error) setError(result.error);
        return;
      }

      if (mode === "edit" && property) {
        const result = await updateProperty(property.id, formData);

        if (result?.error) {
          setError(result.error);
          return;
        }

        if (result?.noChanges) {
          setToast({ type: "info", message: t.form.noChangesDetected });
          return;
        }

        if (result?.success) {
          setToast({ type: "success", message: t.form.propertyUpdatedSuccess });
          router.push(returnTo ?? `/properties/${property.id}`);
          router.refresh();
        }
        return;
      }

      const result = await createProperty(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  // Using a plain `onSubmit` handler (instead of the `action` prop) intentionally
  // opts out of React 19's automatic form reset, which otherwise clears every
  // uncontrolled field (title, price, property type, address, etc.) as soon as
  // the submit handler returns -- regardless of whether the request succeeded
  // or failed. This preserves all entered data when an error occurs.
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSubmit(new FormData(event.currentTarget));
  };

  const propertyTypeOptions = PROPERTY_TYPE_VALUES.map((type) => ({
    value: type,
    label: getPropertyTypeLabel(type, t),
  }));

  const propertyStatusOptions = PROPERTY_STATUS_VALUES.map((status) => ({
    value: status,
    label: getPropertyStatusLabel(status, t),
  }));

  const listingStatusOptions = LISTING_STATUS_VALUES.map((status) => ({
    value: status,
    label: getListingStatusLabel(status, t),
  }));

  const cityOptions = [
    { value: "", label: t.form.selectCity },
    ...MOROCCAN_CITIES.map((city) => ({ value: city, label: city })),
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <input type="hidden" name="country" value={DEFAULT_COUNTRY} />

      {toast && (
        <div
          className={cn(
            "rounded-xl px-4 py-3 text-sm font-medium",
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800"
              : "bg-amber-50 text-amber-800"
          )}
          role="status"
        >
          {toast.message}
        </div>
      )}

      <section>
        <h3 className="text-sm font-semibold text-surface-900">{t.form.imagesTitle}</h3>
        <p className="mt-1 text-sm text-surface-500">{t.form.imagesSubtitle}</p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((url, i) => (
            <div key={`${url}-${i}`} className="group relative aspect-[4/3] overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Property ${i + 1}`} className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute start-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  {t.form.coverPhoto}
                </span>
              )}
              <div className="absolute inset-x-2 bottom-2 flex items-center justify-between opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveImage(i, -1)}
                    disabled={i === 0}
                    className="rounded-full bg-black/60 p-1 text-white disabled:opacity-40"
                    aria-label={t.form.moveImageLeft}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(i, 1)}
                    disabled={i === images.length - 1}
                    className="rounded-full bg-black/60 p-1 text-white disabled:opacity-40"
                    aria-label={t.form.moveImageRight}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="rounded-full bg-black/60 p-1 text-white"
                  aria-label={t.form.removeImage}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          <label
            className={cn(
              "flex aspect-[4/3] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-surface-300 bg-surface-50 transition-colors hover:border-brand-400 hover:bg-brand-50",
              isUploading && "pointer-events-none opacity-50"
            )}
          >
            <Upload className="h-6 w-6 text-surface-400" />
            <span className="mt-2 text-xs text-surface-500">
              {isUploading ? t.form.uploading : t.form.addPhotos}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-surface-900">{t.form.basicInfo}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="title"
            name="title"
            label={t.form.title}
            required
            defaultValue={property?.title}
          />
          <Input
            id="price"
            name="price"
            type="number"
            label={t.form.price}
            required
            min={0}
            defaultValue={property?.price}
          />
        </div>

        <Textarea
          id="description"
          name="description"
          label={t.form.description}
          required
          defaultValue={property?.description}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            id="property_type"
            name="property_type"
            label={t.form.propertyType}
            required
            defaultValue={property?.property_type}
            options={propertyTypeOptions}
          />
          <Select
            id="status"
            name="status"
            label={t.form.saleRent}
            required
            defaultValue={property?.status ?? "for_sale"}
            options={propertyStatusOptions}
          />
          <Select
            id="listing_status"
            name="listing_status"
            label={t.form.publishStatus}
            defaultValue={property?.listing_status ?? "draft"}
            options={listingStatusOptions}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-surface-900">{t.form.details}</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            id="bedrooms"
            name="bedrooms"
            type="number"
            label={t.form.bedrooms}
            min={0}
            defaultValue={property?.bedrooms ?? 0}
          />
          <Input
            id="bathrooms"
            name="bathrooms"
            type="number"
            label={t.form.bathrooms}
            min={0}
            defaultValue={property?.bathrooms ?? 0}
          />
          <Input
            id="area_sqft"
            name="area_sqft"
            type="number"
            label={t.form.area}
            min={0}
            required
            defaultValue={property?.area_sqft}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-surface-900">{t.form.location}</h3>
        <Input
          id="address"
          name="address"
          label={t.form.address}
          required
          defaultValue={property?.address}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            id="city"
            name="city"
            label={t.form.city}
            required
            defaultValue={property?.city ?? ""}
            options={cityOptions}
          />
          <Input
            id="state"
            name="state"
            label={t.form.region}
            defaultValue={property?.state}
          />
          <Input
            id="zip_code"
            name="zip_code"
            label={t.form.postalCode}
            defaultValue={property?.zip_code}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="latitude"
            label={t.form.latitude}
            type="number"
            step="any"
            placeholder={String(DEFAULT_MAP_LAT)}
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
          />
          <Input
            id="longitude"
            label={t.form.longitude}
            type="number"
            step="any"
            placeholder={String(DEFAULT_MAP_LNG)}
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
          />
        </div>

        {latitude && longitude && (
          <div className="overflow-hidden rounded-xl border border-surface-200">
            <div className="flex items-center gap-2 border-b border-surface-200 bg-surface-50 px-4 py-2 text-sm text-surface-600">
              <MapPin className="h-4 w-4" />
              {t.form.mapPreview}
            </div>
            <iframe
              title="Property location"
              className="h-48 w-full"
              loading="lazy"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(longitude) - 0.01}%2C${Number(latitude) - 0.01}%2C${Number(longitude) + 0.01}%2C${Number(latitude) + 0.01}&layer=mapnik&marker=${latitude}%2C${longitude}`}
            />
          </div>
        )}
      </section>

      {adminEdit && (
        <section className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(event) => setIsFeatured(event.target.checked)}
              className="h-4 w-4 rounded border-surface-300"
            />
            <span className="text-sm font-semibold text-surface-900">
              {t.admin.properties.featuredLabel}
            </span>
          </label>
        </section>
      )}

      <section>
        <h3 className="text-sm font-semibold text-surface-900">{t.form.featuresTitle}</h3>
        <p className="mt-1 text-sm text-surface-500">{t.form.featuresSubtitle}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {FEATURE_KEYS.map((feature) => (
            <button
              key={feature}
              type="button"
              onClick={() => toggleFeature(feature)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                selectedFeatures.includes(feature)
                  ? "bg-brand-600 text-white"
                  : "bg-surface-100 text-surface-600 hover:bg-surface-200"
              )}
            >
              {t.features[feature as FeatureKey]}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <Button type="submit" isLoading={isPending || isUploading} className="w-full sm:w-auto">
        {adminEdit
          ? t.admin.properties.saveChanges
          : mode === "edit"
            ? t.form.saveChanges
            : t.form.createListing}
      </Button>
    </form>
  );
}

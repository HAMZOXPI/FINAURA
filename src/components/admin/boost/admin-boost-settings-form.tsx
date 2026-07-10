"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Sparkles } from "lucide-react";
import {
  updateBoostProduct,
  updateBoostSettings,
} from "@/actions/admin-boost.actions";
import {
  AdminBoostToast,
  BoostNavTabs,
  type BoostToastState,
} from "@/components/admin/boost/boost-shared";
import { PremiumCard } from "@/components/admin/promotions/promotion-ui";
import type { AdminBoostProductRow } from "@/services/admin-boost.service";
import type { BoostSettings } from "@/services/boost-settings.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/i18n/locale-provider";

interface AdminBoostSettingsFormProps {
  settings: BoostSettings;
  products: AdminBoostProductRow[];
}

export function AdminBoostSettingsForm({ settings, products }: AdminBoostSettingsFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [toast, setToast] = useState<BoostToastState>(null);
  const [bidIncrement, setBidIncrement] = useState(String(settings.bidIncrement));
  const [featuredPositions, setFeaturedPositions] = useState(String(settings.featuredPositions));
  const [productDrafts, setProductDrafts] = useState(products);
  const [isPending, startTransition] = useTransition();

  const saveGlobalSettings = () => {
    startTransition(async () => {
      const result = await updateBoostSettings({
        bidIncrement: Number(bidIncrement),
        featuredPositions: Number(featuredPositions),
      });
      if ("error" in result) {
        setToast({ type: "error", message: result.error });
        return;
      }
      setToast({ type: "success", message: t.admin.boost.settingsSaved });
      router.refresh();
    });
  };

  const saveProduct = (productId: string) => {
    const product = productDrafts.find((item) => item.id === productId);
    if (!product) return;

    startTransition(async () => {
      const result = await updateBoostProduct({
        productId,
        defaultPrice: product.defaultPrice,
        defaultDuration: product.defaultDuration,
        isActive: product.isActive,
      });
      if ("error" in result) {
        setToast({ type: "error", message: result.error });
        return;
      }
      setToast({ type: "success", message: t.admin.boost.productSaved });
      router.refresh();
    });
  };

  const updateProductField = (
    productId: string,
    field: "defaultPrice" | "defaultDuration" | "isActive",
    value: number | boolean
  ) => {
    setProductDrafts((current) =>
      current.map((product) =>
        product.id === productId ? { ...product, [field]: value } : product
      )
    );
  };

  return (
    <div className="space-y-10 pb-24 lg:pb-12">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200/80">
            <Sparkles className="h-3.5 w-3.5" />
            Admin
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-surface-900">
            {t.admin.boost.settingsTitle}
          </h1>
          <p className="max-w-2xl text-base text-surface-500">{t.admin.boost.settingsSubtitle}</p>
        </div>
        <BoostNavTabs />
      </header>

      <PremiumCard>
        <h2 className="text-lg font-semibold text-surface-900">{t.admin.boost.globalSettings}</h2>
        <p className="mt-1 text-sm text-surface-500">{t.admin.boost.globalSettingsHint}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-surface-700">
              {t.admin.boost.bidIncrementLabel}
            </label>
            <Input
              type="number"
              min={1}
              value={bidIncrement}
              onChange={(e) => setBidIncrement(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-surface-700">
              {t.admin.boost.featuredPositionsLabel}
            </label>
            <Input
              type="number"
              min={1}
              max={20}
              value={featuredPositions}
              onChange={(e) => setFeaturedPositions(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>

        <Button className="mt-6" onClick={saveGlobalSettings} isLoading={isPending}>
          <Save className="h-4 w-4" />
          {t.admin.boost.saveSettings}
        </Button>
      </PremiumCard>

      <PremiumCard padding="none">
        <div className="border-b border-surface-100 px-6 py-5">
          <h2 className="text-lg font-semibold text-surface-900">{t.admin.boost.productsTitle}</h2>
          <p className="mt-1 text-sm text-surface-500">{t.admin.boost.productsSubtitle}</p>
        </div>

        <div className="divide-y divide-surface-100">
          {productDrafts.map((product) => (
            <div key={product.id} className="grid gap-4 px-6 py-5 lg:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))_auto] lg:items-end">
              <div>
                <p className="font-semibold text-surface-900">{product.name}</p>
                <p className="text-xs text-surface-500">{product.slug}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-surface-500">
                  {t.admin.boost.defaultPriceLabel}
                </label>
                <Input
                  type="number"
                  min={0}
                  value={product.defaultPrice}
                  onChange={(e) =>
                    updateProductField(product.id, "defaultPrice", Number(e.target.value))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-surface-500">
                  {t.admin.boost.defaultDurationLabel}
                </label>
                <Input
                  type="number"
                  min={1}
                  value={product.defaultDuration}
                  onChange={(e) =>
                    updateProductField(product.id, "defaultDuration", Number(e.target.value))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-surface-500">
                  {t.admin.boost.enabledLabel}
                </label>
                <label className="mt-2 flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={product.isActive}
                    onChange={(e) =>
                      updateProductField(product.id, "isActive", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm text-surface-700">
                    {product.isActive ? t.admin.boost.enabled : t.admin.boost.disabled}
                  </span>
                </label>
              </div>
              <Button
                size="sm"
                variant="outline"
                isLoading={isPending}
                onClick={() => saveProduct(product.id)}
              >
                {t.admin.boost.saveProduct}
              </Button>
            </div>
          ))}
        </div>
      </PremiumCard>

      <AdminBoostToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

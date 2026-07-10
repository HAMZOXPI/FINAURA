import { BoostCenterView } from "@/components/dashboard/boost-center-view";
import { fetchBoostCenterData } from "@/actions/boost.actions";
import { resolveUserId } from "@/lib/supabase/auth";
import { createMetadata } from "@/lib/seo";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { Rocket, Sparkles, TrendingUp } from "lucide-react";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return createMetadata({
    title: dict.boost.centerTitle,
    description: dict.boost.centerSubtitle,
    path: "/dashboard/boost",
    noIndex: true,
    locale,
  });
}

export default async function BoostCenterPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  await resolveUserId();
  const data = await fetchBoostCenterData();

  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl border border-amber-200/50 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6 sm:p-8">
        <div className="pointer-events-none absolute -end-8 -top-8 h-40 w-40 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 start-10 h-32 w-32 rounded-full bg-orange-300/15 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 shadow-lg shadow-orange-500/20">
              <Rocket className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-surface-900 sm:text-3xl">
                {dict.boost.centerTitle}
              </h1>
              <p className="mt-1 max-w-xl text-sm text-surface-600">
                {dict.boost.centerSubtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-xs font-medium text-surface-600">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 ring-1 ring-amber-200/60">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              {dict.boost.featuredHomepage}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 ring-1 ring-amber-200/60">
              <TrendingUp className="h-3.5 w-3.5 text-orange-500" />
              {data.active.length} {dict.boost.statusActive.toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <BoostCenterView initialData={data} />
      </div>
    </div>
  );
}

import {
  Building2,
  Crown,
  MessageSquare,
  ShieldCheck,
  Users,
  Eye,
} from "lucide-react";
import type { AdminDashboardStats } from "@/services/admin.service";
import { cn } from "@/lib/utils";

interface AdminStatCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}

function AdminStatCard({ label, value, icon: Icon, accent }: AdminStatCardProps) {
  return (
    <div className="rounded-2xl border border-surface-200/80 bg-white p-5 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-surface-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-surface-900">
            {value.toLocaleString()}
          </p>
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", accent)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

interface AdminStatsGridProps {
  stats: AdminDashboardStats;
  labels: {
    totalUsers: string;
    totalProperties: string;
    activeListings: string;
    pendingVerification: string;
    totalMessages: string;
    premiumUsers: string;
  };
}

export function AdminStatsGrid({ stats, labels }: AdminStatsGridProps) {
  const cards = [
    { label: labels.totalUsers, value: stats.totalUsers, icon: Users, accent: "bg-brand-50 text-brand-600" },
    { label: labels.totalProperties, value: stats.totalProperties, icon: Building2, accent: "bg-violet-50 text-violet-600" },
    { label: labels.activeListings, value: stats.activeListings, icon: Eye, accent: "bg-emerald-50 text-emerald-600" },
    { label: labels.pendingVerification, value: stats.pendingVerification, icon: ShieldCheck, accent: "bg-amber-50 text-amber-600" },
    { label: labels.totalMessages, value: stats.totalMessages, icon: MessageSquare, accent: "bg-sky-50 text-sky-600" },
    { label: labels.premiumUsers, value: stats.premiumUsers, icon: Crown, accent: "bg-fuchsia-50 text-fuchsia-600" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <AdminStatCard key={card.label} {...card} />
      ))}
    </div>
  );
}

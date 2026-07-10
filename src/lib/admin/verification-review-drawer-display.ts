import type { AdminActivityItem } from "@/services/admin.service";
import type {
  AdminVerificationRequestRow,
  AdminVerificationStats,
} from "@/services/admin-verification.service";
import type { VerificationRequestStatus } from "@/types/database";

export function getSellerRelatedActivity(
  request: AdminVerificationRequestRow,
  activity: AdminActivityItem[]
): AdminActivityItem[] {
  const seller = request.seller;
  if (!seller) return [];

  const normalizedName = seller.full_name?.trim().toLowerCase();
  const normalizedEmail = seller.email?.trim().toLowerCase();

  return activity
    .filter((item) => {
      if (item.id === `user-${seller.id}`) return true;
      if (normalizedName && item.title.trim().toLowerCase() === normalizedName) return true;
      if (normalizedEmail && item.title.trim().toLowerCase() === normalizedEmail) return true;
      if (normalizedEmail && item.subtitle.toLowerCase().includes(normalizedEmail)) return true;
      if (item.type === "verification" && item.subtitle.toLowerCase().includes(normalizedEmail ?? ""))
        return true;
      return false;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);
}

export function getSellerLastActivityLabel(
  request: AdminVerificationRequestRow,
  activity: AdminActivityItem[],
  locale: string
): string | null {
  const items = getSellerRelatedActivity(request, activity);
  if (items.length === 0) return null;

  const date = new Date(items[0].createdAt);
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function verificationStatusTone(
  status: VerificationRequestStatus
): "pending" | "approved" | "rejected" {
  return status;
}

export type VerificationDocumentKey = "selfie" | "idFront" | "idBack" | "proofOfAddress";

export interface VerificationDocumentConfig {
  key: VerificationDocumentKey;
  labelKey: "selfie" | "idFront" | "idBack" | "proofOfAddress";
  url: string | null;
  alt: string;
}

export function buildVerificationDocuments(
  urls: {
    idFront: string | null;
    idBack: string | null;
    selfie: string | null;
    proofOfAddress: string | null;
  } | null,
  includeProof: boolean
): VerificationDocumentConfig[] {
  const docs: VerificationDocumentConfig[] = [
    { key: "selfie", labelKey: "selfie", url: urls?.selfie ?? null, alt: "Selfie" },
    { key: "idFront", labelKey: "idFront", url: urls?.idFront ?? null, alt: "Identity front" },
    { key: "idBack", labelKey: "idBack", url: urls?.idBack ?? null, alt: "Identity back" },
  ];

  if (includeProof) {
    docs.push({
      key: "proofOfAddress",
      labelKey: "proofOfAddress",
      url: urls?.proofOfAddress ?? null,
      alt: "Proof of address",
    });
  }

  return docs;
}

export function countUploadedDocuments(request: AdminVerificationRequestRow): number {
  let count = 0;
  if (request.id_front) count += 1;
  if (request.id_back) count += 1;
  if (request.selfie) count += 1;
  if (request.proof_of_address) count += 1;
  return count;
}

export function areCoreDocumentsComplete(request: AdminVerificationRequestRow): boolean {
  return Boolean(request.id_front && request.id_back && request.selfie);
}

export function formatReviewDuration(
  createdAt: string,
  reviewedAt: string | null
): string | null {
  if (!reviewedAt) return null;

  const diffMs = new Date(reviewedAt).getTime() - new Date(createdAt).getTime();
  if (diffMs < 0) return null;

  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}j ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export interface VerificationPageAnalytics {
  approvalRate: number | null;
  rejectionRate: number | null;
  avgWaitingTime: number | null;
  requestsThisWeek: number | null;
  requestsThisMonth: number | null;
}

export function computeVerificationPageAnalytics(
  stats: AdminVerificationStats
): VerificationPageAnalytics {
  const processed = stats.approved + stats.rejected;

  return {
    approvalRate: processed > 0 ? Math.round((stats.approved / processed) * 100) : null,
    rejectionRate: processed > 0 ? Math.round((stats.rejected / processed) * 100) : null,
    avgWaitingTime: null,
    requestsThisWeek: null,
    requestsThisMonth: null,
  };
}

export type WorkflowStepState = "complete" | "active" | "upcoming" | "rejected";

export interface WorkflowStep {
  key: string;
  label: string;
  state: WorkflowStepState;
}

export function buildVerificationWorkflowSteps(
  status: VerificationRequestStatus,
  labels: {
    submitted: string;
    underReview: string;
    approved: string;
    rejected: string;
  }
): WorkflowStep[] {
  if (status === "approved") {
    return [
      { key: "submitted", label: labels.submitted, state: "complete" },
      { key: "review", label: labels.underReview, state: "complete" },
      { key: "approved", label: labels.approved, state: "complete" },
    ];
  }

  if (status === "rejected") {
    return [
      { key: "submitted", label: labels.submitted, state: "complete" },
      { key: "review", label: labels.underReview, state: "complete" },
      { key: "rejected", label: labels.rejected, state: "rejected" },
    ];
  }

  return [
    { key: "submitted", label: labels.submitted, state: "complete" },
    { key: "review", label: labels.underReview, state: "active" },
    { key: "approved", label: labels.approved, state: "upcoming" },
  ];
}

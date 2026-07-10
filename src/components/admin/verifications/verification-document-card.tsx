"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Download,
  Expand,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { VerificationDocumentConfig } from "@/lib/admin/verification-review-drawer-display";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface VerificationDocumentCardProps {
  document: VerificationDocumentConfig;
  label: string;
  loading?: boolean;
}

function DocumentSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-surface-200/80 bg-white shadow-sm">
      <div className="border-b border-surface-100 px-4 py-3">
        <div className="h-4 w-32 animate-pulse rounded bg-surface-100" />
      </div>
      <div className="aspect-[4/3] animate-pulse bg-surface-50" />
      <div className="flex gap-2 border-t border-surface-100 px-3 py-2.5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-8 w-8 animate-pulse rounded-lg bg-surface-100" />
        ))}
      </div>
    </div>
  );
}

function DocumentImageFrame({
  url,
  alt,
  scale,
  rotation,
}: {
  url: string;
  alt: string;
  scale: number;
  rotation: number;
}) {
  return (
    <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-surface-950/5 p-3">
      <motion.div
        animate={{ scale, rotate: rotation }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="max-h-full max-w-full"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={alt}
          className="max-h-[280px] w-auto max-w-full rounded-lg object-contain shadow-md transition-shadow hover:shadow-lg"
        />
      </motion.div>
    </div>
  );
}

export function VerificationDocumentCard({
  document,
  label,
  loading,
}: VerificationDocumentCardProps) {
  const { t } = useTranslation();
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const zoomIn = useCallback(() => setScale((value) => Math.min(value + 0.25, 2.5)), []);
  const zoomOut = useCallback(() => setScale((value) => Math.max(value - 0.25, 0.75)), []);
  const rotate = useCallback(() => setRotation((value) => (value + 90) % 360), []);

  if (loading) return <DocumentSkeleton />;

  const hasUrl = Boolean(document.url);

  return (
    <>
      <motion.article
        whileHover={{ y: -2 }}
        className="overflow-hidden rounded-2xl border border-surface-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]"
      >
        <div className="flex items-center justify-between border-b border-surface-100 px-4 py-3">
          <h4 className="text-sm font-semibold text-surface-900">{label}</h4>
          {hasUrl && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200/80">
              {t.admin.verifications.drawer.documentReady}
            </span>
          )}
        </div>

        {hasUrl && document.url ? (
          <DocumentImageFrame
            url={document.url}
            alt={document.alt}
            scale={scale}
            rotation={rotation}
          />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center border-b border-surface-100 bg-surface-50/80 px-4">
            <p className="text-center text-sm text-surface-500">
              {t.admin.verifications.documentUnavailable}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1.5 border-t border-surface-100 px-3 py-2.5">
          <button
            type="button"
            disabled={!hasUrl}
            onClick={zoomIn}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-surface-200 text-surface-600 transition-colors hover:bg-surface-50",
              !hasUrl && "cursor-not-allowed opacity-40"
            )}
            aria-label={t.admin.verifications.drawer.zoomIn}
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={!hasUrl}
            onClick={zoomOut}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-surface-200 text-surface-600 transition-colors hover:bg-surface-50",
              !hasUrl && "cursor-not-allowed opacity-40"
            )}
            aria-label={t.admin.verifications.drawer.zoomOut}
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={!hasUrl}
            onClick={rotate}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-surface-200 text-surface-600 transition-colors hover:bg-surface-50",
              !hasUrl && "cursor-not-allowed opacity-40"
            )}
            aria-label={t.admin.verifications.drawer.rotate}
          >
            <RotateCw className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={!hasUrl}
            onClick={() => setFullscreen(true)}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-surface-200 text-surface-600 transition-colors hover:bg-surface-50",
              !hasUrl && "cursor-not-allowed opacity-40"
            )}
            aria-label={t.admin.verifications.drawer.fullscreen}
          >
            <Expand className="h-4 w-4" />
          </button>
          {hasUrl && document.url ? (
            <a
              href={document.url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="ms-auto inline-flex h-8 items-center gap-1.5 rounded-lg border border-surface-200 px-2.5 text-xs font-semibold text-surface-700 transition-colors hover:bg-surface-50"
            >
              <Download className="h-3.5 w-3.5" />
              {t.admin.verifications.drawer.download}
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="ms-auto inline-flex h-8 cursor-not-allowed items-center gap-1.5 rounded-lg border border-surface-200 px-2.5 text-xs font-semibold text-surface-400 opacity-60"
            >
              <Download className="h-3.5 w-3.5" />
              {t.admin.verifications.drawer.download}
            </button>
          )}
        </div>
      </motion.article>

      <AnimatePresence>
        {fullscreen && document.url && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
              onClick={() => setFullscreen(false)}
              aria-label={t.admin.verifications.drawer.closeFullscreen}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="fixed inset-4 z-[101] flex items-center justify-center sm:inset-8"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={document.url}
                alt={document.alt}
                className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
                style={{ transform: `rotate(${rotation}deg) scale(${scale})` }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

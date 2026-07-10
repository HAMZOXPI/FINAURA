"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Ban,
  Bell,
  CheckCircle2,
  Download,
  Eye,
  FileImage,
  MoreHorizontal,
  RotateCcw,
  Trash2,
  Undo2,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { VerificationRequestStatus } from "@/types/database";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

export interface VerificationModerationHandlers {
  onApprove: () => void;
  onReject: () => void;
  onViewDocuments: () => void;
  onDownloadDocuments: () => void;
}

interface VerificationModerationActionsProps {
  status: VerificationRequestStatus;
  actionPending?: boolean;
  downloadReady?: boolean;
  variant: "drawer" | "table";
  handlers: VerificationModerationHandlers;
}

function ComingSoonBadge() {
  const { t } = useTranslation();
  return (
    <span className="rounded-full bg-surface-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-surface-400">
      {t.admin.verifications.export.soon}
    </span>
  );
}

function ModerationButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  comingSoon,
  variant = "outline",
  compact,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  comingSoon?: boolean;
  variant?: "default" | "outline" | "danger";
  compact?: boolean;
}) {
  const inactive = disabled || comingSoon || !onClick;

  if (variant === "default") {
    return (
      <Button
        type="button"
        size={compact ? "sm" : "md"}
        onClick={onClick}
        disabled={inactive}
        className="gap-2"
      >
        <Icon className="h-4 w-4" />
        <span className={compact ? "hidden xl:inline" : undefined}>{label}</span>
        {comingSoon && <ComingSoonBadge />}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size={compact ? "sm" : "md"}
      variant="outline"
      onClick={onClick}
      disabled={inactive}
      className={cn(
        "gap-2",
        variant === "danger" && "border-red-200 text-red-700 hover:bg-red-50",
        inactive && "opacity-70"
      )}
    >
      <Icon className="h-4 w-4" />
      <span className={compact ? "hidden xl:inline" : undefined}>{label}</span>
      {comingSoon && <ComingSoonBadge />}
    </Button>
  );
}

function TableOverflowMenu({
  items,
}: {
  items: Array<{
    key: string;
    label: string;
    icon: LucideIcon;
    onClick?: () => void;
    disabled?: boolean;
    comingSoon?: boolean;
    danger?: boolean;
  }>;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const menuEl = menuRef.current;
    const menuWidth = menuEl?.offsetWidth ?? 224;
    const menuHeight = menuEl?.offsetHeight ?? items.length * 40 + 8;
    const gap = 6;
    const padding = 8;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUpward = spaceBelow < menuHeight + gap && spaceAbove > spaceBelow;

    let top = openUpward ? rect.top - menuHeight - gap : rect.bottom + gap;

    const isRtl = document.documentElement.dir === "rtl";
    let left = isRtl ? rect.left : rect.right - menuWidth;

    left = Math.max(padding, Math.min(left, window.innerWidth - menuWidth - padding));
    top = Math.max(padding, Math.min(top, window.innerHeight - menuHeight - padding));

    setCoords({ top, left });
  }, [items.length]);

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    updatePosition();
    requestAnimationFrame(() => updatePosition());
  }, [open, updatePosition, items]);

  useEffect(() => {
    if (!open) return;

    const handleScrollOrResize = () => updatePosition();
    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("scroll", handleScrollOrResize, true);

    return () => {
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const close = () => setOpen(false);

  const menuPortal =
    mounted &&
    open &&
    createPortal(
      <>
        <button
          type="button"
          className="fixed inset-0 z-[200] bg-transparent"
          aria-label={t.admin.verifications.drawer.close}
          onClick={close}
        />
        <div
          ref={menuRef}
          role="menu"
          style={{
            position: "fixed",
            top: coords?.top ?? -9999,
            left: coords?.left ?? -9999,
            visibility: coords ? "visible" : "hidden",
          }}
          className="z-[210] min-w-[14rem] overflow-hidden rounded-xl border border-surface-200 bg-white py-1 shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
        >
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              role="menuitem"
              disabled={item.disabled || item.comingSoon || !item.onClick}
              onClick={() => {
                item.onClick?.();
                close();
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2.5 text-start text-sm font-medium transition-colors hover:bg-surface-50 disabled:cursor-not-allowed disabled:opacity-50",
                item.danger && "text-red-700"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.comingSoon && <ComingSoonBadge />}
            </button>
          ))}
        </div>
      </>,
      document.body
    );

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        size="sm"
        variant="outline"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="px-2.5"
      >
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">{t.admin.verifications.actions.more}</span>
      </Button>
      {menuPortal}
    </>
  );
}

export function VerificationModerationActions({
  status,
  actionPending = false,
  downloadReady = false,
  variant,
  handlers,
}: VerificationModerationActionsProps) {
  const { t } = useTranslation();
  const isPendingStatus = status === "pending";

  const actions = {
    approve: {
      key: "approve",
      label: t.admin.verifications.approve,
      icon: CheckCircle2,
      onClick: isPendingStatus ? handlers.onApprove : undefined,
      disabled: actionPending || !isPendingStatus,
      comingSoon: false,
      variant: "default" as const,
    },
    reject: {
      key: "reject",
      label: t.admin.verifications.reject,
      icon: Ban,
      onClick: isPendingStatus ? handlers.onReject : undefined,
      disabled: actionPending || !isPendingStatus,
      comingSoon: false,
      variant: "danger" as const,
    },
    viewDocuments: {
      key: "view",
      label: t.admin.verifications.actions.viewDocuments,
      icon: Eye,
      onClick: handlers.onViewDocuments,
      disabled: actionPending,
      comingSoon: false,
    },
    download: {
      key: "download",
      label: t.admin.verifications.actions.downloadDocuments,
      icon: Download,
      onClick: downloadReady ? handlers.onDownloadDocuments : undefined,
      disabled: actionPending || !downloadReady,
      comingSoon: !downloadReady,
    },
    reopen: {
      key: "reopen",
      label: t.admin.verifications.actions.reopen,
      icon: Undo2,
      comingSoon: true,
    },
    remove: {
      key: "remove",
      label: t.admin.verifications.actions.remove,
      icon: XCircle,
      comingSoon: true,
    },
    delete: {
      key: "delete",
      label: t.admin.verifications.actions.delete,
      icon: Trash2,
      comingSoon: true,
      variant: "danger" as const,
    },
    reset: {
      key: "reset",
      label: t.admin.verifications.actions.resetStatus,
      icon: RotateCcw,
      comingSoon: true,
    },
    requestDocs: {
      key: "requestDocs",
      label: t.admin.verifications.drawer.requestNewDocuments,
      icon: FileImage,
      comingSoon: true,
    },
    notify: {
      key: "notify",
      label: t.admin.verifications.drawer.notifySeller,
      icon: Bell,
      comingSoon: true,
    },
  };

  if (variant === "drawer") {
    return (
      <div className="space-y-3">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-surface-400">
            {t.admin.verifications.actions.primary}
          </p>
          <div className="flex flex-wrap gap-2">
            <ModerationButton {...actions.approve} variant="default" />
            <ModerationButton {...actions.reject} variant="danger" />
            <ModerationButton {...actions.viewDocuments} />
            <ModerationButton {...actions.download} />
          </div>
        </div>
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-surface-400">
            {t.admin.verifications.actions.advanced}
          </p>
          <div className="flex flex-wrap gap-2">
            <ModerationButton {...actions.reopen} />
            <ModerationButton {...actions.remove} />
            <ModerationButton {...actions.delete} variant="danger" />
            <ModerationButton {...actions.reset} />
            <ModerationButton {...actions.requestDocs} />
            <ModerationButton {...actions.notify} />
          </div>
        </div>
      </div>
    );
  }

  const overflowItems = [
    actions.viewDocuments,
    actions.download,
    actions.reopen,
    actions.remove,
    actions.delete,
    actions.reset,
    actions.requestDocs,
    actions.notify,
    ...(isPendingStatus
      ? []
      : [
          {
            ...actions.approve,
            disabled: true,
          },
          {
            ...actions.reject,
            disabled: true,
          },
        ]),
  ];

  return (
    <div className="flex items-center justify-end gap-2">
      {isPendingStatus && (
        <>
          <ModerationButton {...actions.approve} variant="default" compact />
          <ModerationButton {...actions.reject} variant="danger" compact />
        </>
      )}
      <ModerationButton
        {...actions.viewDocuments}
        compact
        label={t.admin.verifications.preview}
      />
      <TableOverflowMenu items={overflowItems} />
    </div>
  );
}

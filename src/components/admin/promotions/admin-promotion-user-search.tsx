"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Search, X } from "lucide-react";
import { searchUsersForGift } from "@/actions/admin-promotion.actions";
import type { AdminGiftRecipient } from "@/services/admin-promotion.service";
import {
  loadRecentUsers,
  saveRecentUser,
  UserAvatar,
  UserBadgeRow,
} from "@/components/admin/promotions/promotion-ui";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface AdminPromotionUserSearchProps {
  selectedUser: AdminGiftRecipient | null;
  onSelect: (user: AdminGiftRecipient | null) => void;
}

export function AdminPromotionUserSearch({
  selectedUser,
  onSelect,
}: AdminPromotionUserSearchProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AdminGiftRecipient[]>([]);
  const [recentUsers, setRecentUsers] = useState<AdminGiftRecipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecentUsers(loadRecentUsers());
  }, []);

  const displayList = query.trim().length >= 2 ? results : recentUsers;
  const showDropdown = focused && displayList.length > 0 && !selectedUser;

  useEffect(() => {
    if (selectedUser) {
      setQuery("");
      setResults([]);
      setActiveIndex(-1);
      return;
    }

    if (query.trim().length < 2) {
      setResults([]);
      setActiveIndex(-1);
      return;
    }

    setLoading(true);
    const timer = window.setTimeout(async () => {
      const result = await searchUsersForGift(query.trim());
      setResults("users" in result && result.users ? result.users : []);
      setLoading(false);
      setActiveIndex(-1);
    }, 280);

    return () => window.clearTimeout(timer);
  }, [query, selectedUser]);

  const pickUser = useCallback(
    (user: AdminGiftRecipient) => {
      saveRecentUser(user);
      setRecentUsers(loadRecentUsers());
      onSelect(user);
      setResults([]);
      setQuery("");
      setActiveIndex(-1);
      setFocused(false);
    },
    [onSelect]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || displayList.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % displayList.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? displayList.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      pickUser(displayList[activeIndex]);
    } else if (e.key === "Escape") {
      setFocused(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  };

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement | undefined;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  return (
    <div className="space-y-3">
      <label htmlFor="promotion-user-search" className="text-sm font-semibold text-surface-900">
        {t.admin.promotions.fieldUser}
      </label>

      {!selectedUser ? (
        <div className="relative">
          <Search
            className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400"
            aria-hidden
          />
          <Input
            ref={inputRef}
            id="promotion-user-search"
            role="combobox"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            aria-controls="promotion-user-listbox"
            aria-activedescendant={activeIndex >= 0 ? `user-option-${activeIndex}` : undefined}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => window.setTimeout(() => setFocused(false), 180)}
            onKeyDown={handleKeyDown}
            placeholder={t.admin.promotions.userSearchPlaceholder}
            className="h-14 rounded-2xl border-surface-200 bg-surface-50/50 ps-12 text-base shadow-sm transition-all focus:bg-white focus:shadow-md focus-visible:ring-2 focus-visible:ring-brand-500/30"
          />
          {loading && (
            <div
              className="absolute end-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600"
              aria-hidden
            />
          )}

          {query.trim().length < 2 && recentUsers.length > 0 && focused && (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-surface-400">
              <Clock className="h-3 w-3" />
              {t.admin.promotions.recentUsers}
            </p>
          )}

          <AnimatePresence>
            {showDropdown && (
              <motion.ul
                ref={listRef}
                id="promotion-user-listbox"
                role="listbox"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="absolute z-40 mt-2 max-h-80 w-full overflow-auto rounded-2xl border border-surface-200/80 bg-white p-2 shadow-2xl ring-1 ring-black/5"
              >
                {displayList.map((user, index) => (
                  <li key={user.id} id={`user-option-${index}`} role="option" aria-selected={index === activeIndex}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                        index === activeIndex ? "bg-brand-50" : "hover:bg-surface-50"
                      )}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pickUser(user)}
                      onMouseEnter={() => setActiveIndex(index)}
                    >
                      <UserAvatar
                        name={user.full_name}
                        email={user.email}
                        avatarUrl={user.avatar_url}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-surface-900">
                          {user.full_name || "—"}
                        </p>
                        <p className="truncate text-xs text-surface-500">{user.email}</p>
                        <div className="mt-1.5">
                          <UserBadgeRow
                            planSlug={user.plan_slug}
                            planName={user.plan_name}
                            verifiedLabel={t.admin.promotions.badgePremium}
                          />
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4 rounded-2xl border border-brand-200/60 bg-gradient-to-br from-brand-50/80 to-violet-50/40 p-4 ring-1 ring-brand-100/80"
        >
          <UserAvatar
            name={selectedUser.full_name}
            email={selectedUser.email}
            avatarUrl={selectedUser.avatar_url}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-base font-semibold text-surface-900">
                {selectedUser.full_name || "—"}
              </p>
              <UserBadgeRow
                planSlug={selectedUser.plan_slug}
                planName={selectedUser.plan_name}
                verifiedLabel={t.admin.promotions.badgePremium}
              />
            </div>
            <p className="truncate text-sm text-surface-600">{selectedUser.email}</p>
          </div>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-surface-500 transition-colors hover:bg-white hover:text-surface-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            onClick={() => onSelect(null)}
            aria-label={t.admin.promotions.changeUser}
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}

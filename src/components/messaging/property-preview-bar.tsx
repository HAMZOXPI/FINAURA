"use client";

import type { ConversationWithMeta } from "@/types/database";
import { PropertyPreviewRow } from "@/components/messaging/property-preview-row";

export function PropertyPreviewBar({ conversation }: { conversation: ConversationWithMeta }) {
  return <PropertyPreviewRow conversation={conversation} />;
}

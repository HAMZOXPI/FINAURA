"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus, Paperclip, Send, Smile } from "lucide-react";
import { sendMessage, uploadMessageAttachment } from "@/actions/message.actions";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/locale-provider";

const COMMON_EMOJIS = ["😀", "😊", "👍", "❤️", "🏠", "🔥", "✅", "🙏", "😍", "💬"];

interface ChatInputProps {
  conversationId: string;
  onSent?: () => void;
  onTyping?: (typing: boolean) => void;
  disabled?: boolean;
}

export function ChatInput({ conversationId, onSent, onTyping, disabled }: ChatInputProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isPending, startTransition] = useTransition();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  const handleTyping = () => {
    onTyping?.(true);
    if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => onTyping?.(false), 1200);
  };

  const submitMessage = (formData: FormData) => {
    setError("");
    startTransition(async () => {
      const result = await sendMessage(formData);
      if (result && "error" in result && result.error) {
        setError(result.error);
      } else {
        setContent("");
        setShowEmoji(false);
        onTyping?.(false);
        onSent?.();
      }
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!content.trim()) return;

    const formData = new FormData();
    formData.set("conversation_id", conversationId);
    formData.set("content", content.trim());
    submitMessage(formData);
  };

  const handleAttachment = (file: File) => {
    setError("");
    startTransition(async () => {
      const uploadData = new FormData();
      uploadData.set("conversation_id", conversationId);
      uploadData.set("file", file);

      const uploadResult = await uploadMessageAttachment(uploadData);
      if (!uploadResult || "error" in uploadResult || !("url" in uploadResult)) {
        setError(
          (uploadResult && "error" in uploadResult && uploadResult.error) || "Upload failed"
        );
        return;
      }

      const messageData = new FormData();
      messageData.set("conversation_id", conversationId);
      messageData.set("attachment_url", uploadResult.url);
      messageData.set("attachment_name", uploadResult.name);
      messageData.set("attachment_type", uploadResult.type);
      if (content.trim()) messageData.set("content", content.trim());

      const result = await sendMessage(messageData);
      if (result && "error" in result && result.error) {
        setError(result.error);
      } else {
        setContent("");
        setShowEmoji(false);
        onTyping?.(false);
        onSent?.();
      }
    });
  };

  return (
    <div className="border-t border-surface-200 bg-white p-3 sm:p-4">
      {showEmoji && (
        <div className="mb-3 flex flex-wrap gap-1 rounded-xl border border-surface-200 bg-surface-50 p-2">
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="rounded-lg px-2 py-1 text-lg transition-colors hover:bg-white"
              onClick={() => {
                setContent((value) => value + emoji);
                handleTyping();
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            className="rounded-xl p-2 text-surface-500 transition-colors hover:bg-surface-100 hover:text-brand-600"
            onClick={() => setShowEmoji((value) => !value)}
            aria-label={t.messaging.emoji}
          >
            <Smile className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="rounded-xl p-2 text-surface-500 transition-colors hover:bg-surface-100 hover:text-brand-600"
            onClick={() => imageInputRef.current?.click()}
            aria-label={t.messaging.attachImage}
          >
            <ImagePlus className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="rounded-xl p-2 text-surface-500 transition-colors hover:bg-surface-100 hover:text-brand-600"
            onClick={() => fileInputRef.current?.click()}
            aria-label={t.messaging.attachFile}
          >
            <Paperclip className="h-5 w-5" />
          </button>
        </div>

        <textarea
          value={content}
          onChange={(event) => {
            setContent(event.target.value);
            handleTyping();
          }}
          placeholder={t.messaging.typeMessage}
          rows={1}
          disabled={disabled || isPending}
          className="max-h-32 min-h-[44px] flex-1 resize-none rounded-[18px] border border-surface-300 bg-white px-4 py-3 text-sm text-surface-900 placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
        />

        <Button
          type="submit"
          disabled={disabled || isPending || !content.trim()}
          className="h-11 w-11 shrink-0 rounded-full p-0"
          aria-label={t.messaging.send}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleAttachment(file);
          event.target.value = "";
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleAttachment(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}

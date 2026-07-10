"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Loader2, Mic, Send, Smile, X } from "lucide-react";
import { sendMessage, uploadMessageAttachment } from "@/actions/message.actions";
import { useKeyboardInset } from "@/hooks/use-keyboard-inset";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import {
  buildVoiceAttachmentName,
  formatVoiceDuration,
} from "@/lib/messaging/messaging-display";
import { cn } from "@/lib/utils";
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
  const [focused, setFocused] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const keyboardInset = useKeyboardInset();

  const uploadAndSendFile = useCallback(
    (file: File, options?: { clearContent?: boolean }) => {
      setError("");
      startTransition(async () => {
        const uploadData = new FormData();
        uploadData.set("conversation_id", conversationId);
        uploadData.set("file", file);

        const uploadResult = await uploadMessageAttachment(uploadData);
        if (!uploadResult || "error" in uploadResult || !("url" in uploadResult)) {
          setError(
            (uploadResult && "error" in uploadResult && uploadResult.error) || t.messaging.uploadFailed
          );
          setPreviewUrl(null);
          setPreviewName(null);
          return;
        }

        const messageData = new FormData();
        messageData.set("conversation_id", conversationId);
        messageData.set("attachment_url", uploadResult.url);
        messageData.set("attachment_name", uploadResult.name);
        messageData.set("attachment_type", uploadResult.type);
        if (!options?.clearContent && content.trim()) {
          messageData.set("content", content.trim());
        }

        const result = await sendMessage(messageData);
        if (result && "error" in result && result.error) {
          setError(result.error);
        } else {
          setContent("");
          setShowEmoji(false);
          setPreviewUrl(null);
          setPreviewName(null);
          onTyping?.(false);
          onSent?.();
        }
      });
    },
    [content, conversationId, onSent, onTyping, t.messaging.uploadFailed]
  );

  const handleVoiceRecorded = useCallback(
    ({ blob, durationSeconds }: { blob: Blob; durationSeconds: number }) => {
      const file = new File([blob], buildVoiceAttachmentName(durationSeconds), {
        type: blob.type || "audio/webm",
      });
      uploadAndSendFile(file, { clearContent: true });
    },
    [uploadAndSendFile]
  );

  const {
    isRecording,
    duration,
    isCancelling,
    startRecording,
    updatePointer,
    stopRecording,
    cancelRecording,
  } = useVoiceRecorder({
    onRecorded: handleVoiceRecorded,
    onError: () => setError(t.messaging.microphoneError),
  });

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`;
  }, [content]);

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
        setPreviewUrl(null);
        setPreviewName(null);
        onTyping?.(false);
        onSent?.();
      }
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!content.trim() && !previewUrl) return;

    const formData = new FormData();
    formData.set("conversation_id", conversationId);
    if (content.trim()) formData.set("content", content.trim());
    submitMessage(formData);
  };

  const handleAttachment = (file: File) => {
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
      setPreviewName(file.name);
    }
    uploadAndSendFile(file);
  };

  const bottomPadding = keyboardInset > 0 ? keyboardInset : undefined;
  const showSendButton = Boolean(content.trim() || previewUrl);

  return (
    <div
      className={cn(
        "shrink-0 border-t border-white/70 bg-white/90 p-3 backdrop-blur-xl",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4"
      )}
      style={bottomPadding != null ? { paddingBottom: bottomPadding } : undefined}
    >
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mb-3 flex items-center justify-between rounded-2xl border border-surface-200/80 bg-surface-50 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  isCancelling ? "bg-surface-400" : "animate-pulse bg-red-500"
                )}
              />
              <span className="text-sm font-semibold text-surface-800">
                {isCancelling ? t.messaging.releaseToCancel : t.messaging.recording}
              </span>
            </div>
            <span className="text-sm font-bold tabular-nums text-brand-700">
              {formatVoiceDuration(duration)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="relative inline-block overflow-hidden rounded-2xl border border-surface-200 shadow-sm">
              <img
                src={previewUrl}
                alt={previewName ?? ""}
                className="h-24 w-auto max-w-full object-cover"
              />
              {isPending && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl(null);
                  setPreviewName(null);
                }}
                className="absolute end-2 top-2 rounded-full bg-black/55 p-1 text-white"
                aria-label={t.messaging.removePreview}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showEmoji && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 flex flex-wrap gap-1 rounded-2xl border border-surface-200/80 bg-surface-50/90 p-2"
        >
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="rounded-lg px-2 py-1 text-base transition-colors hover:bg-white"
              onClick={() => {
                setContent((value) => value + emoji);
                handleTyping();
              }}
            >
              {emoji}
            </button>
          ))}
        </motion.div>
      )}

      <motion.form
        onSubmit={handleSubmit}
        animate={{
          boxShadow: focused
            ? "0 0 0 3px rgba(0, 105, 198, 0.12)"
            : "0 8px 24px -12px rgba(0,0,0,0.12)",
        }}
        className={cn(
          "flex items-end gap-1.5 rounded-[24px] border bg-white p-2 transition-colors sm:gap-2",
          focused ? "border-brand-300" : "border-surface-200/80"
        )}
      >
        <div className="flex shrink-0 gap-0.5">
          <button
            type="button"
            className="rounded-xl p-2.5 text-surface-500 transition-colors hover:bg-surface-100 hover:text-brand-600"
            onClick={() => setShowEmoji((value) => !value)}
            aria-label={t.messaging.emoji}
            disabled={isPending || isRecording}
          >
            <Smile className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="rounded-xl p-2.5 text-surface-500 transition-colors hover:bg-surface-100 hover:text-brand-600"
            onClick={() => imageInputRef.current?.click()}
            aria-label={t.messaging.attachImage}
            disabled={isPending || isRecording}
          >
            <ImagePlus className="h-5 w-5" />
          </button>
        </div>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={(event) => {
            setContent(event.target.value);
            handleTyping();
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={t.messaging.typeMessage}
          rows={1}
          disabled={disabled || isPending || isRecording}
          className="max-h-32 min-h-[44px] min-w-0 flex-1 resize-none bg-transparent px-1 py-2.5 text-base text-surface-900 placeholder:text-surface-400 focus:outline-none sm:text-sm"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
        />

        {showSendButton ? (
          <motion.button
            type="submit"
            disabled={disabled || isPending || (!content.trim() && !previewUrl)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={cn(
              "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
              "bg-gradient-to-br from-brand-600 to-brand-500 text-white",
              "shadow-[0_8px_20px_-8px_rgba(0,105,198,0.65)]",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
            aria-label={t.messaging.send}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </motion.button>
        ) : (
          <button
            type="button"
            disabled={disabled || isPending}
            className={cn(
              "inline-flex h-11 w-11 shrink-0 touch-none select-none items-center justify-center rounded-full transition-colors",
              isRecording
                ? isCancelling
                  ? "bg-surface-300 text-surface-700"
                  : "bg-red-500 text-white shadow-[0_8px_20px_-8px_rgba(239,68,68,0.55)]"
                : "bg-brand-50 text-brand-700 hover:bg-brand-100"
            )}
            aria-label={t.messaging.recordVoice}
            onPointerDown={(event) => {
              event.preventDefault();
              event.currentTarget.setPointerCapture(event.pointerId);
              void startRecording(event.clientX);
            }}
            onPointerMove={(event) => {
              if (!isRecording) return;
              updatePointer(event.clientX);
            }}
            onPointerUp={(event) => {
              event.preventDefault();
              if (isCancelling) {
                cancelRecording();
              } else {
                stopRecording();
              }
            }}
            onPointerCancel={() => cancelRecording()}
          >
            <Mic className="h-5 w-5" />
          </button>
        )}
      </motion.form>

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
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { formatVoiceDuration } from "@/lib/messaging/messaging-display";
import { cn } from "@/lib/utils";

const WAVEFORM_BARS = [3, 6, 4, 8, 5, 9, 4, 7, 3, 8, 5, 6, 4, 9, 5, 7, 4, 6, 8, 3];

interface AudioMessagePlayerProps {
  src: string;
  durationSeconds?: number | null;
  isOwn: boolean;
}

export function AudioMessagePlayer({ src, durationSeconds, isOwn }: AudioMessagePlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resolvedDuration, setResolvedDuration] = useState(durationSeconds ?? 0);

  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;

    const onTimeUpdate = () => {
      if (!audio.duration || Number.isNaN(audio.duration)) return;
      setProgress(audio.currentTime / audio.duration);
    };

    const onLoaded = () => {
      if (audio.duration && !Number.isNaN(audio.duration)) {
        setResolvedDuration(audio.duration);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
      audioRef.current = null;
    };
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    void audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  };

  const displayDuration = resolvedDuration > 0 ? resolvedDuration : (durationSeconds ?? 0);

  return (
    <div
      className={cn(
        "flex min-w-[200px] max-w-[260px] items-center gap-3 rounded-2xl px-3 py-2.5",
        isOwn ? "bg-white/10" : "bg-surface-50"
      )}
    >
      <button
        type="button"
        onClick={togglePlay}
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-105",
          isOwn ? "bg-white/20 text-white" : "bg-brand-600 text-white shadow-sm"
        )}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="ms-0.5 h-4 w-4" />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex h-7 items-end gap-[2px]">
          {WAVEFORM_BARS.map((height, index) => {
            const barProgress = index / WAVEFORM_BARS.length;
            const isActive = progress >= barProgress;
            return (
              <span
                key={index}
                className={cn(
                  "w-[3px] rounded-full transition-all duration-150",
                  isOwn
                    ? isActive
                      ? "bg-white"
                      : "bg-white/35"
                    : isActive
                      ? "bg-brand-500"
                      : "bg-brand-200"
                )}
                style={{ height: `${height + (isPlaying && isActive ? 2 : 0)}px` }}
              />
            );
          })}
        </div>
        <p className={cn("mt-1 text-[11px] font-medium tabular-nums", isOwn ? "text-white/80" : "text-surface-500")}>
          {formatVoiceDuration(displayDuration)}
        </p>
      </div>
    </div>
  );
}

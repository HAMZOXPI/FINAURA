"use client";

import { useCallback, useRef, useState } from "react";

const CANCEL_THRESHOLD_PX = 72;
const MIN_RECORDING_SECONDS = 0.5;

export interface VoiceRecordingResult {
  blob: Blob;
  durationSeconds: number;
}

interface UseVoiceRecorderOptions {
  onRecorded: (result: VoiceRecordingResult) => void;
  onError?: (message: string) => void;
}

export function useVoiceRecorder({ onRecorded, onError }: UseVoiceRecorderOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const startXRef = useRef(0);
  const cancelledRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const resetState = useCallback(() => {
    clearTimer();
    setIsRecording(false);
    setIsCancelling(false);
    setDuration(0);
    cancelledRef.current = false;
    chunksRef.current = [];
    mediaRecorderRef.current = null;
  }, [clearTimer]);

  const startRecording = useCallback(
    async (clientX: number) => {
      if (isRecording) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : "";

        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        streamRef.current = stream;
        mediaRecorderRef.current = recorder;
        chunksRef.current = [];
        cancelledRef.current = false;
        startXRef.current = clientX;
        startTimeRef.current = Date.now();

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunksRef.current.push(event.data);
        };

        recorder.onstop = () => {
          const elapsed = (Date.now() - startTimeRef.current) / 1000;
          stopStream();

          if (!cancelledRef.current && elapsed >= MIN_RECORDING_SECONDS && chunksRef.current.length > 0) {
            const blob = new Blob(chunksRef.current, {
              type: recorder.mimeType || "audio/webm",
            });
            onRecorded({ blob, durationSeconds: elapsed });
          }

          resetState();
        };

        recorder.start();
        setIsRecording(true);
        setDuration(0);

        timerRef.current = window.setInterval(() => {
          setDuration((Date.now() - startTimeRef.current) / 1000);
        }, 100);
      } catch {
        stopStream();
        resetState();
        onError?.("microphone");
      }
    },
    [isRecording, onError, onRecorded, resetState, stopStream]
  );

  const updatePointer = useCallback((clientX: number) => {
    if (!isRecording) return;
    const delta = startXRef.current - clientX;
    const cancelling = delta > CANCEL_THRESHOLD_PX;
    setIsCancelling(cancelling);
    cancelledRef.current = cancelling;
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    if (!isRecording || !mediaRecorderRef.current) return;
    clearTimer();
    if (mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    } else {
      stopStream();
      resetState();
    }
  }, [clearTimer, isRecording, resetState, stopStream]);

  const cancelRecording = useCallback(() => {
    if (!isRecording) return;
    cancelledRef.current = true;
    stopRecording();
  }, [isRecording, stopRecording]);

  return {
    isRecording,
    duration,
    isCancelling,
    startRecording,
    updatePointer,
    stopRecording,
    cancelRecording,
  };
}

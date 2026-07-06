const CELEBRATION_CHIME_SRC = "/sounds/celebration-chime.mp3";
const UI_CLICK_SRC = "/sounds/ui-click.mp3";

const CELEBRATION_VOLUME = 0.3;
const CLICK_VOLUME = 0.28;
export const CELEBRATION_SOUND_DELAY_MS = 200;

function createAudio(src: string, volume: number): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;

  const audio = new Audio(src);
  audio.preload = "auto";
  audio.volume = volume;
  return audio;
}

function playSilently(audio: HTMLAudioElement | null) {
  if (!audio) return;

  try {
    audio.currentTime = 0;
    const result = audio.play();
    if (result !== undefined) {
      void result.catch(() => {});
    }
  } catch {
    /* autoplay blocked or unsupported — fail silently */
  }
}

class CelebrationSoundManager {
  private chime: HTMLAudioElement | null = null;
  private click: HTMLAudioElement | null = null;
  private preloaded = false;

  preload() {
    if (this.preloaded || typeof window === "undefined") return;

    this.chime = createAudio(CELEBRATION_CHIME_SRC, CELEBRATION_VOLUME);
    this.click = createAudio(UI_CLICK_SRC, CLICK_VOLUME);

    this.chime?.load();
    this.click?.load();
    this.preloaded = true;
  }

  playCelebration() {
    playSilently(this.chime);
  }

  playClick() {
    playSilently(this.click);
  }

  dispose() {
    if (this.chime) {
      this.chime.pause();
      this.chime.src = "";
      this.chime = null;
    }
    if (this.click) {
      this.click.pause();
      this.click.src = "";
      this.click = null;
    }
    this.preloaded = false;
  }
}

let manager: CelebrationSoundManager | null = null;

export function getCelebrationSoundManager(): CelebrationSoundManager {
  if (!manager) {
    manager = new CelebrationSoundManager();
  }
  return manager;
}

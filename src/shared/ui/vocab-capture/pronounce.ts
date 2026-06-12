/**
 * Plays a word's pronunciation: prefers a real audio file (from the dictionary
 * API), falling back to the browser's speech synthesis. No-op on the server.
 */
export function pronounce(word: string, audioUrl?: string | null): void {
  if (typeof window === "undefined") return;

  if (audioUrl) {
    try {
      const audio = new Audio(audioUrl);
      audio.play().catch(() => speak(word));
      return;
    } catch {
      // fall through to TTS
    }
  }
  speak(word);
}

function speak(word: string): void {
  const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
  if (!synth) return;
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  synth.cancel();
  synth.speak(utterance);
}

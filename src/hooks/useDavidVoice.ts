import { useCallback, useEffect, useRef, useState } from "react";

interface RecognitionResult { isFinal: boolean; [index: number]: { transcript: string } }
interface Recognition {
  lang: string; interimResults: boolean; continuous: boolean;
  onresult: ((event: { resultIndex: number; results: ArrayLike<RecognitionResult> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void; stop(): void; abort(): void;
}
type SpeechWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };

/** Uses the existing server-side David persona; dictated text stays editable until sent. */
export function useDavidVoice(messageId: string, text: string, onTranscript: (text: string) => void) {
  const [voiceOn, setVoiceOn] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);
  const [error, setError] = useState("");
  const audio = useRef<HTMLAudioElement | null>(null);
  const recognition = useRef<Recognition | null>(null);
  const generation = useRef(0);
  const cache = useRef(new Map<string, string>());
  const lastSpoken = useRef("");
  const transcript = useRef(onTranscript);
  transcript.current = onTranscript;

  const stopSpeaking = useCallback(() => {
    generation.current += 1;
    if (audio.current) { audio.current.pause(); audio.current.onended = null; audio.current.src = ""; }
    audio.current = null;
    setSpeaking(false); setLoading(false); setNeedsTap(false);
  }, []);
  const stopListening = useCallback(() => { recognition.current?.abort(); recognition.current = null; setListening(false); }, []);

  const speak = useCallback(async (id: string, line: string) => {
    stopSpeaking();
    const current = generation.current;
    setError(""); setLoading(true);
    try {
      let url = cache.current.get(id);
      if (!url) {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/emily-tts`, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
          body: JSON.stringify({ text: line.replace(/\*\*/g, ""), persona: "david" }),
        });
        if (!response.ok) {
          const detail = await response.json().catch(() => null);
          let reason = detail?.message || detail?.error || `David’s voice is unavailable (${response.status}).`;
          try { const nested = JSON.parse(reason); reason = nested.message || nested.error?.message || reason; } catch { /* Already plain text. */ }
          throw new Error(reason);
        }
        const blob = await response.blob();
        if (!blob.size || !blob.type.startsWith("audio/")) throw new Error("David’s voice returned no playable audio.");
        if (generation.current !== current) return;
        url = URL.createObjectURL(blob); cache.current.set(id, url);
      }
      if (generation.current !== current) return;
      const player = new Audio(url); audio.current = player;
      player.onended = () => { if (audio.current === player) setSpeaking(false); };
      player.onerror = () => { if (audio.current === player) { setSpeaking(false); setError("David’s audio could not be played. You can still type your answer."); } };
      setLoading(false);
      try { await player.play(); if (generation.current === current) setSpeaking(true); }
      catch (e) { if (generation.current === current) { if (e instanceof DOMException && e.name === "NotAllowedError") setNeedsTap(true); else throw e; } }
    } catch (e) {
      if (generation.current === current) { setError(e instanceof Error ? e.message : "David’s voice is unavailable."); setVoiceOn(false); setSpeaking(false); setLoading(false); }
    }
  }, [stopSpeaking]);

  useEffect(() => {
    if (!voiceOn || !text || listening || lastSpoken.current === messageId) return;
    lastSpoken.current = messageId;
    void speak(messageId, text);
  }, [voiceOn, messageId, text, listening, speak]);

  useEffect(() => () => {
    generation.current += 1; audio.current?.pause(); recognition.current?.abort();
    cache.current.forEach((url) => URL.revokeObjectURL(url)); cache.current.clear();
  }, []);

  const toggleVoice = () => {
    stopSpeaking(); setError("");
    if (voiceOn) setVoiceOn(false);
    else { stopListening(); lastSpoken.current = messageId; setVoiceOn(true); void speak(messageId, text); }
  };
  const toggleListening = () => {
    if (listening) { recognition.current?.stop(); return; }
    const Constructor = (window as SpeechWindow).SpeechRecognition || (window as SpeechWindow).webkitSpeechRecognition;
    if (!Constructor) { setError("Voice input isn’t supported in this browser. Try Chrome or Safari, or type your answer."); return; }
    stopSpeaking(); setError("");
    const rec = new Constructor(); recognition.current = rec;
    rec.lang = "en-US"; rec.interimResults = true; rec.continuous = false;
    let finalText = "";
    rec.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalText += `${result[0].transcript} `; else interim += result[0].transcript;
      }
      transcript.current((finalText + interim).trim());
    };
    rec.onerror = (event) => { setListening(false); setError(event.error === "not-allowed" ? "Microphone permission was denied. Allow microphone access in your browser, or type your answer." : event.error === "no-speech" ? "No speech was detected. Tap the microphone to try again." : "Voice input stopped. You can type your answer or try the microphone again."); };
    rec.onend = () => { setListening(false); recognition.current = null; };
    try { rec.start(); setListening(true); } catch { setListening(false); setError("The microphone could not start. Please type your answer."); }
  };
  const replay = async () => {
    const player = audio.current;
    if (!player) return;
    try { await player.play(); setNeedsTap(false); setSpeaking(true); } catch { setError("Audio playback is blocked by this browser. You can still type your answer."); }
  };
  return { voiceOn, speaking, loading, listening, needsTap, error, toggleVoice, toggleListening, stopListening, replay };
}
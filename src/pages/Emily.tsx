import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ImagePlus, Send, X, RotateCcw, Package, Check, Mic, MicOff, Volume2, VolumeX, Play } from "lucide-react";
import { Link } from "react-router-dom";
import DemoLayout from "@/components/DemoLayout";
import emilyAvatar from "@/assets/emily-avatar.png";
import { loadChat, saveChat, clearChat, saveRecord, isChatComplete, markChatComplete, type PropertyRecord } from "@/lib/propertyRecord";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  image?: string;
}

const GREETING =
  "Hi, I'm Emily 👋 I'm your AI guide for protecting your property. Let's start simple — upload or snap a photo of the item you'd like to register, and I'll take it from there.";

const REGISTER_RE = /\[\[REGISTER\]\]\s*(\{[\s\S]*?\})/;
const DRAFT_RE = /\[\[DRAFT\]\]\s*(\{[\s\S]*?\})/;

const stripBlocks = (text: string) =>
  text.replace(/\[\[REGISTER\]\][\s\S]*$/, "").replace(/\[\[DRAFT\]\][\s\S]*$/, "").trim();

/** Render **bold** as actual <strong> instead of literal asterisks. */
const renderRichText = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
};

/** Strip emoji / symbols so the spoken line stays natural. */
const speakable = (text: string) =>
  text.replace(/\*\*/g, "").replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").trim();

const Emily = ({ onLogout }: { onLogout?: () => void }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = loadChat();
    if (saved.length && !isChatComplete()) return saved as ChatMessage[];
    if (saved.length) clearChat();
    return [{ role: "assistant", text: GREETING }];
  });
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [savedRecord, setSavedRecord] = useState<PropertyRecord | null>(null);
  const [voiceOn, setVoiceOn] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);
  const [listening, setListening] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastImageRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const greetedRef = useRef(false);

  const isIntro = messages.length === 1 && messages[0].role === "assistant";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy, savedRecord]);

  useEffect(() => {
    if (!busy) saveChat(messages);
  }, [messages, busy]);

  /* ---------------- Emily's voice ---------------- */

  const stopSpeaking = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setSpeaking(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    const line = speakable(text);
    if (!line) return false;
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/emily-tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text: line }),
      });
      if (!res.ok) throw new Error(await res.text().catch(() => "tts failed"));
      const url = URL.createObjectURL(await res.blob());
      stopSpeaking();
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setSpeaking(false);
        URL.revokeObjectURL(url);
      };
      setSpeaking(true);
      await audio.play();
      return true;
    } catch {
      setSpeaking(false);
      return false;
    }
  }, [stopSpeaking]);

  /* Speak the greeting once when the user lands on Emily */
  useEffect(() => {
    if (greetedRef.current || !isIntro || !voiceOn) return;
    greetedRef.current = true;
    speak(messages[0].text).then((ok) => {
      if (!ok) setNeedsTap(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- Voice input ---------------- */

  const toggleListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setInput((v) => v);
      alert("Voice input isn't supported in this browser. Please type your reply.");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    stopSpeaking();
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    let finalText = "";
    rec.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const chunk = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += chunk;
        else interim += chunk;
      }
      setInput((finalText + interim).trim());
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  };

  /* ---------------- Records ---------------- */

  const pickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPendingImage(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const draftFromBlock = (raw: string) => {
    const match = raw.match(DRAFT_RE);
    if (!match) return;
    try {
      const d = JSON.parse(match[1]);
      saveRecord({
        pin: d.pin || `FL-DNA-${Math.floor(1000 + Math.random() * 9000)}-AX`,
        item: d.item || "Item in registration",
        category: d.category || "General Property",
        owner: "—",
        phone: "—",
        county: "—",
        serial: "—",
        serialLabel: "Serial #",
        value: d.value || "—",
        img: lastImageRef.current || "",
        dnaLocations: [],
        score: Number(d.score) || 30,
        registeredAt: new Date().toISOString(),
        status: "draft",
      });
    } catch {
      /* ignore malformed block */
    }
  };

  const registerFromBlock = (raw: string) => {
    const match = raw.match(REGISTER_RE);
    if (!match) return;
    try {
      const d = JSON.parse(match[1]);
      const record: PropertyRecord = {
        pin: d.pin || `FL-DNA-${Math.floor(1000 + Math.random() * 9000)}-AX`,
        item: d.item || "Registered item",
        category: d.category || "General Property",
        owner: d.owner || "—",
        phone: d.phone || "—",
        county: d.county || "—",
        serial: d.serial || "—",
        serialLabel: d.serialLabel || "Serial #",
        value: d.value || "—",
        img: lastImageRef.current || "",
        dnaLocations: (d.dnaSpots || []).map((label: string) => ({ label, x: 0, y: 0, applied: true })),
        score: Number(d.score) || 85,
        registeredAt: new Date().toISOString(),
        status: "protected",
      };
      saveRecord(record);
      markChatComplete();
      setSavedRecord(record);
    } catch {
      /* ignore malformed block */
    }
  };

  const resetChat = () => {
    stopSpeaking();
    clearChat();
    setSavedRecord(null);
    setMessages([{ role: "assistant", text: GREETING }]);
    if (voiceOn) speak(GREETING);
  };

  const send = async () => {
    if (busy || (!input.trim() && !pendingImage)) return;
    stopSpeaking();
    const userMsg: ChatMessage = {
      role: "user",
      text: input.trim() || "Here's a photo of my item.",
      ...(pendingImage ? { image: pendingImage } : {}),
    };
    if (pendingImage) lastImageRef.current = pendingImage;
    const next = [...messages, userMsg];
    setMessages([...next, { role: "assistant", text: "" }]);
    setInput("");
    setPendingImage(null);
    setBusy(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/emily-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: next }),
        }
      );

      if (!res.ok || !res.body) {
        const detail = await res.text().catch(() => "");
        throw new Error(detail || "request failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const evt = JSON.parse(payload);
            if (evt.type === "response.output_text.delta" && evt.delta) {
              acc += evt.delta;
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", text: stripBlocks(acc) };
                return copy;
              });
            }
          } catch {
            /* ignore partial frames */
          }
        }
      }

      if (!acc.trim()) {
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = {
            role: "assistant",
            text: "Sorry, I didn't catch that — could you try again?",
          };
          return copy;
        });
      } else {
        draftFromBlock(acc);
        registerFromBlock(acc);
        if (voiceOn) speak(stripBlocks(acc));
      }
    } catch {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: "assistant",
          text: "I couldn't reach my assistant service just now. Please try again in a moment.",
        };
        return copy;
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <DemoLayout
      title="Emily – AI Guide"
      subtitle="Guided registration & DNA placement"
      icon={
        <span className="block w-8 h-8 rounded-full overflow-hidden ring-1 ring-primary/30 bg-primary/10">
          <img src={emilyAvatar} alt="Emily AI" className="w-full h-full object-cover object-top" />
        </span>
      }
      onLogout={onLogout}
    >



      {/* Intro: Emily front and centre */}
      {isIntro && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center px-6 pt-4 pb-2"
        >
          <motion.div
            animate={speaking ? { scale: [1, 1.04, 1] } : { scale: 1 }}
            transition={speaking ? { repeat: Infinity, duration: 1.4 } : { duration: 0.3 }}
            className={`w-28 h-28 rounded-full overflow-hidden bg-primary/10 ring-2 ${
              speaking ? "ring-primary shadow-[0_0_28px_hsl(var(--primary)/0.35)]" : "ring-primary/25"
            }`}
          >
            <img src={emilyAvatar} alt="Emily, your AI guide" className="w-full h-full object-cover object-top" />
          </motion.div>
          <div className="mt-2 text-sm font-semibold text-foreground">Emily</div>
          <div className="text-[10px] text-muted-foreground">
            {speaking ? "Speaking…" : "Your AI property guide"}
          </div>
          {needsTap && !speaking && (
            <button
              onClick={() => {
                setNeedsTap(false);
                speak(messages[0].text);
              }}
              className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold"
            >
              <Play className="w-3 h-3" /> Tap to hear Emily
            </button>
          )}
        </motion.div>
      )}

      <div className="px-4 space-y-3 pb-32 pt-2">
        {messages.map((m, i) =>
          m.role === "assistant" ? (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 overflow-hidden flex-shrink-0 ring-1 ring-primary/20">
                <img src={emilyAvatar} alt="Emily AI" className="w-full h-full object-cover object-top" />
              </div>
              <div className="glass-card px-3 py-2 text-xs text-foreground leading-relaxed whitespace-pre-wrap max-w-[80%]">
                {renderRichText(m.text || (busy && i === messages.length - 1 ? "Emily is typing…" : ""))}
              </div>
            </motion.div>
          ) : (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
              <div className="max-w-[80%] rounded-xl bg-primary text-primary-foreground px-3 py-2 text-xs leading-relaxed">
                {m.image && (
                  <img src={m.image} alt="Uploaded item" className="rounded-lg mb-2 w-full object-cover" />
                )}
                {m.text}
              </div>
            </motion.div>
          )
        )}

        {savedRecord && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-3">
            <div className="flex items-center gap-2 text-success mb-2">
              <Check className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">Saved to My Property</span>
            </div>
            <div className="text-xs font-semibold text-foreground">{savedRecord.item}</div>
            <div className="text-[10px] text-muted-foreground mb-1">{savedRecord.category}</div>
            <div className="font-mono text-xs text-accent mb-1">{savedRecord.pin}</div>
            <div className="text-[10px] text-muted-foreground mb-3">
              Protection Score {savedRecord.score}/100 · {savedRecord.dnaLocations.length} DNA spots recorded
            </div>
            <Link
              to="/property-proof"
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs mb-2"
            >
              <Package className="w-3.5 h-3.5" /> Go to My Properties
            </Link>
            <button
              onClick={resetChat}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-muted text-foreground font-semibold text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Protect another item
            </button>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-background/95 backdrop-blur border-t border-border px-3 py-2 pb-3">
        {pendingImage && (
          <div className="relative mb-2 w-16 h-16">
            <img src={pendingImage} alt="Selected" className="w-16 h-16 rounded-lg object-cover border border-border" />
            <button
              onClick={() => setPendingImage(null)}
              aria-label="Remove image"
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        {listening && (
          <div className="mb-1.5 text-[10px] text-primary font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Listening… speak now
          </div>
        )}
        <div className="flex items-end gap-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickImage} />
          <button
            onClick={() => fileRef.current?.click()}
            aria-label="Upload photo"
            className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0"
          >
            <ImagePlus className="w-4 h-4 text-primary" />
          </button>
          <button
            onClick={toggleListening}
            aria-label={listening ? "Stop voice input" : "Speak to Emily"}
            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              listening ? "bg-primary text-primary-foreground" : "bg-muted text-primary"
            }`}
          >
            {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Message or speak to Emily…"
            className="flex-1 resize-none px-3 py-2 rounded-lg bg-muted border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring max-h-24"
          />
          <button
            onClick={send}
            disabled={busy || (!input.trim() && !pendingImage)}
            aria-label="Send message"
            className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </DemoLayout>
  );
};

export default Emily;

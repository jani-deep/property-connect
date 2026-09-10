import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ImagePlus, Send, X, RotateCcw, Package, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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

const REGISTER_RE = /\[\[REGISTER\]\]\s*(\{[\s\S]*\})/;

const stripRegisterBlock = (text: string) => text.replace(/\[\[REGISTER\]\][\s\S]*$/, "").trim();

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

const Emily = ({ onLogout }: { onLogout?: () => void }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = loadChat();
    // Resume mid-flow only; a completed registration starts a fresh chat
    if (saved.length && !isChatComplete()) return saved as ChatMessage[];
    if (saved.length) clearChat();
    return [{ role: "assistant", text: GREETING }];
  });
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [savedRecord, setSavedRecord] = useState<PropertyRecord | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastImageRef = useRef<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy, savedRecord]);

  useEffect(() => {
    if (!busy) saveChat(messages);
  }, [messages, busy]);

  const pickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPendingImage(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
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
      };
      saveRecord(record);
      markChatComplete();
      setSavedRecord(record);
      setTimeout(() => navigate("/"), 4000);
    } catch {
      /* ignore malformed block */
    }
  };

  const resetChat = () => {
    clearChat();
    setSavedRecord(null);
    setMessages([{ role: "assistant", text: GREETING }]);
  };

  const send = async () => {
    if (busy || (!input.trim() && !pendingImage)) return;
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
                copy[copy.length - 1] = { role: "assistant", text: stripRegisterBlock(acc) };
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
        registerFromBlock(acc);
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
      <div className="px-4 py-3 flex justify-end">
        <button
          onClick={resetChat}
          className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-3 h-3" /> Start a new item
        </button>
      </div>

      <div className="px-4 space-y-3 pb-32">
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
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs"
            >
              <Package className="w-3.5 h-3.5" /> View in My Property
            </Link>
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
        <div className="flex items-end gap-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickImage} />
          <button
            onClick={() => fileRef.current?.click()}
            aria-label="Upload photo"
            className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0"
          >
            <ImagePlus className="w-4 h-4 text-primary" />
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
            placeholder="Message Emily…"
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

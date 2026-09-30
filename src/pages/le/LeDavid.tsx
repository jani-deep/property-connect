import { useEffect, useRef, useState } from "react";
import { Bot, ImagePlus, Loader2, RotateCcw, Send, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addAudit } from "@/lib/leData";

interface Msg { role: "user" | "assistant"; text: string; image?: string }
const KEY = "propertyproof.le.david";
const greeting: Msg = { role: "assistant", text: "Hi, I'm **David**, your AI investigator. Send me a photo of a recovered item, or give me an exact DNA PIN, serial, VIN or IMEI and I'll check it against the statewide registry. I can also help you draft a case summary." };
const suggestions = ["Check PIN FL-DNA-7829-AX", "Look up VIN WBA53BJ09RWC18294", "How do I request an owner reveal?", "Draft a case summary for a recovered laptop"];

const renderText = (t: string) =>
  t.split("\n").map((line, i) => (
    <p key={i} className={line.trim() === "" ? "h-2" : ""}>
      {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => part.startsWith("**") && part.endsWith("**") ? <strong key={j}>{part.slice(2, -2)}</strong> : part.replace(/^\s*[-*]\s/, "• "))}
    </p>
  ));

const LeDavid = () => {
  const [messages, setMessages] = useState<Msg[]>(() => { try { const s = JSON.parse(localStorage.getItem(KEY) || "null"); return Array.isArray(s) && s.length ? s : [greeting]; } catch { return [greeting]; } });
  const [input, setInput] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); localStorage.setItem(KEY, JSON.stringify(messages.slice(-40).map((m, i, a) => (i < a.length - 4 ? { role: m.role, text: m.text } : m)))); }, [messages]);

  const send = async (text = input) => {
    if ((!text.trim() && !image) || busy) return;
    const userMsg: Msg = { role: "user", text: text.trim(), image: image ?? undefined };
    const history = [...messages, userMsg];
    setMessages([...history, { role: "assistant", text: "" }]);
    setInput(""); setImage(null); setBusy(true); setError("");
    addAudit({ action: "David query", reason: "AI investigator", caseNo: "—", data: userMsg.image ? "Photo identification" : userMsg.text.slice(0, 60) });
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/david-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok || !res.body) throw new Error(res.status === 402 ? "AI credits are used up for this workspace." : res.status === 429 ? "David is busy — try again in a moment." : "David couldn't respond.");
      const reader = res.body.getReader(); const dec = new TextDecoder(); let buf = ""; let acc = "";
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n"); buf = lines.pop() || "";
        for (const l of lines) {
          if (!l.startsWith("data:")) continue;
          try { const evt = JSON.parse(l.slice(5).trim()); if (evt.type === "response.output_text.delta" && evt.delta) { acc += evt.delta; setMessages((m) => [...m.slice(0, -1), { role: "assistant", text: acc }]); } } catch { /* partial */ }
        }
      }
      if (!acc) throw new Error("David returned no answer.");
    } catch (e) {
      setMessages((m) => m.slice(0, -1)); setError((e as Error).message);
    } finally { setBusy(false); taRef.current?.focus(); }
  };

  const onFile = (f?: File) => { if (!f) return; const r = new FileReader(); r.onload = () => setImage(r.result as string); r.readAsDataURL(f); };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col font-body">
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Bot className="h-5 w-5 text-primary" /></div>
          <div><h1 className="font-heading text-lg font-bold leading-tight">David Operations</h1><p className="text-xs text-muted-foreground">AI investigator · every query is audited</p></div>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setMessages([greeting]); setError(""); }}><RotateCcw /> New session</Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-3xl space-y-5">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${m.role === "user" ? "bg-muted" : "bg-primary/10"}`}>{m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}</div>
              <div className={`max-w-[80%] text-sm leading-relaxed ${m.role === "user" ? "rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-primary-foreground" : "pt-1 text-foreground"}`}>
                {m.image && <img src={m.image} alt="Uploaded item" className="mb-2 max-h-56 rounded-lg" />}
                {m.text ? renderText(m.text) : <span className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> David is investigating…</span>}
              </div>
            </div>
          ))}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 pl-11">{suggestions.map((s) => <button key={s} onClick={() => send(s)} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs hover:bg-muted">{s}</button>)}</div>
          )}
          {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          <div ref={endRef} />
        </div>
      </div>

      <div className="border-t border-border bg-card px-4 py-3 sm:px-8">
        <div className="mx-auto max-w-3xl">
          {image && <div className="relative mb-2 inline-block"><img src={image} alt="" className="h-16 rounded-md border border-border" /><button onClick={() => setImage(null)} className="absolute -right-2 -top-2 rounded-full bg-foreground p-0.5 text-background" aria-label="Remove photo"><X className="h-3 w-3" /></button></div>}
          <div className="flex items-end gap-2 rounded-xl border border-input bg-background p-2">
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
            <Button variant="ghost" size="icon" onClick={() => fileRef.current?.click()} aria-label="Attach photo"><ImagePlus /></Button>
            <textarea ref={taRef} autoFocus rows={1} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Ask David, or enter a PIN / serial / VIN…" className="max-h-32 flex-1 resize-none bg-transparent py-2 text-sm outline-none" />
            <Button size="icon" onClick={() => send()} disabled={busy || (!input.trim() && !image)} aria-label="Send">{busy ? <Loader2 className="animate-spin" /> : <Send />}</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeDavid;

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Bot, Check, ImagePlus, Loader2, Mic, MicOff, RotateCcw, Send, ShieldCheck, User, UserPlus, Volume2, VolumeX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addApproval, addAudit, leRecords } from "@/lib/leData";
import { Link } from "react-router-dom";
import { loadRecords } from "@/lib/propertyRecord";
import { findRecordInText, BRIDGE_CHANGE, loadEvents, loadStages, loadStolen, RETURN_STAGES, setStage, type BridgeEvent } from "@/lib/bridge";
import { maskPin } from "@/lib/mask";

interface Msg { role: "user" | "assistant"; text: string; image?: string }
const KEY = "propertyproof.le.david";
const greeting: Msg = { role: "assistant", text: "Hi, I'm **David**, your AI investigator. Send me a photo of a recovered item, or give me an exact DNA PIN, serial, VIN or IMEI. I also see every item residents register with **Emily** and every theft they report, live." };
const suggestions = ["Check PIN FL-DNA-7829-AX", "What's new from Emily today?", "Look up VIN WBA53BJ09RWC18294", "How does Emily connect to you?"];
const sb = { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` };

const renderText = (t: string) =>
  t.split("\n").map((line, i) => (
    <p key={i} className={line.trim() === "" ? "h-2" : ""}>
      {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => part.startsWith("**") && part.endsWith("**") ? <strong key={j}>{part.slice(2, -2)}</strong> : part.replace(/^\s*[-*]\s/, "• "))}
    </p>
  ));

const eventMeta: Record<BridgeEvent["type"], { label: string; icon: typeof Bot; cls: string }> = {
  registered: { label: "Registered via Emily", icon: UserPlus, cls: "text-primary bg-primary/10" },
  stolen: { label: "Reported stolen via Emily", icon: AlertTriangle, cls: "text-destructive bg-destructive/10" },
  match: { label: "Matched by officer", icon: Bot, cls: "text-accent bg-accent/10" },
  reveal: { label: "Owner reveal requested", icon: ShieldCheck, cls: "text-warning bg-warning/10" },
  approved: { label: "Supervisor approved", icon: Check, cls: "text-success bg-success/10" },
  returned: { label: "Returned to owner", icon: Check, cls: "text-success bg-success/10" },
};

const useBridge = () => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    window.addEventListener(BRIDGE_CHANGE, bump); window.addEventListener("storage", bump);
    const id = setInterval(bump, 3000);
    return () => { window.removeEventListener(BRIDGE_CHANGE, bump); window.removeEventListener("storage", bump); clearInterval(id); };
  }, []);
  return useMemo(() => {
    const stolen = loadStolen();
    const resident = loadRecords().filter((r) => r.status !== "draft").map((r) => ({ pin: r.pin, item: r.item, serial: r.serial, county: r.county, status: stolen.includes(r.pin) ? "Stolen" : "Protected" }));
    const base = leRecords.map((r) => ({ pin: r.pin, item: r.item, serial: r.serial, county: r.county, status: r.status as string }));
    return { registry: [...resident, ...base], resident, events: loadEvents(), stages: loadStages() };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);
};

const LeDavid = () => {
  const [messages, setMessages] = useState<Msg[]>(() => { try { const s = JSON.parse(localStorage.getItem(KEY) || "null"); return Array.isArray(s) && s.length ? s : [greeting]; } catch { return [greeting]; } });
  const [input, setInput] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [voiceOn, setVoiceOn] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const voiceRef = useRef(false); voiceRef.current = voiceOn;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recRef = useRef<any>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const { registry, resident, events, stages } = useBridge();
  type Intake = { pin: string; item: string; county: string; serial: string; step: number; answers: string[] };
  const [intake, setIntake] = useState<Intake | null>(null);
  const intakeRef = useRef<Intake | null>(null);
  const say = (text: string) => { setMessages((m) => [...m, { role: "assistant", text }]); speak(text); };
  const INTAKE_Q = [
    "**2 of 3 · Case number:** what's the agency case number for this?",
    "**3 of 3 · DNA kit reason:** how was the DNA microdot found or read? (for example: scanned with the field kit, UV light on the caseback)",
  ];
  const handleIntake = (answer: string) => {
    const cur = intakeRef.current!; const answers = [...cur.answers, answer];
    setMessages((m) => [...m, { role: "user", text: answer }]);
    if (/^(cancel|stop)$/i.test(answer)) { intakeRef.current = null; setIntake(null); say("Okay, I've cancelled that request. Nothing was sent."); return; }
    if (answers.length < 3) { intakeRef.current = { ...cur, answers, step: answers.length }; setIntake(intakeRef.current); say(INTAKE_Q[answers.length - 1]); return; }
    const [reason, caseNo, dnaReason] = answers;
    const ticket = `TKT-${Date.now().toString().slice(-6)}`;
    addApproval({ item: cur.item, pin: cur.pin, serial: cur.serial, category: ownerOf(cur.pin)?.category ?? "Property", reason, caseNo, dnaReason, county: cur.county, ticket });
    setStage(cur.pin, cur.item, cur.county, 1);
    addAudit({ action: "Owner reveal requested", reason, caseNo, data: `${ticket} · ${cur.pin}` });
    intakeRef.current = null; setIntake(null);
    say(`Done. I've raised ticket **${ticket}** and sent it to a supervisor in the Approval Queue.\n\n**Item:** ${cur.item}\n**Reason:** ${reason}\n**Case:** ${caseNo}\n**DNA kit:** ${dnaReason}\n\nOnce it's approved, the owner's details will show in the side panel.`);
  };

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); localStorage.setItem(KEY, JSON.stringify(messages.slice(-40).map((m, i, a) => (i < a.length - 4 ? { role: m.role, text: m.text } : m)))); }, [messages]);

  const stopSpeaking = useCallback(() => { audioRef.current?.pause(); audioRef.current = null; setSpeaking(false); }, []);
  const speak = useCallback(async (text: string) => {
    if (!voiceRef.current) return;
    const line = text.replace(/\*\*/g, "").replace(/^\s*[-*]\s/gm, "").trim();
    if (!line) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/emily-tts`, { method: "POST", headers: sb, body: JSON.stringify({ text: line, persona: "david" }) });
      if (!res.ok || !voiceRef.current) return;
      const url = URL.createObjectURL(await res.blob());
      stopSpeaking();
      const a = new Audio(url); audioRef.current = a;
      a.onended = () => { setSpeaking(false); URL.revokeObjectURL(url); };
      setSpeaking(true); await a.play();
    } catch { setSpeaking(false); }
  }, [stopSpeaking]);

  const send = async (text = input) => {
    if ((!text.trim() && !image) || busy) return;
    stopSpeaking();
    if (intakeRef.current && text.trim()) { setInput(""); handleIntake(text.trim()); return; }
    const wantsReveal = /reveal|owner|ticket|approval/i.test(text);
    const pinHit = registry.find((r) => text.toUpperCase().includes(r.pin) || (r.serial && text.toUpperCase().includes(r.serial.toUpperCase())));
    const lastCase = Object.keys(stages).find((p) => stages[p] === 0);
    const target = pinHit ?? (lastCase ? registry.find((r) => r.pin === lastCase) : undefined);
    if (wantsReveal && target && (stages[target.pin] ?? 0) === 0 && /request|raise|reveal/i.test(text)) {
      setInput(""); setMessages((m) => [...m, { role: "user", text: text.trim() }]);
      if (stages[target.pin] === undefined) setStage(target.pin, target.item, target.county, 0);
      startIntake(target); return;
    }
    const userMsg: Msg = { role: "user", text: text.trim(), image: image ?? undefined };
    const history = [...messages, userMsg];
    setMessages([...history, { role: "assistant", text: "" }]);
    setInput(""); setImage(null); setBusy(true); setError("");
    addAudit({ action: "David query", reason: "AI investigator", caseNo: "—", data: userMsg.image ? "Photo identification" : userMsg.text.slice(0, 60) });
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/david-chat`, { method: "POST", headers: sb, body: JSON.stringify({ messages: history, registry: resident, feed: events.slice(0, 15) }) });
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
      speak(acc);
      // Auto-open a return case when David's answer names a known stolen PIN.
      const named = findRecordInText(text, registry);
      const hit = registry.find((r) => r.status === "Stolen" && ((acc + text).toUpperCase().includes(r.pin) || r.pin === named?.pin));
      if (hit && stages[hit.pin] === undefined) setStage(hit.pin, hit.item, hit.county, 0);
    } catch (e) {
      setMessages((m) => m.slice(0, -1)); setError((e as Error).message);
    } finally { setBusy(false); taRef.current?.focus(); }
  };

  const toggleMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setError("Voice input isn't supported in this browser. Please type instead."); return; }
    if (listening) { recRef.current?.stop(); return; }
    stopSpeaking();
    const rec = new SR(); rec.lang = "en-US"; rec.interimResults = true; let final = "";
    rec.onresult = (e: any) => { let interim = ""; for (let i = e.resultIndex; i < e.results.length; i++) { const c = e.results[i][0].transcript; if (e.results[i].isFinal) final += c; else interim += c; } setInput((final + interim).trim()); };
    rec.onerror = () => setListening(false);
    rec.onend = () => { setListening(false); if (final.trim()) send(final.trim()); };
    recRef.current = rec; setListening(true); rec.start();
  };

  const onFile = (f?: File) => { if (!f) return; const r = new FileReader(); r.onload = () => setImage(r.result as string); r.readAsDataURL(f); };

  const stats = [
    { label: "From Emily", value: resident.length, cls: "text-primary" },
    { label: "Stolen", value: registry.filter((r) => r.status === "Stolen").length, cls: "text-destructive" },
    { label: "Recovered", value: registry.filter((r) => r.status === "Recovered").length + Object.values(stages).filter((s) => s === 3).length, cls: "text-success" },
    { label: "Pending reveals", value: Object.values(stages).filter((s) => s === 1).length, cls: "text-warning" },
  ];

  const ownerOf = (pin: string) => { const r = loadRecords().find((x) => x.pin === pin) ?? leRecords.find((x) => x.pin === pin); return r ? { owner: r.owner, phone: r.phone, category: r.category } : undefined; };
  const startIntake = (c: { pin: string; item: string; county: string; serial?: string }) => {
    intakeRef.current = { pin: c.pin, item: c.item, county: c.county, serial: c.serial ?? "", step: 0, answers: [] };
    setIntake(intakeRef.current);
    say(`I'll raise an owner-reveal ticket for **${c.item}** (${maskPin(c.pin)}). I need three details, one at a time.\n\n**1 of 3 · Reason for the match:** why are you checking this item? (for example: recovered at a pawn shop, traffic stop)`);
  };
  // Side panel only shows items discussed in this chat session.
  const chatText = messages.map((m) => m.text).join(" ").toUpperCase();
  const chatPins = new Set(registry.filter((r) => chatText.includes(r.pin) || (r.serial && r.serial.length > 5 && chatText.includes(r.serial.toUpperCase()))).map((r) => r.pin));
  messages.filter((m) => m.role === "user").forEach((m) => { const h = findRecordInText(m.text, registry); if (h) chatPins.add(h.pin); });
  const cases = Object.entries(stages).filter(([pin]) => chatPins.has(pin)).map(([pin, stage]) => ({ ...(registry.find((r) => r.pin === pin) ?? { pin, item: pin, county: "", serial: "", status: "" }), stage }));

  return (
    <div className="flex h-[calc(100vh-3.5rem)] font-body">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ${speaking ? "ring-2 ring-primary animate-pulse" : ""}`}><Bot className="h-5 w-5 text-primary" /></div>
            <div><h1 className="font-heading text-lg font-bold leading-tight">David Operations</h1><p className="text-xs text-muted-foreground">{speaking ? "Speaking…" : listening ? "Listening…" : "AI investigator · linked to Emily · every query audited"}</p></div>
          </div>
          <div className="flex gap-2">
            <Button variant={voiceOn ? "default" : "outline"} size="sm" onClick={() => { if (voiceOn) stopSpeaking(); setVoiceOn(!voiceOn); }}>{voiceOn ? <Volume2 /> : <VolumeX />} Voice {voiceOn ? "on" : "off"}</Button>
            <Button variant="outline" size="sm" onClick={() => { stopSpeaking(); setMessages([greeting]); setError(""); }}><RotateCcw /> New session</Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
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
            {messages.length === 1 && <div className="flex flex-wrap gap-2 pl-11">{suggestions.map((s) => <button key={s} onClick={() => send(s)} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs hover:bg-muted">{s}</button>)}</div>}
            {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
            <div ref={endRef} />
          </div>
        </div>

        <div className="border-t border-border bg-card px-4 py-3 sm:px-6">
          <div className="mx-auto max-w-3xl">
            {image && <div className="relative mb-2 inline-block"><img src={image} alt="" className="h-16 rounded-md border border-border" /><button onClick={() => setImage(null)} className="absolute -right-2 -top-2 rounded-full bg-foreground p-0.5 text-background" aria-label="Remove photo"><X className="h-3 w-3" /></button></div>}
            <div className="flex items-end gap-2 rounded-xl border border-input bg-background p-2">
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
              <Button variant="ghost" size="icon" onClick={() => fileRef.current?.click()} aria-label="Attach photo"><ImagePlus /></Button>
              <textarea ref={taRef} autoFocus rows={1} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder={intake ? "Answer David… (type cancel to stop)" : listening ? "Listening… speak now" : "Ask or speak to David, or enter a PIN / serial / VIN…"} className="max-h-32 flex-1 resize-none bg-transparent py-2 text-sm outline-none" />
              <Button variant={listening ? "destructive" : "ghost"} size="icon" onClick={toggleMic} aria-label="Speak to David">{listening ? <MicOff /> : <Mic />}</Button>
              <Button size="icon" onClick={() => send()} disabled={busy || (!input.trim() && !image)} aria-label="Send">{busy ? <Loader2 className="animate-spin" /> : <Send />}</Button>
            </div>
          </div>
        </div>
      </div>

      <aside className="hidden w-80 shrink-0 overflow-y-auto border-l border-border bg-card/50 p-4 lg:block">
        <div className="mb-5 grid grid-cols-2 gap-2">
          {stats.map((s) => <div key={s.label} className="rounded-lg border border-border bg-card p-3"><div className={`font-heading text-2xl font-bold ${s.cls}`}>{s.value}</div><div className="text-[11px] text-muted-foreground">{s.label}</div></div>)}
        </div>

        <h2 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Match to return</h2>
        <div className="mb-5 space-y-2">
          {cases.length === 0 && <p className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">Ask David about a stolen item and its return case shows here.</p>}
          {cases.map((c) => (
            <div key={c.pin} className="rounded-lg border border-border bg-card p-3">
              <div className="text-sm font-semibold leading-tight">{c.item}</div>
              <div className="mb-2 font-mono text-[11px] text-muted-foreground">{maskPin(c.pin)} · {c.county}</div>
              <div className="mb-2 flex gap-1">{RETURN_STAGES.map((_, i) => <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= c.stage ? "bg-primary" : "bg-muted"}`} />)}</div>
              <div className="mb-2 text-xs font-medium">{RETURN_STAGES[c.stage]}</div>
              {c.stage === 0 && <Button size="sm" variant="outline" className="h-7 w-full text-xs" disabled={!!intake} onClick={() => startIntake(c)}>{intake?.pin === c.pin ? "David is collecting details…" : "Ask David to raise a ticket"}</Button>}
              {c.stage === 1 && <p className="rounded-md bg-warning/10 px-2 py-1.5 text-[11px] text-warning">Waiting for supervisor in <Link to="/le/approvals" className="font-semibold underline">Approval Queue</Link></p>}
              {c.stage === 2 && (() => { const o = ownerOf(c.pin); return (
                <div className="space-y-2">
                  <div className="rounded-md bg-success/10 p-2 text-xs"><div className="text-[10px] font-semibold uppercase text-success">Owner (approved reveal)</div><div className="font-semibold">{o?.owner || "Owner on file"}</div><div className="font-mono">{o?.phone || "—"}</div></div>
                  <Button size="sm" className="h-7 w-full text-xs" onClick={() => { setStage(c.pin, c.item, c.county, 3); addAudit({ action: "Returned to owner", reason: "Recovered property return", caseNo: "—", data: c.pin }); }}>Mark returned to owner</Button>
                </div>); })()}
              {c.stage === 3 && <p className="text-[11px] text-success">Back with owner · shows as protected in their app</p>}
            </div>
          ))}
        </div>

        <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground"><span className="h-2 w-2 animate-pulse rounded-full bg-success" /> Live from Emily</h2>
        <div className="space-y-2">
          {events.filter((e) => chatPins.has(e.pin)).length === 0 && <p className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">Updates from Emily for the items in this chat show here.</p>}
          {events.filter((e) => chatPins.has(e.pin)).slice(0, 20).map((e) => { const m = eventMeta[e.type]; const Icon = m.icon; return (
            <div key={e.id} className="flex gap-2.5 rounded-lg border border-border bg-card p-2.5">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${m.cls}`}><Icon className="h-3.5 w-3.5" /></div>
              <div className="min-w-0"><div className="truncate text-xs font-semibold">{e.item}</div><div className="text-[11px] text-muted-foreground">{m.label} · {new Date(e.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div></div>
            </div>); })}
        </div>
      </aside>
    </div>
  );
};

export default LeDavid;

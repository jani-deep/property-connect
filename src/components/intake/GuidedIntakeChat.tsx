import { useEffect, useRef, useState } from "react";
import { Check, ImagePlus, Mic, MicOff, Pause, Pencil, Play, ShieldCheck, Volume2, VolumeX } from "lucide-react";
import { useDavidVoice } from "@/hooks/useDavidVoice";
import { Button } from "@/components/ui/button";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputSubmit } from "@/components/ai-elements/prompt-input";
import { answerIntake, chatMessage, initialQuestion, questions, type IntakeQuestion } from "@/lib/intakeConversation";
import { canSubmit, submitIntake, updateIntake, type IntakeSession } from "@/lib/intakeSessions";
import { loadRecords } from "@/lib/propertyRecord";
import { RecoveryPackage } from "./RecoveryPackage";
import WitnessInvitations from "./WitnessInvitations";
import FictionalEvidence from "./FictionalEvidence";
import DavidInvestigation from "./DavidInvestigation";
import davidAvatar from "@/assets/david-avatar.jpg";

export default function GuidedIntakeChat({ session, onChange }: { session: IntakeSession; onChange: (s: IntakeSession) => void }) {
  const [input, setInput] = useState(""); const [error, setError] = useState(""); const [attest, setAttest] = useState(false); const [showRecords, setShowRecords] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null); const fileRef = useRef<HTMLInputElement>(null);
  const question = initialQuestion(session);
  const messages = session.intakeMessages?.length ? session.intakeMessages : [chatMessage("assistant", questions[question])];
  const latest = [...messages].reverse().find((message) => message.role === "assistant");
  const spokenText = latest?.parts.flatMap((part) => part.type === "text" ? [part.text] : []).join(" ") ?? "";
  const voice = useDavidVoice(latest?.id ?? `initial-${question}`, spokenText, setInput);
  useEffect(() => { ref.current?.focus(); }, [question]);
  const save = (patch: Partial<IntakeSession>, action?: string) => { try { onChange(updateIntake(session, patch, action)); setError(""); } catch { setError("Your progress could not be saved in this browser. Try removing large files."); } };
  const answer = (text: string) => {
    voice.stopListening();
    try { const result = answerIntake(session, question, text); const next = session.intakeCorrection ? "review" : result.next; save({ ...result.patch, ...(session.intakeCorrection ? { intakeQuestion: "review", intakeCorrection: false, step: 5 } : {}), intakeMessages: [...messages, chatMessage("user", text), chatMessage("assistant", questions[next])] }, result.action ?? (session.intakeCorrection ? "Participant corrected report detail" : undefined)); setInput(""); ref.current?.focus(); } catch (e) { setError((e as Error).message); }
  };
  const correct = (q: IntakeQuestion) => { setAttest(false); save({ intakeQuestion: q, intakeCorrection: true, step: q === "narrative" || q === "location" ? 1 : 4, intakeMessages: [...messages, chatMessage("assistant", `Let’s correct that detail. ${questions[q]}`)] }); };
  const attach = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 1500000 || (!file.type.startsWith("image/") && !(question === "receipt" && file.type === "application/pdf"))) { setError("Choose an image or PDF receipt smaller than 1.5 MB."); return; }
    try {
      const url = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
      save({ evidence: [...session.evidence, { id: crypto.randomUUID(), name: file.name, kind: question === "photo" ? "Photo" : "Receipt", url, at: new Date().toISOString() }], intakeMessages: [...messages, chatMessage("user", `Attached: ${file.name}`), chatMessage("assistant", "Thank you. You can add another relevant file, or select Done to continue.")] }, "Participant uploaded evidence");
    } catch { setError("The file could not be read. Please try again."); }
  };
  return <div className="flex flex-col">
    <div className="flex flex-col items-center pb-4 pt-2"><img src={davidAvatar} alt="David, your AI reporting guide" width={112} height={112} className="h-28 w-28 rounded-full object-cover ring-2 ring-primary/25" /><h1 className="mt-3 text-xl font-bold">David</h1><p className="text-xs text-muted-foreground">Your AI reporting guide</p></div>
    <Conversation className="h-[350px] min-h-0"><ConversationContent className="gap-4 px-0">{messages.map((m) => <Message key={m.id} from={m.role}>{m.role === "assistant" && <img src={davidAvatar} alt="David" width={28} height={28} loading="lazy" className="mr-2 h-7 w-7 shrink-0 rounded-full object-cover" />}<MessageContent className={m.role === "user" ? "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground max-w-[85%]" : "max-w-[85%] text-sm"}>{m.parts.map((p, i) => p.type === "text" ? <MessageResponse key={i}>{p.text}</MessageResponse> : null)}</MessageContent></Message>)}</ConversationContent><ConversationScrollButton /></Conversation>
    <div className="my-3 flex flex-wrap gap-2">
      {question === "consent" && <Button size="sm" onClick={() => answer("I consent")}><ShieldCheck />I consent</Button>}
      {question === "more" && <><Button size="sm" variant="outline" onClick={() => answer("yes")}>Add another item</Button><Button size="sm" onClick={() => answer("no")}>No, continue</Button></>}
      {!["consent", "verification", "narrative", "property", "more", "review"].includes(question) && <Button variant="outline" size="sm" onClick={() => answer("skip")}>Skip</Button>}
      {(question === "photo" || question === "receipt") && <><Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}><ImagePlus />Attach {question}</Button><Button size="sm" onClick={() => answer("done")}><Check />Done</Button><input ref={fileRef} type="file" className="sr-only" aria-label={`Upload ${question}`} accept={question === "photo" ? "image/*" : "image/*,application/pdf"} onChange={(e) => { void attach(e.target.files?.[0]); e.target.value = ""; }} /></>}
      {question === "property" && <Button size="sm" variant="outline" onClick={() => { setShowRecords(!showRecords); }}>Choose from My Property</Button>}
    </div>
    {question === "property" && showRecords && <section className="mb-4 space-y-2"><p className="text-xs text-muted-foreground">Selecting a record authorizes including it in this report; the original stays unchanged.</p>{loadRecords().filter((r) => r.status !== "draft").map((r) => <Button key={r.pin} variant="outline" className="h-auto w-full justify-start whitespace-normal py-3 text-left" disabled={session.items.some((i) => i.sourcePin === r.pin)} onClick={() => { save({ portfolioConsent: true, items: [...session.items, { id: crypto.randomUUID(), name: r.item, category: r.category, identifier: r.serial, dnaPin: r.pin, details: r.dnaLocations.map((d) => d.label).join(", "), value: r.value, source: "Emily record", sourcePin: r.pin }], intakeQuestion: "more", intakeMessages: [...messages, chatMessage("user", `I authorize including my ${r.item} record.`), chatMessage("assistant", `I’ve included your saved details for review without changing the original. ${questions.more}`)] }, "Participant authorized selected Emily record"); setShowRecords(false); }}>{r.item}</Button>)}{!loadRecords().some((r) => r.status !== "draft") && <p className="text-sm">No saved properties here. Describe your item in the chat.</p>}</section>}
    <div className="mb-2 flex flex-wrap items-center gap-2">
      <Button type="button" variant="ghost" size="sm" aria-pressed={voice.voiceOn} onClick={voice.toggleVoice}>{voice.voiceOn ? <Volume2 className="text-primary" /> : <VolumeX />}{voice.voiceOn ? (voice.loading ? "Preparing voice…" : voice.speaking ? "Speaking… tap to mute" : "Voice on") : "Voice off"}</Button>
      {voice.needsTap && <Button type="button" variant="outline" size="sm" onClick={() => void voice.replay()}><Play />Play David’s message</Button>}
    </div>
    {voice.listening && <p role="status" className="mb-2 text-xs font-medium text-primary">Listening… speak now</p>}
    {question !== "review" && <PromptInput onSubmit={({ text }) => answer(text)}><PromptInputTextarea ref={ref} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Reply to David…" /><PromptInputFooter className="justify-between"><Button type="button" variant={voice.listening ? "default" : "ghost"} size="icon" aria-label={voice.listening ? "Stop voice input" : "Speak to David"} title={voice.listening ? "Stop voice input" : "Microphone answers are transcribed for your review before sending"} aria-pressed={voice.listening} onClick={voice.toggleListening}>{voice.listening ? <MicOff /> : <Mic />}</Button><PromptInputSubmit disabled={!input.trim()} /></PromptInputFooter></PromptInput>}
    {voice.error && <p role="alert" className="mt-2 text-sm text-destructive">{voice.error}</p>}
    {question === "consent" && <p className="mt-3 text-xs text-muted-foreground"><a href="/privacy" className="text-primary underline">Privacy Policy</a> · <a href="/terms" className="text-primary underline">Terms & Conditions</a></p>}
    {(question === "photo" || question === "receipt") && <div className="mt-3">{session.evidence.map((e) => <div key={e.id} className="flex items-center gap-2 py-2 text-xs">{e.url.startsWith("data:image/") && <img src={e.url} alt={e.name} width={48} height={48} className="h-12 w-12 rounded-md object-cover" />}<span className="min-w-0 break-words">{e.name}</span><Button variant="ghost" size="sm" onClick={() => save({ evidence: session.evidence.filter((x) => x.id !== e.id) })}>Remove</Button></div>)}<FictionalEvidence session={session} onChange={onChange} /></div>}
    {(question === "witness" || question === "review") && <WitnessInvitations session={session} />}
    {question === "review" && <div className="mt-5"><RecoveryPackage session={session} /><div className="my-4 flex flex-wrap gap-2">{([['Statement', 'narrative'], ['Location', 'location'], ['Date', 'incidentAt'], ['Last item', 'details'], ['Loss', 'loss'], ['Witness details', 'witness']] as const).map(([label, q]) => <Button key={q} variant="outline" size="sm" onClick={() => correct(q)}><Pencil />{label}</Button>)}</div><label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={attest} onChange={(e) => setAttest(e.target.checked)} className="mt-1" />I reviewed this package and attest that it is accurate to the best of my knowledge.</label><Button className="mt-4 w-full" disabled={!attest || !canSubmit(session)} onClick={() => { try { onChange(submitIntake(session)); } catch(e) { setError((e as Error).message); } }}><Check />Attest & send to agency</Button></div>}
    {error && <p role="alert" className="my-3 text-sm text-destructive">{error}</p>}
    {session.verified && <details className="mt-5 border-t border-border pt-4"><summary className="cursor-pointer text-sm font-medium">Ask David for clarification</summary><DavidInvestigation session={session} /></details>}
    <Button variant="outline" size="sm" className="mt-5 self-start" onClick={() => save({ status: "Paused" }, "Participant paused intake")}><Pause />Save & pause</Button>
  </div>;
}

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ShieldCheck } from "lucide-react";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputSubmit } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { loadIntakes, updateIntake, type IntakeSession } from "@/lib/intakeSessions";

export default function DavidInvestigation({ session }: { session: IntakeSession }) {
  const [input, setInput] = useState(""); const [failure, setFailure] = useState(""); const textRef = useRef<HTMLTextAreaElement>(null); const current = useRef(session); current.current = session;
  const transport = useMemo(() => new DefaultChatTransport({ api: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/david-intake`,
    headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
    body: () => ({ context: { eventType: current.current.eventType, narrative: current.current.narrative, location: current.current.location,
      items: current.current.items.map(({ name, identifier, dnaPin, details, source }) => ({ name, identifier, dnaPin, details, source })),
      evidence: current.current.evidence.map(({ name, kind, fictional }) => ({ name, kind, fictional })), step: current.current.step } }) }), []);
  const greeting: UIMessage = { id: "david-intake-greeting", role: "assistant", parts: [{ type: "text", text: "I’m David. Tell me what you observed, and we’ll work through it together. I’ll distinguish confirmed details from uncertainty and help you prepare your Recovery Package. What would you like to clarify first?" }] };
  const { messages, status, sendMessage, stop } = useChat({ id: session.id, transport, messages: session.messages?.length ? session.messages : [greeting],
    onError: (e) => setFailure(e.message), onFinish: ({ messages: completed }) => {
      const s = loadIntakes().find((i) => i.id === current.current.id);
      if (s) { try { updateIntake(s, { messages: completed }); } catch { setFailure("Conversation could not be saved in this browser."); } }
      textRef.current?.focus();
    } });
  const busy = status === "submitted" || status === "streaming";
  useEffect(() => { if (!busy) { const active = document.activeElement; if (!active || active === document.body || active === textRef.current) textRef.current?.focus(); } }, [busy]);
  return <section className="mb-6 border-y border-border py-5"><h3 className="mb-3 flex items-center gap-2 font-semibold"><ShieldCheck className="h-5 w-5 text-primary" />Investigate with David</h3><Conversation className="h-[340px] min-h-0"><ConversationContent className="gap-4 px-0 py-2">{messages.map((m) => <Message key={m.id} from={m.role}><MessageContent className={m.role === "user" ? "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground" : ""}>{m.parts.map((part, i) => part.type === "text" ? <MessageResponse key={i}>{part.text}</MessageResponse> : part.type === "reasoning" ? <details key={i} className="text-xs text-muted-foreground"><summary>Investigation reasoning</summary><MessageResponse>{part.text}</MessageResponse></details> : null)}</MessageContent></Message>)}{status === "submitted" && <Shimmer>David is considering your account…</Shimmer>}</ConversationContent><ConversationScrollButton /></Conversation>{failure && <p role="alert" className="my-3 break-words text-sm text-destructive">{failure}</p>}<PromptInput onSubmit={async ({ text }) => { if (!text.trim() || busy) return; setFailure(""); setInput(""); await sendMessage({ text }); textRef.current?.focus(); }}><PromptInputTextarea ref={textRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask David or describe what you observed…" /><PromptInputFooter className="justify-end"><PromptInputSubmit status={status} onStop={stop} disabled={!busy && !input.trim()} /></PromptInputFooter></PromptInput><p className="mt-2 text-[11px] text-muted-foreground">Suggestions are not saved as facts. Confirm corrections in your report fields before attesting.</p></section>;
}
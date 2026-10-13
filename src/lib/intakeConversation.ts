import type { UIMessage } from "ai";
import { blankIntakeItem, type IntakeSession } from "./intakeSessions";

export const questions = {
  consent: "I’m David, your AI reporting guide. Your answers and evidence will form a Recovery Package for your agency to review. You can pause at any time. Do you consent to share relevant information with your agency?",
  verification: "Thank you. For this demo, please enter the agency number shown above to confirm participation. This is not real identity verification.",
  narrative: "Tell me what happened in your own words.",
  location: "Where did this happen? An approximate location is fine, or say ‘skip’ if unknown.",
  incidentAt: "When did it happen? You can give an approximate date and time, or say ‘skip’.",
  property: "Which item was taken? Describe one item, or authorize and select a saved Emily property below.",
  category: "What kind of item is it? For example, a camera, phone or watch. You can say ‘skip’.",
  details: "What model, colour or distinguishing marks do you remember? Say ‘skip’ if unsure.",
  identifier: "Do you know its manufacturer serial number, VIN or IMEI? Please read it carefully, or say ‘skip’.",
  dnaPin: "Does this item have a PropertyProof DNA PIN? Enter it separately from the manufacturer identifier, or say ‘skip’.",
  value: "What is this item’s approximate value? Include the currency, or say ‘skip’.",
  more: "Is there another stolen item to include?",
  photo: "Do you have a relevant photograph? Attach it below, or say ‘skip’ to continue without one.",
  receipt: "Do you have a receipt or other purchase evidence? Attach an image or PDF, or say ‘skip’.",
  loss: "Is there any other damage or loss to record? Say ‘skip’ if there is nothing else.",
  witness: "Is there anyone who may have witnessed the incident? Give only a relevant label or what you personally know, or say ‘skip’. Their own account will be collected independently.",
  review: "Your draft Recovery Package is ready below. Please review it and correct anything inaccurate before attesting and sending it to your agency.",
} as const;
export type IntakeQuestion = keyof typeof questions;
export const initialQuestion = (s: IntakeSession): IntakeQuestion => s.intakeQuestion ?? (s.step === 0 ? s.consent ? "verification" : "consent" : s.step === 1 ? "narrative" : s.step === 2 ? "property" : s.step === 3 ? "photo" : s.step === 4 ? "loss" : "review");
export const chatMessage = (role: "assistant" | "user", text: string): UIMessage => ({ id: crypto.randomUUID(), role, parts: [{ type: "text", text }] });
const optional = (text: string) => /^(skip|unknown|not sure|none|no|n\/a)$/i.test(text.trim()) ? "" : text.trim();
export function answerIntake(s: IntakeSession, question: IntakeQuestion, text: string): { patch: Partial<IntakeSession>; next: IntakeQuestion; action?: string } {
  const value = text.trim();
  if (!value) throw new Error("Please answer David’s question.");
  const next = (q: IntakeQuestion, patch: Partial<IntakeSession> = {}, action?: string) => ({ patch: { ...patch, intakeQuestion: q }, next: q, action });
  if (question === "consent") {
    if (!/^(yes|i agree|i consent|agree)$/i.test(value)) throw new Error("Consent is required to continue. You can leave or pause if you do not consent.");
    return next("verification", { consent: true }, "Participant consent recorded");
  }
  if (question === "verification") {
    if (value !== s.agencyNumber) throw new Error("Please enter the agency number shown above exactly.");
    return next("narrative", { verified: true, status: "Started", step: 1, startedAt: s.startedAt ?? new Date().toISOString() }, "Demo participant verification completed");
  }
  if (question === "narrative") return next("location", { narrative: value }, "Participant completed incident step");
  if (question === "location") return next("incidentAt", { location: optional(value) });
  if (question === "incidentAt") return next("property", { incidentAt: optional(value), step: 2 });
  if (question === "property") return next("category", { items: [...s.items, { ...blankIntakeItem(), name: value }] }, "Participant added property details");
  const itemFields = ["category", "details", "identifier", "dnaPin", "value"] as const;
  const index = itemFields.findIndex((key) => key === question);
  if (index >= 0) {
    if (!s.items.length) throw new Error("Please describe an item first.");
    const items = s.items.map((item, i) => i === s.items.length - 1 ? { ...item, [question]: optional(value) } : item);
    return next(itemFields[index + 1] ?? "more", { items }, question === "value" ? "Participant completed property step" : "Participant confirmed property detail");
  }
  if (question === "more") {
    if (/^(yes|another|add another)$/i.test(value)) return next("property");
    if (!/^(no|none|done|skip)$/i.test(value)) throw new Error("Please answer yes or no so I know whether to add another item.");
    return next("photo", { step: 3 });
  }
  if (question === "photo" || question === "receipt") {
    if (!/^(skip|no|none|done|continue)$/i.test(value)) throw new Error("Attach the file below, then select Done, or say ‘skip’.");
    return next(question === "photo" ? "receipt" : "loss", { step: question === "photo" ? 3 : 4 });
  }
  if (question === "loss") return next("witness", { loss: optional(value) });
  if (question === "witness") return next("review", { witness: optional(value), step: 5 });
  throw new Error("Review your package below, choose a detail to correct, or attest when ready.");
}
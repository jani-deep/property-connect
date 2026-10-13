import { useEffect, useState } from "react";
import type { UIMessage } from "ai";
import { recordTheft } from "./theftIncidents";
import { loadWitnesses } from "./witnessSessions";
import type { IntakeQuestion } from "./intakeConversation";

export type IntakeStatus = "Created" | "Delivered" | "Started" | "Paused" | "Expired" | "Completed" | "Abandoned" | "More information requested" | "Accepted" | "Rejected";
export interface IntakeItem { id: string; name: string; category: string; identifier: string; dnaPin: string; details: string; value: string; source: "Emily record" | "Participant"; sourcePin?: string }
export interface IntakeEvidence { id: string; name: string; kind: "Photo" | "Receipt"; url: string; at: string; fictional?: boolean }
export interface IntakeVersion { number: number; at: string; actor: "Participant" | "Agency"; narrative: string; items: IntakeItem[]; corrections: string }
export interface IntakeSession {
  id: string; token: string; agency: string; agencyNumber: string; eventType: string; assigned: string; participant: string; delivery: string;
  createdAt: string; expiresAt: string; deliveredAt?: string; startedAt?: string; completedAt?: string; reviewedAt?: string; reviewStartedAt?: string;
  status: IntakeStatus; consent: boolean; verified: boolean; portfolioConsent: boolean; step: number;
  narrative: string; location: string; incidentAt: string; loss: string; witness: string; items: IntakeItem[]; evidence: IntakeEvidence[];
  attestedAt?: string; reviewNote: string; corrections: string; timeline: { at: string; action: string }[];
  originalStatement?: string; originalItems?: IntakeItem[]; versions?: IntakeVersion[]; messages?: UIMessage[]; incidentId?: string;
  intakeQuestion?: IntakeQuestion; intakeMessages?: UIMessage[];
  intakeCorrection?: boolean;
}
export const INTAKE_KEY = "propertyproof.david.intake.v1";
export const INTAKE_CHANGE = "propertyproof-intake-change";
export const loadIntakes = (): IntakeSession[] => { try { return JSON.parse(localStorage.getItem(INTAKE_KEY) || "[]"); } catch { return []; } };
export const effectiveStatus = (s: IntakeSession, now = Date.now()): IntakeStatus =>
  !s.completedAt && !["Abandoned", "Rejected"].includes(s.status) && new Date(s.expiresAt).getTime() <= now ? "Expired" : s.status;
export function saveIntake(session: IntakeSession) {
  localStorage.setItem(INTAKE_KEY, JSON.stringify([session, ...loadIntakes().filter((s) => s.id !== session.id)]));
  window.dispatchEvent(new Event(INTAKE_CHANGE));
}
export function createIntake(input: Pick<IntakeSession, "agency" | "agencyNumber" | "eventType" | "assigned" | "participant" | "delivery">, lifetimeHours: number): IntakeSession {
  const now = new Date().toISOString();
  const session: IntakeSession = { ...input, id: crypto.randomUUID(), token: crypto.randomUUID(), createdAt: now,
    expiresAt: new Date(Date.now() + lifetimeHours * 3600000).toISOString(), status: "Created", consent: false, verified: false,
    portfolioConsent: false, step: 0, narrative: "", location: "", incidentAt: "", loss: "", witness: "", items: [], evidence: [],
    reviewNote: "", corrections: "", timeline: [{ at: now, action: "Agency session created" }] };
  saveIntake(session); return session;
}
export function startPropertyReport(item: { pin: string; name: string; category: string; identifier: string; value: string; county?: string }): IntakeSession {
  const existing = loadIntakes().find((s) => s.items.some((i) => i.sourcePin === item.pin) && !s.completedAt && !["Expired", "Abandoned", "Rejected"].includes(effectiveStatus(s)));
  if (existing) return existing;
  const base = createIntake({ agency: `${item.county || "Orange County"} Sheriff's Office`, agencyNumber: `PP-${Date.now().toString().slice(-6)}`, eventType: "Stolen property report",
    assigned: "David Operations queue", participant: "Signed-in PropertyProof resident", delivery: "Started from My Property" }, 72);
  return updateIntake(base, { verified: true, portfolioConsent: true, items: [{ ...blankIntakeItem(), name: item.name, category: item.category, identifier: item.identifier, dnaPin: item.pin, value: item.value, source: "Emily record", sourcePin: item.pin }] }, "Resident started stolen report from My Property");
}
export function updateIntake(s: IntakeSession, patch: Partial<IntakeSession>, action?: string) {
  const current = loadIntakes().find((i) => i.id === s.id) ?? s;
  const next = { ...current, ...s, ...patch, versions: current.versions ?? s.versions, messages: patch.messages ?? current.messages ?? s.messages, originalStatement: current.originalStatement,
    originalItems: current.originalItems,
    timeline: action ? [...current.timeline, { at: new Date().toISOString(), action }] : current.timeline };
  if (action === "Participant completed incident step" && !next.originalStatement) next.originalStatement = next.narrative;
  if (action === "Participant completed property step" && !next.originalItems) next.originalItems = structuredClone(next.items);
  if (action && (patch.narrative !== undefined || patch.items !== undefined || patch.corrections !== undefined || action.includes("completed incident") || action.includes("completed property"))) {
    next.versions = [...(current.versions ?? []), { number: (current.versions?.length ?? 0) + 1, at: new Date().toISOString(), actor: action.startsWith("Agency") ? "Agency" : "Participant", narrative: next.narrative, items: structuredClone(next.items), corrections: next.corrections }];
  }
  saveIntake(next); return next;
}
export const completeness = (s: IntakeSession) => {
  const fields = [Boolean(s.narrative.trim()), Boolean(s.location.trim()), Boolean(s.incidentAt), s.items.length > 0,
    s.items.some((i) => Boolean(i.identifier || i.dnaPin)), s.evidence.length > 0, Boolean(s.loss.trim()), Boolean(s.attestedAt)];
  return Math.round(fields.filter(Boolean).length / fields.length * 100);
};
export const canSubmit = (s: IntakeSession) => s.consent && s.verified && Boolean(s.narrative.trim()) && s.items.length > 0 && !["Expired", "Abandoned", "Completed", "Accepted", "Rejected"].includes(effectiveStatus(s));
export function submitIntake(s: IntakeSession) {
  if (!canSubmit(s)) throw new Error("Consent, verification, a narrative and at least one item are required.");
  const at = new Date().toISOString();
  const incident = recordTheft({ sessionId: s.id, originalStatement: s.originalStatement ?? s.narrative, items: s.items.map((i) => ({ name: i.name, propertyPin: i.sourcePin, details: i.details, identifier: i.identifier, dnaPin: i.dnaPin })) });
  const next = updateIntake(s, { status: "Completed", completedAt: at, attestedAt: at, step: 5, incidentId: incident.id }, "Participant reviewed and attested; Recovery Package ready for agency review");
  if (!next.originalStatement) next.originalStatement = s.narrative;
  if (!next.originalItems) next.originalItems = structuredClone(s.items);
  saveIntake(next); return next;
}
export function reviewIntake(s: IntakeSession, decision: "Accepted" | "Rejected" | "More information requested", note: string, corrections: string) {
  if (!s.attestedAt || !["Completed", "More information requested"].includes(s.status)) throw new Error("A participant-attested package is required before review.");
  if (!note.trim()) throw new Error("Record the agency review reason.");
  return updateIntake(s, { status: decision, reviewNote: note, corrections, reviewedAt: new Date().toISOString(),
    ...(decision === "More information requested" ? { attestedAt: undefined, completedAt: undefined, step: 1 } : {}) }, `Agency review: ${decision}`);
}
export function exportPackage(s: IntakeSession) {
  if (!s.attestedAt || !["Completed", "Accepted"].includes(s.status)) throw new Error("A submitted, participant-attested package is required before export.");
  const { token, messages, ...packageData } = s;
  void token; void messages;
  const witnesses = loadWitnesses().filter((w) => w.parentId === s.id).map((w) => ({ label: w.label, status: w.status,
    statement: w.status === "Completed" ? w.originalStatement : undefined, attestedAt: w.attestedAt, source: "Independent witness session" }));
  return JSON.stringify({ title: "PropertyProof Recovery Package", ...packageData, witnesses, evidence: s.evidence.map(({ url, ...e }) => { void url; return e; }),
    notice: "Participant-provided information; not an official police report. Agency review does not independently verify ownership." }, null, 2);
}
const esc = (v: unknown) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
export function exportReportHtml(s: IntakeSession) {
  const data = JSON.parse(exportPackage(s));
  const row = (k: string, v: unknown) => `<tr><th>${esc(k)}</th><td>${esc(v) || "Not supplied"}</td></tr>`;
  const imgs = s.evidence.filter((e) => e.url.startsWith("data:image/")).map((e) => `<figure><img src="${e.url}" alt="${esc(e.name)}"/><figcaption>${esc(e.kind)} · ${esc(e.name)}</figcaption></figure>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Recovery Package ${esc(s.agencyNumber)}</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:24px auto;color:#111}h1{font-size:22px}h2{font-size:16px;border-bottom:1px solid #ccc;padding-bottom:4px;margin-top:24px}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:6px;border-bottom:1px solid #eee;vertical-align:top}th{width:35%;color:#555}.note{background:#fff7e6;padding:8px;font-size:12px}figure{display:inline-block;margin:6px}img{max-width:220px;border:1px solid #ccc}</style></head><body>
<h1>PropertyProof Recovery Package</h1><p class="note">${esc(data.notice)}</p>
<h2>Case</h2><table>${row("Agency", s.agency)}${row("Agency number", s.agencyNumber)}${row("Status", s.status)}${row("Assigned", s.assigned)}${row("Attested", s.attestedAt && new Date(s.attestedAt).toLocaleString())}${row("Linked theft incident", s.incidentId)}</table>
<h2>Incident</h2><table>${row("Location", s.location)}${row("Date / time", s.incidentAt)}${row("Loss / damage", s.loss)}${row("Witness information", s.witness)}</table>
<h2>Original victim statement (preserved)</h2><p>${esc(s.originalStatement ?? s.narrative)}</p>${s.originalStatement && s.originalStatement !== s.narrative ? `<h2>Corrected narrative</h2><p>${esc(s.narrative)}</p>` : ""}
<h2>Property</h2>${s.items.map((i) => `<table>${row("Item", i.name)}${row("Category", i.category)}${row("Details", i.details)}${row("Manufacturer identifier", i.identifier)}${row("DNA PIN", i.dnaPin)}${row("Value", i.value)}${row("Source", i.source)}</table>`).join("<br/>")}
<h2>Evidence (${s.evidence.length})</h2>${imgs || "<p>No images supplied.</p>"}
<h2>Independent witness statements</h2>${data.witnesses.length ? data.witnesses.map((w: { label: string; status: string; statement?: string }) => `<p><b>${esc(w.label)}</b> · ${esc(w.status)}<br/>${esc(w.statement)}</p>`).join("") : "<p>None.</p>"}
${s.reviewNote ? `<h2>Agency review</h2><p>${esc(s.reviewNote)}</p>` : ""}
<h2>Session provenance</h2><ol>${s.timeline.map((t) => `<li>${esc(t.action)} — ${esc(new Date(t.at).toLocaleString())}</li>`).join("")}</ol></body></html>`;
}
export const blankIntakeItem = (): IntakeItem => ({ id: crypto.randomUUID(), name: "", category: "", identifier: "", dnaPin: "", details: "", value: "", source: "Participant" });
export function useIntakes() {
  const [sessions, setSessions] = useState(loadIntakes);
  useEffect(() => { const refresh = () => setSessions(loadIntakes()); window.addEventListener(INTAKE_CHANGE, refresh); window.addEventListener("storage", refresh);
    const interval = window.setInterval(refresh, 30000);
    return () => { window.removeEventListener(INTAKE_CHANGE, refresh); window.removeEventListener("storage", refresh); clearInterval(interval); }; }, []);
  return sessions;
}
import { useEffect, useState } from "react";
import type { UIMessage } from "ai";
import { recordTheft } from "./theftIncidents";

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
export function updateIntake(s: IntakeSession, patch: Partial<IntakeSession>, action?: string) {
  const current = loadIntakes().find((i) => i.id === s.id) ?? s;
  const next = { ...current, ...patch, originalStatement: current.originalStatement,
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
  if (s.status !== "Accepted") throw new Error("Agency acceptance is required before export.");
  const { token, messages, ...packageData } = s;
  return JSON.stringify({ title: "PropertyProof Recovery Package", ...packageData, evidence: s.evidence.map(({ url, ...e }) => e),
    notice: "Participant-provided information; not an official police report. Agency review does not independently verify ownership." }, null, 2);
}
export const blankIntakeItem = (): IntakeItem => ({ id: crypto.randomUUID(), name: "", category: "", identifier: "", dnaPin: "", details: "", value: "", source: "Participant" });
export function useIntakes() {
  const [sessions, setSessions] = useState(loadIntakes);
  useEffect(() => { const refresh = () => setSessions(loadIntakes()); window.addEventListener(INTAKE_CHANGE, refresh); window.addEventListener("storage", refresh);
    const interval = window.setInterval(refresh, 30000);
    return () => { window.removeEventListener(INTAKE_CHANGE, refresh); window.removeEventListener("storage", refresh); clearInterval(interval); }; }, []);
  return sessions;
}
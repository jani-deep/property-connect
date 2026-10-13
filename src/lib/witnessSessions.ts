export interface WitnessSession { id: string; token: string; parentId: string; label: string; expiresAt: string; status: "Invited" | "Started" | "Paused" | "Completed"; consent: boolean; statement: string; originalStatement?: string; attestedAt?: string; versions: { at: string; statement: string }[] }
const KEY = "propertyproof.witness-sessions";
export const loadWitnesses = (): WitnessSession[] => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
export function saveWitness(s: WitnessSession) { localStorage.setItem(KEY, JSON.stringify([s, ...loadWitnesses().filter((w) => w.id !== s.id)])); }
export function inviteWitness(parentId: string, label: string, expiresAt: string) {
  const s: WitnessSession = { id: crypto.randomUUID(), token: crypto.randomUUID(), parentId, label, expiresAt, status: "Invited", consent: false, statement: "", versions: [] }; saveWitness(s); return s;
}
export function witnessView(token: string) {
  const s = loadWitnesses().find((w) => w.token === token);
  // Only the witness's own invitation and account; never include parent victim/session data.
  return s ? { token: s.token, label: s.label, expiresAt: s.expiresAt, status: s.status, consent: s.consent, statement: s.statement, originalStatement: s.originalStatement, attestedAt: s.attestedAt } : undefined;
}
export function updateWitness(token: string, patch: Partial<Pick<WitnessSession, "consent" | "statement" | "status">>, attest = false) {
  const s = loadWitnesses().find((w) => w.token === token);
  if (!s || new Date(s.expiresAt).getTime() <= Date.now() || s.status === "Completed") throw new Error("Witness invitation expired or completed.");
  const next = { ...s, ...patch };
  if (attest) {
    if (!next.consent || !next.statement.trim()) throw new Error("Consent and an independent statement are required.");
    next.originalStatement ??= next.statement;
    next.versions = [...next.versions, { at: new Date().toISOString(), statement: next.statement }];
    next.attestedAt = new Date().toISOString(); next.status = "Completed";
  }
  saveWitness(next); return witnessView(token);
}
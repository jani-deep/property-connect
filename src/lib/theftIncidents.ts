export interface StolenItemRecord { id: string; name: string; propertyPin?: string; details?: string; identifier?: string; dnaPin?: string; originalProperty?: unknown }
export interface TheftIncident { id: string; sessionId?: string; at: string; originalStatement: string; items: StolenItemRecord[] }
const KEY = "propertyproof.theft-incidents";
export const loadTheftIncidents = (): TheftIncident[] => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
export function recordTheft(input: { sessionId?: string; originalStatement: string; items: Omit<StolenItemRecord, "id" | "originalProperty">[] }) {
  const all = loadTheftIncidents();
  const existing = input.sessionId ? all.find((i) => i.sessionId === input.sessionId) : undefined;
  if (existing) return existing;
  let properties: { pin: string }[] = [];
  try { properties = JSON.parse(localStorage.getItem("propertyproof.records") || "[]"); } catch { /* no portfolio */ }
  const incident: TheftIncident = { id: crypto.randomUUID(), sessionId: input.sessionId, at: new Date().toISOString(), originalStatement: input.originalStatement,
    items: input.items.map((i) => ({ ...i, id: crypto.randomUUID(), originalProperty: i.propertyPin ? properties.find((p) => p.pin === i.propertyPin) : undefined })) };
  localStorage.setItem(KEY, JSON.stringify([incident, ...all])); return incident;
}
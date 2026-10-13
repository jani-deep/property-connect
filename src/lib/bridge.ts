/* Emily ↔ David bridge: shared registry, stolen reports and the match-to-return pipeline (demo, localStorage). */
import type { PropertyRecord } from "./propertyRecord";

export type BridgeEventType = "registered" | "stolen" | "match" | "reveal" | "approved" | "returned";
export interface BridgeEvent { id: string; type: BridgeEventType; pin: string; item: string; county: string; at: string }

const EVENTS_KEY = "propertyproof.bridge.events";
const STOLEN_KEY = "propertyproof.bridge.stolen";
const STAGE_KEY = "propertyproof.bridge.stages";
export const BRIDGE_CHANGE = "propertyproof-bridge-change";

const read = <T,>(k: string, d: T): T => { try { return JSON.parse(localStorage.getItem(k) || "null") ?? d; } catch { return d; } };
const write = (k: string, v: unknown) => { localStorage.setItem(k, JSON.stringify(v)); window.dispatchEvent(new Event(BRIDGE_CHANGE)); };

export const loadEvents = (): BridgeEvent[] => read<BridgeEvent[]>(EVENTS_KEY, []);
export const logEvent = (e: Omit<BridgeEvent, "id" | "at">) =>
  write(EVENTS_KEY, [{ ...e, id: crypto.randomUUID(), at: new Date().toISOString() }, ...loadEvents()].slice(0, 60));

export const loadStolen = (): string[] => read<string[]>(STOLEN_KEY, []);
export const isReportedStolen = (pin: string) => loadStolen().includes(pin);
export const reportStolen = (r: Pick<PropertyRecord, "pin" | "item" | "county">) => {
  if (isReportedStolen(r.pin)) return;
  write(STOLEN_KEY, [r.pin, ...loadStolen()]);
  logEvent({ type: "stolen", pin: r.pin, item: r.item, county: r.county });
};

/** 0 Matched · 1 Reveal requested · 2 Supervisor approved · 3 Returned to owner */
export const RETURN_STAGES = ["Matched", "Reveal requested", "Approved", "Returned to owner"] as const;
const STAGE_EVENT: BridgeEventType[] = ["match", "reveal", "approved", "returned"];
export const loadStages = (): Record<string, number> => read<Record<string, number>>(STAGE_KEY, {});
export const setStage = (pin: string, item: string, county: string, stage: number) => {
  write(STAGE_KEY, { ...loadStages(), [pin]: stage });
  // Item handed back: clear the theft report so the resident sees it as protected again.
  if (stage === 3) write(STOLEN_KEY, loadStolen().filter((p) => p !== pin));
  logEvent({ type: STAGE_EVENT[stage], pin, item, county });
};

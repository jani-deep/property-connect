export interface DnaLocation {
  label: string;
  x: number;
  y: number;
  applied: boolean;
}

export interface PropertyRecord {
  pin: string;
  item: string;
  category: string;
  owner: string;
  phone: string;
  county: string;
  serial: string;
  serialLabel: string;
  value: string;
  img: string;
  dnaLocations: DnaLocation[];
  score: number;
  registeredAt: string;
}

const KEY = "propertyproof.records";
const CHAT_KEY = "propertyproof.emily.chat";

export const loadRecords = (): PropertyRecord[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
};

export const saveRecord = (record: PropertyRecord) => {
  const all = loadRecords().filter((r) => r.pin !== record.pin);
  localStorage.setItem(KEY, JSON.stringify([record, ...all]));
};

export const findByPin = (pin: string): PropertyRecord | undefined =>
  loadRecords().find((r) => r.pin.toUpperCase() === pin.toUpperCase());

/* ---------- Emily chat history (resume where the user left off) ---------- */

export interface StoredChatMessage {
  role: "user" | "assistant";
  text: string;
  image?: string;
}

export const loadChat = (): StoredChatMessage[] => {
  try {
    return JSON.parse(localStorage.getItem(CHAT_KEY) || "[]");
  } catch {
    return [];
  }
};

export const saveChat = (messages: StoredChatMessage[]) => {
  try {
    // keep the transcript small: drop image payloads from older turns
    const trimmed = messages.slice(-40).map((m, i, arr) =>
      i < arr.length - 4 && m.image ? { role: m.role, text: m.text } : m
    );
    localStorage.setItem(CHAT_KEY, JSON.stringify(trimmed));
  } catch {
    /* storage full — ignore */
  }
};

export const clearChat = () => {
  localStorage.removeItem(CHAT_KEY);
  localStorage.removeItem(CHAT_DONE_KEY);
};

/* Whether the saved chat finished a full registration (protected + saved) */
const CHAT_DONE_KEY = "propertyproof.emily.done";

export const isChatComplete = () => localStorage.getItem(CHAT_DONE_KEY) === "1";
export const markChatComplete = () => localStorage.setItem(CHAT_DONE_KEY, "1");

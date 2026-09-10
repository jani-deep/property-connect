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

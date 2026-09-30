import demoCar from "@/assets/demo-car.jpg";
import demoWatch from "@/assets/demo-watch.jpg";
import demoLaptop from "@/assets/demo-laptop.jpg";
import demoCamera from "@/assets/demo-camera.jpg";
import demoPhone from "@/assets/demo-phone.jpg";

export type LeRole = "Patrol Officer" | "Investigator" | "Supervisor" | "Agency Administrator" | "Auditor";
export const LE_ROLES: LeRole[] = ["Patrol Officer", "Investigator", "Supervisor", "Agency Administrator", "Auditor"];

export interface Officer {
  name: string;
  title: string;
  badge: string;
  role: LeRole;
  agency: string;
  county: string;
  email: string;
  officePhone: string;
  personalPhone: string;
}

const OFFICER_KEY = "propertyproof.le.officer";
export const defaultOfficer: Officer = {
  name: "Sgt. Daniel Reyes",
  title: "Property Crimes Investigator",
  badge: "4417",
  role: "Investigator",
  agency: "Orange County Sheriff's Office",
  county: "Orange County",
  email: "d.reyes@ocso.gov",
  officePhone: "+1 (407) 555-0142",
  personalPhone: "+1 (407) 555-0199",
};
export const loadOfficer = (): Officer => {
  try { return { ...defaultOfficer, ...JSON.parse(localStorage.getItem(OFFICER_KEY) || "{}") }; } catch { return defaultOfficer; }
};
export const saveOfficer = (o: Officer) => localStorage.setItem(OFFICER_KEY, JSON.stringify(o));

/* Records reachable only by exact identifier lookup */
export interface LeRecord {
  pin: string; serial: string; vin?: string; barcode?: string;
  item: string; make: string; model: string; category: string; color: string;
  features: string; status: "Stolen" | "Protected" | "Recovered";
  county: string; owner: string; phone: string; image: string; sensitive: boolean;
}
export const leRecords: LeRecord[] = [
  { pin: "FL-DNA-3301-VK", serial: "WBA53BJ09RWC18294", vin: "WBA53BJ09RWC18294", item: "BMW 5 Series 530i xDrive", make: "BMW", model: "530i xDrive", category: "Vehicle", color: "Mineral White", features: "Rear bumper scuff, tinted rear windows", status: "Stolen", county: "Brevard County", owner: "John Smith", phone: "+1 (555) 214-8890", image: demoCar, sensitive: true },
  { pin: "FL-DNA-7829-AX", serial: "M7X9K2R7", barcode: "0012345678905", item: "Rolex Submariner 126610LN", make: "Rolex", model: "126610LN", category: "Jewellery", color: "Black / Steel", features: "Engraved caseback 'M.A. 2019'", status: "Stolen", county: "Orange County", owner: "Maria Alvarez", phone: "+1 (555) 662-1174", image: demoWatch, sensitive: true },
  { pin: "FL-DNA-5520-MR", serial: "C02ZN1LPMD6T", barcode: "190199882247", item: 'MacBook Pro 16"', make: "Apple", model: "MacBook Pro 16", category: "Electronics", color: "Space Gray", features: "Sticker residue on lid", status: "Protected", county: "Miami-Dade County", owner: "Daniel Cooper", phone: "+1 (555) 903-4432", image: demoLaptop, sensitive: false },
  { pin: "FL-DNA-9901-CZ", serial: "032024005891", item: "Canon EOS R5 Mark II", make: "Canon", model: "EOS R5 Mark II", category: "Camera", color: "Black", features: "Worn grip, strap attached", status: "Recovered", county: "Hillsborough County", owner: "Priya Nair", phone: "+1 (555) 771-0028", image: demoCamera, sensitive: false },
  { pin: "FL-DNA-4417-TB", serial: "356938035643809", item: "iPhone 17 Pro Max", make: "Apple", model: "iPhone 17 Pro Max", category: "Phone", color: "Desert Titanium", features: "Cracked lower-left corner", status: "Stolen", county: "Broward County", owner: "Andre Wilson", phone: "+1 (555) 330-7712", image: demoPhone, sensitive: false },
];
export const findExact = (q: string) => {
  const v = q.trim().toUpperCase();
  if (!v) return undefined;
  return leRecords.find((r) => [r.pin, r.serial, r.vin, r.barcode].filter(Boolean).some((x) => x!.toUpperCase() === v));
};

/* Audit log */
export interface AuditEntry { id: string; officer: string; agency: string; action: string; reason: string; caseNo: string; data: string; at: string; }
const AUDIT_KEY = "propertyproof.le.audit";
const seedAudit: AuditEntry[] = [
  { id: "a1", officer: "Ofc. Kayla Brooks", agency: "Orange County SO", action: "Identifier search", reason: "Traffic stop", caseNo: "OC-26-11842", data: "PIN FL-DNA-••••-AX (summary)", at: "2026-09-30T08:12:00Z" },
  { id: "a2", officer: "Sgt. Daniel Reyes", agency: "Orange County SO", action: "Owner reveal", reason: "Recovered property return", caseNo: "OC-26-11790", data: "Owner record · Rolex Submariner", at: "2026-09-29T16:40:00Z" },
  { id: "a3", officer: "Lt. Maria Chen", agency: "Orange County SO", action: "Reveal approved", reason: "Sensitive category – vehicle", caseNo: "OC-26-11702", data: "BMW 5 Series owner record", at: "2026-09-29T11:05:00Z" },
  { id: "a4", officer: "Ofc. Kayla Brooks", agency: "Orange County SO", action: "Image search", reason: "Pawn shop check", caseNo: "OC-26-11688", data: "Photo match summary", at: "2026-09-28T14:22:00Z" },
];
export const loadAudit = (): AuditEntry[] => {
  try { const s = JSON.parse(localStorage.getItem(AUDIT_KEY) || "null"); return Array.isArray(s) ? s : seedAudit; } catch { return seedAudit; }
};
export const addAudit = (e: Omit<AuditEntry, "id" | "at" | "officer" | "agency">) => {
  const o = loadOfficer();
  const next = [{ ...e, id: crypto.randomUUID(), at: new Date().toISOString(), officer: o.name, agency: o.agency }, ...loadAudit()].slice(0, 100);
  localStorage.setItem(AUDIT_KEY, JSON.stringify(next));
};

/* Supervisor approval queue */
export interface ApprovalRequest { id: string; officer: string; item: string; pin: string; category: string; reason: string; caseNo: string; status: "Pending" | "Approved" | "Denied"; at: string; }
const APPROVAL_KEY = "propertyproof.le.approvals";
const seedApprovals: ApprovalRequest[] = [
  { id: "r1", officer: "Ofc. Kayla Brooks", item: "BMW 5 Series 530i xDrive", pin: "FL-DNA-3301-VK", category: "Vehicle", reason: "Vehicle recovered at I-4 rest stop", caseNo: "OC-26-11851", status: "Pending", at: "2026-09-30T09:20:00Z" },
];
export const loadApprovals = (): ApprovalRequest[] => {
  try { const s = JSON.parse(localStorage.getItem(APPROVAL_KEY) || "null"); return Array.isArray(s) ? s : seedApprovals; } catch { return seedApprovals; }
};
export const saveApprovals = (a: ApprovalRequest[]) => localStorage.setItem(APPROVAL_KEY, JSON.stringify(a));

/* CJIS APIs */
export interface ApiConfig { id: string; name: string; description: string; endpoint: string; apiKey: string; enabled: boolean; status: "Synced" | "Error" | "Disabled"; lastSync: string; }
const API_KEY = "propertyproof.le.apis";
const seedApis: ApiConfig[] = [
  { id: "ncic", name: "NCIC Stolen Articles", description: "FBI National Crime Information Center – articles file", endpoint: "https://cjis.example.gov/ncic/articles", apiKey: "ncic_live_8f2a91", enabled: true, status: "Synced", lastSync: "2026-09-30T09:55:00Z" },
  { id: "fcic", name: "FCIC Property", description: "Florida Crime Information Center – stolen property", endpoint: "https://fcic.example.fl.gov/property", apiKey: "fcic_live_33b7c0", enabled: true, status: "Synced", lastSync: "2026-09-30T09:50:00Z" },
  { id: "leadsonline", name: "LeadsOnline Pawn", description: "Pawn and secondhand transaction reports", endpoint: "https://api.leadsonline.example/v2", apiKey: "lo_live_71cd04", enabled: true, status: "Error", lastSync: "2026-09-29T22:10:00Z" },
  { id: "dhsmv", name: "FLHSMV Vehicle", description: "Florida vehicle title & registration", endpoint: "https://dhsmv.example.fl.gov/vin", apiKey: "", enabled: false, status: "Disabled", lastSync: "—" },
];
export const loadApis = (): ApiConfig[] => {
  try { const s = JSON.parse(localStorage.getItem(API_KEY) || "null"); return Array.isArray(s) ? s : seedApis; } catch { return seedApis; }
};
export const saveApis = (a: ApiConfig[]) => localStorage.setItem(API_KEY, JSON.stringify(a));

export const statusBadge = (s: string) =>
  s === "Stolen" || s === "Error" || s === "Denied" ? "bg-destructive/10 text-destructive"
  : s === "Recovered" || s === "Synced" || s === "Approved" || s === "Active" ? "bg-success/10 text-success"
  : s === "Pending" ? "bg-warning/15 text-warning"
  : s === "Disabled" ? "bg-muted text-muted-foreground"
  : "bg-primary/10 text-primary";

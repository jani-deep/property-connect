import { beforeEach, describe, expect, it } from "vitest";
import { createIntake, effectiveStatus, submitIntake, reviewIntake, exportPackage, blankIntakeItem, completeness } from "@/lib/intakeSessions";

const create = () => createIntake({ agency: "Test agency", agencyNumber: "EV-26-12", eventType: "Theft", assigned: "Officer", participant: "Participant", delivery: "Agency-managed link" }, 24);
beforeEach(() => localStorage.clear());
describe("David intake safeguards", () => {
  it("expires unfinished time-limited sessions", () => { const s = create(); expect(effectiveStatus(s, new Date(s.expiresAt).getTime())).toBe("Expired"); });
  it("requires participant consent before package submission", () => { const s = { ...create(), verified: true, narrative: "Watch taken", items: [{ ...blankIntakeItem(), name: "Watch" }] }; expect(() => submitIntake(s)).toThrow(); });
  it("requires participant verification before package submission", () => { const s = { ...create(), consent: true, narrative: "Watch taken", items: [{ ...blankIntakeItem(), name: "Watch" }] }; expect(() => submitIntake(s)).toThrow(); });
  it("records attestation before agency review", () => { const s = create(); expect(() => reviewIntake(s, "Accepted", "Reviewed", "")).toThrow(); });
  it("blocks export until agency acceptance", () => { expect(() => exportPackage(create())).toThrow(); });
  it("requests more information and requires a fresh attestation", () => { const s = submitIntake({ ...create(), consent: true, verified: true, narrative: "Watch taken", items: [{ ...blankIntakeItem(), name: "Watch" }] }); const next = reviewIntake(s, "More information requested", "Clarify location", ""); expect(next.attestedAt).toBeUndefined(); expect(next.status).toBe("More information requested"); });
  it("exports an accepted package without photograph payloads", () => { const s = submitIntake({ ...create(), consent: true, verified: true, narrative: "Watch taken", items: [{ ...blankIntakeItem(), name: "Watch", source: "Emily record" as const, sourcePin: "OWNER-PIN" }], evidence: [{ id: "e", name: "watch.jpg", kind: "Photo" as const, url: "data:image/jpeg;base64,secret", at: "2026-10-13" }] }); const accepted = reviewIntake(s, "Accepted", "Reviewed against intake", ""); const data = JSON.parse(exportPackage(accepted)); expect(data.items[0].source).toBe("Emily record"); expect(data.evidence[0].url).toBeUndefined(); });
  it("does not reward extra personal information in completeness", () => { const s = create(); expect(completeness({ ...s, witness: "Extra personal data" })).toBe(completeness(s)); });
});
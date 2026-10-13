import { beforeEach, describe, expect, it } from "vitest";
import { createIntake, effectiveStatus, submitIntake, reviewIntake, exportPackage, blankIntakeItem, completeness } from "@/lib/intakeSessions";
import { updateIntake, startPropertyReport, loadIntakes, visibleInDemoOperations } from "@/lib/intakeSessions";
import { loadTheftIncidents } from "@/lib/theftIncidents";
import { inviteWitness, updateWitness, witnessView } from "@/lib/witnessSessions";

const create = () => createIntake({ agency: "Test agency", agencyNumber: "EV-26-12", eventType: "Theft", assigned: "Officer", participant: "Participant", delivery: "Agency-managed link" }, 24);
beforeEach(() => localStorage.clear());
describe("David intake safeguards", () => {
  it("shows My Property reports in the demo officer queue across resident counties", () => {
    const s = startPropertyReport({ pin: "WATCH-TEST", name: "Watch", category: "Electronics", identifier: "WATCH-123", value: "500", county: "Brevard County" });
    expect(visibleInDemoOperations(s, "Orange County Sheriff's Office")).toBe(true);
    expect(s.items[0].sourcePin).toBe("WATCH-TEST");
  });
  it("keeps invitation reports in their originating agency queue", () => {
    const s = create();
    expect(visibleInDemoOperations(s, "Test agency")).toBe(true);
    expect(visibleInDemoOperations(s, "Other agency")).toBe(false);
  });
  it("resumes an unfinished My Property report without duplicating it", () => {
    const item = { pin: "WATCH-TEST", name: "Watch", category: "Electronics", identifier: "WATCH-123", value: "500" };
    expect(startPropertyReport(item).id).toBe(startPropertyReport(item).id);
    expect(loadIntakes()).toHaveLength(1);
  });
  it("records link-reported items separately from ownership registrations", () => {
    const s = submitIntake({ ...create(), consent: true, verified: true, narrative: "My camera was taken", items: [{ ...blankIntakeItem(), name: "Camera", identifier: "CAM-123" }] });
    expect(loadIntakes()[0].items[0].name).toBe("Camera");
    expect(loadTheftIncidents()[0].items[0].name).toBe("Camera");
    expect(loadTheftIncidents()[0].sessionId).toBe(s.id);
    expect(localStorage.getItem("propertyproof.records")).toBeNull();
  });
  it("preserves original statement across corrected versions", () => { const original = updateIntake(create(), { narrative: "My watch was taken at 9 PM" }, "Participant completed incident step"); const corrected = updateIntake(original, { narrative: "My watch was taken at 10 PM" }, "Participant corrected narrative"); expect(corrected.originalStatement).toBe("My watch was taken at 9 PM"); expect(corrected.narrative).toBe("My watch was taken at 10 PM"); expect(corrected.versions?.length).toBe(2); });
  it("creates a linked theft record without altering original property", () => { const property = { pin: "ORIGINAL-PIN", item: "Watch", status: "protected" }; localStorage.setItem("propertyproof.records", JSON.stringify([property])); const s = submitIntake({ ...create(), consent: true, verified: true, narrative: "Watch stolen", items: [{ ...blankIntakeItem(), name: "Watch", sourcePin: "ORIGINAL-PIN" }] }); expect(JSON.parse(localStorage.getItem("propertyproof.records") ?? "[]")[0]).toEqual(property); expect(loadTheftIncidents()[0].id).toBe(s.incidentId); expect(loadTheftIncidents()[0].items[0].propertyPin).toBe("ORIGINAL-PIN"); });
  it("keeps witness view independent from victim session and evidence", () => { const victim = create(); const w = inviteWitness(victim.id, "Witness", victim.expiresAt); const view = witnessView(w.token); expect(view).not.toHaveProperty("parentId"); expect(view).not.toHaveProperty("evidence"); expect(view).not.toHaveProperty("narrative"); expect(view?.statement).toBe(""); });
  it("requires witness consent before independent attestation", () => { const s = create(); const w = inviteWitness(s.id, "Witness", s.expiresAt); expect(() => updateWitness(w.token, { statement: "I saw a person leave" }, true)).toThrow(); });
  it("expires unfinished time-limited sessions", () => { const s = create(); expect(effectiveStatus(s, new Date(s.expiresAt).getTime())).toBe("Expired"); });
  it("requires participant consent before package submission", () => { const s = { ...create(), verified: true, narrative: "Watch taken", items: [{ ...blankIntakeItem(), name: "Watch" }] }; expect(() => submitIntake(s)).toThrow(); });
  it("requires participant verification before package submission", () => { const s = { ...create(), consent: true, narrative: "Watch taken", items: [{ ...blankIntakeItem(), name: "Watch" }] }; expect(() => submitIntake(s)).toThrow(); });
  it("records attestation before agency review", () => { const s = create(); expect(() => reviewIntake(s, "Accepted", "Reviewed", "")).toThrow(); });
  it("blocks export until the participant submits", () => { expect(() => exportPackage(create())).toThrow(); });
  it("requests more information and requires a fresh attestation", () => { const s = submitIntake({ ...create(), consent: true, verified: true, narrative: "Watch taken", items: [{ ...blankIntakeItem(), name: "Watch" }] }); const next = reviewIntake(s, "More information requested", "Clarify location", ""); expect(next.attestedAt).toBeUndefined(); expect(next.status).toBe("More information requested"); });
  it("exports an accepted package without photograph payloads", () => { const s = submitIntake({ ...create(), consent: true, verified: true, narrative: "Watch taken", items: [{ ...blankIntakeItem(), name: "Watch", source: "Emily record" as const, sourcePin: "OWNER-PIN" }], evidence: [{ id: "e", name: "watch.jpg", kind: "Photo" as const, url: "data:image/jpeg;base64,secret", at: "2026-10-13" }] }); expect(() => exportPackage(s)).not.toThrow(); const accepted = reviewIntake(s, "Accepted", "Reviewed against intake", ""); const data = JSON.parse(exportPackage(accepted)); expect(data.items[0].source).toBe("Emily record"); expect(data.evidence[0].url).toBeUndefined(); });
  it("does not reward extra personal information in completeness", () => { const s = create(); expect(completeness({ ...s, witness: "Extra personal data" })).toBe(completeness(s)); });
});
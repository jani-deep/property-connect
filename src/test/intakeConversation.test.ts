import { beforeEach, expect, it } from "vitest";
import { answerIntake, initialQuestion } from "@/lib/intakeConversation";
import { createIntake, updateIntake } from "@/lib/intakeSessions";
beforeEach(() => localStorage.clear());
const create = () => createIntake({ agency: "Agency", agencyNumber: "CASE-12", eventType: "Theft", assigned: "Officer", participant: "Victim", delivery: "Link" }, 24);
it("asks one question at a time and stores each explicit answer", () => {
  let s = create();
  const answers = ["I consent", "CASE-12", "My camera was taken", "Orlando", "Yesterday evening", "Canon camera", "Camera", "Black R5", "SERIAL-123", "DNA-456", "USD 2000", "no", "skip", "skip", "skip", "skip"];
  for (const text of answers) { const result = answerIntake(s, initialQuestion(s), text); s = updateIntake(s, result.patch, result.action); }
  expect(initialQuestion(s)).toBe("review"); expect(s.narrative).toBe("My camera was taken"); expect(s.originalStatement).toBe("My camera was taken"); expect(s.items[0].identifier).toBe("SERIAL-123"); expect(s.items[0].dnaPin).toBe("DNA-456"); expect(s.step).toBe(5);
});
it("requires consent before proceeding to verification", () => { expect(() => answerIntake(create(), "consent", "no")).toThrow(); });
it("requires the matching demo agency number before narrative", () => { expect(() => answerIntake(create(), "verification", "WRONG")).toThrow(); });
it("resumes the saved question without losing the original statement", () => { const s = updateIntake(create(), answerIntake(create(), "narrative", "Original account").patch, "Participant completed incident step"); expect(initialQuestion({ ...s, status: "Paused" })).toBe("location"); const corrected = updateIntake(s, { narrative: "Correction" }, "Participant corrected narrative"); expect(corrected.originalStatement).toBe("Original account"); });
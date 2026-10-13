import { useState } from "react";
import { Button } from "@/components/ui/button";
import demoCamera from "@/assets/demo-camera.jpg";
import { updateIntake, type IntakeSession } from "@/lib/intakeSessions";

export default function FictionalEvidence({ session, onChange }: { session: IntakeSession; onChange: (s: IntakeSession) => void }) {
  const [error, setError] = useState("");
  const add = async () => {
    try {
      const blob = await (await fetch(demoCamera)).blob();
      const photo = await new Promise<string>((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.onerror = reject; r.readAsDataURL(blob); });
      const receipt = "FICTIONAL IACP DEMO — NOT A REAL RECEIPT\nSample Camera Store\nCanon EOS R5\nPurchase: 2026-01-15\nAmount: USD 2,000\nThis fictional evidence is for demonstration only.";
      const receiptUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(receipt)}`;
      const at = new Date().toISOString();
      onChange(updateIntake(session, { evidence: [...session.evidence, { id: crypto.randomUUID(), name: "FICTIONAL-camera-photo.jpg", kind: "Photo", url: photo, at, fictional: true }, { id: crypto.randomUUID(), name: "FICTIONAL-receipt.txt", kind: "Receipt", url: receiptUrl, at, fictional: true }] }, "Participant added explicitly fictional IACP demonstration evidence"));
    } catch { setError("Fictional evidence could not be saved in this browser."); }
  };
  return <div className="border-t border-border pt-4"><Button variant="outline" onClick={add} disabled={session.evidence.some((e) => e.fictional)}>Add fictional IACP photo & receipt</Button><p className="mt-2 text-xs text-muted-foreground">Sample camera photo and clearly labelled fictional receipt, never real case evidence.</p>{error && <p className="mt-2 text-xs text-destructive">{error}</p>}</div>;
}
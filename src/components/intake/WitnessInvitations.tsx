import { useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardCopy, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, inputCls } from "@/components/le/LePage";
import { inviteWitness, loadWitnesses } from "@/lib/witnessSessions";
import type { IntakeSession } from "@/lib/intakeSessions";

export default function WitnessInvitations({ session }: { session: IntakeSession }) {
  const [label, setLabel] = useState(""); const [tick, setTick] = useState(0); const [error, setError] = useState("");
  const witnesses = loadWitnesses().filter((w) => w.parentId === session.id);
  return <section className="mt-6 space-y-3 border-t border-border pt-5" data-version={tick}><h3 className="flex items-center gap-2 font-semibold"><Users className="h-5 w-5 text-primary" />Independent witnesses</h3><p className="text-xs text-muted-foreground">Separate demo invitations. Witness pages do not display the victim’s statement, property, or evidence. Real secure delivery is not connected.</p><Field label="Witness label"><input className={inputCls} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Fictional neighbour" /></Field><Button variant="outline" disabled={!label.trim()} onClick={() => { inviteWitness(session.id, label.trim(), session.expiresAt); setTick((t) => t + 1); setLabel(""); }}><Plus />Create witness invitation</Button>{witnesses.map((w) => <div key={w.id} className="rounded-lg border border-border bg-card p-3"><div className="flex items-center justify-between gap-2"><div><p className="text-sm font-semibold">{w.label}</p><p className="text-xs text-primary">{w.status}</p></div><Button variant="ghost" size="icon" aria-label={`Copy invitation for ${w.label}`} onClick={async () => { try { await navigator.clipboard.writeText(`${window.location.origin}/witness/${w.token}`); setError("Invitation link copied."); } catch { setError("Use the witness link below."); } }}><ClipboardCopy /></Button></div><Button variant="link" className="h-auto px-0 py-2" asChild><Link to={`/witness/${w.token}`}>Open independent witness demo</Link></Button></div>)}{error && <p className="text-xs text-primary">{error}</p>}</section>;
}
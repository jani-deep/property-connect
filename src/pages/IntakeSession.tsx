import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import MobileHeader from "@/components/MobileHeader";
import BottomNav from "@/components/BottomNav";
import davidAvatar from "@/assets/david-avatar.jpg";
import { Button } from "@/components/ui/button";
import { RecoveryPackage } from "@/components/intake/RecoveryPackage";
import GuidedIntakeChat from "@/components/intake/GuidedIntakeChat";
import { effectiveStatus, loadIntakes, updateIntake, type IntakeSession } from "@/lib/intakeSessions";
export default function IntakeSessionPage() {
  const { token } = useParams(); const [session, setSession] = useState<IntakeSession | undefined>(() => loadIntakes().find((s) => s.token === token));
  const [error, setError] = useState("");
  useEffect(() => { setSession(loadIntakes().find((s) => s.token === token)); }, [token]);
  const status = session ? effectiveStatus(session) : "Expired";
  const chatting = Boolean(session && !["Expired", "Abandoned", "Completed", "Accepted", "Rejected", "Paused"].includes(status));
  return <div className="flex h-[100dvh] flex-col overflow-hidden bg-background pb-16 font-body"><MobileHeader title="David – AI Guide" subtitle="Guided stolen property reporting" icon={<span className="block h-8 w-8 overflow-hidden rounded-full bg-primary/10 ring-1 ring-primary/30"><img src={davidAvatar} alt="David AI" className="h-full w-full object-cover object-top" /></span>} /><main className={`mx-auto flex w-full max-w-xl min-h-0 flex-1 flex-col ${chatting ? "" : "overflow-y-auto px-4 py-5"}`}>
  {!session ? <div className="space-y-4 py-12 text-center"><ShieldCheck className="mx-auto h-12 w-12 text-primary" /><h1 className="text-2xl font-bold">Session unavailable</h1><p className="text-sm text-muted-foreground">This demo link must be opened in the browser where the agency created it. Ask the agency for a new session if needed.</p><Button variant="outline" asChild><Link to="/">Return to PropertyProof</Link></Button></div> : <>
    {["Expired", "Abandoned"].includes(status) ? <div className="py-6"><h1 className="text-xl font-semibold">Session {status.toLowerCase()}</h1><p className="mt-3 text-sm">Contact {session.agency} for a new link.</p></div> : ["Completed", "Accepted", "Rejected"].includes(status) ? <><div className="mb-6 flex gap-3 border-b border-border pb-5"><Check className="text-success" /><div><h1 className="font-semibold">{status === "Completed" ? "Recovery Package submitted" : `Package ${status.toLowerCase()}`}</h1><p className="mt-2 text-sm">{status === "Completed" ? "Your agency will review your information. This does not automatically create a police report." : session.reviewNote}</p></div></div><RecoveryPackage session={session} /><Button variant="outline" className="mt-6" asChild><Link to="/david">My reporting sessions</Link></Button></> : status === "Paused" ? <div className="space-y-4 py-6"><h1 className="text-xl font-semibold">Your conversation is saved</h1><p className="text-sm text-muted-foreground">Continue where you left off with David.</p><Button onClick={() => { try { setSession(updateIntake(session, { status: "Started" }, "Participant resumed intake")); } catch { setError("Your session could not be resumed in this browser."); } }}>Resume with David <ArrowRight /></Button></div> : <>{status === "More information requested" && <p className="mb-4 border-l-2 border-warning pl-3 text-sm"><strong>Your agency requested more information:</strong> {session.reviewNote}</p>}<GuidedIntakeChat key={session.id} session={session} onChange={setSession} /></>}
    {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}{!chatting && <p className="mt-5 text-center text-[11px] text-muted-foreground">Demo · saved in this browser · link expires {new Date(session.expiresAt).toLocaleString()}</p>}
  </>}
  </main><BottomNav /></div>;
}

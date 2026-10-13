import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LePage } from "@/components/le/LePage";
import { RecoveryPackage } from "@/components/intake/RecoveryPackage";
import { effectiveStatus, updateIntake, useIntakes, visibleInDemoOperations } from "@/lib/intakeSessions";
import { loadOfficer } from "@/lib/leData";
import WitnessInvitations from "@/components/intake/WitnessInvitations";

export default function LeIntakeDetail() {
  const { id } = useParams(); const sessions = useIntakes(); const session = sessions.find((s) => s.id === id && visibleInDemoOperations(s, loadOfficer().agency));
  useEffect(() => { if (session?.status === "Completed" && !session.reviewStartedAt) updateIntake(session, { reviewStartedAt: new Date().toISOString() }, "Agency package review started"); }, [session]);
  return <LePage eyebrow="David Operations" title={session?.participant ?? "Session unavailable"} action={<Button variant="outline" asChild><Link to="/le/david"><ArrowLeft />Sessions</Link></Button>}>
    {session ? <div className="max-w-4xl"><div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-y border-border py-4"><div><p className="text-sm font-semibold">{effectiveStatus(session) === "Completed" ? "Package ready for review" : effectiveStatus(session)}</p><p className="text-xs text-muted-foreground">Link expires {new Date(session.expiresAt).toLocaleString()}</p></div>{!["Expired", "Accepted", "Rejected", "Abandoned"].includes(effectiveStatus(session)) && <Button variant="outline" asChild><Link to={`/intake/${session.token}`}><ExternalLink />Open participant demo</Link></Button>}</div><RecoveryPackage key={`${session.id}-${session.status}`} session={session} agencyReview /></div> : <p className="text-sm text-muted-foreground">This session is not available for the current agency.</p>}
    {session && <div className="max-w-4xl"><WitnessInvitations session={session} /></div>}
  </LePage>;
}
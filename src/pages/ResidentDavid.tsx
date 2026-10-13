import { Link } from "react-router-dom";
import { ArrowRight, FileCheck2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import DemoLayout from "@/components/DemoLayout";
import { effectiveStatus, useIntakes } from "@/lib/intakeSessions";

export default function ResidentDavid({ onLogout }: { onLogout?: () => void }) {
  const sessions = useIntakes();
  return <DemoLayout title="David" subtitle="Stolen-property reporting" icon={<ShieldCheck className="h-5 w-5" />} onLogout={onLogout}><div className="mx-auto max-w-xl px-4 py-6"><h1 className="font-heading text-2xl font-bold">My reporting sessions</h1><p className="mt-2 text-xs text-warning">Browser-only demo · agency-created sessions</p><div className="mt-6 space-y-3">{sessions.map((s) => <div key={s.id} className="rounded-lg border border-border bg-card p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">{s.eventType}</h2><p className="mt-1 text-xs text-muted-foreground">{s.agency} · {s.agencyNumber}</p><p className="mt-2 text-xs font-medium text-primary">{effectiveStatus(s)}</p></div><FileCheck2 className="h-5 w-5 shrink-0 text-primary" /></div><Button variant="outline" size="sm" className="mt-4" asChild><Link to={`/intake/${s.token}`}>{s.completedAt ? "Preview report" : "Continue with David"}<ArrowRight /></Link></Button></div>)}{!sessions.length && <div className="border-y border-border py-10 text-center"><ShieldCheck className="mx-auto mb-3 h-10 w-10 text-primary" /><h2 className="font-semibold">No agency sessions yet</h2><p className="mt-2 text-sm text-muted-foreground">Open the intake link provided by your agency to begin a report with David.</p></div>}</div></div></DemoLayout>;
}
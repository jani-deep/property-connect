import { useState } from "react";
import { Check, ChevronRight, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LePage, Card } from "@/components/le/LePage";
import { loadStages, setStage } from "@/lib/bridge";
import { addAudit, loadApprovals, saveApprovals, statusBadge } from "@/lib/leData";

const LeApprovals = () => {
  const [list, setList] = useState(loadApprovals);
  const decide = (id: string, status: "Approved" | "Denied") => {
    const next = list.map((r) => (r.id === id ? { ...r, status } : r));
    setList(next); saveApprovals(next);
    const r = list.find((x) => x.id === id)!;
    // Requests raised from David move the return case forward (or back) automatically.
    if (loadStages()[r.pin] === 1) setStage(r.pin, r.item, r.county ?? "", status === "Approved" ? 2 : 0);
    addAudit({ action: `Reveal ${status.toLowerCase()}`, reason: r.reason, caseNo: r.caseNo, data: `${r.item} owner record` });
  };
  return (
    <LePage eyebrow="Supervisor" title="Approval Queue" subtitle="Exceptional searches and sensitive-property reveals awaiting a decision.">
      <div className="space-y-3">
        {list.map((r) => (
          <Card key={r.id} className="flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <Link to={`/le/approvals/${r.id}`} className="text-sm font-semibold hover:text-primary">{r.ticket && <span className="mr-2 font-mono text-xs text-primary">{r.ticket}</span>}{r.item} <span className="text-xs font-normal text-muted-foreground">· {r.category}</span></Link>
              <p className="text-xs text-muted-foreground">{r.officer} · Case {r.caseNo} · {new Date(r.at).toLocaleString()}</p>
              <p className="mt-1 text-xs">Reason: {r.reason}</p>
            </div>
            <Button size="sm" variant="ghost" asChild><Link to={`/le/approvals/${r.id}`}>Review details <ChevronRight /></Link></Button>
            {r.status === "Pending" ? (
              <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => decide(r.id, "Denied")}><X /> Deny</Button><Button size="sm" onClick={() => decide(r.id, "Approved")}><Check /> Approve</Button></div>
            ) : <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadge(r.status)}`}>{r.status}</span>}
          </Card>
        ))}
        {!list.length && <Card className="p-10 text-center text-sm text-muted-foreground">No requests waiting.</Card>}
      </div>
    </LePage>
  );
};

export default LeApprovals;

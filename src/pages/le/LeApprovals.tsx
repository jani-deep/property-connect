import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LePage, Card } from "@/components/le/LePage";
import { addAudit, loadApprovals, saveApprovals, statusBadge } from "@/lib/leData";

const LeApprovals = () => {
  const [list, setList] = useState(loadApprovals);
  const decide = (id: string, status: "Approved" | "Denied") => {
    const next = list.map((r) => (r.id === id ? { ...r, status } : r));
    setList(next); saveApprovals(next);
    const r = list.find((x) => x.id === id)!;
    addAudit({ action: `Reveal ${status.toLowerCase()}`, reason: r.reason, caseNo: r.caseNo, data: `${r.item} owner record` });
  };
  return (
    <LePage eyebrow="Supervisor" title="Approval Queue" subtitle="Exceptional searches and sensitive-property reveals awaiting a decision.">
      <div className="space-y-3">
        {list.map((r) => (
          <Card key={r.id} className="flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{r.item} <span className="text-xs font-normal text-muted-foreground">· {r.category}</span></p>
              <p className="text-xs text-muted-foreground">{r.officer} · Case {r.caseNo} · {new Date(r.at).toLocaleString()}</p>
              <p className="mt-1 text-xs">Reason: {r.reason}</p>
            </div>
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

import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Check, ChevronLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LePage, Card } from "@/components/le/LePage";
import { loadEvents, loadStages, setStage, RETURN_STAGES } from "@/lib/bridge";
import { addAudit, leRecords, loadApprovals, saveApprovals, statusBadge } from "@/lib/leData";
import { loadRecords } from "@/lib/propertyRecord";
import { maskPhone, maskSerial } from "@/lib/mask";

const Row = ({ label, value, mono }: { label: string; value?: string; mono?: boolean }) => (
  <div className="flex justify-between gap-4 border-b border-border py-2 text-sm last:border-0">
    <span className="text-muted-foreground">{label}</span>
    <span className={`text-right font-medium ${mono ? "font-mono text-xs" : ""}`}>{value || "—"}</span>
  </div>
);

const LeApprovalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState(loadApprovals);
  const r = list.find((x) => x.id === id);
  if (!r) return <LePage eyebrow="Supervisor" title="Request not found"><Link to="/le/approvals" className="text-sm text-primary underline">Back to Approval Queue</Link></LePage>;

  const resident = loadRecords().find((x) => x.pin === r.pin);
  const le = leRecords.find((x) => x.pin === r.pin);
  const img = resident?.img || le?.image;
  const stage = loadStages()[r.pin];
  const history = loadEvents().filter((e) => e.pin === r.pin);

  const decide = (status: "Approved" | "Denied") => {
    const next = list.map((x) => (x.id === r.id ? { ...x, status } : x));
    setList(next); saveApprovals(next);
    if (stage === 1) setStage(r.pin, r.item, r.county ?? "", status === "Approved" ? 2 : 0);
    addAudit({ action: `Reveal ${status.toLowerCase()}`, reason: r.reason, caseNo: r.caseNo, data: `${r.ticket ?? r.item} owner record` });
    navigate("/le/approvals");
  };

  return (
    <LePage eyebrow={`Supervisor · ${r.ticket ?? "Request"}`} title={r.item} subtitle={`Requested by ${r.officer} · ${new Date(r.at).toLocaleString()}`}
      action={r.status === "Pending" ? <div className="flex gap-2"><Button variant="outline" onClick={() => decide("Denied")}><X /> Deny</Button><Button onClick={() => decide("Approved")}><Check /> Approve reveal</Button></div> : <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(r.status)}`}>{r.status}</span>}>
      <Link to="/le/approvals" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ChevronLeft className="h-3.5 w-3.5" /> Approval Queue</Link>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4">
          {img && <img src={img} alt={r.item} className="mb-3 aspect-square w-full rounded-md object-cover" />}
          <h2 className="mb-1 text-sm font-semibold">Property</h2>
          <Row label="Item" value={r.item} />
          <Row label="Category" value={r.category} />
          <Row label="DNA PIN" value={r.pin} mono />
          <Row label="Serial / VIN" value={maskSerial(r.serial || resident?.serial || le?.serial || "")} mono />
          <Row label="County" value={r.county || resident?.county || le?.county} />
          <Row label="Registry status" value={le?.status ?? (resident ? "Registered via Emily" : undefined)} />
          {le?.features && <Row label="Marks" value={le.features} />}
        </Card>
        <Card className="p-4">
          <h2 className="mb-1 text-sm font-semibold">Request from officer</h2>
          <Row label="Ticket" value={r.ticket} mono />
          <Row label="Officer" value={r.officer} />
          <Row label="Agency" value={r.agency} />
          <Row label="Case number" value={r.caseNo} mono />
          <div className="py-2 text-sm"><div className="text-muted-foreground">Reason for match</div><p className="mt-1 font-medium">{r.reason}</p></div>
          <div className="border-t border-border py-2 text-sm"><div className="text-muted-foreground">DNA kit reason</div><p className="mt-1 font-medium">{r.dnaReason || "—"}</p></div>
        </Card>
        <Card className="p-4">
          <h2 className="mb-1 text-sm font-semibold">Owner record</h2>
          <p className="mb-2 text-xs text-muted-foreground">Released to the officer only after you approve.</p>
          <Row label="Owner" value={resident?.owner || le?.owner} />
          <Row label="Phone" value={maskPhone(resident?.phone || le?.phone || "")} mono />
          <h2 className="mb-1 mt-4 text-sm font-semibold">Return progress</h2>
          <Row label="Current step" value={stage !== undefined ? RETURN_STAGES[stage] : "—"} />
          <div className="mt-2 space-y-1">
            {history.slice(0, 8).map((e) => <div key={e.id} className="text-xs text-muted-foreground">{new Date(e.at).toLocaleString()} · {e.type}</div>)}
          </div>
        </Card>
      </div>
    </LePage>
  );
};

export default LeApprovalDetail;

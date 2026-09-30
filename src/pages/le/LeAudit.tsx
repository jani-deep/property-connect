import { useState } from "react";
import { Search } from "lucide-react";
import { LePage, Card, inputCls } from "@/components/le/LePage";
import { loadAudit, statusBadge } from "@/lib/leData";

export const team = [
  { name: "Sgt. Daniel Reyes", role: "Investigator", badge: "4417", status: "Active" },
  { name: "Ofc. Kayla Brooks", role: "Patrol Officer", badge: "5203", status: "Active" },
  { name: "Lt. Maria Chen", role: "Supervisor", badge: "2110", status: "Active" },
  { name: "Capt. Robert Hayes", role: "Agency Administrator", badge: "1008", status: "Active" },
  { name: "Angela Moss", role: "Auditor", badge: "A-77", status: "Active" },
  { name: "Ofc. Marcus Lee", role: "Patrol Officer", badge: "5331", status: "Pending" },
];

const LeAudit = () => {
  const [tab, setTab] = useState<"log" | "team">("log");
  const [q, setQ] = useState("");
  const log = loadAudit().filter((a) => `${a.officer} ${a.action} ${a.caseNo} ${a.reason}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <LePage eyebrow="Accountability" title="Audit & Team" subtitle="Who searched, what was viewed, why, and under which case number.">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-md bg-muted p-1">
          {(["log", "team"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded px-4 py-1.5 text-xs font-semibold ${tab === t ? "bg-card shadow-sm" : "text-muted-foreground"}`}>{t === "log" ? "Auditor view" : "Team members"}</button>
          ))}
        </div>
        {tab === "log" && <div className="relative w-full max-w-xs"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input className={`${inputCls} pl-9`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Officer, action, case…" /></div>}
      </div>
      <Card className="overflow-x-auto">
        {tab === "log" ? (
          <table className="w-full min-w-[800px] text-sm">
            <thead className="border-b border-border text-left text-xs text-muted-foreground"><tr>{["Timestamp", "Officer", "Agency", "Action", "Reason", "Case #", "Data viewed"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-border">
              {log.map((a) => (
                <tr key={a.id}><td className="px-4 py-3 text-xs text-muted-foreground">{new Date(a.at).toLocaleString()}</td><td className="px-4 py-3 font-medium">{a.officer}</td><td className="px-4 py-3 text-xs">{a.agency}</td><td className="px-4 py-3">{a.action}</td><td className="px-4 py-3 text-xs">{a.reason}</td><td className="px-4 py-3 font-mono text-xs">{a.caseNo}</td><td className="px-4 py-3 text-xs text-muted-foreground">{a.data}</td></tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full min-w-[600px] text-sm">
            <thead className="border-b border-border text-left text-xs text-muted-foreground"><tr>{["Member", "Role", "Badge", "Status"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-border">
              {team.map((m) => <tr key={m.badge}><td className="px-4 py-3 font-medium">{m.name}</td><td className="px-4 py-3">{m.role}</td><td className="px-4 py-3 font-mono text-xs">{m.badge}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadge(m.status)}`}>{m.status}</span></td></tr>)}
            </tbody>
          </table>
        )}
      </Card>
    </LePage>
  );
};

export default LeAudit;

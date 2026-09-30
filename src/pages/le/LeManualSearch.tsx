import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Barcode, Eye, Fingerprint, Lock, MapPin, Search, ShieldAlert, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LePage, Card, Field, inputCls } from "@/components/le/LePage";
import { addAudit, findExact, loadApprovals, loadOfficer, saveApprovals, statusBadge, type LeRecord } from "@/lib/leData";
import { addLeSearchHistory } from "@/lib/leSearchHistory";
import { maskPhone, maskPin, maskSerial } from "@/lib/mask";

const LeManualSearch = () => {
  const [params] = useSearchParams();
  const [type, setType] = useState<"id" | "barcode">("id");
  const [query, setQuery] = useState(params.get("q") || "");
  const [result, setResult] = useState<LeRecord | null | undefined>(undefined);
  const [reason, setReason] = useState("");
  const [caseNo, setCaseNo] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [requested, setRequested] = useState(false);
  const [scanning, setScanning] = useState(false);
  const officer = loadOfficer();
  const canRevealSensitive = officer.role === "Supervisor" || officer.role === "Agency Administrator";

  const run = (value = query) => {
    const r = findExact(value) ?? null;
    setResult(r); setRevealed(false); setRequested(false);
    addAudit({ action: type === "barcode" ? "Barcode search" : "Identifier search", reason: "Field lookup", caseNo: "—", data: r ? `${r.item} (summary)` : `No match for ${value}` });
    if (r) addLeSearchHistory({ id: `m-${Date.now()}`, item: r.item, serial: r.serial, pin: r.pin, county: r.county, status: r.status === "Protected" ? "Clear" : r.status, confidence: 100, searchedAt: new Date().toISOString(), image: r.image });
  };

  const scanBarcode = () => {
    setScanning(true);
    setTimeout(() => { setQuery("0012345678905"); setScanning(false); run("0012345678905"); }, 1400);
  };

  const reveal = () => {
    if (!result) return;
    if (result.sensitive && !canRevealSensitive) {
      saveApprovals([{ id: crypto.randomUUID(), officer: officer.name, item: result.item, pin: result.pin, category: result.category, reason, caseNo, status: "Pending", at: new Date().toISOString() }, ...loadApprovals()]);
      addAudit({ action: "Reveal requested", reason, caseNo, data: `${result.item} owner record` });
      setRequested(true);
    } else {
      addAudit({ action: "Owner reveal", reason, caseNo, data: `${result.item} owner record` });
      setRevealed(true);
    }
  };

  return (
    <LePage eyebrow="Identifier search" title="Search Property Manually" subtitle="Searches start only from an exact PIN, serial number, VIN or barcode. Registered property cannot be browsed.">
      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Card className="p-5 h-fit">
          <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1 mb-4">
            {(["id", "barcode"] as const).map((t) => (
              <button key={t} onClick={() => setType(t)} className={`rounded px-3 py-2 text-xs font-semibold ${type === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
                {t === "id" ? "PIN / Serial / VIN" : "Barcode"}
              </button>
            ))}
          </div>
          {type === "id" ? (
            <div className="space-y-3">
              <Field label="Exact identifier"><input className={`${inputCls} font-mono`} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && run()} placeholder="FL-DNA-7829-AX" /></Field>
              <Button className="w-full" onClick={() => run()} disabled={!query.trim()}><Search /> Search</Button>
              <p className="text-[11px] text-muted-foreground">Try: FL-DNA-7829-AX · WBA53BJ09RWC18294 · C02ZN1LPMD6T</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/40">
                {scanning ? <p className="text-sm text-primary animate-pulse">Reading barcode…</p> : <Barcode className="h-12 w-12 text-muted-foreground" />}
              </div>
              <Button className="w-full" onClick={scanBarcode} disabled={scanning}><Upload /> Scan or upload barcode</Button>
              <Field label="Or type barcode number"><input className={`${inputCls} font-mono`} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && run()} /></Field>
            </div>
          )}
        </Card>

        <div>
          {result === undefined && <Card className="flex min-h-72 flex-col items-center justify-center p-6 text-center"><Fingerprint className="mb-3 h-8 w-8 text-muted-foreground" /><p className="text-sm font-semibold">Enter an exact identifier to begin</p></Card>}
          {result === null && <Card className="flex min-h-72 flex-col items-center justify-center p-6 text-center"><ShieldAlert className="mb-3 h-8 w-8 text-muted-foreground" /><p className="text-sm font-semibold">No match</p><p className="text-xs text-muted-foreground mt-1">The search was stored for follow-up.</p></Card>}
          {result && (
            <Card className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3">
                <span className="text-xs font-semibold text-success">Exact match · {type === "barcode" ? "Barcode" : "Identifier"} · PropertyProof registry</span>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadge(result.status)}`}>{result.status}</span>
              </div>
              <div className="grid gap-5 p-5 md:grid-cols-[220px_1fr]">
                <img src={result.image} alt={result.item} className="h-44 w-full rounded-md border border-border object-cover" />
                <div>
                  <h2 className="font-heading text-lg font-bold">{result.item}</h2>
                  <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    {[["Make / Model", `${result.make} ${result.model}`], ["Category", result.category], ["Colour", result.color], ["Jurisdiction", result.county], ["Distinguishing features", result.features], ["Ownership evidence", "On file"]].map(([k, v]) => (
                      <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>
                    ))}
                  </dl>
                  {result.sensitive && <p className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning"><Lock className="h-3.5 w-3.5" /> Sensitive category — supervisor approval required to reveal owner</p>}
                </div>
              </div>
              <div className="border-t border-border p-5">
                {revealed ? (
                  <dl className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                    {[["Owner", result.owner], ["Phone", maskPhone(result.phone)], ["County", result.county], ["Status", result.status], ["Serial", result.serial], ["DNA PIN", result.pin]].map(([k, v]) => (
                      <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-mono font-medium">{v}</dd></div>
                    ))}
                  </dl>
                ) : requested ? (
                  <p className="text-sm text-muted-foreground">Reveal request sent to the supervisor approval queue. Case {caseNo}.</p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-[1fr_180px_auto] md:items-end">
                    <Field label="Reason for reveal"><input className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Return recovered property" /></Field>
                    <Field label="Case number"><input className={inputCls} value={caseNo} onChange={(e) => setCaseNo(e.target.value)} placeholder="OC-26-00000" /></Field>
                    <Button onClick={reveal} disabled={!reason || !caseNo}><Eye /> {result.sensitive && !canRevealSensitive ? "Request reveal" : "Reveal owner"}</Button>
                    <p className="text-[11px] text-muted-foreground md:col-span-3 flex items-center gap-1"><MapPin className="h-3 w-3" /> Summary only: {maskPin(result.pin)} · {maskSerial(result.serial)}. Every reveal is recorded in the audit log.</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </LePage>
  );
};

export default LeManualSearch;

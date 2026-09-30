import { useState } from "react";
import { ChevronDown, FolderOpen } from "lucide-react";
import { LePage, Card } from "@/components/le/LePage";
import { loadLeSearchHistory } from "@/lib/leSearchHistory";
import { statusBadge } from "@/lib/leData";
import { maskPin } from "@/lib/mask";

const LeCases = () => {
  const cases = loadLeSearchHistory();
  const [open, setOpen] = useState<string | null>(cases[0]?.id ?? null);

  const timeline = (at: string, status: string, source: string) => {
    const t = new Date(at).getTime();
    const steps = [
      { label: "Property captured", at: t },
      { label: `Identified via ${source}`, at: t + 60_000 },
      { label: "Case opened", at: t + 5 * 60_000 },
    ];
    if (status !== "Clear") steps.push({ label: "Owner notified", at: t + 45 * 60_000 });
    if (status === "Recovered") steps.push({ label: "Property returned to owner", at: t + 26 * 3600_000 });
    return steps;
  };

  return (
    <LePage eyebrow="Case workspace" title="Cases" subtitle="Every property identified by image scan or manual search, with a full event timeline.">
      <div className="space-y-3">
        {cases.map((c, i) => {
          const source = c.id.startsWith("m-") ? "manual search" : "image scan";
          return (
            <Card key={c.id}>
              <button onClick={() => setOpen(open === c.id ? null : c.id)} className="flex w-full items-center gap-4 p-4 text-left">
                <img src={c.image} alt="" className="h-12 w-14 rounded-md border border-border object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{c.item}</p>
                  <p className="text-xs text-muted-foreground">Case OC-26-{11900 - i} · {maskPin(c.pin)} · {c.county}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadge(c.status)}`}>{c.status}</span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open === c.id ? "rotate-180" : ""}`} />
              </button>
              {open === c.id && (
                <ol className="border-t border-border px-6 py-4">
                  {timeline(c.searchedAt, c.status, source).map((s, idx, arr) => (
                    <li key={s.label} className="relative flex gap-3 pb-4 last:pb-0">
                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                      {idx < arr.length - 1 && <span className="absolute left-[4px] top-4 h-full w-px bg-border" />}
                      <div><p className="text-sm font-medium">{s.label}</p><p className="text-xs text-muted-foreground">{new Date(s.at).toLocaleString()}</p></div>
                    </li>
                  ))}
                </ol>
              )}
            </Card>
          );
        })}
        {!cases.length && <Card className="flex min-h-60 flex-col items-center justify-center"><FolderOpen className="h-8 w-8 text-muted-foreground" /><p className="mt-2 text-sm">No cases yet</p></Card>}
      </div>
    </LePage>
  );
};

export default LeCases;

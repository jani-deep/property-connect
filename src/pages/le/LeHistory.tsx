import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock3, Fingerprint, History, MapPin, ScanLine, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearLeSearchHistory, loadLeSearchHistory } from "@/lib/leSearchHistory";
import { maskPin, maskSerial } from "@/lib/mask";

const LeHistory = () => {
  const [history, setHistory] = useState(loadLeSearchHistory);
  const [query, setQuery] = useState("");
  const filtered = history.filter((entry) =>
    `${entry.item} ${entry.county} ${entry.status}`.toLowerCase().includes(query.toLowerCase()),
  );

  const clearHistory = () => {
    clearLeSearchHistory();
    setHistory([]);
  };

  return (
    <div className="w-full max-w-[1400px] px-8 py-7 font-body">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-primary">Officer workspace</p>
          <h1 className="font-heading text-2xl font-bold text-foreground">Search History</h1>
          <p className="text-sm text-muted-foreground">Review recent microdot scans and statewide registry outcomes.</p>
        </div>
        <Button asChild>
          <Link to="/le/search"><ScanLine /> New Scan</Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search item, county, or status"
              className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button variant="outline" onClick={clearHistory} disabled={!history.length}>
            <Trash2 /> Clear History
          </Button>
        </div>

        {filtered.length ? (
          <div className="divide-y divide-border">
            {filtered.map((entry) => (
              <div key={entry.id} className="grid grid-cols-[56px_minmax(220px,1fr)_160px_160px_110px] items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/40">
                <img src={entry.image} alt={entry.item} className="h-12 w-14 rounded-md border border-border object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{entry.item}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><Fingerprint className="h-3.5 w-3.5" /> {maskPin(entry.pin)} · {maskSerial(entry.serial)}</p>
                </div>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {entry.county}</p>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5" /> {new Date(entry.searchedAt).toLocaleString()}</p>
                <div className="text-right">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${entry.status === "Stolen" ? "bg-destructive/10 text-destructive" : entry.status === "Clear" ? "bg-muted text-muted-foreground" : "bg-success/10 text-success"}`}>
                    {entry.status}
                  </span>
                  <p className="mt-1 text-xs font-semibold text-primary">{entry.confidence}% match</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
            <History className="mb-3 h-8 w-8 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">No searches found</h2>
            <p className="mt-1 text-xs text-muted-foreground">Start a new scan to create a search record.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeHistory;
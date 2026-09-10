import { useMemo, useState } from "react";
import { Fingerprint, MapPin, Package, Search, ShieldCheck } from "lucide-react";
import { maskPhone, maskPin, maskSerial } from "@/lib/mask";
import { loadRecords } from "@/lib/propertyRecord";
import demoCar from "@/assets/demo-car.jpg";
import demoWatch from "@/assets/demo-watch.jpg";
import demoLaptop from "@/assets/demo-laptop.jpg";
import demoCamera from "@/assets/demo-camera.jpg";
import demoPhone from "@/assets/demo-phone.jpg";
import demoKeys from "@/assets/demo-keys.jpg";

interface RegistryRow {
  pin: string;
  item: string;
  category: string;
  owner: string;
  phone: string;
  county: string;
  serial: string;
  value: string;
  image: string;
  status: "Protected" | "Incomplete" | "Reported Stolen";
  registeredAt: string;
}

const seed: RegistryRow[] = [
  { pin: "FL-DNA-3301-VK", item: "BMW 5 Series 530i xDrive", category: "Vehicle", owner: "John Smith", phone: "+1 (555) 214-8890", county: "Brevard County", serial: "WBA53BJ09RWC18294", value: "$62,400", image: demoCar, status: "Reported Stolen", registeredAt: "Mar 12, 2026" },
  { pin: "FL-DNA-7829-AX", item: "Rolex Submariner 126610LN", category: "Watch", owner: "Maria Alvarez", phone: "+1 (555) 662-1174", county: "Orange County", serial: "M7X9K2R7", value: "$14,900", image: demoWatch, status: "Protected", registeredAt: "Feb 04, 2026" },
  { pin: "FL-DNA-5520-MR", item: 'MacBook Pro 16"', category: "Electronics", owner: "Daniel Cooper", phone: "+1 (555) 903-4432", county: "Miami-Dade County", serial: "C02ZN1LPMD6T", value: "$3,199", image: demoLaptop, status: "Protected", registeredAt: "Jan 22, 2026" },
  { pin: "FL-DNA-9901-CZ", item: "Canon EOS R5 Mark II", category: "Camera", owner: "Priya Nair", phone: "+1 (555) 771-0028", county: "Hillsborough County", serial: "032024005891", value: "$4,299", image: demoCamera, status: "Protected", registeredAt: "Dec 09, 2025" },
  { pin: "FL-DNA-4417-TB", item: "iPhone 17 Pro Max", category: "Phone", owner: "Andre Wilson", phone: "+1 (555) 330-7712", county: "Broward County", serial: "356938035643809", value: "$1,499", image: demoPhone, status: "Incomplete", registeredAt: "Apr 02, 2026" },
  { pin: "FL-DNA-6188-KY", item: "Home & Vehicle Key Set", category: "Keys", owner: "Sofia Ramirez", phone: "+1 (555) 448-2290", county: "Palm Beach County", serial: "KS-2291-FL", value: "$180", image: demoKeys, status: "Protected", registeredAt: "Apr 18, 2026" },
];

const statusStyle = (s: string) =>
  s === "Reported Stolen"
    ? "bg-destructive/10 text-destructive"
    : s === "Incomplete"
    ? "bg-muted text-muted-foreground"
    : "bg-success/10 text-success";

const LeRegistry = () => {
  const [query, setQuery] = useState("");
  const [county, setCounty] = useState("all");

  const rows = useMemo<RegistryRow[]>(() => {
    const local = loadRecords().map<RegistryRow>((r) => ({
      pin: r.pin,
      item: r.item,
      category: r.category,
      owner: r.owner,
      phone: r.phone,
      county: r.county,
      serial: r.serial,
      value: r.value,
      image: r.img,
      status: r.status === "draft" ? "Incomplete" : "Protected",
      registeredAt: r.registeredAt,
    }));
    const seen = new Set(local.map((r) => r.pin));
    return [...local, ...seed.filter((r) => !seen.has(r.pin))];
  }, []);

  const counties = useMemo(() => Array.from(new Set(rows.map((r) => r.county))).sort(), [rows]);

  const filtered = rows.filter((r) => {
    const matchesCounty = county === "all" || r.county === county;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q || `${r.item} ${r.category} ${r.owner} ${r.pin} ${r.serial} ${r.county} ${r.status}`.toLowerCase().includes(q);
    return matchesCounty && matchesQuery;
  });

  return (
    <div className="w-full max-w-[1400px] px-8 py-7 font-body">
      <div className="mb-6">
        <p className="mb-1 text-xs font-semibold uppercase text-primary">Statewide registry</p>
        <h1 className="font-heading text-2xl font-bold text-foreground">Registered Properties</h1>
        <p className="text-sm text-muted-foreground">All DNA-protected property records visible to connected agencies. Owner contact stays masked.</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="glass-card p-4">
          <div className="text-xs text-muted-foreground">Total records</div>
          <div className="font-mono text-xl font-bold text-foreground">{rows.length}</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-xs text-muted-foreground">Protected</div>
          <div className="font-mono text-xl font-bold text-success">{rows.filter((r) => r.status === "Protected").length}</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-xs text-muted-foreground">Flagged stolen</div>
          <div className="font-mono text-xl font-bold text-destructive">{rows.filter((r) => r.status === "Reported Stolen").length}</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-xs text-muted-foreground">Counties covered</div>
          <div className="font-mono text-xl font-bold text-foreground">{counties.length}</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search item, owner, PIN, serial…"
              className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <select
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All counties</option>
              {counties.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground">{filtered.length} shown</span>
          </div>
        </div>

        {filtered.length ? (
          <div className="divide-y divide-border">
            {filtered.map((r) => (
              <div key={r.pin} className="grid grid-cols-[56px_minmax(220px,1.4fr)_minmax(150px,1fr)_160px_120px_110px] items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/40">
                <img src={r.image} alt={r.item} className="h-12 w-14 rounded-md border border-border object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{r.item}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Fingerprint className="h-3.5 w-3.5" /> {maskPin(r.pin)} · {maskSerial(r.serial)}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-foreground">{r.owner}</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{maskPhone(r.phone)}</p>
                </div>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {r.county}</p>
                <p className="text-xs text-muted-foreground">{r.category} · {r.value}</p>
                <div className="text-right">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyle(r.status)}`}>{r.status}</span>
                  <p className="mt-1 text-[11px] text-muted-foreground">{r.registeredAt}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
            <Package className="mb-3 h-8 w-8 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">No properties match this filter</h2>
            <p className="mt-1 text-xs text-muted-foreground">Try another county or clear the search.</p>
          </div>
        )}
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Serials, PINs and owner phone numbers remain masked until a match is confirmed on a case file.
      </p>
    </div>
  );
};

export default LeRegistry;

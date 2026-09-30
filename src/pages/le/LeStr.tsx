import { useRef, useState } from "react";
import { Camera, Image as ImageIcon, PackageSearch, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LePage, Card } from "@/components/le/LePage";
import { addAudit } from "@/lib/leData";

const product = {
  name: "Apple MacBook Pro 16-inch (M4 Max, 2025)",
  brand: "Apple", category: "Laptop", color: "Space Black",
  msrp: "$3,499", released: "Nov 2025",
  specs: ["16.2\" Liquid Retina XDR", "36 GB unified memory", "1 TB SSD", "Model A3186"],
  microdots: "Not detected in this photo",
  confidence: 94,
};

const LeStr = () => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "reading" | "done">("idle");
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  const onFile = (f?: File) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      setPhoto(r.result as string); setState("reading");
      setTimeout(() => { setState("done"); addAudit({ action: "STR product lookup", reason: "Product identification", caseNo: "—", data: product.name }); }, 1800);
    };
    r.readAsDataURL(f);
  };

  return (
    <LePage eyebrow="STR product review" title="Product Lookup" subtitle="Take or upload a photo to fetch product details. No owner data is returned here.">
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
        <Card className="p-5 h-fit">
          <div className="flex h-64 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/40">
            {photo ? <img src={photo} alt="Captured product" className="h-full w-full object-contain" /> : <PackageSearch className="h-12 w-12 text-muted-foreground" />}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button onClick={() => camRef.current?.click()}><Camera /> Camera</Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()}><ImageIcon /> Gallery</Button>
          </div>
          {photo && <Button variant="ghost" className="mt-2 w-full" onClick={() => { setPhoto(null); setState("idle"); }}><RefreshCw /> Retake</Button>}
        </Card>
        <Card className="p-5">
          {state === "idle" && <p className="py-20 text-center text-sm text-muted-foreground">Product details will appear here.</p>}
          {state === "reading" && <p className="py-20 text-center text-sm text-primary animate-pulse">Identifying product…</p>}
          {state === "done" && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-heading text-lg font-bold">{product.name}</h2>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{product.confidence}% confidence</span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                {[["Brand", product.brand], ["Category", product.category], ["Colour", product.color], ["MSRP", product.msrp], ["Released", product.released], ["Microdots", product.microdots]].map(([k, v]) => (
                  <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>
                ))}
              </dl>
              <h3 className="mt-5 mb-2 text-xs font-semibold uppercase text-muted-foreground">Specifications</h3>
              <ul className="grid gap-1.5 text-sm sm:grid-cols-2">{product.specs.map((s) => <li key={s} className="rounded-md bg-muted/60 px-3 py-2">{s}</li>)}</ul>
            </div>
          )}
        </Card>
      </div>
    </LePage>
  );
};

export default LeStr;

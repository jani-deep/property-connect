import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Camera, Check, Fingerprint, Shield, Upload, ArrowRight, ShieldCheck } from "lucide-react";
import DemoLayout from "@/components/DemoLayout";
import Asset360Viewer from "@/components/Asset360Viewer";
import { saveRecord, DnaLocation } from "@/lib/propertyRecord";
import emilyAvatar from "@/assets/emily-avatar.png";
import demoCar from "@/assets/demo-car.jpg";
import demoCarSide from "@/assets/demo-car-side.jpg";
import demoCarBack from "@/assets/demo-car-back.jpg";
import demoWatch from "@/assets/demo-watch.jpg";
import demoWatchSide from "@/assets/demo-watch-side.jpg";
import demoWatchBack from "@/assets/demo-watch-back.jpg";
import demoLaptop from "@/assets/demo-laptop.jpg";
import demoLaptopSide from "@/assets/demo-laptop-side.jpg";
import demoLaptopBack from "@/assets/demo-laptop-back.jpg";

const catalog = [
  {
    key: "car",
    images: [demoCar, demoCarSide, demoCarBack],
    item: "BMW 5 Series 530i xDrive",
    category: "Vehicle",
    serial: "WBA53BJ09RWC18294",
    serialLabel: "VIN",
    value: "$62,400",
    pin: "FL-DNA-3301-VK",
    locations: [
      { label: "Driver door frame", x: 24, y: 55, applied: false },
      { label: "Windshield lower corner", x: 52, y: 38, applied: false },
      { label: "Rear bumper inner lip", x: 78, y: 68, applied: false },
      { label: "Engine bay strut tower", x: 40, y: 62, applied: false },
    ],
  },
  {
    key: "watch",
    images: [demoWatch, demoWatchSide, demoWatchBack],
    item: "Rolex Submariner Date 126610LN",
    category: "Jewelry / Watch",
    serial: "M7X9K2R4",
    serialLabel: "Serial #",
    value: "$14,200",
    pin: "FL-DNA-7829-AX",
    locations: [
      { label: "Case back", x: 50, y: 52, applied: false },
      { label: "Clasp underside", x: 30, y: 72, applied: false },
      { label: "Lug inner face", x: 68, y: 34, applied: false },
    ],
  },
  {
    key: "laptop",
    images: [demoLaptop, demoLaptopSide, demoLaptopBack],
    item: 'MacBook Pro 16" M3 Max',
    category: "Electronics",
    serial: "C02XK1ZQMD6T",
    serialLabel: "Serial #",
    value: "$3,499",
    pin: "FL-DNA-6621-LP",
    locations: [
      { label: "Base panel near hinge", x: 50, y: 70, applied: false },
      { label: "Under battery cover", x: 34, y: 48, applied: false },
      { label: "Port side edge", x: 72, y: 58, applied: false },
    ],
  },
];

type Step = "intro" | "upload" | "recognize" | "owner" | "identifiers" | "recommend" | "apply" | "score" | "saved";

const Bubble = ({ children }: { children: React.ReactNode }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 mb-3">
    <div className="w-7 h-7 rounded-full bg-primary/10 overflow-hidden flex-shrink-0 ring-1 ring-primary/20">
      <img src={emilyAvatar} alt="Emily AI" className="w-full h-full object-cover object-top" loading="lazy" />
    </div>
    <div className="glass-card px-3 py-2 text-xs text-foreground leading-relaxed">{children}</div>
  </motion.div>
);

const Emily = ({ onLogout }: { onLogout?: () => void }) => {
  const [step, setStep] = useState<Step>("intro");
  const [assetIdx, setAssetIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [owner, setOwner] = useState({ name: "John Smith", phone: "+1 (555) 000-0000", county: "Brevard County" });
  const [locations, setLocations] = useState<DnaLocation[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const asset = catalog[assetIdx];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [step]);

  const startRecognize = (i: number) => {
    setAssetIdx(i);
    setLocations(catalog[i].locations.map((l) => ({ ...l })));
    setStep("recognize");
    setProgress(0);
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(t); return 100; }
        return p + 4;
      });
    }, 40);
  };

  const toggleApplied = (i: number) =>
    setLocations((ls) => ls.map((l, idx) => (idx === i ? { ...l, applied: !l.applied } : l)));

  const appliedCount = locations.filter((l) => l.applied).length;
  const score = Math.min(
    100,
    40 + Math.round((appliedCount / Math.max(1, locations.length)) * 45) + (asset.serial ? 15 : 0)
  );

  const handleSave = () => {
    saveRecord({
      pin: asset.pin,
      item: asset.item,
      category: asset.category,
      owner: owner.name,
      phone: owner.phone,
      county: owner.county,
      serial: asset.serial,
      serialLabel: asset.serialLabel,
      value: asset.value,
      img: asset.images[0],
      dnaLocations: locations,
      score,
      registeredAt: new Date().toLocaleString(),
    });
    setStep("saved");
  };

  return (
    <DemoLayout title="Emily – AI Guide" subtitle="Guided registration & DNA placement" icon={<img src={emilyAvatar} alt="Emily AI" className="w-full h-full object-cover object-top rounded-full" />} onLogout={onLogout}>
      <div className="px-4 py-4">
        <AnimatePresence mode="wait">
          {step === "intro" && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="glass-card p-5 text-center mb-4">
                <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-gradient-to-b from-primary/20 to-accent/10 overflow-hidden ring-2 ring-primary/20 shadow-lg">
                  <img src={emilyAvatar} alt="Emily — your AI guide" className="w-full h-full object-cover object-top" loading="lazy" width={768} height={768} />
                </div>
                <h2 className="text-lg font-bold text-foreground mb-1">Hi, I'm Emily</h2>
                <p className="text-xs text-muted-foreground">
                  I'll walk you through registering your item, adding its identifiers, and placing your DNA microdot adhesive in the right spots.
                </p>
              </div>
              <div className="space-y-2 mb-4">
                {["Recognize & register the item", "Confirm ownership details", "Capture serial / VIN identifiers", "Recommend DNA placement spots", "Record where DNA was applied", "Show your Protection Score"].map((s, i) => (
                  <div key={s} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    {s}
                  </div>
                ))}
              </div>
              <button onClick={() => setStep("upload")} className="w-full px-4 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2">
                Start with Emily <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {step === "upload" && (
            <motion.div key="upload" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Bubble>Let's start with a photo. Pick the item you'd like to protect.</Bubble>
              <div className="glass-card p-5 text-center mb-3 border-2 border-dashed border-primary/30">
                <Upload className="w-7 h-7 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Upload a photo or choose a sample item below</p>
              </div>
              <div className="space-y-2">
                {catalog.map((c, i) => (
                  <button key={c.key} onClick={() => startRecognize(i)} className="w-full glass-card p-3 flex items-center gap-3 text-left active:scale-[0.98] transition-transform">
                    <div className="w-11 h-11 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img src={c.images[0]} alt={c.item} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate">{c.item}</div>
                      <div className="text-[10px] text-muted-foreground">{c.category}</div>
                    </div>
                    <Camera className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === "recognize" && (
            <motion.div key="recognize" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Bubble>I'm looking at your photo now…</Bubble>
              <div className="glass-card p-4 mb-3">
                <Asset360Viewer images={asset.images} alt={asset.item} />
              </div>
              <div className="glass-card p-4">
                <div className="space-y-2 text-xs mb-4">
                  {[
                    { label: "Object detection", t: 20 },
                    { label: "Brand & model classification", t: 45 },
                    { label: "Identifier / OCR scan", t: 70 },
                    { label: "Category & value estimate", t: 95 },
                  ].map((task) => (
                    <div key={task.label} className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${progress >= task.t ? "bg-success text-success-foreground" : "bg-muted"}`}>
                        {progress >= task.t && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <span className={progress >= task.t ? "text-foreground" : "text-muted-foreground"}>{task.label}</span>
                    </div>
                  ))}
                </div>
                <div className="match-bar mb-4">
                  <div className="match-bar-fill bg-primary" style={{ width: `${progress}%` }} />
                </div>
                {progress >= 100 && (
                  <>
                    <Bubble>
                      I recognized this as a <span className="font-semibold">{asset.item}</span> ({asset.category}), estimated value {asset.value}. Is that right?
                    </Bubble>
                    <button onClick={() => setStep("owner")} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-xs">
                      Yes, that's my item
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {step === "owner" && (
            <motion.div key="owner" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Bubble>Great. Let's confirm who owns it — this is what law enforcement will see if it's recovered.</Bubble>
              <div className="glass-card p-4 space-y-3">
                {([["Full name", "name"], ["Mobile", "phone"], ["County", "county"]] as const).map(([label, key]) => (
                  <div key={key}>
                    <label className="text-[10px] text-muted-foreground mb-1 block">{label}</label>
                    <input
                      value={owner[key]}
                      onChange={(e) => setOwner({ ...owner, [key]: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                ))}
                <button onClick={() => setStep("identifiers")} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-xs">
                  Confirm ownership
                </button>
              </div>
            </motion.div>
          )}

          {step === "identifiers" && (
            <motion.div key="identifiers" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Bubble>
                Adding the {asset.serialLabel.toLowerCase()} makes recovery far more likely. I read this one from your photo — please confirm it.
              </Bubble>
              <div className="glass-card p-4 space-y-3">
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">{asset.serialLabel}</label>
                  <div className="px-3 py-2.5 rounded-lg bg-muted border border-border font-mono text-xs text-foreground">{asset.serial}</div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-success">
                  <Check className="w-3 h-3" /> Detected by OCR with high confidence
                </div>
                <button onClick={() => setStep("recommend")} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-xs">
                  Confirm identifiers
                </button>
              </div>
            </motion.div>
          )}

          {step === "recommend" && (
            <motion.div key="recommend" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Bubble>
                Here's where I recommend applying your DNA adhesive. These spots are hard to remove and easy for an officer's microdot reader to find.
              </Bubble>
              <div className="glass-card p-4 mb-3">
                <div className="relative rounded-xl overflow-hidden border-2 border-border">
                  <img src={asset.images[0]} alt={asset.item} className="w-full" />
                  {locations.map((l, i) => (
                    <div key={i} className="dna-marker" style={{ left: `${l.x}%`, top: `${l.y}%`, transform: "translate(-50%, -50%)" }} />
                  ))}
                </div>
              </div>
              <div className="space-y-2 mb-3">
                {locations.map((l, i) => (
                  <div key={l.label} className="glass-card p-3 flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="text-xs text-foreground flex-1">{l.label}</span>
                    <Fingerprint className="w-3.5 h-3.5 text-primary" />
                  </div>
                ))}
              </div>
              <button onClick={() => setStep("apply")} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-xs">
                I'm ready to apply the DNA
              </button>
            </motion.div>
          )}

          {step === "apply" && (
            <motion.div key="apply" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Bubble>Tick each spot as you apply the adhesive — I'll record exactly where the DNA went.</Bubble>
              <div className="glass-card p-4 mb-3">
                <div className="relative rounded-xl overflow-hidden border-2 border-border">
                  <img src={asset.images[0]} alt={asset.item} className="w-full" />
                  {locations.map((l, i) => (
                    <div
                      key={i}
                      className={`dna-marker ${l.applied ? "active" : ""}`}
                      style={{ left: `${l.x}%`, top: `${l.y}%`, transform: "translate(-50%, -50%)", opacity: l.applied ? 1 : 0.45 }}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2 mb-3">
                {locations.map((l, i) => (
                  <button key={l.label} onClick={() => toggleApplied(i)} className="w-full glass-card p-3 flex items-center gap-2.5 text-left active:scale-[0.98] transition-transform">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center ${l.applied ? "bg-success text-success-foreground" : "bg-muted border border-border"}`}>
                      {l.applied && <Check className="w-3 h-3" />}
                    </div>
                    <span className="text-xs text-foreground flex-1">{l.label}</span>
                    <span className="text-[10px] text-muted-foreground">{l.applied ? "Applied" : "Tap when applied"}</span>
                  </button>
                ))}
              </div>
              <button
                disabled={appliedCount === 0}
                onClick={() => setStep("score")}
                className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-xs disabled:opacity-50"
              >
                Record {appliedCount} DNA placement{appliedCount === 1 ? "" : "s"}
              </button>
            </motion.div>
          )}

          {step === "score" && (
            <motion.div key="score" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Bubble>Nice work. Here's how protected this item is right now.</Bubble>
              <div className="glass-card p-5 text-center mb-3">
                <div className="text-4xl font-extrabold gradient-text mb-1">{score}</div>
                <div className="text-[10px] text-muted-foreground mb-4">Property Protection Score</div>
                <div className="match-bar mb-4">
                  <div className="match-bar-fill bg-success" style={{ width: `${score}%` }} />
                </div>
                <div className="space-y-2 text-left text-xs">
                  {[
                    ["Photos & 360° views", true],
                    [`${asset.serialLabel} recorded`, true],
                    ["Ownership verified", true],
                    [`${appliedCount} of ${locations.length} DNA spots applied`, appliedCount === locations.length],
                  ].map(([label, ok]) => (
                    <div key={label as string} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${ok ? "bg-success text-success-foreground" : "bg-warning/20 text-warning"}`}>
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span className="text-foreground">{label as string}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={handleSave} className="w-full px-4 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" /> Save property record
              </button>
            </motion.div>
          )}

          {step === "saved" && (
            <motion.div key="saved" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="glass-card p-5 text-center mb-3">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-success/10 flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7 text-success" />
                </div>
                <h2 className="text-base font-bold text-foreground mb-1">Property Protected</h2>
                <p className="text-xs text-muted-foreground mb-4">{asset.item} is registered and linked to your DNA microdot PIN.</p>
                <div className="px-3 py-2.5 rounded-lg bg-primary/10 border border-primary/20 font-mono text-sm text-primary font-bold">{asset.pin}</div>
              </div>
              <Bubble>
                If this item is recovered, an officer can read this PIN with a microdot reader and instantly see your record in the Law Enforcement search.
              </Bubble>
              <div className="space-y-2">
                <a href="/law-enforcement" className="block w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-xs text-center">
                  See the officer's view →
                </a>
                <button onClick={() => setStep("upload")} className="w-full px-4 py-3 rounded-lg bg-muted text-muted-foreground font-semibold text-xs">
                  Protect another item
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </DemoLayout>
  );
};

export default Emily;

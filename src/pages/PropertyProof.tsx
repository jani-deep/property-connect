import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, Camera, Check, Sparkles, Plus, Package, ChevronLeft } from "lucide-react";
import DemoLayout from "@/components/DemoLayout";
import Asset360Viewer from "@/components/Asset360Viewer";
import demoWatch from "@/assets/demo-watch.jpg";
import demoWatchSide from "@/assets/demo-watch-side.jpg";
import demoWatchBack from "@/assets/demo-watch-back.jpg";
import demoLaptop from "@/assets/demo-laptop.jpg";
import demoLaptopSide from "@/assets/demo-laptop-side.jpg";
import demoLaptopBack from "@/assets/demo-laptop-back.jpg";
import demoCamera from "@/assets/demo-camera.jpg";
import demoCameraSide from "@/assets/demo-camera-side.jpg";
import demoCameraBack from "@/assets/demo-camera-back.jpg";
import demoCar from "@/assets/demo-car.jpg";
import demoCarSide from "@/assets/demo-car-side.jpg";
import demoCarBack from "@/assets/demo-car-back.jpg";
import demoPhone from "@/assets/demo-phone.jpg";
import demoPhoneSide from "@/assets/demo-phone-side.jpg";
import demoPhoneBack from "@/assets/demo-phone-back.jpg";
import demoKeys from "@/assets/demo-keys.jpg";

type View = "listing" | "capture" | "captured" | "analyzing" | "results" | "dna-select" | "dna-place";

const allAssets = [
  {
    img: demoCar,
    images: [demoCar, demoCarSide, demoCarBack],
    brand: "BMW",
    model: "5 Series 530i xDrive",
    category: "Vehicle – Sedan",
    serial: "WBA53BJ09RWC18294",
    value: "$56,200",
    registered: true,
    dnaPlaced: true,
  },
  {
    img: demoWatch,
    images: [demoWatch, demoWatchSide, demoWatchBack],
    brand: "Rolex",
    model: "Submariner Date 126610LN",
    category: "Luxury Watch",
    serial: "M7X9K2R4",
    value: "$14,500",
    registered: true,
    dnaPlaced: true,
  },
  {
    img: demoLaptop,
    images: [demoLaptop, demoLaptopSide, demoLaptopBack],
    brand: "Apple",
    model: 'MacBook Pro 16" M3 Max',
    category: "Electronics – Laptop",
    serial: "C02ZN1LPMD6T",
    value: "$3,499",
    registered: true,
    dnaPlaced: false,
  },
  {
    img: demoCamera,
    images: [demoCamera, demoCameraSide, demoCameraBack],
    brand: "Canon",
    model: "EOS R5 Mark II",
    category: "Electronics – Camera",
    serial: "032024005891",
    value: "$4,299",
    registered: false,
    dnaPlaced: false,
  },
  {
    img: demoPhone,
    images: [demoPhone, demoPhoneSide, demoPhoneBack],
    brand: "Apple",
    model: "iPhone 15 Pro Max",
    category: "Electronics – Mobile",
    serial: "F2LXK4MNHG73",
    value: "$1,199",
    registered: false,
    dnaPlaced: false,
  },
  {
    img: demoKeys,
    images: [demoKeys],
    brand: "Honda",
    model: "Civic Key Fob + Keys",
    category: "Vehicle Accessory – Keys",
    serial: "KEY-HC-29401",
    value: "$350",
    registered: false,
    dnaPlaced: false,
  },
];

const PropertyProof = ({ onLogout }: { onLogout?: () => void }) => {
  const [view, setView] = useState<View>("listing");
  const [selectedItem, setSelectedItem] = useState(0);
  const [dnaPin] = useState("FL-DNA-7829-AX");
  const [markerPos, setMarkerPos] = useState<{ x: number; y: number } | null>(null);
  const [markerActive, setMarkerActive] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);

  const item = allAssets[selectedItem];

  const handleCapture = (idx: number) => {
    setSelectedItem(idx);
    setView("captured");
  };

  const startAnalysis = () => {
    setView("analyzing");
    setAnalyzeProgress(0);
    const interval = setInterval(() => {
      setAnalyzeProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setView("results"), 300);
          return 100;
        }
        return p + 4;
      });
    }, 50);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMarkerPos({ x, y });
  };

  return (
    <DemoLayout
      title="PropertyProof™"
      subtitle="AI Inventory + DNA Placement"
      icon={<Fingerprint className="w-5 h-5 text-primary" />}
      onLogout={onLogout}
    >
      <div className="px-4 py-4">
        <AnimatePresence mode="wait">
          {/* LISTING VIEW */}
          {view === "listing" && (
            <motion.div key="listing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">My Assets</h2>
                  <p className="text-xs text-muted-foreground">{allAssets.length} items registered</p>
                </div>
                <button
                  onClick={() => setView("capture")}
                  className="px-3 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Asset
                </button>
              </div>
              <div className="space-y-2">
                {allAssets.map((asset, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-3 flex items-center gap-3 active:scale-[0.98] transition-transform cursor-pointer"
                    onClick={() => { setSelectedItem(i); setView("dna-select"); }}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                      <img src={asset.img} alt={asset.model} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate">{asset.brand} {asset.model}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{asset.category}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {asset.dnaPlaced ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-medium">
                          <Fingerprint className="w-2.5 h-2.5" /> DNA
                        </span>
                      ) : asset.registered ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/10 text-warning text-[10px] font-medium">
                          <Package className="w-2.5 h-2.5" /> Reg
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px]">
                          Pending
                        </span>
                      )}
                      <span className="text-xs font-semibold text-foreground">{asset.value}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* CAPTURE / ADD NEW */}
          {view === "capture" && (
            <motion.div key="capture" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <button onClick={() => setView("listing")} className="text-xs text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1">
                <ChevronLeft className="w-3.5 h-3.5" /> Back to Assets
              </button>
              <h2 className="text-lg font-bold text-foreground mb-1 text-center">Add New Asset</h2>
              <p className="text-xs text-muted-foreground text-center mb-6">Select an item to see AI analysis</p>
              <div className="grid grid-cols-2 gap-3">
                {allAssets.map((it, i) => (
                  <button
                    key={i}
                    onClick={() => handleCapture(i)}
                    className="glass-card p-3 active:scale-[0.98] transition-transform text-left"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-muted border border-border">
                      <img src={it.img} alt={it.model} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-[11px] font-medium text-foreground truncate">{it.brand} {it.model}</div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                      <Camera className="w-2.5 h-2.5 text-primary" />
                      Tap to scan
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* CAPTURED PREVIEW */}
          {view === "captured" && (
            <motion.div key="captured" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <button onClick={() => setView("capture")} className="text-xs text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1">
                <ChevronLeft className="w-3.5 h-3.5" /> Retake Photo
              </button>
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 text-primary mb-3">
                  <Camera className="w-4 h-4" />
                  <span className="text-xs font-semibold">Image Captured</span>
                </div>
                <div className="rounded-xl overflow-hidden border-2 border-border bg-muted mb-4">
                  <img src={item.img} alt={item.model} className="w-full" />
                </div>
                <div className="flex items-center gap-3 mb-4 px-1">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                    <img src={item.img} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-foreground truncate">{item.brand} {item.model}</div>
                    <div className="text-[10px] text-muted-foreground">{item.category}</div>
                  </div>
                  <Check className="w-4 h-4 text-success flex-shrink-0" />
                </div>
                <button
                  onClick={() => startAnalysis()}
                  className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Analyze with AI
                </button>
              </div>
            </motion.div>
          )}

          {/* ANALYZING */}
          {view === "analyzing" && (
            <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <div className="glass-card p-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-primary animate-pulse" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-4">AI Analyzing Image...</h3>
                <div className="space-y-2.5 text-left text-sm mb-5">
                  {[
                    { label: "Object Detection", threshold: 20 },
                    { label: "Brand Recognition", threshold: 40 },
                    { label: "Model Identification", threshold: 60 },
                    { label: "Serial Number OCR", threshold: 80 },
                  ].map((task) => (
                    <div key={task.label} className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${analyzeProgress >= task.threshold ? "bg-success text-success-foreground" : "bg-muted"}`}>
                        {analyzeProgress >= task.threshold && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <span className={`text-xs ${analyzeProgress >= task.threshold ? "text-foreground" : "text-muted-foreground"}`}>{task.label}</span>
                    </div>
                  ))}
                </div>
                <div className="match-bar">
                  <div className="match-bar-fill bg-primary" style={{ width: `${analyzeProgress}%` }} />
                </div>
              </div>
            </motion.div>
          )}

          {/* RESULTS */}
          {view === "results" && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 text-success mb-4">
                  <Check className="w-4 h-4" />
                  <span className="text-xs font-semibold">AI Analysis Complete</span>
                </div>
                <div className="flex gap-4 mb-5">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                    <img src={item.img} alt={item.model} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {[
                      ["Brand", item.brand],
                      ["Model", item.model],
                      ["Category", item.category],
                      ["Serial #", item.serial],
                      ["Est. Value", item.value],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <span className="text-muted-foreground">{label}:</span>{" "}
                        <span className="text-foreground font-medium font-mono">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setView("dna-select")} className="flex-1 px-3 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors">
                    Confirm & Add DNA PIN
                  </button>
                  <button onClick={() => setView("capture")} className="px-3 py-2.5 rounded-lg bg-muted text-muted-foreground text-xs">
                    Retake
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* DNA PIN */}
          {view === "dna-select" && (
            <motion.div key="dna-select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <button onClick={() => setView("listing")} className="text-xs text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1">
                <ChevronLeft className="w-3.5 h-3.5" /> Back to Assets
              </button>
              <div className="glass-card p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-accent/10 flex items-center justify-center">
                  <Fingerprint className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">Your DNA PIN</h3>
                <p className="text-xs text-muted-foreground mb-5">This unique code links your physical DNA adhesive to your digital inventory.</p>
                <div className="px-4 py-3 rounded-lg bg-muted font-mono text-lg font-bold text-accent mb-5 tracking-wider">
                  {dnaPin}
                </div>
                <button onClick={() => { setMarkerPos(null); setView("dna-place"); }} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors">
                  Place DNA Marker on Item
                </button>
              </div>
            </motion.div>
          )}

          {/* DNA PLACEMENT */}
          {view === "dna-place" && (
            <motion.div key="dna-place" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <button onClick={() => setView("dna-select")} className="text-xs text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1">
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
              <h3 className="text-sm font-semibold text-foreground mb-1 text-center">Tap Where You Applied the DNA Adhesive</h3>
              <p className="text-[10px] text-muted-foreground text-center mb-3">Drag to rotate • Tap to mark DNA placement</p>

              <Asset360Viewer
                images={item.images}
                alt={item.model}
                onClick={handleImageClick}
                overlay={
                  markerPos ? (
                    <div
                      className={`dna-marker ${markerActive ? "active" : ""}`}
                      style={{ left: `${markerPos.x}%`, top: `${markerPos.y}%`, transform: "translate(-50%, -50%)" }}
                      onMouseDown={() => setMarkerActive(true)}
                      onMouseUp={() => setMarkerActive(false)}
                      onMouseLeave={() => setMarkerActive(false)}
                      onTouchStart={() => setMarkerActive(true)}
                      onTouchEnd={() => setMarkerActive(false)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {markerActive && dnaPin}
                    </div>
                  ) : undefined
                }
              />
              {markerPos && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-center">
                  <p className="text-[10px] text-muted-foreground mb-3">
                    Tap & hold marker to verify PIN • Tap image to reposition
                  </p>
                  <button
                    onClick={() => { setView("listing"); setMarkerPos(null); }}
                    className="w-full px-4 py-3 rounded-lg bg-success text-success-foreground font-semibold text-xs hover:bg-success/90 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5 inline mr-1.5" />
                    Registration Complete
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DemoLayout>
  );
};

export default PropertyProof;

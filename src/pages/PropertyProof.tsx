import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, Camera, Check, Sparkles, X } from "lucide-react";
import DemoLayout from "@/components/DemoLayout";
import demoWatch from "@/assets/demo-watch.jpg";
import demoLaptop from "@/assets/demo-laptop.jpg";
import demoCamera from "@/assets/demo-camera.jpg";

type Step = "capture" | "analyzing" | "results" | "dna-select" | "dna-place";

const items = [
  {
    img: demoWatch,
    brand: "Rolex",
    model: "Submariner Date 126610LN",
    category: "Luxury Watch",
    serial: "M7X9K2R4",
    value: "$14,500",
  },
  {
    img: demoLaptop,
    brand: "Apple",
    model: 'MacBook Pro 16" M3 Max',
    category: "Electronics – Laptop",
    serial: "C02ZN1LPMD6T",
    value: "$3,499",
  },
  {
    img: demoCamera,
    brand: "Canon",
    model: "EOS R5 Mark II",
    category: "Electronics – Camera",
    serial: "032024005891",
    value: "$4,299",
  },
];

const PropertyProof = () => {
  const [step, setStep] = useState<Step>("capture");
  const [selectedItem, setSelectedItem] = useState(0);
  const [dnaPin] = useState("FL-DNA-7829-AX");
  const [markerPos, setMarkerPos] = useState<{ x: number; y: number } | null>(null);
  const [markerActive, setMarkerActive] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);

  const item = items[selectedItem];

  const startAnalysis = (idx: number) => {
    setSelectedItem(idx);
    setStep("analyzing");
    setAnalyzeProgress(0);
    const interval = setInterval(() => {
      setAnalyzeProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setStep("results"), 300);
          return 100;
        }
        return p + 4;
      });
    }, 50);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (step !== "dna-place") return;
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
    >
      <div className="container mx-auto px-6 py-10 max-w-4xl">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {["Capture", "AI Analysis", "Confirm", "DNA PIN", "Place Marker"].map((label, i) => {
            const steps: Step[] = ["capture", "analyzing", "results", "dna-select", "dna-place"];
            const isActive = steps.indexOf(step) >= i;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {i + 1}
                </div>
                <span className={`text-xs hidden sm:inline ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
                {i < 4 && <div className={`w-6 h-px ${isActive ? "bg-primary" : "bg-border"}`} />}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Capture */}
          {step === "capture" && (
            <motion.div key="capture" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Photograph Your Item</h2>
              <p className="text-muted-foreground text-center mb-8">Select an item to see AI analysis in action</p>
              <div className="grid grid-cols-3 gap-4">
                {items.map((it, i) => (
                  <button
                    key={i}
                    onClick={() => startAnalysis(i)}
                    className="glass-card p-4 hover:border-primary/40 transition-all group text-left"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-muted">
                      <img src={it.img} alt={it.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Camera className="w-4 h-4 text-primary" />
                      Tap to scan
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Analyzing */}
          {step === "analyzing" && (
            <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <div className="glass-card p-8 max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-4">AI Analyzing Image...</h3>
                <div className="space-y-3 text-left text-sm mb-6">
                  {[
                    { label: "Object Detection", threshold: 20 },
                    { label: "Brand Recognition", threshold: 40 },
                    { label: "Model Identification", threshold: 60 },
                    { label: "Serial Number OCR", threshold: 80 },
                  ].map((task) => (
                    <div key={task.label} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${analyzeProgress >= task.threshold ? "bg-success text-success-foreground" : "bg-muted"}`}>
                        {analyzeProgress >= task.threshold && <Check className="w-3 h-3" />}
                      </div>
                      <span className={analyzeProgress >= task.threshold ? "text-foreground" : "text-muted-foreground"}>{task.label}</span>
                    </div>
                  ))}
                </div>
                <div className="match-bar">
                  <div className="match-bar-fill bg-primary" style={{ width: `${analyzeProgress}%` }} />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Results */}
          {step === "results" && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="glass-card p-8 max-w-lg mx-auto">
                <div className="flex items-center gap-2 text-success mb-4">
                  <Check className="w-5 h-5" />
                  <span className="text-sm font-semibold">AI Analysis Complete</span>
                </div>
                <div className="flex gap-6 mb-6">
                  <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img src={item.img} alt={item.model} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-2 text-sm">
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
                <div className="flex gap-3">
                  <button onClick={() => setStep("dna-select")} className="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
                    Confirm & Add DNA PIN
                  </button>
                  <button onClick={() => setStep("capture")} className="px-4 py-3 rounded-lg bg-muted text-muted-foreground text-sm hover:bg-muted/80 transition-colors">
                    Retake
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: DNA PIN */}
          {step === "dna-select" && (
            <motion.div key="dna-select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="glass-card p-8 max-w-md mx-auto text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                  <Fingerprint className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Your DNA PIN</h3>
                <p className="text-sm text-muted-foreground mb-6">This unique code links your physical DNA adhesive to your digital inventory.</p>
                <div className="px-6 py-4 rounded-lg bg-muted font-mono text-xl font-bold text-accent mb-6 tracking-wider">
                  {dnaPin}
                </div>
                <button onClick={() => setStep("dna-place")} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
                  Place DNA Marker on Item
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: DNA Placement */}
          {step === "dna-place" && (
            <motion.div key="dna-place" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <h3 className="text-lg font-semibold text-foreground mb-2 text-center">Tap Where You Applied the DNA Adhesive</h3>
              <p className="text-sm text-muted-foreground text-center mb-6">Tap on the image to mark the exact placement location</p>
              <div
                className="relative max-w-lg mx-auto rounded-xl overflow-hidden cursor-crosshair border-2 border-border"
                onClick={handleImageClick}
              >
                <img src={item.img} alt={item.model} className="w-full" />
                {markerPos && (
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
                )}
              </div>
              {markerPos && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center">
                  <p className="text-xs text-muted-foreground mb-4">
                    Tap & hold the marker to verify PIN • Tap image to reposition
                  </p>
                  <button
                    onClick={() => {
                      setStep("capture");
                      setMarkerPos(null);
                    }}
                    className="px-6 py-3 rounded-lg bg-success text-success-foreground font-semibold text-sm hover:bg-success/90 transition-colors"
                  >
                    <Check className="w-4 h-4 inline mr-2" />
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

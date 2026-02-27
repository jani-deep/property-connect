import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Camera, User, MapPin, AlertTriangle, Shield, Check, Fingerprint, Clock } from "lucide-react";
import DemoLayout from "@/components/DemoLayout";
import demoWatch from "@/assets/demo-watch.jpg";
import demoLaptop from "@/assets/demo-laptop.jpg";
import demoCamera from "@/assets/demo-camera.jpg";
import demoCar from "@/assets/demo-car.jpg";

type Step = "home" | "captured" | "searching" | "results" | "detail";

const searchHistory = [
  { img: demoCar, label: "BMW 5 Series – Sedan", date: "Today, 2:15 PM" },
  { img: demoWatch, label: "Rolex Submariner – Watch", date: "Today, 11:30 AM" },
  { img: demoLaptop, label: 'MacBook Pro 16" – Laptop', date: "Yesterday" },
  { img: demoCamera, label: "Canon EOS R5 – Camera", date: "2 days ago" },
];

const defaultMatches = [
  { confidence: 97, owner: "John Smith", county: "Brevard County", status: "Reported Stolen", stolen: true, serial: "M7X9K2R4", item: "Rolex Submariner Date 126610LN", img: demoWatch, dnaPin: "FL-DNA-7829-AX", markerPos: { x: 72, y: 45 } },
  { confidence: 74, owner: "Maria Garcia", county: "Orange County", status: "Not Reported", stolen: false, serial: "M7X9K2R7", item: "Rolex Submariner (Similar Model)", img: demoWatch, dnaPin: "FL-DNA-4412-BK", markerPos: { x: 30, y: 60 } },
  { confidence: 18, owner: "Robert Chen", county: "Miami-Dade County", status: "Not Reported", stolen: false, serial: "RLX-UNKNOWN", item: "Luxury Watch – Model Only Match", img: demoWatch, dnaPin: "FL-DNA-9901-CZ", markerPos: { x: 55, y: 35 } },
];

const carMatches = [
  { confidence: 95, owner: "David Williams", county: "Brevard County", status: "Reported Stolen", stolen: true, serial: "WBA53BJ09RWC18294", item: "BMW 5 Series 530i xDrive", img: demoCar, dnaPin: "FL-DNA-3301-VK", markerPos: { x: 20, y: 70 } },
  { confidence: 61, owner: "Linda Nguyen", county: "Palm Beach County", status: "Not Reported", stolen: false, serial: "WBA53BJ09RWC19887", item: "BMW 5 Series (Similar VIN)", img: demoCar, dnaPin: "FL-DNA-5520-MR", markerPos: { x: 80, y: 50 } },
];

const LawEnforcement = ({ onLogout }: { onLogout?: () => void }) => {
  const [step, setStep] = useState<Step>("home");
  const [selectedMatch, setSelectedMatch] = useState(0);
  const [markerActive, setMarkerActive] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [matches, setMatches] = useState(defaultMatches);
  const [searchImage, setSearchImage] = useState(demoWatch);
  const [searchLabel, setSearchLabel] = useState("Rolex Submariner – Watch");
  const [useCarMatchesFlag, setUseCarMatchesFlag] = useState(false);

  const handleCapture = (img: string, label: string, isCarMatch: boolean) => {
    setSearchImage(img);
    setSearchLabel(label);
    setUseCarMatchesFlag(isCarMatch);
    setStep("captured");
  };

  const startSearch = () => {
    setStep("searching");
    setSearchProgress(0);
    setMatches(useCarMatchesFlag ? carMatches : defaultMatches);
    const interval = setInterval(() => {
      setSearchProgress((p) => {
        if (p >= 100) { clearInterval(interval); setTimeout(() => setStep("results"), 400); return 100; }
        return p + 3;
      });
    }, 40);
  };

  const getConfidenceColor = (c: number) => c >= 90 ? "text-success" : c >= 50 ? "text-warning" : "text-muted-foreground";
  const getConfidenceBarColor = (c: number) => c >= 90 ? "bg-success" : c >= 50 ? "bg-warning" : "bg-muted-foreground";

  const match = matches[selectedMatch];

  return (
    <DemoLayout title="Law Enforcement" subtitle="AI Image Search + Intelligence" icon={<Search className="w-5 h-5 text-primary" />} onLogout={onLogout}>
      <div className="px-4 py-4">
        <AnimatePresence mode="wait">
          {/* HOME */}
          {step === "home" && (
            <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="glass-card p-6 text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-foreground mb-1">Scan Recovered Item</h2>
                <p className="text-xs text-muted-foreground mb-5">Photograph recovered property to search the registered owner database</p>
                <button onClick={() => handleCapture(demoWatch, "Rolex Submariner – Watch", false)} className="w-full px-4 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  <Camera className="w-4 h-4" />
                  Capture & Search
                </button>
              </div>

              <h3 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                Recent Searches
              </h3>
              <div className="space-y-2">
                {searchHistory.map((h, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.06 }}
                    onClick={() => handleCapture(h.img, h.label, i === 0)}
                    className="w-full glass-card p-3 flex items-center gap-3 active:scale-[0.98] transition-transform text-left"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img src={h.img} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">{h.label}</div>
                      <div className="text-[10px] text-muted-foreground">{h.date}</div>
                    </div>
                    <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* CAPTURED PREVIEW */}
          {step === "captured" && (
            <motion.div key="captured" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <button onClick={() => setStep("home")} className="text-xs text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1">
                ← Retake Photo
              </button>
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 text-primary mb-3">
                  <Camera className="w-4 h-4" />
                  <span className="text-xs font-semibold">Image Captured</span>
                </div>
                <div className="rounded-xl overflow-hidden border-2 border-border bg-muted mb-4">
                  <img src={searchImage} alt={searchLabel} className="w-full" />
                </div>
                <div className="flex items-center gap-3 mb-4 px-1">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                    <img src={searchImage} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-foreground truncate">{searchLabel}</div>
                    <div className="text-[10px] text-muted-foreground">Ready for database search</div>
                  </div>
                  <Check className="w-4 h-4 text-success flex-shrink-0" />
                </div>
                <button
                  onClick={() => startSearch()}
                  className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Search Database
                </button>
              </div>
            </motion.div>
          )}

          {/* SEARCHING */}
          {step === "searching" && (
            <motion.div key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <div className="glass-card p-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Search className="w-7 h-7 text-primary animate-pulse" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">Searching Database...</h3>
                <p className="text-xs text-muted-foreground mb-5">AI analyzing image against registered inventory</p>
                <div className="space-y-2 text-left text-xs mb-5">
                  {[
                    { label: "Image Feature Extraction", t: 15 },
                    { label: "Brand/Model Classification", t: 35 },
                    { label: "Serial Number Cross-Reference", t: 55 },
                    { label: "Owner Database Search", t: 75 },
                    { label: "Probability Scoring", t: 90 },
                  ].map((task) => (
                    <div key={task.label} className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${searchProgress >= task.t ? "bg-success text-success-foreground" : "bg-muted"}`}>
                        {searchProgress >= task.t && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <span className={searchProgress >= task.t ? "text-foreground" : "text-muted-foreground"}>{task.label}</span>
                    </div>
                  ))}
                </div>
                <div className="match-bar">
                  <div className="match-bar-fill bg-primary" style={{ width: `${searchProgress}%` }} />
                </div>
              </div>
            </motion.div>
          )}

          {/* RESULTS */}
          {step === "results" && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-foreground">Search Results</h2>
                  <p className="text-[10px] text-muted-foreground">{matches.length} potential matches</p>
                </div>
                <button onClick={() => setStep("home")} className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs">
                  New Search
                </button>
              </div>
              <div className="space-y-2">
                {matches.map((m, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.12 }}
                    onClick={() => { setSelectedMatch(i); setStep("detail"); }}
                    className="w-full glass-card p-4 text-left active:scale-[0.98] transition-transform"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img src={m.img} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-lg font-bold font-mono ${getConfidenceColor(m.confidence)}`}>{m.confidence}%</span>
                          <span className="text-[10px] text-foreground font-medium">{m.confidence >= 90 ? "Strong Match" : m.confidence >= 50 ? "Possible" : "Low"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-0.5"><User className="w-2.5 h-2.5" />{m.owner}</span>
                          <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{m.county}</span>
                        </div>
                      </div>
                      {m.stolen && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-semibold flex-shrink-0">
                          <AlertTriangle className="w-2.5 h-2.5" /> Stolen
                        </span>
                      )}
                    </div>
                    <div className="mt-2 match-bar">
                      <div className={`match-bar-fill ${getConfidenceBarColor(m.confidence)}`} style={{ width: `${m.confidence}%` }} />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* DETAIL */}
          {step === "detail" && (
            <motion.div key="detail" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <button onClick={() => setStep("results")} className="text-xs text-muted-foreground hover:text-foreground mb-4 inline-block">
                ← Back to Results
              </button>

              {/* Image with DNA marker */}
              <div className="glass-card p-3 mb-3">
                <div className="relative rounded-lg overflow-hidden">
                  <img src={match.img} alt="" className="w-full" />
                  <div
                    className={`dna-marker ${markerActive ? "active" : ""}`}
                    style={{ left: `${match.markerPos.x}%`, top: `${match.markerPos.y}%`, transform: "translate(-50%, -50%)" }}
                    onMouseDown={() => setMarkerActive(true)}
                    onMouseUp={() => setMarkerActive(false)}
                    onMouseLeave={() => setMarkerActive(false)}
                    onTouchStart={() => setMarkerActive(true)}
                    onTouchEnd={() => setMarkerActive(false)}
                  >
                    {markerActive && match.dnaPin}
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                  <Fingerprint className="w-3 h-3 inline mr-1" />
                  Tap & hold marker to reveal DNA PIN
                </p>
              </div>

              {/* Confidence */}
              <div className="glass-card p-4 mb-3">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-2xl font-bold font-mono ${getConfidenceColor(match.confidence)}`}>{match.confidence}%</span>
                  <span className="text-xs text-muted-foreground">confidence</span>
                </div>
                <div className="match-bar mb-3">
                  <div className={`match-bar-fill ${getConfidenceBarColor(match.confidence)}`} style={{ width: `${match.confidence}%` }} />
                </div>
                {match.stolen && (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    This item has been reported stolen
                  </div>
                )}
              </div>

              {/* Owner Info */}
              <div className="glass-card p-4 space-y-2.5">
                <h3 className="text-xs font-semibold text-foreground mb-2">Owner Information</h3>
                {[
                  ["Name", match.owner],
                  ["County", match.county],
                  ["Status", match.status],
                  ["Item", match.item],
                  ["Serial #", match.serial],
                  ["DNA PIN", match.dnaPin],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="text-foreground font-mono font-medium text-right">{val}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DemoLayout>
  );
};

export default LawEnforcement;

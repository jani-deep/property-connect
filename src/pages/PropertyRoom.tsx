import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Camera, Upload, BarChart3, MapPin, Package, ArrowUpRight, Search, Check, Shield, Sparkles, Image } from "lucide-react";
import DemoLayout from "@/components/DemoLayout";
import demoWatch from "@/assets/demo-watch.jpg";
import demoLaptop from "@/assets/demo-laptop.jpg";
import demoCamera from "@/assets/demo-camera.jpg";
import demoCar from "@/assets/demo-car.jpg";
import demoPhone from "@/assets/demo-phone.jpg";
import demoKeys from "@/assets/demo-keys.jpg";
import evidenceRack from "@/assets/evidence-rack.jpg";

type Tab = "camera" | "bulk" | "dashboard";

const stateStats = [
  { label: "Registered Assets", value: "2,847,391", icon: <Package className="w-4 h-4" />, change: "+12.4%" },
  { label: "Agencies", value: "67", icon: <Building2 className="w-4 h-4" />, change: "+8" },
  { label: "Recoveries", value: "14,208", icon: <Shield className="w-4 h-4" />, change: "+23.1%" },
  { label: "Cross-County", value: "3,412", icon: <MapPin className="w-4 h-4" />, change: "+31.7%" },
];

const recentMatches = [
  { item: "BMW 5 Series", agency: "Brevard SO", matchAgency: "Orange PD", confidence: 95, date: "1h ago" },
  { item: 'MacBook Pro 16"', agency: "Brevard SO", matchAgency: "Orange PD", confidence: 94, date: "2h ago" },
  { item: "Canon EOS R5", agency: "Miami-Dade PD", matchAgency: "Broward SO", confidence: 89, date: "5h ago" },
  { item: "Rolex Datejust", agency: "Palm Beach PD", matchAgency: "Hillsborough SO", confidence: 96, date: "1d ago" },
  { item: 'iPad Pro 12.9"', agency: "Duval SO", matchAgency: "Pinellas PD", confidence: 82, date: "1d ago" },
];

const detectedAssets = [
  { img: demoWatch, label: "Rolex Submariner", serial: "M7X9K2R4", type: "Watch" },
  { img: demoCar, label: "BMW 5 Series", serial: "WBA53BJ09RWC18294", type: "Vehicle" },
  { img: demoLaptop, label: 'MacBook Pro 16"', serial: "C02ZN1LPMD6T", type: "Laptop" },
  { img: demoCamera, label: "Canon EOS R5", serial: "032024005891", type: "Camera" },
  { img: demoPhone, label: "iPhone 15 Pro", serial: "F2LXK4MNHG73", type: "Mobile" },
  { img: demoKeys, label: "Honda Civic Keys", serial: "KEY-HC-29401", type: "Keys" },
];

const bulkResults = [
  { serial: "M7X9K2R4", item: "Rolex Submariner", match: "Reported Stolen – John Smith, Brevard", confidence: 97, img: demoWatch },
  { serial: "WBA53BJ09RWC18294", item: "BMW 5 Series", match: "Registered – David Williams, Brevard", confidence: 95, img: demoCar },
  { serial: "C02ZN1LPMD6T", item: "MacBook Pro", match: "Registered – Sarah Johnson, Brevard", confidence: 98, img: demoLaptop },
  { serial: "032024005891", item: "Canon EOS R5", match: "Registered – Michael Torres, Orange", confidence: 95, img: demoCamera },
  { serial: "F2LXK4MNHG73", item: "iPhone 15 Pro", match: "No Match Found", confidence: 0, img: demoPhone },
  { serial: "KEY-HC-29401", item: "Honda Civic Keys", match: "No Match Found", confidence: 0, img: demoKeys },
];

const PropertyRoom = ({ onLogout }: { onLogout?: () => void }) => {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [bulkStep, setBulkStep] = useState<"upload" | "detecting" | "detected" | "scanning" | "results">("upload");
  const [cameraStep, setCameraStep] = useState<"ready" | "scanning" | "result">("ready");
  const [scanProgress, setScanProgress] = useState(0);
  const [bulkScanIndex, setBulkScanIndex] = useState(0);
  const [detectProgress, setDetectProgress] = useState(0);
  const [detectedCount, setDetectedCount] = useState(0);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "camera", label: "Camera", icon: <Camera className="w-4 h-4" /> },
    { id: "bulk", label: "Bulk", icon: <Upload className="w-4 h-4" /> },
  ];

  const startCameraScan = () => {
    setCameraStep("scanning");
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress((p) => {
        if (p >= 100) { clearInterval(interval); setTimeout(() => setCameraStep("result"), 300); return 100; }
        return p + 3;
      });
    }, 40);
  };

  const startDetection = () => {
    setBulkStep("detecting");
    setDetectProgress(0);
    setDetectedCount(0);
    let count = 0;
    const interval = setInterval(() => {
      setDetectProgress((p) => {
        if (p >= 100) { clearInterval(interval); setTimeout(() => setBulkStep("detected"), 400); return 100; }
        const next = p + 2;
        const newCount = Math.min(Math.floor((next / 100) * detectedAssets.length), detectedAssets.length);
        if (newCount > count) { count = newCount; setDetectedCount(count); }
        return next;
      });
    }, 50);
  };

  const startBulkScan = () => {
    setBulkStep("scanning");
    setBulkScanIndex(0);
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setBulkScanIndex(idx);
      if (idx >= detectedAssets.length) { clearInterval(interval); setTimeout(() => setBulkStep("results"), 600); }
    }, 800);
  };

  return (
    <DemoLayout title="FL Property Room" subtitle="Statewide Integration" icon={<Building2 className="w-5 h-5 text-primary" />} onLogout={onLogout}>
      <div className="px-4 py-4">
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-muted mb-5 w-full">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setCameraStep("ready"); setBulkStep("upload"); }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {stateStats.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="stat-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">{s.icon}</div>
                    <span className="text-[10px] font-medium text-success flex items-center gap-0.5">
                      <ArrowUpRight className="w-2.5 h-2.5" />{s.change}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-foreground font-mono">{s.value}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="glass-card">
              <div className="p-4 border-b border-border/50">
                <h3 className="text-sm font-semibold text-foreground">Recent Cross-Agency Matches</h3>
              </div>
              <div className="divide-y divide-border/50">
                {recentMatches.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.06 }} className="p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <Package className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">{m.item}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{m.agency} → {m.matchAgency}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-bold font-mono text-success">{m.confidence}%</div>
                      <div className="text-[10px] text-muted-foreground">{m.date}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-5 glass-card p-4 border-primary/20">
              <h3 className="text-xs font-semibold text-primary mb-2">FL Legislative Opportunity</h3>
              <div className="space-y-2">
                {["Standardized property registration", "Cross-agency data sharing", "Property room integration policy", "Verified ownership mandate"].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* CAMERA MATCH */}
        {tab === "camera" && (
          <AnimatePresence mode="wait">
            {cameraStep === "ready" && (
              <motion.div key="cam-ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                <div className="glass-card p-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground mb-1">Property Room Camera</h2>
                  <p className="text-xs text-muted-foreground mb-5">Photograph cataloged items to check the statewide database</p>
                  <button onClick={startCameraScan} className="w-full px-4 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                    <Camera className="w-4 h-4" />
                    Scan Item
                  </button>
                </div>
              </motion.div>
            )}

            {cameraStep === "scanning" && (
              <motion.div key="cam-scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                <div className="glass-card p-6">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-primary animate-pulse" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">Scanning Item...</h3>
                  <p className="text-xs text-muted-foreground mb-5">AI analyzing against database</p>
                  <div className="space-y-2 text-left text-xs mb-5">
                    {[{ label: "Image Capture", t: 15 }, { label: "Feature Extraction", t: 40 }, { label: "Database Search", t: 65 }, { label: "Match Scoring", t: 85 }].map((task) => (
                      <div key={task.label} className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${scanProgress >= task.t ? "bg-success text-success-foreground" : "bg-muted"}`}>
                          {scanProgress >= task.t && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <span className={scanProgress >= task.t ? "text-foreground" : "text-muted-foreground"}>{task.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="match-bar">
                    <div className="match-bar-fill bg-primary" style={{ width: `${scanProgress}%` }} />
                  </div>
                </div>
              </motion.div>
            )}

            {cameraStep === "result" && (
              <motion.div key="cam-result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 text-success mb-3">
                    <Check className="w-4 h-4" />
                    <span className="text-xs font-semibold">Match Found</span>
                  </div>
                  <div className="flex gap-3 mb-3">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img src={demoCar} alt="BMW" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="font-semibold text-foreground">BMW 5 Series 530i xDrive</div>
                      <div className="text-muted-foreground">VIN: <span className="font-mono">WBA53BJ09RWC18294</span></div>
                      <div className="text-muted-foreground">Owner: <span className="text-foreground font-medium">David Williams</span></div>
                      <div className="text-destructive font-medium flex items-center gap-1"><Shield className="w-3 h-3" /> Reported Stolen</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl font-bold font-mono text-success">95%</span>
                    <span className="text-xs text-muted-foreground">confidence</span>
                  </div>
                  <button onClick={() => setCameraStep("ready")} className="w-full px-4 py-2.5 rounded-lg bg-muted text-muted-foreground text-xs">Scan Another</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* BULK PROCESSING */}
        {tab === "bulk" && (
          <AnimatePresence mode="wait">
            {bulkStep === "upload" && (
              <motion.div key="bulk-upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="glass-card p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground mb-1">Upload Evidence Rack</h2>
                  <p className="text-xs text-muted-foreground mb-5">AI will auto-detect each individual asset</p>
                  <div className="rounded-xl overflow-hidden border-2 border-dashed border-border mb-5 relative cursor-pointer" onClick={startDetection}>
                    <img src={evidenceRack} alt="Evidence rack" className="w-full opacity-80" />
                    <div className="absolute inset-0 bg-background/40 flex flex-col items-center justify-center">
                      <Image className="w-8 h-8 text-primary mb-1.5" />
                      <span className="text-xs font-semibold text-foreground">Tap to upload</span>
                    </div>
                  </div>
                  <button onClick={startDetection} className="w-full px-4 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2">
                    <Camera className="w-4 h-4" />
                    Scan Evidence Rack
                  </button>
                </div>
              </motion.div>
            )}

            {bulkStep === "detecting" && (
              <motion.div key="bulk-detecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="glass-card p-5 text-center mb-4">
                  <Sparkles className="w-7 h-7 text-primary mx-auto mb-2 animate-pulse" />
                  <h3 className="text-sm font-semibold text-foreground mb-1">AI Detecting Assets...</h3>
                  <p className="text-xs text-muted-foreground mb-3">{detectedCount} of {detectedAssets.length} identified</p>
                  <div className="match-bar">
                    <div className="match-bar-fill bg-primary" style={{ width: `${detectProgress}%` }} />
                  </div>
                </div>
                <div className="glass-card overflow-hidden">
                  <div className="relative">
                    <img src={evidenceRack} alt="Evidence rack" className="w-full" />
                    <motion.div
                      className="absolute left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_hsl(var(--primary))]"
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                    {detectedAssets.slice(0, detectedCount).map((_, i) => {
                      const positions = [
                        { left: "5%", top: "10%", width: "28%", height: "35%" },
                        { left: "38%", top: "8%", width: "25%", height: "38%" },
                        { left: "68%", top: "12%", width: "28%", height: "32%" },
                        { left: "8%", top: "52%", width: "26%", height: "40%" },
                        { left: "40%", top: "55%", width: "24%", height: "38%" },
                        { left: "70%", top: "50%", width: "26%", height: "42%" },
                      ];
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute border-2 border-primary rounded-lg"
                          style={positions[i]}
                        >
                          <div className="absolute -top-4 left-0 bg-primary text-primary-foreground text-[9px] px-1 py-0.5 rounded font-medium whitespace-nowrap">
                            {detectedAssets[i].type}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {bulkStep === "detected" && (
              <motion.div key="bulk-detected" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-1.5 text-success mb-1">
                    <Check className="w-4 h-4" />
                    <span className="text-xs font-semibold">{detectedAssets.length} Assets Detected</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">AI identified items from the evidence rack</p>
                </div>
                <div className="glass-card divide-y divide-border/50 mb-4">
                  {detectedAssets.map((asset, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="p-3 flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                        <img src={asset.img} alt={asset.label} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-foreground truncate">{asset.label}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{asset.serial}</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{asset.type}</span>
                    </motion.div>
                  ))}
                </div>
                <button onClick={startBulkScan} className="w-full px-4 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2">
                  <Search className="w-4 h-4" />
                  Search All Against Database
                </button>
              </motion.div>
            )}

            {bulkStep === "scanning" && (
              <motion.div key="bulk-scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="glass-card p-5 text-center mb-4">
                  <Sparkles className="w-7 h-7 text-primary mx-auto mb-2 animate-pulse" />
                  <h3 className="text-sm font-semibold text-foreground mb-1">Matching Assets...</h3>
                  <p className="text-xs text-muted-foreground">{bulkScanIndex} of {detectedAssets.length} searched</p>
                  <div className="match-bar mt-3">
                    <div className="match-bar-fill bg-primary" style={{ width: `${(bulkScanIndex / detectedAssets.length) * 100}%` }} />
                  </div>
                </div>
                <div className="glass-card divide-y divide-border/50">
                  {detectedAssets.map((asset, i) => (
                    <div key={i} className={`p-3 flex items-center gap-3 transition-all ${i < bulkScanIndex ? "opacity-100" : "opacity-40"}`}>
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img src={asset.img} alt={asset.label} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 text-xs">
                        <span className="text-foreground font-medium">{asset.label}</span>
                      </div>
                      {i < bulkScanIndex ? (
                        <div className="w-4 h-4 rounded-full bg-success text-success-foreground flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      ) : i === bulkScanIndex ? (
                        <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {bulkStep === "results" && (
              <motion.div key="bulk-results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-foreground">Batch Results</h2>
                    <p className="text-[10px] text-muted-foreground">{bulkResults.length} items • {bulkResults.filter(r => r.confidence > 0).length} matches</p>
                  </div>
                  <button onClick={() => setBulkStep("upload")} className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs">New Batch</button>
                </div>
                <div className="glass-card divide-y divide-border/50">
                  {bulkResults.map((r, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                        <img src={r.img} alt={r.item} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-foreground truncate">{r.item}</div>
                        <div className={`text-[10px] mt-0.5 truncate ${r.match.includes("Stolen") ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                          {r.match}
                        </div>
                      </div>
                      {r.confidence > 0 ? (
                        <span className="text-xs font-bold font-mono text-success">{r.confidence}%</span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </DemoLayout>
  );
};

export default PropertyRoom;

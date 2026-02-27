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
  { label: "Registered Assets", value: "2,847,391", icon: <Package className="w-5 h-5" />, change: "+12.4%" },
  { label: "Participating Agencies", value: "67", icon: <Building2 className="w-5 h-5" />, change: "+8" },
  { label: "Recoveries This Year", value: "14,208", icon: <Shield className="w-5 h-5" />, change: "+23.1%" },
  { label: "Cross-County Matches", value: "3,412", icon: <MapPin className="w-5 h-5" />, change: "+31.7%" },
];

const recentMatches = [
  { item: "BMW 5 Series", agency: "Brevard County SO", matchAgency: "Orange County PD", confidence: 95, date: "1 hour ago" },
  { item: "MacBook Pro 16\"", agency: "Brevard County SO", matchAgency: "Orange County PD", confidence: 94, date: "2 hours ago" },
  { item: "Canon EOS R5", agency: "Miami-Dade PD", matchAgency: "Broward County SO", confidence: 89, date: "5 hours ago" },
  { item: "Rolex Datejust", agency: "Palm Beach PD", matchAgency: "Hillsborough SO", confidence: 96, date: "1 day ago" },
  { item: "iPad Pro 12.9\"", agency: "Duval County SO", matchAgency: "Pinellas County PD", confidence: 82, date: "1 day ago" },
];

const detectedAssets = [
  { img: demoWatch, label: "Rolex Submariner", serial: "M7X9K2R4", type: "Watch" },
  { img: demoCar, label: "BMW 5 Series", serial: "WBA53BJ09RWC18294", type: "Vehicle" },
  { img: demoLaptop, label: "MacBook Pro 16\"", serial: "C02ZN1LPMD6T", type: "Laptop" },
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
    { id: "dashboard", label: "State Dashboard", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "camera", label: "Camera Match", icon: <Camera className="w-4 h-4" /> },
    { id: "bulk", label: "Bulk Processing", icon: <Upload className="w-4 h-4" /> },
  ];

  const startCameraScan = () => {
    setCameraStep("scanning");
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setCameraStep("result"), 300);
          return 100;
        }
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
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setBulkStep("detected"), 400);
          return 100;
        }
        const next = p + 2;
        const newCount = Math.min(Math.floor((next / 100) * detectedAssets.length), detectedAssets.length);
        if (newCount > count) {
          count = newCount;
          setDetectedCount(count);
        }
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
      if (idx >= detectedAssets.length) {
        clearInterval(interval);
        setTimeout(() => setBulkStep("results"), 600);
      }
    }, 800);
  };

  return (
    <DemoLayout
      title="FL Property Room"
      subtitle="Statewide Integration"
      icon={<Building2 className="w-5 h-5 text-primary" />}
      onLogout={onLogout}
    >
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-5xl">
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-muted mb-6 sm:mb-8 w-full sm:max-w-md overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setCameraStep("ready"); setBulkStep("upload"); }}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stateStats.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">{s.icon}</div>
                    <span className="text-xs font-medium text-success flex items-center gap-0.5">
                      <ArrowUpRight className="w-3 h-3" />{s.change}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-foreground font-mono">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="glass-card">
              <div className="p-5 border-b border-border/50">
                <h3 className="font-semibold text-foreground">Recent Cross-Agency Matches</h3>
                <p className="text-xs text-muted-foreground mt-1">Property recovered and matched across county lines</p>
              </div>
              <div className="divide-y divide-border/50">
                {recentMatches.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.08 }} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">{m.item}</div>
                      <div className="text-xs text-muted-foreground">{m.agency} → {m.matchAgency}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold font-mono text-success">{m.confidence}%</div>
                      <div className="text-xs text-muted-foreground">{m.date}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mt-8 glass-card p-6 border-primary/20">
              <h3 className="text-sm font-semibold text-primary mb-3">Florida Legislative Opportunity</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {["Standardized property registration framework", "Cross-agency data sharing requirements", "Property room integration policy", "Verified ownership layer mandate"].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
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
              <motion.div key="cam-ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-md mx-auto text-center">
                <div className="glass-card p-10">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Camera className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Property Room Camera</h2>
                  <p className="text-sm text-muted-foreground mb-6">Photograph cataloged items to instantly check against the statewide registered owner database</p>
                  <button onClick={startCameraScan} className="w-full px-6 py-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                    <Camera className="w-5 h-5" />
                    Scan Item
                  </button>
                  <p className="text-xs text-muted-foreground mt-3">Same AI engine as Law Enforcement field search</p>
                </div>
              </motion.div>
            )}

            {cameraStep === "scanning" && (
              <motion.div key="cam-scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-md mx-auto text-center">
                <div className="glass-card p-8">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Scanning Item...</h3>
                  <p className="text-sm text-muted-foreground mb-6">AI analyzing against registered database</p>
                  <div className="space-y-2 text-left text-sm mb-6">
                    {[{ label: "Image Capture", t: 15 }, { label: "Feature Extraction", t: 40 }, { label: "Database Search", t: 65 }, { label: "Match Scoring", t: 85 }].map((task) => (
                      <div key={task.label} className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${scanProgress >= task.t ? "bg-success text-success-foreground" : "bg-muted"}`}>
                          {scanProgress >= task.t && <Check className="w-3 h-3" />}
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
                <div className="glass-card p-6 max-w-lg mx-auto">
                  <div className="flex items-center gap-2 text-success mb-4">
                    <Check className="w-5 h-5" />
                    <span className="text-sm font-semibold">Match Found</span>
                  </div>
                  <div className="flex gap-4 mb-4">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img src={demoCar} alt="BMW" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="font-semibold text-foreground">BMW 5 Series 530i xDrive</div>
                      <div className="text-muted-foreground">VIN: <span className="font-mono">WBA53BJ09RWC18294</span></div>
                      <div className="text-muted-foreground">Owner: <span className="text-foreground font-medium">David Williams, Brevard</span></div>
                      <div className="text-destructive font-medium flex items-center gap-1"><Shield className="w-3 h-3" /> Reported Stolen</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl font-bold font-mono text-success">95%</span>
                    <span className="text-sm text-muted-foreground">confidence</span>
                  </div>
                  <button onClick={() => setCameraStep("ready")} className="w-full px-4 py-2.5 rounded-lg bg-muted text-muted-foreground text-sm hover:bg-muted/80 transition-colors">Scan Another Item</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* BULK PROCESSING */}
        {tab === "bulk" && (
          <AnimatePresence mode="wait">
            {/* STEP 1: Upload evidence rack image */}
            {bulkStep === "upload" && (
              <motion.div key="bulk-upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="max-w-lg mx-auto text-center">
                  <div className="glass-card p-10">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-2">Upload Evidence Rack Image</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Photograph the evidence rack/shelf and our AI will automatically detect and identify each individual asset
                    </p>
                    {/* Preview of what a rack looks like */}
                    <div className="rounded-xl overflow-hidden border-2 border-dashed border-border mb-6 relative group cursor-pointer" onClick={startDetection}>
                      <img src={evidenceRack} alt="Evidence rack" className="w-full opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 bg-background/40 flex flex-col items-center justify-center group-hover:bg-background/20 transition-colors">
                        <Image className="w-10 h-10 text-primary mb-2" />
                        <span className="text-sm font-semibold text-foreground">Click to upload rack image</span>
                        <span className="text-xs text-muted-foreground">or drag & drop</span>
                      </div>
                    </div>
                    <button onClick={startDetection} className="w-full px-6 py-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                      <Camera className="w-5 h-5" />
                      Scan Evidence Rack
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: AI detecting individual assets from rack image */}
            {bulkStep === "detecting" && (
              <motion.div key="bulk-detecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="max-w-lg mx-auto">
                  <div className="glass-card p-6 text-center mb-6">
                    <Sparkles className="w-8 h-8 text-primary mx-auto mb-3 animate-pulse" />
                    <h3 className="text-lg font-semibold text-foreground mb-1">AI Detecting Assets...</h3>
                    <p className="text-sm text-muted-foreground mb-4">Identifying individual items from evidence rack image</p>
                    <div className="match-bar mb-3">
                      <div className="match-bar-fill bg-primary" style={{ width: `${detectProgress}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground">{detectedCount} of {detectedAssets.length} assets identified</p>
                  </div>

                  {/* Show rack image with detection overlay */}
                  <div className="glass-card overflow-hidden">
                    <div className="relative">
                      <img src={evidenceRack} alt="Evidence rack" className="w-full" />
                      {/* Scanning line animation */}
                      <motion.div
                        className="absolute left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_hsl(var(--primary))]"
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      />
                      {/* Detection boxes appearing */}
                      {detectedAssets.slice(0, detectedCount).map((_, i) => {
                        const positions = [
                          { left: "5%", top: "10%", width: "28%", height: "35%" },
                          { left: "38%", top: "8%", width: "25%", height: "38%" },
                          { left: "68%", top: "12%", width: "28%", height: "32%" },
                          { left: "8%", top: "52%", width: "26%", height: "40%" },
                          { left: "40%", top: "55%", width: "24%", height: "38%" },
                          { left: "70%", top: "50%", width: "26%", height: "42%" },
                        ];
                        const pos = positions[i];
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute border-2 border-primary rounded-lg"
                            style={pos}
                          >
                            <div className="absolute -top-5 left-0 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                              {detectedAssets[i].type}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Show detected assets with 3D images */}
            {bulkStep === "detected" && (
              <motion.div key="bulk-detected" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="max-w-lg mx-auto">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 text-success mb-2">
                      <Check className="w-5 h-5" />
                      <span className="text-sm font-semibold">{detectedAssets.length} Assets Detected</span>
                    </div>
                    <p className="text-sm text-muted-foreground">AI identified the following items from the evidence rack</p>
                  </div>
                  <div className="glass-card divide-y divide-border/50 mb-6">
                    {detectedAssets.map((asset, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-3 flex items-center gap-3"
                      >
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                          <img src={asset.img} alt={asset.label} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground">{asset.label}</div>
                          <div className="text-xs text-muted-foreground">
                            Serial: <span className="font-mono">{asset.serial}</span>
                          </div>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">{asset.type}</span>
                      </motion.div>
                    ))}
                  </div>
                  <button onClick={startBulkScan} className="w-full px-6 py-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                    <Search className="w-5 h-5" />
                    Search All Against Database
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Scanning each asset */}
            {bulkStep === "scanning" && (
              <motion.div key="bulk-scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-lg mx-auto">
                <div className="glass-card p-6 text-center mb-6">
                  <Sparkles className="w-8 h-8 text-primary mx-auto mb-3 animate-pulse" />
                  <h3 className="text-lg font-semibold text-foreground mb-1">Matching Assets...</h3>
                  <p className="text-sm text-muted-foreground">{bulkScanIndex} of {detectedAssets.length} items searched</p>
                  <div className="match-bar mt-4">
                    <div className="match-bar-fill bg-primary" style={{ width: `${(bulkScanIndex / detectedAssets.length) * 100}%` }} />
                  </div>
                </div>
                <div className="glass-card divide-y divide-border/50">
                  {detectedAssets.map((asset, i) => (
                    <div key={i} className={`p-3 flex items-center gap-3 transition-all ${i < bulkScanIndex ? "opacity-100" : "opacity-40"}`}>
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img src={asset.img} alt={asset.label} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 text-sm">
                        <span className="text-foreground font-medium">{asset.label}</span>
                      </div>
                      {i < bulkScanIndex ? (
                        <div className="w-5 h-5 rounded-full bg-success text-success-foreground flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      ) : i === bulkScanIndex ? (
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 5: Results */}
            {bulkStep === "results" && (
              <motion.div key="bulk-results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Batch Results</h2>
                    <p className="text-sm text-muted-foreground">{bulkResults.length} items processed • {bulkResults.filter(r => r.confidence > 0).length} matches found</p>
                  </div>
                  <button onClick={() => setBulkStep("upload")} className="px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm">New Batch</button>
                </div>
                <div className="glass-card divide-y divide-border/50">
                  {bulkResults.map((r, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                        <img src={r.img} alt={r.item} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{r.item}</span>
                          <span className="text-xs font-mono text-muted-foreground">{r.serial}</span>
                        </div>
                        <div className={`text-xs mt-0.5 ${r.match.includes("Stolen") ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                          {r.match}
                        </div>
                      </div>
                      {r.confidence > 0 ? (
                        <span className="text-sm font-bold font-mono text-success">{r.confidence}%</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
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

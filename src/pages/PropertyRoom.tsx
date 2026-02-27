import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Camera, Upload, BarChart3, MapPin, Package, ArrowUpRight, Search, Check, Shield, Sparkles } from "lucide-react";
import DemoLayout from "@/components/DemoLayout";
import demoWatch from "@/assets/demo-watch.jpg";
import demoLaptop from "@/assets/demo-laptop.jpg";
import demoCamera from "@/assets/demo-camera.jpg";
import demoCar from "@/assets/demo-car.jpg";

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

const bulkAssetStack = [
  { img: demoWatch, label: "Rolex Submariner", serial: "M7X9K2R4", type: "Watch" },
  { img: demoCar, label: "BMW 5 Series", serial: "WBA53BJ09RWC18294", type: "Vehicle" },
  { img: demoLaptop, label: "MacBook Pro 16\"", serial: "C02ZN1LPMD6T", type: "Laptop" },
  { img: demoCamera, label: "Canon EOS R5", serial: "032024005891", type: "Camera" },
  { img: demoWatch, label: "iPhone 15 Pro", serial: "F2LXK4MNHG73", type: "Mobile" },
  { img: demoCamera, label: "Honda Civic Keys", serial: "KEY-HC-29401", type: "Keys" },
];

const bulkResults = [
  { serial: "M7X9K2R4", item: "Rolex Submariner", match: "Reported Stolen – John Smith, Brevard", confidence: 97, img: demoWatch },
  { serial: "WBA53BJ09RWC18294", item: "BMW 5 Series", match: "Registered – David Williams, Brevard", confidence: 95, img: demoCar },
  { serial: "C02ZN1LPMD6T", item: "MacBook Pro", match: "Registered – Sarah Johnson, Brevard", confidence: 98, img: demoLaptop },
  { serial: "032024005891", item: "Canon EOS R5", match: "Registered – Michael Torres, Orange", confidence: 95, img: demoCamera },
  { serial: "F2LXK4MNHG73", item: "iPhone 15 Pro", match: "No Match Found", confidence: 0, img: demoWatch },
  { serial: "KEY-HC-29401", item: "Honda Civic Keys", match: "No Match Found", confidence: 0, img: demoCamera },
];

const PropertyRoom = () => {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [bulkStep, setBulkStep] = useState<"stack" | "scanning" | "results">("stack");
  const [cameraStep, setCameraStep] = useState<"ready" | "scanning" | "result">("ready");
  const [scanProgress, setScanProgress] = useState(0);
  const [bulkScanIndex, setBulkScanIndex] = useState(0);

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

  const startBulkScan = () => {
    setBulkStep("scanning");
    setBulkScanIndex(0);
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setBulkScanIndex(idx);
      if (idx >= bulkAssetStack.length) {
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
    >
      <div className="container mx-auto px-6 py-10 max-w-5xl">
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-muted mb-8 max-w-md">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setCameraStep("ready"); setBulkStep("stack"); }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stateStats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="stat-card"
                >
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
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors"
                  >
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-8 glass-card p-6 border-primary/20"
            >
              <h3 className="text-sm font-semibold text-primary mb-3">Florida Legislative Opportunity</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "Standardized property registration framework",
                  "Cross-agency data sharing requirements",
                  "Property room integration policy",
                  "Verified ownership layer mandate",
                ].map((item) => (
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
                  <p className="text-sm text-muted-foreground mb-6">
                    Photograph cataloged items to instantly check against the statewide registered owner database
                  </p>
                  <button
                    onClick={startCameraScan}
                    className="w-full px-6 py-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    Scan Item
                  </button>
                  <p className="text-xs text-muted-foreground mt-3">
                    Same AI engine as Law Enforcement field search
                  </p>
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
                    {[
                      { label: "Image Capture", t: 15 },
                      { label: "Feature Extraction", t: 40 },
                      { label: "Database Search", t: 65 },
                      { label: "Match Scoring", t: 85 },
                    ].map((task) => (
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
                      <div className="text-destructive font-medium flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Reported Stolen
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl font-bold font-mono text-success">95%</span>
                    <span className="text-sm text-muted-foreground">confidence</span>
                  </div>
                  <button onClick={() => setCameraStep("ready")} className="w-full px-4 py-2.5 rounded-lg bg-muted text-muted-foreground text-sm hover:bg-muted/80 transition-colors">
                    Scan Another Item
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* BULK PROCESSING */}
        {tab === "bulk" && (
          <AnimatePresence mode="wait">
            {bulkStep === "stack" && (
              <motion.div key="bulk-stack" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="max-w-lg mx-auto">
                  <h2 className="text-xl font-bold text-foreground mb-2 text-center">Evidence Rack</h2>
                  <p className="text-sm text-muted-foreground text-center mb-6">Review the asset stack before batch processing</p>
                  <div className="glass-card divide-y divide-border/50 mb-6">
                    {bulkAssetStack.map((asset, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="p-3 flex items-center gap-3"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img src={asset.img} alt={asset.label} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground">{asset.label}</div>
                          <div className="text-xs text-muted-foreground">
                            <span className="font-mono">{asset.serial}</span> • {asset.type}
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">{asset.type}</span>
                      </motion.div>
                    ))}
                  </div>
                  <button
                    onClick={startBulkScan}
                    className="w-full px-6 py-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Search className="w-5 h-5" />
                    Process Batch ({bulkAssetStack.length} items)
                  </button>
                </div>
              </motion.div>
            )}

            {bulkStep === "scanning" && (
              <motion.div key="bulk-scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-lg mx-auto">
                <div className="glass-card p-6 text-center mb-6">
                  <Sparkles className="w-8 h-8 text-primary mx-auto mb-3 animate-pulse" />
                  <h3 className="text-lg font-semibold text-foreground mb-1">Processing Batch...</h3>
                  <p className="text-sm text-muted-foreground">{bulkScanIndex} of {bulkAssetStack.length} items scanned</p>
                  <div className="match-bar mt-4">
                    <div className="match-bar-fill bg-primary" style={{ width: `${(bulkScanIndex / bulkAssetStack.length) * 100}%` }} />
                  </div>
                </div>
                <div className="glass-card divide-y divide-border/50">
                  {bulkAssetStack.map((asset, i) => (
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

            {bulkStep === "results" && (
              <motion.div key="bulk-results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Batch Results</h2>
                    <p className="text-sm text-muted-foreground">{bulkResults.length} items processed • {bulkResults.filter(r => r.confidence > 0).length} matches found</p>
                  </div>
                  <button onClick={() => setBulkStep("stack")} className="px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm">
                    New Batch
                  </button>
                </div>
                <div className="glass-card divide-y divide-border/50">
                  {bulkResults.map((r, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 flex items-center gap-4"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden ${r.confidence > 0 ? "" : "bg-muted"}`}>
                        {r.confidence > 0 ? (
                          <img src={r.img} alt={r.item} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Package className="w-5 h-5 text-muted-foreground" />
                        )}
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
                      {r.confidence > 0 && (
                        <span className="text-sm font-bold font-mono text-success">{r.confidence}%</span>
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

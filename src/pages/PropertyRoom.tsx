import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Camera, Upload, BarChart3, MapPin, Users, Package, ArrowUpRight, Search, Check, Shield } from "lucide-react";
import DemoLayout from "@/components/DemoLayout";

type Tab = "camera" | "bulk" | "dashboard";

const stateStats = [
  { label: "Registered Assets", value: "2,847,391", icon: <Package className="w-5 h-5" />, change: "+12.4%" },
  { label: "Participating Agencies", value: "67", icon: <Building2 className="w-5 h-5" />, change: "+8" },
  { label: "Recoveries This Year", value: "14,208", icon: <Shield className="w-5 h-5" />, change: "+23.1%" },
  { label: "Cross-County Matches", value: "3,412", icon: <MapPin className="w-5 h-5" />, change: "+31.7%" },
];

const recentMatches = [
  { item: "MacBook Pro 16\"", agency: "Brevard County SO", matchAgency: "Orange County PD", confidence: 94, date: "2 hours ago" },
  { item: "Canon EOS R5", agency: "Miami-Dade PD", matchAgency: "Broward County SO", confidence: 89, date: "5 hours ago" },
  { item: "Rolex Datejust", agency: "Palm Beach PD", matchAgency: "Hillsborough SO", confidence: 96, date: "1 day ago" },
  { item: "iPad Pro 12.9\"", agency: "Duval County SO", matchAgency: "Pinellas County PD", confidence: 82, date: "1 day ago" },
  { item: "Nikon Z9", agency: "Seminole County SO", matchAgency: "Volusia County PD", confidence: 91, date: "2 days ago" },
];

const bulkResults = [
  { serial: "C02ZN1LPMD6T", item: "MacBook Pro", match: "Registered – Sarah Johnson, Brevard", confidence: 98 },
  { serial: "032024005891", item: "Canon EOS R5", match: "Registered – Michael Torres, Orange", confidence: 95 },
  { serial: "M7X9K2R4", item: "Rolex Submariner", match: "Reported Stolen – John Smith, Brevard", confidence: 97 },
  { serial: "DXLK992817", item: "iPad Pro", match: "No Match Found", confidence: 0 },
  { serial: "NKZ9-28401", item: "Nikon Z9", match: "Registered – Emily Davis, Duval", confidence: 88 },
];

const PropertyRoom = () => {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [bulkProcessed, setBulkProcessed] = useState(false);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "State Dashboard", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "camera", label: "Camera Match", icon: <Camera className="w-4 h-4" /> },
    { id: "bulk", label: "Bulk Processing", icon: <Upload className="w-4 h-4" /> },
  ];

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
              onClick={() => setTab(t.id)}
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

            {/* Recent cross-agency matches */}
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

            {/* Legislative callout */}
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto text-center">
            <div className="glass-card p-10">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Camera className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Property Room Camera</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Photograph cataloged items to instantly check against the statewide registered owner database
              </p>
              <div className="space-y-3">
                <button className="w-full px-6 py-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  <Camera className="w-5 h-5" />
                  Scan Item
                </button>
                <p className="text-xs text-muted-foreground">
                  Same AI engine as Law Enforcement field search — integrated into property room workflow
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* BULK PROCESSING */}
        {tab === "bulk" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {!bulkProcessed ? (
              <div className="max-w-md mx-auto text-center">
                <div className="glass-card p-10">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Bulk Processing</h2>
                  <p className="text-sm text-muted-foreground mb-6">Upload batch serial numbers or images to check against all participating databases</p>
                  <button
                    onClick={() => setBulkProcessed(true)}
                    className="w-full px-6 py-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Search className="w-5 h-5" />
                    Process Demo Batch (5 items)
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Batch Results</h2>
                    <p className="text-sm text-muted-foreground">5 serials processed • 4 matches found</p>
                  </div>
                  <button onClick={() => setBulkProcessed(false)} className="px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm">
                    New Batch
                  </button>
                </div>
                <div className="glass-card divide-y divide-border/50">
                  {bulkResults.map((r, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.12 }}
                      className="p-4 flex items-center gap-4"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${r.confidence > 0 ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                        {r.confidence > 0 ? <Check className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{r.item}</span>
                          <span className="text-xs font-mono text-muted-foreground">{r.serial}</span>
                        </div>
                        <div className={`text-xs mt-0.5 ${r.match.includes("Stolen") ? "text-destructive font-medium" : r.confidence > 0 ? "text-muted-foreground" : "text-muted-foreground"}`}>
                          {r.match}
                        </div>
                      </div>
                      {r.confidence > 0 && (
                        <span className="text-sm font-bold font-mono text-success">{r.confidence}%</span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </DemoLayout>
  );
};

export default PropertyRoom;

import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { loadOfficer } from "@/lib/leData";
import { Search, KeyRound, PackageCheck, AlertTriangle, Fingerprint, TrendingUp, Clock, ScanLine, Users, DollarSign } from "lucide-react";
import { maskPhone, maskPin } from "@/lib/mask";
import demoWatch from "@/assets/demo-watch.jpg";
import demoCar from "@/assets/demo-car.jpg";
import demoLaptop from "@/assets/demo-laptop.jpg";
import demoCamera from "@/assets/demo-camera.jpg";

const stats = [
  { label: "Total Searches", value: "12,486", delta: "+8.4% this month", icon: Search },
  { label: "Microdot Reads", value: "3,921", delta: "+12.1% this month", icon: ScanLine },
  { label: "Verified Matches", value: "2,674", delta: "68% hit rate", icon: Fingerprint },
  { label: "Items Recovered", value: "1,908", delta: "+204 this month", icon: PackageCheck },
  { label: "Owners Notified", value: "1,742", delta: "91% of recoveries", icon: Users },
  { label: "Stolen Flags Raised", value: "612", delta: "44 open cases", icon: AlertTriangle },
  { label: "Property Value Returned", value: "$4.62M", delta: "+$318K this month", icon: DollarSign },
  { label: "Avg. Match Time", value: "38s", delta: "−12s vs last month", icon: Clock },
];

const counties = [
  { name: "Miami-Dade County", searches: 3120, recovered: 512 },
  { name: "Broward County", searches: 2408, recovered: 411 },
  { name: "Hillsborough County", searches: 1976, recovered: 322 },
  { name: "Orange County", searches: 1744, recovered: 289 },
  { name: "Brevard County", searches: 1188, recovered: 197 },
];

const recent = [
  { img: demoCar, item: "BMW 5 Series 530i xDrive", pin: "FL-DNA-3301-VK", phone: "+1 (555) 214-8890", status: "Recovered", time: "12 min ago" },
  { img: demoWatch, item: "Rolex Submariner 126610LN", pin: "FL-DNA-7829-AX", phone: "+1 (555) 662-1174", status: "Stolen", time: "48 min ago" },
  { img: demoLaptop, item: 'MacBook Pro 16"', pin: "FL-DNA-5520-MR", phone: "+1 (555) 903-4432", status: "Owner Notified", time: "2 hrs ago" },
  { img: demoCamera, item: "Canon EOS R5", pin: "FL-DNA-9901-CZ", phone: "+1 (555) 771-0028", status: "Recovered", time: "5 hrs ago" },
];

const statusStyle = (s: string) =>
  s === "Stolen"
    ? "bg-destructive/10 text-destructive"
    : s === "Recovered"
    ? "bg-success/15 text-success"
    : "bg-primary/10 text-primary";

const maxSearches = Math.max(...counties.map((c) => c.searches));

const LeDashboard = () => {
  const officer = loadOfficer();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  return (
  <div className="px-4 sm:px-8 py-7 max-w-[1400px]">
    <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
      <div>
        <p className="text-xs font-semibold uppercase text-primary">{officer.agency} · Badge {officer.badge}</p>
        <h1 className="text-2xl font-bold text-foreground font-heading">Good day, {officer.name}</h1>
        <p className="text-sm text-muted-foreground">{officer.county} activity · {officer.role}</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Link to="/le/search" className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 flex items-center gap-2"><ScanLine className="w-4 h-4" /> Image Search</Link>
        <Link to="/le/manual" className="px-4 py-2.5 rounded-lg border border-border bg-card font-semibold text-sm hover:bg-muted flex items-center gap-2"><KeyRound className="w-4 h-4" /> Identifier Search</Link>
      </div>
    </div>
    <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) navigate(`/le/manual?q=${encodeURIComponent(q.trim())}`); }} className="glass-card p-3 mb-6 flex gap-2">
      <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Quick search: exact PIN, serial or VIN" className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm font-mono outline-none focus:ring-2 focus:ring-ring" /></div>
      <button className="px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold">Search</button>
    </form>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">{s.value}</div>
            <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-success" /> {s.delta}
            </div>
          </motion.div>
        );
      })}
    </div>

    <div className="grid lg:grid-cols-2 gap-5">
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Statewide activity by county (anonymous)</h2>
        <div className="space-y-4">
          {counties.map((c) => (
            <div key={c.name}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-foreground font-medium">{c.name}</span>
                <span className="text-muted-foreground font-mono">
                  {c.searches.toLocaleString()} searches · {c.recovered} recovered
                </span>
              </div>
              <div className="match-bar">
                <div className="match-bar-fill bg-primary" style={{ width: `${(c.searches / maxSearches) * 100}%` }} />
              </div>
              <div className="match-bar mt-1">
                <div className="match-bar-fill bg-success" style={{ width: `${(c.recovered / maxSearches) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Your agency's recent matches</h2>
        <div className="space-y-3">
          {recent.map((r, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-11 h-11 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img src={r.img} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-foreground truncate">{r.item}</div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  {maskPin(r.pin)} · {maskPhone(r.phone)}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusStyle(r.status)}`}>{r.status}</span>
                <div className="text-[10px] text-muted-foreground mt-1">{r.time}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-4">
          Owner phone numbers, serials and PINs stay masked until a match is confirmed on the case file.
        </p>
      </div>
    </div>
  </div>
  );
};

export default LeDashboard;

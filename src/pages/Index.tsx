import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Search, Building2, ArrowRight, Fingerprint, ChevronRight, User, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const pillars = [
  {
    title: "PropertyProof™",
    subtitle: "AI Inventory + DNA Placement",
    description: "Frictionless citizen inventory with AI item detection and forensic DNA marker placement.",
    icon: <Fingerprint className="w-8 h-8" />,
    href: "/property-proof",
    features: ["AI Photo Analysis", "OCR Serial Detection", "DNA PIN Placement", "Verified Ownership"],
    stat: "< 60 sec",
    statLabel: "Registration Time",
  },
  {
    title: "Law Enforcement",
    subtitle: "AI Image Search + Probability Scoring",
    description: "Intelligence engine for recovered property matching with confidence-scored results.",
    icon: <Search className="w-8 h-8" />,
    href: "/law-enforcement",
    features: ["AI Image Matching", "Probability Scoring", "DNA Marker Verification", "Owner Identification"],
    stat: "97%",
    statLabel: "Match Accuracy",
  },
  {
    title: "FL Property Room",
    subtitle: "Statewide Integration Dashboard",
    description: "Cross-agency property room matching and statewide recovered property intelligence.",
    icon: <Building2 className="w-8 h-8" />,
    href: "/property-room",
    features: ["Cross-Agency Matching", "Bulk Processing", "State Dashboard", "Integration Ready"],
    stat: "67",
    statLabel: "Counties Connected",
  },
];

const Index = ({ onLogout }: { onLogout?: () => void }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Profile in top-right */}
      <div className="absolute top-4 right-6 z-20" ref={dropdownRef}>
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground hidden sm:inline">Demo User</span>
        </button>
        {profileOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 glass-card py-1.5 z-50 animate-fade-in">
            <div className="px-4 py-3 border-b border-border/50">
              <div className="text-sm font-semibold text-foreground">Demo User</div>
              <div className="text-xs text-muted-foreground">+1 (555) 000-0000</div>
            </div>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
              <User className="w-4 h-4 text-muted-foreground" />
              My Profile
            </button>
            {onLogout && (
              <button
                onClick={() => { setProfileOpen(false); onLogout(); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            )}
          </div>
        )}
      </div>

      {/* Background glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-30 pointer-events-none"
        style={{ background: "var(--gradient-glow)" }}
      />

      <div className="relative container mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Florida Legislative Demo
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
            <span className="gradient-text">PropertyProof</span>
            <span className="text-foreground">™</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            From resident registration to statewide recovered property intelligence.
            <br />
            <span className="text-foreground/80 font-medium">One verified ownership ecosystem.</span>
          </p>
        </motion.div>

        {/* Connection Line */}
        <div className="hidden lg:block relative mb-8">
          <div className="absolute top-1/2 left-[16%] right-[16%] h-px bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0" />
          <div className="flex justify-between px-[12%]">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8 + i * 0.15 }}
                className="w-3 h-3 rounded-full bg-primary relative"
              >
                <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-30" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pillar Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
            >
              <Link to={pillar.href} className="block">
                <div className="pillar-card h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                      {pillar.icon}
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>

                  <h2 className="text-xl font-bold text-foreground mb-1">{pillar.title}</h2>
                  <p className="text-sm text-primary font-medium mb-3">{pillar.subtitle}</p>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{pillar.description}</p>

                  <div className="space-y-2 mb-6">
                    {pillar.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ChevronRight className="w-3 h-3 text-primary" />
                        {f}
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <div className="text-2xl font-bold gradient-text">{pillar.stat}</div>
                    <div className="text-xs text-muted-foreground">{pillar.statLabel}</div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center"
        >
          <p className="text-sm text-muted-foreground">
            We are not replacing existing systems. We are adding a{" "}
            <span className="text-primary font-semibold">verified ownership layer</span>.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;

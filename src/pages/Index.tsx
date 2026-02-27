import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowRight, Fingerprint, ChevronRight, Search, Building2 } from "lucide-react";
import MobileHeader from "@/components/MobileHeader";
import BottomNav from "@/components/BottomNav";

const pillars = [
  {
    title: "PropertyProof™",
    subtitle: "AI Inventory + DNA Placement",
    description: "Frictionless citizen inventory with AI item detection and forensic DNA marker placement.",
    icon: <Fingerprint className="w-6 h-6" />,
    href: "/property-proof",
    features: ["AI Photo Analysis", "OCR Serial Detection", "DNA PIN Placement", "Verified Ownership"],
    stat: "< 60 sec",
    statLabel: "Registration Time",
  },
  {
    title: "Law Enforcement",
    subtitle: "AI Image Search + Probability Scoring",
    description: "Intelligence engine for recovered property matching with confidence-scored results.",
    icon: <Search className="w-6 h-6" />,
    href: "/law-enforcement",
    features: ["AI Image Matching", "Probability Scoring", "DNA Marker Verification", "Owner Identification"],
    stat: "97%",
    statLabel: "Match Accuracy",
  },
  {
    title: "FL Property Room",
    subtitle: "Statewide Integration Dashboard",
    description: "Cross-agency property room matching and statewide recovered property intelligence.",
    icon: <Building2 className="w-6 h-6" />,
    href: "/property-room",
    features: ["Cross-Agency Matching", "Bulk Processing", "State Dashboard", "Integration Ready"],
    stat: "67",
    statLabel: "Counties Connected",
  },
];

const Index = ({ onLogout }: { onLogout?: () => void }) => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-20">
      <MobileHeader title="PropertyProof™" subtitle="Florida Legislative Demo" onLogout={onLogout} />

      {/* Background glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] opacity-30 pointer-events-none"
        style={{ background: "var(--gradient-glow)" }}
      />

      <div className="relative px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
            <Shield className="w-3.5 h-3.5" />
            Florida Legislative Demo
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-3">
            <span className="gradient-text">PropertyProof</span>
            <span className="text-foreground">™</span>
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            From resident registration to statewide recovered property intelligence.
            <br />
            <span className="text-foreground/80 font-medium">One verified ownership ecosystem.</span>
          </p>
        </motion.div>

        {/* Pillar Cards - stacked */}
        <div className="space-y-4 mb-8">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
            >
              <Link to={pillar.href} className="block">
                <div className="pillar-card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                      {pillar.icon}
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>

                  <h2 className="text-lg font-bold text-foreground mb-0.5">{pillar.title}</h2>
                  <p className="text-xs text-primary font-medium mb-2">{pillar.subtitle}</p>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{pillar.description}</p>

                  <div className="grid grid-cols-2 gap-1.5 mb-4">
                    {pillar.features.map((f) => (
                      <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <ChevronRight className="w-3 h-3 text-primary flex-shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-border/50">
                    <div className="text-xl font-bold gradient-text">{pillar.stat}</div>
                    <div className="text-[10px] text-muted-foreground">{pillar.statLabel}</div>
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
          transition={{ delay: 1 }}
          className="text-center"
        >
          <p className="text-xs text-muted-foreground">
            We are not replacing existing systems. We are adding a{" "}
            <span className="text-primary font-semibold">verified ownership layer</span>.
          </p>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;

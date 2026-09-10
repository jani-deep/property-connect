import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Fingerprint, Check, Circle, Sparkles, ShieldCheck, MapPin, Phone, User, Hash, Tag, DollarSign, Calendar } from "lucide-react";
import DemoLayout from "@/components/DemoLayout";
import emilyAvatar from "@/assets/emily-avatar.png";
import demoWatch from "@/assets/demo-watch.jpg";
import demoWatchSide from "@/assets/demo-watch-side.jpg";
import demoWatchBack from "@/assets/demo-watch-back.jpg";
import demoLaptop from "@/assets/demo-laptop.jpg";
import demoLaptopSide from "@/assets/demo-laptop-side.jpg";
import demoLaptopBack from "@/assets/demo-laptop-back.jpg";
import demoCamera from "@/assets/demo-camera.jpg";
import demoCar from "@/assets/demo-car.jpg";
import demoCarSide from "@/assets/demo-car-side.jpg";
import demoCarBack from "@/assets/demo-car-back.jpg";
import demoPhone from "@/assets/demo-phone.jpg";
import demoKeys from "@/assets/demo-keys.jpg";
import { loadRecords, type PropertyRecord } from "@/lib/propertyRecord";

const demoAssets: Record<string, { img: string; brand: string; model: string; category: string; serial: string; value: string; registered: boolean; dnaPlaced: boolean }> = {
  "demo-0": { img: demoCar, brand: "BMW", model: "5 Series 530i xDrive", category: "Vehicle – Sedan", serial: "WBA53BJ09RWC18294", value: "$56,200", registered: true, dnaPlaced: true },
  "demo-1": { img: demoWatch, brand: "Rolex", model: "Submariner Date 126610LN", category: "Luxury Watch", serial: "M7X9K2R4", value: "$14,500", registered: true, dnaPlaced: true },
  "demo-2": { img: demoLaptop, brand: "Apple", model: 'MacBook Pro 16" M3 Max', category: "Electronics – Laptop", serial: "C02ZN1LPMD6T", value: "$3,499", registered: true, dnaPlaced: false },
  "demo-3": { img: demoCamera, brand: "Canon", model: "EOS R5 Mark II", category: "Electronics – Camera", serial: "032024005891", value: "$4,299", registered: false, dnaPlaced: false },
  "demo-4": { img: demoPhone, brand: "Apple", model: "iPhone 15 Pro Max", category: "Electronics – Mobile", serial: "F2LXK4MNHG73", value: "$1,199", registered: false, dnaPlaced: false },
  "demo-5": { img: demoKeys, brand: "Honda", model: "Civic Key Fob + Keys", category: "Vehicle Accessory – Keys", serial: "KEY-HC-29401", value: "$350", registered: false, dnaPlaced: false },
};

interface Step {
  label: string;
  hint: string;
  done: boolean;
}

const StepRow = ({ step, index }: { step: Step; index: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.06 }}
    className="flex items-start gap-3"
  >
    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${step.done ? "bg-success text-success-foreground" : "bg-warning/15 text-warning"}`}>
      {step.done ? <Check className="w-3.5 h-3.5" /> : <Circle className="w-3 h-3" />}
    </div>
    <div className="flex-1 min-w-0">
      <div className={`text-xs font-semibold ${step.done ? "text-foreground" : "text-foreground"}`}>{step.label}</div>
      <div className="text-[10px] text-muted-foreground">{step.hint}</div>
    </div>
    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${step.done ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
      {step.done ? "Complete" : "Pending"}
    </span>
  </motion.div>
);

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-2.5 py-2">
    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">{icon}</div>
    <div className="flex-1 min-w-0">
      <div className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-xs font-medium text-foreground truncate">{value || "—"}</div>
    </div>
  </div>
);

const PropertyDetail = ({ onLogout }: { onLogout?: () => void }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const record: PropertyRecord | undefined = loadRecords().find((r) => r.pin === id);
  const demo = id ? demoAssets[id] : undefined;

  if (!record && !demo) {
    return (
      <DemoLayout title="Property Details" subtitle="" icon={<Fingerprint className="w-5 h-5 text-primary" />} onLogout={onLogout}>
        <div className="px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground mb-4">Property not found.</p>
          <button onClick={() => navigate("/property-proof")} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
            Back to My Property
          </button>
        </div>
      </DemoLayout>
    );
  }

  const isDraft = record ? record.status === "draft" : !demo!.registered;
  const img = record ? record.img || demoKeys : demo!.img;
  const title = record ? record.item : `${demo!.brand} ${demo!.model}`;
  const category = record ? record.category : demo!.category;
  const serial = record ? record.serial : demo!.serial;
  const value = record ? record.value : demo!.value;
  const pin = record ? record.pin : "FL-DNA-7829-AX";
  const dnaDone = record ? record.dnaLocations.some((l) => l.applied) : demo!.dnaPlaced;
  const score = record ? record.score : demo!.registered ? (demo!.dnaPlaced ? 100 : 70) : 40;

  const steps: Step[] = record
    ? [
        { label: "Photo uploaded", hint: "Item photo captured via Emily", done: !!record.img },
        { label: "Item details confirmed", hint: "Description & category identified", done: !!record.item && !!record.category },
        { label: "Serial number captured", hint: record.serialLabel || "Serial / VIN / IMEI verified by OCR", done: !!record.serial },
        { label: "DNA dots applied", hint: "Adhesive markers placed on the item", done: dnaDone },
        { label: "Registration protected", hint: "Ownership record sealed with DNA PIN", done: record.status === "protected" },
      ]
    : [
        { label: "Photo uploaded", hint: "Item photo on file", done: true },
        { label: "Item details confirmed", hint: "Description & category identified", done: true },
        { label: "Serial number captured", hint: "Serial verified by OCR", done: true },
        { label: "DNA dots applied", hint: "Adhesive markers placed on the item", done: demo!.dnaPlaced },
        { label: "Registration protected", hint: "Ownership record sealed with DNA PIN", done: demo!.registered },
      ];

  const doneCount = steps.filter((s) => s.done).length;

  return (
    <DemoLayout title="Property Details" subtitle="Registration overview" icon={<Fingerprint className="w-5 h-5 text-primary" />} onLogout={onLogout}>
      <div className="px-4 py-4">
        <button onClick={() => navigate("/property-proof")} className="text-xs text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Back to My Property
        </button>

        {/* Hero card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden mb-4">
          <div className="aspect-[16/10] bg-muted">
            <img src={img} alt={title} className="w-full h-full object-cover" />
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <h2 className="text-base font-bold text-foreground leading-tight">{title}</h2>
                <p className="text-[10px] text-muted-foreground mt-0.5">{category}</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold flex-shrink-0 ${isDraft ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}>
                {isDraft ? <Circle className="w-2.5 h-2.5" /> : <ShieldCheck className="w-3 h-3" />}
                {isDraft ? "Incomplete" : "Protected"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full ${isDraft ? "bg-warning" : "bg-success"}`} style={{ width: `${score}%` }} />
              </div>
              <span className="text-[10px] font-semibold text-foreground">{score}/100</span>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1">Protection score · {doneCount} of {steps.length} steps complete</p>
          </div>
        </motion.div>

        {/* Details */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-4 mb-4">
          <h3 className="text-xs font-bold text-foreground mb-1">Property Information</h3>
          <div className="divide-y divide-border">
            <InfoRow icon={<Tag className="w-3.5 h-3.5" />} label="Category" value={category} />
            <InfoRow icon={<Hash className="w-3.5 h-3.5" />} label={record?.serialLabel || "Serial Number"} value={serial} />
            <InfoRow icon={<DollarSign className="w-3.5 h-3.5" />} label="Estimated Value" value={value} />
            <InfoRow icon={<Fingerprint className="w-3.5 h-3.5" />} label="DNA PIN" value={pin} />
            {record && (
              <>
                <InfoRow icon={<User className="w-3.5 h-3.5" />} label="Owner" value={record.owner} />
                <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={record.phone} />
                <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="County" value={record.county} />
                <InfoRow icon={<Calendar className="w-3.5 h-3.5" />} label="Registered" value={record.registeredAt ? new Date(record.registeredAt).toLocaleDateString() : "—"} />
              </>
            )}
          </div>
        </motion.div>

        {/* DNA locations */}
        {record && record.dnaLocations.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4 mb-4">
            <h3 className="text-xs font-bold text-foreground mb-2">DNA Placement</h3>
            <div className="space-y-1.5">
              {record.dnaLocations.map((loc, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${loc.applied ? "bg-success text-success-foreground" : "bg-warning/15 text-warning"}`}>
                    {loc.applied && <Check className="w-2.5 h-2.5" />}
                  </div>
                  <span className="text-foreground">{loc.label}</span>
                  <span className={`ml-auto text-[9px] ${loc.applied ? "text-success" : "text-warning"}`}>{loc.applied ? "Applied" : "Pending"}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Steps */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-4 mb-4">
          <h3 className="text-xs font-bold text-foreground mb-3">Registration Steps</h3>
          <div className="space-y-3">
            {steps.map((s, i) => (
              <StepRow key={s.label} step={s} index={i} />
            ))}
          </div>
        </motion.div>

        {/* Emily CTA for incomplete */}
        {isDraft && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4 border-2 border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <img src={emilyAvatar} alt="Emily AI assistant" className="w-12 h-12 rounded-full object-cover border border-border flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-foreground">Finish with Emily</div>
                <p className="text-[10px] text-muted-foreground">Emily will resume right where you left off.</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/emily")}
              className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Complete Registration with Emily
            </button>
          </motion.div>
        )}
      </div>
    </DemoLayout>
  );
};

export default PropertyDetail;

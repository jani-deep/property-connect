import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Camera,
  Check,
  Clock3,
  Fingerprint,
  Image as ImageIcon,
  Lock,
  MapPin,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { findByPin } from "@/lib/propertyRecord";
import { addLeSearchHistory, loadLeSearchHistory } from "@/lib/leSearchHistory";
import { maskPhone, maskPin, maskSerial } from "@/lib/mask";
import demoCar from "@/assets/demo-car.jpg";

type Stage = "camera" | "captured" | "reading" | "result";

interface Match {
  confidence: number;
  owner: string;
  phone: string;
  county: string;
  status: string;
  stolen: boolean;
  serial: string;
  serialLabel: string;
  item: string;
  img: string;
  pin: string;
  value: string;
  registeredAt: string;
  dna: { label: string; x: number; y: number; applied: boolean }[];
}

const demoMatch: Match = {
  confidence: 98,
  owner: "John Smith",
  phone: "+1 (555) 214-8890",
  county: "Brevard County",
  status: "Reported Stolen",
  stolen: true,
  serial: "WBA53BJ09RWC18294",
  serialLabel: "VIN",
  item: "BMW 5 Series 530i xDrive",
  img: demoCar,
  pin: "FL-DNA-3301-VK",
  value: "$62,400",
  registeredAt: "Mar 12, 2026",
  dna: [
    { label: "Driver door frame", x: 24, y: 55, applied: true },
    { label: "Windshield lower corner", x: 52, y: 38, applied: true },
    { label: "Rear bumper inner lip", x: 78, y: 68, applied: true },
  ],
};

const readSteps = [
  "Isolating microdot in the captured frame",
  "Reading encrypted PropertyProof PIN",
  "Checking the statewide registry",
  "Validating ownership record",
];

const LeSearch = () => {
  const [stage, setStage] = useState<Stage>("camera");
  const [photo, setPhoto] = useState<string | null>(null);
  const [camError, setCamError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [match, setMatch] = useState<Match>(demoMatch);
  const [revealPin, setRevealPin] = useState(false);
  const [recent, setRecent] = useState(() => loadLeSearchHistory().slice(0, 4));
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const startCamera = async () => {
    setCamError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setCamError(true);
    }
  };

  useEffect(() => {
    if (stage === "camera") void startCamera();
    return stopCamera;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const onPickFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      stopCamera();
      setPhoto(reader.result as string);
      setStage("captured");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const capture = () => {
    const video = videoRef.current;
    let dataUrl: string | null = null;
    if (video?.videoWidth) {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    }
    stopCamera();
    setPhoto(dataUrl);
    setStage("captured");
  };

  const readMicrodot = () => {
    setStage("reading");
    setProgress(0);
    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current < 100) return current + 4;
        window.clearInterval(interval);
        const live = findByPin(demoMatch.pin);
        const found = live
          ? {
              ...demoMatch,
              owner: live.owner || demoMatch.owner,
              phone: live.phone || demoMatch.phone,
              county: live.county || demoMatch.county,
              item: live.item || demoMatch.item,
              serial: live.serial || demoMatch.serial,
              serialLabel: live.serialLabel || demoMatch.serialLabel,
              img: live.img || demoMatch.img,
              value: live.value || demoMatch.value,
              dna: live.dnaLocations?.length ? live.dnaLocations : demoMatch.dna,
            }
          : demoMatch;
        setMatch(found);
        addLeSearchHistory({
          id: `scan-${Date.now()}`,
          item: found.item,
          serial: found.serial,
          pin: found.pin,
          county: found.county,
          status: found.stolen ? "Stolen" : "Clear",
          confidence: found.confidence,
          searchedAt: new Date().toISOString(),
          image: found.img,
        });
        setRecent(loadLeSearchHistory().slice(0, 4));
        window.setTimeout(() => setStage("result"), 250);
        return 100;
      });
    }, 45);
  };

  const reset = () => {
    setPhoto(null);
    setRevealPin(false);
    setProgress(0);
    setStage("camera");
  };

  return (
    <div className="w-full max-w-[1400px] px-8 py-7 font-body">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-primary">Officer workspace</p>
          <h1 className="font-heading text-2xl font-bold text-foreground">Scan & Search Recovered Property</h1>
          <p className="text-sm text-muted-foreground">Capture the microdot, validate its PIN, and review the matched ownership record.</p>
        </div>
        <Button variant="outline" asChild><Link to="/le/history"><Clock3 /> Search History</Link></Button>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_280px] gap-5">
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            {stage === "camera" && (
              <motion.section key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                <div className="flex h-11 items-center justify-between border-b border-border px-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground"><Camera className="h-4 w-4 text-primary" /> Live camera</div>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-success" /> Ready to capture</span>
                </div>
                <div className="bg-muted p-4">
                  <div className="relative h-52 overflow-hidden rounded-lg bg-foreground">
                    <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
                    <div className="pointer-events-none absolute inset-x-[28%] inset-y-8 rounded-md border-2 border-dashed border-primary/70" />
                    {camError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-foreground/90 px-8 text-center">
                        <div><AlertTriangle className="mx-auto mb-2 h-6 w-6 text-warning" /><p className="text-xs text-background">Camera unavailable. Upload a photo or use the simulated capture.</p></div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
                  <p className="text-xs text-muted-foreground">Center the PropertyProof marker inside the guide.</p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => fileRef.current?.click()}><ImageIcon /> Upload Photo</Button>
                    <Button variant="outline" size="icon" onClick={startCamera} aria-label="Retry camera"><RefreshCw /></Button>
                    <Button onClick={capture}><Camera /> Take Picture</Button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
                  </div>
                </div>
              </motion.section>
            )}

            {stage === "captured" && (
              <motion.section key="captured" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                <div className="flex h-11 items-center justify-between border-b border-border px-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-success"><Check className="h-4 w-4" /> Image captured · microdot found</div>
                  <Button variant="ghost" size="sm" onClick={reset}>Retake</Button>
                </div>
                <div className="bg-muted p-4">
                  <div className="relative h-56 overflow-hidden rounded-lg border border-border bg-card">
                    <img src={photo || demoCar} alt="Captured recovered property" className="h-full w-full object-cover" />
                    <div className="absolute left-[38%] top-[46%] h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent shadow-[0_0_0_6px_hsl(var(--accent)/0.14)]" />
                    <span className="absolute left-[38%] top-[61%] -translate-x-1/2 rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold text-accent-foreground">Microdot found</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
                  <p className="text-xs text-muted-foreground">The image is ready for registry validation.</p>
                  <Button onClick={readMicrodot}><ScanLine /> Read Microdot & Match</Button>
                </div>
              </motion.section>
            )}

            {stage === "reading" && (
              <motion.section key="reading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3"><div className="rounded-md bg-primary/10 p-2 text-primary"><ScanLine className="h-5 w-5 animate-pulse" /></div><div><h2 className="text-sm font-semibold text-foreground">Validating microdot</h2><p className="text-xs text-muted-foreground">Secure registry check in progress</p></div></div>
                <div className="grid grid-cols-2 gap-3">
                  {readSteps.map((label, index) => {
                    const done = progress >= (index + 1) * 22;
                    return <div key={label} className="flex items-center gap-2.5 rounded-md border border-border p-3 text-xs"><span className={`flex h-5 w-5 items-center justify-center rounded-full ${done ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}>{done && <Check className="h-3 w-3" />}</span><span className={done ? "text-foreground" : "text-muted-foreground"}>{label}</span></div>;
                  })}
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div>
              </motion.section>
            )}

            {stage === "result" && (
              <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <section className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/5 px-4 py-3">
                  <div className="rounded-md bg-success/10 p-2 text-success"><ShieldCheck className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-foreground">Verified PropertyProof match</p><p className="text-xs font-mono text-muted-foreground">{maskPin(match.pin)} · 1 exact registry record</p></div>
                  <Button variant="outline" onClick={reset}>New Scan</Button>
                </section>

                <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                  <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <div><p className="text-xs font-semibold uppercase text-muted-foreground">Matched property</p><h2 className="mt-1 font-heading text-xl font-bold text-foreground">{match.item}</h2></div>
                    <div className="flex items-center gap-3"><span className="font-heading text-2xl font-bold text-success">{match.confidence}%</span>{match.stolen && <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive"><AlertTriangle className="h-3.5 w-3.5" /> Reported stolen</span>}</div>
                  </div>

                  <div className="grid grid-cols-[300px_minmax(0,1fr)] gap-6 p-5">
                    <div>
                      <div className="relative h-48 overflow-hidden rounded-lg border border-border bg-muted">
                        <img src={match.img} alt={match.item} className="h-full w-full object-cover" />
                        {match.dna.filter((dot) => dot.applied).map((dot) => <span key={dot.label} className="absolute h-3 w-3 rounded-full border-2 border-card bg-accent shadow-md" style={{ left: `${dot.x}%`, top: `${dot.y}%` }} />)}
                      </div>
                      <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><Fingerprint className="h-3.5 w-3.5" /> {match.dna.length} recorded DNA placements</p>
                    </div>

                    <div className="min-w-0">
                      <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                        {[
                          ["Registered owner", match.owner],
                          ["Contact", maskPhone(match.phone)],
                          ["Florida county", match.county],
                          [match.serialLabel, maskSerial(match.serial)],
                          ["Declared value", match.value],
                          ["Registered", match.registeredAt],
                        ].map(([label, value]) => <div key={label}><p className="text-[10px] font-semibold uppercase text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold text-foreground">{value}</p></div>)}
                      </div>
                      <div className="mt-5 rounded-md border border-border bg-muted/40 p-4">
                        <div className="flex items-center justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase text-muted-foreground">DNA PIN</p><p className="mt-1 font-mono text-sm font-semibold text-primary">{revealPin ? match.pin : maskPin(match.pin)}</p></div><Button variant="outline" size="sm" onClick={() => setRevealPin((value) => !value)}><Lock /> {revealPin ? "Hide PIN" : "Reveal (audited)"}</Button></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 border-t border-border bg-muted/30 px-5 py-4">
                    {match.dna.map((dot, index) => <div key={dot.label} className="flex items-center gap-2 rounded-md bg-card px-3 py-2 text-xs text-foreground"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 font-semibold text-accent">{index + 1}</span>{dot.label}</div>)}
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside className="self-start overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-3"><h2 className="text-xs font-semibold uppercase text-muted-foreground">Recent searches</h2><Link to="/le/history" className="text-xs font-semibold text-primary hover:underline">View all</Link></div>
          <div className="divide-y divide-border">
            {recent.map((entry) => (
              <div key={entry.id} className="p-3 transition-colors hover:bg-muted/40">
                <div className="flex items-center gap-3"><img src={entry.image} alt="" className="h-10 w-12 rounded-md border border-border object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-foreground">{entry.item}</p><p className="mt-0.5 text-[10px] font-mono text-muted-foreground">{maskPin(entry.pin)}</p></div><span className={`h-2 w-2 rounded-full ${entry.status === "Stolen" ? "bg-destructive" : entry.status === "Clear" ? "bg-muted-foreground" : "bg-success"}`} /></div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground"><span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{entry.county}</span><span>{entry.confidence}%</span></div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default LeSearch;
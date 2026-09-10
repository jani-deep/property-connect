import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ScanLine, Check, Fingerprint, AlertTriangle, ShieldCheck, User, MapPin, RefreshCw, Lock, Image as ImageIcon } from "lucide-react";
import { findByPin, PropertyRecord } from "@/lib/propertyRecord";
import { maskPhone, maskSerial, maskPin } from "@/lib/mask";
import demoCar from "@/assets/demo-car.jpg";
import demoWatch from "@/assets/demo-watch.jpg";

type Stage = "camera" | "captured" | "reading" | "results" | "detail";

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

const demoMatches: Match[] = [
  {
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
  },
  {
    confidence: 71,
    owner: "Maria Garcia",
    phone: "+1 (555) 662-1174",
    county: "Orange County",
    status: "Not Reported",
    stolen: false,
    serial: "M7X9K2R7",
    serialLabel: "Serial",
    item: "Rolex Submariner (secondary microdot trace)",
    img: demoWatch,
    pin: "FL-DNA-7829-AX",
    value: "$14,200",
    registeredAt: "Jan 04, 2026",
    dna: [{ label: "Case back inner rim", x: 62, y: 48, applied: true }],
  },
];

const readSteps = [
  "Isolating microdot in captured frame",
  "Magnifying and de-mirroring etched PIN",
  "Encrypting PIN payload",
  "Querying PropertyProof registry",
  "Authorizing officer credentials",
];

const LeSearch = () => {
  const [stage, setStage] = useState<Stage>("camera");
  const [photo, setPhoto] = useState<string | null>(null);
  const [camError, setCamError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [matches, setMatches] = useState<Match[]>(demoMatches);
  const [selected, setSelected] = useState(0);
  const [revealPin, setRevealPin] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
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
    if (stage === "camera") startCamera();
    return stopCamera;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const capture = () => {
    const video = videoRef.current;
    let dataUrl: string | null = null;
    if (video && video.videoWidth) {
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
    const iv = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(iv);
          const live = findByPin("FL-DNA-3301-VK");
          setMatches([
            live
              ? {
                  ...demoMatches[0],
                  owner: live.owner || demoMatches[0].owner,
                  phone: live.phone || demoMatches[0].phone,
                  county: live.county || demoMatches[0].county,
                  item: live.item || demoMatches[0].item,
                  serial: live.serial || demoMatches[0].serial,
                  serialLabel: live.serialLabel || "Serial",
                  img: live.img || demoMatches[0].img,
                  value: live.value || demoMatches[0].value,
                  dna: live.dnaLocations?.length ? live.dnaLocations : demoMatches[0].dna,
                }
              : demoMatches[0],
          ]);
          setSelected(0);
          setTimeout(() => setStage("results"), 400);
          return 100;
        }
        return p + 2;
      });
    }, 35);
  };

  const reset = () => {
    setPhoto(null);
    setRevealPin(false);
    setStage("camera");
  };

  const conf = (c: number) => (c >= 90 ? "text-success" : c >= 50 ? "text-warning" : "text-muted-foreground");
  const confBar = (c: number) => (c >= 90 ? "bg-success" : c >= 50 ? "bg-warning" : "bg-muted-foreground");
  const m = matches[selected];

  return (
    <div className="px-8 py-7 max-w-[1100px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Scan & Search Recovered Property</h1>
        <p className="text-sm text-muted-foreground">
          Photograph the item — the PropertyProof microdot in the frame is read and matched against the statewide registry
        </p>
      </div>

      <AnimatePresence mode="wait">
        {stage === "camera" && (
          <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card p-5">
            <div className="flex items-center gap-2 text-primary mb-4">
              <Camera className="w-4 h-4" />
              <span className="text-xs font-semibold">Live Camera — align the marked area inside the frame</span>
            </div>
            <div className="relative rounded-xl overflow-hidden bg-foreground/90 aspect-video flex items-center justify-center">
              <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
              <div className="absolute inset-10 border-2 border-primary/60 rounded-xl pointer-events-none" />
              {camError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6 bg-foreground/80">
                  <AlertTriangle className="w-7 h-7 text-warning" />
                  <p className="text-xs text-background">Camera unavailable. You can still run a simulated capture for the demo.</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={capture}
                className="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" /> Take Picture
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="px-4 py-3 rounded-lg bg-muted text-foreground text-sm font-semibold flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4" /> Upload from Gallery
              </button>
              <button onClick={startCamera} className="px-4 py-3 rounded-lg bg-muted text-foreground text-sm font-semibold flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Retry Camera
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
            </div>
          </motion.div>
        )}

        {stage === "captured" && (
          <motion.div key="captured" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-5">
            <div className="flex items-center gap-2 text-success mb-4">
              <Check className="w-4 h-4" />
              <span className="text-xs font-semibold">Picture captured — microdot detected in frame</span>
            </div>
            <div className="relative rounded-xl overflow-hidden border border-border bg-muted">
              <img src={photo || demoCar} alt="Captured item" className="w-full max-h-[420px] object-cover" />
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute left-[38%] top-[46%] -translate-x-1/2 -translate-y-1/2"
              >
                <div className="w-16 h-16 rounded-full border-2 border-accent animate-pulse" />
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                  Microdot found
                </span>
              </motion.div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={readMicrodot}
                className="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <ScanLine className="w-4 h-4" /> Read Microdot & Match
              </button>
              <button onClick={reset} className="px-4 py-3 rounded-lg bg-muted text-foreground text-sm font-semibold">
                Retake
              </button>
            </div>
          </motion.div>
        )}

        {stage === "reading" && (
          <motion.div key="reading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card p-6 max-w-xl">
            <div className="flex items-center gap-2 text-primary mb-5">
              <ScanLine className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-semibold">Reading microdot…</span>
            </div>
            <div className="space-y-2.5 text-xs mb-5">
              {readSteps.map((label, i) => {
                const done = progress >= (i + 1) * 18;
                return (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${done ? "bg-success text-success-foreground" : "bg-muted"}`}>
                      {done && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span className={done ? "text-foreground" : "text-muted-foreground"}>{label}</span>
                  </div>
                );
              })}
            </div>
            <div className="match-bar">
              <div className="match-bar-fill bg-primary" style={{ width: `${progress}%` }} />
            </div>
          </motion.div>
        )}

        {stage === "results" && (
          <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="glass-card p-4 mb-4 flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                <img src={photo || demoCar} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-success" /> Microdot PIN validated by PropertyProof
                </div>
                <div className="text-[11px] text-muted-foreground font-mono">{maskPin(matches[0].pin)}</div>
              </div>
              <button onClick={reset} className="px-3 py-2 rounded-lg bg-muted text-xs font-semibold text-foreground">
                New Scan
              </button>
            </div>

            <div className="space-y-3">
              {matches.map((mm, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => { setSelected(i); setRevealPin(false); setStage("detail"); }}
                  className="w-full glass-card p-4 text-left hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img src={mm.img} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xl font-bold font-mono ${conf(mm.confidence)}`}>{mm.confidence}%</span>
                        <span className="text-xs font-medium text-foreground">{mm.item}</span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{mm.owner}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{mm.county}</span>
                        <span className="font-mono">{maskPhone(mm.phone)}</span>
                      </div>
                      <div className="match-bar mt-2">
                        <div className={`match-bar-fill ${confBar(mm.confidence)}`} style={{ width: `${mm.confidence}%` }} />
                      </div>
                    </div>
                    {mm.stolen && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-[11px] font-semibold flex-shrink-0">
                        <AlertTriangle className="w-3 h-3" /> Stolen
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {stage === "detail" && (
          <motion.div key="detail" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid lg:grid-cols-2 gap-5">
            <div>
              <button onClick={() => setStage("results")} className="text-xs text-muted-foreground hover:text-foreground mb-3">
                ← Back to matches
              </button>
              <div className="glass-card p-3">
                <div className="relative rounded-lg overflow-hidden">
                  <img src={m.img} alt={m.item} className="w-full" />
                  {m.dna.filter((d) => d.applied).map((d, i) => (
                    <div key={i} className="dna-marker active" style={{ left: `${d.x}%`, top: `${d.y}%`, transform: "translate(-50%, -50%)" }} />
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground mt-2 text-center">
                  <Fingerprint className="w-3 h-3 inline mr-1" /> Recorded DNA placement locations
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-3xl font-bold font-mono ${conf(m.confidence)}`}>{m.confidence}%</span>
                  <span className="text-xs text-muted-foreground">match confidence</span>
                </div>
                {m.stolen && (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" /> This item has been reported stolen
                  </div>
                )}
              </div>

              <div className="glass-card p-5 space-y-2.5">
                <h3 className="text-sm font-semibold text-foreground mb-2">Verified Owner Record</h3>
                {[
                  ["Owner", m.owner],
                  ["Contact", maskPhone(m.phone)],
                  ["County", m.county],
                  ["Item", m.item],
                  [m.serialLabel, maskSerial(m.serial)],
                  ["DNA PIN", revealPin ? m.pin : maskPin(m.pin)],
                  ["Declared Value", m.value],
                  ["Registered", m.registeredAt],
                  ["Registry Status", m.status],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between gap-4 text-xs">
                    <span className="text-muted-foreground flex-shrink-0">{label}</span>
                    <span className="text-foreground font-mono font-medium text-right break-all">{val}</span>
                  </div>
                ))}
                <button
                  onClick={() => setRevealPin(!revealPin)}
                  className="w-full mt-3 px-4 py-2.5 rounded-lg bg-muted text-foreground text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" /> {revealPin ? "Hide full DNA PIN" : "Reveal full DNA PIN (audited)"}
                </button>
                <p className="text-[10px] text-muted-foreground text-center">
                  Contact numbers and serials stay masked; every reveal is logged against the officer badge.
                </p>
              </div>

              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">DNA Placement Locations</h3>
                <div className="space-y-2">
                  {m.dna.map((d, i) => (
                    <div key={d.label} className="flex items-center gap-2.5 text-xs">
                      <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${d.applied ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                        {i + 1}
                      </span>
                      <span className="text-foreground flex-1">{d.label}</span>
                      <span className="text-[10px] text-muted-foreground">{d.applied ? "Applied" : "Not applied"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeSearch;

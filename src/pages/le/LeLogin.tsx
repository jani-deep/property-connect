import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, ArrowRight, Lock, CheckCircle2, Clock3, Mail } from "lucide-react";
import { LE_ROLES, loadOfficer, saveOfficer } from "@/lib/leData";
import { Field, inputCls } from "@/components/le/LePage";

type Mode = "login" | "register" | "thanks" | "pending" | "forgot" | "forgotSent";
const PENDING_KEY = "propertyproof.le.pending";
const counties = ["Miami-Dade County", "Broward County", "Palm Beach County", "Hillsborough County", "Orange County", "Brevard County"];

const LeLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [reg, setReg] = useState({ name: "", badge: "", email: "", phone: "", agency: "", county: counties[4], role: LE_ROLES[0], password: "" });
  const pending = (() => { try { return JSON.parse(localStorage.getItem(PENDING_KEY) || "null"); } catch { return null; } })();

  const login = () => {
    if (!/\S+@\S+\.\S+/.test(email) || password.length < 4) return setError("Enter a valid email and password.");
    if (pending && pending.email === email) return setMode("pending");
    saveOfficer({ ...loadOfficer(), email });
    onLogin();
  };

  const register = () => {
    if (!reg.name || !reg.badge || !/\S+@\S+\.\S+/.test(reg.email) || !reg.agency || reg.password.length < 6) return setError("Please fill in every field (password min. 6 characters).");
    localStorage.setItem(PENDING_KEY, JSON.stringify({ ...reg, password: undefined, submittedAt: new Date().toISOString() }));
    setError("");
    setMode("thanks");
  };

  const btn = "w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2";
  const link = "text-sm font-semibold text-primary hover:underline";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-10 relative font-body">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] opacity-40 pointer-events-none" style={{ background: "var(--gradient-glow)" }} />
      <motion.div key={mode} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={`w-full ${mode === "register" ? "max-w-2xl" : "max-w-md"} relative`}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center"><Shield className="w-8 h-8 text-primary" /></div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1 font-heading"><span className="gradient-text">PropertyProof</span><span className="text-foreground">™</span></h1>
          <p className="text-sm text-muted-foreground">Law Enforcement Console — Florida</p>
        </div>

        <div className="glass-card p-6">
          {mode === "login" && (
            <div className="space-y-4">
              <Field label="Official email address"><input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@agency.gov" /></Field>
              <Field label="Password"><input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} placeholder="••••••••" /></Field>
              <div className="text-right"><button className={link} onClick={() => { setError(""); setMode("forgot"); }}>Forgot password?</button></div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <button onClick={login} className={btn}><Lock className="w-4 h-4" /> Login</button>
              <p className="text-xs text-muted-foreground text-center">Demo: any email and password works.</p>
              <p className="text-sm text-center text-muted-foreground">New to the console? <button className={link} onClick={() => { setError(""); setMode("register"); }}>Register now</button></p>
            </div>
          )}

          {mode === "register" && (
            <div>
              <h2 className="font-heading text-lg font-bold mb-4">Request officer access</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name"><input className={inputCls} value={reg.name} onChange={(e) => setReg({ ...reg, name: e.target.value })} /></Field>
                <Field label="Badge number"><input className={inputCls} value={reg.badge} onChange={(e) => setReg({ ...reg, badge: e.target.value })} /></Field>
                <Field label="Official email"><input className={inputCls} type="email" value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} /></Field>
                <Field label="Office phone"><input className={inputCls} value={reg.phone} onChange={(e) => setReg({ ...reg, phone: e.target.value })} /></Field>
                <Field label="Agency"><input className={inputCls} value={reg.agency} onChange={(e) => setReg({ ...reg, agency: e.target.value })} placeholder="e.g. Orange County Sheriff's Office" /></Field>
                <Field label="County"><select className={inputCls} value={reg.county} onChange={(e) => setReg({ ...reg, county: e.target.value })}>{counties.map((c) => <option key={c}>{c}</option>)}</select></Field>
                <Field label="Role"><select className={inputCls} value={reg.role} onChange={(e) => setReg({ ...reg, role: e.target.value as typeof reg.role })}>{LE_ROLES.map((r) => <option key={r}>{r}</option>)}</select></Field>
                <Field label="Password"><input className={inputCls} type="password" value={reg.password} onChange={(e) => setReg({ ...reg, password: e.target.value })} /></Field>
              </div>
              {error && <p className="text-xs text-destructive mt-3">{error}</p>}
              <button onClick={register} className={`${btn} mt-5`}>Submit for approval <ArrowRight className="w-4 h-4" /></button>
              <p className="text-sm text-center text-muted-foreground mt-3">Already registered? <button className={link} onClick={() => setMode("login")}>Login</button></p>
            </div>
          )}

          {mode === "thanks" && (
            <div className="text-center">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
              <h2 className="font-heading text-lg font-bold">Account created successfully</h2>
              <p className="text-sm text-muted-foreground mt-2">Thank you for registering. Your agency administrator will review your request. You'll receive an email once your access is approved.</p>
              <button onClick={() => setMode("pending")} className={`${btn} mt-5`}>View request status</button>
            </div>
          )}

          {mode === "pending" && (
            <div>
              <div className="flex items-center gap-3 rounded-lg bg-warning/10 p-3 mb-4">
                <Clock3 className="w-5 h-5 text-warning" />
                <div><p className="text-sm font-semibold">Your request is under review</p><p className="text-xs text-muted-foreground">Estimated review time: 1–2 business days</p></div>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {[["Name", pending?.name], ["Badge", pending?.badge], ["Agency", pending?.agency], ["County", pending?.county], ["Role", pending?.role], ["Email", pending?.email]].map(([k, v]) => (
                  <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-medium truncate">{v || "—"}</dd></div>
                ))}
              </dl>
              <button onClick={() => { localStorage.removeItem(PENDING_KEY); setMode("login"); }} className={`${btn} mt-5`}>Simulate approval & login</button>
              <button onClick={() => setMode("login")} className="w-full mt-2 text-sm text-muted-foreground hover:text-foreground">Back to login</button>
            </div>
          )}

          {mode === "forgot" && (
            <div className="space-y-4">
              <h2 className="font-heading text-lg font-bold">Forgot password</h2>
              <p className="text-sm text-muted-foreground">Enter your email and we'll send a verification link to reset your password.</p>
              <Field label="Email address"><input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <button onClick={() => (/\S+@\S+\.\S+/.test(email) ? setMode("forgotSent") : setError("Enter a valid email."))} className={btn}>Send reset link</button>
              <button onClick={() => setMode("login")} className="w-full text-sm text-muted-foreground hover:text-foreground">Back to login</button>
            </div>
          )}

          {mode === "forgotSent" && (
            <div className="text-center">
              <Mail className="w-12 h-12 text-primary mx-auto mb-3" />
              <h2 className="font-heading text-lg font-bold">Check your inbox</h2>
              <p className="text-sm text-muted-foreground mt-2">A password reset link was sent to {email}.</p>
              <button onClick={() => setMode("login")} className={`${btn} mt-5`}>Back to login</button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LeLogin;

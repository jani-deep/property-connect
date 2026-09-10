import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, ArrowRight, Lock } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const LeLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-10 relative">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] opacity-40 pointer-events-none"
        style={{ background: "var(--gradient-glow)" }}
      />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">
            <span className="gradient-text">PropertyProof</span>
            <span className="text-foreground">™</span>
          </h1>
          <p className="text-sm text-muted-foreground">Law Enforcement Panel — Florida</p>
        </div>

        <div className="glass-card p-6">
          {step === "phone" ? (
            <>
              <label className="text-sm font-medium text-foreground mb-2 block">Officer Mobile Number</label>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-muted-foreground font-mono bg-muted px-3 py-2.5 rounded-lg">+1</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="Enter any mobile number"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              {error && <p className="text-xs text-destructive mb-3">{error}</p>}
              <button
                onClick={() => (phone.length < 10 ? setError("Please enter a valid mobile number") : (setError(""), setStep("otp")))}
                className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                Send OTP <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-xs text-muted-foreground text-center mt-3">Any mobile number works for this demo</p>
            </>
          ) : (
            <>
              <button onClick={() => { setStep("phone"); setOtp(""); setError(""); }} className="text-sm text-muted-foreground hover:text-foreground mb-4">
                ← Change number
              </button>
              <p className="text-sm text-foreground mb-1">Enter OTP sent to +1 {phone}</p>
              <p className="text-xs text-muted-foreground mb-4">💡 <span className="font-semibold text-primary">Hint: OTP is 1111</span></p>
              <div className="flex justify-center mb-4">
                <InputOTP maxLength={4} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {error && <p className="text-xs text-destructive mb-3 text-center">{error}</p>}
              <button
                onClick={() => (otp === "1111" ? onLogin() : setError("Invalid OTP. Hint: Use 1111"))}
                disabled={otp.length < 4}
                className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" /> Secure Sign In
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LeLogin;

import { motion } from "framer-motion";
import { Shield, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const sections = [
  {
    title: "1. Overview",
    body: [
      "PropertyProof™ is a property documentation and ownership-verification platform that helps residents create a verifiable, date-stamped record of their valuable property, and assists law enforcement in identifying recovered property. This Privacy Policy explains what information we collect, how we use it, and the choices available to you.",
      "This demo build is presented for the Florida legislative demonstration. In the demonstration, sample records are stored only in your browser session and are not transmitted to any external system.",
    ],
  },
  {
    title: "2. Information We Collect",
    body: [
      "Account details — your mobile number, used to verify your identity at sign-in.",
      "Property details — descriptions, images, category, identifiers (serial numbers, VINs, IMEIs), estimated value, and county you provide when registering an asset.",
      "DNA tag data — the location where you applied your PropertyProof DNA marker, and the resulting DNA PIN linked to that asset.",
      "Communications — your conversations with Emily, the PropertyProof AI assistant, used to guide you through registration.",
      "Law enforcement use — officers may search DNA PINs, serial numbers and images. Search activity is audit-logged with officer identity, time and reason.",
    ],
  },
  {
    title: "3. How We Use Your Information",
    body: [
      "To create and maintain your property inventory and ownership proof.",
      "To match recovered property against registered records when law enforcement conducts a search.",
      "To provide AI-assisted guidance (Emily) during registration.",
      "To maintain an auditable trail of law enforcement lookups and any personally identifying detail reveal, consistent with chain-of-custody requirements.",
    ],
  },
  {
    title: "4. Legal Basis & Law Enforcement Access",
    body: [
      "Owner contact details are never displayed to law enforcement officers by default. Personally identifying information is masked in all search results and is revealed only after a documented reason and case number are recorded, and only through the governed reveal workflow.",
      "Access by law enforcement is limited to verified officers of registered Florida agencies and is subject to the audit and approval controls described in the platform's governance model.",
    ],
  },
  {
    title: "5. Data Retention",
    body: [
      "Property records are retained for as long as your account is active, or as required to support ownership verification and law enforcement matching. Audit logs of searches and reveals are retained per applicable records-retention schedules.",
      "You may request deletion of your account and associated records at any time, subject to legal retention obligations.",
    ],
  },
  {
    title: "6. Sharing of Information",
    body: [
      "We do not sell your personal information. Information is shared only with verified law enforcement users through the governed workflows described above, and with service providers that support platform operation under contractual confidentiality obligations.",
    ],
  },
  {
    title: "7. Security",
    body: [
      "PropertyProof uses encryption in transit and at rest, role-based access control, and audit logging to protect your information. DNA PINs are stored as privacy-preserving references rather than raw markers.",
    ],
  },
  {
    title: "8. Your Rights & Contact",
    body: [
      "You may review, correct, export, or delete your property records through the My Property section, or by contacting our support team. For privacy questions, contact privacy@propertyproof.app.",
    ],
  },
];

const Privacy = () => (
  <div className="min-h-screen bg-background">
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="gradient-text">Privacy</span> Policy
        </h1>
      </div>
      <p className="text-xs text-muted-foreground mb-8">PropertyProof™ · Last updated: October 2026</p>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {sections.map((s) => (
          <div key={s.title} className="glass-card p-5">
            <h2 className="font-heading font-bold text-base mb-2">{s.title}</h2>
            {s.body.map((p, i) => (
              <p key={i} className="text-sm text-muted-foreground leading-relaxed mb-2 last:mb-0">{p}</p>
            ))}
          </div>
        ))}
        <p className="text-xs text-muted-foreground text-center pt-2">
          Also review our <Link to="/terms" className="text-primary font-semibold hover:underline">Terms & Conditions</Link>.
        </p>
      </motion.div>
    </div>
  </div>
);

export default Privacy;

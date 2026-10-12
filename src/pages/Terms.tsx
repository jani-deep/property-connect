import { motion } from "framer-motion";
import { ScrollText, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: [
      "By accessing or using PropertyProof™ (the \"Platform\"), including the resident mobile application and the Law Enforcement Console, you agree to these Terms & Conditions. If you do not agree, do not use the Platform.",
    ],
  },
  {
    title: "2. The Platform",
    body: [
      "PropertyProof provides three connected capabilities: (a) resident-side AI-assisted property registration and DNA tag placement, (b) law enforcement field search and identity verification of recovered property, and (c) integration with Florida property rooms for statewide recovered-property intelligence.",
      "PropertyProof does not replace existing law enforcement records management systems; it complements them with a verified ownership layer.",
    ],
  },
  {
    title: "3. Resident Accounts",
    body: [
      "Residents verify their identity with a mobile number. You are responsible for the accuracy of the property details, images and identifiers you submit, and for keeping your account secure.",
      "You may register only property that you own or are authorized to document. Submitting property you do not own, or false identifiers, is a violation of these Terms and may be reported.",
    ],
  },
  {
    title: "4. Law Enforcement Use",
    body: [
      "Access to the Law Enforcement Console is limited to verified officers approved by their agency administrator. Officers must provide a documented reason and case number to reveal personally identifying owner information.",
      "Every search and reveal is audit-logged. Sensitive categories require supervisor approval before reveal. Misuse of the Console may result in suspension of access and further action under applicable law.",
    ],
  },
  {
    title: "5. DNA Tags & PINs",
    body: [
      "DNA tags are applied by the owner to a location of their choosing on the registered asset. The resulting DNA PIN is the primary lookup reference for verification. PropertyProof does not warrant recovery of any specific item; it provides documentation and matching tools only.",
    ],
  },
  {
    title: "6. Intellectual Property",
    body: [
      "The PropertyProof name, logo, software, and content are owned by PropertyProof and its licensors. You may not copy, modify, or redistribute any part of the Platform without written permission.",
    ],
  },
  {
    title: "7. Disclaimer of Warranties",
    body: [
      "The Platform is provided \"as is\" and \"as available\" without warranties of any kind, express or implied, including fitness for a particular purpose. PropertyProof does not guarantee that any registered item will be recovered, identified, or returned.",
    ],
  },
  {
    title: "8. Limitation of Liability",
    body: [
      "To the maximum extent permitted by law, PropertyProof shall not be liable for indirect, incidental, special, consequential, or punitive damages, or for any loss of property, profits, or data arising from your use of the Platform.",
    ],
  },
  {
    title: "9. Governing Law",
    body: [
      "These Terms are governed by the laws of the State of Florida and applicable United States federal law. Any disputes shall be resolved in the courts of competent jurisdiction in Florida.",
    ],
  },
  {
    title: "10. Changes to These Terms",
    body: [
      "We may update these Terms from time to time. Material changes will be communicated through the Platform. Continued use after an update constitutes acceptance of the revised Terms.",
    ],
  },
];

const Terms = () => (
  <div className="min-h-screen bg-background">
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <ScrollText className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="gradient-text">Terms</span> & Conditions
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
          Also review our <Link to="/privacy" className="text-primary font-semibold hover:underline">Privacy Policy</Link>.
        </p>
      </motion.div>
    </div>
  </div>
);

export default Terms;

import { Bot, Camera, FileText, Search, FolderOpen } from "lucide-react";
import { LePage, Card } from "@/components/le/LePage";

const steps = [
  { icon: Camera, label: "Officer captures image" },
  { icon: Search, label: "David identifies the item" },
  { icon: FileText, label: "Match & evidence summary" },
  { icon: FolderOpen, label: "Case created automatically" },
];

const LeDavid = () => (
  <LePage eyebrow="Coming soon" title="David Operations" subtitle="David, the AI investigator, will automate the path from clicking a photo to opening a case.">
    <Card className="p-6">
      <div className="mb-6 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10"><Bot className="h-6 w-6 text-primary" /></div><span className="rounded-full bg-warning/15 px-2.5 py-1 text-xs font-semibold text-warning">Future release</span></div>
      <div className="grid gap-4 sm:grid-cols-4">
        {steps.map((s, i) => (
          <div key={s.label} className="rounded-lg bg-muted/50 p-4 text-center">
            <s.icon className="mx-auto h-6 w-6 text-primary" />
            <p className="mt-2 text-xs font-semibold text-muted-foreground">Step {i + 1}</p>
            <p className="text-sm font-medium">{s.label}</p>
          </div>
        ))}
      </div>
    </Card>
  </LePage>
);

export default LeDavid;

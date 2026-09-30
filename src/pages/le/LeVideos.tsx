import { PlayCircle } from "lucide-react";
import { LePage, Card } from "@/components/le/LePage";
import demoCar from "@/assets/demo-car.jpg";
import demoWatch from "@/assets/demo-watch.jpg";
import demoLaptop from "@/assets/demo-laptop.jpg";
import rack from "@/assets/evidence-rack.jpg";

const videos = [
  { title: "Reading a DNA microdot in the field", len: "4:12", img: demoWatch, tag: "Training" },
  { title: "Running an exact PIN / VIN search", len: "2:48", img: demoCar, tag: "How-to" },
  { title: "Requesting a governed owner reveal", len: "3:30", img: demoLaptop, tag: "Policy" },
  { title: "Property room intake with PropertyProof", len: "6:05", img: rack, tag: "Training" },
];

const LeVideos = () => (
  <LePage eyebrow="Resources" title="Videos" subtitle="Training and policy videos published by your administrator.">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {videos.map((v) => (
        <Card key={v.title} className="overflow-hidden">
          <div className="relative aspect-video">
            <img src={v.img} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/30"><PlayCircle className="h-12 w-12 text-primary-foreground" /></div>
            <span className="absolute bottom-2 right-2 rounded bg-foreground/70 px-1.5 py-0.5 text-[10px] text-primary-foreground">{v.len}</span>
          </div>
          <div className="p-4"><span className="text-[10px] font-semibold uppercase text-primary">{v.tag}</span><p className="mt-1 text-sm font-semibold">{v.title}</p></div>
        </Card>
      ))}
    </div>
  </LePage>
);

export default LeVideos;

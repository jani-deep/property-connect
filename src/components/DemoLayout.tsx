import MobileHeader from "@/components/MobileHeader";
import BottomNav from "@/components/BottomNav";

interface DemoLayoutProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onLogout?: () => void;
}

const DemoLayout = ({ title, subtitle, icon, children, onLogout }: DemoLayoutProps) => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title={title} subtitle={subtitle} icon={icon} onLogout={onLogout} />
      <main>{children}</main>
      <BottomNav />
    </div>
  );
};

export default DemoLayout;

import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface DemoLayoutProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  accentColor?: string;
}

const DemoLayout = ({ title, subtitle, icon, children }: DemoLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center gap-4 px-6 py-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Hub</span>
          </Link>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default DemoLayout;

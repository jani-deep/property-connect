import { useState, useRef, useEffect } from "react";
import { User, LogOut, ChevronDown } from "lucide-react";

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onLogout?: () => void;
}

const MobileHeader = ({ title, subtitle, icon, onLogout }: MobileHeaderProps) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-foreground truncate">{title}</h1>
            {subtitle && <p className="text-[10px] text-muted-foreground truncate">{subtitle}</p>}
          </div>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-primary" />
            </div>
            <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${profileOpen ? "rotate-180" : ""}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 glass-card py-1.5 z-50 animate-fade-in">
              <div className="px-4 py-2.5 border-b border-border/50">
                <div className="text-sm font-semibold text-foreground">Demo User</div>
                <div className="text-xs text-muted-foreground">+1 (555) 000-0000</div>
              </div>
              {onLogout && (
                <button
                  onClick={() => { setProfileOpen(false); onLogout(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;

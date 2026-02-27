import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, User, LogOut, ChevronDown } from "lucide-react";

interface DemoLayoutProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onLogout?: () => void;
}

const DemoLayout = ({ title, subtitle, icon, children, onLogout }: DemoLayoutProps) => {
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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Back to Hub</span>
            </Link>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className="flex-shrink-0">{icon}</span>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-semibold text-foreground truncate">{title}</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">{subtitle}</p>
              </div>
            </div>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground hidden sm:inline">Demo User</span>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 glass-card py-1.5 z-50 animate-fade-in">
                <div className="px-4 py-3 border-b border-border/50">
                  <div className="text-sm font-semibold text-foreground">Demo User</div>
                  <div className="text-xs text-muted-foreground">+1 (555) 000-0000</div>
                </div>
                <Link
                  to="/"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                  onClick={() => setProfileOpen(false)}
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  My Profile
                </Link>
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
      <main>{children}</main>
    </div>
  );
};

export default DemoLayout;

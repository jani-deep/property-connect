import { Link, useLocation } from "react-router-dom";
import { Shield, LayoutDashboard, ScanLine, LogOut, User } from "lucide-react";

const links = [
  { to: "/le", label: "Dashboard", icon: LayoutDashboard },
  { to: "/le/search", label: "Scan & Search", icon: ScanLine },
];

const LePanelLayout = ({ children, onLogout }: { children: React.ReactNode; onLogout?: () => void }) => {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-60 flex-shrink-0 border-r border-border bg-card/60 backdrop-blur-xl flex flex-col">
        <div className="px-5 py-5 border-b border-border flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold">
              <span className="gradient-text">PropertyProof</span>
              <span className="text-foreground">™</span>
            </div>
            <div className="text-[10px] text-muted-foreground">Law Enforcement Panel</div>
          </div>
        </div>
        <nav className="p-3 space-y-1 flex-1">
          {links.map((l) => {
            const active = pathname === l.to;
            const Icon = l.icon;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-foreground truncate">Officer Demo</div>
              <div className="text-[10px] text-muted-foreground font-mono">Badge •••• 4417</div>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/5 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          )}
        </div>
      </aside>
      <main className="flex-1 min-w-0 overflow-x-hidden">{children}</main>
    </div>
  );
};

export default LePanelLayout;

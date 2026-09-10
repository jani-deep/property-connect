import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, LayoutDashboard, ScanLine, LogOut, User, History, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/le", label: "Dashboard", icon: LayoutDashboard },
  { to: "/le/search", label: "Scan & Search", icon: ScanLine },
  { to: "/le/history", label: "Search History", icon: History },
];

const LePanelLayout = ({ children, onLogout }: { children: React.ReactNode; onLogout?: () => void }) => {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background font-body">
      <aside className={`${collapsed ? "w-16" : "w-60"} sticky top-0 h-screen flex-shrink-0 border-r border-border bg-card flex flex-col transition-[width] duration-200`}>
        <div className={`border-b border-border flex items-center ${collapsed ? "justify-center px-2 py-5" : "px-5 py-5 gap-2.5"}`}>
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div className={`leading-tight ${collapsed ? "hidden" : "block"}`}>
            <div className="text-sm font-bold">
              <span className="gradient-text">PropertyProof</span>
              <span className="text-foreground">™</span>
            </div>
            <div className="text-[10px] text-muted-foreground">Law Enforcement Panel</div>
          </div>
        </div>
        <nav className="p-2.5 space-y-1 flex-1">
          {links.map((l) => {
            const active = pathname === l.to;
            const Icon = l.icon;
            return (
              <Link
                key={l.to}
                to={l.to}
                title={collapsed ? l.label : undefined}
                className={`flex items-center ${collapsed ? "justify-center" : "gap-2.5"} px-3 py-2.5 rounded-md text-sm transition-colors ${
                  active ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4" />
                {!collapsed && l.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2.5"} px-2 py-2 mb-1`}>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className={`min-w-0 ${collapsed ? "hidden" : "block"}`}>
              <div className="text-xs font-semibold text-foreground truncate">Officer Demo</div>
              <div className="text-[10px] text-muted-foreground font-mono">Badge •••• 4417</div>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title={collapsed ? "Sign out" : undefined}
              className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-2.5"} px-3 py-2.5 rounded-md text-sm text-destructive hover:bg-destructive/5 transition-colors`}
            >
              <LogOut className="w-4 h-4" /> {!collapsed && "Sign out"}
            </button>
          )}
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-card/95 px-5 backdrop-blur">
          <Button variant="ghost" size="icon" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}>
            {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          </Button>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-success" /> Registry online
          </div>
        </header>
        <main className="min-w-0 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
};

export default LePanelLayout;

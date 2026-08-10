import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FolderOpen, FileText, Users, Settings, Mail,
  LogOut, Menu, X, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/files", label: "File Manager", icon: FileText },
  { to: "/admin/projects", label: "Projects", icon: FolderOpen },
  { to: "/admin/visitors", label: "Visitors", icon: Users },
  { to: "/admin/messages", label: "Messages", icon: Mail },
  { to: "/admin/profile", label: "Profile", icon: Settings },
];

export default function AdminLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="lg:hidden sticky top-16 z-40 glass-strong border-b border-border px-4 py-3 flex items-center justify-between">
        <span className="font-display font-semibold">Dashboard</span>
        <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed lg:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-border bg-card/30 backdrop-blur-xl transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <nav className="p-4 space-y-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="absolute bottom-0 inset-x-0 p-4 border-t border-border space-y-1">
            <a href="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <ExternalLink className="h-4 w-4" /> View site
            </a>
            <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {open && <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}

        {/* Main content */}
        <div className="flex-1 min-w-0 p-4 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

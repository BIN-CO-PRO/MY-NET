import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, FolderOpen, Files, Settings, LogOut, Menu, X, ExternalLink, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/files", label: "File Manager", icon: Files, end: false },
  { to: "/admin/projects", label: "Projects", icon: FolderOpen, end: false },
  { to: "/admin/visitors", label: "Visitors", icon: Users, end: false },
  { to: "/admin/profile", label: "Profile", icon: Settings, end: false },
];

export function AdminLayout() {
  const { signOut, session } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-border bg-card">
        <SidebarContent onSignOut={handleSignOut} email={session?.user?.email} />
      </aside>

      {/* Sidebar - mobile */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 flex flex-col border-r border-border bg-card animate-fade-in">
            <SidebarContent onSignOut={handleSignOut} email={session?.user?.email} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Top bar (mobile) */}
      <header className="lg:hidden sticky top-0 z-30 glass border-b border-border/60">
        <div className="flex h-14 items-center justify-between px-4">
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu />
          </Button>
          <span className="font-display font-semibold">Admin</span>
          <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
            <LogOut />
          </Button>
        </div>
      </header>

      <div className="lg:pl-64">
        <main className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  onSignOut,
  email,
  onNavigate,
}: {
  onSignOut: () => void;
  email?: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex h-16 items-center justify-between px-5 border-b border-border">
        <Link to="/admin" className="flex items-center gap-2.5">
          <img
            src="/assets/images/bin-logo_(1).png"
            alt="BIN Logo"
            className="h-9 w-9 rounded-lg object-cover shadow-sm"
          />
          <span className="font-display text-sm font-semibold">BIN Admin</span>
        </Link>
        {onNavigate && (
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onNavigate}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-border space-y-1">
        <Link
          to="/"
          target="_blank"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ExternalLink className="h-4 w-4" /> View site
        </Link>
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
        {email && (
          <p className="px-3 pt-2 text-xs text-muted-foreground truncate">{email}</p>
        )}
      </div>
    </>
  );
}

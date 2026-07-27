import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Moon, Sun, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { SocialIcons } from "./social-icons";
import { useProfile } from "@/lib/use-profile";
import { cn } from "@/lib/utils";

const PUBLIC_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/projects", label: "Projects" },
  { to: "/files", label: "Files" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggle } = useTheme();
  const { session, signOut } = useAuth();
  const { profile } = useProfile();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled ? "glass border-b border-border/60" : "bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent font-display text-base font-bold text-primary-foreground shadow-md shadow-primary/30 transition-transform group-hover:scale-105">
            B
          </span>
          <span className="font-display text-base font-semibold tracking-tight">
            Bizimana<span className="text-primary">.</span>
            <span className="text-muted-foreground font-normal hidden sm:inline">Idea Nexus</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {PUBLIC_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <SocialIcons links={profile?.social_links} size={16} />
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>
          {session ? (
            <>
              <Button asChild variant="outline" size="sm">
                <Link to="/admin"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
                <LogOut />
              </Button>
            </>
          ) : (
            <Button asChild variant="default" size="sm">
              <Link to="/login">Admin Login</Link>
            </Button>
          )}
        </div>

        <div className="flex md:hidden items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 glass animate-fade-in">
          <nav className="container py-4 flex flex-col gap-1">
            {PUBLIC_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <SocialIcons links={profile?.social_links} size={16} />
              {session ? (
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/admin"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={signOut}>
                    <LogOut className="h-4 w-4" /> Sign out
                  </Button>
                </div>
              ) : (
                <Button asChild size="sm">
                  <Link to="/login">Admin Login</Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Moon, Sun, LogOut, LayoutDashboard } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SocialIcons } from "@/components/social-icons";
import { useProfile } from "@/lib/use-profile";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const LOGO_URL = "/assets/images/bin-logo_(1).png";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/projects", label: "Projects" },
  { to: "/files", label: "Files" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const { profile } = useProfile();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled ? "glass-strong shadow-sm" : "bg-transparent"
      )}
    >
      <nav className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            <img src={LOGO_URL} alt="BIN Logo" className="relative h-9 w-9 rounded-lg object-contain" />
          </div>
          <span className="font-display text-base font-semibold hidden sm:block">
            Bizimana<span className="text-primary">.</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l, i) => (
            <motion.div
              key={l.to}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <NavLink
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors relative",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )
                }
              >
                {l.label}
              </NavLink>
            </motion.div>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <SocialIcons links={profile?.social_links} className="hidden lg:flex" size={16} />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDark(!dark)}
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                <Link to="/admin"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { signOut(); navigate("/"); }}
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : null}

          {/* Mobile menu toggle */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden glass-strong border-t border-border overflow-hidden"
          >
            <div className="container py-4 space-y-1">
              {NAV_LINKS.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <NavLink
                    to={l.to}
                    end={l.to === "/"}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )
                    }
                  >
                    {l.label}
                  </NavLink>
                </motion.div>
              ))}
              {user && (
                <NavLink to="/admin" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10">
                  Dashboard
                </NavLink>
              )}
              <div className="pt-3 border-t border-border">
                <SocialIcons links={profile?.social_links} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

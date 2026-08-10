import { Link } from "react-router-dom";
import { Mail, MapPin, ArrowUp } from "lucide-react";
import { SocialIcons } from "./social-icons";
import { useProfile } from "@/lib/use-profile";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/projects", label: "Projects" },
  { to: "/files", label: "Files" },
  { to: "/contact", label: "Contact" },
];

export function Footer() {
  const { profile } = useProfile();
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border bg-card/30">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img src="/assets/images/bin-logo_(1).png" alt="BIN Logo" className="h-10 w-10 rounded-lg object-contain" />
              <span className="font-display text-base font-semibold">
                Bizimana<span className="text-primary">.</span> Idea Nexus
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Multidisciplinary Technologist exploring the intersection of AI, electric mobility,
              and digital fabrication — building useful things from Kigali, Rwanda.
            </p>
            <SocialIcons links={profile?.social_links} className="pt-1" />
          </div>

          <div className="md:col-span-3">
            <h4 className="font-display text-sm font-semibold mb-4">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              {NAV.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5 group">
                    <span className="h-px w-0 bg-primary transition-all duration-300 group-hover:w-4" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h4 className="font-display text-sm font-semibold mb-4">Get in touch</h4>
            {profile?.email && (
              <a href={`mailto:${profile.email}`} className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors group">
                <Mail className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                {profile.email}
              </a>
            )}
            {profile?.location && (
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                {profile.location}
              </div>
            )}
            <Button variant="outline" size="sm" className="mt-4 group" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              Back to top
              <ArrowUp className="h-4 w-4 transition-transform group-hover:-translate-y-1" />
            </Button>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {year} Bizimana Fils. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Designed & built in Kigali, Rwanda
            <span className="inline-block h-3 w-px bg-border" />
            BIN
          </p>
        </div>
      </div>
    </footer>
  );
}

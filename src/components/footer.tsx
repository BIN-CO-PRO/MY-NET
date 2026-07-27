import { Link } from "react-router-dom";
import { Mail, MapPin } from "lucide-react";
import { SocialIcons } from "./social-icons";
import { useProfile } from "@/lib/use-profile";

export function Footer() {
  const { profile } = useProfile();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/40">
      <div className="container py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent font-display text-base font-bold text-primary-foreground">
                B
              </span>
              <span className="font-display text-base font-semibold">
                Bizimana<span className="text-primary">.</span> Idea Nexus
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              Multidisciplinary Technologist exploring the intersection of AI, electric mobility,
              and digital fabrication — building useful things from Kigali, Rwanda.
            </p>
            <SocialIcons links={profile?.social_links} className="pt-1" />
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold mb-3">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">About</Link></li>
              <li><Link to="/projects" className="hover:text-primary transition-colors">Projects</Link></li>
              <li><Link to="/files" className="hover:text-primary transition-colors">Files</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold mb-3">Get in touch</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {profile?.email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <a href={`mailto:${profile.email}`} className="hover:text-primary transition-colors">
                    {profile.email}
                  </a>
                </li>
              )}
              {profile?.location && (
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{profile.location}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {year} Bizimana Fils. All rights reserved.</p>
          <p>Designed & built in Kigali, Rwanda.</p>
        </div>
      </div>
    </footer>
  );
}

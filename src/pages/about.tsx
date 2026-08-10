import { MapPin, Mail, Award, Quote, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SocialIcons } from "@/components/social-icons";
import { useProfile } from "@/lib/use-profile";

export default function AboutPage() {
  const { profile } = useProfile();
  if (!profile) return null;

  return (
    <div className="animate-fade-in">
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="absolute left-1/4 top-0 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-primary/8 blur-[120px]" />
        </div>
        <div className="container py-16 md:py-20">
          <Badge className="mb-4 animate-slide-up opacity-0" style={{ animationFillMode: "forwards" }}>About</Badge>
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-6 animate-slide-up opacity-0" style={{ animationDelay: "0.08s", animationFillMode: "forwards" }}>
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-2xl" />
                <div className="relative aspect-square rounded-3xl border border-border bg-card overflow-hidden glow-card">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                      <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground font-display font-bold text-4xl shadow-lg">BIN</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-3 text-sm">
                {profile.location && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4 text-primary" /> {profile.location}</div>}
                {profile.email && (
                  <a href={`mailto:${profile.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <Mail className="h-4 w-4 text-primary" /> {profile.email}
                  </a>
                )}
                <SocialIcons links={profile.social_links} className="pt-2" />
              </div>
            </div>

            <div className="lg:col-span-7 space-y-8 animate-slide-up opacity-0" style={{ animationDelay: "0.16s", animationFillMode: "forwards" }}>
              <div>
                <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">{profile.full_name}</h1>
                <p className="text-lg text-muted-foreground mt-3">{profile.title}</p>
              </div>
              <div className="relative pl-6 border-l-2 border-primary/20 space-y-4">
                <Quote className="h-6 w-6 text-primary/30 absolute -left-3 top-0 bg-background p-0.5 rounded-full" />
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{profile.bio}</p>
              </div>
              <Button asChild variant="outline" className="group">
                <Link to="/contact">Get in touch <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {profile.skills?.length > 0 && (
        <section className="container py-16">
          <div className="mb-8">
            <Badge className="mb-3">Capabilities</Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight">Skills & tools</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {profile.skills.map((g, i) => (
              <Card key={g.category} className="hover:border-primary/30 transition-colors animate-slide-up opacity-0 glow-card" style={{ animationDelay: `${i * 0.08}s`, animationFillMode: "forwards" }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary" /> {g.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {g.items.map((s) => <Badge key={s} variant="secondary" className="hover:bg-primary/10 hover:text-primary transition-colors cursor-default">{s}</Badge>)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {profile.journey?.length > 0 && (
        <section className="container py-16 border-t border-border">
          <div className="mb-10">
            <Badge className="mb-3">Timeline</Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight">My journey</h2>
            <p className="text-muted-foreground mt-2">Key milestones that shaped my path.</p>
          </div>
          <div className="relative">
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />
            <div className="space-y-12">
              {profile.journey.map((j, i) => (
                <div key={i} className={`relative flex flex-col md:flex-row gap-6 animate-slide-up opacity-0 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`} style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "forwards" }}>
                  <div className="absolute left-0 md:left-1/2 top-1 -translate-x-1/2 flex h-4 w-4 items-center justify-center">
                    <div className="absolute h-4 w-4 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: "3s" }} />
                    <div className="relative h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                  </div>
                  <div className={`pl-8 md:pl-0 md:w-1/2 ${i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                    <div className="rounded-2xl border border-border bg-card/50 p-5 hover:border-primary/30 transition-colors glow-card">
                      <p className="text-xs text-primary font-semibold uppercase tracking-wide">{j.year}</p>
                      <p className="font-display font-semibold mt-1">{j.title}</p>
                      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{j.description}</p>
                    </div>
                  </div>
                  <div className="hidden md:block md:w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {profile.certifications?.length > 0 && (
        <section className="container py-16 border-t border-border">
          <div className="mb-8">
            <Badge className="mb-3">Credentials</Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight">Certifications</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.certifications.map((c, i) => (
              <div key={i} className="group flex items-start gap-4 rounded-2xl border border-border bg-card/50 p-5 hover:border-primary/30 hover:bg-card transition-all hover:-translate-y-0.5 glow-card animate-slide-up opacity-0" style={{ animationDelay: `${i * 0.08}s`, animationFillMode: "forwards" }}>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm leading-tight">{c.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{c.issuer} · {c.year}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

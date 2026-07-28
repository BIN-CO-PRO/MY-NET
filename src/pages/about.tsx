import { Award, GraduationCap, MapPin, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SocialIcons } from "@/components/social-icons";
import { useProfile } from "@/lib/use-profile";

export default function AboutPage() {
  const { profile } = useProfile();
  if (!profile) return null;

  return (
    <div className="container py-16 md:py-20 animate-fade-in">
      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 space-y-6">
          <div className="relative">
            <div className="absolute -inset-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-2xl" />
            <div className="relative aspect-square rounded-3xl border border-border bg-card overflow-hidden">
              {profile.photo_url ? (
                <img src={profile.photo_url} alt={profile.full_name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                  <img
                    src="/assets/images/bin-logo_(1).png"
                    alt="BIN Logo"
                    className="h-32 w-32 rounded-2xl object-cover shadow-lg shadow-primary/20"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" /> {profile.location}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 text-primary" />
              <a href={`mailto:${profile.email}`} className="hover:text-primary transition-colors">{profile.email}</a>
            </div>
            <SocialIcons links={profile.social_links} className="pt-2" />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-10">
          <div>
            <Badge variant="default" className="mb-3">About</Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">{profile.full_name}</h1>
            <p className="text-lg text-muted-foreground mt-2">{profile.tagline}</p>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{profile.bio}</p>
          </div>

          {/* Skills */}
          {profile.skills?.length ? (
            <div>
              <h2 className="font-display text-2xl font-semibold mb-4">Skills</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {profile.skills.map((g) => (
                  <Card key={g.category}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{g.category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {g.items.map((s) => (
                          <Badge key={s} variant="secondary">{s}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : null}

          {/* Journey */}
          {profile.journey?.length ? (
            <div>
              <h2 className="font-display text-2xl font-semibold mb-4">Journey</h2>
              <div className="relative border-l border-border pl-6 space-y-6">
                {profile.journey.map((j, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[31px] top-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary ring-4 ring-background" />
                    <p className="text-xs text-primary font-medium">{j.year}</p>
                    <p className="font-medium mt-0.5">{j.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{j.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Certifications */}
          {profile.certifications?.length ? (
            <div>
              <h2 className="font-display text-2xl font-semibold mb-4">Certifications</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {profile.certifications.map((c, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-card/50 p-4">
                    <Award className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.issuer} · {c.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, FolderOpen, FileText, Zap, Brain, Car, Wrench, Cpu, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SocialIcons } from "@/components/social-icons";
import { useProfile } from "@/lib/use-profile";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import type { Project, FileRecord } from "@/lib/types";
import { CardSkeleton } from "@/components/ui/skeleton";

const FOCUS = [
  { icon: Brain, label: "AI & Prompt Engineering", color: "text-primary", desc: "LLMs, agents, and intelligent systems" },
  { icon: Car, label: "Electric Vehicles", color: "text-accent", desc: "EV diagnostics, battery systems, mobility" },
  { icon: Wrench, label: "Digital Fabrication", color: "text-primary", desc: "3D printing, CNC, rapid prototyping" },
];

export default function HomePage() {
  const { profile } = useProfile();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [files, setFiles] = useState<FileRecord[] | null>(null);

  useEffect(() => {
    (async () => {
      const [p, f] = await Promise.all([
        supabase
          .from("projects")
          .select("*")
          .eq("featured", true)
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("files")
          .select("*")
          .eq("is_public", true)
          .order("created_at", { ascending: false })
          .limit(4),
      ]);
      setProjects(p.data ?? []);
      setFiles(f.data ?? []);
    })();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute right-0 top-40 h-[300px] w-[300px] rounded-full bg-accent/10 blur-[100px]" />
        </div>

        <div className="container py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm font-medium backdrop-blur-sm animate-slide-up opacity-0" style={{ animationDelay: "0s", animationFillMode: "forwards" }}>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                Available for collaborations
              </div>

              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.02] animate-slide-up opacity-0" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
                Ideas into reality —
                <br />
                from <span className="text-gradient-gold">Kigali</span> to the world.
              </h1>

              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed animate-slide-up opacity-0" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
                {profile?.tagline}. I work across AI prompt engineering, EV diagnostics, and digital
                fabrication — turning ambitious ideas into real, working artifacts.
              </p>

              <div className="flex flex-wrap items-center gap-3 animate-slide-up opacity-0" style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>
                <Button asChild size="lg" className="group">
                  <Link to="/projects">
                    View my work
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/contact">Get in touch</Link>
                </Button>
              </div>

              <div className="animate-slide-up opacity-0" style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
                <SocialIcons links={profile?.social_links} className="pt-2" />
              </div>
            </div>

            <div className="lg:col-span-5 animate-slide-up opacity-0" style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 rounded-3xl blur-3xl animate-pulse-glow" />
                <div className="relative rounded-3xl border border-border bg-card/80 backdrop-blur-xl p-8 shadow-2xl">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-accent opacity-20 blur-md" />
                      <img
                        src="/assets/images/bin-logo_(1).png"
                        alt="BIN Logo"
                        className="relative h-16 w-16 rounded-2xl object-cover shadow-lg"
                      />
                    </div>
                    <div>
                      <p className="font-display text-lg font-semibold">{profile?.full_name}</p>
                      <p className="text-sm text-muted-foreground">{profile?.location}</p>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                    {[
                      { label: "Focus", value: "AI · EV · Fab", icon: Cpu },
                      { label: "Based in", value: "Rwanda", icon: Rocket },
                      { label: "Status", value: "Open", icon: Sparkles },
                    ].map((s) => (
                      <div key={s.label} className="rounded-xl bg-muted/50 p-3 hover:bg-muted transition-colors">
                        <s.icon className="h-4 w-4 mx-auto mb-1.5 text-primary" />
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
                        <p className="text-sm font-medium mt-0.5">{s.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Focus */}
      <section className="container py-12 border-t border-border">
        <div className="grid md:grid-cols-3 gap-4">
          {FOCUS.map((f, i) => (
            <div
              key={f.label}
              className="group flex items-start gap-4 rounded-2xl border border-border bg-card/50 p-5 hover:border-primary/40 hover:bg-card transition-all hover:-translate-y-0.5 animate-slide-up opacity-0"
              style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "forwards" }}
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted ${f.color} group-hover:scale-110 transition-transform`}>
                <f.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">{f.label}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured projects */}
      <section className="container py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight">Featured projects</h2>
            <p className="text-muted-foreground mt-1">A selection of recent work across my practice.</p>
          </div>
          <Button asChild variant="ghost" className="hidden sm:flex group">
            <Link to="/projects">
              All projects
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {projects === null
            ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
            : projects.map((p) => (
                <Link key={p.id} to={`/projects/${p.slug}`} className="group">
                  <Card className="overflow-hidden h-full transition-all hover:border-primary/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5">
                    <div className="aspect-[16/10] bg-gradient-to-br from-muted to-muted/30 overflow-hidden relative">
                      {p.cover_url ? (
                        <img src={p.cover_url} alt={p.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <FolderOpen className="h-10 w-10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{p.category}</Badge>
                        {p.featured && <Badge variant="accent">Featured</Badge>}
                      </div>
                      <h3 className="font-display text-lg font-semibold leading-tight group-hover:text-primary transition-colors">{p.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{p.summary}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
        </div>
      </section>

      {/* Latest files + About teaser */}
      <section className="container py-16 border-t border-border">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-3xl font-bold tracking-tight">Latest public files</h2>
              <Button asChild variant="ghost" size="sm" className="group">
                <Link to="/files">
                  Browse
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {files === null
                ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
                : files.length === 0 ? (
                  <div className="sm:col-span-2 rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No public files yet.
                  </div>
                ) : files.map((f) => (
                  <Link key={f.id} to="/files" className="flex items-center gap-3 rounded-xl border border-border bg-card/50 p-4 hover:border-primary/40 hover:bg-card transition-all hover:-translate-y-0.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(f.created_at)}</p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>

          <div className="space-y-5">
            <h2 className="font-display text-3xl font-bold tracking-tight">About</h2>
            <p className="text-muted-foreground leading-relaxed">
              {profile?.bio?.slice(0, 220)}…
            </p>
            <Button asChild variant="outline" className="group">
              <Link to="/about">
                Read full bio
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-accent/10 p-10 md:p-16 text-center">
          <div className="pointer-events-none absolute inset-0 bg-dots opacity-20" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-[200px] w-[400px] -translate-x-1/2 rounded-full bg-primary/15 blur-[80px]" />
          <div className="relative">
            <Zap className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight max-w-2xl mx-auto">
              Have an idea worth building? Let's make it real.
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Open to collaborations in AI, electric mobility, and digital fabrication.
            </p>
            <Button asChild size="lg" className="mt-6 group">
              <Link to="/contact">
                Start a conversation
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

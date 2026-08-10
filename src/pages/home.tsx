import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Sparkles, FolderOpen, FileText, Zap,
  Brain, Car, Wrench, Quote,
} from "lucide-react";
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
  { icon: Brain, label: "AI & Prompt Engineering", desc: "LLMs, agents, and intelligent systems for real-world use" },
  { icon: Car, label: "Electric Vehicles", desc: "EV diagnostics, battery systems, and electric mobility" },
  { icon: Wrench, label: "Digital Fabrication", desc: "3D printing, CNC routing, laser cutting, rapid prototyping" },
];

const STATS = [
  { value: "3+", label: "Focus areas" },
  { value: "2020", label: "Started journey" },
  { value: "Kigali", label: "Based in" },
  { value: "Open", label: "For collaborations" },
];

export default function HomePage() {
  const { profile } = useProfile();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [files, setFiles] = useState<FileRecord[] | null>(null);

  useEffect(() => {
    (async () => {
      const [p, f] = await Promise.all([
        supabase.from("projects").select("*").eq("is_featured", true).eq("status", "published").order("created_at", { ascending: false }).limit(3),
        supabase.from("files").select("*").eq("is_public", true).order("created_at", { ascending: false }).limit(4),
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
          <div className="absolute inset-0 bg-grid opacity-25" />
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/8 blur-[140px]" />
          <div className="absolute right-0 top-40 h-[300px] w-[300px] rounded-full bg-accent/8 blur-[120px]" />
        </div>

        <div className="container py-24 md:py-32 lg:py-36">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm font-medium backdrop-blur-sm animate-slide-up opacity-0" style={{ animationFillMode: "forwards" }}>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                Available for collaborations
              </div>

              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] animate-slide-up opacity-0" style={{ animationDelay: "0.08s", animationFillMode: "forwards" }}>
                Ideas into reality —<br />from <span className="text-gradient-gold">Kigali</span> to the world.
              </h1>

              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed animate-slide-up opacity-0" style={{ animationDelay: "0.16s", animationFillMode: "forwards" }}>
                {profile?.title}. I work across AI prompt engineering, EV diagnostics, and digital fabrication — turning ambitious ideas into real, working artifacts.
              </p>

              <div className="flex flex-wrap items-center gap-3 animate-slide-up opacity-0" style={{ animationDelay: "0.24s", animationFillMode: "forwards" }}>
                <Button asChild size="lg" className="group">
                  <Link to="/projects">View my work <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline"><Link to="/contact">Get in touch</Link></Button>
              </div>

              <div className="animate-slide-up opacity-0" style={{ animationDelay: "0.32s", animationFillMode: "forwards" }}>
                <SocialIcons links={profile?.social_links} className="pt-2" />
              </div>
            </div>

            {/* Profile card */}
            <div className="lg:col-span-5 animate-slide-up opacity-0" style={{ animationDelay: "0.24s", animationFillMode: "forwards" }}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/15 via-transparent to-accent/15 rounded-3xl blur-3xl animate-pulse-glow" />
                <div className="relative rounded-3xl border border-border bg-card/80 backdrop-blur-xl p-8 glow-card">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-accent opacity-20 blur-md" />
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground font-display font-bold text-lg shadow-lg">
                        BIN
                      </div>
                    </div>
                    <div>
                      <p className="font-display text-lg font-semibold">{profile?.full_name}</p>
                      <p className="text-sm text-muted-foreground">{profile?.location}</p>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {[
                      { label: "Focus", value: "AI · EV · Fab" },
                      { label: "Based in", value: "Rwanda" },
                      { label: "Status", value: "Open" },
                      { label: "Approach", value: "Hands-on" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-xl bg-muted/40 p-3.5 hover:bg-muted/70 transition-colors">
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
                        <p className="text-sm font-medium mt-0.5">{s.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up opacity-0" style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
            {STATS.map((s) => (
              <div key={s.label} className="text-center md:text-left">
                <p className="font-display text-3xl md:text-4xl font-bold text-gradient-gold">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Focus areas */}
      <section className="container py-16 border-t border-border">
        <div className="mb-10 max-w-2xl">
          <Badge className="mb-3">What I do</Badge>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Three disciplines, one mindset</h2>
          <p className="text-muted-foreground mt-2 text-lg">I work across the digital and physical divide — from AI systems to electric vehicles to digital fabrication.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {FOCUS.map((f, i) => (
            <div key={f.label} className="group relative overflow-hidden rounded-2xl border border-border bg-card/50 p-6 hover:border-primary/40 hover:bg-card transition-all hover:-translate-y-1 glow-card card-3d animate-slide-up opacity-0" style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "forwards" }}>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                <f.icon className="h-7 w-7" />
              </div>
              <p className="font-display text-lg font-semibold mt-4">{f.label}</p>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured projects */}
      <section className="container py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <Badge className="mb-3">Portfolio</Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Featured projects</h2>
            <p className="text-muted-foreground mt-2">A selection of recent work across my practice.</p>
          </div>
          <Button asChild variant="ghost" className="hidden sm:flex group">
            <Link to="/projects">All projects <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {projects === null
            ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
            : projects.length === 0 ? (
              <div className="md:col-span-3 rounded-2xl border border-dashed border-border p-16 text-center">
                <FolderOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="font-medium">No featured projects yet.</p>
                <p className="text-sm text-muted-foreground mt-1">Check back soon.</p>
              </div>
            ) : projects.map((p, i) => (
              <Link key={p.id} to={`/projects/${p.slug}`} className="group animate-slide-up opacity-0" style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "forwards" }}>
                <Card className="overflow-hidden h-full transition-all hover:border-primary/40 hover:-translate-y-1 glow-card hover:glow-card-hover">
                  <div className="aspect-[16/10] bg-gradient-to-br from-muted to-muted/20 overflow-hidden relative">
                    {p.cover_image ? (
                      <img src={p.cover_image} alt={p.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground"><FolderOpen className="h-10 w-10" /></div>
                    )}
                  </div>
                  <CardContent className="p-5 space-y-3">
                    {p.tags?.length > 0 && <Badge variant="secondary">{p.tags[0]}</Badge>}
                    <h3 className="font-display text-lg font-semibold leading-tight group-hover:text-primary transition-colors">{p.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>
      </section>

      {/* Quote + latest files */}
      <section className="container py-16 border-t border-border">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <Quote className="h-8 w-8 text-primary/40" />
            <p className="font-display text-2xl md:text-3xl font-medium leading-relaxed tracking-tight">
              "I care about practical innovation that fits the African context and empowers the next generation of makers."
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground font-display font-bold text-sm">BIN</div>
              <div>
                <p className="text-sm font-medium">{profile?.full_name}</p>
                <p className="text-xs text-muted-foreground">{profile?.location}</p>
              </div>
            </div>
            <Button asChild variant="outline" className="group mt-2">
              <Link to="/about">Read full bio <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
            </Button>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-end justify-between">
              <h3 className="font-display text-xl font-semibold">Latest files</h3>
              <Button asChild variant="ghost" size="sm" className="group">
                <Link to="/files">Browse all <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
              </Button>
            </div>
            <div className="space-y-2">
              {files === null
                ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
                : files.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No public files yet.
                  </div>
                ) : files.map((f) => (
                  <Link key={f.id} to="/files" className="flex items-center gap-3 rounded-xl border border-border bg-card/50 p-3.5 hover:border-primary/40 hover:bg-card transition-all hover:translate-x-1">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(f.created_at)}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-accent/10 p-10 md:p-16 text-center glow-card">
          <div className="pointer-events-none absolute inset-0 bg-dots opacity-15" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-[200px] w-[400px] -translate-x-1/2 rounded-full bg-primary/12 blur-[80px]" />
          <div className="relative space-y-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Zap className="h-7 w-7" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight max-w-2xl mx-auto">Have an idea worth building? Let's make it real.</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">Open to collaborations in AI, electric mobility, and digital fabrication.</p>
            <Button asChild size="lg" className="mt-4 group">
              <Link to="/contact">Start a conversation <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, FolderOpen, FileText, Zap, Cpu, Car, Wrench } from "lucide-react";
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
  { icon: Cpu, label: "AI & Machine Learning", color: "text-primary" },
  { icon: Car, label: "Electric Mobility", color: "text-accent" },
  { icon: Wrench, label: "Digital Fabrication", color: "text-primary" },
];

export default function HomePage() {
  const { profile } = useProfile();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [files, setFiles] = useState<FileRecord[] | null>(null);

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase
        .from("projects")
        .select("*")
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(3);
      setProjects(p ?? []);
      const { data: f } = await supabase
        .from("files")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(4);
      setFiles(f ?? []);
    })();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="container py-20 md:py-28">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-7">
            <Badge variant="default" className="gap-1.5 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5" /> Available for collaborations
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              Building the future from{" "}
              <span className="text-gradient-gold">Kigali</span> — one idea at a time.
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              {profile?.tagline}. I design and build AI systems, electric vehicles, and digital
              fabrication tools that turn ambitious ideas into real, working artifacts.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link to="/projects">View my work <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/contact">Get in touch</Link>
              </Button>
            </div>
            <SocialIcons links={profile?.social_links} className="pt-2" />
          </div>

          <div className="lg:col-span-5">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-2xl" />
              <div className="relative rounded-3xl border border-border bg-card p-8 shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent font-display text-2xl font-bold text-primary-foreground">
                    BF
                  </div>
                  <div>
                    <p className="font-display text-lg font-semibold">{profile?.full_name}</p>
                    <p className="text-sm text-muted-foreground">{profile?.location}</p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: "Focus", value: "AI · EV · Fab" },
                    { label: "Based in", value: "Rwanda" },
                    { label: "Status", value: "Open" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl bg-muted/50 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
                      <p className="text-sm font-medium mt-0.5">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Focus */}
      <section className="container py-12 border-t border-border">
        <div className="grid md:grid-cols-3 gap-4">
          {FOCUS.map((f) => (
            <div key={f.label} className="flex items-center gap-4 rounded-xl border border-border bg-card/50 p-5 hover:border-primary/40 transition-colors">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-muted ${f.color}`}>
                <f.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">{f.label}</p>
                <p className="text-sm text-muted-foreground">Core practice area</p>
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
          <Button asChild variant="ghost" className="hidden sm:flex">
            <Link to="/projects">All projects <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {projects === null
            ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
            : projects.map((p) => (
              <Link key={p.id} to={`/projects/${p.slug}`} className="group">
                <Card className="overflow-hidden h-full transition-all hover:border-primary/40 hover:-translate-y-1 hover:shadow-xl">
                  <div className="aspect-[16/10] bg-gradient-to-br from-muted to-muted/30 overflow-hidden">
                    {p.cover_url ? (
                      <img src={p.cover_url} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <FolderOpen className="h-10 w-10" />
                      </div>
                    )}
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
              <Button asChild variant="ghost" size="sm">
                <Link to="/files">Browse <ArrowRight className="h-4 w-4" /></Link>
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
                  <div key={f.id} className="flex items-center gap-3 rounded-xl border border-border bg-card/50 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(f.created_at)}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="space-y-5">
            <h2 className="font-display text-3xl font-bold tracking-tight">About</h2>
            <p className="text-muted-foreground leading-relaxed">
              {profile?.bio?.slice(0, 220)}…
            </p>
            <Button asChild variant="outline">
              <Link to="/about">Read full bio <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-accent/10 p-10 md:p-14 text-center">
          <Zap className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight max-w-2xl mx-auto">
            Have an idea worth building? Let's make it real.
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Open to collaborations in AI, electric mobility, and digital fabrication.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link to="/contact">Start a conversation <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

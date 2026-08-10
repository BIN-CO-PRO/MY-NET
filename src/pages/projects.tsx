import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FolderOpen, Search, ArrowRight, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { CardSkeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import type { Project } from "@/lib/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("projects").select("*").eq("status", "published").order("created_at", { ascending: false });
      setProjects(data ?? []);
    })();
  }, []);

  const categories = useMemo(() => {
    if (!projects) return ["All"];
    const set = new Set(projects.flatMap((p) => p.tags ?? []).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [projects]);

  const filtered = useMemo(() => {
    if (!projects) return null;
    return projects.filter((p) => {
      const matchCat = category === "All" || (p.tags ?? []).includes(category);
      const q = query.toLowerCase();
      const matchQuery = !q || p.title.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q) || (p.tags ?? []).some((t) => t.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [projects, query, category]);

  return (
    <div className="animate-fade-in">
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="absolute right-1/4 top-0 h-[300px] w-[400px] rounded-full bg-accent/8 blur-[120px]" />
        </div>
        <div className="container py-16 md:py-20">
          <Badge className="mb-4">Projects</Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">Things I've built</h1>
          <p className="text-muted-foreground mt-3 text-lg max-w-2xl">A filterable grid of my work across AI, electric mobility, and digital fabrication.</p>
        </div>
      </section>

      <section className="container py-12">
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search projects, tags…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Button key={c} variant={category === c ? "default" : "outline"} size="sm" onClick={() => setCategory(c)}>{c}</Button>
            ))}
          </div>
        </div>

        {filtered === null ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-20 text-center">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
            <p className="font-medium text-lg">No projects match your filters.</p>
            <p className="text-sm text-muted-foreground mt-1">Try clearing the search or selecting a different category.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p, i) => (
              <Link key={p.id} to={`/projects/${p.slug}`} className="group animate-slide-up opacity-0" style={{ animationDelay: `${i * 0.06}s`, animationFillMode: "forwards" }}>
                <Card className="overflow-hidden h-full transition-all hover:border-primary/40 hover:-translate-y-1 glow-card hover:glow-card-hover">
                  <div className="aspect-[16/10] bg-gradient-to-br from-muted to-muted/20 overflow-hidden relative">
                    {p.cover_image ? (
                      <img src={p.cover_image} alt={p.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground"><FolderOpen className="h-10 w-10" /></div>
                    )}
                    {p.is_featured && (
                      <div className="absolute top-3 right-3">
                        <Badge variant="accent"><Sparkles className="h-3 w-3 mr-1" /> Featured</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5 space-y-3">
                    {p.tags?.length > 0 && <Badge variant="secondary">{p.tags[0]}</Badge>}
                    <h3 className="font-display text-lg font-semibold leading-tight group-hover:text-primary transition-colors">{p.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-muted-foreground">{formatDate(p.created_at)}</span>
                      <span className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">View <ArrowRight className="h-3 w-3" /></span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

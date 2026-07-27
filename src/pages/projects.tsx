import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FolderOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { CardSkeleton } from "@/components/ui/skeleton";
import type { Project } from "@/lib/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      setProjects(data ?? []);
    })();
  }, []);

  const categories = useMemo(() => {
    if (!projects) return ["All"];
    const set = new Set(projects.map((p) => p.category).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [projects]);

  const filtered = useMemo(() => {
    if (!projects) return null;
    return projects.filter((p) => {
      const matchCat = category === "All" || p.category === category;
      const q = query.toLowerCase();
      const matchQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        (p.tags ?? []).some((t) => t.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [projects, query, category]);

  return (
    <div className="container py-16 md:py-20 animate-fade-in">
      <div className="max-w-2xl mb-10">
        <Badge variant="default" className="mb-3">Projects</Badge>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">Things I've built</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          A filterable grid of my work across AI, electric mobility, and digital fabrication.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects, tags…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Button
              key={c}
              variant={category === c ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(c)}
            >
              {c}
            </Button>
          ))}
        </div>
      </div>

      {filtered === null ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <FolderOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="font-medium">No projects match your filters.</p>
          <p className="text-sm text-muted-foreground mt-1">Try clearing the search or selecting a different category.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
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
                  {p.tags?.length ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {p.tags.slice(0, 4).map((t) => (
                        <span key={t} className="text-xs text-muted-foreground">#{t}</span>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

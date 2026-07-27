import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Github, FileText, Calendar, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { supabase, STORAGE_BUCKET } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import type { Project, FileRecord } from "@/lib/types";

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [files, setFiles] = useState<FileRecord[]>([]);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      setProject(data);
      if (data?.file_ids?.length) {
        const { data: f } = await supabase
          .from("files")
          .select("*")
          .in("id", data.file_ids)
          .eq("is_public", true);
        setFiles(f ?? []);
      }
    })();
  }, [slug]);

  if (project === undefined) {
    return <div className="container py-24 text-center text-muted-foreground">Loading…</div>;
  }
  if (project === null) {
    return (
      <div className="container py-24 text-center">
        <FolderOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
        <h1 className="font-display text-2xl font-semibold">Project not found</h1>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/projects"><ArrowLeft className="h-4 w-4" /> Back to projects</Link>
        </Button>
      </div>
    );
  }

  return (
    <article className="container py-16 md:py-20 animate-fade-in max-w-4xl">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link to="/projects"><ArrowLeft className="h-4 w-4" /> All projects</Link>
      </Button>

      <div className="flex items-center gap-2 mb-4">
        <Badge variant="secondary">{project.category}</Badge>
        {project.featured && <Badge variant="accent">Featured</Badge>}
      </div>

      <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">{project.title}</h1>
      <p className="text-lg text-muted-foreground mt-3">{project.summary}</p>

      <div className="flex flex-wrap items-center gap-4 mt-5 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" /> {formatDate(project.created_at)}
        </span>
        {project.live_url && (
          <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <ExternalLink className="h-4 w-4" /> Live demo
          </a>
        )}
        {project.repo_url && (
          <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <Github className="h-4 w-4" /> Source
          </a>
        )}
      </div>

      {project.cover_url && (
        <div className="mt-8 rounded-2xl border border-border overflow-hidden">
          <img src={project.cover_url} alt={project.title} className="w-full" />
        </div>
      )}

      {project.tags?.length ? (
        <div className="flex flex-wrap gap-2 mt-8">
          {project.tags.map((t) => <Badge key={t} variant="outline">#{t}</Badge>)}
        </div>
      ) : null}

      <div className="mt-10 prose prose-invert max-w-none">
        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{project.description}</p>
      </div>

      {files.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold mb-4">Attached files</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {files.map((f) => {
              const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(f.storage_path);
              return (
                <a
                  key={f.id}
                  href={data.publicUrl}
                  download={f.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-border bg-card/50 p-4 hover:border-primary/40 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(f.created_at)}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
}

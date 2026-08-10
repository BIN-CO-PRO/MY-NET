import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, FileText, Download, FolderOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase, STORAGE_BUCKET } from "@/lib/supabase";
import { formatDate, formatBytes } from "@/lib/utils";
import type { Project, FileRecord } from "@/lib/types";

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data: proj } = await supabase.from("projects").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
      if (!proj) { setLoading(false); return; }
      setProject(proj);
      const { data: f } = await supabase.from("files").select("*").eq("project_id", proj.id).eq("is_public", true).order("created_at", { ascending: false });
      setFiles(f ?? []);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="container py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" /></div>;
  if (!project) return <Navigate to="/projects" replace />;

  const fileUrl = (path: string) => supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-primary/8 blur-[120px]" />
        </div>
        <div className="container py-12 md:py-16">
          <Button asChild variant="ghost" size="sm" className="mb-6 group">
            <Link to="/projects"><ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to projects</Link>
          </Button>
          {project.is_featured && <Badge variant="accent" className="mb-3">Featured</Badge>}
          {project.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
            </div>
          )}
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight max-w-3xl">{project.title}</h1>
          <p className="text-muted-foreground mt-4 text-lg max-w-2xl">{project.description}</p>
          <p className="text-sm text-muted-foreground mt-3">{formatDate(project.created_at)}</p>
        </div>
      </section>

      {/* Cover image */}
      {project.cover_image && (
        <section className="container py-8">
          <div className="aspect-[21/9] rounded-2xl overflow-hidden border border-border glow-card">
            <img src={project.cover_image} alt={project.title} className="h-full w-full object-cover" />
          </div>
        </section>
      )}

      {/* Content */}
      {project.content && (
        <section className="container py-8">
          <div className="prose prose-lg max-w-3xl dark:prose-invert">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-lg">{project.content}</p>
          </div>
        </section>
      )}

      {/* Attached files */}
      {files.length > 0 && (
        <section className="container py-8 pb-16">
          <h2 className="font-display text-2xl font-bold tracking-tight mb-6">Attached files</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((f) => (
              <Card key={f.id} className="p-4 hover:border-primary/40 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{f.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatBytes(f.size)}</p>
                  </div>
                </div>
                <a href={fileUrl(f.storage_path)} download={f.name} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm font-medium hover:bg-muted transition-colors">
                  <Download className="h-4 w-4" /> Download
                </a>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container py-16 border-t border-border">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-lg text-muted-foreground">Want to see more of my work?</p>
          <Button asChild className="group">
            <Link to="/projects">Browse all projects <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

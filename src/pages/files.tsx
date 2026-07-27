import { useEffect, useMemo, useState } from "react";
import { FileText, Search, Download, FileX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { supabase, STORAGE_BUCKET } from "@/lib/supabase";
import { formatBytes, formatDate, fileIcon } from "@/lib/utils";
import { RowSkeleton } from "@/components/ui/skeleton";
import type { FileRecord } from "@/lib/types";

const ICONS: Record<string, string> = {
  image: "🖼️",
  video: "🎬",
  audio: "🎵",
  pdf: "📄",
  archive: "🗜️",
  code: "💻",
  file: "📄",
};

export default function FilesPage() {
  const [files, setFiles] = useState<FileRecord[] | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("files")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false });
      setFiles(data ?? []);
    })();
  }, []);

  const categories = useMemo(() => {
    if (!files) return ["All"];
    const set = new Set(files.map((f) => f.category).filter(Boolean) as string[]);
    return ["All", ...Array.from(set)];
  }, [files]);

  const filtered = useMemo(() => {
    if (!files) return null;
    return files.filter((f) => {
      const matchCat = category === "All" || f.category === category;
      const q = query.toLowerCase();
      const matchQuery = !q || f.name.toLowerCase().includes(q) || (f.description ?? "").toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [files, query, category]);

  const downloadUrl = (path: string) => supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;

  return (
    <div className="container py-16 md:py-20 animate-fade-in">
      <div className="max-w-2xl mb-10">
        <Badge variant="default" className="mb-3">Public files</Badge>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">File library</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Documents, datasets, designs, and resources I've shared publicly. Click to download.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files…"
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
        <div className="rounded-xl border border-border divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <FileX className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="font-medium">No public files here yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Check back soon — new resources are added regularly.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((f) => (
            <Card key={f.id} className="p-4 hover:border-primary/40 transition-colors group">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl">
                  {ICONS[fileIcon(f.mime_type)]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate" title={f.name}>{f.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatBytes(f.size_bytes)} · {formatDate(f.created_at)}
                  </p>
                  {f.description && (
                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{f.description}</p>
                  )}
                  {f.category && <Badge variant="outline" className="mt-2">{f.category}</Badge>}
                </div>
              </div>
              <a
                href={downloadUrl(f.storage_path)}
                download={f.name}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                <Download className="h-4 w-4" /> Download
              </a>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { FileText, Search, Download, FileX, Eye, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase, STORAGE_BUCKET } from "@/lib/supabase";
import { formatBytes, formatDate, fileIcon } from "@/lib/utils";
import { RowSkeleton } from "@/components/ui/skeleton";
import type { FileRecord } from "@/lib/types";

const ICONS: Record<string, string> = {
  image: "🖼️", video: "🎬", audio: "🎵", pdf: "📄", archive: "🗜️", code: "💻", file: "📄",
};

export default function FilesPage() {
  const [files, setFiles] = useState<FileRecord[] | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("files").select("*").eq("is_public", true).order("created_at", { ascending: false });
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

  const fileUrl = (path: string) => supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
  const isPreviewable = (mime: string) => mime.startsWith("image/") || mime.startsWith("video/") || mime.startsWith("audio/") || mime.includes("pdf");

  return (
    <div className="animate-fade-in">
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="absolute left-1/3 top-0 h-[300px] w-[400px] rounded-full bg-primary/8 blur-[120px]" />
        </div>
        <div className="container py-16 md:py-20">
          <Badge className="mb-4">Files</Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">File library</h1>
          <p className="text-muted-foreground mt-3 text-lg max-w-2xl">Documents, datasets, designs, and resources I've shared publicly. Click to preview or download.</p>
        </div>
      </section>

      <section className="container py-12">
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search files…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Button key={c} variant={category === c ? "default" : "outline"} size="sm" onClick={() => setCategory(c)}>{c}</Button>
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
                {f.mime_type?.startsWith("image/") && (
                  <button onClick={() => setPreviewFile(f)} className="mb-3 block w-full overflow-hidden rounded-lg">
                    <img src={fileUrl(f.storage_path)} alt={f.name} className="h-32 w-full object-cover transition-transform group-hover:scale-105" />
                  </button>
                )}
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl">
                    {ICONS[fileIcon(f.mime_type ?? "")]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" title={f.name}>{f.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatBytes(f.size)} · {formatDate(f.created_at)}</p>
                    {f.category && <Badge variant="outline" className="mt-2">{f.category}</Badge>}
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  {isPreviewable(f.mime_type ?? "") && (
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setPreviewFile(f)}>
                      <Eye className="h-4 w-4" /> Preview
                    </Button>
                  )}
                  <a href={fileUrl(f.storage_path)} download={f.name} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm font-medium hover:bg-muted transition-colors ${isPreviewable(f.mime_type ?? "") ? "px-3" : "flex-1"}`}>
                    <Download className="h-4 w-4" /> Download
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Preview Modal */}
        <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden p-0">
            <DialogTitle className="sr-only">{previewFile?.name}</DialogTitle>
            <DialogDescription className="sr-only">File preview — {previewFile ? formatBytes(previewFile.size) : ""}</DialogDescription>
            {previewFile && <FilePreview file={previewFile} url={fileUrl(previewFile.storage_path)} />}
          </DialogContent>
        </Dialog>
      </section>
    </div>
  );
}

function FilePreview({ file, url }: { file: FileRecord; url: string }) {
  const mime = file.mime_type ?? "";
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">{formatBytes(file.size)} · {formatDate(file.created_at)}</p>
        </div>
        <a href={url} download={file.name} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors shrink-0">
          <Download className="h-4 w-4" /> Download
        </a>
      </div>
      <div className="flex items-center justify-center bg-black/30 p-4 min-h-[200px] max-h-[65vh] overflow-auto">
        {mime.startsWith("image/") && <img src={url} alt={file.name} className="max-w-full max-h-[60vh] rounded-lg object-contain" />}
        {mime.startsWith("video/") && <video src={url} controls autoPlay className="max-w-full max-h-[60vh] rounded-lg" />}
        {mime.startsWith("audio/") && (
          <div className="flex flex-col items-center gap-4 w-full max-w-md">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10 text-5xl">🎵</div>
            <audio src={url} controls autoPlay className="w-full" />
          </div>
        )}
        {mime.includes("pdf") && <iframe src={url} title={file.name} className="w-full h-[60vh] rounded-lg" />}
        {!mime.startsWith("image/") && !mime.startsWith("video/") && !mime.startsWith("audio/") && !mime.includes("pdf") && (
          <div className="text-center py-16">
            <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm font-medium">Preview not available for this file type.</p>
            <p className="text-xs text-muted-foreground mt-1">Use the download button to access the file.</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  FileText, Search, Download, Trash2, Pencil, X, Eye,
  Upload, FileUp, Lock, Globe, Loader as Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { supabase, STORAGE_BUCKET } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";
import { formatBytes, formatDate, fileIcon, slugify } from "@/lib/utils";
import { RowSkeleton } from "@/components/ui/skeleton";
import type { FileRecord } from "@/lib/types";

const ICONS: Record<string, string> = {
  image: "🖼️", video: "🎬", audio: "🎵", pdf: "📄", archive: "🗜️", code: "💻", file: "📄",
};

export default function AdminFiles() {
  const { toast } = useToast();
  const [files, setFiles] = useState<FileRecord[] | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "public" | "private">("all");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ name: string; progress: number }[]>([]);
  const [editFile, setEditFile] = useState<FileRecord | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null);
  const [deleteFile, setDeleteFile] = useState<FileRecord | null>(null);

  const loadFiles = useCallback(async () => {
    const { data } = await supabase.from("files").select("*").order("created_at", { ascending: false });
    setFiles(data ?? []);
  }, []);

  useEffect(() => { loadFiles(); }, [loadFiles]);

  const onDrop = useCallback(async (accepted: File[]) => {
    if (accepted.length === 0) return;
    setUploading(true);
    const progress: { name: string; progress: number }[] = [];
    setUploadProgress(progress);

    for (const file of accepted) {
      const entry = { name: file.name, progress: 0 };
      progress.push(entry);
      setUploadProgress([...progress]);

      const ext = file.name.split(".").pop() ?? "";
      const path = `${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.${ext}`;

      const { error: upErr } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
        upsert: false,
        contentType: file.type,
      });

      if (upErr) {
        toast({ title: `Upload failed: ${file.name}`, description: upErr.message, variant: "destructive" });
        const idx = progress.findIndex((p) => p.name === file.name);
        if (idx >= 0) progress.splice(idx, 1);
        setUploadProgress([...progress]);
        continue;
      }

      const idx = progress.findIndex((p) => p.name === file.name);
      if (idx >= 0) progress[idx].progress = 100;
      setUploadProgress([...progress]);

      const { error: dbErr } = await supabase.from("files").insert({
        name: file.name,
        original_name: file.name,
        storage_path: path,
        file_url: supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl,
        mime_type: file.type || "application/octet-stream",
        size: file.size,
        is_public: false,
        category: "general",
      });

      if (dbErr) {
        toast({ title: `Database error: ${file.name}`, description: dbErr.message, variant: "destructive" });
      }
    }

    setUploading(false);
    setUploadProgress([]);
    loadFiles();
    toast({ title: "Upload complete", description: `${accepted.length} file(s) uploaded.`, variant: "success" });
  }, [toast, loadFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const togglePublic = async (file: FileRecord) => {
    const { error } = await supabase.from("files").update({ is_public: !file.is_public }).eq("id", file.id);
    if (error) { toast({ title: "Update failed", description: error.message, variant: "destructive" }); return; }
    setFiles((prev) => prev?.map((f) => f.id === file.id ? { ...f, is_public: !f.is_public } : f) ?? null);
    toast({ title: file.is_public ? "File set to private" : "File set to public", variant: "success" });
  };

  const saveEdit = async () => {
    if (!editFile) return;
    const { error } = await supabase.from("files").update({
      name: editName,
      category: editCategory || null,
      description: editDescription || null,
    }).eq("id", editFile.id);
    if (error) { toast({ title: "Update failed", description: error.message, variant: "destructive" }); return; }
    setFiles((prev) => prev?.map((f) => f.id === editFile.id ? { ...f, name: editName, category: editCategory, description: editDescription } : f) ?? null);
    setEditFile(null);
    toast({ title: "File updated", variant: "success" });
  };

  const confirmDelete = async () => {
    if (!deleteFile) return;
    await supabase.storage.from(STORAGE_BUCKET).remove([deleteFile.storage_path]);
    const { error } = await supabase.from("files").delete().eq("id", deleteFile.id);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    setFiles((prev) => prev?.filter((f) => f.id !== deleteFile.id) ?? null);
    setDeleteFile(null);
    toast({ title: "File deleted", variant: "destructive" });
  };

  const filtered = useMemo(() => {
    if (!files) return null;
    return files.filter((f) => {
      const matchFilter = filter === "all" || (filter === "public" && f.is_public) || (filter === "private" && !f.is_public);
      const q = query.toLowerCase();
      const matchQuery = !q || f.name.toLowerCase().includes(q) || (f.category ?? "").toLowerCase().includes(q);
      return matchFilter && matchQuery;
    });
  }, [files, query, filter]);

  const fileUrl = (path: string) => supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">File Manager</h1>
        <p className="text-muted-foreground mt-1">Upload, organize, and control visibility of your files.</p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/30"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FileUp className="h-7 w-7" />
          </div>
          <div>
            <p className="font-medium">{isDragActive ? "Drop files here…" : "Drag & drop files here, or click to browse"}</p>
            <p className="text-sm text-muted-foreground mt-1">Images, videos, audio, PDFs, documents — any file type, any size.</p>
          </div>
        </div>

        {uploading && uploadProgress.length > 0 && (
          <div className="mt-6 space-y-2 text-left max-w-md mx-auto">
            {uploadProgress.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                <span className="text-sm truncate flex-1">{p.name}</span>
                <span className="text-xs text-muted-foreground">{p.progress}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search files…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          {(["all", "public", "private"] as const).map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className="capitalize">{f}</Button>
          ))}
        </div>
      </div>

      {/* File list */}
      {filtered === null ? (
        <div className="rounded-xl border border-border divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="font-medium">No files found.</p>
          <p className="text-sm text-muted-foreground mt-1">Upload files using the dropzone above.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((f) => (
            <Card key={f.id} className="p-4 hover:border-primary/40 transition-colors group">
              {f.mime_type?.startsWith("image/") && (
                <button onClick={() => setPreviewFile(f)} className="mb-3 block w-full overflow-hidden rounded-lg">
                  <img src={fileUrl(f.storage_path)} alt={f.name} className="h-28 w-full object-cover transition-transform group-hover:scale-105" />
                </button>
              )}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-lg">{ICONS[fileIcon(f.mime_type ?? "")]}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate" title={f.name}>{f.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatBytes(f.size)} · {formatDate(f.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <Switch checked={f.is_public} onCheckedChange={() => togglePublic(f)} />
                  <span className={`text-xs font-medium flex items-center gap-1 ${f.is_public ? "text-success" : "text-muted-foreground"}`}>
                    {f.is_public ? <><Globe className="h-3 w-3" /> Public</> : <><Lock className="h-3 w-3" /> Private</>}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditFile(f); setEditName(f.name); setEditCategory(f.category ?? ""); setEditDescription(f.description ?? ""); }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <a href={fileUrl(f.storage_path)} download={f.name} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-3.5 w-3.5" /></Button>
                  </a>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteFile(f)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editFile} onOpenChange={(open) => !open && setEditFile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit file</DialogTitle>
            <DialogDescription>Update the file name, category, and description.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-category">Category</Label>
              <Input id="edit-category" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} placeholder="e.g. documents, images" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-description">Description</Label>
              <Input id="edit-description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Optional description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditFile(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={!!deleteFile} onOpenChange={(open) => !open && setDeleteFile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete file?</DialogTitle>
            <DialogDescription>This will permanently delete "{deleteFile?.name}" from storage and the database. This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteFile(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}><Trash2 className="h-4 w-4" /> Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview dialog */}
      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="max-w-3xl p-0">
          <DialogTitle className="sr-only">{previewFile?.name}</DialogTitle>
          {previewFile && (
            <div className="flex items-center justify-center bg-black/30 p-4 min-h-[200px] max-h-[75vh] overflow-auto rounded-xl">
              {previewFile.mime_type?.startsWith("image/") && <img src={fileUrl(previewFile.storage_path)} alt={previewFile.name} className="max-w-full max-h-[70vh] rounded-lg object-contain" />}
              {previewFile.mime_type?.startsWith("video/") && <video src={fileUrl(previewFile.storage_path)} controls autoPlay className="max-w-full max-h-[70vh] rounded-lg" />}
              {previewFile.mime_type?.startsWith("audio/") && <audio src={fileUrl(previewFile.storage_path)} controls autoPlay />}
              {previewFile.mime_type?.includes("pdf") && <iframe src={fileUrl(previewFile.storage_path)} title={previewFile.name} className="w-full h-[70vh] rounded-lg" />}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

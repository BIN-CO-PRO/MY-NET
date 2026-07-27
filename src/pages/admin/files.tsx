import { useMemo, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { CloudUpload as UploadCloud, Search, Eye, EyeOff, Trash2, Pencil, Download, Loader as Loader2, Files, FileX, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { useFiles } from "@/lib/use-files";
import { useToast } from "@/components/ui/toast";
import { supabase, STORAGE_BUCKET } from "@/lib/supabase";
import { cn, formatBytes, formatRelative, fileIcon } from "@/lib/utils";
import type { FileRecord } from "@/lib/types";

const ICONS: Record<string, string> = {
  image: "🖼️", video: "🎬", audio: "🎵", pdf: "📄", archive: "🗜️", code: "💻", file: "📄",
};

type Visibility = "all" | "public" | "private";

export default function AdminFiles() {
  const { files, loading, togglePublic, rename, updateMeta, remove, upload } = useFiles();
  const { toast } = useToast();

  const [query, setQuery] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("all");
  const [category, setCategory] = useState("All");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadPublic, setUploadPublic] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("");

  const [editing, setEditing] = useState<FileRecord | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCat, setEditCat] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<FileRecord | null>(null);

  const onDrop = async (accepted: File[], rejected: FileRejection[]) => {
    if (rejected.length) {
      toast({
        title: "Some files rejected",
        description: rejected.map((r) => r.file.name).join(", "),
        variant: "warning",
      });
    }
    if (accepted.length === 0) return;
    setUploading(true);
    setProgress(0);
    let done = 0;
    const total = accepted.length;
    const { error } = await upload(accepted, {
      isPublic: uploadPublic,
      category: uploadCategory.trim() || null,
      onProgress: () => {
        done += 1;
        setProgress(Math.round((done / total) * 100));
      },
    });
    setUploading(false);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Upload complete", description: `${accepted.length} file(s) added.`, variant: "success" });
      setProgress(0);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: uploading,
  });

  const categories = useMemo(() => {
    if (!files) return ["All"];
    const set = new Set(files.map((f) => f.category).filter(Boolean) as string[]);
    return ["All", ...Array.from(set)];
  }, [files]);

  const filtered = useMemo(() => {
    if (!files) return null;
    return files.filter((f) => {
      const matchVis =
        visibility === "all" || (visibility === "public" && f.is_public) || (visibility === "private" && !f.is_public);
      const matchCat = category === "All" || f.category === category;
      const q = query.toLowerCase();
      const matchQuery = !q || f.name.toLowerCase().includes(q) || (f.description ?? "").toLowerCase().includes(q);
      return matchVis && matchCat && matchQuery;
    });
  }, [files, visibility, category, query]);

  const openEdit = (f: FileRecord) => {
    setEditing(f);
    setEditName(f.name);
    setEditDesc(f.description ?? "");
    setEditCat(f.category ?? "");
  };

  const saveEdit = async () => {
    if (!editing) return;
    const { error } = await updateMeta(editing.id, {
      description: editDesc.trim() || undefined,
      category: editCat.trim() || undefined,
    });
    if (editName !== editing.name) await rename(editing.id, editName.trim());
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "File updated", variant: "success" });
      setEditing(null);
    }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    const { error } = await remove(confirmDelete.id, confirmDelete.storage_path);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "File deleted", description: confirmDelete.name, variant: "success" });
    }
    setConfirmDelete(null);
  };

  const downloadUrl = (path: string) => supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">File Manager</h1>
          <p className="text-muted-foreground mt-1">Upload, organize, and control visibility of your files.</p>
        </div>
        {files && (
          <Badge variant="secondary">{files.length} files · {formatBytes(files.reduce((s, f) => s + f.size_bytes, 0))}</Badge>
        )}
      </div>

      {/* Dropzone */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Switch checked={uploadPublic} onCheckedChange={setUploadPublic} id="upPublic" />
              <Label htmlFor="upPublic" className="text-sm cursor-pointer">
                New uploads {uploadPublic ? "public" : "private"}
              </Label>
            </div>
            <Input
              placeholder="Category (optional, e.g. Reports)"
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="sm:max-w-xs"
            />
          </div>
          <div
            {...getRootProps()}
            className={cn(
              "relative rounded-2xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
              isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30",
              uploading && "pointer-events-none opacity-70"
            )}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div className="space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-sm font-medium">Uploading… {progress}%</p>
                <div className="mx-auto max-w-sm h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="font-medium">
                  {isDragActive ? "Drop files here" : "Drag & drop files, or click to browse"}
                </p>
                <p className="text-xs text-muted-foreground">Multiple files supported · stored in Supabase Storage</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search files…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          {(["all", "public", "private"] as Visibility[]).map((v) => (
            <Button key={v} variant={visibility === v ? "default" : "outline"} size="sm" onClick={() => setVisibility(v)}>
              {v === "all" ? "All" : v === "public" ? <><Eye className="h-4 w-4" /> Public</> : <><EyeOff className="h-4 w-4" /> Private</>}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Button key={c} variant={category === c ? "secondary" : "ghost"} size="sm" onClick={() => setCategory(c)}>
              {c}
            </Button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading || filtered === null ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></CardContent></Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileX className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="font-medium">No files match.</p>
            <p className="text-sm text-muted-foreground mt-1">Try a different filter or upload new files above.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
            <div className="col-span-5">Name</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Size</div>
            <div className="col-span-1">Visibility</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          <div className="divide-y divide-border">
            {filtered.map((f) => (
              <div key={f.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 px-5 py-4 items-center hover:bg-muted/30 transition-colors">
                <div className="md:col-span-5 flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg">
                    {ICONS[fileIcon(f.mime_type)]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" title={f.name}>{f.name}</p>
                    <p className="text-xs text-muted-foreground">{formatRelative(f.created_at)}</p>
                  </div>
                </div>
                <div className="md:col-span-2">
                  {f.category ? <Badge variant="outline">{f.category}</Badge> : <span className="text-xs text-muted-foreground">—</span>}
                </div>
                <div className="md:col-span-2 text-sm text-muted-foreground">{formatBytes(f.size_bytes)}</div>
                <div className="md:col-span-1">
                  <Switch
                    checked={f.is_public}
                    onCheckedChange={(v) => togglePublic(f.id, v).then(({ error }) =>
                      error ? toast({ title: "Update failed", description: error.message, variant: "destructive" }) :
                      toast({ title: v ? "File is now public" : "File is now private", variant: "success" })
                    )}
                    aria-label="Toggle visibility"
                  />
                </div>
                <div className="md:col-span-2 flex items-center gap-1 md:justify-end">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(f)} aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <a href={downloadUrl(f.storage_path)} download={f.name} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" aria-label="Download">
                      <Download className="h-4 w-4" />
                    </Button>
                  </a>
                  <Button variant="ghost" size="icon" onClick={() => setConfirmDelete(f)} aria-label="Delete" className="hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit file</DialogTitle>
            <DialogDescription>Update the name, description, and category.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="editName">Name</Label>
              <Input id="editName" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="editDesc">Description</Label>
              <Input id="editDesc" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Optional" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="editCat">Category</Label>
              <Input id="editCat" value={editCat} onChange={(e) => setEditCat(e.target.value)} placeholder="Optional" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete file?</DialogTitle>
            <DialogDescription>
              This permanently removes <span className="font-medium text-foreground">{confirmDelete?.name}</span> from storage. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={doDelete}><Trash2 className="h-4 w-4" /> Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

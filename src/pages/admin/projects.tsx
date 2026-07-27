import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Search, Loader as Loader2, FolderOpen, Star, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";
import { useFiles } from "@/lib/use-files";
import { slugify, formatDate, cn } from "@/lib/utils";
import type { Project, FileRecord } from "@/lib/types";

const schema = z.object({
  title: z.string().min(2, "Title is required"),
  summary: z.string().min(5, "Add a short summary"),
  description: z.string().min(10, "Add a description"),
  category: z.string().min(1, "Category required"),
  cover_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  live_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  repo_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  tags: z.string().optional(),
  featured: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export default function AdminProjects() {
  const { toast } = useToast();
  const { files } = useFiles();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Project | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Project | null>(null);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  const {
    register, handleSubmit, reset, setValue, watch, formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { featured: false } });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    setProjects(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!projects) return null;
    const q = query.toLowerCase();
    return projects.filter((p) => !q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [projects, query]);

  const openNew = () => {
    setEditing(null);
    reset({ title: "", summary: "", description: "", category: "", cover_url: "", live_url: "", repo_url: "", tags: "", featured: false });
    setSelectedFileIds([]);
    setOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditing(p);
    reset({
      title: p.title, summary: p.summary, description: p.description, category: p.category,
      cover_url: p.cover_url ?? "", live_url: p.live_url ?? "", repo_url: p.repo_url ?? "",
      tags: (p.tags ?? []).join(", "), featured: p.featured,
    });
    setSelectedFileIds(p.file_ids ?? []);
    setOpen(true);
  };

  const onSubmit = async (v: FormValues) => {
    setSaving(true);
    const tags = (v.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean);
    const payload = {
      slug: slugify(v.title),
      title: v.title,
      summary: v.summary,
      description: v.description,
      category: v.category,
      cover_url: v.cover_url || null,
      live_url: v.live_url || null,
      repo_url: v.repo_url || null,
      tags,
      featured: v.featured,
      file_ids: selectedFileIds,
    };
    let error;
    if (editing) {
      ({ error } = await supabase.from("projects").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("projects").insert(payload));
    }
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editing ? "Project updated" : "Project created", variant: "success" });
      setOpen(false);
      load();
    }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    const { error } = await supabase.from("projects").delete().eq("id", confirmDelete.id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Project deleted", variant: "success" });
      load();
    }
    setConfirmDelete(null);
  };

  const toggleFile = (id: string) => {
    setSelectedFileIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">Create, edit, and publish case studies.</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4" /> New project</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search projects…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
      </div>

      {loading || !filtered ? (
        <Card><CardContent className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></CardContent></Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FolderOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="font-medium">No projects yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Click "New project" to add your first case study.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <div className="aspect-[16/10] bg-gradient-to-br from-muted to-muted/30 overflow-hidden">
                {p.cover_url ? <img src={p.cover_url} alt={p.title} className="h-full w-full object-cover" /> : (
                  <div className="flex h-full items-center justify-center text-muted-foreground"><FolderOpen className="h-8 w-8" /></div>
                )}
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{p.category}</Badge>
                  {p.featured && <Badge variant="accent"><Star className="h-3 w-3" /> Featured</Badge>}
                </div>
                <h3 className="font-display font-semibold leading-tight">{p.title}</h3>
                <p className="text-xs text-muted-foreground">{formatDate(p.created_at)}</p>
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /> Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(p)} className="hover:text-destructive"><Trash2 className="h-4 w-4" /> Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Editor dialog */}
      <Dialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit project" : "New project"}</DialogTitle>
            <DialogDescription>Fill in the case study details. Attach public files to showcase.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...register("title")} />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Input id="category" placeholder="e.g. AI, EV, Fabrication" {...register("category")} />
                {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input id="tags" placeholder="robotics, vision" {...register("tags")} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="summary">Summary</Label>
                <Input id="summary" placeholder="One-line summary" {...register("summary")} />
                {errors.summary && <p className="text-xs text-destructive">{errors.summary.message}</p>}
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={5} {...register("description")} />
                {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cover_url">Cover image URL</Label>
                <Input id="cover_url" placeholder="https://…" {...register("cover_url")} />
                {errors.cover_url && <p className="text-xs text-destructive">{errors.cover_url.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="live_url">Live URL</Label>
                <Input id="live_url" placeholder="https://…" {...register("live_url")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="repo_url">Repo URL</Label>
                <Input id="repo_url" placeholder="https://…" {...register("repo_url")} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch id="featured" {...register("featured")} />
                <Label htmlFor="featured">Featured project</Label>
              </div>
            </div>

            {/* Attach files */}
            <div className="space-y-2">
              <Label>Attach public files</Label>
              <div className="max-h-40 overflow-y-auto scrollbar-thin rounded-lg border border-border divide-y divide-border">
                {(files ?? []).filter((f) => f.is_public).length === 0 ? (
                  <p className="p-3 text-sm text-muted-foreground">No public files available. Upload and mark files public first.</p>
                ) : (
                  (files ?? []).filter((f) => f.is_public).map((f: FileRecord) => (
                    <label key={f.id} className="flex items-center gap-3 p-2.5 hover:bg-muted/40 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFileIds.includes(f.id)}
                        onChange={() => toggleFile(f.id)}
                        className="h-4 w-4 rounded accent-[hsl(var(--primary))]"
                      />
                      <span className="text-sm flex-1 truncate">{f.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {editing ? "Save changes" : "Create project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete project?</DialogTitle>
            <DialogDescription>
              This permanently removes <span className="font-medium text-foreground">{confirmDelete?.title}</span>.
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

import { useCallback, useEffect, useState } from "react";
import {
  FolderOpen, Plus, Pencil, Trash2, Search, X, Save, Loader as Loader2, Star,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";
import { formatDate, slugify } from "@/lib/utils";
import { CardSkeleton } from "@/components/ui/skeleton";
import type { Project } from "@/lib/types";

const EMPTY = {
  title: "", slug: "", description: "", content: "", cover_image: "",
  tags: "", technologies: "", is_featured: false, status: "published" as const,
};

export default function AdminProjects() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<typeof EMPTY | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteProj, setDeleteProj] = useState<Project | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    setProjects(data ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing({ ...EMPTY }); setEditId(null); };
  const openEdit = (p: Project) => {
    setEditing({
      title: p.title, slug: p.slug, description: p.description ?? "", content: p.content ?? "",
      cover_image: p.cover_image ?? "", tags: (p.tags ?? []).join(", "), technologies: (p.technologies ?? []).join(", "),
      is_featured: p.is_featured, status: p.status as "published",
    });
    setEditId(p.id);
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim()) { toast({ title: "Title is required", variant: "destructive" }); return; }
    setSaving(true);
    const slug = editing.slug.trim() || slugify(editing.title);
    const tags = editing.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const technologies = editing.technologies.split(",").map((t) => t.trim()).filter(Boolean);

    const payload = {
      title: editing.title,
      slug,
      description: editing.description || null,
      content: editing.content || null,
      cover_image: editing.cover_image || null,
      tags, technologies,
      is_featured: editing.is_featured,
      status: editing.status,
    };

    const { error } = editId
      ? await supabase.from("projects").update(payload).eq("id", editId)
      : await supabase.from("projects").insert(payload);

    setSaving(false);
    if (error) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); return; }
    setEditing(null);
    setEditId(null);
    load();
    toast({ title: editId ? "Project updated" : "Project created", variant: "success" });
  };

  const confirmDelete = async () => {
    if (!deleteProj) return;
    const { error } = await supabase.from("projects").delete().eq("id", deleteProj.id);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    setProjects((prev) => prev?.filter((p) => p.id !== deleteProj.id) ?? null);
    setDeleteProj(null);
    toast({ title: "Project deleted", variant: "destructive" });
  };

  const filtered = projects?.filter((p) => {
    const q = query.toLowerCase();
    return !q || p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
  }) ?? null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Projects Manager</h1>
          <p className="text-muted-foreground mt-1">Create, edit, and manage your portfolio projects.</p>
        </div>
        <Button onClick={openNew} className="group"><Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" /> New project</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search projects…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9 max-w-sm" />
      </div>

      {filtered === null ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <FolderOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="font-medium">No projects yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Click "New project" to create one.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <Card key={p.id} className="overflow-hidden hover:border-primary/40 transition-colors group">
              <div className="aspect-[16/10] bg-gradient-to-br from-muted to-muted/20 overflow-hidden relative">
                {p.cover_image ? (
                  <img src={p.cover_image} alt={p.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground"><FolderOpen className="h-8 w-8" /></div>
                )}
                {p.is_featured && <div className="absolute top-2 right-2"><Badge variant="accent"><Star className="h-3 w-3" /></Badge></div>}
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-sm leading-tight">{p.title}</h3>
                  <Badge variant={p.status === "published" ? "success" : "secondary"} className="capitalize shrink-0">{p.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                <p className="text-xs text-muted-foreground">{formatDate(p.created_at)}</p>
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteProj(p)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit/Create dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit project" : "New project"}</DialogTitle>
            <DialogDescription>{editId ? "Update the project details." : "Fill in the details for your new project."}</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="p-title">Title</Label>
                <Input id="p-title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editId ? editing.slug : slugify(e.target.value) })} placeholder="Project title" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-slug">Slug</Label>
                <Input id="p-slug" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="url-friendly-slug" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-desc">Summary</Label>
                <Input id="p-desc" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Short description" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-content">Content</Label>
                <Textarea id="p-content" rows={5} value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} placeholder="Full case study content…" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-cover">Cover image URL</Label>
                <Input id="p-cover" value={editing.cover_image} onChange={(e) => setEditing({ ...editing, cover_image: e.target.value })} placeholder="https://…" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="p-tags">Tags (comma-separated)</Label>
                  <Input id="p-tags" value={editing.tags} onChange={(e) => setEditing({ ...editing, tags: e.target.value })} placeholder="AI, EV, Fabrication" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p-tech">Technologies (comma-separated)</Label>
                  <Input id="p-tech" value={editing.technologies} onChange={(e) => setEditing({ ...editing, technologies: e.target.value })} placeholder="Python, React, Arduino" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch id="p-featured" checked={editing.is_featured} onCheckedChange={(v) => setEditing({ ...editing, is_featured: v })} />
                <Label htmlFor="p-featured">Featured project</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {editId ? "Save changes" : "Create project"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={!!deleteProj} onOpenChange={(open) => !open && setDeleteProj(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete project?</DialogTitle>
            <DialogDescription>This will permanently delete "{deleteProj?.title}". This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteProj(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}><Trash2 className="h-4 w-4" /> Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

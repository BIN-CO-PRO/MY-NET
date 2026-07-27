import { useEffect, useState, useCallback } from "react";
import { supabase, STORAGE_BUCKET } from "./supabase";
import type { FileRecord } from "./types";

export function useFiles() {
  const [files, setFiles] = useState<FileRecord[] | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setFiles(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const togglePublic = useCallback(async (id: string, value: boolean) => {
    const { error } = await supabase.from("files").update({ is_public: value, updated_at: new Date().toISOString() }).eq("id", id);
    if (!error) setFiles((prev) => prev?.map((f) => (f.id === id ? { ...f, is_public: value } : f)) ?? null);
    return { error };
  }, []);

  const rename = useCallback(async (id: string, name: string) => {
    const { error } = await supabase.from("files").update({ name, updated_at: new Date().toISOString() }).eq("id", id);
    if (!error) setFiles((prev) => prev?.map((f) => (f.id === id ? { ...f, name } : f)) ?? null);
    return { error };
  }, []);

  const updateMeta = useCallback(async (id: string, meta: { description?: string; category?: string }) => {
    const { error } = await supabase.from("files").update({ ...meta, updated_at: new Date().toISOString() }).eq("id", id);
    if (!error) setFiles((prev) => prev?.map((f) => (f.id === id ? { ...f, ...meta } : f)) ?? null);
    return { error };
  }, []);

  const remove = useCallback(async (id: string, storagePath: string) => {
    const { error: storageError } = await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
    if (storageError) {
      // still attempt DB delete
    }
    const { error } = await supabase.from("files").delete().eq("id", id);
    if (!error) setFiles((prev) => prev?.filter((f) => f.id !== id) ?? null);
    return { error };
  }, []);

  const upload = useCallback(async (files: File[], opts: { isPublic: boolean; category: string | null; onProgress?: (pct: number) => void }) => {
    const created: FileRecord[] = [];
    for (const file of files) {
      const ext = file.name.split(".").pop() ?? "";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) {
        opts.onProgress?.(0);
        return { error: upErr };
      }
      const { data, error } = await supabase
        .from("files")
        .insert({
          name: file.name,
          storage_path: path,
          mime_type: file.type || "application/octet-stream",
          size_bytes: file.size,
          is_public: opts.isPublic,
          category: opts.category,
        })
        .select("*")
        .single();
      if (error) {
        await supabase.storage.from(STORAGE_BUCKET).remove([path]);
        return { error };
      }
      if (data) created.push(data);
    }
    setFiles((prev) => [...created, ...(prev ?? [])]);
    return { error: null };
  }, []);

  return { files, loading, togglePublic, rename, updateMeta, remove, upload, reload: load };
}

import { useEffect, useState } from "react";
import { Save, Loader as Loader2, User, Link as LinkIcon, Award, Brain, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";
import { useProfile } from "@/lib/use-profile";
import type { Profile } from "@/lib/types";

export default function AdminProfile() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Profile>>({});

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name,
        title: profile.title,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        location: profile.location,
        email: profile.email,
        phone: profile.phone,
        social_links: profile.social_links,
        certifications: profile.certifications,
        skills: profile.skills,
        journey: profile.journey,
      });
    }
  }, [profile]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({ id: user.id, ...form });
    setSaving(false);
    if (error) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Profile updated", variant: "success" });
  };

  const updateSocial = (key: string, value: string) => {
    setForm({ ...form, social_links: { ...(form.social_links ?? {}), [key]: value } });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Update your public profile information.</p>
      </div>

      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Basic Information</CardTitle>
          <CardDescription>Your name, title, and bio shown on the site.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="f-name">Full Name</Label>
              <Input id="f-name" value={form.full_name ?? ""} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-title">Title / Tagline</Label>
              <Input id="f-title" value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="f-bio">Bio</Label>
            <Textarea id="f-bio" rows={5} value={form.bio ?? ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="f-location">Location</Label>
              <Input id="f-location" value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-email">Email</Label>
              <Input id="f-email" type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-phone">Phone</Label>
              <Input id="f-phone" value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="f-avatar">Avatar URL</Label>
            <Input id="f-avatar" value={form.avatar_url ?? ""} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} placeholder="https://…" />
          </div>
        </CardContent>
      </Card>

      {/* Social links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><LinkIcon className="h-4 w-4 text-primary" /> Social Links</CardTitle>
          <CardDescription>Your social media profiles shown in the navbar and footer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {["linkedin", "x", "instagram", "tiktok", "threads", "orcid"].map((key) => (
            <div key={key} className="flex items-center gap-3">
              <span className="w-20 text-sm text-muted-foreground capitalize">{key}</span>
              <Input value={(form.social_links as Record<string, string>)?.[key] ?? ""} onChange={(e) => updateSocial(key, e.target.value)} placeholder={`https://${key}.com/…`} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} size="lg" className="group">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save changes
        </Button>
      </div>
    </div>
  );
}

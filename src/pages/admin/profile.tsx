import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader as Loader2, Save, KeyRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/lib/use-profile";
import type { Profile } from "@/lib/types";

const schema = z.object({
  full_name: z.string().min(2),
  tagline: z.string().min(5),
  bio: z.string().min(20),
  location: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal("")),
  photo_url: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().optional().or(z.literal("")),
  x: z.string().optional().or(z.literal("")),
  instagram: z.string().optional().or(z.literal("")),
  tiktok: z.string().optional().or(z.literal("")),
  threads: z.string().optional().or(z.literal("")),
  orcid: z.string().optional().or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

export default function AdminProfile() {
  const { toast } = useToast();
  const { session } = useAuth();
  const { profile } = useProfile();
  const [saving, setSaving] = useState(false);
  const [pwd, setPwd] = useState({ new: "", confirm: "" });
  const [pwdSaving, setPwdSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name,
        tagline: profile.tagline,
        bio: profile.bio,
        location: profile.location,
        email: profile.email,
        phone: profile.phone ?? "",
        photo_url: profile.photo_url ?? "",
        linkedin: profile.social_links?.linkedin ?? "",
        x: profile.social_links?.x ?? "",
        instagram: profile.social_links?.instagram ?? "",
        tiktok: profile.social_links?.tiktok ?? "",
        threads: profile.social_links?.threads ?? "",
        orcid: profile.social_links?.orcid ?? "",
      });
    }
  }, [profile, reset]);

  const onSubmit = async (v: FormValues) => {
    setSaving(true);
    const social_links = {
      linkedin: v.linkedin || null,
      x: v.x || null,
      instagram: v.instagram || null,
      tiktok: v.tiktok || null,
      threads: v.threads || null,
      orcid: v.orcid || null,
    };
    const payload = {
      full_name: v.full_name,
      tagline: v.tagline,
      bio: v.bio,
      location: v.location,
      email: v.email,
      phone: v.phone || null,
      photo_url: v.photo_url || null,
      social_links,
      updated_at: new Date().toISOString(),
    };
    let error;
    if (profile?.id) {
      ({ error } = await supabase.from("profiles").update(payload).eq("id", profile.id));
    } else {
      ({ error } = await supabase.from("profiles").insert({ ...payload, id: session?.user?.id }));
    }
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated", variant: "success" });
    }
  };

  const changePassword = async () => {
    if (pwd.new.length < 6) {
      toast({ title: "Password too short", description: "Use at least 6 characters.", variant: "warning" });
      return;
    }
    if (pwd.new !== pwd.confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setPwdSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pwd.new });
    setPwdSaving(false);
    if (error) {
      toast({ title: "Password update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated", variant: "success" });
      setPwd({ new: "", confirm: "" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Profile settings</h1>
        <p className="text-muted-foreground mt-1">Update your public profile, bio, and social links.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Identity</CardTitle>
            <CardDescription>How you appear across the public site.</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" {...register("full_name")} />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" {...register("tagline")} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" rows={6} {...register("bio")} />
              {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register("location")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Public email</Label>
              <Input id="email" type="email" {...register("email")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" {...register("phone")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="photo_url">Photo URL (optional)</Label>
              <Input id="photo_url" placeholder="https://…" {...register("photo_url")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Social links</CardTitle>
            <CardDescription>Shown in the navbar and footer on every page.</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label htmlFor="linkedin">LinkedIn</Label><Input id="linkedin" placeholder="https://linkedin.com/in/…" {...register("linkedin")} /></div>
            <div className="space-y-1.5"><Label htmlFor="x">X</Label><Input id="x" placeholder="https://x.com/…" {...register("x")} /></div>
            <div className="space-y-1.5"><Label htmlFor="instagram">Instagram</Label><Input id="instagram" placeholder="https://instagram.com/…" {...register("instagram")} /></div>
            <div className="space-y-1.5"><Label htmlFor="tiktok">TikTok</Label><Input id="tiktok" placeholder="https://tiktok.com/@…" {...register("tiktok")} /></div>
            <div className="space-y-1.5"><Label htmlFor="threads">Threads</Label><Input id="threads" placeholder="https://threads.net/@…" {...register("threads")} /></div>
            <div className="space-y-1.5"><Label htmlFor="orcid">ORCID</Label><Input id="orcid" placeholder="https://orcid.org/…" {...register("orcid")} /></div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save profile
          </Button>
        </div>
      </form>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><KeyRound className="h-4 w-4 text-primary" /> Change password</CardTitle>
          <CardDescription>Update your admin account password.</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="newPwd">New password</Label>
            <Input id="newPwd" type="password" value={pwd.new} onChange={(e) => setPwd((p) => ({ ...p, new: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPwd">Confirm password</Label>
            <Input id="confirmPwd" type="password" value={pwd.confirm} onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))} />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button variant="outline" onClick={changePassword} disabled={pwdSaving}>
              {pwdSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Update password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

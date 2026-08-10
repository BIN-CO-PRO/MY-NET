import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, MapPin, Send, Loader as Loader2, CircleCheck as CheckCircle2, MessageSquare, Clock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SocialIcons } from "@/components/social-icons";
import { useProfile } from "@/lib/use-profile";
import { useToast } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
  subject: z.string().min(3, "Add a short subject"),
  message: z.string().min(10, "Message should be at least 10 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function ContactPage() {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    const { error } = await supabase.from("contact_messages").insert({
      name: values.name,
      email: values.email,
      subject: values.subject,
      message: values.message,
    });

    if (error) {
      toast({ title: "Something went wrong", description: "Please try again later.", variant: "destructive" });
      return;
    }

    setSent(true);
    reset();
    toast({ title: "Message sent", description: `Thanks ${values.name.split(" ")[0]} — I'll get back to you soon.`, variant: "success" });
  };

  return (
    <div className="animate-fade-in">
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="absolute left-1/3 top-0 h-[300px] w-[400px] rounded-full bg-primary/8 blur-[120px]" />
        </div>
        <div className="container py-16 md:py-20">
          <Badge className="mb-4">Contact</Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">Let's talk</h1>
          <p className="text-muted-foreground mt-3 text-lg max-w-2xl">Have a project, question, or collaboration in mind? Send a message and I'll reply by email.</p>
        </div>
      </section>

      <section className="container py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="glow-card">
              <CardContent className="p-6 md:p-8">
                {sent ? (
                  <div className="text-center py-16 animate-scale-in">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success mb-4">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h3 className="font-display text-xl font-semibold">Message sent</h3>
                    <p className="text-muted-foreground mt-1.5">Thank you — I'll be in touch shortly.</p>
                    <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>Send another</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="Your name" {...register("name")} />
                        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
                        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" placeholder="What's this about?" {...register("subject")} />
                      {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" rows={6} placeholder="Tell me about your idea…" {...register("message")} />
                      {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
                    </div>
                    <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto group">
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                      Send message
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="glow-card">
              <CardContent className="p-6 space-y-5">
                <h3 className="font-display font-semibold flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" /> Direct</h3>
                {profile?.email && (
                  <a href={`mailto:${profile.email}`} className="flex items-center gap-3 text-sm hover:text-primary transition-colors group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform"><Mail className="h-4 w-4" /></div>
                    <span className="truncate">{profile.email}</span>
                  </a>
                )}
                {profile?.location && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent"><MapPin className="h-4 w-4" /></div>
                    {profile.location}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glow-card">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-display font-semibold flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Response time</h3>
                <p className="text-sm text-muted-foreground">Usually within 24–48 hours. For urgent matters, reach out on social media.</p>
                <div className="pt-2 border-t border-border">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-1.5"><Globe className="h-3 w-3" /> Follow</p>
                  <SocialIcons links={profile?.social_links} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

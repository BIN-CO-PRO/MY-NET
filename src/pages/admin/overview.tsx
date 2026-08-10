import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FolderOpen, FileText, Users, Mail, TrendingUp, Eye, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { formatDateTime } from "@/lib/utils";
import type { Visitor, ContactMessage } from "@/lib/types";

interface Stats {
  projects: number;
  files: number;
  publicFiles: number;
  visitors: number;
  messages: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentVisitors, setRecentVisitors] = useState<Visitor[]>([]);
  const [recentMessages, setRecentMessages] = useState<ContactMessage[]>([]);

  useEffect(() => {
    (async () => {
      const [p, f, v, m] = await Promise.all([
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase.from("files").select("*", { count: "exact", head: true }),
        supabase.from("visitors").select("*", { count: "exact", head: true }),
        supabase.from("contact_messages").select("*", { count: "exact", head: true }),
      ]);
      const pubFiles = await supabase.from("files").select("*", { count: "exact", head: true }).eq("is_public", true);
      setStats({
        projects: p.count ?? 0,
        files: f.count ?? 0,
        publicFiles: pubFiles.count ?? 0,
        visitors: v.count ?? 0,
        messages: m.count ?? 0,
      });

      const { data: vData } = await supabase.from("visitors").select("*").order("created_at", { ascending: false }).limit(5);
      setRecentVisitors(vData ?? []);
      const { data: mData } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(5);
      setRecentMessages(mData ?? []);
    })();
  }, []);

  const cards = [
    { label: "Projects", value: stats?.projects ?? "—", icon: FolderOpen, color: "text-primary", bg: "bg-primary/10" },
    { label: "Total Files", value: stats?.files ?? "—", icon: FileText, color: "text-accent", bg: "bg-accent/10" },
    { label: "Public Files", value: stats?.publicFiles ?? "—", icon: FileText, color: "text-success", bg: "bg-success/10" },
    { label: "Visitors", value: stats?.visitors ?? "—", icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Messages", value: stats?.messages ?? "—", icon: Mail, color: "text-accent", bg: "bg-accent/10" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">A quick look at your platform activity.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="glow-card">
            <CardContent className="p-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.bg} ${c.color} mb-3`}>
                <c.icon className="h-5 w-5" />
              </div>
              <p className="font-display text-2xl font-bold">{c.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent visitors */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base flex items-center gap-2"><Eye className="h-4 w-4 text-primary" /> Recent visitors</CardTitle>
          <Button asChild variant="ghost" size="sm" className="group">
            <Link to="/admin/visitors">View all <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentVisitors.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No visitors recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {recentVisitors.map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-xs font-medium">{v.country?.[0] ?? "?"}</div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{v.page}</p>
                      <p className="text-xs text-muted-foreground">{v.device} · {v.browser}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{formatDateTime(v.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent messages */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> Recent messages</CardTitle>
          <Badge variant="secondary">{stats?.messages ?? 0} total</Badge>
        </CardHeader>
        <CardContent>
          {recentMessages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No messages received yet.</p>
          ) : (
            <div className="space-y-2">
              {recentMessages.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{m.subject}</p>
                    <p className="text-xs text-muted-foreground">{m.name} · {m.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!m.is_read && <Badge variant="accent">New</Badge>}
                    <span className="text-xs text-muted-foreground">{formatDateTime(m.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Mail, Trash2, CircleCheck, Circle, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";
import { formatDateTime } from "@/lib/utils";
import type { ContactMessage } from "@/lib/types";

export default function AdminMessages() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const load = async () => {
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    setMessages(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: string, isRead: boolean) => {
    await supabase.from("contact_messages").update({ is_read: !isRead }).eq("id", id);
    load();
  };

  const deleteMsg = async (id: string) => {
    await supabase.from("contact_messages").delete().eq("id", id);
    toast({ title: "Message deleted", variant: "success" });
    load();
  };

  const filtered = messages?.filter((m) => {
    const matchFilter = filter === "all" || !m.is_read;
    const q = query.toLowerCase();
    const matchQuery = !q || m.message.toLowerCase().includes(q) || m.name.toLowerCase().includes(q) || (m.subject ?? "").toLowerCase().includes(q);
    return matchFilter && matchQuery;
  }) ?? null;

  const unreadCount = messages?.filter((m) => !m.is_read).length ?? 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground mt-1">All messages from the message box and contact form.</p>
        </div>
        <Badge variant="accent">{unreadCount} unread</Badge>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search messages…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>All</Button>
          <Button variant={filter === "unread" ? "default" : "outline"} size="sm" onClick={() => setFilter("unread")}>Unread</Button>
        </div>
      </div>

      {filtered === null ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-20 text-center">
          <Mail className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="font-medium">No messages yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Messages from the message box will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <Card key={m.id} className={`transition-all hover:border-primary/30 ${!m.is_read ? "border-primary/30 bg-primary/5" : ""}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {!m.is_read && <Badge variant="accent">New</Badge>}
                      <span className="text-sm font-medium">{m.name}</span>
                      {m.email && <span className="text-xs text-muted-foreground">· {m.email}</span>}
                    </div>
                    {m.subject && <p className="text-xs text-muted-foreground">{m.subject}</p>}
                    <p className="text-sm leading-relaxed whitespace-pre-line">{m.message}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(m.created_at)}</p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => markRead(m.id, m.is_read)} title={m.is_read ? "Mark as unread" : "Mark as read"}>
                      {m.is_read ? <Circle className="h-4 w-4" /> : <CircleCheck className="h-4 w-4 text-success" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMsg(m.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

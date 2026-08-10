import { useEffect, useMemo, useState } from "react";
import { Users, Search, Globe, Monitor, Smartphone, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { formatDateTime } from "@/lib/utils";
import { RowSkeleton } from "@/components/ui/skeleton";
import type { Visitor } from "@/lib/types";

export default function AdminVisitors() {
  const [visitors, setVisitors] = useState<Visitor[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("visitors").select("*").order("created_at", { ascending: false }).limit(500);
      setVisitors(data ?? []);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!visitors) return null;
    const q = query.toLowerCase();
    return visitors.filter((v) => {
      return !q ||
        (v.page ?? "").toLowerCase().includes(q) ||
        (v.country ?? "").toLowerCase().includes(q) ||
        (v.ip ?? "").toLowerCase().includes(q) ||
        (v.device ?? "").toLowerCase().includes(q) ||
        (v.browser ?? "").toLowerCase().includes(q);
    });
  }, [visitors, query]);

  const stats = useMemo(() => {
    if (!visitors) return null;
    const countries = new Set(visitors.map((v) => v.country).filter(Boolean));
    const devices = new Set(visitors.map((v) => v.device).filter(Boolean));
    const today = new Date().toDateString();
    const todayCount = visitors.filter((v) => new Date(v.created_at).toDateString() === today).length;
    return { total: visitors.length, countries: countries.size, devices: devices.size, today: todayCount };
  }, [visitors]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Visitor Tracking</h1>
        <p className="text-muted-foreground mt-1">See who's visiting your site and what they're looking at.</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3"><Users className="h-5 w-5" /></div>
            <p className="font-display text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground mt-1">Total visits</p>
          </CardContent></Card>
          <Card><CardContent className="p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent mb-3"><Globe className="h-5 w-5" /></div>
            <p className="font-display text-2xl font-bold">{stats.countries}</p>
            <p className="text-xs text-muted-foreground mt-1">Countries</p>
          </CardContent></Card>
          <Card><CardContent className="p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success mb-3"><Monitor className="h-5 w-5" /></div>
            <p className="font-display text-2xl font-bold">{stats.devices}</p>
            <p className="text-xs text-muted-foreground mt-1">Device types</p>
          </CardContent></Card>
          <Card><CardContent className="p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3"><Clock className="h-5 w-5" /></div>
            <p className="font-display text-2xl font-bold">{stats.today}</p>
            <p className="text-xs text-muted-foreground mt-1">Today</p>
          </CardContent></Card>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by page, country, IP, device…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9 max-w-sm" />
      </div>

      {/* Table */}
      {filtered === null ? (
        <div className="rounded-xl border border-border divide-y divide-border">
          {Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="font-medium">No visitors recorded yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Visitor data will appear here as people visit your site.</p>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">All visitors ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Page</th>
                    <th className="px-4 py-3 font-medium">Country</th>
                    <th className="px-4 py-3 font-medium">IP</th>
                    <th className="px-4 py-3 font-medium">Device</th>
                    <th className="px-4 py-3 font-medium">Browser</th>
                    <th className="px-4 py-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((v) => (
                    <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{v.page}</td>
                      <td className="px-4 py-3">{v.country ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{v.ip ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5">
                          {v.device === "Desktop" ? <Monitor className="h-3.5 w-3.5" /> : <Smartphone className="h-3.5 w-3.5" />}
                          {v.device ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">{v.browser ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDateTime(v.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

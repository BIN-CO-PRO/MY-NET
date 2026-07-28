import { useEffect, useState, useMemo } from "react";
import { Users, Globe, Monitor, Smartphone, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { formatRelative } from "@/lib/utils";
import { RowSkeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import type { Visitor } from "@/lib/types";

export default function AdminVisitors() {
  const [visitors, setVisitors] = useState<Visitor[] | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("visitors")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      setVisitors(data ?? []);
    })();
  }, []);

  const stats = useMemo(() => {
    if (!visitors) return null;
    const uniqueIPs = new Set(visitors.map((v) => v.ip).filter(Boolean));
    const countries = new Set(visitors.map((v) => v.country).filter(Boolean));
    const mobileCount = visitors.filter((v) => v.device === "Mobile").length;
    const desktopCount = visitors.filter((v) => v.device === "Desktop").length;
    return {
      total: visitors.length,
      uniqueIPs: uniqueIPs.size,
      countries: countries.size,
      mobile: mobileCount,
      desktop: desktopCount,
    };
  }, [visitors]);

  const chartData = useMemo(() => {
    if (!visitors) return [];
    const days: { date: string; label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, label: d.toLocaleDateString("en-US", { weekday: "short" }), count: 0 });
    }
    const map = new Map(days.map((d) => [d.date, d]));
    visitors.forEach((v) => {
      const key = v.created_at.slice(0, 10);
      const entry = map.get(key);
      if (entry) entry.count += 1;
    });
    return days;
  }, [visitors]);

  const topPages = useMemo(() => {
    if (!visitors) return [];
    const counts = new Map<string, number>();
    visitors.forEach((v) => counts.set(v.page, (counts.get(v.page) ?? 0) + 1));
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [visitors]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Visitor Analytics</h1>
        <p className="text-muted-foreground mt-1">See who's visiting your site and what they're reading.</p>
      </div>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Total visits</p>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <p className="font-display text-3xl font-bold mt-3">{stats.total}</p>
              <p className="text-xs text-muted-foreground mt-1">Last 200 page views</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Unique visitors</p>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Globe className="h-4 w-4" />
                </div>
              </div>
              <p className="font-display text-3xl font-bold mt-3">{stats.uniqueIPs}</p>
              <p className="text-xs text-muted-foreground mt-1">Distinct IP addresses</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Mobile</p>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Smartphone className="h-4 w-4" />
                </div>
              </div>
              <p className="font-display text-3xl font-bold mt-3">{stats.mobile}</p>
              <p className="text-xs text-muted-foreground mt-1">{stats.desktop} desktop</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Countries</p>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Globe className="h-4 w-4" />
                </div>
              </div>
              <p className="font-display text-3xl font-bold mt-3">{stats.countries}</p>
              <p className="text-xs text-muted-foreground mt-1">Distinct countries</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" /> Visits — last 7 days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: -20, right: 10, top: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                    fontSize: "0.875rem",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Top pages</CardTitle>
          </CardHeader>
          <CardContent>
            {topPages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <div className="space-y-2">
                {topPages.map(([page, count]) => (
                  <div key={page} className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{page}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent visitors</CardTitle>
          </CardHeader>
          <CardContent>
            {visitors === null ? (
              <div className="divide-y divide-border">
                {Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)}
              </div>
            ) : visitors.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No visitors recorded yet.</p>
            ) : (
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground border-b border-border">
                      <th className="pb-2 font-medium">Page</th>
                      <th className="pb-2 font-medium">Country</th>
                      <th className="pb-2 font-medium">Device</th>
                      <th className="pb-2 font-medium">Browser</th>
                      <th className="pb-2 font-medium text-right">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {visitors.slice(0, 20).map((v) => (
                      <tr key={v.id}>
                        <td className="py-2.5 font-medium truncate max-w-[120px]">{v.page}</td>
                        <td className="py-2.5 text-muted-foreground">{v.country ?? "—"}</td>
                        <td className="py-2.5">
                          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                            {v.device === "Mobile" ? <Smartphone className="h-3.5 w-3.5" /> : <Monitor className="h-3.5 w-3.5" />}
                            {v.device ?? "—"}
                          </span>
                        </td>
                        <td className="py-2.5 text-muted-foreground">{v.browser ?? "—"}</td>
                        <td className="py-2.5 text-muted-foreground text-right whitespace-nowrap">{formatRelative(v.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

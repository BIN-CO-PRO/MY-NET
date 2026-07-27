import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Files, FolderOpen, Eye, EyeOff, TrendingUp, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useFiles } from "@/lib/use-files";
import { formatBytes, formatRelative } from "@/lib/utils";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

export default function AdminOverview() {
  const { files } = useFiles();
  const [projectCount, setProjectCount] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { count } = await supabase.from("projects").select("*", { count: "exact", head: true });
      setProjectCount(count ?? 0);
    })();
  }, []);

  const publicCount = files?.filter((f) => f.is_public).length ?? 0;
  const privateCount = files ? files.length - publicCount : 0;
  const totalSize = files?.reduce((sum, f) => sum + f.size_bytes, 0) ?? 0;

  const stats = [
    { label: "Total files", value: files?.length ?? "—", icon: Files, hint: `${formatBytes(totalSize)} stored` },
    { label: "Public files", value: publicCount, icon: Eye, hint: "Visible to everyone" },
    { label: "Private files", value: privateCount, icon: EyeOff, hint: "Admin only" },
    { label: "Projects", value: projectCount ?? "—", icon: FolderOpen, hint: "Published case studies" },
  ];

  // Build a simple 7-day uploads chart from file created_at
  const chartData = (() => {
    const days: { date: string; label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, label: d.toLocaleDateString("en-US", { weekday: "short" }), count: 0 });
    }
    const map = new Map(days.map((d) => [d.date, d]));
    files?.forEach((f) => {
      const key = f.created_at.slice(0, 10);
      const entry = map.get(key);
      if (entry) entry.count += 1;
    });
    return days;
  })();

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">A snapshot of your portfolio and file library.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <s.icon className="h-4 w-4" />
                </div>
              </div>
              <p className="font-display text-3xl font-bold mt-3">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" /> Uploads — last 7 days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: -20, right: 10, top: 5, bottom: 0 }}>
                <defs>
                  <linearGradient id="upGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#upGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent files</CardTitle>
        </CardHeader>
        <CardContent>
          {files === null ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : files.length === 0 ? (
            <p className="text-sm text-muted-foreground">No files yet. Upload some in the File Manager.</p>
          ) : (
            <div className="divide-y divide-border">
              {files.slice(0, 6).map((f) => (
                <div key={f.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${f.is_public ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                    {f.is_public ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(f.size_bytes)} · {formatRelative(f.created_at)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${f.is_public ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                    {f.is_public ? "Public" : "Private"}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link to="/admin/files">Open File Manager <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

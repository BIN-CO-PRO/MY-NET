import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";

function detectDevice(): string {
  const ua = navigator.userAgent;
  if (/tablet|ipad/i.test(ua)) return "Tablet";
  if (/mobi|android|iphone|ipod/i.test(ua)) return "Mobile";
  return "Desktop";
}

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (/edg/i.test(ua)) return "Edge";
  if (/chrome|crios/i.test(ua)) return "Chrome";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua)) return "Safari";
  return "Other";
}

export function useVisitorTracking() {
  const location = useLocation();
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    const path = location.pathname;
    if (trackedRef.current === path) return;
    trackedRef.current = path;

    (async () => {
      let ip: string | null = null;
      let country: string | null = null;
      try {
        const res = await fetch("https://ipapi.co/json/");
        if (res.ok) {
          const data = await res.json();
          ip = data.ip ?? null;
          country = data.country_name ?? null;
        }
      } catch {
        // geolocation is best-effort
      }

      await supabase.from("visitors").insert({
        ip,
        country,
        device: detectDevice(),
        browser: detectBrowser(),
        page: path,
      });
    })();
  }, [location.pathname]);
}

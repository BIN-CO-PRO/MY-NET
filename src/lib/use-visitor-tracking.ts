import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "./supabase";
import { getDeviceInfo } from "./utils";

export function useVisitorTracking() {
  const location = useLocation();
  const lastTracked = useRef<string>("");

  useEffect(() => {
    const path = location.pathname;
    if (lastTracked.current === path) return;
    lastTracked.current = path;

    const { device, browser } = getDeviceInfo();

    (async () => {
      try {
        // Fetch IP and country from a free API
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
          // IP lookup failed — still record the visit without IP
        }

        await supabase.from("visitors").insert({
          ip,
          country,
          device,
          browser,
          page: path,
        });
      } catch {
        // Silently fail — visitor tracking should never break the page
      }
    })();
  }, [location.pathname]);
}

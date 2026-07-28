import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { Profile } from "./types";

const DEFAULT_PROFILE: Profile = {
  id: "",
  full_name: "Bizimana Fils",
  tagline: "Multidisciplinary Technologist · AI Prompt Engineer · EV & Digital Fabrication Specialist",
  bio: "I'm a technologist based in Kigali, Rwanda, with a background in Automobile Technology. I work at the intersection of AI prompt engineering, electric vehicle diagnostics, and digital fabrication — turning ambitious ideas into real, useful artifacts. From designing EV powertrains and running vehicle diagnostics to operating CNC routers and laser cutters, I build across the digital and physical divide. I care about practical innovation that fits the African context and empowers the next generation of makers.",
  photo_url: null,
  location: "Kigali, Rwanda",
  email: "hello@bizimanafils.com",
  phone: null,
  social_links: {
    linkedin: "https://linkedin.com/in/bizimanafils",
    x: "https://x.com/bizimanafils",
    instagram: "https://instagram.com/bizimanafils",
    tiktok: "https://tiktok.com/@bizimanafils",
    threads: "https://threads.net/@bizimanafils",
    orcid: "https://orcid.org/0000-0000-0000-0000",
  },
  certifications: [
    { name: "Advanced AI Prompt Engineering", issuer: "One Million Prompters, Dubai", year: "2024" },
    { name: "Digital Fabrication", issuer: "Hanga Hubs + Rwanda ICT Chamber", year: "2023" },
    { name: "Automobile Technology", issuer: "Technical Institute", year: "2020" },
  ],
  skills: [
    { category: "AI & Prompt Engineering", items: ["AI Prompt Engineering", "LLM Orchestration", "RAG Systems", "AI Workflows", "Automation"] },
    { category: "Electric Vehicles", items: ["EV Technician", "Vehicle Diagnostics", "Battery Systems", "Powertrain Maintenance", "Charging Systems"] },
    { category: "Digital Fabrication", items: ["Laser Cutting", "CNC Router", "Embroidery Digitizing", "3D Printing", "PCB Design"] },
    { category: "Design & Software", items: ["Krita", "GIMP", "Inkscape", "Aspire", "Web Development", "UI/UX Planning"] },
  ],
  journey: [
    { year: "2024", title: "Founder, Bizimana Idea Nexus (BIN)", description: "Launched an independent studio for AI, EV, and digital fabrication R&D in Kigali, Rwanda." },
    { year: "2024", title: "Advanced AI Prompt Engineering Certification", description: "Certified by the One Million Prompters program in Dubai — advanced prompt design for production AI systems." },
    { year: "2023", title: "Digital Fabrication Certification", description: "Certified by Hanga Hubs and the Rwanda ICT Chamber in CNC routing, laser cutting, and digital making." },
    { year: "2020", title: "Automobile Technology Background", description: "Built a foundation in vehicle diagnostics and EV systems — the springboard into electric mobility work." },
  ],
  updated_at: new Date().toISOString(),
};

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (!active) return;
      if (data) {
        setProfile({ ...DEFAULT_PROFILE, ...data });
      } else {
        setProfile(DEFAULT_PROFILE);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  return { profile, loading };
}

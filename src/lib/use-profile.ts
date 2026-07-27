import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { Profile } from "./types";

const DEFAULT_PROFILE: Profile = {
  id: "",
  full_name: "Bizimana Fils",
  tagline: "Multidisciplinary Technologist · AI · EV · Digital Fabrication",
  bio: "I'm a technologist based in Kigali, Rwanda, working at the intersection of artificial intelligence, electric mobility, and digital fabrication. I design and build systems that turn ideas into tangible, useful artifacts — from custom EV powertrains to AI-powered tools and open hardware. I care about practical innovation that fits the African context.",
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
    { name: "AI for Robotics", issuer: "Stanford Online", year: "2023" },
    { name: "Electric Vehicle Powertrain Design", issuer: "Coursera", year: "2022" },
    { name: "Digital Fabrication (Fab Academy)", issuer: "Fab Foundation", year: "2021" },
  ],
  skills: [
    { category: "AI & Machine Learning", items: ["PyTorch", "TensorFlow", "LangChain", "Computer Vision", "Edge AI"] },
    { category: "Electric Mobility", items: ["EV Powertrain Design", "Battery BMS", "Motor Control", "Charging Systems"] },
    { category: "Digital Fabrication", items: ["CNC Machining", "3D Printing", "PCB Design", "Laser Cutting"] },
    { category: "Software", items: ["Python", "TypeScript", "React", "Embedded C", "ROS2"] },
  ],
  journey: [
    { year: "2024", title: "Founder, Bizimana Idea Nexus", description: "Launched an independent studio for AI, EV, and fabrication R&D in Kigali." },
    { year: "2022", title: "EV Powertrain Lead", description: "Designed and built a custom electric motorcycle powertrain for East African roads." },
    { year: "2021", title: "Fab Academy Graduate", description: "Completed the Fab Academy digital fabrication program at a regional Fab Lab." },
    { year: "2019", title: "AI Research Assistant", description: "Researched on-device computer vision for low-connectivity environments." },
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

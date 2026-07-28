---
name: next
description: "Modern full-stack personal portfolio + private file storage platform for Bizimana Fils (Brand: Bizimana Idea Nexus / BIN). Multidisciplinary Technologist, AI Enthusiast, EV & Digital Fabrication Specialist based in Kigali, Rwanda. Dual-purpose website: • Beautiful public portfolio (Home, About, Projects, Public Files, Contact) • Powerful private file storage fully controlled by admin Key features: - Unlimited file uploads by admin - Public / Private visibility toggle - Auto-preview / auto-play for public media files (images, videos, audio, PDFs) - Visitor tracking system (record visitor info for founder) - Full Admin Dashboard with File Manager, Projects, Analytics & Profile - Dark-first modern UI (deep navy + soft gold/orange accents) - Fully responsive, premium SaaS + portfolio design Tech: Next.js 15 + TypeScript + Tailwind + shadcn/ui + Supabase (Auth, DB, Storage, RLS) Admin login: Email: bizimanaideanexuscompany@gmail.com Password: *#Fils*#@@"
---

Build a complete production-ready full-stack website (Frontend + Backend + Database fully connected).

### Mandatory Tech Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui (use the best modern components)
- Supabase (Authentication + PostgreSQL + Storage + Row Level Security)
- React Hook Form + Zod
- next-themes (Dark / Light mode)
- Lucide React icons
- react-dropzone (unlimited file uploads)
- Recharts for analytics
- Use best modern UI patterns from shadcn/ui (cards, data tables, drag &amp; drop zones, switches, modals, skeletons, toasts, etc.)

### Design System (Strict)

- Dark-first theme (deep navy / midnight blue)
- Accent colors: soft gold + warm orange
- Clean, premium, modern SaaS + Portfolio style
- Fully responsive
- Social icons on every page (Navbar + Footer): LinkedIn, X, Instagram, TikTok, Threads, ORCID
- Smooth animations and excellent visual hierarchy

### Admin Credentials (Hardcode for initial setup)

- Email: [bizimanaideanexuscompany@gmail.com](mailto:bizimanaideanexuscompany@gmail.com)
- Password: *#Fils*#@@
(Create this user in Supabase Auth and protect all /admin routes)

### Pages

Public Pages:

1. Home (/) – Hero, featured projects, skills, latest public files, about teaser
2. About (/about) – Bio, photo, certifications, skills, journey
3. Projects (/projects) – Filterable grid
4. Project Detail (/projects/\[slug\]) – Full case study + attached public files
5. Files (/files) – Only public files. Support auto-preview / auto-play for images, videos, audio and PDFs when user opens a file
6. Contact (/contact) – Working contact form
7. Login (/login)

Protected Admin (/admin):

- Dashboard overview with stats
- Powerful File Manager:
• Unlimited file uploads (drag &amp; drop)
• Public / Private toggle on every file
• Rename, delete, download
• Search &amp; filter
• Auto-preview support
- Projects Manager (create/edit/delete + attach files)
- Visitor Analytics page (show all recorded visitors)
- Profile Settings

### New Required Features

1. Visitor Tracking System:
  - Automatically record every visitor (IP, country, device, browser, page visited, timestamp)
  - Store in database
  - Show clean table in Admin Dashboard for the founder
2. File System:
  - Admin can upload unlimited files
  - Public files → visible + auto-play/preview on Files page
  - Private files → only admin can see
  - Support common file types with proper preview (images, video, audio, PDF, documents)
3. Security:
  - Strong Row Level Security
  - Private files never accessible by visitors
  - Only admin can upload, edit, delete, and see private content

### Database Tables (Supabase)

- profiles
- projects
- files (with is\_public boolean)
- visitors (id, ip, country, device, browser, page, created\_at)

### Build Order

1. Project setup + shadcn/ui + design system
2. Supabase Auth + create the admin user
3. Database tables + RLS policies
4. Public pages
5. Complete Admin Dashboard (focus on File Manager + Visitor tracking)
6. File upload to Supabase Storage + public auto-preview
7. Make everything fully connected and working

Deliver a polished, modern, production-ready website that looks premium and works perfectly end-to-end.
import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "@/layouts/public-layout";
import { AdminLayout } from "@/layouts/admin-layout";
import { ProtectedRoute } from "@/components/protected-route";
import HomePage from "@/pages/home";

const AboutPage = lazy(() => import("@/pages/about"));
const ProjectsPage = lazy(() => import("@/pages/projects"));
const ProjectDetailPage = lazy(() => import("@/pages/project-detail"));
const FilesPage = lazy(() => import("@/pages/files"));
const ContactPage = lazy(() => import("@/pages/contact"));
const LoginPage = lazy(() => import("@/pages/login"));
const AdminOverview = lazy(() => import("@/pages/admin/overview"));
const AdminFiles = lazy(() => import("@/pages/admin/files"));
const AdminProjects = lazy(() => import("@/pages/admin/projects"));
const AdminProfile = lazy(() => import("@/pages/admin/profile"));
const AdminVisitors = lazy(() => import("@/pages/admin/visitors"));

function PageFallback() {
  return (
    <div className="container py-24 flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<Suspense fallback={<PageFallback />}><AboutPage /></Suspense>} />
        <Route path="/projects" element={<Suspense fallback={<PageFallback />}><ProjectsPage /></Suspense>} />
        <Route path="/projects/:slug" element={<Suspense fallback={<PageFallback />}><ProjectDetailPage /></Suspense>} />
        <Route path="/files" element={<Suspense fallback={<PageFallback />}><FilesPage /></Suspense>} />
        <Route path="/contact" element={<Suspense fallback={<PageFallback />}><ContactPage /></Suspense>} />
        <Route path="/login" element={<Suspense fallback={<PageFallback />}><LoginPage /></Suspense>} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Suspense fallback={<PageFallback />}><AdminOverview /></Suspense>} />
        <Route path="files" element={<Suspense fallback={<PageFallback />}><AdminFiles /></Suspense>} />
        <Route path="projects" element={<Suspense fallback={<PageFallback />}><AdminProjects /></Suspense>} />
        <Route path="profile" element={<Suspense fallback={<PageFallback />}><AdminProfile /></Suspense>} />
        <Route path="visitors" element={<Suspense fallback={<PageFallback />}><AdminVisitors /></Suspense>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

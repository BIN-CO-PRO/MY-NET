import { Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "@/layouts/public-layout";
import { AdminLayout } from "@/layouts/admin-layout";
import { ProtectedRoute } from "@/components/protected-route";
import HomePage from "@/pages/home";
import AboutPage from "@/pages/about";
import ProjectsPage from "@/pages/projects";
import ProjectDetailPage from "@/pages/project-detail";
import FilesPage from "@/pages/files";
import ContactPage from "@/pages/contact";
import LoginPage from "@/pages/login";
import AdminOverview from "@/pages/admin/overview";
import AdminFiles from "@/pages/admin/files";
import AdminProjects from "@/pages/admin/projects";
import AdminProfile from "@/pages/admin/profile";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        <Route path="/files" element={<FilesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="files" element={<AdminFiles />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

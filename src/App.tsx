import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ToastContainer } from "@/components/ui/toast";
import { ProtectedRoute } from "@/components/protected-route";
import { CinematicBackground } from "@/components/cinematic-background";
import { MessageBox } from "@/components/message-box";
import { useVisitorTracking } from "@/lib/use-visitor-tracking";

import HomePage from "@/pages/home";
import AboutPage from "@/pages/about";
import ProjectsPage from "@/pages/projects";
import ProjectDetailPage from "@/pages/project-detail";
import FilesPage from "@/pages/files";
import ContactPage from "@/pages/contact";
import LoginPage from "@/pages/login";
import AdminLayout from "@/pages/admin/layout";
import AdminOverview from "@/pages/admin/overview";
import AdminFiles from "@/pages/admin/files";
import AdminProjects from "@/pages/admin/projects";
import AdminVisitors from "@/pages/admin/visitors";
import AdminMessages from "@/pages/admin/messages";
import AdminProfile from "@/pages/admin/profile";
import NotFoundPage from "@/pages/not-found";

export default function App() {
  useVisitorTracking();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdmin && <CinematicBackground />}
      <Navbar />
      <main className="flex-1 pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:slug" element={<ProjectDetailPage />} />
              <Route path="/files" element={<FilesPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
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
                <Route path="visitors" element={<AdminVisitors />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="profile" element={<AdminProfile />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <MessageBox />
      <ToastContainer />
    </div>
  );
}

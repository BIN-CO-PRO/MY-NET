import { Outlet, ScrollRestoration } from "react-router-dom";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export function PublicLayout() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-grid opacity-40" />
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}

import { Link } from "react-router-dom";
import { Chrome as Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="animate-fade-in">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-[120px]" />
        </div>
        <div className="container py-24 md:py-32 text-center">
          <p className="font-display text-7xl md:text-9xl font-bold text-gradient-gold">404</p>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight mt-4">Page not found</h1>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">The page you're looking for doesn't exist or has been moved.</p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <Button asChild className="group">
              <Link to="/"><Home className="h-4 w-4" /> Go home <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /></Link>
            </Button>
            <Button asChild variant="outline"><Link to="/projects">Browse projects</Link></Button>
          </div>
        </div>
      </section>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send, Loader as Loader2, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "bizimanaideanexuscompany@gmail.com";
const SECRET_CODE = "*#Fils*#@@";

export function MessageBox() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Don't show on admin pages
  const isAdmin = location.pathname.startsWith("/admin");
  if (isAdmin) return null;

  const handleSubmit = async () => {
    const content = text.trim();
    if (!content) return;

    // Secret code detection
    if (content === SECRET_CODE) {
      setLoading(true);
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: SECRET_CODE,
        });
        if (error) throw error;
        toast({ title: "Access granted", description: "Welcome to the dashboard.", variant: "success" });
        setText("");
        setOpen(false);
        navigate("/admin");
      } catch {
        toast({ title: "Authentication failed", description: "Please try again.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
      return;
    }

    // Normal message — save to contact_messages
    setLoading(true);
    try {
      const { error } = await supabase.from("contact_messages").insert({
        name: "Visitor",
        email: null,
        subject: `Message from ${location.pathname}`,
        message: content,
        is_read: false,
      });
      if (error) throw error;
      toast({ title: "Message sent", description: "Thanks — I'll get back to you soon.", variant: "success" });
      setText("");
      setOpen(false);
    } catch {
      toast({ title: "Could not send", description: "Please try again later.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200, damping: 15 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30"
        aria-label="Send a message"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
        {!open && (
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
        )}
      </motion.button>

      {/* Message panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-5 z-50 w-[calc(100vw-2.5rem)] max-w-sm"
          >
            <div className="glass-strong rounded-2xl border border-border/60 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-accent/10">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-display text-sm font-semibold">Send a message</p>
                  <p className="text-xs text-muted-foreground">Reach out — I read every message.</p>
                </div>
              </div>

              {/* Input */}
              <div className="p-4 space-y-3">
                <textarea
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
                  }}
                  placeholder="Type your message…"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border bg-background/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                />
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Press ⌘+Enter to send
                  </p>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !text.trim()}
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium text-primary-foreground shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Send
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

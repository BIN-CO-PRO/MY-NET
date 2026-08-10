import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const IMAGES = [
  "https://images.pexels.com/photos/31835038/pexels-photo-31835038.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
  "https://images.pexels.com/photos/36470605/pexels-photo-36470605.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
  "https://images.pexels.com/photos/5188734/pexels-photo-5188734.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
  "https://images.pexels.com/photos/8533896/pexels-photo-8533896.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
  "https://images.pexels.com/photos/8382125/pexels-photo-8382125.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
  "https://images.pexels.com/photos/27498013/pexels-photo-27498013.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
  "https://images.pexels.com/photos/409798/pexels-photo-409798.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
  "https://images.pexels.com/photos/11996460/pexels-photo-11996460.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
];

const INTERVAL = 7000;

export function CinematicBackground() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % IMAGES.length);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
      <AnimatePresence mode="sync">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={IMAGES[index]}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
          />
        </motion.div>
      </AnimatePresence>
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background/90" />
      <div className="absolute inset-0 bg-background/40" />
    </div>
  );
}

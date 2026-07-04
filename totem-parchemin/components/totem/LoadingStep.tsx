import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const MESSAGES = [
  "L'ancêtre analyse vos réponses pour tisser votre légende…",
  "Il consulte les esprits gardiens…",
  "Il choisit votre totem…",
  "Il grave votre récit sur le parchemin…",
];

export function LoadingStep() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center"
    >
      {/* Spinner doré subtil */}
      <div className="relative mb-10 h-20 w-20">
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{
            border: "2px solid transparent",
            borderTopColor: "var(--gold)",
            borderRightColor: "rgba(212,169,74,0.4)",
            boxShadow: "0 0 24px -4px var(--gold)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
        />
        <motion.span
          className="absolute inset-3 rounded-full"
          style={{
            border: "1px solid transparent",
            borderBottomColor: "var(--gold-light)",
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
        />
        <span
          className="absolute inset-0 m-auto h-2 w-2 rounded-full"
          style={{ background: "var(--gold-light)", boxShadow: "0 0 12px var(--gold-light)" }}
        />
      </div>

      <div className="flex min-h-[3.5rem] max-w-lg items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.6 }}
            className="font-hand text-2xl text-foreground sm:text-3xl"
          >
            {MESSAGES[index]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Barre lumineuse dorée */}
      <div className="mt-10 h-[3px] w-56 overflow-hidden rounded-full bg-gold/10">
        <motion.div
          className="h-full w-1/3 rounded-full"
          style={{
            background: "linear-gradient(90deg, transparent, var(--gold-light), transparent)",
          }}
          animate={{ x: ["-120%", "320%"] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}

import { motion } from "motion/react";
import { GoldButton } from "./GoldButton";

export function GenerateStep({ onGenerate }: { onGenerate: () => void }) {
  return (
    <motion.div
      key="generate"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center"
    >
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="max-w-md font-hand text-2xl text-gold-light sm:text-3xl"
      >
        « Le griot a recueilli votre vérité. »
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6 }}
        className="title-gold mt-4 font-display text-4xl font-bold uppercase tracking-[0.16em] sm:text-6xl"
      >
        Totem Ancestral
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-4 max-w-sm text-sm text-muted-foreground"
      >
        Vos réponses sont scellées. Il ne reste qu'à graver votre légende sur le parchemin sacré.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="mt-10"
      >
        <GoldButton onClick={onGenerate}>Générer mon parchemin</GoldButton>
      </motion.div>
    </motion.div>
  );
}

"use client";

import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { GoldButton } from "./GoldButton";
import { StarField } from "./StarField";

interface GenerateStepProps {
  onGenerate: () => void;
  userFirstName?: string;
}

export function GenerateStep({ onGenerate, userFirstName }: GenerateStepProps) {
  return (
    <motion.div
      key="generate"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center"
    >
      <StarField />

      <div className="relative z-10 max-w-lg">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        >
          <div
            className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full"
            style={{
              background:
                "radial-gradient(circle at 40% 35%, rgba(201,168,76,0.25), transparent 70%)",
              border: "1px solid rgba(201,168,76,0.2)",
            }}
          >
            <Sparkles className="h-10 w-10" style={{ color: "var(--or-ancestral)" }} />
          </div>

          <h2
            className="font-display text-3xl uppercase tracking-widest sm:text-4xl"
            style={{ color: "var(--or-pale)" }}
          >
            {userFirstName ? `${userFirstName}, ton parchemin t'attend` : "Ton parchemin t'attend"}
          </h2>

          <p
            className="mt-6 text-base leading-relaxed sm:text-lg"
            style={{ color: "rgba(237,217,154,0.7)" }}
          >
            Le griot a recueilli tes vérités. Il a consulté les gardiens des quatre éléments. Ton
            ancêtre a un nom. Ton clan t'attend.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-10"
        >
          <GoldButton onClick={onGenerate} className="text-base">
            <Sparkles className="h-5 w-5" />
            Dévoiler mon Parchemin
          </GoldButton>
        </motion.div>
      </div>
    </motion.div>
  );
}

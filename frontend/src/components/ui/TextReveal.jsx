import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "../../lib/utils";

const TextReveal = ({ word = "Cinematic Reveal", className = "" }) => {
  const letters = word.split("");

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: 0.1 },
    },
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 150,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      filter: "blur(10px)",
    },
  };

  return (
    <div className={cn("flex flex-col items-center justify-center overflow-hidden w-full", className)}>
      <motion.h2
        style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter text-center px-6"
      >
        {letters.map((letter, index) => (
          <motion.span
            variants={child}
            key={`letter-${index}`}
            className="inline-block"
          >
            {letter === " " ? "\u00A0" : letter}
          </motion.span>
        ))}
      </motion.h2>
    </div>
  );
};

export default React.memo(TextReveal);

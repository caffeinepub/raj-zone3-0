import { motion } from "motion/react";
import { useEffect } from "react";
import { useGame } from "../context/GameContext";

export function SplashScreen() {
  const { navigate } = useGame();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("auth");
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      data-ocid="splash.section"
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-mesh"
    >
      {/* Decorative background rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[600px] h-[600px] rounded-full border border-primary/5 absolute animate-spin-slow"
          style={{ animationDuration: "20s" }}
        />
        <div
          className="w-[450px] h-[450px] rounded-full border border-primary/8 absolute animate-spin-slow"
          style={{ animationDuration: "15s", animationDirection: "reverse" }}
        />
        <div
          className="w-[300px] h-[300px] rounded-full border border-primary/10 absolute animate-spin-slow"
          style={{ animationDuration: "10s" }}
        />
      </div>

      <motion.div
        className="flex flex-col items-center gap-6 z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Logo */}
        <motion.div
          className="relative animate-float"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.7,
            delay: 0.2,
            ease: [0.175, 0.885, 0.32, 1.275],
          }}
        >
          <div className="w-28 h-28 rounded-2xl glow-primary flex items-center justify-center overflow-hidden shadow-card-raise">
            <img
              src="/assets/generated/raj-zone-logo-transparent.dim_200x200.png"
              alt="Raj_zone3.0 Logo"
              className="w-full h-full object-contain"
            />
          </div>
          {/* Glow ring */}
          <div className="absolute inset-0 rounded-2xl border-2 border-primary/40 animate-pulse" />
        </motion.div>

        {/* App Name */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-foreground">
            Raj<span className="text-primary">_zone</span>
            <span className="text-accent">3.0</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground font-body max-w-xs text-center leading-relaxed">
            The Ultimate Two Truths &amp; A Lie
            <br />
            <span className="text-foreground/80 font-medium">
              Academic Challenge
            </span>
          </p>
        </motion.div>

        {/* Loading dots */}
        <motion.div
          className="flex gap-2 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-primary"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 1.2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        className="absolute bottom-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <p className="text-xs text-muted-foreground/60 font-body tracking-widest uppercase">
          Founder:{" "}
          <span className="text-primary/80 font-semibold">Rajdeep Bhar</span>
        </p>
      </motion.footer>
    </div>
  );
}

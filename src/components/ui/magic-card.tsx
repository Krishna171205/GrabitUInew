"use client";

import React, { useCallback, useEffect, useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { cn } from "@/lib/utils";

export interface MagicCardProps {
  children?: React.ReactNode;
  className?: string;
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
  gradientFrom?: string;
  gradientTo?: string;
  mode?: "gradient" | "orb";
  glowFrom?: string;
  glowTo?: string;
  glowAngle?: number;
  glowSize?: number;
  glowBlur?: number;
  glowOpacity?: number;
}

type ResetReason = "enter" | "leave" | "global" | "init";

export function MagicCard(props: MagicCardProps) {
  const {
    children,
    className,
    gradientSize = 200,
    gradientColor = "rgba(0, 85, 212, 0.08)",
    gradientOpacity = 0.8,
    gradientFrom = "#0055D4",
    gradientTo = "#60A5FA",
    mode = "orb",
    glowFrom = "#0055D4",
    glowTo = "#60A5FA",
    glowAngle = 90,
    glowSize = 240,
    glowBlur = 40,
    glowOpacity = 0.35,
  } = props;

  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);

  const orbX = useSpring(mouseX, { stiffness: 250, damping: 30, mass: 0.6 });
  const orbY = useSpring(mouseY, { stiffness: 250, damping: 30, mass: 0.6 });
  const orbVisible = useSpring(0, { stiffness: 300, damping: 35 });

  const modeRef = useRef(mode);
  const glowOpacityRef = useRef(glowOpacity);
  const gradientSizeRef = useRef(gradientSize);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    glowOpacityRef.current = glowOpacity;
  }, [glowOpacity]);

  useEffect(() => {
    gradientSizeRef.current = gradientSize;
  }, [gradientSize]);

  const reset = useCallback(
    (reason: ResetReason = "leave") => {
      const currentMode = modeRef.current;

      if (currentMode === "orb") {
        if (reason === "enter") orbVisible.set(glowOpacityRef.current);
        else orbVisible.set(0);
        return;
      }

      const off = -gradientSizeRef.current;
      mouseX.set(off);
      mouseY.set(off);
    },
    [mouseX, mouseY, orbVisible]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  useEffect(() => {
    reset("init");
  }, [reset]);

  useEffect(() => {
    const handleGlobalPointerOut = (e: PointerEvent) => {
      if (!e.relatedTarget) reset("global");
    };
    const handleBlur = () => reset("global");
    const handleVisibility = () => {
      if (document.visibilityState !== "visible") reset("global");
    };

    window.addEventListener("pointerout", handleGlobalPointerOut);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("pointerout", handleGlobalPointerOut);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [reset]);

  return (
    <motion.div
      className={cn(
        "group relative isolate overflow-hidden rounded-[inherit] border border-transparent",
        className
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => reset("leave")}
      onPointerEnter={() => reset("enter")}
      style={{
        background: useMotionTemplate`
          linear-gradient(var(--gb-card-bg, #ffffff) 0 0) padding-box,
          radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
            ${gradientFrom},
            ${gradientTo},
            var(--gb-border, rgba(15, 23, 42, 0.08)) 100%
          ) border-box
        `,
      }}
    >
      <div className="bg-white absolute inset-px z-20 rounded-[inherit]" />

      {mode === "gradient" && (
        <motion.div
          suppressHydrationWarning
          className="pointer-events-none absolute inset-px z-30 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
                ${gradientColor},
                transparent 100%
              )
            `,
            opacity: gradientOpacity,
          }}
        />
      )}

      {mode === "orb" && (
        <motion.div
          suppressHydrationWarning
          aria-hidden="true"
          className="pointer-events-none absolute z-30"
          style={{
            width: glowSize,
            height: glowSize,
            x: orbX,
            y: orbY,
            translateX: "-50%",
            translateY: "-50%",
            borderRadius: 9999,
            filter: `blur(${glowBlur}px)`,
            opacity: orbVisible,
            background: `linear-gradient(${glowAngle}deg, ${glowFrom}, ${glowTo})`,
            mixBlendMode: "multiply",
            willChange: "transform, opacity",
          }}
        />
      )}
      <div className="relative z-40 w-full">{children}</div>
    </motion.div>
  );
}

export default MagicCard;

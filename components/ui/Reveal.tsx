"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export function Reveal({
  children,
  className,
  y = 28,
  duration = 0.7,
  delay = 0,
  stagger,
  target,
  scroll = true,
  start = "top 85%",
}: {
  children: ReactNode;
  className?: string;
  /** Distance (px) the content travels into place. */
  y?: number;
  duration?: number;
  delay?: number;
  /** Set to animate multiple targets in sequence instead of one block. */
  stagger?: number;
  /** CSS selector for stagger targets; defaults to direct children. */
  target?: string;
  /** false = animate on mount instead of when scrolled into view. */
  scroll?: boolean;
  start?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const targets = !stagger
        ? el
        : Array.from(target ? el.querySelectorAll(target) : el.children);

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(targets, { autoAlpha: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        targets,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration,
          delay,
          stagger,
          ease: "power3.out",
          scrollTrigger: scroll
            ? { trigger: el, start, once: true }
            : undefined,
        },
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

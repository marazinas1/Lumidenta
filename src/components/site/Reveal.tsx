import type { CSSProperties, ReactNode } from "react";

import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  style,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
  style?: CSSProperties;
}) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      data-visible={visible}
      data-direction={direction}
      style={{ transitionDelay: `${delay}ms`, ...style }}
      className={cn("reveal", className)}
    >
      {children}
    </div>
  );
}

/**
 * Same one-time reveal, but the direct children fade in one after another.
 * Keeps the original element (grid, flex row) so layout is untouched.
 */
export function RevealItems({
  children,
  className,
  style,
  id,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  id?: string;
}) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} id={id} data-visible={visible} style={style} className={cn("reveal-items", className)}>
      {children}
    </div>
  );
}

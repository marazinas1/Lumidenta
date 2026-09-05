import { useEffect, useRef, useState } from "react";

/** Gentle one-time scroll reveal. Respects prefers-reduced-motion via CSS. */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Also reveal elements the user has already scrolled past (fast
          // jumps, anchor links) so nothing stays invisible.
          if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "-10% 0px -10% 0px" },
    );
    observer.observe(node);

    // Fallback for very fast scroll jumps, where the observer can skip an
    // element entirely: reveal anything that ends up above the viewport.
    const onScroll = () => {
      if (node.getBoundingClientRect().bottom < 0) {
        setVisible(true);
        observer.disconnect();
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);


  return { ref, visible };
}

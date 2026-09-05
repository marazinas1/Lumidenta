import { Suspense, lazy, useEffect, useRef, useState } from "react";

const ContactMap = lazy(() => import("@/components/site/ContactMap"));

/**
 * Loads the map only once it is close to the viewport. A placeholder of the
 * exact same height holds the space so nothing jumps in.
 */
export function ContactMapSection({ address }: { address: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || show) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [show]);

  if (!address) return null;

  return (
    <div ref={ref} className="contact-map-frame">
      {show ? (
        <Suspense fallback={<div className="contact-map contact-map-placeholder" />}>
          <ContactMap address={address} />
        </Suspense>
      ) : (
        <div className="contact-map contact-map-placeholder" />
      )}
    </div>
  );
}

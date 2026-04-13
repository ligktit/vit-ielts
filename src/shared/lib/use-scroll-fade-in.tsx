import { useEffect, useRef, type RefObject } from "react";

/**
 * Hook to trigger fadeInUp animation when element scrolls into view.
 * Uses IntersectionObserver — fires once, then disconnects.
 *
 * @param delay - animation-delay in ms (for stagger)
 * @param threshold - how much of element must be visible (0–1)
 * @returns ref to attach to the target element
 */
export function useScrollFadeIn<T extends HTMLElement = HTMLDivElement>(
  delay = 0,
  threshold = 0.15
): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Start hidden
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Apply animation with delay
          el.style.animation = `fadeInUp 1s ease-out ${delay}ms both`;
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold]);

  return ref;
}

/**
 * Wrapper component for scroll-triggered fadeInUp animation.
 * Simpler to use than the hook when you just need to wrap children.
 */
export function ScrollFadeIn({
  children,
  delay = 0,
  threshold = 0.15,
  className = "",
  as: Tag = "div",
  ...rest
}: {
  children: React.ReactNode;
  delay?: number;
  threshold?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  [key: string]: any;
}) {
  const ref = useScrollFadeIn<HTMLElement>(delay, threshold);

  return (
    // @ts-expect-error — dynamic tag
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}

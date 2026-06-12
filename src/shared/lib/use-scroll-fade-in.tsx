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
  threshold = 0.15,
  duration = 3000
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
          // Apply animation with delay and custom duration / ease curve
          el.style.animation = `fadeInUp ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms both`;
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold, duration]);

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
  duration = 3000,
  className = "",
  as: Tag = "div",
  ...rest
}: {
  children: React.ReactNode;
  delay?: number;
  threshold?: number;
  duration?: number;
  className?: string;
  as?: React.ElementType;
  [key: string]: any;
}) {
  const ref = useScrollFadeIn<HTMLElement>(delay, threshold, duration);

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}

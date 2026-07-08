import { CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';

/**
 * Scroll-triggered reveal (fires once when it enters the viewport).
 * Pairs with the global `.reveal` / `.reveal-child` styles in index.css.
 * `delay` staggers siblings; children with `.reveal-child` cascade in.
 */
export default function Reveal({
  children,
  className = '',
  delay = 0,
  as = 'div',
  id,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'section';
  id?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -80px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Comp = as as 'div';
  return (
    <Comp
      ref={ref as React.RefObject<HTMLDivElement>}
      id={id}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </Comp>
  );
}

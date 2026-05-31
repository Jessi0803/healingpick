import { useEffect, useState } from 'react';

export function useRotatingText(messages: string[], active: boolean, intervalMs = 2200) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active || messages.length <= 1) {
      setIndex(0);
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % messages.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [active, intervalMs, messages.length]);

  return messages[index] ?? '';
}

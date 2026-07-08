/**
 * Dreamy ambient layer — slow drifting glow blobs + floating sparkles.
 * Absolutely positioned; drop into any `relative` section as a background.
 * Uses the global blob-drift / twinkle keyframes (reduced-motion aware).
 */
const SPARKLES = [
  { top: '12%', left: '7%', size: 7, delay: '0s' },
  { top: '24%', left: '84%', size: 4, delay: '1.3s' },
  { top: '58%', left: '14%', size: 5, delay: '2.2s' },
  { top: '46%', left: '70%', size: 4, delay: '0.7s' },
  { top: '78%', left: '40%', size: 6, delay: '1.8s' },
  { top: '16%', left: '50%', size: 3, delay: '2.7s' },
];

export default function Ambient({ className = '', intensity = 1 }: { className?: string; intensity?: number }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}>
      <div
        className="animate-blob-drift absolute -left-16 -top-12 h-64 w-64 rounded-full bg-[#D1BE9B] blur-3xl"
        style={{ opacity: 0.28 * intensity }}
      />
      <div
        className="animate-blob-drift-slow absolute right-0 top-16 h-72 w-72 rounded-full bg-[#E9C9C9] blur-3xl"
        style={{ opacity: 0.22 * intensity }}
      />
      <div
        className="animate-blob-drift absolute bottom-[-2rem] left-1/3 h-56 w-56 rounded-full bg-[#CBD6C4] blur-3xl"
        style={{ opacity: 0.2 * intensity }}
      />
      {SPARKLES.map((s, i) => (
        <span
          key={i}
          className="animate-twinkle absolute select-none text-[#D1BE9B]"
          style={{ top: s.top, left: s.left, fontSize: `${s.size}px`, animationDelay: s.delay }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}

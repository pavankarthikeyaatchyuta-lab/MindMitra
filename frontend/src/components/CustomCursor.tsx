import React, { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    // Disable on touch devices or if reduced motion preferred
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouch || prefersReducedMotion) {
      setIsEnabled(false);
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Check if hovering interactive element or image
      const target = e.target as HTMLElement | null;
      if (target) {
        // If hovering an image or test visual, hide custom cursor glow
        if (target.tagName === 'IMG' || target.closest('img, .cognitive-stimulus')) {
          setIsHovered(false);
          return;
        }
        const isInteractive = !!target.closest('button, a, input, select, textarea, [role="button"], .interactive-card');
        setIsHovered(isInteractive);
      }
    };

    const onMouseDown = () => setIsClicked(true);
    const onMouseUp = () => setIsClicked(false);
    const onMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.documentElement.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [isVisible]);

  if (!isEnabled || !isVisible) return null;

  return (
    <div
      className="fixed top-0 left-0 pointer-events-none z-50 transition-transform duration-75 ease-out"
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        willChange: 'transform',
      }}
      aria-hidden="true"
    >
      {/* Central Glowing Star */}
      <div
        className={`relative -top-2 -left-2 rounded-full transition-all duration-150 ${
          isClicked
            ? 'w-6 h-6 bg-cyan-300 shadow-[0_0_16px_#38bdf8]'
            : isHovered
            ? 'w-5 h-5 bg-indigo-300 shadow-[0_0_14px_#818cf8]'
            : 'w-3 h-3 bg-blue-400 shadow-[0_0_8px_#60a5fa]'
        }`}
      />

      {/* Outer Orbit Halo when hovering */}
      {isHovered && (
        <div
          className="absolute -top-5 -left-5 w-10 h-10 rounded-full border border-indigo-400/40 animate-ping opacity-50"
        />
      )}
    </div>
  );
}

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { MARQUEE_ITEMS } from '../data/portfolioData';
import { useSmoothScroll } from './SmoothScroll';
import { computeMarqueeVelocity } from '../utils/portfolioMath';

export function VelocityMarquee() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const { velocityRef } = useSmoothScroll();

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    let xPercent = 0;

    const tick = (_time: number, deltaTime: number) => {
      const dt = Math.min(deltaTime / 1000, 0.05);
      const { speed, direction } = computeMarqueeVelocity(0.9, velocityRef.current || 0, 5.0);
      xPercent -= direction * speed * dt * 4.0;

      if (xPercent <= -50) {
        xPercent += 50;
      } else if (xPercent > 0) {
        xPercent -= 50;
      }

      gsap.set(track, { xPercent });
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
    };
  }, [velocityRef]);

  const repeatedItems = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <section
      id="craft"
      aria-label="Core studio capabilities"
      className="w-full py-5 md:py-7 border-b border-[#1A1A1A]/10 bg-[#EAECE4] overflow-hidden select-none"
    >
      <div
        ref={trackRef}
        className="flex items-center whitespace-nowrap w-max"
        style={{ willChange: 'transform' }}
      >
        {repeatedItems.map((item, idx) => (
          <div key={`${item}-${idx}`} className="inline-flex items-center">
            <span className="font-display text-lg md:text-2xl font-medium tracking-tight text-[#1A1A1A] px-6 md:px-9">
              {item}
            </span>
            <span aria-hidden="true" className="text-xs font-semibold text-[#2563EB]">
              /
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

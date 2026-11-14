import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { BrandLogo } from './BrandLogo';

interface PreloaderProps {
  onComplete: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const [percent, setPercent] = useState(0);
  const [hidden, setHidden] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const columnsRef = useRef<HTMLDivElement[]>([]);
  const counterWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bypass =
      params.get('autostart') === '1' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (bypass) {
      setPercent(100);
      setHidden(true);
      onComplete();
      return;
    }

    const counter = { value: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        setHidden(true);
        onComplete();
      },
    });

    tl.to(counter, {
      value: 100,
      duration: 1.05,
      ease: 'power3.inOut',
      onUpdate: () => setPercent(Math.round(counter.value)),
    })
      .to(counterWrapRef.current, {
        y: -24,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
      })
      .to(
        columnsRef.current,
        {
          yPercent: -100,
          duration: 0.7,
          stagger: 0.06,
          ease: 'expo.inOut',
        },
        '-=0.1'
      );

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  if (hidden) return null;

  return (
    <div
      ref={containerRef}
      data-testid="preloader"
      aria-hidden="true"
      className="fixed inset-0 z-[100] pointer-events-none flex"
    >
      {[0, 1, 2, 3].map((col) => (
        <div
          key={col}
          ref={(el) => {
            if (el) columnsRef.current[col] = el;
          }}
          className="flex-1 h-full bg-[#F4F5F0] border-r border-[#1A1A1A]/10 last:border-r-0"
        />
      ))}

      <div
        ref={counterWrapRef}
        className="absolute inset-0 flex flex-col justify-between p-6 md:p-12"
      >
        <div className="flex items-center justify-between text-xs font-medium tracking-wide text-[#5A5C56]">
          <div className="inline-flex items-center gap-2.5">
            <BrandLogo size={28} showOrbit={false} />
            <span>Senul Jayaweera</span>
          </div>
          <span>Teacher LMS · Tutes · Web Studio</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="inline-flex items-center gap-4">
            <BrandLogo size={54} showOrbit />
            <span className="text-xs font-medium text-[#5A5C56]">
              Preparing daylight studio
            </span>
          </div>
          <div className="font-display text-[clamp(3.25rem,11vw,8.5rem)] font-bold leading-none tracking-tight text-[#1A1A1A] tabular-nums">
            {String(percent).padStart(3, '0')}%
          </div>
        </div>
      </div>
    </div>
  );
}

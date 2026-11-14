import { useEffect, useRef, useState } from 'react';
import { lerp } from '../utils/portfolioMath';

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [cursorText, setCursorText] = useState<string | null>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);

  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const targetPos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const visibleRef = useRef(false);

  useEffect(() => {
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const isDesktop = window.innerWidth >= 768;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isFinePointer || !isDesktop || reducedMotion) {
      setEnabled(false);
      document.body.classList.remove('has-custom-cursor');
      return;
    }

    setEnabled(true);
    document.body.classList.add('has-custom-cursor');

    let rafId = 0;

    const updateCursorTarget = (clientX: number, clientY: number) => {
      const target = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
      const cursorEl = target?.closest('[data-cursor]') as HTMLElement | null;
      const interactiveEl = target?.closest('a, button, [role="button"]');

      const label = cursorEl?.getAttribute('data-cursor') || null;
      setCursorText((prev) => (prev === label ? prev : label));
      const hovering = Boolean(interactiveEl || cursorEl);
      setIsHoveringInteractive((prev) => (prev === hovering ? prev : hovering));
    };

    const onPointerMove = (e: PointerEvent) => {
      targetPos.current.x = e.clientX;
      targetPos.current.y = e.clientY;
      if (!visibleRef.current) {
        visibleRef.current = true;
        ringPos.current.x = e.clientX;
        ringPos.current.y = e.clientY;
        if (dotRef.current) dotRef.current.style.opacity = '1';
        if (ringRef.current) ringRef.current.style.opacity = '1';
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      updateCursorTarget(e.clientX, e.clientY);
    };

    const onViewportChange = () => {
      if (!visibleRef.current) return;
      requestAnimationFrame(() => {
        updateCursorTarget(targetPos.current.x, targetPos.current.y);
      });
    };

    const onPointerDown = () => setIsPressed(true);
    const onPointerUp = () => {
      setIsPressed(false);
      onViewportChange();
    };
    const onMouseLeave = () => {
      visibleRef.current = false;
      setCursorText(null);
      setIsHoveringInteractive(false);
      if (dotRef.current) dotRef.current.style.opacity = '0';
      if (ringRef.current) ringRef.current.style.opacity = '0';
    };

    const render = () => {
      ringPos.current.x = lerp(ringPos.current.x, targetPos.current.x, 0.16);
      ringPos.current.y = lerp(ringPos.current.y, targetPos.current.y, 0.16);

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x.toFixed(2)}px, ${ringPos.current.y.toFixed(2)}px, 0)`;
      }
      rafId = requestAnimationFrame(render);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('scroll', onViewportChange, { passive: true });
    window.addEventListener('keydown', onViewportChange);
    document.addEventListener('mouseleave', onMouseLeave);
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      document.body.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('scroll', onViewportChange);
      window.removeEventListener('keydown', onViewportChange);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  if (!enabled) return null;

  const isExpanded = Boolean(cursorText);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="fixed top-0 left-0 z-[101] pointer-events-none opacity-0"
        style={{ willChange: 'transform, opacity' }}
      >
        <div
          className={`-translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-150 ${
            isExpanded ? 'w-0 h-0 opacity-0' : 'w-1.5 h-1.5 bg-[#1A1A1A]'
          }`}
        />
      </div>

      <div
        ref={ringRef}
        aria-hidden="true"
        className="fixed top-0 left-0 z-[100] pointer-events-none opacity-0"
        style={{ willChange: 'transform, opacity' }}
      >
        <div
          className={`-translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full transition-all duration-200 ease-out ${
            isExpanded
              ? 'h-16 w-16 bg-[#1A1A1A] text-[#F4F5F0] shadow-[0_12px_28px_rgba(26,26,26,0.25)]'
              : isHoveringInteractive
                ? 'h-10 w-10 border border-[#2563EB] bg-[#2563EB]/10'
                : 'h-8 w-8 border border-[#1A1A1A]/25 bg-transparent'
          } ${isPressed ? 'scale-90' : 'scale-100'}`}
        >
          {isExpanded && (
            <span className="font-sans text-[10px] font-semibold tracking-[0.1em] uppercase text-center leading-tight px-1.5">
              {cursorText}
            </span>
          )}
        </div>
      </div>
    </>
  );
}

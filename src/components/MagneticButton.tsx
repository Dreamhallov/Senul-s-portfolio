import React, { useRef, useState } from 'react';
import { computeMagneticOffset } from '../utils/portfolioMath';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  target?: string;
  rel?: string;
  cursorLabel?: string;
  strength?: number;
  radius?: number;
  ariaLabel?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function MagneticButton({
  children,
  className = '',
  onClick,
  href,
  target,
  rel,
  cursorLabel,
  strength = 0.34,
  radius = 110,
  ariaLabel,
  type = 'button',
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!ref.current || window.matchMedia('(pointer: coarse)').matches) return;
    const rect = ref.current.getBoundingClientRect();
    const res = computeMagneticOffset(e.clientX, e.clientY, rect, strength, radius);
    setOffset({ x: res.x, y: res.y });
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  const style: React.CSSProperties = {
    transform: `translate3d(${offset.x.toFixed(2)}px, ${offset.y.toFixed(2)}px, 0)`,
    transition: offset.x === 0 && offset.y === 0
      ? 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
      : 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
    willChange: 'transform',
  };

  if (href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={rel}
        aria-label={ariaLabel}
        data-cursor={cursorLabel}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={style}
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      data-cursor={cursorLabel}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={className}
    >
      {children}
    </button>
  );
}

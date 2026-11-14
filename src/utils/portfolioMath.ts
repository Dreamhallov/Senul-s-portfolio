export interface RectLike {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface MagneticOffset {
  x: number;
  y: number;
  active: boolean;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start: number, end: number, alpha: number): number {
  return start + (end - start) * alpha;
}

/**
 * Computes magnetic pull displacement toward cursor when within proximity radius.
 */
export function computeMagneticOffset(
  cursorX: number,
  cursorY: number,
  rect: RectLike,
  strength = 0.35,
  radius = 120
): MagneticOffset {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dx = cursorX - centerX;
  const dy = cursorY - centerY;
  const dist = Math.hypot(dx, dy);

  if (dist > radius || rect.width === 0 || rect.height === 0) {
    return { x: 0, y: 0, active: false };
  }

  const falloff = 1 - dist / radius;
  return {
    x: dx * strength * falloff,
    y: dy * strength * falloff,
    active: true,
  };
}

/**
 * Computes marquee speed multiplier and direction (-1 or 1) from vertical scroll velocity.
 */
export function computeMarqueeVelocity(
  baseSpeed: number,
  scrollVelocity: number,
  maxBoost = 4.5
): { speed: number; direction: 1 | -1 } {
  const direction: 1 | -1 = scrollVelocity < -0.5 ? -1 : 1;
  const boost = clamp(Math.abs(scrollVelocity) * 0.035, 0, maxBoost);
  return {
    speed: baseSpeed + boost,
    direction,
  };
}

/**
 * Formats a Date in a specific IANA timezone with 24-hour HH:MM:SS output.
 */
export function formatStudioClock(date: Date, timeZone = 'Asia/Colombo'): {
  time: string;
  dateLabel: string;
} {
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);

  const dateLabel = new Intl.DateTimeFormat('en-US', {
    timeZone,
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date);

  return { time, dateLabel };
}

export interface ProjectSummary {
  id: string;
  category: string;
}

export function filterProjects<T extends ProjectSummary>(
  projects: T[],
  category: string
): T[] {
  if (!category || category === 'All') {
    return projects;
  }
  return projects.filter((p) => p.category === category);
}

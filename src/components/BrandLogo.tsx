import { useId } from 'react';
import { motion } from 'motion/react';

interface BrandLogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
  showOrbit?: boolean;
}

/**
 * Razor-sharp, 100% transparent recreation of Senul's violet crystalline feather emblem.
 * Avoids SVG Gaussian blur and unstable pathLength morphing so it reads crisply at 28px–84px.
 */
export function BrandLogo({
  size = 40,
  className = '',
  animated = true,
  showOrbit = false,
}: BrandLogoProps) {
  const uid = useId().replace(/:/g, '');
  const ringGradId = `senul-ring-${uid}`;
  const featherGradId = `senul-feather-${uid}`;
  const bladeLeftId = `senul-blade-l-${uid}`;
  const spineGradId = `senul-spine-${uid}`;

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      whileHover={animated ? { scale: 1.08, rotate: 5 } : undefined}
      whileTap={animated ? { scale: 0.95 } : undefined}
      transition={{ type: 'spring', stiffness: 320, damping: 20 }}
    >
      {showOrbit && animated && (
        <motion.svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          className="absolute inset-[-12%] w-[124%] h-[124%] pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        >
          <circle
            cx="50"
            cy="50"
            r="47"
            fill="none"
            stroke="rgba(109, 40, 217, 0.22)"
            strokeWidth="1"
            strokeDasharray="4 9"
          />
        </motion.svg>
      )}

      <motion.svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 overflow-visible"
        style={{
          filter: 'drop-shadow(0 4px 10px rgba(91, 33, 182, 0.24))',
        }}
        animate={animated ? { y: [0, -1.6, 0] } : undefined}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
        role="img"
        aria-label="Senul Studio crystalline feather logo"
      >
        <defs>
          <linearGradient id={ringGradId} x1="14" y1="86" x2="86" y2="14" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4C1D95" />
            <stop offset="42%" stopColor="#7C3AED" />
            <stop offset="72%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#3B0764" />
          </linearGradient>

          <linearGradient id={featherGradId} x1="22" y1="80" x2="78" y2="16" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4C1D95" />
            <stop offset="40%" stopColor="#6D28D9" />
            <stop offset="78%" stopColor="#9333EA" />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>

          <linearGradient id={bladeLeftId} x1="28" y1="70" x2="66" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="65%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#F5F3FF" />
          </linearGradient>

          <linearGradient id={spineGradId} x1="20" y1="82" x2="76" y2="16" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C4B5FD" />
            <stop offset="50%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#DDD6FE" />
            {animated && (
              <animateTransform
                attributeName="gradientTransform"
                type="translate"
                values="-0.15 0.15; 0.15 -0.15; -0.15 0.15"
                dur="4.2s"
                repeatCount="indefinite"
              />
            )}
          </linearGradient>
        </defs>

        {/* Clean broken circular halo (open notch bottom-left matching original mark) */}
        <path
          d="M 19.5 76.5 A 42.5 42.5 0 1 1 32 88.8"
          stroke={`url(#${ringGradId})`}
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Crisp inner rim glint */}
        <path
          d="M 46 8.2 A 42.5 42.5 0 0 1 90.5 39"
          stroke="#E9D5FF"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        {/* Bold crystalline feather silhouette scaled cleanly inside circle */}
        <path
          d="M 33.5 68.5
             C 30.2 54.5 34.8 38.2 43.2 28.2
             L 41.2 39.2
             C 46.8 25.0 58.2 15.2 76.5 13.8
             C 72.8 24.5 68.2 33.2 61.8 41.0
             L 73.2 32.8
             C 69.8 42.8 64.0 49.5 55.8 54.8
             L 70.2 48.2
             C 65.8 57.2 58.8 63.2 49.8 66.8
             L 63.8 62.2
             C 57.5 69.8 46.2 72.8 33.5 68.5 Z"
          fill={`url(#${featherGradId})`}
          stroke="#4C1D95"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Luminous left crystal vane facet */}
        <path
          d="M 35.5 65.5
             C 33.8 52.8 38.8 40.5 47.0 29.0
             C 53.5 21.0 63.8 16.5 73.5 15.5
             C 63.2 25.2 53.8 38.8 47.0 54.2 Z"
          fill={`url(#${bladeLeftId})`}
          fillOpacity="0.82"
        />

        {/* Lower-left faceted leaf barb */}
        <path
          d="M 33.8 67.2 C 30.2 56.5 32.5 43.0 38.5 36.2 C 37.5 46.2 38.5 56.5 42.2 64.5 Z"
          fill="#EDE9FE"
          fillOpacity="0.9"
          stroke="#6D28D9"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* Sweeping diagonal quill rib with animated specular shimmer */}
        <path
          d="M 21.8 81.2 C 33.5 70.5 46.2 54.5 56.2 36.8 C 62.2 26.2 68.0 19.5 74.2 15.2"
          stroke={`url(#${spineGradId})`}
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Crisp white edge highlight along upper feather ridge */}
        <path
          d="M 24.5 78.6 C 35.5 68.5 46.5 54.0 55.2 38.2"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </motion.svg>
    </motion.div>
  );
}

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpenCheck,
  GraduationCap,
  Headphones,
  Layers,
  MessageSquareText,
} from 'lucide-react';
import { WebGLCanvas } from './WebGLCanvas';
import { MagneticButton } from './MagneticButton';
import { EmailLogoIcon, InstagramLogoIcon, XLogoIcon } from './SocialIcons';
import { useSmoothScroll } from './SmoothScroll';
import { PROFILE, PROJECTS } from '../data/portfolioData';

interface HeroProps {
  ready: boolean;
  onOpenAiHelper: (seedPrompt?: string) => void;
}

export function Hero({ ready, onOpenAiHelper }: HeroProps) {
  const heroRef = useRef<HTMLElement | null>(null);
  const linesRef = useRef<HTMLSpanElement[]>([]);
  const subRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    if (!ready) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        linesRef.current,
        { yPercent: 100, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.08,
          ease: 'expo.out',
        }
      );

      gsap.fromTo(
        [subRef.current, stageRef.current],
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          stagger: 0.1,
          delay: 0.15,
          ease: 'power3.out',
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, [ready]);

  const showcaseTabs = [
    { label: 'Teacher LMS', icon: GraduationCap, project: PROJECTS[0] },
    { label: 'Tutes Studio', icon: BookOpenCheck, project: PROJECTS[1] },
    { label: 'Daily Web Craft', icon: Layers, project: PROJECTS[2] },
  ];

  const activeShowcase = showcaseTabs[activeTabIndex]?.project || PROJECTS[0];

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-[100svh] w-full flex flex-col justify-between pt-24 pb-10 md:pt-28 md:pb-8 px-6 md:px-12 overflow-hidden border-b border-[#1A1A1A]/10 bg-[#F4F5F0]"
    >
      <WebGLCanvas />

      {/* Gentle left-side paper veil only so right-hand 3D mouse sculpture stays vivid & sharp */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, rgba(244, 245, 240, 0.96) 0%, rgba(244, 245, 240, 0.85) 42%, rgba(244, 245, 240, 0.12) 72%, rgba(244, 245, 240, 0) 100%)',
        }}
      />

      <div className="relative z-10 max-w-[1400px] w-full mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
        {/* Left Editorial Typography Zone (clean, airy, zero boxy clutter) */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          <p className="text-xs font-medium tracking-wide text-[#5A5C56] mb-5">
            {PROFILE.role} · {PROFILE.location}
          </p>

          <h1
            className="font-display font-medium tracking-[-0.035em] text-[#1A1A1A] leading-[1.03]"
            style={{
              fontSize: 'clamp(2.25rem, 5.1vw, 4.75rem)',
              textWrap: 'balance',
            }}
          >
            <span className="block overflow-hidden pb-1">
              <span
                ref={(el) => {
                  if (el) linesRef.current[0] = el;
                }}
                className="block"
                style={{ willChange: 'transform, opacity' }}
              >
                Aesthetic Teacher
              </span>
            </span>
            <span className="block overflow-hidden pb-1">
              <span
                ref={(el) => {
                  if (el) linesRef.current[1] = el;
                }}
                className="block"
                style={{ willChange: 'transform, opacity' }}
              >
                LMS, Tutes & Web
              </span>
            </span>
            <span className="block overflow-hidden pb-2 pt-1">
              <span
                ref={(el) => {
                  if (el) linesRef.current[2] = el;
                }}
                className="relative inline-block px-3 py-0.5 border border-[#7C3AED] text-[#2563EB] bg-white/75 font-semibold"
                style={{ willChange: 'transform, opacity' }}
              >
                <span aria-hidden="true" className="absolute -top-1 -left-1 w-2 h-2 bg-[#7C3AED]" />
                <span aria-hidden="true" className="absolute -top-1 -right-1 w-2 h-2 bg-[#7C3AED]" />
                <span aria-hidden="true" className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#7C3AED]" />
                <span aria-hidden="true" className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#7C3AED]" />
                Crafted Daily.
              </span>
            </span>
          </h1>

          <div ref={subRef} className="mt-6 flex flex-col gap-6 max-w-lg">
            <p className="text-sm md:text-base text-[#5A5C56] leading-relaxed">
              Calm daylight portals for educators, structured tutes hubs, and crisp daily
              websites—supported by responsive customer care and an unlimited free AI helper.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <MagneticButton
                onClick={() => scrollTo('#work')}
                className="inline-flex items-center gap-2 px-6 py-3 text-xs md:text-sm font-semibold text-[#F4F5F0] bg-[#1A1A1A] hover:bg-[#2563EB] rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
              >
                <span>Explore Demo Builds</span>
                <ArrowDownRight className="w-4 h-4" aria-hidden="true" />
              </MagneticButton>

              <MagneticButton
                onClick={() => onOpenAiHelper()}
                className="inline-flex items-center gap-2 px-5 py-3 text-xs md:text-sm font-semibold text-[#1A1A1A] bg-white border border-[#1A1A1A]/15 hover:border-[#7C3AED] hover:text-[#7C3AED] rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
              >
                <MessageSquareText className="w-4 h-4 text-[#7C3AED]" aria-hidden="true" />
                <span>Free AI Concierge</span>
              </MagneticButton>

              <div className="flex items-center gap-1.5 pl-1">
                <a
                  href={PROFILE.social.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X profile"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-[#1A1A1A]/12 bg-white/80 text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors"
                >
                  <XLogoIcon className="w-3.5 h-3.5" />
                </a>
                <a
                  href={PROFILE.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram profile"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-[#1A1A1A]/12 bg-white/80 text-[#1A1A1A] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors"
                >
                  <InstagramLogoIcon className="w-3.5 h-3.5" />
                </a>
                <a
                  href={`mailto:${PROFILE.email}`}
                  aria-label="Send direct email"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-[#1A1A1A]/12 bg-white/80 text-[#1A1A1A] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
                >
                  <EmailLogoIcon className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Spatial Zone: Interactive 3D Crystal Sculpture + Sleek Compact Showcase Card */}
        <div
          ref={stageRef}
          className="lg:col-span-5 flex flex-col justify-end lg:min-h-[440px]"
        >
          <div className="mt-auto rounded-xl bg-white/92 border border-[#1A1A1A]/12 overflow-hidden">
            {/* Minimal Architectural Switcher Header (no generic macOS dots) */}
            <div className="px-3 sm:px-4 py-2.5 border-b border-[#1A1A1A]/10 flex items-center justify-between gap-2 bg-[#FAFAF8]">
              <div className="flex items-center gap-1 flex-wrap sm:flex-nowrap">
                {showcaseTabs.map((tab, idx) => {
                  const Icon = tab.icon;
                  const active = activeTabIndex === idx;
                  return (
                    <button
                      key={tab.label}
                      type="button"
                      onClick={() => setActiveTabIndex(idx)}
                      aria-pressed={active}
                      className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap ${
                        active
                          ? 'bg-[#1A1A1A] text-[#F4F5F0]'
                          : 'text-[#5A5C56] hover:text-[#1A1A1A]'
                      }`}
                    >
                      <Icon className="w-3 h-3" aria-hidden="true" />
                      {tab.label === 'Daily Web Craft' ? (
                        <>
                          <span className="sm:hidden">Daily Web</span>
                          <span className="hidden sm:inline">{tab.label}</span>
                        </>
                      ) : (
                        <span>{tab.label}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <span className="text-[11px] font-medium text-[#5A5C56] hidden sm:inline">
                {activeShowcase.index}
              </span>
            </div>

            <div className="grid grid-cols-12 items-stretch">
              <div className="col-span-5 bg-[#EAECE4] overflow-hidden min-h-[128px]">
                <img
                  src={activeShowcase.image}
                  alt={activeShowcase.imageAlt}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="col-span-7 p-4 flex flex-col justify-between gap-2">
                <div>
                  <div className="text-[11px] font-semibold text-[#7C3AED]">
                    {activeShowcase.client}
                  </div>
                  <h2 className="font-display text-base font-semibold text-[#1A1A1A] tracking-tight mt-0.5">
                    {activeShowcase.title}
                  </h2>
                  <p className="mt-1 text-xs text-[#5A5C56] leading-snug line-clamp-2">
                    {activeShowcase.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#1A1A1A]/8 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#1A1A1A] tabular-nums">
                    {activeShowcase.metrics[0]?.value}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenAiHelper(
                        `Tell me about ${activeShowcase.title} and how you build it.`
                      )
                    }
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] hover:text-[#1A1A1A] transition-colors"
                  >
                    <span>Ask AI</span>
                    <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slim Architectural Productivity Baseline Strip */}
      <div className="relative z-10 max-w-[1400px] w-full mx-auto pt-5 mt-6 pr-14 md:pr-44 border-t border-[#1A1A1A]/10 flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-[#5A5C56]">
        <div className="flex flex-wrap items-center gap-5 md:gap-8">
          <span className="inline-flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-[#7C3AED]" aria-hidden="true" />
            <span>Teacher LMS Portals</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BookOpenCheck className="w-3.5 h-3.5 text-[#2563EB]" aria-hidden="true" />
            <span>Tutes Creation</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#7C3AED]" aria-hidden="true" />
            <span>Daily Web Craft</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Headphones className="w-3.5 h-3.5 text-[#2563EB]" aria-hidden="true" />
            <span>Customer Care & AI</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => scrollTo('#services')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1A1A1A] hover:text-[#2563EB] transition-colors"
        >
          <span>Explore Services</span>
          <ArrowDownRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

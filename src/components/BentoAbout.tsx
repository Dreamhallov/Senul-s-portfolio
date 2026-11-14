import React, { useEffect, useRef, useState } from 'react';
import {
  BookOpenCheck,
  Bot,
  Check,
  Copy,
  GraduationCap,
  Layers,
  MessageSquareText,
  Sparkles,
} from 'lucide-react';
import { PROFILE, STACK_NODES } from '../data/portfolioData';
import { formatStudioClock } from '../utils/portfolioMath';
import { MagneticButton } from './MagneticButton';

interface BurstParticle {
  id: number;
  dx: number;
  dy: number;
  color: string;
}

interface BentoAboutProps {
  onOpenAiHelper: (seedPrompt?: string) => void;
}

export function BentoAbout({ onOpenAiHelper }: BentoAboutProps) {
  const [now, setNow] = useState(() => new Date());
  const [selectedStackId, setSelectedStackId] = useState(STACK_NODES[0].id);
  const [copied, setCopied] = useState(false);
  const [particles, setParticles] = useState<BurstParticle[]>([]);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    };
  }, []);

  const studioClock = formatStudioClock(now, PROFILE.timeZone);
  const activeStack =
    STACK_NODES.find((node) => node.id === selectedStackId) || STACK_NODES[0];

  const handleCopyEmail = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(PROFILE.email);
      } else {
        const el = document.createElement('textarea');
        el.value = PROFILE.email;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
    } catch {
      // Clipboard API may be restricted in headless contexts
    }

    setCopied(true);
    const burst: BurstParticle[] = Array.from({ length: 14 }, (_, i) => {
      const angle = (i / 14) * Math.PI * 2;
      const dist = 34 + (i % 3) * 18;
      return {
        id: Date.now() + i,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        color: i % 2 === 0 ? '#7C3AED' : '#2563EB',
      };
    });
    setParticles(burst);

    if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => {
      setCopied(false);
      setParticles([]);
    }, 2400);
  };

  const handleStackMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: -ny * 7, ry: nx * 7 });
  };

  const getStackIcon = (id: string) => {
    if (id === 'lms') return <GraduationCap className="w-4 h-4 text-[#7C3AED]" aria-hidden="true" />;
    if (id === 'tutes') return <BookOpenCheck className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />;
    if (id === 'ai-care') return <Bot className="w-4 h-4 text-[#7C3AED]" aria-hidden="true" />;
    if (id === 'threejs') return <Sparkles className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />;
    return <Layers className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />;
  };

  return (
    <section
      id="about"
      className="w-full py-20 md:py-24 px-6 md:px-12 scroll-mt-20 border-b border-[#1A1A1A]/10 bg-[#F4F5F0]"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-10 md:mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB] mb-2">
            04. Studio & Practice
          </p>
          <h2
            className="font-display font-medium tracking-[-0.03em] text-[#1A1A1A] max-w-2xl"
            style={{
              fontSize: 'clamp(1.85rem, 3.5vw, 3rem)',
              textWrap: 'balance',
            }}
          >
            Built for Educators, Creators & Daily Web Craft
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Card 1: Bio + Studio Workspace Visual */}
          <article className="lg:col-span-7 rounded-xl bg-white border border-[#1A1A1A]/10 overflow-hidden grid grid-cols-1 md:grid-cols-2">
            <div className="p-6 md:p-7 flex flex-col justify-between gap-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5A5C56] mb-2">
                  Studio Focus
                </p>
                <h3 className="font-display text-2xl font-semibold text-[#1A1A1A] mb-3">
                  {PROFILE.name}
                </h3>
                <p className="text-sm text-[#5A5C56] leading-relaxed">
                  I design and build aesthetic Teacher LMS systems, organized tutes
                  creation workflows, and crisp websites shipped daily—using modern
                  geometric typography and calm daylight layouts.
                </p>
              </div>

              <div className="pt-4 border-t border-[#1A1A1A]/10 flex flex-wrap items-center gap-2.5 text-xs font-medium text-[#5A5C56]">
                <span>Teacher LMS</span>
                <span aria-hidden="true">·</span>
                <span>Tutes Creation</span>
                <span aria-hidden="true">·</span>
                <span>Daily Web Builds</span>
              </div>
            </div>

            <div className="relative min-h-[220px] md:min-h-full bg-[#EAECE4]">
              <img
                src={PROFILE.studioImage}
                alt="Senul Jayaweera bright daylight studio workspace"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </article>

          {/* Card 2: Live Studio Clock */}
          <article className="lg:col-span-5 rounded-xl bg-white border border-[#1A1A1A]/10 p-6 md:p-7 flex flex-col justify-between gap-6">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5A5C56]">
              <span>Studio Local Time</span>
              <span>UTC+05:30</span>
            </div>

            <div>
              <div
                data-testid="studio-clock"
                className="font-display text-4xl md:text-5xl font-medium tracking-tight text-[#1A1A1A] tabular-nums"
              >
                {studioClock.time}
              </div>
              <div className="mt-2 text-xs font-medium text-[#5A5C56]">
                {studioClock.dateLabel} · {PROFILE.location}
              </div>
            </div>

            <div className="pt-4 border-t border-[#1A1A1A]/10 text-sm text-[#5A5C56]">
              Available daily for Teacher LMS portals, tutes hubs, and custom websites.
            </div>
          </article>

          {/* Card 3: Interactive 3D Perspective Capability Matrix */}
          <article
            onMouseMove={handleStackMouseMove}
            onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
            className="lg:col-span-7 rounded-xl bg-white border border-[#1A1A1A]/10 p-6 md:p-7 flex flex-col justify-between gap-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5A5C56] mb-1">
                  Interactive Tooling Matrix
                </p>
                <h3 className="font-display text-xl font-semibold text-[#1A1A1A]">
                  LMS, Tutes & Motion Craft
                </h3>
              </div>
              <span className="text-xs font-semibold text-[#7C3AED]">
                {activeStack.experience}
              </span>
            </div>

            <div
              className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 transition-transform duration-300 ease-out"
              style={{
                transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                willChange: 'transform',
              }}
            >
              {STACK_NODES.map((node) => {
                const isSelected = node.id === activeStack.id;
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setSelectedStackId(node.id)}
                    aria-pressed={isSelected}
                    className={`text-left p-3.5 rounded-lg border transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#F3F0FF] border-[#7C3AED] text-[#1A1A1A]'
                        : 'bg-[#F4F5F0] border-[#1A1A1A]/8 text-[#4A4C46] hover:border-[#1A1A1A]/25 hover:text-[#1A1A1A]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getStackIcon(node.id)}
                      <span className="font-display text-xs md:text-sm font-semibold">{node.name}</span>
                    </div>
                    <div className="text-[11px] font-medium text-[#5A5C56]">
                      {node.discipline}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-3.5 border-t border-[#1A1A1A]/10">
              <p className="text-sm text-[#5A5C56] leading-relaxed">
                {activeStack.description}
              </p>
            </div>
          </article>

          {/* Card 4: Copy-to-Clipboard Email + Free AI Helper Concierge Card */}
          <article className="lg:col-span-5 rounded-xl bg-white border border-[#1A1A1A]/10 p-6 md:p-7 flex flex-col justify-between gap-6 relative overflow-hidden">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5A5C56] mb-2">
                Direct Dispatch
              </p>
              <h3 className="font-display text-2xl font-semibold text-[#1A1A1A]">
                Start Your Build Today
              </h3>
              <p className="mt-2 text-sm text-[#5A5C56] leading-relaxed">
                Copy my direct email or chat with the free AI Concierge to draft and
                dispatch your project brief right now.
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-sm md:text-base font-semibold text-[#1A1A1A] break-all">
                {PROFILE.email}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative inline-block">
                  <MagneticButton
                    onClick={handleCopyEmail}
                    ariaLabel="Copy email address to clipboard"
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-colors ${
                      copied
                        ? 'bg-[#10B981] text-white'
                        : 'bg-[#1A1A1A] text-[#F4F5F0] hover:bg-[#2563EB]'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Copy Email</span>
                      </>
                    )}
                  </MagneticButton>

                  {particles.map((p) => (
                    <span
                      key={p.id}
                      aria-hidden="true"
                      className="pointer-events-none absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: p.color,
                        transform: `translate(${p.dx}px, ${p.dy}px)`,
                        opacity: 0,
                        transition: 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.55s ease-out',
                      }}
                      ref={(el) => {
                        if (el) {
                          el.style.transform = 'translate(0px, 0px)';
                          el.style.opacity = '1';
                          requestAnimationFrame(() => {
                            el.style.transform = `translate(${p.dx}px, ${p.dy}px)`;
                            el.style.opacity = '0';
                          });
                        }
                      }}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onOpenAiHelper('I would like to send an inquiry email to Senul for a custom project.')
                  }
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold border border-[#1A1A1A]/15 bg-[#F4F5F0] text-[#1A1A1A] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors"
                >
                  <MessageSquareText className="w-3.5 h-3.5 text-[#7C3AED]" aria-hidden="true" />
                  <span>Open AI Concierge</span>
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import { PROFILE } from '../data/portfolioData';
import { MagneticButton } from './MagneticButton';
import { BrandLogo } from './BrandLogo';
import { EmailLogoIcon, InstagramLogoIcon, XLogoIcon } from './SocialIcons';

gsap.registerPlugin(ScrollTrigger);

export function FooterCTA() {
  const footerRef = useRef<HTMLElement | null>(null);
  const kineticTextRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const heading = kineticTextRef.current;
    const footer = footerRef.current;
    if (!heading || !footer) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        heading,
        { scale: 0.95, opacity: 0.65 },
        {
          scale: 1,
          opacity: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: footer,
            start: 'top 85%',
            end: 'top 30%',
            scrub: 0.75,
          },
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const socialLinks = [
    {
      label: 'X.com',
      handle: '@S28308Senul',
      href: PROFILE.social.x,
      icon: XLogoIcon,
    },
    {
      label: 'Instagram',
      handle: '@dreamhallow',
      href: PROFILE.social.instagram,
      icon: InstagramLogoIcon,
    },
    {
      label: 'Email',
      handle: PROFILE.email,
      href: `mailto:${PROFILE.email}`,
      icon: EmailLogoIcon,
    },
  ];

  return (
    <footer
      id="contact"
      ref={footerRef}
      className="w-full pt-20 pb-20 px-6 md:px-12 bg-[#EAECE4]"
    >
      <div className="max-w-[1400px] mx-auto flex flex-col gap-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
              05. Direct Channels
            </p>
            <h2
              ref={kineticTextRef}
              className="font-display font-medium tracking-[-0.035em] text-[#1A1A1A] leading-[1.0] origin-left"
              style={{
                fontSize: 'clamp(2.15rem, 5.5vw, 4.75rem)',
                textWrap: 'balance',
                willChange: 'transform, opacity',
              }}
            >
              Let’s Build Something Clear & Lasting.
            </h2>
          </div>

          <div className="shrink-0 self-start md:self-end">
            <BrandLogo size={68} showOrbit />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-7 border-y border-[#1A1A1A]/10">
          {socialLinks.map((item) => {
            const BrandIcon = item.icon;
            return (
              <MagneticButton
                key={item.label}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                cursorLabel={item.label === 'Email' ? 'EMAIL' : 'OPEN'}
                strength={0.2}
                className="group flex items-center justify-between p-4 md:p-5 rounded-xl bg-white border border-[#1A1A1A]/10 hover:border-[#2563EB]/45 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#F4F5F0] border border-[#1A1A1A]/10 text-[#1A1A1A] group-hover:text-[#2563EB] transition-colors shrink-0">
                    <BrandIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium text-[#5A5C56]">
                      {item.label}
                    </div>
                    <div className="editorial-underline font-display text-sm md:text-base font-semibold text-[#1A1A1A] truncate">
                      {item.handle}
                    </div>
                  </div>
                </div>
                <ArrowUpRight
                  className="w-4 h-4 shrink-0 text-[#5A5C56] group-hover:text-[#2563EB] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  aria-hidden="true"
                />
              </MagneticButton>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-medium text-[#5A5C56]">
          <span>© 2026 {PROFILE.name}. All rights reserved.</span>
          <span>Colombo, Sri Lanka · Aesthetic Teacher LMS, Tutes & Daily Web Studio</span>
        </div>
      </div>
    </footer>
  );
}

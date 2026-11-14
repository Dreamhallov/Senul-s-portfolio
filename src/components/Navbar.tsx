import { useEffect, useState } from 'react';
import { Menu, MessageSquareText, X } from 'lucide-react';
import { useSmoothScroll } from './SmoothScroll';
import { BrandLogo } from './BrandLogo';
import { EmailLogoIcon, InstagramLogoIcon, XLogoIcon } from './SocialIcons';
import { PROFILE } from '../data/portfolioData';

interface NavbarProps {
  onOpenAiHelper: () => void;
}

const NAV_LINKS = [
  { label: 'Work', target: '#work' },
  { label: 'Lab', target: '#lab' },
  { label: 'Services', target: '#services' },
  { label: 'About', target: '#about' },
  { label: 'Contact', target: '#contact' },
];

export function Navbar({ onOpenAiHelper }: NavbarProps) {
  const { scrollTo } = useSmoothScroll();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [activeSection, setActiveSection] = useState<string>('#work');

  useEffect(() => {
    const updateScrollState = () => {
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      const pct = Math.min(100, Math.max(0, (window.scrollY / maxScroll) * 100));
      setScrollPct(pct);

      const probeY = window.scrollY + 140;
      let current = '#work';
      for (const link of NAV_LINKS) {
        const el = document.querySelector(link.target) as HTMLElement | null;
        if (el && el.offsetTop <= probeY) {
          current = link.target;
        }
      }
      setActiveSection(current);
    };

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, []);

  const navLinks = NAV_LINKS;

  const handleNav = (target: string) => {
    setMobileOpen(false);
    scrollTo(target);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#F4F5F0]/95 backdrop-blur-sm border-b border-[#1A1A1A]/10">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Crisp Transparent Logo + Brand Name */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            handleNav('#hero');
          }}
          className="inline-flex items-center gap-2.5 font-display text-base md:text-[17px] font-semibold tracking-tight text-[#1A1A1A] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded-sm"
        >
          <BrandLogo size={32} />
          <span>{PROFILE.name}</span>
        </a>

        {/* Zone 2: Minimalist editorial navigation links */}
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = activeSection === link.target;
            return (
              <a
                key={link.target}
                href={link.target}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(link.target);
                }}
                aria-current={isActive ? 'location' : undefined}
                className={`editorial-underline inline-flex items-center gap-1.5 text-[13px] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded-sm ${
                  isActive
                    ? 'font-semibold text-[#1A1A1A]'
                    : 'font-medium text-[#5A5C56] hover:text-[#1A1A1A]'
                }`}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]"
                  />
                )}
                <span>{link.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Original Social Icons + AI Concierge Action */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden lg:flex items-center gap-1 mr-2">
            <a
              href={PROFILE.social.x}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Senul on X"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full text-[#5A5C56] hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/6 transition-colors"
            >
              <XLogoIcon className="w-3.5 h-3.5" />
            </a>
            <a
              href={PROFILE.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Senul on Instagram"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full text-[#5A5C56] hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/6 transition-colors"
            >
              <InstagramLogoIcon className="w-3.5 h-3.5" />
            </a>
            <a
              href={`mailto:${PROFILE.email}`}
              aria-label="Email Senul"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full text-[#5A5C56] hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/6 transition-colors"
            >
              <EmailLogoIcon className="w-3.5 h-3.5" />
            </a>
          </div>

          <button
            type="button"
            onClick={onOpenAiHelper}
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#F4F5F0] bg-[#1A1A1A] hover:bg-[#2563EB] rounded-full transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
          >
            <MessageSquareText className="w-3.5 h-3.5" aria-hidden="true" />
            <span>AI Concierge</span>
          </button>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#1A1A1A]/12 text-[#1A1A1A] hover:bg-[#1A1A1A]/5 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="md:hidden border-t border-[#1A1A1A]/10 bg-[#F4F5F0] px-6 py-5 flex flex-col gap-3"
        >
          {navLinks.map((link) => (
            <a
              key={link.target}
              href={link.target}
              onClick={(e) => {
                e.preventDefault();
                handleNav(link.target);
              }}
              className="text-base font-display font-medium text-[#1A1A1A] py-2 border-b border-[#1A1A1A]/10"
            >
              {link.label}
            </a>
          ))}

          <div className="flex items-center gap-3 py-2">
            <a
              href={PROFILE.social.x}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Senul on X"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-[#1A1A1A]/12 text-[#1A1A1A]"
            >
              <XLogoIcon className="w-4 h-4" />
            </a>
            <a
              href={PROFILE.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Senul on Instagram"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-[#1A1A1A]/12 text-[#1A1A1A]"
            >
              <InstagramLogoIcon className="w-4 h-4" />
            </a>
            <a
              href={`mailto:${PROFILE.email}`}
              aria-label="Email Senul"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-[#1A1A1A]/12 text-[#1A1A1A]"
            >
              <EmailLogoIcon className="w-4 h-4" />
            </a>
          </div>

          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onOpenAiHelper();
            }}
            className="w-full py-3 px-5 text-xs font-semibold text-[#F4F5F0] bg-[#1A1A1A] rounded-full inline-flex items-center justify-center gap-2"
          >
            <MessageSquareText className="w-4 h-4" aria-hidden="true" />
            <span>AI Concierge</span>
          </button>
        </nav>
      )}

      {/* Precision scroll progress hairline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] bg-transparent overflow-hidden"
      >
        <div
          data-testid="navbar-scroll-progress"
          className="h-full w-full origin-left transition-transform duration-150 ease-out"
          style={{
            transform: `scaleX(${(scrollPct / 100).toFixed(4)})`,
            background: 'linear-gradient(90deg, #7C3AED 0%, #2563EB 100%)',
          }}
        />
      </div>
    </header>
  );
}

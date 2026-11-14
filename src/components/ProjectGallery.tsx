import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { PROJECTS, type ProjectCaseStudy } from '../data/portfolioData';
import { filterProjects } from '../utils/portfolioMath';
import { ProjectModal } from './ProjectModal';

gsap.registerPlugin(ScrollTrigger);

const CATEGORIES = ['All', 'Teacher LMS', 'Tutes & EdTech', 'Web Systems'];

interface ProjectGalleryProps {
  onAskAi?: (seedPrompt: string) => void;
}

export function ProjectGallery({ onAskAi }: ProjectGalleryProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState<ProjectCaseStudy | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinWrapRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const visibleProjects = filterProjects(PROJECTS, activeCategory);

  useEffect(() => {
    const section = sectionRef.current;
    const pinWrap = pinWrapRef.current;
    const track = trackRef.current;
    if (!section || !pinWrap || !track) return;

    const isDesktop = window.innerWidth >= 1024;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isDesktop || reducedMotion || visibleProjects.length < 2) {
      gsap.set(track, { clearProps: 'transform' });
      return;
    }

    const ctx = gsap.context(() => {
      const getScrollAmount = () => {
        const totalWidth = track.scrollWidth;
        const viewportWidth = pinWrap.clientWidth;
        return Math.max(0, totalWidth - viewportWidth + 48);
      };

      gsap.to(track, {
        x: () => -getScrollAmount(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top+=72',
          end: () => `+=${Math.max(getScrollAmount(), 400)}`,
          pin: true,
          scrub: 0.85,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, [visibleProjects.length, activeCategory]);

  const nudgeTrack = (dir: -1 | 1) => {
    window.scrollBy({ top: dir * 420, behavior: 'smooth' });
  };

  return (
    <section
      id="work"
      ref={sectionRef}
      className="relative w-full py-12 md:py-16 scroll-mt-20 border-b border-[#1A1A1A]/10 bg-[#F4F5F0]"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB] mb-2">
              01. Sample & Demo Showcases
            </p>
            <h2
              className="font-display font-medium tracking-[-0.03em] text-[#1A1A1A]"
              style={{
                fontSize: 'clamp(1.85rem, 3.5vw, 3rem)',
                textWrap: 'balance',
              }}
            >
              Demo LMS, Tutes & Daily Web Builds
            </h2>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div
              role="group"
              aria-label="Filter projects by discipline"
              className="flex flex-wrap items-center gap-1 p-1 bg-white border border-[#1A1A1A]/10 rounded-full"
            >
              {CATEGORIES.map((category) => {
                const active = activeCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    aria-pressed={active}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-[#1A1A1A] text-[#F4F5F0] font-semibold'
                        : 'text-[#5A5C56] hover:text-[#1A1A1A]'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <button
                type="button"
                onClick={() => nudgeTrack(-1)}
                aria-label="Scroll to previous project"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-[#1A1A1A]/15 bg-white text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F4F5F0] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => nudgeTrack(1)}
                aria-label="Scroll to next project"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-[#1A1A1A]/15 bg-white text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F4F5F0] transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div ref={pinWrapRef} className="w-full overflow-hidden">
        <div
          ref={trackRef}
          className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-nowrap gap-6"
          style={{ willChange: 'transform' }}
        >
          {visibleProjects.map((project) => {
            const isHovered = hoveredId === project.id;
            return (
              <motion.article
                key={project.id}
                layoutId={`project-card-${project.id}`}
                onMouseEnter={() => setHoveredId(project.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="group relative lg:w-[500px] xl:w-[530px] lg:shrink-0 rounded-xl bg-white border border-[#1A1A1A]/10 hover:border-[#2563EB]/55 transition-colors overflow-hidden flex flex-col"
              >
                {/* Swash-inspired vector corner registration handles */}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute top-2.5 left-2.5 z-10 w-2.5 h-2.5 border-t-2 border-l-2 border-[#7C3AED] transition-all duration-300 ${
                    isHovered ? 'opacity-100 translate-x-0 translate-y-0' : 'opacity-0 translate-x-1 translate-y-1'
                  }`}
                />
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute top-2.5 right-2.5 z-10 w-2.5 h-2.5 border-t-2 border-r-2 border-[#2563EB] transition-all duration-300 ${
                    isHovered ? 'opacity-100 translate-x-0 translate-y-0' : 'opacity-0 -translate-x-1 translate-y-1'
                  }`}
                />
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute bottom-2.5 left-2.5 z-10 w-2.5 h-2.5 border-b-2 border-l-2 border-[#2563EB] transition-all duration-300 ${
                    isHovered ? 'opacity-100 translate-x-0 translate-y-0' : 'opacity-0 translate-x-1 -translate-y-1'
                  }`}
                />
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute bottom-2.5 right-2.5 z-10 w-2.5 h-2.5 border-b-2 border-r-2 border-[#7C3AED] transition-all duration-300 ${
                    isHovered ? 'opacity-100 translate-x-0 translate-y-0' : 'opacity-0 -translate-x-1 -translate-y-1'
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setSelectedProject(project)}
                  data-cursor="VIEW"
                  aria-label={`Open ${project.title} showcase`}
                  className="text-left w-full h-full flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#EAECE4]">
                    <img
                      src={project.image}
                      alt={project.imageAlt}
                      referrerPolicy="no-referrer"
                      className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
                        isHovered ? 'scale-[1.04]' : 'scale-100'
                      }`}
                    />
                  </div>

                  <div className="p-5 md:p-6 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-medium text-[#5A5C56] mb-1.5">
                        <span className="text-[#7C3AED] font-semibold">{project.index}</span>
                        <span aria-hidden="true">·</span>
                        <span>{project.year}</span>
                        <span aria-hidden="true">·</span>
                        <span>{project.category}</span>
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-display text-lg md:text-xl font-semibold tracking-tight text-[#1A1A1A] group-hover:text-[#2563EB] transition-colors">
                          {project.title}
                        </h3>
                        <ArrowUpRight
                          className="w-4 h-4 shrink-0 text-[#5A5C56] group-hover:text-[#2563EB] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                          aria-hidden="true"
                        />
                      </div>

                      <p className="mt-1.5 text-sm text-[#5A5C56] leading-relaxed">
                        {project.summary}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {project.stack.slice(0, 3).map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 rounded-md bg-[#F4F5F0] text-[11px] font-medium text-[#5A5C56]"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3.5 border-t border-[#1A1A1A]/10 flex items-center justify-between text-xs font-medium text-[#5A5C56]">
                      <span>{project.client}</span>
                      <span className="font-semibold text-[#1A1A1A] tabular-nums">
                        {project.metrics[0]?.value}
                      </span>
                    </div>
                  </div>
                </button>
              </motion.article>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            onAskAi={onAskAi}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

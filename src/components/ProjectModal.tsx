import { useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, MessageSquareText, X } from 'lucide-react';
import type { ProjectCaseStudy } from '../data/portfolioData';

interface ProjectModalProps {
  project: ProjectCaseStudy | null;
  onClose: () => void;
  onAskAi?: (seedPrompt: string) => void;
}

export function ProjectModal({ project, onClose, onAskAi }: ProjectModalProps) {
  useEffect(() => {
    if (!project) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-study-title"
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-8 bg-[#1A1A1A]/55"
      onClick={onClose}
    >
      <motion.div
        layoutId={`project-card-${project.id}`}
        onClick={(e) => e.stopPropagation()}
        transition={{ type: 'spring', stiffness: 280, damping: 30 }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-[#1A1A1A]/12 text-[#1A1A1A] shadow-2xl"
      >
        <div className="sticky top-0 z-20 flex items-center justify-between gap-4 px-6 py-4 bg-white/95 border-b border-[#1A1A1A]/10">
          <div className="flex items-center gap-3 text-xs font-medium text-[#5A5C56]">
            <span>{project.index}</span>
            <span aria-hidden="true">·</span>
            <span>{project.year}</span>
            <span aria-hidden="true">·</span>
            <span>{project.category}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${project.title} case study`}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#1A1A1A]/15 text-[#1A1A1A] hover:bg-[#F4F5F0] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="aspect-[16/9] max-h-[340px] w-full overflow-hidden rounded-xl bg-[#EAECE4] border border-[#1A1A1A]/10">
            <img
              src={project.image}
              alt={project.imageAlt}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#1A1A1A]/10">
            <div>
              <p className="text-xs font-semibold text-[#2563EB] mb-2">{project.client}</p>
              <h3
                id="case-study-title"
                className="font-display text-3xl md:text-4xl font-bold tracking-tight text-[#1A1A1A]"
              >
                {project.title}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
              {onAskAi && (
                <button
                  type="button"
                  onClick={() => {
                    const seed = `I want to discuss building a ${project.title} (${project.category}) for my work.`;
                    onClose();
                    onAskAi(seed);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#1A1A1A] bg-[#F4F5F0] hover:bg-[#EAECE4] border border-[#1A1A1A]/15 rounded-full transition-colors whitespace-nowrap"
                >
                  <MessageSquareText className="w-3.5 h-3.5 text-[#2563EB]" aria-hidden="true" />
                  <span>Ask AI About This</span>
                </button>
              )}

              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#F4F5F0] bg-[#1A1A1A] hover:bg-[#2563EB] rounded-full transition-colors whitespace-nowrap shrink-0"
              >
                <span>Connect on Studio Feed</span>
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-2">
            {project.metrics.map((metric) => (
              <div key={metric.label} className="space-y-1 p-4 rounded-xl bg-[#F4F5F0]">
                <div className="font-display text-2xl md:text-3xl font-semibold text-[#1A1A1A] tabular-nums">
                  {metric.value}
                </div>
                <div className="text-xs font-medium text-[#5A5C56]">{metric.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            <div className="space-y-2">
              <h4 className="font-display text-base font-semibold text-[#1A1A1A]">
                Design Challenge
              </h4>
              <p className="text-sm text-[#4A4C46] leading-relaxed">{project.challenge}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-display text-base font-semibold text-[#1A1A1A]">
                Craft & Execution
              </h4>
              <p className="text-sm text-[#4A4C46] leading-relaxed">{project.solution}</p>
            </div>
          </div>

          <div className="pt-6 border-t border-[#1A1A1A]/10 flex flex-wrap items-center gap-3 text-xs font-medium text-[#5A5C56]">
            <span className="text-[#1A1A1A] font-semibold">Stack:</span>
            {project.stack.map((tech, i) => (
              <span key={tech} className="inline-flex items-center gap-3">
                <span>{tech}</span>
                {i < project.stack.length - 1 && <span aria-hidden="true">·</span>}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

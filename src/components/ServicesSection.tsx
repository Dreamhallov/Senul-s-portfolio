import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowUpRight,
  BookOpenCheck,
  ChevronDown,
  GraduationCap,
  Headphones,
  LayoutTemplate,
  MessageSquareText,
} from 'lucide-react';
import { SERVICES, type ServiceItem } from '../data/portfolioData';

interface ServicesSectionProps {
  onAskAi: (seedPrompt: string) => void;
}

function ServiceIcon({ name }: { name: ServiceItem['iconName'] }) {
  const iconClass = 'w-4 h-4 text-[#7C3AED]';
  switch (name) {
    case 'GraduationCap':
      return <GraduationCap className={iconClass} aria-hidden="true" />;
    case 'BookOpenCheck':
      return <BookOpenCheck className={iconClass} aria-hidden="true" />;
    case 'LayoutTemplate':
      return <LayoutTemplate className={iconClass} aria-hidden="true" />;
    case 'Headphones':
      return <Headphones className={iconClass} aria-hidden="true" />;
  }
}

export function ServicesSection({ onAskAi }: ServicesSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(SERVICES[0].id);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="services"
      className="w-full py-20 md:py-24 px-6 md:px-12 scroll-mt-20 border-b border-[#1A1A1A]/10 bg-[#EAECE4]"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 md:mb-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB] mb-2">
              03. Services & Customer Care
            </p>
            <h2
              className="font-display font-medium tracking-[-0.03em] text-[#1A1A1A] max-w-2xl"
              style={{
                fontSize: 'clamp(1.85rem, 3.5vw, 3rem)',
                textWrap: 'balance',
              }}
            >
              Creative Productivity, Teacher LMS & Support
            </h2>
          </div>

          <button
            type="button"
            onClick={() =>
              onAskAi('Tell me which service fits my teaching or web project and how customer support works.')
            }
            className="self-start lg:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-[#2563EB] text-[#F4F5F0] text-xs font-semibold transition-colors"
          >
            <MessageSquareText className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Ask AI Concierge About Delivery</span>
          </button>
        </div>

        {/* Sleek Swiss architectural hairline grid with expandable blueprint specs */}
        <div className="rounded-xl bg-white border border-[#1A1A1A]/10 divide-y divide-[#1A1A1A]/10 overflow-hidden">
          {SERVICES.map((service) => {
            const isExpanded = expandedId === service.id;
            return (
              <article
                key={service.id}
                className="group transition-colors hover:bg-[#FAFAF8]"
              >
                <div className="p-6 md:px-8 md:py-7 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                  <div className="lg:col-span-4 flex items-center gap-4">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#F4F5F0] border border-[#1A1A1A]/10 shrink-0">
                      <ServiceIcon name={service.iconName} />
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-[#5A5C56] tabular-nums">
                        {service.index} · {service.turnaround}
                      </div>
                      <h3 className="font-display text-lg md:text-xl font-semibold text-[#1A1A1A] tracking-tight">
                        {service.title}
                      </h3>
                    </div>
                  </div>

                  <div className="lg:col-span-5 space-y-2">
                    <p className="text-sm text-[#5A5C56] leading-relaxed">
                      {service.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-[#1A1A1A]">
                      {service.deliverables.map((item, idx) => (
                        <span key={item} className="inline-flex items-center gap-2.5">
                          <span>{item}</span>
                          {idx < service.deliverables.length - 1 && (
                            <span aria-hidden="true" className="text-[#7C3AED]">·</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-3 flex flex-wrap lg:justify-end items-center gap-2">
                    {service.blueprint && (
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        onClick={() => toggleExpand(service.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#1A1A1A]/12 bg-white hover:border-[#7C3AED] text-xs font-medium text-[#5A5C56] hover:text-[#1A1A1A] transition-colors whitespace-nowrap"
                      >
                        <span>{isExpanded ? 'Hide Specs' : 'Specs'}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 text-[#7C3AED]' : ''
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onAskAi(service.promptSeed)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#1A1A1A]/12 bg-[#F4F5F0] group-hover:bg-[#1A1A1A] group-hover:text-[#F4F5F0] text-xs font-semibold text-[#1A1A1A] transition-colors whitespace-nowrap"
                    >
                      <span>Request via AI</span>
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isExpanded && service.blueprint && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.24, ease: 'easeOut' }}
                      className="overflow-hidden border-t border-[#1A1A1A]/8 bg-[#F4F5F0]/75"
                    >
                      <div className="px-6 py-5 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                        <div>
                          <div className="font-semibold uppercase tracking-[0.08em] text-[#5A5C56] mb-1.5">
                            Architecture Stack
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {service.blueprint.stack.map((tech) => (
                              <span
                                key={tech}
                                className="px-2.5 py-1 rounded-full bg-white border border-[#1A1A1A]/10 font-medium text-[#1A1A1A]"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="font-semibold uppercase tracking-[0.08em] text-[#5A5C56] mb-1.5">
                            Zero-Cost Hosting & AI
                          </div>
                          <p className="text-[#5A5C56] leading-relaxed">
                            {service.blueprint.freeTierNote}
                          </p>
                        </div>

                        <div>
                          <div className="font-semibold uppercase tracking-[0.08em] text-[#5A5C56] mb-1.5">
                            Launch Checklist
                          </div>
                          <ul className="space-y-1 text-[#1A1A1A]">
                            {service.blueprint.checklist.map((point) => (
                              <li key={point} className="flex items-start gap-1.5">
                                <span className="text-[#7C3AED] font-semibold" aria-hidden="true">
                                  +
                                </span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}


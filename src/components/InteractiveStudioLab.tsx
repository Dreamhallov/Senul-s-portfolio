import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BookOpenCheck,
  Check,
  GraduationCap,
  Layers,
  MessageSquareText,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import {
  INITIAL_LMS_STUDENTS,
  TUTE_FEATURE_META,
  TUTE_SUBJECT_PRESETS,
  WEB_PRESETS,
  buildLabInquiryPrompt,
  calculateBatchMetrics,
  cycleAttendanceState,
  estimateTuteReadiness,
  type AttendanceState,
  type LabTabId,
  type LmsStudentRow,
  type TuteFeatureId,
  type WebGridConfig,
  type WebPresetId,
  type WebScaleId,
} from '../utils/studioLab';

interface InteractiveStudioLabProps {
  onOpenAiHelper: (seedPrompt?: string) => void;
}

const ATTENDANCE_STYLES: Record<
  AttendanceState,
  { label: string; badgeClass: string; dotClass: string }
> = {
  present: {
    label: 'Present',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  late: {
    label: 'Late',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  absent: {
    label: 'Absent',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    dotClass: 'bg-rose-500',
  },
};

const TABS: { id: LabTabId; label: string; subtitle: string; icon: typeof GraduationCap }[] = [
  {
    id: 'lms',
    label: 'Teacher LMS Cockpit',
    subtitle: 'Interactive Attendance & Batch Health',
    icon: GraduationCap,
  },
  {
    id: 'tutes',
    label: 'Tutes Composer',
    subtitle: 'Modular Study Pack Builder',
    icon: BookOpenCheck,
  },
  {
    id: 'web',
    label: 'Daily Web Grid',
    subtitle: 'Live Palette & Typography Tuner',
    icon: SlidersHorizontal,
  },
];

export function InteractiveStudioLab({ onOpenAiHelper }: InteractiveStudioLabProps) {
  const [activeTab, setActiveTab] = useState<LabTabId>('lms');

  // Tab 1 state: Teacher LMS
  const [students, setStudents] = useState<LmsStudentRow[]>(INITIAL_LMS_STUDENTS);
  const batchMetrics = calculateBatchMetrics(students);

  // Tab 2 state: Tutes Composer
  const [subjectTitle, setSubjectTitle] = useState<string>(TUTE_SUBJECT_PRESETS[0]);
  const [moduleCount, setModuleCount] = useState<number>(6);
  const [tuteFeatures, setTuteFeatures] = useState<TuteFeatureId[]>([
    'watermark',
    'timestamps',
    'checkpoint',
  ]);
  const [quizChoice, setQuizChoice] = useState<number | null>(null);
  const tuteMetrics = estimateTuteReadiness({
    subjectTitle,
    moduleCount,
    features: tuteFeatures,
  });

  // Tab 3 state: Daily Web Grid
  const [webConfig, setWebConfig] = useState<WebGridConfig>({
    preset: 'atelier-paper',
    scale: 'editorial',
    enable3DParallax: true,
  });
  const activePreset = WEB_PRESETS[webConfig.preset];

  const handleToggleStudent = (id: string) => {
    setStudents((prev) =>
      prev.map((stu) =>
        stu.id === id ? { ...stu, attendance: cycleAttendanceState(stu.attendance) } : stu
      )
    );
  };

  const handleToggleFeature = (featureId: TuteFeatureId) => {
    setTuteFeatures((prev) =>
      prev.includes(featureId) ? prev.filter((f) => f !== featureId) : [...prev, featureId]
    );
  };

  const handleSendToAi = () => {
    const prompt = buildLabInquiryPrompt(activeTab, {
      students,
      tutes: { subjectTitle, moduleCount, features: tuteFeatures },
      web: webConfig,
    });
    onOpenAiHelper(prompt);
  };

  const handleResetActive = () => {
    if (activeTab === 'lms') {
      setStudents(INITIAL_LMS_STUDENTS);
    } else if (activeTab === 'tutes') {
      setSubjectTitle(TUTE_SUBJECT_PRESETS[0]);
      setModuleCount(6);
      setTuteFeatures(['watermark', 'timestamps', 'checkpoint']);
      setQuizChoice(null);
    } else {
      setWebConfig({
        preset: 'atelier-paper',
        scale: 'editorial',
        enable3DParallax: true,
      });
    }
  };

  return (
    <section
      id="lab"
      className="w-full py-20 md:py-24 px-6 md:px-12 scroll-mt-20 border-b border-[#1A1A1A]/10 bg-white"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 md:mb-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB] mb-2">
              02. Interactive Studio Craft Lab
            </p>
            <h2
              className="font-display font-medium tracking-[-0.03em] text-[#1A1A1A] max-w-2xl"
              style={{
                fontSize: 'clamp(1.85rem, 3.5vw, 3rem)',
                textWrap: 'balance',
              }}
            >
              Test the UX Craft Before We Build
            </h2>
          </div>

          <p className="text-sm text-[#5A5C56] max-w-md leading-relaxed">
            Click inside the live sandboxes below to inspect how Teacher LMS rosters,
            tutes study modules, and custom web grids respond—then send your exact
            setup to the free AI Concierge.
          </p>
        </div>

        {/* Interactive Lab Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Rail: Tab Switcher + Contextual Controls */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-5 rounded-xl bg-[#F4F5F0] border border-[#1A1A1A]/10 p-5 md:p-6">
            <div className="space-y-4">
              <div
                role="tablist"
                aria-label="Interactive studio lab sandboxes"
                className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2"
              >
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveTab(tab.id)}
                      className={`text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                        active
                          ? 'bg-white border-[#7C3AED] text-[#1A1A1A] shadow-xs'
                          : 'bg-white/55 border-[#1A1A1A]/10 text-[#5A5C56] hover:bg-white hover:text-[#1A1A1A]'
                      }`}
                    >
                      <span
                        className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border shrink-0 ${
                          active
                            ? 'bg-[#F3F0FF] border-[#7C3AED]/30 text-[#7C3AED]'
                            : 'bg-[#F4F5F0] border-[#1A1A1A]/10 text-[#5A5C56]'
                        }`}
                      >
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-display text-sm font-semibold truncate">
                          {tab.label}
                        </span>
                        <span className="block text-[11px] text-[#5A5C56] truncate">
                          {tab.subtitle}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Control Panel per Active Tab */}
              <div className="rounded-xl bg-white border border-[#1A1A1A]/10 p-4 space-y-3.5">
                {activeTab === 'lms' && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#5A5C56]">
                        Batch Telemetry
                      </span>
                      <span className="text-xs font-semibold text-[#2563EB]">
                        {batchMetrics.healthLabel}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5 text-center">
                      <div className="p-2.5 rounded-lg bg-[#F4F5F0] border border-[#1A1A1A]/8">
                        <div
                          data-testid="lab-attendance-rate"
                          className="font-display text-xl font-semibold text-[#1A1A1A] tabular-nums"
                        >
                          {batchMetrics.attendanceRate}%
                        </div>
                        <div className="text-[11px] text-[#5A5C56]">Attendance</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#F4F5F0] border border-[#1A1A1A]/8">
                        <div className="font-display text-xl font-semibold text-[#1A1A1A] tabular-nums">
                          {batchMetrics.averageScore}%
                        </div>
                        <div className="text-[11px] text-[#5A5C56]">Avg Score</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#F4F5F0] border border-[#1A1A1A]/8">
                        <div className="font-display text-xl font-semibold text-[#1A1A1A] tabular-nums">
                          {batchMetrics.presentCount}/{students.length}
                        </div>
                        <div className="text-[11px] text-[#5A5C56]">Present</div>
                      </div>
                    </div>
                    <p className="text-xs text-[#5A5C56] leading-relaxed">
                      Click any student row on the right to cycle attendance status
                      (<strong className="font-semibold text-[#1A1A1A]">Present → Late → Absent</strong>)
                      and watch cohort health recalculate live.
                    </p>
                  </>
                )}

                {activeTab === 'tutes' && (
                  <>
                    <div className="space-y-2">
                      <label
                        htmlFor="lab-tute-subject"
                        className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#5A5C56]"
                      >
                        Subject Pack
                      </label>
                      <select
                        id="lab-tute-subject"
                        value={subjectTitle}
                        onChange={(e) => setSubjectTitle(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-[#1A1A1A]/15 bg-[#F4F5F0] text-[#1A1A1A] focus:outline-none focus:border-[#7C3AED]"
                      >
                        {TUTE_SUBJECT_PRESETS.map((preset) => (
                          <option key={preset} value={preset}>
                            {preset}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold uppercase tracking-[0.08em] text-[#5A5C56]">
                          Unit Chapters
                        </span>
                        <span className="font-semibold text-[#1A1A1A] tabular-nums">
                          {moduleCount} units · ~{tuteMetrics.estimatedMinutes} min
                        </span>
                      </div>
                      <input
                        type="range"
                        min={2}
                        max={12}
                        value={moduleCount}
                        aria-label="Number of unit chapters"
                        onChange={(e) => setModuleCount(Number(e.target.value))}
                        className="w-full accent-[#7C3AED]"
                      />
                    </div>

                    <div className="space-y-2">
                      <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#5A5C56]">
                        Smart Learning Modules
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(Object.keys(TUTE_FEATURE_META) as TuteFeatureId[]).map((fid) => {
                          const selected = tuteFeatures.includes(fid);
                          return (
                            <button
                              key={fid}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => handleToggleFeature(fid)}
                              className={`text-left px-3 py-2 rounded-lg border text-xs font-medium transition-colors flex items-center justify-between gap-2 ${
                                selected
                                  ? 'bg-[#F3F0FF] border-[#7C3AED] text-[#1A1A1A]'
                                  : 'bg-[#F4F5F0] border-[#1A1A1A]/10 text-[#5A5C56]'
                              }`}
                            >
                              <span className="truncate">{TUTE_FEATURE_META[fid].label}</span>
                              {selected && <Check className="w-3.5 h-3.5 text-[#7C3AED] shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'web' && (
                  <>
                    <div className="space-y-2">
                      <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#5A5C56]">
                        Daylight Palette System
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {(Object.keys(WEB_PRESETS) as WebPresetId[]).map((pid) => {
                          const p = WEB_PRESETS[pid];
                          const active = webConfig.preset === pid;
                          return (
                            <button
                              key={pid}
                              type="button"
                              aria-pressed={active}
                              onClick={() => setWebConfig((prev) => ({ ...prev, preset: pid }))}
                              className={`p-2.5 rounded-lg border text-left transition-colors ${
                                active
                                  ? 'border-[#2563EB] bg-[#EFF6FF]'
                                  : 'border-[#1A1A1A]/10 bg-[#F4F5F0]'
                              }`}
                            >
                              <span className="flex items-center gap-1.5 mb-1">
                                <span
                                  className="w-3 h-3 rounded-full border border-[#1A1A1A]/20"
                                  style={{ backgroundColor: p.surfaceBg }}
                                />
                                <span
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: p.accentHex }}
                                />
                              </span>
                              <span className="block text-[11px] font-semibold text-[#1A1A1A] leading-tight">
                                {p.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#5A5C56]">
                        Space Grotesk Display Scale
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {(['compact', 'editorial', 'monumental'] as WebScaleId[]).map((scale) => (
                          <button
                            key={scale}
                            type="button"
                            aria-pressed={webConfig.scale === scale}
                            onClick={() => setWebConfig((prev) => ({ ...prev, scale }))}
                            className={`px-1.5 sm:px-2.5 py-1.5 rounded-lg border text-[11px] sm:text-xs font-medium capitalize transition-colors truncate ${
                              webConfig.scale === scale
                                ? 'bg-[#1A1A1A] text-[#F4F5F0] border-[#1A1A1A]'
                                : 'bg-[#F4F5F0] text-[#5A5C56] border-[#1A1A1A]/10'
                            }`}
                          >
                            {scale}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-pressed={webConfig.enable3DParallax}
                      onClick={() =>
                        setWebConfig((prev) => ({
                          ...prev,
                          enable3DParallax: !prev.enable3DParallax,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-[#1A1A1A]/12 bg-[#F4F5F0] flex items-center justify-between text-xs font-medium text-[#1A1A1A]"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" aria-hidden="true" />
                        <span>3D Depth & Floating Grid Accents</span>
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          webConfig.enable3DParallax
                            ? 'bg-[#7C3AED] text-white'
                            : 'bg-[#1A1A1A]/10 text-[#5A5C56]'
                        }`}
                      >
                        {webConfig.enable3DParallax ? 'ON' : 'OFF'}
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleSendToAi}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-[#2563EB] text-[#F4F5F0] text-xs font-semibold transition-colors"
              >
                <MessageSquareText className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Send This Setup to AI</span>
              </button>
              <button
                type="button"
                onClick={handleResetActive}
                aria-label="Reset current sandbox"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#1A1A1A]/15 bg-white text-[#5A5C56] hover:text-[#1A1A1A] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Right Stage: Architectural Swash-Framed Interactive Preview Viewport */}
          <div className="lg:col-span-7 relative rounded-xl bg-[#F4F5F0] border border-[#1A1A1A]/12 p-5 md:p-7 flex flex-col justify-between overflow-hidden">
            {/* Vector corner registration hairlines */}
            <span aria-hidden="true" className="pointer-events-none absolute top-3 left-3 w-3 h-3 border-t border-l border-[#1A1A1A]/35" />
            <span aria-hidden="true" className="pointer-events-none absolute top-3 right-3 w-3 h-3 border-t border-r border-[#1A1A1A]/35" />
            <span aria-hidden="true" className="pointer-events-none absolute bottom-3 left-3 w-3 h-3 border-b border-l border-[#1A1A1A]/35" />
            <span aria-hidden="true" className="pointer-events-none absolute bottom-3 right-3 w-3 h-3 border-b border-r border-[#1A1A1A]/35" />

            <div className="flex items-center justify-between gap-4 pb-4 mb-5 border-b border-[#1A1A1A]/10">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1A1A1A]">
                <Layers className="w-4 h-4 text-[#7C3AED]" aria-hidden="true" />
                <span>Live Preview Canvas</span>
              </div>
              <span className="text-[11px] font-medium text-[#5A5C56] tabular-nums">
                {activeTab === 'lms'
                  ? `Active Roster · ${students.length} students`
                  : activeTab === 'tutes'
                  ? `Readiness ${tuteMetrics.readinessScore}% · ${tuteMetrics.packFormat}`
                  : `${activePreset.name} · ${webConfig.scale}`}
              </span>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'lms' && (
                <motion.div
                  key="preview-lms"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-4 flex-1 flex flex-col justify-between"
                >
                  <div className="rounded-xl bg-white border border-[#1A1A1A]/10 divide-y divide-[#1A1A1A]/8 overflow-hidden">
                    <div className="px-4 py-3 bg-[#FAFAF8] flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5A5C56]">
                      <span>Student & Cohort</span>
                      <span>Click Status to Toggle</span>
                    </div>
                    {students.map((stu) => {
                      const style = ATTENDANCE_STYLES[stu.attendance];
                      return (
                        <button
                          key={stu.id}
                          type="button"
                          onClick={() => handleToggleStudent(stu.id)}
                          data-testid={`lms-row-${stu.id}`}
                          className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-[#FAFAF8] transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="font-display text-sm font-semibold text-[#1A1A1A] truncate">
                              {stu.name}
                            </div>
                            <div className="text-xs text-[#5A5C56] truncate">{stu.batch}</div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="hidden sm:inline text-xs font-semibold text-[#1A1A1A] tabular-nums">
                              {stu.score}%
                            </span>
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${style.badgeClass}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${style.dotClass}`} />
                              <span>{style.label}</span>
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Live Attendance Bar */}
                  <div className="rounded-xl bg-white border border-[#1A1A1A]/10 p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-[#5A5C56]">
                      <span>Live Attendance Progress</span>
                      <span className="font-semibold text-[#1A1A1A] tabular-nums">
                        {batchMetrics.attendanceRate}% ({batchMetrics.presentCount} present,{' '}
                        {batchMetrics.lateCount} late, {batchMetrics.absentCount} absent)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#EAECE4] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${batchMetrics.attendanceRate}%`,
                          background: 'linear-gradient(90deg, #7C3AED 0%, #2563EB 100%)',
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'tutes' && (
                <motion.div
                  key="preview-tutes"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-4 flex-1 flex flex-col justify-between"
                >
                  <div className="rounded-xl bg-white border border-[#1A1A1A]/10 p-5 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7C3AED]">
                          Unit 01 · {moduleCount} Chapters
                        </span>
                        <h3 className="font-display text-xl font-semibold text-[#1A1A1A] mt-0.5">
                          {subjectTitle}
                        </h3>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-[#F4F5F0] border border-[#1A1A1A]/10 text-xs font-semibold text-[#1A1A1A] tabular-nums">
                        ~{tuteMetrics.estimatedMinutes} min study
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {tuteFeatures.length === 0 ? (
                        <div className="sm:col-span-2 p-3 rounded-lg bg-[#F4F5F0] text-xs text-[#5A5C56]">
                          Minimal reading mode active. Toggle learning modules on the left to
                          preview interactive student tools.
                        </div>
                      ) : (
                        tuteFeatures.map((fid) => (
                          <div
                            key={fid}
                            className="p-3 rounded-lg bg-[#F4F5F0] border border-[#1A1A1A]/8"
                          >
                            <div className="text-xs font-semibold text-[#1A1A1A]">
                              {TUTE_FEATURE_META[fid].label}
                            </div>
                            <div className="text-[11px] text-[#5A5C56] mt-0.5 leading-snug">
                              {TUTE_FEATURE_META[fid].detail}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {tuteFeatures.includes('checkpoint') && (
                      <div className="pt-3 border-t border-[#1A1A1A]/10 space-y-2">
                        <div className="text-xs font-semibold text-[#1A1A1A]">
                          Sample Quick Checkpoint: What unlocks Unit 02 automatically?
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {['Mastery Check Pass', 'Manual Folder Hunt'].map((opt, idx) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setQuizChoice(idx)}
                              className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                                quizChoice === idx
                                  ? idx === 0
                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                                    : 'bg-amber-50 border-amber-400 text-amber-800'
                                  : 'bg-[#F4F5F0] border-[#1A1A1A]/10 text-[#5A5C56]'
                              }`}
                            >
                              {opt}
                              {quizChoice === idx && (idx === 0 ? ' ✓ Correct' : ' · Try Check Pass')}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'web' && (
                <motion.div
                  key="preview-web"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="flex-1 flex flex-col"
                >
                  <div
                    className="flex-1 rounded-xl border border-[#1A1A1A]/12 p-5 md:p-6 flex flex-col justify-between gap-5 transition-colors duration-300"
                    style={{ backgroundColor: activePreset.surfaceBg }}
                  >
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span
                        className="font-display font-semibold"
                        style={{ color: activePreset.inkHex }}
                      >
                        SENUL STUDIO · SYSTEM PREVIEW
                      </span>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white"
                        style={{ backgroundColor: activePreset.accentHex }}
                      >
                        {activePreset.badge}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <h3
                        className="font-display font-medium tracking-[-0.03em] leading-[1.02] transition-all duration-300"
                        style={{
                          color: activePreset.inkHex,
                          fontSize:
                            webConfig.scale === 'monumental'
                              ? '2.35rem'
                              : webConfig.scale === 'editorial'
                              ? '1.85rem'
                              : '1.45rem',
                        }}
                      >
                        Calm Digital Craft Shipped Daily.
                      </h3>
                      <p
                        className="text-xs md:text-sm max-w-md leading-relaxed"
                        style={{ color: activePreset.mutedHex }}
                      >
                        Paired exclusively with Space Grotesk headlines and DM Sans body clarity—zero visual clutter.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      {['01 · Structure', '02 · Typography', '03 · Motion'].map((cell, idx) => (
                        <div
                          key={cell}
                          className="p-3 rounded-lg border border-[#1A1A1A]/10 transition-transform duration-300"
                          style={{
                            backgroundColor: activePreset.panelBg,
                            transform: webConfig.enable3DParallax
                              ? `translateY(${idx === 1 ? '-4px' : '0px'})`
                              : 'none',
                          }}
                        >
                          <div
                            className="text-[11px] font-semibold"
                            style={{ color: activePreset.accentHex }}
                          >
                            {cell}
                          </div>
                          <div
                            className="text-xs font-medium mt-1"
                            style={{ color: activePreset.inkHex }}
                          >
                            {webConfig.enable3DParallax ? '3D Depth On' : 'Flat Grid'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

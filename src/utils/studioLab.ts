export type LabTabId = 'lms' | 'tutes' | 'web';

export type AttendanceState = 'present' | 'late' | 'absent';

export interface LmsStudentRow {
  id: string;
  name: string;
  batch: string;
  attendance: AttendanceState;
  score: number;
}

export type TuteFeatureId = 'watermark' | 'timestamps' | 'checkpoint' | 'cheatsheet';

export interface TuteComposerConfig {
  subjectTitle: string;
  moduleCount: number;
  features: TuteFeatureId[];
}

export type WebPresetId = 'atelier-paper' | 'cobalt-blueprint' | 'violet-ink';
export type WebScaleId = 'compact' | 'editorial' | 'monumental';

export interface WebGridConfig {
  preset: WebPresetId;
  scale: WebScaleId;
  enable3DParallax: boolean;
}

export const INITIAL_LMS_STUDENTS: LmsStudentRow[] = [
  { id: 'stu-1', name: 'Kavindu Perera', batch: '2026 A/L Physics · Batch A', attendance: 'present', score: 94 },
  { id: 'stu-2', name: 'Nethmi Fernando', batch: '2026 A/L Physics · Batch A', attendance: 'present', score: 91 },
  { id: 'stu-3', name: 'Tharindu Silva', batch: '2026 A/L Physics · Batch A', attendance: 'late', score: 84 },
  { id: 'stu-4', name: 'Amaya Jayawardena', batch: '2026 A/L Physics · Batch A', attendance: 'present', score: 97 },
];

export const TUTE_SUBJECT_PRESETS = [
  'Mechanics & Rotational Dynamics',
  'Combined Maths · Calculus Vault',
  'Organic Reaction Blueprints',
] as const;

export const TUTE_FEATURE_META: Record<
  TuteFeatureId,
  { label: string; detail: string; extraMinutes: number }
> = {
  watermark: {
    label: 'PDF Watermark Guard',
    detail: 'Auto-stamps student ID onto downloadable revision packs',
    extraMinutes: 4,
  },
  timestamps: {
    label: 'Video Timestamp Sync',
    detail: 'Jump directly from written equations to recorded explanation clips',
    extraMinutes: 12,
  },
  checkpoint: {
    label: 'Auto MCQ Checkpoint',
    detail: 'Unlock the next lesson card after a 3-question quick check',
    extraMinutes: 8,
  },
  cheatsheet: {
    label: '1-Page Summary Card',
    detail: 'Printable A4 formula & diagram sheet bundled with each unit',
    extraMinutes: 5,
  },
};

export const WEB_PRESETS: Record<
  WebPresetId,
  {
    name: string;
    surfaceBg: string;
    panelBg: string;
    accentHex: string;
    inkHex: string;
    mutedHex: string;
    badge: string;
  }
> = {
  'atelier-paper': {
    name: 'Atelier Paper',
    surfaceBg: '#F4F5F0',
    panelBg: '#FFFFFF',
    accentHex: '#2563EB',
    inkHex: '#1A1A1A',
    mutedHex: '#5A5C56',
    badge: 'Daylight Editorial',
  },
  'cobalt-blueprint': {
    name: 'Cobalt Blueprint',
    surfaceBg: '#EEF4FF',
    panelBg: '#FFFFFF',
    accentHex: '#1D4ED8',
    inkHex: '#0F172A',
    mutedHex: '#475569',
    badge: 'Precision Grid',
  },
  'violet-ink': {
    name: 'Violet Ink',
    surfaceBg: '#F5F3FF',
    panelBg: '#FFFFFF',
    accentHex: '#7C3AED',
    inkHex: '#1E1B4B',
    mutedHex: '#5B5478',
    badge: 'Creative Studio',
  },
};

export function cycleAttendanceState(current: AttendanceState): AttendanceState {
  if (current === 'present') return 'late';
  if (current === 'late') return 'absent';
  return 'present';
}

export function calculateBatchMetrics(students: LmsStudentRow[]): {
  presentCount: number;
  lateCount: number;
  absentCount: number;
  attendanceRate: number;
  averageScore: number;
  healthLabel: string;
} {
  if (students.length === 0) {
    return {
      presentCount: 0,
      lateCount: 0,
      absentCount: 0,
      attendanceRate: 0,
      averageScore: 0,
      healthLabel: 'No Cohort Loaded',
    };
  }

  let presentCount = 0;
  let lateCount = 0;
  let absentCount = 0;
  let scoreSum = 0;

  for (const stu of students) {
    if (stu.attendance === 'present') presentCount += 1;
    else if (stu.attendance === 'late') lateCount += 1;
    else absentCount += 1;
    scoreSum += stu.score;
  }

  // Present = 100%, Late = 60% weighted engagement
  const weightedAttendance = ((presentCount + lateCount * 0.6) / students.length) * 100;
  const attendanceRate = Math.round(weightedAttendance);
  const averageScore = Math.round(scoreSum / students.length);

  let healthLabel = 'Attention Needed';
  if (attendanceRate >= 85) healthLabel = 'Cohort On Track';
  else if (attendanceRate >= 65) healthLabel = 'Follow-up Recommended';

  return {
    presentCount,
    lateCount,
    absentCount,
    attendanceRate,
    averageScore,
    healthLabel,
  };
}

export function estimateTuteReadiness(config: TuteComposerConfig): {
  readinessScore: number;
  estimatedMinutes: number;
  packFormat: string;
} {
  const safeModules = Math.max(1, Math.min(24, config.moduleCount));
  const baseMinutes = safeModules * 11;
  const extraMinutes = config.features.reduce(
    (sum, id) => sum + (TUTE_FEATURE_META[id]?.extraMinutes ?? 0),
    0
  );

  const readinessScore = Math.min(100, 48 + config.features.length * 13);
  const packFormat =
    config.features.includes('timestamps') && config.features.includes('checkpoint')
      ? 'Interactive Hybrid Tute + Video'
      : config.features.includes('watermark')
      ? 'Protected Digital PDF + Study Cards'
      : 'Clean Editorial Study Pack';

  return {
    readinessScore,
    estimatedMinutes: baseMinutes + extraMinutes,
    packFormat,
  };
}

export function buildLabInquiryPrompt(
  tab: LabTabId,
  options: {
    students?: LmsStudentRow[];
    tutes?: TuteComposerConfig;
    web?: WebGridConfig;
  }
): string {
  if (tab === 'lms') {
    const metrics = calculateBatchMetrics(options.students ?? INITIAL_LMS_STUDENTS);
    return `I tested the Teacher LMS Cockpit in your Studio Lab (tracking ${
      (options.students ?? INITIAL_LMS_STUDENTS).length
    } sample students at ${metrics.attendanceRate}% attendance and ${
      metrics.averageScore
    }% avg score). Can you build an Aesthetic Teacher LMS like this for my classes?`;
  }

  if (tab === 'tutes') {
    const tutes = options.tutes ?? {
      subjectTitle: TUTE_SUBJECT_PRESETS[0],
      moduleCount: 6,
      features: ['watermark', 'timestamps', 'checkpoint'],
    };
    const featureNames = tutes.features.map((id) => TUTE_FEATURE_META[id].label).join(', ');
    return `I configured a Tutes Module pack in your Studio Lab for "${tutes.subjectTitle}" (${
      tutes.moduleCount
    } chapters) with: ${
      featureNames || 'clean editorial layout'
    }. Tell me how we can launch a tutes hub like this.`;
  }

  const web = options.web ?? {
    preset: 'atelier-paper',
    scale: 'editorial',
    enable3DParallax: true,
  };
  const presetName = WEB_PRESETS[web.preset].name;
  return `I styled a Daily Web Grid prototype in your Studio Lab using the "${presetName}" daylight palette, "${web.scale}" Space Grotesk hierarchy, and ${
    web.enable3DParallax ? '3D interactive depth enabled' : 'ultra-minimal flat layout'
  }. Let's build a custom website with this aesthetic.`;
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_LMS_STUDENTS,
  TUTE_SUBJECT_PRESETS,
  buildLabInquiryPrompt,
  calculateBatchMetrics,
  cycleAttendanceState,
  estimateTuteReadiness,
} from './studioLab.ts';

test('cycleAttendanceState cycles cleanly present -> late -> absent -> present', () => {
  assert.equal(cycleAttendanceState('present'), 'late');
  assert.equal(cycleAttendanceState('late'), 'absent');
  assert.equal(cycleAttendanceState('absent'), 'present');
});

test('calculateBatchMetrics computes attendance rates and health status accurately', () => {
  const initial = calculateBatchMetrics(INITIAL_LMS_STUDENTS);
  assert.equal(initial.presentCount, 3);
  assert.equal(initial.lateCount, 1);
  assert.equal(initial.absentCount, 0);
  assert.equal(initial.attendanceRate, 90);
  assert.equal(initial.averageScore, 92);
  assert.equal(initial.healthLabel, 'Cohort On Track');

  const allAbsent = INITIAL_LMS_STUDENTS.map((s) => ({ ...s, attendance: 'absent' as const }));
  const low = calculateBatchMetrics(allAbsent);
  assert.equal(low.attendanceRate, 0);
  assert.equal(low.healthLabel, 'Attention Needed');
});

test('estimateTuteReadiness scales readiness score, study time, and hybrid pack format', () => {
  const basic = estimateTuteReadiness({
    subjectTitle: TUTE_SUBJECT_PRESETS[0],
    moduleCount: 4,
    features: [],
  });
  assert.equal(basic.readinessScore, 48);
  assert.equal(basic.estimatedMinutes, 44);
  assert.equal(basic.packFormat, 'Clean Editorial Study Pack');

  const full = estimateTuteReadiness({
    subjectTitle: TUTE_SUBJECT_PRESETS[1],
    moduleCount: 6,
    features: ['watermark', 'timestamps', 'checkpoint', 'cheatsheet'],
  });
  assert.equal(full.readinessScore, 100);
  assert.equal(full.estimatedMinutes, 66 + 4 + 12 + 8 + 5);
  assert.equal(full.packFormat, 'Interactive Hybrid Tute + Video');
});

test('buildLabInquiryPrompt produces contextual seed prompts for all three lab tabs', () => {
  const lmsPrompt = buildLabInquiryPrompt('lms', { students: INITIAL_LMS_STUDENTS });
  assert.match(lmsPrompt, /Teacher LMS Cockpit/i);
  assert.match(lmsPrompt, /90% attendance/i);

  const tutesPrompt = buildLabInquiryPrompt('tutes', {
    tutes: {
      subjectTitle: TUTE_SUBJECT_PRESETS[2],
      moduleCount: 8,
      features: ['watermark', 'checkpoint'],
    },
  });
  assert.match(tutesPrompt, /Organic Reaction Blueprints/);
  assert.match(tutesPrompt, /PDF Watermark Guard/);

  const webPrompt = buildLabInquiryPrompt('web', {
    web: {
      preset: 'violet-ink',
      scale: 'monumental',
      enable3DParallax: true,
    },
  });
  assert.match(webPrompt, /Violet Ink/);
  assert.match(webPrompt, /monumental/i);
});

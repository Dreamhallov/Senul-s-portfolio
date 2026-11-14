import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMailtoUrl,
  detectServiceCategory,
  extractConversationState,
  extractEmailFromText,
  generateLocalConciergeReply,
  type AttachedImage,
} from './aiConcierge.ts';

describe('aiConcierge utilities', () => {
  it('extractEmailFromText finds email addresses cleanly', () => {
    assert.equal(
      extractEmailFromText('Please reply to Maya.Lin+lms@Academy.edu thanks'),
      'maya.lin+lms@academy.edu'
    );
    assert.equal(extractEmailFromText('No email here'), null);
  });

  it('detectServiceCategory routes LMS, Tutes, and Web requests accurately', () => {
    assert.equal(detectServiceCategory('I need a Teacher LMS for 200 students'), 'Aesthetic Teacher LMS');
    assert.equal(detectServiceCategory('Looking to publish weekly PDF tutes'), 'Tutes & Study Platform');
    assert.equal(detectServiceCategory('Need a daily bespoke website'), 'Daily Bespoke Website');
  });

  it('buildMailtoUrl produces properly encoded mailto URI for Senul', () => {
    const uri = buildMailtoUrl({
      customerName: 'Maya Lin',
      customerEmail: 'maya@academy.edu',
      serviceType: 'Aesthetic Teacher LMS',
      projectSummary: 'Cohort portal with attendance and tutes.',
    });
    assert.ok(uri.startsWith('mailto:senuljayaweera47@gmail.com?subject='));
    assert.ok(uri.includes('Maya%20Lin'));
    assert.ok(uri.includes('maya%40academy.edu'));
  });

  it('dispatches email payload with image attachments when user supplies email and images', () => {
    const sampleImage: AttachedImage = {
      id: 'img-1',
      name: 'lms-reference.png',
      mimeType: 'image/png',
      sizeBytes: 2048,
      dataUrl: 'data:image/png;base64,iVBORw0KGgo=',
    };
    const res = generateLocalConciergeReply(
      'My name is Maya Lin, email maya@academy.edu, please send this Teacher LMS brief with my design screenshot to Senul',
      [],
      [sampleImage]
    );
    assert.ok(res.emailPayload);
    assert.equal(res.emailPayload?.customerEmail, 'maya@academy.edu');
    assert.equal(res.emailPayload?.customerName, 'Maya Lin');
    assert.equal(res.emailPayload?.attachments?.length, 1);
    assert.equal(res.emailPayload?.attachments?.[0].name, 'lms-reference.png');
    assert.ok(res.reply.includes('lms-reference.png'));
  });

  it('never repeats the same fallback reply for "ok thx" vs "done?"', () => {
    const history = [
      { role: 'user' as const, content: 'Tell me about Teacher LMS for 200 students' },
      {
        role: 'assistant' as const,
        content: 'Senul builds calm, modern Teacher LMS portals for 200 students.',
      },
    ];
    const okThxReply = generateLocalConciergeReply('ok thx', history);
    const doneQuestionReply = generateLocalConciergeReply('done?', history);

    assert.notEqual(okThxReply.reply, doneQuestionReply.reply);
    assert.ok(!okThxReply.reply.includes('Based on what you mentioned'));
    assert.ok(!doneQuestionReply.reply.includes('Based on what you mentioned'));
    assert.ok(doneQuestionReply.reply.toLowerCase().includes('not sent yet'));
  });

  it('handles "done?" accurately after email dispatch without repeating greeting', () => {
    const history = [
      {
        role: 'user' as const,
        content: 'My name is Maya Lin, email maya@academy.edu, send inquiry for Teacher LMS',
      },
      {
        role: 'assistant' as const,
        content:
          'Sent & logged, Maya Lin! Your Aesthetic Teacher LMS brief has been queued for Senul at senuljayaweera47@gmail.com.',
      },
    ];
    const res = generateLocalConciergeReply('done?', history);
    assert.ok(res.reply.toLowerCase().includes('yes, it is sent'));
    assert.ok(res.reply.includes('maya@academy.edu'));
    assert.equal(res.emailPayload, undefined);
  });

  it('extracts deep memory from long multi-paragraph briefs and recalls it cleanly', () => {
    const longBrief =
      'Hi, my name is Kasun Perera from BrightMinds Academy. We run A/L classes for 450 students across 6 batches. ' +
      'We want a clean daylight minimal UI with modern geometric sans-serif fonts, batch attendance tracking via QR code, ' +
      'modular PDF tutes vault with recorded live Zoom class replays, and bank transfer slip fee tracking. ' +
      'We hope to launch in 2 weeks with a student-friendly budget around 45k LKR. Inspiration site: https://example.com';

    const state = extractConversationState([], longBrief, [
      { name: 'class-schedule.png', mimeType: 'image/png', sizeBytes: 1024 },
    ]);

    assert.equal(state.customerName, 'Kasun Perera');
    assert.equal(state.organization, 'BrightMinds Academy');
    assert.equal(state.scale, '450 students');
    assert.equal(state.timeline, '2 weeks');
    assert.equal(state.budget, '45k LKR');
    assert.ok(state.mentionedFeatures.includes('batch attendance tracking'));
    assert.ok(state.mentionedFeatures.includes('modular PDF & tutes vault'));
    assert.ok(state.mentionedFeatures.includes('student fee & slip tracking'));
    assert.equal(state.attachedImages.length, 1);

    const longReply = generateLocalConciergeReply(longBrief, [], [
      {
        id: 'i1',
        name: 'class-schedule.png',
        mimeType: 'image/png',
        sizeBytes: 1024,
        dataUrl: 'data:image/png;base64,AA==',
      },
    ]);
    assert.ok(longReply.reply.includes('BrightMinds Academy'));
    assert.ok(longReply.reply.includes('450 students'));

    const recapReply = generateLocalConciergeReply('What do you remember?', [
      {
        role: 'user',
        content: longBrief,
        attachments: [{ name: 'class-schedule.png', mimeType: 'image/png', sizeBytes: 1024 }],
      },
      { role: 'assistant', content: longReply.reply },
    ]);
    assert.ok(recapReply.reply.includes('Kasun Perera'));
    assert.ok(recapReply.reply.includes('BrightMinds Academy'));
    assert.ok(recapReply.reply.includes('class-schedule.png'));
  });

  it('tracks multi-turn context when user says "tell me more" after asking about LMS', () => {
    const history = [
      { role: 'user' as const, content: 'Tell me about Teacher LMS' },
      {
        role: 'assistant' as const,
        content:
          'Senul builds calm, modern Teacher LMS portals. Key modules include cohort rosters and attendance.',
      },
    ];
    const res = generateLocalConciergeReply('tell me more', history);
    assert.ok(res.reply.toLowerCase().includes('attendance') || res.reply.toLowerCase().includes('mcq'));
    assert.ok(!res.reply.includes('Hello! I am Senul'));
  });

  it('answers free / zero-API-billing questions clearly', () => {
    const res = generateLocalConciergeReply('Can this run free without paying for an API key?', []);
    assert.ok(res.reply.includes('$0') || res.reply.toLowerCase().includes('free'));
  });
});

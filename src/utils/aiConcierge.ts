export interface AttachedImage {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  dataUrl: string;
}

export interface AttachedImageMeta {
  name: string;
  mimeType: string;
  sizeBytes: number;
}

export interface EmailDispatchPayload {
  customerName: string;
  customerEmail: string;
  serviceType: string;
  projectSummary: string;
  budgetOrTimeline?: string;
  attachments?: AttachedImage[];
}

export interface ConciergeMessage {
  role: 'user' | 'assistant';
  content: string;
  attachments?: AttachedImageMeta[];
}

export interface ConversationState {
  customerName?: string;
  customerEmail?: string;
  phoneOrWhatsapp?: string;
  organization?: string;
  referenceUrls: string[];
  serviceType: string;
  mentionedFeatures: string[];
  designPreferences: string[];
  timeline?: string;
  budget?: string;
  scale?: string;
  attachedImages: AttachedImageMeta[];
  keyNotes: string[];
  emailAlreadyDispatched: boolean;
  lastEmailAttachmentCount: number;
  lastAssistantTopic:
    | 'greeting'
    | 'lms'
    | 'tutes'
    | 'web'
    | 'pricing'
    | 'support'
    | 'images'
    | 'memory'
    | 'email_prompt'
    | 'email_sent'
    | 'general';
}

export interface ConciergeFallbackResult {
  reply: string;
  emailPayload?: EmailDispatchPayload;
  memorySnapshot: ConversationState;
  suggestedQuickReplies: string[];
}

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const URL_REGEX = /https?:\/\/[^\s,)]+/gi;
const PHONE_REGEX = /(?:\+?\d{1,3}[\s-]?)?(?:0\d{9}|\d{3}[\s-]?\d{3}[\s-]?\d{4})/;

export function extractEmailFromText(text: string): string | null {
  const match = text.match(EMAIL_REGEX);
  return match ? match[0].toLowerCase() : null;
}

export function extractNameFromText(text: string): string | null {
  const patterns = [
    /(?:my name is|i am|i'm|this is|call me|name\s*[:=-])\s*([A-Za-z]{2,}(?:\s+(?!(?:from|at|in|for|with|to|of|and|or|need|want|looking)\b)[A-Za-z]{2,})?)/i,
    /(?:regards|thanks|cheers|sincerely|best|from),?\s*\n\s*([A-Za-z]{2,}(?:\s+[A-Za-z]{2,})?)/i,
  ];
  const blocked = new Set([
    'interested',
    'looking',
    'building',
    'teacher',
    'ready',
    'done',
    'here',
    'fine',
    'senul',
    'attached',
    'sending',
    'asking',
    'trying',
    'working',
    'wanting',
    'planning',
  ]);

  for (const rx of patterns) {
    const match = text.match(rx);
    if (match) {
      const candidate = match[1].trim();
      const firstWord = candidate.split(/\s+/)[0].toLowerCase();
      if (!blocked.has(firstWord) && candidate.length >= 2) {
        return candidate
          .split(/\s+/)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
      }
    }
  }
  return null;
}

export function detectServiceCategory(text: string): string {
  const lower = text.toLowerCase();
  const hasLms = /\b(lms|teacher|student|tuition|batch|academy|school|cohort|attendance)\b/i.test(
    lower
  );
  const hasTutes = /\b(tute|tutes|tutorial|note|notes|pdf|worksheet|study|syllabus|mcq)\b/i.test(
    lower
  );
  const hasWeb = /\b(web|website|site|landing|portfolio|homepage|agency|business site)\b/i.test(
    lower
  );
  const has3d = /\b(3d|webgl|three\.?js|shader)\b/i.test(lower);

  if (hasLms && hasTutes) return 'Teacher LMS + Tutes Hub';
  if (hasLms) return 'Aesthetic Teacher LMS';
  if (hasTutes) return 'Tutes & Study Platform';
  if (has3d && hasWeb) return '3D Interactive Website';
  if (hasWeb) return 'Daily Bespoke Website';
  if (/\b(support|customer care|maintain|maintenance|ai helper|concierge)\b/i.test(lower)) {
    return 'Customer Care & AI Support';
  }
  return 'Custom Digital Studio Build';
}

export function buildMailtoUrl(
  payload: EmailDispatchPayload,
  recipient = 'senuljayaweera47@gmail.com'
): string {
  const attachmentNames =
    payload.attachments && payload.attachments.length > 0
      ? payload.attachments.map((a) => a.name).join(', ')
      : '';
  const subject = encodeURIComponent(
    `[Portfolio Inquiry] ${payload.serviceType} — ${payload.customerName}`
  );
  const body = encodeURIComponent(
    `Hi Senul,\n\n` +
      `Name: ${payload.customerName}\n` +
      `Reply Email: ${payload.customerEmail}\n` +
      `Service: ${payload.serviceType}\n` +
      (payload.budgetOrTimeline ? `Timeline / Scale / Budget: ${payload.budgetOrTimeline}\n` : '') +
      (attachmentNames ? `Attached Images: ${attachmentNames}\n` : '') +
      `\nProject Brief:\n${payload.projectSummary}\n\n` +
      `Sent via Senul Studio AI Concierge.`
  );
  return `mailto:${recipient}?subject=${subject}&body=${body}`;
}

function extractMeaningfulClauses(texts: string[]): string[] {
  const clauses: string[] = [];
  const noiseOnly =
    /^(hi|hello|hey|ok|okay|k|yes|yeah|yep|no|nope|done|sent|thanks|thank you|thx|ty|ok thx|ok thanks|cool|great|nice|awesome|perfect|tell me more|more|done\??|sent\??)[!?. \s]*$/i;

  for (const raw of texts) {
    const parts = raw
      .split(/(?<=[.!?])\s+|\n+/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 12 && !noiseOnly.test(s));

    for (const part of parts) {
      const cleaned = part.replace(/\s+/g, ' ');
      if (!clauses.some((existing) => existing.toLowerCase() === cleaned.toLowerCase())) {
        clauses.push(cleaned);
      }
    }
  }
  return clauses.slice(-8);
}

export function extractConversationState(
  history: ConciergeMessage[],
  currentMessage: string,
  currentImages: AttachedImageMeta[] = []
): ConversationState {
  const userEntries = history.filter((m) => m.role === 'user');
  const userTexts = [...userEntries.map((m) => m.content), currentMessage];
  const fullUserText = userTexts.join('\n');
  const lowerAll = fullUserText.toLowerCase();

  let customerEmail: string | undefined;
  let customerName: string | undefined;
  let phoneOrWhatsapp: string | undefined;
  let organization: string | undefined;

  for (const msg of userTexts) {
    const email = extractEmailFromText(msg);
    if (email) customerEmail = email;

    const name = extractNameFromText(msg);
    if (name) customerName = name;

    const phone = msg.match(PHONE_REGEX);
    if (phone) phoneOrWhatsapp = phone[0].trim();

    const orgMatch = msg.match(
      /(?:for|at|from|called|named)\s+([A-Z][A-Za-z0-9&'\s]{2,36}?(?:Academy|School|Institute|College|Classes|Tuition|Studio|Labs|Hub|Center|Centre|Education))/
    );
    if (orgMatch) organization = orgMatch[1].trim();
  }

  const referenceUrls = Array.from(new Set(fullUserText.match(URL_REGEX) || [])).slice(0, 5);

  const featureMap: Array<[RegExp, string]> = [
    [/attendance|roll|check-?in|qr\s*code/i, 'batch attendance tracking'],
    [/grade|grading|mark|exam|quiz|mcq|assignment|homework/i, 'assignments & automated MCQ quizzes'],
    [/video|recording|zoom|live|stream|replay|vimeo|youtube/i, 'recorded & live class streaming'],
    [/pdf|tute|tutes|note|notes|worksheet|download|watermark/i, 'modular PDF & tutes vault'],
    [/pay|fee|slip|stripe|receipt|invoice|bank\s*transfer|monthly/i, 'student fee & slip tracking'],
    [/whatsapp|parent|sms|alert|notification/i, 'student & parent alerts'],
    [/login|portal|dashboard|role|admin|teacher\s*panel|student\s*panel/i, 'role-based Teacher & Student portals'],
    [/chat|ai|concierge|assistant|bot/i, 'unlimited 24/7 AI helper integration'],
    [/3d|webgl|three|animation|scroll|motion|interactive/i, 'interactive 3D & GSAP scroll motion'],
    [/seo|google|fast|speed|mobile|responsive|pwa/i, 'mobile-first optimization & SEO'],
    [/sinhala|tamil|english|bilingual|multilingual/i, 'multilingual lesson support'],
  ];

  const mentionedFeatures = featureMap
    .filter(([rx]) => rx.test(lowerAll))
    .map(([, label]) => label);

  const styleMap: Array<[RegExp, string]> = [
    [/light\s*(mode|theme)|daylight|white|cream|clean|minimal/i, 'clean daylight minimal UI'],
    [/dark\s*(mode|theme)|obsidian|black/i, 'dark high-contrast aesthetic'],
    [/purple|violet|blue|pastel|gradient|glass/i, 'editorial accent & soft glass surfaces'],
    [/modern|geometric|sans|swiss/i, 'modern geometric sans-serif typography'],
  ];

  const designPreferences = styleMap
    .filter(([rx]) => rx.test(lowerAll))
    .map(([, label]) => label);

  const timelineMatch = fullUserText.match(
    /(\b\d+\s*(?:day|days|week|weeks|month|months)\b|\b(?:this week|next week|next month|asap|urgent|urgently|today|tomorrow|by\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b)/i
  );
  const numericScaleMatch = fullUserText.match(
    /\b(\d+\+?\s*(?:student|students|learner|learners|user|users|class|classes|batch|batches|subject|subjects|page|pages|teacher|teachers))\b/i
  );
  const tierScaleMatch = fullUserText.match(
    /\b(O\/L|A\/L|OL|AL|IGCSE|Grade\s*\d+(?:\s*[-–to]+\s*\d+)?)\b/i
  );
  const scaleMatchValue = numericScaleMatch?.[1] || tierScaleMatch?.[1];
  const budgetMatch = fullUserText.match(
    /((?:USD|\$|LKR|Rs\.?|EUR|GBP)\s*\d[\d,]*(?:k)?|\d[\d,]*(?:k)\s*(?:LKR|USD|Rs)?|\b(?:low\s*budget|free\s*tier|student\s*budget|affordable|tight\s*budget)\b)/i
  );

  // Collect all attached images across previous user turns + current turn (dedup by name+size)
  const imageMap = new Map<string, AttachedImageMeta>();
  for (const entry of userEntries) {
    if (entry.attachments) {
      for (const img of entry.attachments) {
        imageMap.set(`${img.name}:${img.sizeBytes}`, img);
      }
    }
  }
  for (const img of currentImages) {
    imageMap.set(`${img.name}:${img.sizeBytes}`, img);
  }
  const attachedImages = Array.from(imageMap.values());

  const assistantEntries = history.filter((m) => m.role === 'assistant');
  const lastAssistant = assistantEntries[assistantEntries.length - 1]?.content || '';

  const emailAlreadyDispatched = assistantEntries.some((m) =>
    /sent & logged|has been queued|logged and queued|brief has been prepared|dispatched|sent your inquiry|inquiry logged|recorded for senul/i.test(
      m.content
    )
  );

  // Count images acknowledged in last sent email if we track it cleanly
  let lastEmailAttachmentCount = 0;
  for (const m of assistantEntries) {
    const match = m.content.match(/with (\d+) attached image/i);
    if (match) lastEmailAttachmentCount = Number(match[1]);
  }

  let lastAssistantTopic: ConversationState['lastAssistantTopic'] = 'general';
  if (/email address|share your email|reply address|direct email/i.test(lastAssistant)) {
    lastAssistantTopic = 'email_prompt';
  } else if (/logged and queued|recorded for senul|dispatched/i.test(lastAssistant)) {
    lastAssistantTopic = 'email_sent';
  } else if (/image|mockup|screenshot|attached/i.test(lastAssistant)) {
    lastAssistantTopic = 'images';
  } else if (/memory recap|remember/i.test(lastAssistant)) {
    lastAssistantTopic = 'memory';
  } else if (/teacher lms|cohort|grading|attendance/i.test(lastAssistant)) {
    lastAssistantTopic = 'lms';
  } else if (/tutes|study creation|pdf|lesson/i.test(lastAssistant)) {
    lastAssistantTopic = 'tutes';
  } else if (/website|daily|landing|3d/i.test(lastAssistant)) {
    lastAssistantTopic = 'web';
  } else if (/price|cost|timeline|day|host|free/i.test(lastAssistant)) {
    lastAssistantTopic = 'pricing';
  }

  return {
    customerName,
    customerEmail,
    phoneOrWhatsapp,
    organization,
    referenceUrls,
    serviceType: detectServiceCategory(fullUserText),
    mentionedFeatures,
    designPreferences,
    timeline: timelineMatch ? timelineMatch[1].trim() : undefined,
    budget: budgetMatch ? budgetMatch[1].trim() : undefined,
    scale: scaleMatchValue ? scaleMatchValue.trim() : undefined,
    attachedImages,
    keyNotes: extractMeaningfulClauses(userTexts),
    emailAlreadyDispatched,
    lastEmailAttachmentCount,
    lastAssistantTopic,
  };
}

export function buildStructuredSummary(state: ConversationState, fallbackText: string): string {
  const parts: string[] = [];
  if (state.organization) parts.push(`Organization: ${state.organization}`);
  if (state.scale) parts.push(`Scale: ${state.scale}`);
  if (state.mentionedFeatures.length > 0) {
    parts.push(`Features: ${state.mentionedFeatures.join(', ')}`);
  }
  if (state.designPreferences.length > 0) {
    parts.push(`Style: ${state.designPreferences.join(', ')}`);
  }
  if (state.referenceUrls.length > 0) {
    parts.push(`Links: ${state.referenceUrls.join(', ')}`);
  }
  if (state.phoneOrWhatsapp) parts.push(`Phone/WhatsApp: ${state.phoneOrWhatsapp}`);
  if (state.keyNotes.length > 0) {
    parts.push(`Details: ${state.keyNotes.join(' | ')}`);
  } else if (fallbackText.trim()) {
    parts.push(`Message: ${fallbackText.trim()}`);
  }
  return parts.join('\n').slice(0, 1200);
}

function formatMemoryRecap(state: ConversationState): string {
  const lines: string[] = [];
  if (state.customerName) lines.push(`Name: ${state.customerName}`);
  if (state.customerEmail) lines.push(`Email: ${state.customerEmail}`);
  if (state.organization) lines.push(`Academy/Brand: ${state.organization}`);
  lines.push(`Service Focus: ${state.serviceType}`);
  if (state.scale) lines.push(`Scale: ${state.scale}`);
  if (state.mentionedFeatures.length > 0) {
    lines.push(`Features: ${state.mentionedFeatures.join(', ')}`);
  }
  if (state.designPreferences.length > 0) {
    lines.push(`Visual Style: ${state.designPreferences.join(', ')}`);
  }
  if (state.timeline) lines.push(`Timeline: ${state.timeline}`);
  if (state.budget) lines.push(`Budget: ${state.budget}`);
  if (state.referenceUrls.length > 0) {
    lines.push(`Links: ${state.referenceUrls.join(', ')}`);
  }
  if (state.attachedImages.length > 0) {
    lines.push(
      `Images (${state.attachedImages.length}): ${state.attachedImages.map((i) => i.name).join(', ')}`
    );
  }
  return lines.join(' · ');
}

/**
 * Self-contained, 100% free & unlimited multi-turn AI Concierge brain.
 * Understands long multi-paragraph briefs, remembers prior context & uploaded
 * images across turns, and attaches uploaded images when emailing Senul.
 */
export function generateLocalConciergeReply(
  message: string,
  history: ConciergeMessage[] = [],
  currentImages: AttachedImage[] = []
): ConciergeFallbackResult {
  const trimmed = message.trim();
  const lower = trimmed.toLowerCase();
  const currentImageMetas: AttachedImageMeta[] = currentImages.map((img) => ({
    name: img.name,
    mimeType: img.mimeType,
    sizeBytes: img.sizeBytes,
  }));

  const state = extractConversationState(history, trimmed, currentImageMetas);
  const newEmailInThisTurn = extractEmailFromText(trimmed);
  const isFirstTurn = history.length <= 1;

  // Clean normalized check for short messages (handles punctuation like "done?", "ok thx!", "sent?")
  const normalized = lower.replace(/[!?.,]+$/g, '').trim();

  const isStatusQuestion =
    /^(done\??|sent\??|is it sent|did you send|did u send|finished|all good|email sent\??)$/i.test(
      lower
    ) || /\b(did you send|has it been sent|was it emailed|is it done)\b/i.test(lower);

  const isOkThanksCombo =
    /^(?:ok(?:ay)?|k|cool|alright|got it|nice|great|awesome|perfect|sounds good|sure)(?:\s+(?:thx|thanks|thank you|ty|appreciate it))?$/i.test(
      normalized
    ) || /^(?:thx|thanks|thank you|ty|appreciated|cheers)(?:\s+(?:so much|a lot|bro|mate))?$/i.test(
      normalized
    );

  const isConfirmSend =
    /^(yes|yeah|yep|go ahead|send it|do it|please send|send now|mail it|confirm|yes please)$/i.test(
      normalized
    );

  const isGreeting = /^(hi|hello|hey|yo|good morning|good afternoon|good evening|hola|ayubowan)$/i.test(
    normalized
  );

  const asksMemoryRecap =
    /\b(what do you remember|remember everything|summarize|summary|recap|check my details|what did i tell|my notes|in memory)\b/i.test(
      lower
    );

  const isFollowUpMore =
    /\b(more|tell me more|explain|details|how does that work|what else|elaborate|example|examples|features)\b/i.test(
      lower
    ) && trimmed.split(/\s+/).length <= 8;

  const asksToSend =
    /\b(send|email|mail|dispatch|contact|book|hire|reach out|message senul|quote|forward)\b/i.test(
      lower
    );

  const imageCount = state.attachedImages.length;
  const imageNames = state.attachedImages.map((img) => img.name).join(', ');
  const hasNewImages = currentImages.length > 0;

  // 1. Dispatch email (with all remembered details + ALL session images!) when:
  //    a) User supplied an email in this turn, OR
  //    b) User explicitly says send / confirm when email is already in memory, OR
  //    c) User uploaded new images and says send/attach with email already known
  const shouldDispatchNow =
    Boolean(newEmailInThisTurn) ||
    ((asksToSend || isConfirmSend) && Boolean(state.customerEmail) && (!state.emailAlreadyDispatched || hasNewImages || state.keyNotes.length > 0));

  if (shouldDispatchNow) {
    const email = newEmailInThisTurn || state.customerEmail!;
    const name = state.customerName || email.split('@')[0];
    const summary = buildStructuredSummary(state, trimmed);
    const metaTimeline = [state.timeline, state.scale, state.budget].filter(Boolean).join(' · ');

    const featurePart =
      state.mentionedFeatures.length > 0
        ? ` covering ${state.mentionedFeatures.slice(0, 4).join(', ')}`
        : '';
    const imgPart =
      currentImages.length > 0
        ? ` with ${currentImages.length} attached image${currentImages.length > 1 ? 's' : ''} (${currentImages
            .map((i) => i.name)
            .join(', ')})`
        : imageCount > 0
          ? ` (referencing ${imageCount} image${imageCount > 1 ? 's' : ''}: ${imageNames})`
          : '';

    return {
      reply:
        `Sent & logged${state.customerName ? `, ${state.customerName}` : ''}! Your ${state.serviceType} brief${featurePart}${imgPart} has been queued for Senul at senuljayaweera47@gmail.com with your reply address ${email}. ` +
        `I kept all your long-message notes${imageCount > 0 ? ' and uploaded visuals' : ''} intact—Senul will review everything and reply directly to ${email}.`,
      emailPayload: {
        customerName: name,
        customerEmail: email,
        serviceType: state.serviceType,
        projectSummary: summary,
        budgetOrTimeline: metaTimeline || 'Submitted via Studio AI Concierge',
        attachments: currentImages.length > 0 ? currentImages : undefined,
      },
      memorySnapshot: { ...state, customerEmail: email, emailAlreadyDispatched: true },
      suggestedQuickReplies: [
        'What do you remember from my brief?',
        'Upload another reference image',
        'Can this run without paid APIs?',
      ],
    };
  }

  // 2. Status check ("done?", "sent?", "did you send?")
  if (isStatusQuestion) {
    if (state.emailAlreadyDispatched && state.customerEmail) {
      return {
        reply:
          `Yes, it is sent! Your ${state.serviceType} inquiry is logged for Senul (senuljayaweera47@gmail.com) under ${state.customerEmail}${imageCount > 0 ? ` along with ${imageCount} image${imageCount > 1 ? 's' : ''} (${imageNames})` : ''}. ` +
          `If you want to add extra details or attach more screenshots, drop them here anytime.`,
        memorySnapshot: state,
        suggestedQuickReplies: [
          'What do you remember from my brief?',
          'Reach Senul on X or Instagram',
        ],
      };
    }

    if (state.customerEmail) {
      return {
        reply:
          `Almost done—I already have your email (${state.customerEmail})${state.keyNotes.length ? ' and project notes' : ''}${imageCount > 0 ? ` plus ${imageCount} image(s)` : ''}. ` +
          `Say "send it" to dispatch the brief to senuljayaweera47@gmail.com right now, or keep adding requirements.`,
        memorySnapshot: state,
        suggestedQuickReplies: ['Send it now', 'What do you remember?'],
      };
    }

    return {
      reply:
        `Not sent yet! I have saved your context in memory (${formatMemoryRecap(state)}). ` +
        `To send this straight to Senul at senuljayaweera47@gmail.com${imageCount > 0 ? ` with your ${imageCount} image(s)` : ''}, reply with your email address (for example: name@school.edu).`,
      memorySnapshot: state,
      suggestedQuickReplies: [
        'Open Direct Email Form',
        'What do you remember?',
      ],
    };
  }

  // 3. Natural handling of "ok thx", "thanks", "okay", "cool", etc. — zero repetitive fallback!
  if (isOkThanksCombo) {
    if (state.emailAlreadyDispatched) {
      return {
        reply:
          `You're welcome${state.customerName ? `, ${state.customerName}` : ''}! Your brief is with Senul and your full context stays saved here if you ever want to add screenshots or adjust timeline details.`,
        memorySnapshot: state,
        suggestedQuickReplies: ['Add another image', 'What do you remember?'],
      };
    }
    const rememberedPieces = [
      state.serviceType !== 'Custom Digital Studio Build' ? state.serviceType : null,
      state.scale,
      state.mentionedFeatures[0],
      imageCount > 0 ? `${imageCount} image${imageCount > 1 ? 's' : ''}` : null,
    ].filter(Boolean);

    return {
      reply:
        rememberedPieces.length > 0
          ? `Happy to help! I've kept your notes on ${rememberedPieces.join(', ')} in memory. Just share your email whenever you want me to send everything to Senul, or ask any other question.`
          : `Anytime! I'm here 24/7 with no limits—feel free to share project details, upload design screenshots, or enter your email whenever you're ready to reach Senul.`,
      memorySnapshot: state,
      suggestedQuickReplies: [
        'Send an inquiry email to Senul',
        'Upload a design screenshot',
        'Can this run without paid APIs?',
      ],
    };
  }

  // 4. Memory recap ("what do you remember", "summarize")
  if (asksMemoryRecap) {
    return {
      reply:
        `Here is everything I currently remember from our session: ${formatMemoryRecap(state)}.` +
        (state.keyNotes.length > 0
          ? ` Key requirements noted: ${state.keyNotes.slice(-3).join(' / ')}.`
          : '') +
        (state.customerEmail
          ? ' Say "send it" anytime to forward an updated copy to Senul.'
          : ' Share your email address whenever you want me to send all of this to senuljayaweera47@gmail.com.'),
      memorySnapshot: state,
      suggestedQuickReplies: state.customerEmail
        ? ['Send updated brief to Senul', 'Upload another image']
        : ['My email is teacher@academy.edu', 'Open Direct Email Form'],
    };
  }

  // 5. Short image upload turn without an email or long brief in the same turn
  if (hasNewImages && !state.customerEmail && trimmed.length < 110) {
    const newNames = currentImages.map((i) => i.name).join(', ');
    const alsoNotes =
      state.mentionedFeatures.length > 0
        ? ` alongside your requirements (${state.mentionedFeatures.slice(0, 3).join(', ')})`
        : '';
    return {
      reply:
        `Got ${currentImages.length === 1 ? 'your image' : `your ${currentImages.length} images`} (${newNames})! I've stored ${currentImages.length === 1 ? 'it' : 'them'} in memory${alsoNotes}. ` +
        `Reply with your email address whenever you're ready and I will attach ${currentImages.length === 1 ? 'this image' : 'these images'} when emailing Senul (senuljayaweera47@gmail.com)—or use the "Direct Email" tab above.`,
      memorySnapshot: state,
      suggestedQuickReplies: [
        'What do you remember?',
        'Open Direct Email Form',
      ],
    };
  }

  // 6. Explicit request to email when email isn't in memory yet
  if (asksToSend && !state.customerEmail && trimmed.length < 140) {
    return {
      reply:
        `Ready to email Senul (senuljayaweera47@gmail.com) about your ${state.serviceType}${imageCount > 0 ? ` including ${imageCount} attached image${imageCount > 1 ? 's' : ''} (${imageNames})` : ''}! ` +
        `Just reply with your email address (and your name if you'd like), or attach images in the "Direct Email" tab above.`,
      memorySnapshot: state,
      suggestedQuickReplies: ['Open Direct Email Form', 'What do you remember?'],
    };
  }

  // 7. Long detailed brief comprehension (multi-clause / 110+ chars without email)
  if (trimmed.length >= 110 || trimmed.split(/[.!?\n]/).filter((s) => s.trim().length > 8).length >= 3) {
    const capturedBits: string[] = [];
    if (state.organization) capturedBits.push(`brand/school "${state.organization}"`);
    if (state.scale) capturedBits.push(`scale (${state.scale})`);
    if (state.mentionedFeatures.length > 0) {
      capturedBits.push(`modules (${state.mentionedFeatures.slice(0, 5).join(', ')})`);
    }
    if (state.designPreferences.length > 0) {
      capturedBits.push(`style (${state.designPreferences.join(', ')})`);
    }
    if (state.timeline) capturedBits.push(`timeline (${state.timeline})`);
    if (state.budget) capturedBits.push(`budget (${state.budget})`);
    if (imageCount > 0) {
      capturedBits.push(`${imageCount} image${imageCount > 1 ? 's' : ''} (${imageNames})`);
    }

    const captureSummary =
      capturedBits.length > 0
        ? `I've captured every detail into memory for your ${state.serviceType}: ${capturedBits.join('; ')}.`
        : `I've stored your detailed ${state.serviceType} notes in full memory (${state.keyNotes.length} key points).`;

    const advice =
      state.serviceType.includes('LMS') || state.serviceType.includes('Tutes')
        ? 'Senul structures these builds with fast mobile student dashboards, organized weekly tutes/video chapters, batch attendance, and zero recurring AI fees.'
        : 'Senul builds these with clean modern geometric typography, smooth 3D/scroll choreography, sub-second loading, and free/low-cost cloud hosting.';

    const nextPrompt = state.customerEmail
      ? `Say "send it" whenever you want me to email this complete brief to Senul at ${state.customerEmail}.`
      : 'Drop your email address (plus any reference screenshots using the paperclip/image button) and I will send this complete structured brief straight to senuljayaweera47@gmail.com.';

    return {
      reply: `${captureSummary} ${advice} ${nextPrompt}`,
      memorySnapshot: state,
      suggestedQuickReplies: state.customerEmail
        ? ['Send it now', 'What do you remember?']
        : ['What do you remember?', 'How much & how long?'],
    };
  }

  // 8. Contextual "tell me more" based on previous turn
  if (isFollowUpMore) {
    if (state.lastAssistantTopic === 'lms') {
      return {
        reply:
          `Inside Senul's Teacher LMS architecture, teachers get one calm cockpit for batch scheduling, QR/one-click attendance, assignment submissions, MCQ auto-grading, and fee status—while students get a clean mobile-first portal with zero clutter.`,
        memorySnapshot: state,
        suggestedQuickReplies: [
          'How are tutes and PDFs handled?',
          'Email Senul about an LMS',
        ],
      };
    }
    if (state.lastAssistantTopic === 'tutes') {
      return {
        reply:
          `The Tutes & Study Creation workflow organizes lessons chapter-by-chapter: each unit pairs crisp printable PDF packs, embedded video timestamps, interactive revision checkpoints, and batch unlock permissions.`,
        memorySnapshot: state,
        suggestedQuickReplies: [
          'Combine Teacher LMS + Tutes',
          'Email Senul about Tutes Hub',
        ],
      };
    }
    return {
      reply:
        `All builds pair Space Grotesk & DM Sans geometric typography, React/Next.js + Tailwind CSS, optional Three.js 3D mouse interaction, and free-tier-friendly cloud hosting (Vercel/Cloudflare/Firebase) so daily websites ship in 1–4 days and Teacher LMS platforms in 5–10 days.`,
      memorySnapshot: state,
      suggestedQuickReplies: [
        'Send a brief to Senul',
        'Upload a reference image',
      ],
    };
  }

  // 9. Free / API / Hosting / Cost / Timeline questions
  if (/\b(api|rich|free|cost|price|pricing|budget|hosting|domain|pay|paid|subscription|key|timeline|long)\b/i.test(lower)) {
    return {
      reply:
        `This AI Concierge runs 100% free with zero paid API keys or monthly AI fees—visitors can chat unlimited times and upload images at $0 cost. ` +
        `For client builds, Senul supports free/low-cost cloud hosting (Vercel, Cloudflare Pages, Firebase free tiers): daily sites launch in 1–4 days, Tutes Hubs in 3–7 days, and custom Teacher LMS portals in 5–10 days. Share your scale or email for an exact scope!`,
      memorySnapshot: state,
      suggestedQuickReplies: [
        'Email Senul for a custom quote',
        'Upload a mockup image',
        'How does Teacher LMS work?',
      ],
    };
  }

  // 10. Capabilities / "who are you" / "know everything"
  if (
    /\b(who are you|what can you|what do you know|help me|capabilities|everything|about senul|portfolio|skills)\b/i.test(
      lower
    )
  ) {
    return {
      reply:
        `I represent Senul Jayaweera (Colombo, Sri Lanka)—specializing in Aesthetic Teacher LMS portals, Tutes & Study Creation platforms, Daily Custom Websites, interactive 3D WebGL scenes, and Ongoing Customer Care. ` +
        `I remember long multi-paragraph briefs across our whole chat, accept uploaded design images, and email everything directly to senuljayaweera47@gmail.com.`,
      memorySnapshot: state,
      suggestedQuickReplies: [
        'Explain Teacher LMS features',
        'Upload a design screenshot',
        'Send an inquiry email to Senul',
      ],
    };
  }

  // 11. Teacher LMS / Student / Tuition / Academy
  if (/\b(lms|teacher|student|tuition|batch|academy|school|attendance|grade|grading|exam|zoom|class)\b/i.test(lower)) {
    const scaleNote = state.scale ? ` for ${state.scale}` : '';
    const extras =
      state.mentionedFeatures.length > 0
        ? ` Noted modules so far: ${state.mentionedFeatures.join(', ')}.`
        : ' Typical modules include cohort rosters, attendance, MCQ/assignment grading, live class links, and student progress tracking.';
    return {
      reply:
        `Senul builds calm, modern Teacher LMS portals${scaleNote} that replace messy spreadsheets and scattered chat links.${extras} ` +
        `Delivery takes 5–10 days. Feel free to paste a detailed list of features or upload a screenshot anytime!`,
      memorySnapshot: state,
      suggestedQuickReplies: [
        'How are Tutes & PDFs integrated?',
        'Upload a UI reference image',
        'Email Senul about a Teacher LMS',
      ],
    };
  }

  // 12. Tutes & Study Creation
  if (/\b(tute|tutes|tutorial|note|notes|pdf|worksheet|study|course|lesson|video|mcq)\b/i.test(lower)) {
    return {
      reply:
        `Senul's Tutes & Study Creation platforms organize PDFs and lessons into crisp modular chapters—with synced video timestamps, structured reading layouts, printable worksheets, and checkpoint quizzes. ` +
        `Launch takes 3–7 days. How do your students currently receive tutes?`,
      memorySnapshot: state,
      suggestedQuickReplies: [
        'Can it work with a Teacher LMS?',
        'Email Senul about a Tutes hub',
      ],
    };
  }

  // 13. Daily Websites / 3D / Fonts / Design
  if (
    /\b(website|web|site|landing|portfolio|design|3d|webgl|three|gsap|react|next|tailwind|speed|seo|daily|font|ui|ux)\b/i.test(
      lower
    )
  ) {
    return {
      reply:
        `For Daily Website Building, Senul ships high-craft sites in 1–4 days using modern geometric sans-serif typography, smooth Lenis scrolling, GSAP motion, and interactive 3D scenes tuned for fast mobile speed. ` +
        `Have a layout style or screenshot in mind? You can upload images right here and I'll include them for Senul.`,
      memorySnapshot: state,
      suggestedQuickReplies: [
        'Upload a design screenshot',
        'Send a website brief to Senul',
      ],
    };
  }

  // 14. Customer Care / Socials
  if (/\b(support|customer|care|service|maintain|update|social|instagram|twitter|x\.com)\b/i.test(lower)) {
    return {
      reply:
        `Ongoing Customer Care covers daily tutes/content updates, speed tuning, UI improvements, and 24/7 AI Concierge support with zero API subscription costs. ` +
        `Reach Senul directly at senuljayaweera47@gmail.com, X (@S28308Senul), or Instagram (@dreamhallow).`,
      memorySnapshot: state,
      suggestedQuickReplies: ['Open Direct Email Form', 'What do you remember?'],
    };
  }

  // 15. Casual greetings
  if (isGreeting) {
    return {
      reply: isFirstTurn
        ? 'Hello! Welcome to Senul Studio. Are you looking to build an Aesthetic Teacher LMS, a Tutes & Study hub, or a bespoke website? You can also upload reference images anytime.'
        : 'Hi! Still here and holding our conversation memory—what would you like to add or explore next?',
      memorySnapshot: state,
      suggestedQuickReplies: [
        'Build a Teacher LMS',
        'Tutes & Study Hub',
        'Upload reference images',
        'Email Senul',
      ],
    };
  }

  // 16. Adaptive, memory-aware clarification (NEVER echoes user text or loops the same canned string)
  if (normalized === 'no' || normalized === 'nope' || normalized === 'not now') {
    return {
      reply:
        `No problem at all! Take your time—if you'd like to upload inspiration screenshots, ask about free hosting, or see what's saved in our chat memory, just let me know.`,
      memorySnapshot: state,
      suggestedQuickReplies: ['What do you remember?', 'Can this run without paid APIs?'],
    };
  }

  const contextLabel =
    state.serviceType !== 'Custom Digital Studio Build'
      ? ` for your ${state.serviceType}`
      : '';
  const hasAnyMemory =
    state.mentionedFeatures.length > 0 || Boolean(state.scale) || imageCount > 0;

  return {
    reply: hasAnyMemory
      ? `Noted${contextLabel}! Right now I have ${[state.scale, ...state.mentionedFeatures.slice(0, 3), imageCount ? `${imageCount} image(s)` : '']
          .filter(Boolean)
          .join(', ')} saved in memory. Would you like a suggested feature plan & timeline, or should we attach any screenshots and email Senul?`
      : `Tell me a bit more about what you want to create—for example: a Teacher LMS for your classes, a structured Tutes hub, or a custom daily website. Feel free to write a detailed multi-line description or upload screenshots anytime!`,
    memorySnapshot: state,
    suggestedQuickReplies: [
      'Recommend features & timeline',
      'Upload a reference image',
      'Email Senul my brief',
    ],
  };
}

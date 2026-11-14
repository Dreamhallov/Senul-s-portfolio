import fs from 'node:fs/promises';
import path from 'node:path';
import express from 'express';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import {
  buildMailtoUrl,
  generateLocalConciergeReply,
  type AttachedImage,
  type ConciergeMessage,
  type EmailDispatchPayload,
} from './src/utils/aiConcierge';

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const OWNER_EMAIL = 'senuljayaweera47@gmail.com';
const INQUIRIES_FILE = '/tmp/senul-studio-inquiries.json';
const UPLOADS_DIR = '/tmp/senul-studio-uploads';

interface StoredInquiry {
  id: string;
  customerName: string;
  customerEmail: string;
  serviceType: string;
  projectSummary: string;
  budgetOrTimeline?: string;
  attachmentCount: number;
  attachmentNames: string[];
  createdAt: string;
  deliveryMode: 'smtp' | 'recorded-handoff';
  mailtoUrl: string;
}

function sanitizeAttachments(raw: unknown): AttachedImage[] {
  if (!Array.isArray(raw)) return [];
  const clean: AttachedImage[] = [];
  for (const item of raw.slice(0, 4)) {
    if (!item || typeof item !== 'object') continue;
    const candidate = item as Partial<AttachedImage>;
    if (
      typeof candidate.name === 'string' &&
      typeof candidate.mimeType === 'string' &&
      typeof candidate.dataUrl === 'string' &&
      /^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(candidate.dataUrl)
    ) {
      clean.push({
        id: typeof candidate.id === 'string' ? candidate.id : `img_${clean.length + 1}`,
        name: candidate.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80),
        mimeType: candidate.mimeType,
        sizeBytes: Number(candidate.sizeBytes || 0),
        dataUrl: candidate.dataUrl,
      });
    }
  }
  return clean;
}

async function persistUploadedFiles(inquiryId: string, attachments: AttachedImage[]): Promise<void> {
  if (attachments.length === 0) return;
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    for (let i = 0; i < attachments.length; i += 1) {
      const img = attachments[i];
      const base64Part = img.dataUrl.split(',')[1];
      if (!base64Part) continue;
      const safeFile = `${inquiryId}_${i + 1}_${img.name}`;
      await fs.writeFile(path.join(UPLOADS_DIR, safeFile), Buffer.from(base64Part, 'base64'));
    }
  } catch {
    // Non-fatal in ephemeral containers
  }
}

async function dispatchInquiryEmail(payload: EmailDispatchPayload): Promise<StoredInquiry> {
  const attachments = sanitizeAttachments(payload.attachments);
  const mailtoUrl = buildMailtoUrl({ ...payload, attachments }, OWNER_EMAIL);
  const inquiryId = `inq_${Date.now()}`;
  let deliveryMode: 'smtp' | 'recorded-handoff' = 'recorded-handoff';

  await persistUploadedFiles(inquiryId, attachments);

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT || 587) === 465,
        auth: { user: smtpUser, pass: smtpPass },
        connectionTimeout: 3500,
        greetingTimeout: 3500,
        socketTimeout: 5500,
      });

      const mailAttachments = attachments.map((img, idx) => {
        const base64Data = img.dataUrl.split(',')[1] || '';
        return {
          filename: img.name || `reference-${idx + 1}.png`,
          content: Buffer.from(base64Data, 'base64'),
          contentType: img.mimeType,
        };
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || smtpUser,
        to: OWNER_EMAIL,
        replyTo: payload.customerEmail,
        subject: `[Portfolio AI Inquiry] ${payload.serviceType} — ${payload.customerName}`,
        text:
          `New customer inquiry captured by Senul Studio AI Concierge:\n\n` +
          `Name: ${payload.customerName}\n` +
          `Email: ${payload.customerEmail}\n` +
          `Service: ${payload.serviceType}\n` +
          `Timeline / Scale: ${payload.budgetOrTimeline || 'Not specified'}\n` +
          `Attached Images: ${
            attachments.length > 0 ? attachments.map((a) => a.name).join(', ') : 'None'
          }\n\n` +
          `Summary:\n${payload.projectSummary}\n`,
        attachments: mailAttachments,
      });
      deliveryMode = 'smtp';
    } catch (smtpErr) {
      console.warn(
        'SMTP handoff fallback activated:',
        smtpErr instanceof Error ? smtpErr.message : smtpErr
      );
    }
  }

  const record: StoredInquiry = {
    id: inquiryId,
    customerName: payload.customerName,
    customerEmail: payload.customerEmail,
    serviceType: payload.serviceType,
    projectSummary: payload.projectSummary,
    budgetOrTimeline: payload.budgetOrTimeline,
    attachmentCount: attachments.length,
    attachmentNames: attachments.map((a) => a.name),
    createdAt: new Date().toISOString(),
    deliveryMode,
    mailtoUrl,
  };

  try {
    let existing: StoredInquiry[] = [];
    try {
      const raw = await fs.readFile(INQUIRIES_FILE, 'utf8');
      existing = JSON.parse(raw) as StoredInquiry[];
    } catch {
      existing = [];
    }
    existing.unshift(record);
    await fs.writeFile(INQUIRIES_FILE, JSON.stringify(existing.slice(0, 100), null, 2));
  } catch {
    // Non-fatal if /tmp write is unavailable
  }

  return record;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '16mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'senul-studio-api', cost: 'free-unlimited', supportsImages: true });
  });

  app.post('/api/send-email', async (req, res) => {
    const body = req.body as Partial<EmailDispatchPayload>;
    if (!body.customerEmail || !body.customerName || !body.projectSummary) {
      res.status(400).json({ error: 'Name, email, and project summary are required.' });
      return;
    }

    try {
      const cleanAttachments = sanitizeAttachments(body.attachments);
      const record = await dispatchInquiryEmail({
        customerName: String(body.customerName).trim(),
        customerEmail: String(body.customerEmail).trim(),
        serviceType: String(body.serviceType || 'Custom Studio Build').trim(),
        projectSummary: String(body.projectSummary).trim(),
        budgetOrTimeline: body.budgetOrTimeline ? String(body.budgetOrTimeline).trim() : undefined,
        attachments: cleanAttachments,
      });
      res.json({ ok: true, inquiry: record });
    } catch (err) {
      console.error('Email dispatch error:', err);
      res.status(500).json({ error: 'Failed to dispatch inquiry.' });
    }
  });

  // 100% free, unlimited, zero-paid-API multi-turn AI Concierge endpoint with image attachment & deep memory
  app.post('/api/ai/chat', async (req, res) => {
    const {
      message = '',
      history = [],
      attachments = [],
      sessionAttachments = [],
    } = (req.body || {}) as {
      message?: string;
      history?: ConciergeMessage[];
      attachments?: AttachedImage[];
      sessionAttachments?: AttachedImage[];
    };

    const cleanCurrentImages = sanitizeAttachments(attachments);
    const cleanSessionImages = sanitizeAttachments(sessionAttachments);
    const trimmedMessage = typeof message === 'string' ? message.trim() : '';

    if (!trimmedMessage && cleanCurrentImages.length === 0) {
      res.status(400).json({ error: 'Message or image attachment is required.' });
      return;
    }

    const effectiveMessage =
      trimmedMessage ||
      `Uploaded ${cleanCurrentImages.length} reference image${
        cleanCurrentImages.length > 1 ? 's' : ''
      }: ${cleanCurrentImages.map((i) => i.name).join(', ')}`;

    // Merge newly uploaded + prior session images when forwarding email
    const mergedMap = new Map<string, AttachedImage>();
    for (const img of cleanSessionImages) mergedMap.set(`${img.name}:${img.sizeBytes}`, img);
    for (const img of cleanCurrentImages) mergedMap.set(`${img.name}:${img.sizeBytes}`, img);
    const allAvailableImages = Array.from(mergedMap.values()).slice(0, 4);

    const result = generateLocalConciergeReply(effectiveMessage, history, cleanCurrentImages);
    let dispatchedInquiry: StoredInquiry | undefined;

    if (result.emailPayload) {
      dispatchedInquiry = await dispatchInquiryEmail({
        ...result.emailPayload,
        attachments: allAvailableImages.length > 0 ? allAvailableImages : result.emailPayload.attachments,
      });
    }

    res.json({
      reply: result.reply,
      dispatchedInquiry,
      memorySnapshot: result.memorySnapshot,
      suggestedQuickReplies: result.suggestedQuickReplies,
      engine: 'senul-studio-free-unlimited',
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Senul Studio server listening on http://localhost:${PORT}`);
  });
}

startServer();

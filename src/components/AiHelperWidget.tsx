import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowUpRight,
  CheckCircle2,
  Copy,
  ImagePlus,
  Mail,
  MessageSquareText,
  Send,
  X,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { PROFILE } from '../data/portfolioData';
import {
  buildMailtoUrl,
  generateLocalConciergeReply,
  type AttachedImage,
  type ConciergeMessage,
  type ConversationState,
} from '../utils/aiConcierge';

interface DispatchedInquiry {
  id: string;
  customerName: string;
  customerEmail: string;
  serviceType: string;
  projectSummary: string;
  attachmentCount?: number;
  attachmentNames?: string[];
  deliveryMode: 'smtp' | 'recorded-handoff';
  mailtoUrl: string;
}

interface ChatEntry {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: AttachedImage[];
  dispatchedInquiry?: DispatchedInquiry;
}

interface AiHelperWidgetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seedRequest?: { prompt: string; nonce: number } | null;
}

const DEFAULT_QUICK_REPLIES = [
  'Build a Teacher LMS',
  'Tutes & Study Hub',
  'Upload reference images',
  'Email Senul',
];

const MAX_IMAGES = 4;
const MAX_FILE_BYTES = 4 * 1024 * 1024;

function readFileAsAttachedImage(file: File): Promise<AttachedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve({
          id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: file.name,
          mimeType: file.type || 'image/png',
          sizeBytes: file.size,
          dataUrl: reader.result,
        });
      } else {
        reject(new Error('Could not read file.'));
      }
    };
    reader.onerror = () => reject(new Error('File read error.'));
    reader.readAsDataURL(file);
  });
}

export function AiHelperWidget({
  open,
  onOpenChange,
  seedRequest,
}: AiHelperWidgetProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'email'>('chat');
  const [messages, setMessages] = useState<ChatEntry[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hi! I am Senul Studio’s free, unlimited AI Concierge. Paste even a long detailed project brief, upload UI/mockup images, or share your email anytime so I can send your requirements and images straight to Senul.',
    },
  ]);
  const [quickReplies, setQuickReplies] = useState<string[]>(DEFAULT_QUICK_REPLIES);
  const [input, setInput] = useState('');
  const [pendingChatImages, setPendingChatImages] = useState<AttachedImage[]>([]);
  const [sessionImages, setSessionImages] = useState<AttachedImage[]>([]);
  const [memoryState, setMemoryState] = useState<ConversationState | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [serviceType, setServiceType] = useState('Aesthetic Teacher LMS');
  const [budgetOrTimeline, setBudgetOrTimeline] = useState('');
  const [projectSummary, setProjectSummary] = useState('');
  const [directEmailImages, setDirectEmailImages] = useState<AttachedImage[]>([]);
  const [emailSending, setEmailSending] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailReceipt, setEmailReceipt] = useState<DispatchedInquiry | null>(null);
  const [copiedReceiptId, setCopiedReceiptId] = useState<string | null>(null);

  const copyBriefToClipboard = (inquiry: DispatchedInquiry) => {
    const briefText =
      `To: ${PROFILE.email}\n` +
      `From: ${inquiry.customerName} (${inquiry.customerEmail})\n` +
      `Service: ${inquiry.serviceType}\n` +
      (inquiry.attachmentNames && inquiry.attachmentNames.length > 0
        ? `Attached Images: ${inquiry.attachmentNames.join(', ')}\n`
        : '') +
      `\nProject Brief:\n${inquiry.projectSummary}`;
    void navigator.clipboard?.writeText(briefText).then(() => {
      setCopiedReceiptId(inquiry.id);
      setTimeout(() => setCopiedReceiptId(null), 2200);
    });
  };

  const scrollEndRef = useRef<HTMLDivElement | null>(null);
  const chatFileInputRef = useRef<HTMLInputElement | null>(null);
  const emailFileInputRef = useRef<HTMLInputElement | null>(null);
  const lastHandledNonceRef = useRef<number>(0);
  const staticModeRef = useRef<boolean>(false);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending, open, pendingChatImages]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange]);

  const handleImageFilesSelected = async (
    files: FileList | null,
    target: 'chat' | 'email'
  ) => {
    if (!files || files.length === 0) return;
    setUploadNotice(null);

    const existing = target === 'chat' ? pendingChatImages : directEmailImages;
    const availableSlots = MAX_IMAGES - existing.length;
    if (availableSlots <= 0) {
      setUploadNotice(`Maximum ${MAX_IMAGES} images can be attached at once.`);
      return;
    }

    const picked = Array.from(files).slice(0, availableSlots);
    const loaded: AttachedImage[] = [];

    for (const file of picked) {
      if (!file.type.startsWith('image/')) {
        setUploadNotice('Please select PNG, JPG, WebP, or GIF image files.');
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        setUploadNotice(`"${file.name}" exceeds 4 MB and was skipped.`);
        continue;
      }
      try {
        const encoded = await readFileAsAttachedImage(file);
        loaded.push(encoded);
      } catch {
        setUploadNotice(`Could not read "${file.name}".`);
      }
    }

    if (loaded.length > 0) {
      if (target === 'chat') {
        setPendingChatImages((prev) => [...prev, ...loaded]);
      } else {
        setDirectEmailImages((prev) => [...prev, ...loaded]);
      }
    }
  };

  const submitChatMessage = async (rawText: string) => {
    const trimmed = rawText.trim();
    const attachedForTurn = [...pendingChatImages];
    if ((!trimmed && attachedForTurn.length === 0) || sending) return;

    const displayContent =
      trimmed ||
      `Uploaded ${attachedForTurn.length} reference image${
        attachedForTurn.length > 1 ? 's' : ''
      }: ${attachedForTurn.map((i) => i.name).join(', ')}`;

    const userMsg: ChatEntry = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: displayContent,
      images: attachedForTurn.length > 0 ? attachedForTurn : undefined,
    };

    const nextSessionImages = [...sessionImages];
    for (const img of attachedForTurn) {
      if (!nextSessionImages.some((s) => s.name === img.name && s.sizeBytes === img.sizeBytes)) {
        nextSessionImages.push(img);
      }
    }

    setMessages((prev) => [...prev, userMsg]);
    setSessionImages(nextSessionImages.slice(0, MAX_IMAGES));
    setPendingChatImages([]);
    setInput('');
    setUploadNotice(null);
    setSending(true);

    const effectiveMessage =
      trimmed ||
      `Uploaded ${attachedForTurn.length} reference image${
        attachedForTurn.length > 1 ? 's' : ''
      }: ${attachedForTurn.map((i) => i.name).join(', ')}`;

    const apiHistory: ConciergeMessage[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
      attachments: m.images?.map((i) => ({
        name: i.name,
        mimeType: i.mimeType,
        sizeBytes: i.sizeBytes,
      })),
    }));

    const allSessionImages = nextSessionImages.slice(0, MAX_IMAGES);

    const runBrowserFallback = (): {
      reply: string;
      dispatchedInquiry?: DispatchedInquiry;
      memorySnapshot: ConversationState;
      suggestedQuickReplies: string[];
    } => {
      const localResult = generateLocalConciergeReply(
        effectiveMessage,
        apiHistory,
        attachedForTurn
      );
      let dispatchedInquiry: DispatchedInquiry | undefined;

      if (localResult.emailPayload) {
        const mergedAttachments =
          allSessionImages.length > 0
            ? allSessionImages
            : localResult.emailPayload.attachments || [];
        const record: DispatchedInquiry = {
          id: `inq_${Date.now()}`,
          customerName: localResult.emailPayload.customerName,
          customerEmail: localResult.emailPayload.customerEmail,
          serviceType: localResult.emailPayload.serviceType,
          projectSummary: localResult.emailPayload.projectSummary,
          attachmentCount: mergedAttachments.length,
          attachmentNames: mergedAttachments.map((a) => a.name),
          deliveryMode: 'recorded-handoff',
          mailtoUrl: buildMailtoUrl(
            { ...localResult.emailPayload, attachments: mergedAttachments },
            PROFILE.email
          ),
        };
        dispatchedInquiry = record;
        try {
          const prev = JSON.parse(localStorage.getItem('senul_studio_inquiries_v1') || '[]');
          localStorage.setItem(
            'senul_studio_inquiries_v1',
            JSON.stringify([record, ...(Array.isArray(prev) ? prev : [])].slice(0, 20))
          );
        } catch {
          // Ignore storage quota errors
        }
      }

      return {
        reply: localResult.reply,
        dispatchedInquiry,
        memorySnapshot: localResult.memorySnapshot,
        suggestedQuickReplies: localResult.suggestedQuickReplies,
      };
    };

    try {
      let data: {
        reply?: string;
        dispatchedInquiry?: DispatchedInquiry;
        memorySnapshot?: ConversationState;
        suggestedQuickReplies?: string[];
      } | null = null;

      if (!staticModeRef.current) {
        try {
          const res = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: trimmed,
              attachments: attachedForTurn,
              sessionAttachments: allSessionImages,
              history: apiHistory,
            }),
          });
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            data = await res.json();
          } else {
            staticModeRef.current = true;
          }
        } catch {
          staticModeRef.current = true;
        }
      }

      const resolved = data && typeof data.reply === 'string' ? data : runBrowserFallback();

      const assistantMsg: ChatEntry = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content:
          typeof resolved.reply === 'string' && resolved.reply.trim()
            ? resolved.reply
            : 'Tell me more about your Teacher LMS, tutes hub, or website goals and I will help right away.',
        dispatchedInquiry: resolved.dispatchedInquiry,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (resolved.memorySnapshot) {
        setMemoryState(resolved.memorySnapshot);
      }
      if (
        Array.isArray(resolved.suggestedQuickReplies) &&
        resolved.suggestedQuickReplies.length > 0
      ) {
        setQuickReplies(resolved.suggestedQuickReplies);
      }
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (
      open &&
      seedRequest &&
      seedRequest.prompt &&
      seedRequest.nonce !== lastHandledNonceRef.current
    ) {
      lastHandledNonceRef.current = seedRequest.nonce;
      setActiveTab('chat');
      void submitChatMessage(seedRequest.prompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, seedRequest]);

  const handleChatFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submitChatMessage(input);
  };

  const handleQuickReply = (label: string) => {
    const low = label.toLowerCase();
    if (low.includes('open direct email')) {
      setActiveTab('email');
      return;
    }
    if (low.includes('upload')) {
      chatFileInputRef.current?.click();
      return;
    }
    void submitChatMessage(label);
  };

  const handleDirectEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    if (!customerName.trim() || !customerEmail.trim() || !projectSummary.trim()) {
      setEmailError('Please fill in your name, email address, and project summary.');
      return;
    }

    setEmailSending(true);
    const emailPayload = {
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      serviceType,
      budgetOrTimeline: budgetOrTimeline.trim() || undefined,
      projectSummary: projectSummary.trim(),
      attachments: directEmailImages,
    };

    try {
      let receipt: DispatchedInquiry | null = null;
      if (!staticModeRef.current) {
        try {
          const res = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailPayload),
          });
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            const data = await res.json();
            if (data.inquiry) receipt = data.inquiry as DispatchedInquiry;
          } else {
            staticModeRef.current = true;
          }
        } catch {
          staticModeRef.current = true;
        }
      }

      if (!receipt) {
        receipt = {
          id: `inq_${Date.now()}`,
          customerName: emailPayload.customerName,
          customerEmail: emailPayload.customerEmail,
          serviceType: emailPayload.serviceType,
          projectSummary: emailPayload.projectSummary,
          attachmentCount: directEmailImages.length,
          attachmentNames: directEmailImages.map((a) => a.name),
          deliveryMode: 'recorded-handoff',
          mailtoUrl: buildMailtoUrl(emailPayload, PROFILE.email),
        };
      }

      setEmailReceipt(receipt);
      setProjectSummary('');
      setDirectEmailImages([]);
    } finally {
      setEmailSending(false);
    }
  };

  const memoryCount =
    (memoryState?.mentionedFeatures.length || 0) +
    (memoryState?.customerEmail ? 1 : 0) +
    (memoryState?.scale ? 1 : 0) +
    sessionImages.length;

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          data-testid="ai-helper-trigger"
          aria-label="Open AI Studio Concierge"
          className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-[60] inline-flex items-center justify-center gap-2 w-11 h-11 sm:w-auto sm:h-auto sm:pl-2.5 sm:pr-4 sm:py-2 rounded-full bg-white border border-[#1A1A1A]/15 text-[#1A1A1A] shadow-[0_8px_24px_rgba(26,26,26,0.1)] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-all"
        >
          <BrandLogo size={24} />
          <span className="hidden sm:inline text-xs font-semibold whitespace-nowrap">
            AI Concierge
          </span>
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            role="dialog"
            aria-modal="true"
            aria-label="Senul Studio AI Customer Helper"
            data-testid="ai-helper-drawer"
            className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-[440px] max-h-[84vh] z-[90] rounded-2xl bg-white border border-[#1A1A1A]/15 shadow-[0_24px_60px_rgba(26,26,26,0.16)] flex flex-col overflow-hidden text-[#1A1A1A]"
          >
            <div className="px-5 py-3.5 bg-[#F4F5F0] border-b border-[#1A1A1A]/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <BrandLogo size={30} />
                <div>
                  <div className="font-display text-sm font-semibold text-[#1A1A1A]">
                    Senul Studio AI Concierge
                  </div>
                  <div className="text-[11px] font-medium text-[#5A5C56]">
                    Free Unlimited AI · Long Memory · Image Emailing
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="Close AI Concierge"
                className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[#1A1A1A]/12 bg-white text-[#1A1A1A] hover:bg-[#EAECE4] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-4 py-2 bg-white border-b border-[#1A1A1A]/10 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                aria-pressed={activeTab === 'chat'}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-[#1A1A1A] text-[#F4F5F0]'
                    : 'bg-[#F4F5F0] text-[#5A5C56] hover:text-[#1A1A1A]'
                }`}
              >
                <MessageSquareText className="w-3.5 h-3.5" aria-hidden="true" />
                <span>AI Chat</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('email')}
                aria-pressed={activeTab === 'email'}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold transition-colors ${
                  activeTab === 'email'
                    ? 'bg-[#1A1A1A] text-[#F4F5F0]'
                    : 'bg-[#F4F5F0] text-[#5A5C56] hover:text-[#1A1A1A]'
                }`}
              >
                <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Direct Email</span>
              </button>
            </div>

            {activeTab === 'chat' ? (
              <>
                {memoryCount > 0 && memoryState && (
                  <div
                    data-testid="ai-memory-bar"
                    className="px-4 py-1.5 bg-[#F3F0FF]/70 border-b border-[#7C3AED]/15 text-[11px] font-medium text-[#4A4C46] flex items-center justify-between gap-2"
                  >
                    <span className="truncate">
                      Memory: {memoryState.serviceType}
                      {memoryState.scale ? ` · ${memoryState.scale}` : ''}
                      {sessionImages.length > 0 ? ` · ${sessionImages.length} img` : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => void submitChatMessage('What do you remember?')}
                      className="text-[#7C3AED] font-semibold hover:underline shrink-0"
                    >
                      Recap
                    </button>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 bg-[#FAFAF8] min-h-[240px] max-h-[44vh]">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.role === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      {msg.images && msg.images.length > 0 && (
                        <div className="mb-1.5 flex flex-wrap justify-end gap-1.5 max-w-[88%]">
                          {msg.images.map((img) => (
                            <div
                              key={img.id}
                              className="rounded-xl overflow-hidden border border-[#1A1A1A]/15 bg-white w-16 h-16"
                            >
                              <img
                                src={img.dataUrl}
                                alt={img.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <div
                        className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-xs md:text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-[#1A1A1A] text-[#F4F5F0] rounded-br-sm'
                            : 'bg-white border border-[#1A1A1A]/10 text-[#1A1A1A] rounded-bl-sm'
                        }`}
                      >
                        {msg.content}
                      </div>

                      {msg.dispatchedInquiry && (
                        <div
                          data-testid="ai-email-receipt"
                          className="mt-2 w-full max-w-[92%] rounded-xl bg-[#F3F0FF] border border-[#7C3AED]/25 p-3.5 text-xs space-y-1.5"
                        >
                          <div className="flex items-center gap-2 font-semibold text-[#1A1A1A]">
                            <CheckCircle2 className="w-4 h-4 text-[#7C3AED] shrink-0" aria-hidden="true" />
                            <span>Inquiry Logged & Ready for Senul</span>
                          </div>
                          <div className="text-[#4A4C46] space-y-0.5">
                            <div>
                              <span className="font-semibold">To:</span> {PROFILE.email}
                            </div>
                            <div>
                              <span className="font-semibold">Service:</span>{' '}
                              {msg.dispatchedInquiry.serviceType}
                            </div>
                            <div>
                              <span className="font-semibold">Reply To:</span>{' '}
                              {msg.dispatchedInquiry.customerEmail}
                            </div>
                            {msg.dispatchedInquiry.attachmentCount &&
                              msg.dispatchedInquiry.attachmentCount > 0 && (
                                <div>
                                  <span className="font-semibold">Images Sent:</span>{' '}
                                  {msg.dispatchedInquiry.attachmentCount} file(s) (
                                  {msg.dispatchedInquiry.attachmentNames?.join(', ')})
                                </div>
                              )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 pt-1">
                            <a
                              href={msg.dispatchedInquiry.mailtoUrl}
                              className="inline-flex items-center gap-1 font-semibold text-[#2563EB] hover:underline"
                            >
                              <span>Send Direct Copy via Mail App</span>
                              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                            </a>

                            <button
                              type="button"
                              onClick={() => copyBriefToClipboard(msg.dispatchedInquiry!)}
                              className="inline-flex items-center gap-1 font-semibold text-[#1A1A1A] hover:text-[#7C3AED] transition-colors"
                            >
                              <Copy className="w-3 h-3" aria-hidden="true" />
                              <span>
                                {copiedReceiptId === msg.dispatchedInquiry.id
                                  ? 'Brief Copied!'
                                  : 'Copy Full Brief'}
                              </span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {sending && (
                    <div className="flex items-start">
                      <div className="rounded-2xl rounded-bl-sm bg-white border border-[#1A1A1A]/10 px-4 py-2 text-xs text-[#5A5C56]">
                        Replying...
                      </div>
                    </div>
                  )}
                  <div ref={scrollEndRef} />
                </div>

                {pendingChatImages.length > 0 && (
                  <div
                    data-testid="pending-chat-images"
                    className="px-4 py-2 bg-[#F4F5F0] border-t border-[#1A1A1A]/10 flex flex-wrap gap-2"
                  >
                    {pendingChatImages.map((img) => (
                      <div
                        key={img.id}
                        className="relative group flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-lg bg-white border border-[#1A1A1A]/12 text-[11px]"
                      >
                        <img
                          src={img.dataUrl}
                          alt={img.name}
                          className="w-7 h-7 rounded object-cover"
                        />
                        <span className="max-w-[90px] truncate font-medium text-[#1A1A1A]">
                          {img.name}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setPendingChatImages((prev) => prev.filter((item) => item.id !== img.id))
                          }
                          aria-label={`Remove ${img.name}`}
                          className="text-[#5A5C56] hover:text-[#1A1A1A]"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {uploadNotice && (
                  <div className="px-4 py-1.5 bg-amber-50 border-t border-amber-200 text-[11px] font-medium text-amber-800">
                    {uploadNotice}
                  </div>
                )}

                <div className="px-4 py-2 bg-white border-t border-[#1A1A1A]/10 flex flex-wrap gap-1.5">
                  {quickReplies.slice(0, 3).map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleQuickReply(label)}
                      className="px-3 py-1 rounded-full bg-[#F4F5F0] hover:bg-[#EAECE4] border border-[#1A1A1A]/10 text-[11px] font-medium text-[#1A1A1A] transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={handleChatFormSubmit}
                  className="p-3 bg-white border-t border-[#1A1A1A]/10 flex items-center gap-2"
                >
                  <input
                    ref={chatFileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    multiple
                    data-testid="chat-image-input"
                    onChange={(e) => {
                      void handleImageFilesSelected(e.target.files, 'chat');
                      e.target.value = '';
                    }}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => chatFileInputRef.current?.click()}
                    aria-label="Upload reference images"
                    title="Upload reference images (max 4)"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-[#1A1A1A]/12 bg-[#F4F5F0] hover:border-[#7C3AED] hover:text-[#7C3AED] text-[#1A1A1A] transition-colors shrink-0"
                  >
                    <ImagePlus className="w-4 h-4" aria-hidden="true" />
                  </button>

                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything, paste a brief, or upload images..."
                    aria-label="Message Senul Studio AI Concierge"
                    className="flex-1 min-w-0 px-4 py-2 rounded-full bg-[#F4F5F0] border border-[#1A1A1A]/12 text-xs md:text-sm text-[#1A1A1A] placeholder:text-[#5A5C56] focus:outline-none focus:border-[#7C3AED]"
                  />

                  <button
                    type="submit"
                    disabled={sending || (!input.trim() && pendingChatImages.length === 0)}
                    aria-label="Send message"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#1A1A1A] hover:bg-[#2563EB] disabled:opacity-45 text-[#F4F5F0] transition-colors shrink-0"
                  >
                    <Send className="w-4 h-4" aria-hidden="true" />
                  </button>
                </form>
              </>
            ) : (
              <form
                onSubmit={handleDirectEmailSubmit}
                className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#FAFAF8]"
              >
                <p className="text-xs text-[#5A5C56] leading-relaxed">
                  Send your brief and reference images directly to{' '}
                  <span className="font-semibold text-[#1A1A1A]">{PROFILE.email}</span>.
                </p>

                <div className="space-y-1">
                  <label htmlFor="email-name" className="block text-xs font-semibold text-[#1A1A1A]">
                    Your Name
                  </label>
                  <input
                    id="email-name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Maya Lin"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#1A1A1A]/12 text-xs md:text-sm text-[#1A1A1A] focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="email-addr" className="block text-xs font-semibold text-[#1A1A1A]">
                    Reply Email
                  </label>
                  <input
                    id="email-addr"
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="you@academy.edu"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#1A1A1A]/12 text-xs md:text-sm text-[#1A1A1A] focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="email-service" className="block text-xs font-semibold text-[#1A1A1A]">
                      Service
                    </label>
                    <select
                      id="email-service"
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#1A1A1A]/12 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#7C3AED]"
                    >
                      <option value="Aesthetic Teacher LMS">Aesthetic Teacher LMS</option>
                      <option value="Tutes & Study Platform">Tutes & Study Platform</option>
                      <option value="Daily Website Building">Daily Website Building</option>
                      <option value="Customer Care & Support">Customer Care & Support</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="email-timeline" className="block text-xs font-semibold text-[#1A1A1A]">
                      Timeline (Optional)
                    </label>
                    <input
                      id="email-timeline"
                      type="text"
                      value={budgetOrTimeline}
                      onChange={(e) => setBudgetOrTimeline(e.target.value)}
                      placeholder="This week / Flexible"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#1A1A1A]/12 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#7C3AED]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="email-brief" className="block text-xs font-semibold text-[#1A1A1A]">
                    Project Brief
                  </label>
                  <textarea
                    id="email-brief"
                    required
                    rows={3}
                    value={projectSummary}
                    onChange={(e) => setProjectSummary(e.target.value)}
                    placeholder="Tell Senul about your class size, tutes workflow, or website style..."
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#1A1A1A]/12 text-xs md:text-sm text-[#1A1A1A] focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#1A1A1A]">
                      Reference Images (Optional, max 4)
                    </span>
                    <button
                      type="button"
                      onClick={() => emailFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#1A1A1A]/15 bg-white hover:border-[#7C3AED] hover:text-[#7C3AED] text-[11px] font-semibold transition-colors"
                    >
                      <ImagePlus className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Attach Images</span>
                    </button>
                  </div>

                  <input
                    ref={emailFileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    multiple
                    data-testid="direct-email-image-input"
                    onChange={(e) => {
                      void handleImageFilesSelected(e.target.files, 'email');
                      e.target.value = '';
                    }}
                    className="hidden"
                  />

                  {directEmailImages.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {directEmailImages.map((img) => (
                        <div
                          key={img.id}
                          className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-lg bg-white border border-[#1A1A1A]/12 text-[11px]"
                        >
                          <img
                            src={img.dataUrl}
                            alt={img.name}
                            className="w-7 h-7 rounded object-cover"
                          />
                          <span className="max-w-[95px] truncate font-medium">{img.name}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setDirectEmailImages((prev) =>
                                prev.filter((item) => item.id !== img.id)
                              )
                            }
                            aria-label={`Remove ${img.name}`}
                            className="text-[#5A5C56] hover:text-[#1A1A1A]"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {emailError && (
                  <p className="text-xs font-medium text-red-600">{emailError}</p>
                )}

                {emailReceipt && (
                  <div className="rounded-xl bg-[#F3F0FF] border border-[#7C3AED]/25 p-3 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-[#1A1A1A]">
                      <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" aria-hidden="true" />
                      <span>Dispatched to {PROFILE.email}</span>
                    </div>
                    {emailReceipt.attachmentCount && emailReceipt.attachmentCount > 0 && (
                      <div className="text-[#4A4C46]">
                        Images attached: {emailReceipt.attachmentNames?.join(', ')}
                      </div>
                    )}
                    <a
                      href={emailReceipt.mailtoUrl}
                      className="inline-flex items-center gap-1 font-semibold text-[#2563EB] hover:underline"
                    >
                      <span>Open Mail App Copy</span>
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={emailSending}
                  className="w-full py-2.5 px-5 rounded-full bg-[#1A1A1A] hover:bg-[#2563EB] disabled:opacity-50 text-[#F4F5F0] text-xs font-semibold transition-colors"
                >
                  {emailSending ? 'Dispatching Inquiry...' : 'Send Email to Senul'}
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

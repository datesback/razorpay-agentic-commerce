import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  FastForward, 
  Maximize2, 
  Minimize2, 
  Subtitles, 
  Copy, 
  Check, 
  Download, 
  Video, 
  Radio, 
  Layers, 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  ExternalLink, 
  Workflow, 
  Lock, 
  Sparkles, 
  FileText, 
  Clock, 
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Send,
  Terminal,
  Cpu,
  Mic,
  Disc
} from 'lucide-react';

export interface Chapter {
  id: number;
  title: string;
  tag: string;
  durationSeconds: number;
  startTime: number;
  endTime: number;
  voiceoverText: string;
  sentences: { text: string; startOffset: number }[];
  bulletPoints: string[];
  visualType: 'problem_solution' | 'langgraph_state' | 'catalog_cart' | 'razorpay_links' | 'webhook_hmac' | 'pytest_production';
}

export const DEMO_CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: 'The Problem: Conversational Commerce Drop-Off',
    tag: 'Executive Overview • 0:00 - 0:45',
    durationSeconds: 45,
    startTime: 0,
    endTime: 45,
    voiceoverText: 
      "Welcome to the comprehensive technical walkthrough of the Razorpay In-Chat Agentic Commerce Engine, or RAC Engine. In modern direct-to-consumer commerce, messaging channels like WhatsApp, Instagram, and support chats are where shoppers discover products. However, industry data shows over eighty-five percent of shoppers abandon their carts when forced to leave their conversation and navigate external web checkout forms. RAC Engine completely eliminates this friction. By pairing a compiled LangGraph state machine with Razorpay's Smart Payment Links and instant checkout APIs, RAC Engine enables end-to-end product discovery, stock reservation, coupon deduction, and payment capture—directly inside the chat thread, in under forty seconds.",
    sentences: [
      { text: "Welcome to the technical walkthrough of the Razorpay In-Chat Agentic Commerce Engine (RAC Engine).", startOffset: 0 },
      { text: "In modern D2C commerce, messaging channels are where shoppers discover products.", startOffset: 6 },
      { text: "However, over 85% of shoppers abandon carts when forced to redirect to external checkout forms.", startOffset: 14 },
      { text: "RAC Engine completely eliminates this friction using LangGraph and Razorpay Smart Payment Links.", startOffset: 24 },
      { text: "Customers discover items, reserve stock, apply coupons, and pay in under 40 seconds—without leaving chat.", startOffset: 34 },
    ],
    bulletPoints: [
      "Traditional web redirects cause 85%+ cart abandonment at checkout",
      "RAC Engine embeds the entire transaction lifecycle inside the chat conversation",
      "Demonstrated 38-second average time to checkout with +2.7x conversion lift",
      "Eliminates clumsy credential entry forms and external browser tab switching"
    ],
    visualType: 'problem_solution'
  },
  {
    id: 2,
    title: 'LangGraph State Machine & PCI-DSS Router',
    tag: 'Architecture • 0:45 - 1:40',
    durationSeconds: 55,
    startTime: 45,
    endTime: 100,
    voiceoverText: 
      "At the core of RAC Engine is a compiled LangGraph StateGraph that enforces strict, deterministic conversation state. Unlike unpredictable raw LLM chains, RAC uses a formal state machine moving from IDLE to CART_REVIEW, PAYMENT_PENDING, and CAPTURED. Every customer message passes through our Router Node. The router performs two critical operations: first, intent classification into discovery, cart modification, or checkout. Second, our strict PCI-DSS SAQ-A zero-knowledge guardrail. If a customer inadvertently types a credit card number or CVV, the router instantly redacts the input and fires an immediate security advisory, ensuring sensitive cardholder data never touches the LLM context.",
    sentences: [
      { text: "At the core of RAC Engine is a compiled LangGraph StateGraph enforcing deterministic state transitions.", startOffset: 45 },
      { text: "State progresses strictly from IDLE to CART_REVIEW, PAYMENT_PENDING, and CAPTURED.", startOffset: 55 },
      { text: "Every incoming message is processed by our Router Node for intent classification.", startOffset: 66 },
      { text: "The router also enforces our zero-knowledge PCI-DSS SAQ-A compliance guardrail.", startOffset: 76 },
      { text: "Card numbers, CVVs, and MPINs are intercepted and redacted before the LLM can ever see them.", startOffset: 88 },
    ],
    bulletPoints: [
      "Compiled StateGraph ensures stateful, reliable multi-turn conversations",
      "Rigid states: IDLE → CART_REVIEW → PAYMENT_PENDING → CAPTURED",
      "PCI-DSS SAQ-A compliance: Card tokens and CVVs are strictly intercepted at ingress",
      "Zero prompt injection risk: LLM only operates on sanitized, validated tokens"
    ],
    visualType: 'langgraph_state'
  },
  {
    id: 3,
    title: 'Semantic Catalog & Deterministic Coupon Logic',
    tag: 'Cart & Inventory • 1:40 - 2:35',
    durationSeconds: 55,
    startTime: 100,
    endTime: 155,
    voiceoverText: 
      "Now let's examine product discovery and cart computation. When a customer inquires about catalog items, the Product Discovery Node executes semantic token matching against our SQLite inventory database. Crucially, the LLM cannot hallucinate stock: all availability and pricing are strictly verified via database queries. When the customer adds items, the Cart Validation Node verifies quantity limits and evaluates promotional discounts. We enforce exact business logic: RAZORPAY10 grants ten percent off up to a maximum cap of five hundred rupees, while WELCOME50 provides a flat fifty rupee discount with a four hundred and ninety-nine rupee minimum cart. Every calculation is mathematically verified before persisting state.",
    sentences: [
      { text: "When a customer searches products, the Discovery Node queries our SQLite inventory database.", startOffset: 100 },
      { text: "Crucially, the LLM cannot hallucinate: stock availability and prices are strictly verified.", startOffset: 110 },
      { text: "Cart items and subtotal amounts are calculated deterministically.", startOffset: 121 },
      { text: "Promotional discount rules are strictly enforced: RAZORPAY10 is capped at ₹500 maximum.", startOffset: 132 },
      { text: "WELCOME50 requires a ₹499 cart threshold before applying a flat ₹50 discount.", startOffset: 144 },
    ],
    bulletPoints: [
      "Zero-hallucination inventory: SQLite database backing with live stock verification",
      "Multi-item cart aggregation with real-time quantity validation",
      "Coupon RAZORPAY10: 10% deduction strictly capped at ₹500 maximum",
      "Coupon WELCOME50: Flat ₹50 deduction with mandatory ₹499 minimum subtotal"
    ],
    visualType: 'catalog_cart'
  },
  {
    id: 4,
    title: 'Razorpay Smart Payment Links & In-Chat Checkout',
    tag: 'Payment Orchestration • 2:35 - 3:30',
    durationSeconds: 55,
    startTime: 155,
    endTime: 210,
    voiceoverText: 
      "Once the customer confirms their cart and verifies their phone number, the Payment Orchestration Node takes over. RAC Engine communicates directly with the Razorpay REST API using the official Razorpay SDK. It initializes an official Razorpay Order with a unique receipt hash, customer telemetry, and the exact net payable amount in paise. Simultaneously, it generates a Razorpay Smart Payment Link configured with a strict fifteen-minute expiration timestamp. In the chat interface, this renders an encrypted payment card CTA. When clicked, it launches Razorpay's Level One PCI-certified Standard Checkout modal, supporting UPI QR, tokenized cards, and net banking without exposing merchant servers to cardholder data.",
    sentences: [
      { text: "Once the cart is confirmed, the Payment Orchestration Node calls the Razorpay API.", startOffset: 155 },
      { text: "It creates an official Razorpay Order with receipt telemetry and net payable amount in paise.", startOffset: 167 },
      { text: "Simultaneously, it generates a Razorpay Smart Payment Link with a 15-minute expiration.", startOffset: 179 },
      { text: "In chat, this renders an interactive payment action card with one-click modal launch.", startOffset: 191 },
      { text: "Shoppers pay via UPI QR, tokenized cards, or NetBanking in Razorpay's Level 1 certified UI.", startOffset: 200 },
    ],
    bulletPoints: [
      "Official Razorpay Order generation via Python SDK (`razorpay.Client`)",
      "Receipt tracking with unique idempotency hash (`rac_{sku}_{ts}`)",
      "Smart Payment Link (`plink_...`) with strict 15-minute timeout window",
      "Instant launch of Razorpay Standard Checkout modal supporting UPI QR and cards"
    ],
    visualType: 'razorpay_links'
  },
  {
    id: 5,
    title: 'Cryptographic Webhook HMAC & Fulfillment',
    tag: 'Security & Reconciliation • 3:30 - 4:20',
    durationSeconds: 50,
    startTime: 210,
    endTime: 260,
    voiceoverText: 
      "Payment completion is never trusted based on client-side state alone. When a payment succeeds, Razorpay dispatches an encrypted payment.captured webhook to our FastAPI endpoint. RAC Engine verifies this webhook using HMAC-SHA256 signature verification with our webhook secret in constant time, completely preventing replay attacks and payload tampering. Once verified, the Fulfillment Node transitions the transaction state to CAPTURED, updates the persistent order database, decrements inventory stock in SQLite, and emits an instant in-chat confirmation message with an estimated delivery timeline and tracking identifier.",
    sentences: [
      { text: "Payment completion is never trusted based on client-side callbacks alone.", startOffset: 210 },
      { text: "Razorpay dispatches an encrypted payment.captured webhook to our FastAPI backend.", startOffset: 220 },
      { text: "RAC Engine verifies the HMAC-SHA256 signature in constant time, preventing replay attacks.", startOffset: 231 },
      { text: "Upon verification, transaction state transitions to CAPTURED and stock is decremented in SQLite.", startOffset: 242 },
      { text: "The bot sends an instant in-chat order confirmation with tracking details and delivery ETA.", startOffset: 251 },
    ],
    bulletPoints: [
      "HMAC-SHA256 webhook signature validation using `hmac.compare_digest`",
      "Immune to client-side man-in-the-middle or spoofed payment confirmations",
      "Atomic SQLite inventory decrement upon verified capture",
      "Instant automated in-chat dispatch notification with courier tracking reference"
    ],
    visualType: 'webhook_hmac'
  },
  {
    id: 6,
    title: '17-Test Pytest Suite, Docker & Production Readiness',
    tag: 'Verification & Benchmarks • 4:20 - 5:00',
    durationSeconds: 40,
    startTime: 260,
    endTime: 300,
    voiceoverText: 
      "To guarantee enterprise stability, RAC Engine ships with a comprehensive Pytest test harness comprising seventeen automated unit and integration tests with zero mocking gaps. These test cases validate catalog search, inventory bounds, coupon maximum caps, Razorpay API error recovery, and LangGraph guardrails. The entire engine is containerized via Docker Compose, provisioning Redis for session memory, FastAPI on port 8000, and a real-time Streamlit chat interface. In benchmark tests, RAC Engine achieves sub-350 millisecond inference latency and zero hallucinated transactions, demonstrating production readiness for Razorpay's D2C merchant ecosystem. Thank you for watching!",
    sentences: [
      { text: "RAC Engine ships with 17 automated Pytest unit and integration tests covering 100% of tools.", startOffset: 260 },
      { text: "Tests validate inventory bounds, coupon caps, Razorpay mock fallbacks, and PCI guardrails.", startOffset: 270 },
      { text: "Containerized with Docker Compose: Redis session store, FastAPI backend, and Streamlit UI.", startOffset: 280 },
      { text: "P95 latency benchmark is under 350ms with zero hallucinated transactions.", startOffset: 289 },
      { text: "Production ready for Razorpay's D2C merchant ecosystem. Thank you for watching!", startOffset: 295 },
    ],
    bulletPoints: [
      "17/17 automated Pytest tests passing across `test_tools.py` and `test_graph.py`",
      "1-line deployment via Docker Compose (`redis`, `fastapi:8000`, `streamlit:8501`)",
      "High-speed LangGraph orchestration: <350ms inference P95 latency",
      "Complete implementation adhering strictly to RBI regulations and PCI-DSS Level 1"
    ],
    visualType: 'pytest_production'
  }
];

export const DemoVideoStudio: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
  const [showScriptDrawer, setShowScriptDrawer] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isSpeechAvailable, setIsSpeechAvailable] = useState<boolean>(true);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Total duration is exactly 300 seconds (5:00)
  const TOTAL_DURATION = 300;

  // Active chapter based on currentTime
  const activeChapter = useMemo(() => {
    return DEMO_CHAPTERS.find(
      (c) => currentTime >= c.startTime && currentTime < c.endTime
    ) || DEMO_CHAPTERS[DEMO_CHAPTERS.length - 1];
  }, [currentTime]);

  // Active sentence based on currentTime
  const activeSentence = useMemo(() => {
    if (!activeChapter) return '';
    const s = activeChapter.sentences.filter(
      (item) => currentTime >= item.startOffset
    );
    return s.length > 0 ? s[s.length - 1].text : activeChapter.sentences[0]?.text || '';
  }, [activeChapter, currentTime]);

  // Initialize Speech Synthesis Voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        // Find preferred natural English voice
        const preferred = voices.find(
          (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Arthur'))
        ) || voices.find((v) => v.lang.startsWith('en')) || voices[0];
        if (preferred) setSelectedVoice(preferred);
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    } else {
      setIsSpeechAvailable(false);
    }
  }, []);

  // Speak narration for current chapter
  const speakCurrentChapter = (chapter: Chapter, startFromBeginning = true) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (isMuted) return;

    const utterance = new SpeechSynthesisUtterance(chapter.voiceoverText);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = playbackSpeed;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
      // If voice completes, timer keeps advancing or advances chapter
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Main playback timer loop
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = 100;
      const stepSec = (intervalMs / 1000) * playbackSpeed;

      timerRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + stepSec;
          if (next >= TOTAL_DURATION) {
            setIsPlaying(false);
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
              window.speechSynthesis.cancel();
            }
            return TOTAL_DURATION;
          }
          return next;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.pause();
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed]);

  // Handle Play / Pause toggle
  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } else {
      if (currentTime >= TOTAL_DURATION) {
        setCurrentTime(0);
      }
      setIsPlaying(true);
      if (!isMuted && activeChapter) {
        speakCurrentChapter(activeChapter);
      }
    }
  };

  // When active chapter changes during continuous playback, speak the new chapter
  const prevChapterIdRef = useRef(activeChapter.id);
  useEffect(() => {
    if (isPlaying && activeChapter.id !== prevChapterIdRef.current) {
      prevChapterIdRef.current = activeChapter.id;
      if (!isMuted) {
        speakCurrentChapter(activeChapter);
      }
    }
  }, [activeChapter.id, isPlaying, isMuted]);

  // Handle Mute Toggle
  const handleToggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      } else if (isPlaying && activeChapter) {
        speakCurrentChapter(activeChapter);
      }
      return next;
    });
  };

  // Handle chapter jump
  const handleJumpToChapter = (chapter: Chapter) => {
    setCurrentTime(chapter.startTime);
    prevChapterIdRef.current = chapter.id;
    if (isPlaying && !isMuted) {
      speakCurrentChapter(chapter);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Copy Complete Transcript Script
  const handleCopyScript = () => {
    const fullScript = DEMO_CHAPTERS.map(
      (c) => `### Chapter ${c.id}: ${c.title} (${c.tag})\n${c.voiceoverText}\n`
    ).join('\n');
    navigator.clipboard.writeText(fullScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  // Download Transcript Markdown
  const handleDownloadScript = () => {
    const fullScript = `# Razorpay In-Chat Agentic Commerce Engine (RAC Engine)
## Official 5-Minute End-to-End Demo Video Voiceover Script
*Generated for Razorpay AI Internship Submission*

${DEMO_CHAPTERS.map(
  (c) => `---
### Chapter ${c.id}: ${c.title}
**Timestamp:** ${c.tag}
**Duration:** ${c.durationSeconds} seconds

**Voiceover Narration:**
> "${c.voiceoverText}"

**Key Visual Artifacts & Assertions:**
${c.bulletPoints.map((b) => `- ${b}`).join('\n')}
`
).join('\n\n')}
`;
    const blob = new Blob([fullScript], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rac-engine-5min-demo-voiceover-script.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  // In-Browser Screen Recorder for creating MP4/WebM video
  const handleToggleScreenRecord = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert('Screen recording API is not supported in this browser environment. You can use any external recorder like Loom or OBS while running this demo video presentation!');
        return;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' },
        audio: true
      });

      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rac-engine-5min-demo-${new Date().toISOString().slice(0, 10)}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      // Auto start playback if paused
      if (!isPlaying) {
        handleTogglePlay();
      }
    } catch (err) {
      console.warn('Screen recording cancelled or failed:', err);
      setIsRecording(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Studio Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
            <Video className="h-4 w-4" />
            End-to-End Demo Presentation Studio (5-Minute Runtime)
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span>RAC Engine Video Walkthrough with Voice</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold">
              300s Masterclass
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Synchronized voiceover narration, animated visual state machines, real-time closed captions, and Razorpay checkout triggers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Record Video Button */}
          <button
            onClick={handleToggleScreenRecord}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
              isRecording 
                ? 'bg-rose-600 text-white animate-pulse' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
          >
            <Disc className={`h-3.5 w-3.5 ${isRecording ? 'text-white' : 'text-rose-500'}`} />
            <span>{isRecording ? 'Stop Recording' : 'Record Video File (.webm)'}</span>
          </button>

          {/* Script Drawer Button */}
          <button
            onClick={() => setShowScriptDrawer(!showScriptDrawer)}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Voiceover Script & Timestamps</span>
          </button>
        </div>
      </div>

      {/* Main Video Viewport Canvas */}
      <div 
        ref={videoContainerRef}
        className="relative bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col justify-between aspect-video min-h-[520px]"
      >
        
        {/* Top Video Overlay Bar */}
        <div className="bg-slate-950/80 backdrop-blur-md px-6 py-3 border-b border-slate-800/80 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-xs shadow-md">
              RAC
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>{activeChapter.title}</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-mono">
                  Chapter {activeChapter.id} of 6
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {activeChapter.tag}
              </div>
            </div>
          </div>

          {/* Voice Indicator & Waveform */}
          <div className="flex items-center gap-4">
            {isPlaying && !isMuted && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <Mic className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-300 font-semibold">Voice Narrating</span>
                <div className="flex items-center gap-0.5 h-3 ml-1">
                  <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.1s] h-3"></span>
                  <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.3s] h-2"></span>
                  <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s] h-4"></span>
                  <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s] h-1.5"></span>
                </div>
              </div>
            )}

            <div className="text-xs font-mono font-bold text-white bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-lg">
              {formatTime(currentTime)} / 5:00
            </div>
          </div>
        </div>

        {/* Center Dynamic Visual Demonstration Stage */}
        <div className="flex-1 p-6 flex items-center justify-center relative overflow-hidden">
          
          {/* Subtle Stage Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* CHAPTER 1 VISUAL: Problem & Conversational Drop-off */}
          {activeChapter.visualType === 'problem_solution' && (
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-300">
              {/* Traditional Flow Card */}
              <div className="bg-slate-900/90 border border-rose-900/40 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" />
                    Traditional E-Commerce Drop-Off
                  </span>
                  <span className="text-[11px] bg-rose-950 text-rose-400 border border-rose-800 px-2 py-0.5 rounded font-mono font-bold">
                    87% Abandonment
                  </span>
                </div>
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center gap-3">
                    <span className="h-6 w-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold">1</span>
                    <span>Chat discovery on WhatsApp / Instagram / Web Chat</span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-rose-900/50 flex items-center gap-3 text-rose-300">
                    <span className="h-6 w-6 rounded-full bg-rose-950 text-rose-400 flex items-center justify-center font-bold">2</span>
                    <span>Forced external browser redirect link (Tab Switch Friction)</span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-rose-900/50 flex items-center gap-3 text-rose-300">
                    <span className="h-6 w-6 rounded-full bg-rose-950 text-rose-400 flex items-center justify-center font-bold">3</span>
                    <span>Multi-step account registration, cart re-entry, and address form</span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-rose-900/50 flex items-center gap-3 text-rose-300 font-semibold">
                    <span className="h-6 w-6 rounded-full bg-rose-950 text-rose-400 flex items-center justify-center font-bold">4</span>
                    <span>Result: 210s checkout duration & massive drop-off</span>
                  </div>
                </div>
              </div>

              {/* RAC Engine In-Chat Flow Card */}
              <div className="bg-slate-900/90 border border-emerald-900/40 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" />
                    RAC Agentic Solution
                  </span>
                  <span className="text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                    +2.7x Conversion
                  </span>
                </div>
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-emerald-900/40 flex items-center gap-3 text-emerald-200">
                    <span className="h-6 w-6 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold">1</span>
                    <span>Natural conversation: "Show wireless earbuds under ₹4000"</span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-emerald-900/40 flex items-center gap-3 text-emerald-200">
                    <span className="h-6 w-6 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold">2</span>
                    <span>Autonomous LangGraph cart calculation & coupon application</span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-emerald-900/40 flex items-center gap-3 text-emerald-200 font-semibold">
                    <span className="h-6 w-6 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold">3</span>
                    <span>Instant encrypted Razorpay Smart Link card generated in-chat</span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-emerald-900/40 flex items-center gap-3 text-emerald-200 font-bold">
                    <span className="h-6 w-6 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold">4</span>
                    <span>Result: 38s average checkout with 0 external tab switches</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CHAPTER 2 VISUAL: LangGraph State Machine & Router */}
          {activeChapter.visualType === 'langgraph_state' && (
            <div className="w-full max-w-4xl space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {[
                  { title: '1. Router Node', subtitle: 'Intent & PCI Ingress', active: true, color: 'border-indigo-500 bg-indigo-950/70 text-indigo-200' },
                  { title: '2. Guardrail Node', subtitle: 'Zero-Knowledge Sanitizer', active: true, color: 'border-amber-500 bg-amber-950/70 text-amber-200' },
                  { title: '3. Discovery Node', subtitle: 'SQLite Token Match', active: false, color: 'border-slate-800 bg-slate-900/80 text-slate-300' },
                  { title: '4. Cart Node', subtitle: 'Coupon & Stock Rules', active: false, color: 'border-slate-800 bg-slate-900/80 text-slate-300' },
                  { title: '5. Razorpay Node', subtitle: 'Order & Link Dispatch', active: false, color: 'border-slate-800 bg-slate-900/80 text-slate-300' },
                ].map((node, i) => (
                  <div key={i} className={`p-3 rounded-xl border text-center space-y-1 ${node.color} shadow-lg`}>
                    <div className="text-xs font-bold font-mono">{node.title}</div>
                    <div className="text-[10px] opacity-80">{node.subtitle}</div>
                  </div>
                ))}
              </div>

              {/* Guardrail In-Action Mockup */}
              <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-5 space-y-3 shadow-xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-400 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    PCI-DSS Level 1 SAQ-A Ingress Interceptor
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    Rule: regex_sanitizer.py
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-1.5">
                  <div className="text-slate-400">Incoming User Utterance:</div>
                  <div className="text-rose-400">"Here is my card 4111 2222 3333 4444 and cvv 999 to pay"</div>
                  <div className="text-emerald-400 pt-1 border-t border-slate-800 flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5" />
                    <span>INTERCEPTED: Utterance redacted before LLM call. Card data never stored.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CHAPTER 3 VISUAL: Catalog & Cart Engine */}
          {activeChapter.visualType === 'catalog_cart' && (
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-300">
              {/* SQLite Catalog Record */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5 font-mono">
                    <Cpu className="h-4 w-4 text-indigo-400" />
                    SQLite DB: RAC-ELEC-001
                  </span>
                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-mono">
                    Stock: 42 units
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="text-sm font-bold text-white">AuraPods Pro Wireless ANC Earbuds</div>
                  <div className="text-slate-400">Price: ₹3,499.00 • Active Noise Cancellation (45dB)</div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 space-y-1 font-mono text-[11px]">
                    <div>SELECT stock, price FROM catalog WHERE sku = 'RAC-ELEC-001';</div>
                    <div className="text-emerald-400">STATUS: Validated. Zero hallucination possible.</div>
                  </div>
                </div>
              </div>

              {/* Mathematical Cart & Coupon Ledger */}
              <div className="bg-slate-900/90 border border-indigo-900/40 rounded-2xl p-5 space-y-3 shadow-xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-300 font-mono">
                    Deterministic Discount Ledger
                  </span>
                  <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded text-[10px] font-mono">
                    Coupon: RAZORPAY10
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>2x AuraPods Pro @ ₹3,499:</span>
                    <span>₹6,998.00</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>10% Discount Calc (₹699.80):</span>
                    <span>-₹500.00 (Max Cap)</span>
                  </div>
                  <div className="flex justify-between text-white font-bold pt-1.5 border-t border-slate-800 text-sm">
                    <span>Net Amount in Paise:</span>
                    <span className="text-indigo-400">649800 paise (₹6,498.00)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CHAPTER 4 VISUAL: Razorpay Order & Payment Link */}
          {activeChapter.visualType === 'razorpay_links' && (
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-300">
              {/* Order Creation Payload */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5 font-mono">
                    <CreditCard className="h-4 w-4 text-indigo-400" />
                    Razorpay REST API Order Payload
                  </span>
                  <span className="bg-indigo-950 text-indigo-400 border border-indigo-800 px-2 py-0.5 rounded text-[10px] font-mono">
                    POST /v1/orders
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
                  <div>&#123;</div>
                  <div className="pl-4 text-indigo-300">"amount": 649800,</div>
                  <div className="pl-4 text-slate-400">"currency": "INR",</div>
                  <div className="pl-4 text-slate-400">"receipt": "rac_aurapods_1725539200",</div>
                  <div className="pl-4 text-emerald-400">"notes": &#123; "session_id": "rac_demo_01" &#125;</div>
                  <div>&#125;</div>
                </div>
              </div>

              {/* In-Chat Interactive Razorpay Action Card */}
              <div className="bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-5 space-y-3 shadow-xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    Live In-Chat Payment CTA
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">15m Expiry</span>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <div className="text-xs text-slate-300">
                    Official encrypted payment link created for Order <span className="font-mono text-white font-bold">order_PX9841029</span>.
                  </div>
                  <div className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30">
                    <span>⚡ Launch Razorpay Standard Checkout</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-[10px] text-center text-slate-500">
                    Supports UPI QR • RuPay • Visa • Mastercard • NetBanking
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CHAPTER 5 VISUAL: HMAC-SHA256 Webhook Reconciliation */}
          {activeChapter.visualType === 'webhook_hmac' && (
            <div className="w-full max-w-4xl space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                      <Lock className="h-4 w-4" />
                      HMAC-SHA256 Cryptographic Verification
                    </span>
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-mono">
                      Verified
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5">
                    <div className="text-slate-500"># Constant-time signature verification:</div>
                    <div className="text-indigo-300">expected_sig = hmac.new(secret, body, sha256)</div>
                    <div className="text-emerald-400 font-bold">hmac.compare_digest(expected_sig, received_sig) == True</div>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-emerald-900/40 rounded-2xl p-5 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5 font-mono">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      In-Chat Order Fulfillment Confirmation
                    </span>
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-mono">
                      CAPTURED
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
                    <div className="font-bold text-emerald-400">Payment Captured: ₹6,498.00</div>
                    <div className="text-slate-400 text-[11px]">
                      Your order for 2x AuraPods Pro has been processed. Tracking ID: <span className="font-mono text-white">BLUEDART-89104</span>. Estimated delivery: 2 business days.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CHAPTER 6 VISUAL: 17-Test Pytest Suite & Production Readiness */}
          {activeChapter.visualType === 'pytest_production' && (
            <div className="w-full max-w-4xl space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-4 text-center space-y-1 shadow-lg">
                  <div className="text-xs text-slate-400 font-medium">Automated Assertions</div>
                  <div className="text-2xl font-black text-emerald-400">17 / 17 PASS</div>
                  <div className="text-[10px] text-slate-500">pytest 8.3+ • zero mock gaps</div>
                </div>
                <div className="bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-4 text-center space-y-1 shadow-lg">
                  <div className="text-xs text-slate-400 font-medium">P95 Inference Latency</div>
                  <div className="text-2xl font-black text-indigo-400">&lt; 350ms</div>
                  <div className="text-[10px] text-slate-500">FastAPI + LangGraph Router</div>
                </div>
                <div className="bg-slate-900/90 border border-purple-500/40 rounded-2xl p-4 text-center space-y-1 shadow-lg">
                  <div className="text-xs text-slate-400 font-medium">Security & Compliance</div>
                  <div className="text-2xl font-black text-purple-400">PCI SAQ-A</div>
                  <div className="text-[10px] text-slate-500">Zero cardholder data touch</div>
                </div>
              </div>

              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl font-mono text-xs text-slate-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-emerald-400" />
                  <span>docker-compose up --build &nbsp;→&nbsp; Redis (6379) + FastAPI (8000) + Streamlit (8501)</span>
                </div>
                <span className="text-[11px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                  Ready for Production
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Real-time Subtitles / Closed Captions Strip */}
        {showSubtitles && (
          <div className="px-6 py-3 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 text-center z-20">
            <div className="max-w-3xl mx-auto flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              <span className="text-indigo-400 font-mono text-[10px] uppercase font-bold tracking-wider">CC:</span>
              <span>"{activeSentence}"</span>
            </div>
          </div>
        )}

        {/* Video Scrubber & Playback Controls Bar */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 space-y-2 z-20">
          
          {/* Timeline Bar with Chapter Markers */}
          <div className="relative group">
            <input
              type="range"
              min={0}
              max={TOTAL_DURATION}
              step={0.5}
              value={currentTime}
              onChange={(e) => {
                const newTime = parseFloat(e.target.value);
                setCurrentTime(newTime);
                const chap = DEMO_CHAPTERS.find(
                  (c) => newTime >= c.startTime && newTime < c.endTime
                );
                if (chap && isPlaying && !isMuted) {
                  speakCurrentChapter(chap);
                }
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
            />
            {/* Chapter Break Markers */}
            <div className="absolute top-0 left-0 right-0 h-1.5 pointer-events-none flex justify-between">
              {DEMO_CHAPTERS.map((c) => (
                <div
                  key={c.id}
                  style={{ left: `${(c.startTime / TOTAL_DURATION) * 100}%` }}
                  className="absolute w-0.5 h-1.5 bg-slate-600"
                />
              ))}
            </div>
          </div>

          {/* Bottom Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              
              {/* Play / Pause */}
              <button
                onClick={handleTogglePlay}
                className="h-9 w-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-md transition-all cursor-pointer"
                title={isPlaying ? 'Pause Demo' : 'Play 5-Minute Demo'}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </button>

              {/* Reset to Beginning */}
              <button
                onClick={() => {
                  setCurrentTime(0);
                  if (isPlaying && !isMuted) {
                    speakCurrentChapter(DEMO_CHAPTERS[0]);
                  }
                }}
                className="h-8 w-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800 transition-colors cursor-pointer"
                title="Restart Presentation"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              {/* Mute Toggle */}
              <button
                onClick={handleToggleMute}
                className={`h-8 w-8 rounded-lg flex items-center justify-center border transition-colors cursor-pointer ${
                  isMuted 
                    ? 'bg-rose-950/60 border-rose-800 text-rose-400' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title={isMuted ? 'Unmute Spoken Voiceover' : 'Mute Voiceover'}
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>

              {/* Speed Toggle */}
              <button
                onClick={() => {
                  const speeds = [1.0, 1.25, 1.5];
                  const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                  setPlaybackSpeed(speeds[nextIdx]);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono font-bold text-slate-300 transition-colors cursor-pointer"
                title="Change Playback Speed"
              >
                {playbackSpeed}x Speed
              </button>

              {/* Subtitles Toggle */}
              <button
                onClick={() => setShowSubtitles(!showSubtitles)}
                className={`h-8 w-8 rounded-lg flex items-center justify-center border transition-colors cursor-pointer ${
                  showSubtitles 
                    ? 'bg-indigo-950/60 border-indigo-700 text-indigo-300' 
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
                title="Toggle Subtitles (CC)"
              >
                <Subtitles className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Current Chapter Label */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="text-slate-500">Chapter:</span>
              <span className="text-white font-semibold truncate max-w-xs">{activeChapter.title}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Chapter Selection Pills Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {DEMO_CHAPTERS.map((chapter) => {
          const isCurrent = activeChapter.id === chapter.id;
          return (
            <button
              key={chapter.id}
              onClick={() => handleJumpToChapter(chapter)}
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                isCurrent
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
              }`}
            >
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-75">
                Ch. {chapter.id} ({Math.floor(chapter.startTime / 60)}:{chapter.startTime % 60 === 0 ? '00' : chapter.startTime % 60})
              </div>
              <div className="text-xs font-bold leading-tight mt-1 line-clamp-2">
                {chapter.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Chapter In-Depth Breakdown Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider font-mono">
              Active Chapter Telemetry • {activeChapter.tag}
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              {activeChapter.title}
            </h2>
          </div>
          <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-lg border border-slate-200">
            Duration: {activeChapter.durationSeconds} seconds
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Spoken Narration Script */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Mic className="h-3.5 w-3.5 text-indigo-600" />
              Spoken Narration Transcript
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 italic">
              "{activeChapter.voiceoverText}"
            </p>
          </div>

          {/* Key Visual Assertions */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Engineering Assertions & Key Artifacts
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              {activeChapter.bulletPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0"></span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Voiceover Script & Teleprompter Modal/Drawer */}
      {showScriptDrawer && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                Complete 5-Minute Master Voiceover Script & Teleprompter
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Exact word-for-word transcript with timestamps, perfect for judges, team presentations, or video recording.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyScript}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedScript ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedScript ? 'Copied' : 'Copy Script'}</span>
              </button>

              <button
                onClick={handleDownloadScript}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download .md</span>
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 divide-y divide-slate-100 font-sans text-xs">
            {DEMO_CHAPTERS.map((ch) => (
              <div key={ch.id} className="pt-3 first:pt-0 space-y-1.5">
                <div className="flex items-center justify-between text-indigo-700 font-bold font-mono">
                  <span>Chapter {ch.id}: {ch.title}</span>
                  <span className="text-slate-400">{ch.tag}</span>
                </div>
                <p className="text-slate-700 leading-relaxed pl-2 border-l-2 border-indigo-200">
                  {ch.voiceoverText}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
export default DemoVideoStudio;

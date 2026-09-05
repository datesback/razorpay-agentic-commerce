import React from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck, 
  Terminal, 
  Zap, 
  TrendingUp, 
  Workflow,
  Copy,
  Check
} from 'lucide-react';

export const DocumentationView: React.FC = () => {
  const [copiedCmd, setCopiedCmd] = React.useState(false);

  const copyDockerCommand = () => {
    navigator.clipboard.writeText('cd rac-engine && docker-compose up --build');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      
      {/* Title */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
          <BookOpen className="h-4 w-4" />
          Internship Project Dossier
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Razorpay In-Chat Agentic Commerce Engine (RAC Engine)
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Submission for Razorpay AI Internship • Track: AI Growth & Agentic Commerce
        </p>
      </div>

      {/* Quick Launch Callout */}
      <div className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Terminal className="h-4 w-4 text-indigo-600" />
            1-Line Docker Container Execution
          </div>
          <button
            onClick={copyDockerCommand}
            className="text-xs text-indigo-700 hover:text-indigo-900 flex items-center gap-1 font-mono bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 cursor-pointer font-medium"
          >
            {copiedCmd ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
            <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400">
          cd rac-engine && docker-compose up --build
        </div>
        <p className="text-xs text-slate-500">
          Automatically provisions Redis (port 6379), FastAPI backend (port 8000), and Streamlit chat interface (port 8501).
        </p>
      </div>

      {/* Executive Summary */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">1. Executive Summary & Problem Statement</h2>
        <div className="text-sm text-slate-600 leading-relaxed space-y-3">
          <p>
            Traditional e-commerce discovery journeys suffer from severe drop-offs at the transition between social/conversational channels and external payment gateways. Customers searching for specific products inside messaging interfaces typically abandon carts when redirected to heavy web storefronts with multi-step credential forms.
          </p>
          <p>
            The <strong>Razorpay In-Chat Agentic Commerce Engine (RAC Engine)</strong> closes this loop. By pairing a deterministic <strong>LangGraph State Machine</strong> with <strong>Razorpay Smart Payment Links</strong>, customers seamlessly discover verified catalog items, review inventory in real time, apply promotional coupons, and complete checkout within the chat session.
          </p>
        </div>
      </section>

      {/* Architecture & Flow */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">2. LangGraph State Machine Architecture</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 shadow-sm">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Workflow className="h-4 w-4 text-indigo-600" />
              State Machine Transitions
            </h3>
            <p className="text-slate-600 leading-relaxed">
              State moves through <code className="text-indigo-600 font-mono bg-indigo-50 px-1 py-0.5 rounded border border-indigo-100">IDLE</code> → <code className="text-indigo-600 font-mono bg-indigo-50 px-1 py-0.5 rounded border border-indigo-100">CART_REVIEW</code> → <code className="text-indigo-600 font-mono bg-indigo-50 px-1 py-0.5 rounded border border-indigo-100">PAYMENT_PENDING</code> → <code className="text-emerald-700 font-bold bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">CAPTURED</code> (or <code className="text-rose-700 font-mono bg-rose-50 px-1 py-0.5 rounded border border-rose-200">FAILED</code>).
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 shadow-sm">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              PCI-DSS SAQ-A Compliance
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Strict regex scanning intercepts card numbers, CVVs, and MPINs before LLM execution, preventing chat storage of sensitive payment instruments.
            </p>
          </div>
        </div>
      </section>

      {/* Coupons & Rules */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">3. Deterministic Coupon & Stock Logic</h2>
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-xs space-y-3 text-slate-700 shadow-sm">
          <div className="flex justify-between border-b border-slate-200 pb-2 font-bold text-slate-900">
            <span>Coupon Code</span>
            <span>Discount Calculation Rule</span>
          </div>
          <div className="flex justify-between items-center">
            <code className="text-indigo-700 font-bold bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">RAZORPAY10</code>
            <span>10% deduction on cart subtotal, capped at ₹500.00 max</span>
          </div>
          <div className="flex justify-between items-center">
            <code className="text-indigo-700 font-bold bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">WELCOME50</code>
            <span>Flat ₹50.00 deduction, requires minimum cart subtotal of ₹499.00</span>
          </div>
        </div>
      </section>

      {/* Verification & Tests */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">4. Verification & Testing Standards</h2>
        <p className="text-sm text-slate-600">
          The submission includes 17 test cases spanning catalog lookups, stock depletion guardrails, discount caps, Razorpay order mocks, and cryptographic HMAC-SHA256 signature verification. Run locally with:
        </p>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400">
          pytest tests/ -v
        </div>
      </section>

    </div>
  );
};

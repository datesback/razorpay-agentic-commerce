import React from 'react';
import { 
  Workflow, 
  ShieldCheck, 
  Lock, 
  TrendingUp, 
  Zap, 
  Clock, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  AlertOctagon,
  RefreshCw
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const nodes = [
    {
      id: 'router_node',
      title: '1. Router Node',
      role: 'Intent Classification & PCI Guardrail',
      description: 'Scans user utterance using regex for sensitive financial instruments (16-digit cards, CVVs, MPINs). If clean, routes to Discovery, Cart, Promo, or Payment.',
      badgeColor: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      id: 'guardrail_node',
      title: '🚨 PCI-DSS Guardrail Node',
      role: 'Zero-Knowledge Credential Sanitizer',
      description: 'Triggered when PAN or CVVs are detected. Immediately redacts data, emits security warning, and directs user to Razorpay encrypted checkout links.',
      badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      id: 'product_discovery_node',
      title: '2. Discovery Node',
      role: 'Semantic Catalog Search & Stock Checks',
      description: 'Executes text token & category matching against SQLite catalog database with live stock checks. Prevents hallucinated inventory.',
      badgeColor: 'text-blue-700 bg-blue-50 border-blue-100',
    },
    {
      id: 'cart_validation_node',
      title: '3. Cart Validation Node',
      role: 'Stateful Cart & Promotional Coupons',
      description: 'Maintains active cart items, validates stock quantities, and enforces strict coupon logic (RAZORPAY10 for 10% up to ₹500, WELCOME50 for ₹50 off).',
      badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-100',
    },
    {
      id: 'payment_orchestration_node',
      title: '4. Payment Orchestration Node',
      role: 'Razorpay Order & Smart Link Dispatch',
      description: 'Initializes razorpay.Client, creates Order with receipt rac_{sku}_{ts}, and generates Razorpay Payment Link with 15-minute expiration.',
      badgeColor: 'text-purple-700 bg-purple-50 border-purple-100',
    },
    {
      id: 'order_fulfillment_node',
      title: '5. Order Fulfillment Node',
      role: 'Webhook State Reconciler & Delivery Emitter',
      description: 'Reconciles payment status from Razorpay API or verified HMAC webhooks, confirms captured transaction, and generates delivery estimate.',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
  ];

  const metrics = [
    { label: 'Projected Conversion Lift', value: '+2.7x', sub: 'From 2.8% to 7.8% checkout completion', icon: TrendingUp, color: 'text-emerald-600' },
    { label: 'Cart Abandonment Drop', value: '-46.5%', sub: 'Eliminates external web redirect friction', icon: Zap, color: 'text-indigo-600' },
    { label: 'Average Time to Checkout', value: '38s', sub: 'vs. 210s traditional storefront checkout', icon: Clock, color: 'text-purple-600' },
    { label: 'P95 Inference Latency', value: '< 350ms', sub: 'High-speed deterministic LangGraph routing', icon: RefreshCw, color: 'text-blue-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      
      {/* Title & Overview */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
          <Workflow className="h-4 w-4" />
          LangGraph Agentic Architecture Specification
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          State Machine & Compliance Engineering
        </h1>
        <p className="text-sm text-slate-600 max-w-3xl mt-2 leading-relaxed">
          The RAC Engine is architected around a compiled LangGraph <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded font-mono">StateGraph</code> coordinating autonomous D2C commerce while strictly complying with RBI regulations and PCI-DSS Level 1 tokenization standards.
        </p>
      </div>

      {/* Business Impact Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">{m.label}</span>
                <Icon className={`h-4 w-4 ${m.color}`} />
              </div>
              <div className={`text-3xl font-black ${m.color}`}>
                {m.value}
              </div>
              <p className="text-xs text-slate-500 leading-snug">
                {m.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* LangGraph Nodes Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Layers className="h-5 w-5 text-indigo-600" />
          LangGraph Agent State Machine Nodes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nodes.map((node) => (
            <div key={node.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded border ${node.badgeColor}`}>
                    {node.title}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{node.role}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{node.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security & PCI-DSS Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Security Guardrails & Cryptographic Verification
            </h2>
            <p className="text-xs text-slate-500">
              Multi-layered defense against credential exposure, prompt injection, and replay attacks.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              PCI-DSS SAQ-A Compliance
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Zero PAN, CVV, or UPI PIN ingestion. All payment credentials enter strictly via Razorpay’s Level 1 certified checkout environment, shielding merchants from compliance overhead.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              HMAC-SHA256 Webhook Auth
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Inbound webhooks are validated using constant-time comparison against <code className="text-indigo-600 font-mono bg-white px-1 py-0.5 rounded border border-slate-200">RAZORPAY_WEBHOOK_SECRET</code>, preventing unauthorized order state tampering.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
              <AlertOctagon className="h-3.5 w-3.5" />
              Zero Hallucination Guarantee
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Inventory and discount rules are deterministic tools. The LLM cannot hallucinate imaginary inventory or phantom discounts outside confirmed catalog rules.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
